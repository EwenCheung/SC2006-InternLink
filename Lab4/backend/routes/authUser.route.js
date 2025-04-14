import express from 'express';

import {
    register,
    login,
    updateUser,
    getProfile,
    serveFile,
    updateContactList,
    deleteFile,
    updateWorkExperience,
    updateAcademicHistory,
    getJobSeekerProfile,
    resetPassword,
    resetPassword2
} from '../controllers/authUser.controller.js';

import authenticateUser from '../middleware/authentication.js';
import {
    uploadProfileImage,
    uploadMultipleFiles,
    handleUploadError
} from '../middleware/fileUpload.js';

const router = express.Router();

// Helper to wrap callback-style file upload into a Promise
const handleSingleFileUpload = (middleware) => {
    return (req, res) =>
        new Promise((resolve, reject) => {
            middleware(req, res, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
};

// Register with optional profile image upload
router.route('/register')
    .post(async (req, res, next) => {
        try {
            await handleSingleFileUpload(uploadProfileImage)(req, res);
            await register(req, res, next);
        } catch (error) {
            handleUploadError(error, req, res, next);
        }
    });

router.post('/login', login);
router.get('/profile', authenticateUser, getProfile);
router.patch('/update', 
    authenticateUser,
    uploadMultipleFiles,
    updateUser
);
router.get('/jobseeker/:id', getJobSeekerProfile); // New route for jobseeker profiles
router.get('/user/:id', authenticateUser, getProfile); // New route to get profile by ID
// These routes reference functions that don't appear to be defined:
// router.patch('/update-field', authenticateUser, updateField);
// router.patch('/update-sensitive', authenticateUser, updateSensitiveInfo);
router.patch('/update-contacts', authenticateUser, updateContactList);

// Work experience and academic history routes
router.patch('/update-work-experience', authenticateUser, updateWorkExperience);
router.patch('/update-academic-history', authenticateUser, updateAcademicHistory);

// Serve files (profile images and resumes)
router.get('/files/:type/:userId', serveFile);

// Delete files (requires authentication)
router.delete('/files/:type', authenticateUser, deleteFile);
router.post('/jobseeker/reset-password/:id', authenticateUser, resetPassword);
router.post('/employer/reset-password/:id', authenticateUser, resetPassword2);

export default router;
