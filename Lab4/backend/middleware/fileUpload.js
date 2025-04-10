import multer from 'multer';
import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';

dotenv.config();

// Ensure database connection is ready
const waitForConnection = () => {
    return new Promise((resolve, reject) => {
        // If mongoose is already connected, resolve immediately
        if (mongoose.connection.readyState === 1) {
            return resolve(mongoose.connection.useDb('Files', { useCache: true }));
        }

        // Otherwise wait for connection
        mongoose.connection.once('connected', () => {
            console.log('MongoDB connected, initializing GridFS storage');
            resolve(mongoose.connection.useDb('Files', { useCache: true }));
        });

        mongoose.connection.once('error', (err) => {
            console.error('MongoDB connection error:', err);
            reject(err);
        });
    });
};

// Create a function to get storage instance with connection handling
const getStorage = async () => {
    const db = await waitForConnection();
    const storage = new GridFsStorage({
        db,
        file: (req, file) => {
            return new Promise((resolve, reject) => {
                if (!req.user?.userId) {
                    return reject(new Error('User not authenticated'));
                }

                const metadata = {
                    userId: req.user.userId,
                    uploadedAt: new Date(),
                    contentType: file.mimetype,
                    originalName: file.originalname
                };

                const bucketName = file.fieldname === 'profileImage' ? 'profileImages' : 'resumes';
                const filename = `${Date.now()}-${file.originalname}`;

                resolve({
                    bucketName,
                    metadata,
                    filename
                });
            });
        }
    });

    storage.on('connection', (db) => {
        console.log('GridFS storage connected successfully');
    });

    storage.on('connectionFailed', (err) => {
        console.error('GridFS storage connection failed:', err);
        throw err; // Propagate the error
    });

    return storage;
};

let storageInstance = null;

// Initialize storage instance
const initStorage = async () => {
    if (!storageInstance) {
        storageInstance = await getStorage();
    }
    return storageInstance;
};

// Create multer instance with delayed storage initialization
const createMulterInstance = (config) => {
    let _multer = null;
    
    const getMulter = async () => {
        if (!_multer) {
            const storage = await initStorage();
            _multer = multer({ storage, ...config });
        }
        return _multer;
    };

    // Return an object that mimics multer's interface
    return {
        single: (fieldName) => {
            return async (req, res, next) => {
                try {
                    const upload = await getMulter();
                    upload.single(fieldName)(req, res, (err) => {
                        if (err) {
                            handleUploadError(err, req, res, next);
                        } else {
                            next();
                        }
                    });
                } catch (error) {
                    handleUploadError(error, req, res, next);
                }
            };
        }
    };
};

// Configure uploaders
export const uploadProfileImage = createMulterInstance({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Please upload a JPG or PNG image'), false);
        }
        cb(null, true);
    }
});

export const uploadResume = createMulterInstance({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for resumes
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Please upload a PDF document'), false);
        }
        cb(null, true);
    }
});

// Error handler for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File size is too large. Maximum size is ${
                    err.field === 'resume' ? '10MB' : '5MB'
                }`,
                error: 'FILE_SIZE_LIMIT_EXCEEDED'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
            error: err.code
        });
    }

    if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'An error occurred while uploading the file',
            error: 'UPLOAD_FAILED'
        });
    }
    next();
};
