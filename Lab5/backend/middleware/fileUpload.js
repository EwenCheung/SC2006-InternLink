import multer from 'multer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Configure multer for memory storage (files stored in memory as Buffer)
const storage = multer.memoryStorage();

// Create multer instance with file size and type validation
const createFileUploader = (config) => {
  return multer({
    storage: storage,
    limits: config.limits,
    fileFilter: config.fileFilter
  });
};

// Create combined uploader for profile updates
const combinedUploader = createFileUploader({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        return cb(new Error('Only JPG or PNG images are allowed'), false);
      }
      // 5MB limit for profile images
      if (parseInt(req.headers['content-length']) > 5 * 1024 * 1024) {
        return cb(new Error('Profile image file too large (max 5MB)'), false);
      }
    } else if (file.fieldname === 'resume') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF documents are allowed'), false);
      }
      // 10MB limit for resumes
      if (parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
        return cb(new Error('Resume file too large (max 10MB)'), false);
      }
    }
    cb(null, true);
  }
});

// Exported uploaders with validation
export const uploadMultipleFiles = combinedUploader.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);

export const uploadProfileImage = createFileUploader({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG or PNG images are allowed'), false);
    }
    cb(null, true);
  },
}).single('profileImage');

export const uploadResume = createFileUploader({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF documents are allowed'), false);
    }
    cb(null, true);
  },
}).single('resume');

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const limit = err.field === 'resume' ? '10MB' : '5MB';
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Max size: ${limit}`,
        error: 'FILE_SIZE_LIMIT_EXCEEDED',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
      error: err.code,
    });
  }

  if (err) {
    console.error('⚠️ Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Unknown upload error',
      error: 'UPLOAD_FAILED',
    });
  }

  next();
};
