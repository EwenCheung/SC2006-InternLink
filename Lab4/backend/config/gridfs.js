import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { ensureModelsExist } from '../models/GridFSModel.js';

// Configuration with defaults
const config = {
    retentionPeriod: 30, // Days to keep soft-deleted files
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    cleanupWindow: {
        startHour: 0,
        endHour: 1
    },
    buckets: {
        profileImages: {
            allowedTypes: ['image/jpeg', 'image/png'],
            maxSize: 5 * 1024 * 1024  // 5MB
        },
        resumes: {
            allowedTypes: ['application/pdf'],
            maxSize: 10 * 1024 * 1024  // 10MB
        }
    }
};

let filesDb;
let isInitialized = false;

// Allow runtime configuration updates
export const updateConfig = (updates) => {
    Object.assign(config, updates);
    return { ...config }; // Return copy of current config
};

// Get current configuration
export const getConfig = () => ({ ...config });

// Cache for file models to prevent duplicate model registration
const fileModelCache = new Map();

// Get or create file model for a bucket
const getFileModel = (bucketName) => {
    try {
        if (fileModelCache.has(bucketName)) {
            return fileModelCache.get(bucketName);
        }

        const modelName = `${bucketName}.files`;
        let model;
        try {
            model = filesDb.model(modelName);
        } catch (e) {
            if (e.name === 'MissingSchemaError') {
                const schema = new mongoose.Schema({}, { strict: false });
                model = filesDb.model(modelName, schema);
            } else {
                throw e;
            }
        }

        fileModelCache.set(bucketName, model);
        return model;
    } catch (error) {
        console.error(`Error getting model for bucket ${bucketName}:`, error);
        throw error;
    }
};

// Get bucket statistics
export const getBucketStats = async (bucketName) => {
    try {
        await checkInitialization();
        const bucket = getBucket(bucketName);
        
        const FilesModel = getFileModel(bucketName);
        const [activeFiles, deletedFiles] = await Promise.all([
            FilesModel.find({ 'metadata.deleted': { $ne: true } }).exec(),
            FilesModel.find({ 'metadata.deleted': true }).exec()
        ]);

        const activeSize = activeFiles.reduce((sum, file) => sum + (file.length || 0), 0);
        const deletedSize = deletedFiles.reduce((sum, file) => sum + (file.length || 0), 0);

        return {
            activeFiles: {
                count: activeFiles.length,
                totalSize: activeSize,
                averageSize: activeFiles.length ? Math.round(activeSize / activeFiles.length) : 0
            },
            deletedFiles: {
                count: deletedFiles.length,
                totalSize: deletedSize,
                averageSize: deletedFiles.length ? Math.round(deletedSize / deletedFiles.length) : 0,
                oldestDeletion: deletedFiles.length ? 
                    Math.min(...deletedFiles.map(f => new Date(f.metadata?.deletedAt).getTime())) : null
            },
            bucketConfig: config.buckets[bucketName]
        };
    } catch (error) {
        console.error(`Error getting stats for bucket ${bucketName}:`, error);
        throw error;
    }
};

export const initGridFS = async () => {
    try {
        // Get Files database connection for GridFS storage
        filesDb = mongoose.connection.useDb('Files', { useCache: true });

        // Check if models are already registered
        if (!isInitialized) {
            // Ensure GridFS models are registered
            if (!ensureModelsExist()) {
                throw new Error('GridFS models not properly registered');
            }

            // Initialize only the required buckets
            const bucketNames = Object.keys(config.buckets);
            console.log(`Initializing GridFS buckets: ${bucketNames.join(', ')}`);
        }

        console.log('GridFS initialized successfully');
        isInitialized = true;

        // Handle connection state changes
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected, GridFS unavailable');
            isInitialized = false;
            // Clear model cache on disconnection
            fileModelCache.clear();
        });

        mongoose.connection.on('connected', async () => {
            console.log('MongoDB reconnected, reinitializing GridFS');
            try {
                await initGridFS();
            } catch (error) {
                console.error('GridFS reinitialization failed:', error);
            }
        });
        
        return true;
    } catch (error) {
        console.error('GridFS initialization failed:', error);
        isInitialized = false;
        throw error;
    }
};

