import multer from 'multer';
import path from 'path';

// Configure storage for profile images
const profileImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/uploads/profileImages');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Configure storage for resumes
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'backend/uploads/resumes');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
};

// File filter for resumes
const resumeFileFilter = (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only .pdf, .doc and .docx format allowed!'));
};

// Multer configuration for profile images
export const uploadProfileImage = multer({
    storage: profileImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFileFilter
});

// Multer configuration for resumes
export const uploadResume = multer({
    storage: resumeStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: resumeFileFilter
});

// Error handler for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File size is too large'
            });
        }
        return res.status(400).json({
            message: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            message: err.message
        });
    }
    next();
};
