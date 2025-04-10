import mongoose from 'mongoose';

// Define schemas for GridFS collections
const filesSchema = new mongoose.Schema({}, { strict: false });
const chunksSchema = new mongoose.Schema({}, { strict: false });

// Get Files database connection for GridFS storage
const filesDb = mongoose.connection.useDb('Files', { useCache: true });

// Register models for both resumes and profile images on Files database
const getOrCreateModel = (modelName, schema) => {
    try {
        return filesDb.model(modelName);
    } catch (e) {
        if (e.name === 'MissingSchemaError') {
            return filesDb.model(modelName, schema);
        }
        throw e;
    }
};

export const ResumesFiles = getOrCreateModel('resumes.files', filesSchema);
export const ResumesChunks = getOrCreateModel('resumes.chunks', chunksSchema);
export const ProfileImagesFiles = getOrCreateModel('profileImages.files', filesSchema);
export const ProfileImagesChunks = getOrCreateModel('profileImages.chunks', chunksSchema);

// Ensure models are registered
const models = {
    ResumesFiles,
    ResumesChunks,
    ProfileImagesFiles,
    ProfileImagesChunks
};

// Export a function to check if models are registered
export const ensureModelsExist = () => {
    return Object.values(models).every(model => model.db.models[model.modelName]);
};

export default models;