// Export initialization status check
export const isGridFSInitialized = () => isInitialized;

// Clean up files that have been soft-deleted for more than the specified days
export const cleanupDeletedFiles = async (bucketName, daysOld = 30) => {
    try {
        await checkInitialization();
        const bucket = getBucket(bucketName);
        
        // Calculate cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        // Find all files marked as deleted before the cutoff date
        const FilesModel = getFileModel(bucketName);
        const deletedFiles = await FilesModel.find({
            'metadata.deleted': true,
            'metadata.deletedAt': { $lt: cutoffDate }
        }).exec();

        // Delete each file
        const results = await Promise.allSettled(
            deletedFiles.map(file => purgeFile(file._id, bucketName))
        );

        const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const failed = results.length - succeeded;

        return {
            totalProcessed: results.length,
            succeeded,
            failed
        };
    } catch (error) {
        console.error(`Error cleaning up deleted files from ${bucketName}:`, error);
        throw error;
    }
};


// Schedule cleanup to run periodically using configuration
if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
        try {
            const now = new Date();
            const { startHour, endHour } = config.cleanupWindow;
            
            // Check if current hour is within cleanup window
            if (now.getHours() >= startHour && now.getHours() < endHour) {
                console.log('Running scheduled file cleanup...');
                const results = await Promise.all(
                    Object.keys(config.buckets).map(bucket =>
                        cleanupDeletedFiles(bucket, config.retentionPeriod)
                    )
                );
                console.log('Cleanup completed:', 
                    Object.keys(config.buckets).reduce((acc, bucket, index) => {
                        acc[bucket] = results[index];
                        return acc;
                    }, {})
                );
            }
        } catch (error) {
            console.error('Scheduled cleanup failed:', error);
        }
    }, config.cleanupInterval);
}

// Validate file against bucket configuration
export const validateFile = (file, bucketName) => {
    const bucketConfig = config.buckets[bucketName];
    if (!bucketConfig) {
        throw new Error(`Unknown bucket: ${bucketName}`);
    }

    // Check file type
    if (!bucketConfig.allowedTypes.includes(file.mimetype)) {
        throw new Error(
            `Invalid file type for ${bucketName}. Allowed types: ${bucketConfig.allowedTypes.join(', ')}`
        );
    }

    // Check file size
    if (file.size > bucketConfig.maxSize) {
        const maxMB = bucketConfig.maxSize / (1024 * 1024);
        throw new Error(
            `File size exceeds limit for ${bucketName}. Maximum size: ${maxMB}MB`
        );
    }

    return true;
};

const getBucket = (bucketName) => {
        if (!isInitialized || !filesDb || !config.buckets[bucketName]) {
        throw new Error('GridFS not initialized');
    }
    return new mongoose.mongo.GridFSBucket(filesDb, {
        bucketName: bucketName
    });
};

// List files that are soft-deleted but still within retention period
export const listDeletedFiles = async (bucketName, daysOld = 30) => {
    try {
        await checkInitialization();
        const bucket = getBucket(bucketName);
        
        // Calculate cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const FilesModel = getFileModel(bucketName);
        const files = await FilesModel
            .find({
                'metadata.deleted': true,
                'metadata.deletedAt': { $gte: cutoffDate }
            })
            .exec();

        return files.map(file => ({
            id: file._id,
            filename: file.filename,
            contentType: file.metadata?.contentType,
            originalName: file.metadata?.originalName,
            size: file.length,
            deletedAt: file.metadata?.deletedAt,
            daysUntilPurge: Math.ceil((new Date(file.metadata.deletedAt).getTime() + daysOld * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))
        }));
    } catch (error) {
        console.error(`Error listing deleted files from ${bucketName}:`, error);
        throw error;
    }
};

const checkInitialization = async () => {
    if (!isInitialized) {
        await initGridFS().catch(error => {
            console.error('Failed to initialize GridFS:', error);
            throw new Error('GridFS initialization failed');
        });
    }
    return true;
};

