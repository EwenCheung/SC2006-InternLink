import express from 'express';
import { 
    register, 
    login, 
    updateUser,
    updateField, 
    updateSensitiveInfo, 
    deleteUserById, 
    deleteUserByEmail,
    getProfile,
    uploadProfilePhoto,
    handleResumeUpload,
    streamFile,
    updateContactList
} from '../controllers/authUser.controller.js';
import authenticateUser from '../middleware/authentication.js';
import { uploadProfileImage, uploadResume, handleUploadError } from '../middleware/fileUpload.js';

const router = express.Router();

// Register with optional profile image upload
router.route('/register')
    .post(async (req, res, next) => {
        try {
            await uploadProfileImage.single('profileImage')(req, res, async (err) => {
                if (err) {
                    handleUploadError(err, req, res, next);
                } else {
                    await register(req, res, next);
                }
            });
        } catch (error) {
            handleUploadError(error, req, res, next);
        }
    });
router.post('/login', login);
router.get('/profile', authenticateUser, getProfile);
router.patch('/update', authenticateUser, updateUser);
router.patch('/update-field', authenticateUser, updateField);
router.patch('/update-sensitive', authenticateUser, updateSensitiveInfo);
router.patch('/update-contacts', authenticateUser, updateContactList);
// File upload routes
router.route('/upload-photo')
    .post(authenticateUser, async (req, res, next) => {
        console.log('Starting profile photo upload...');
        try {
            await uploadProfileImage.single('profileImage')(req, res, async (err) => {
                if (err) {
                    console.error('Profile photo upload error:', err);
                    handleUploadError(err, req, res, next);
                } else {
                    console.log('File received, processing...');
                    await uploadProfilePhoto(req, res, next);
                }
            });
        } catch (error) {
            console.error('Profile photo upload failed:', error);
            handleUploadError(error, req, res, next);
        }
    });

router.route('/upload-resume')
    .post(authenticateUser, async (req, res, next) => {
        console.log('Starting resume upload...');
        try {
            await uploadResume.single('resume')(req, res, async (err) => {
                if (err) {
                    console.error('Resume upload error:', err);
                    handleUploadError(err, req, res, next);
                } else {
                    console.log('Resume file received, processing...');
                    await handleResumeUpload(req, res, next);
                }
            });
        } catch (error) {
            console.error('Resume upload failed:', error);
            handleUploadError(error, req, res, next);
        }
    });

// File streaming route with authentication
router.get('/files/:type/:fileId', authenticateUser, streamFile);

// Delete user routes
router.delete('/deleteUser/:id', authenticateUser, deleteUserById);
router.delete('/deleteUser', authenticateUser, deleteUserByEmail);

export default router;