export const getFileInfo = async (fileId, bucketName) => {
    try {
        await checkInitialization();
        const bucket = getBucket(bucketName);
        const FilesModel = getFileModel(bucketName);
        const fileInfo = await FilesModel
            .findOne({ 
                _id: new mongoose.Types.ObjectId(fileId),
                'metadata.deleted': { $ne: true }  // Exclude deleted files
            })
            .exec();
        if (!fileInfo) {
            return null;
        }
        return fileInfo;
    } catch (error) {
        console.error('Error getting file info:', error);
        throw error;
    }
};

export const getFileStream = async (fileId, bucketName) => {
    try {
        await checkInitialization();
        const bucket = getBucket(bucketName);
        const fileId_obj = new mongoose.Types.ObjectId(fileId);

        // Check if file exists and is not marked as deleted
        const FilesModel = getFileModel(bucketName);
        const file = await FilesModel
            .findOne({ 
                _id: fileId_obj,
                'metadata.deleted': { $ne: true }
            })
            .exec();

        if (!file) {
            throw new Error('File not found or has been deleted');
        }

        return bucket.openDownloadStream(fileId_obj);
    } catch (error) {
        console.error('Error getting file stream:', error);
        throw error;
    }
};

// Permanently remove a soft-deleted file
export const purgeFile = async (fileId, bucketName) => {
    try {
        await checkInitialization();
        const bucket = getBucket(bucketName);
        const fileId_obj = new mongoose.Types.ObjectId(fileId);
        
        // Check if file exists and is marked as deleted
        const FilesModel = getFileModel(bucketName);
        const file = await FilesModel
            .findOne({ 
                _id: fileId_obj,
                'metadata.deleted': true 
            })
            .exec();

        if (!file) {
            console.log(`File ${fileId} not found or not marked for deletion in ${bucketName}`);
            return false;
        }

        // Permanently delete the file
        await bucket.delete(fileId_obj);
        return true;
    } catch (error) {
        console.error(`Error purging file ${fileId} from ${bucketName}:`, error);
        return false;
    }
};

// Mark file as deleted (soft delete)
// Restore a soft-deleted file if within retention period
export const restoreFile = async (fileId, bucketName) => {
    try {
        await checkInitialization();
        const bucket = getBucket(bucketName);
        const fileId_obj = new mongoose.Types.ObjectId(fileId);
        
        // Find the deleted file
        const FilesModel = getFileModel(bucketName);
        const file = await FilesModel
            .findOne({ 
                _id: fileId_obj,
                'metadata.deleted': true 
            })
            .exec();

        if (!file) {
            console.log(`File ${fileId} not found or not marked as deleted in ${bucketName}`);
            return false;
        }

        // Remove deleted flag from metadata
        const metadata = { ...file.metadata };
        delete metadata.deleted;
        delete metadata.deletedAt;
        
        // Update file metadata
        await bucket.rename(fileId_obj, file.filename, { metadata });
        return true;
    } catch (error) {
        console.error(`Error restoring file ${fileId} in ${bucketName}:`, error);
        return false;
    }
};

// Mark file as deleted (soft delete)
export const deleteFile = async (fileId, bucketName) => {
    try {
        await checkInitialization();
        const bucket = getBucket(bucketName);
        const fileId_obj = new mongoose.Types.ObjectId(fileId);
        
        // Find the file and update its metadata to mark as deleted
        const FilesModel = getFileModel(bucketName);
        const file = await FilesModel
            .findOne({ _id: fileId_obj })
            .exec();
        if (!file) {
            console.log(`File ${fileId} not found in ${bucketName}`);
            return true;
        }

        // Mark as deleted in metadata instead of physical deletion
        const metadata = file.metadata || {};
        metadata.deleted = true;
        metadata.deletedAt = new Date();
        
        // Update file metadata
        await bucket.rename(fileId_obj, file.filename, { metadata });
        return true;
    } catch (error) {
        console.error(`Error deleting file ${fileId} from ${bucketName}:`, error);
        return false;
    }
};
