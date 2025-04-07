import express from 'express';
import { 
    register, 
    login, 
    updateUser, 
    updateSensitiveInfo, 
    deleteUserById, 
    deleteUserByEmail,
    getProfile,
    uploadProfilePhoto
} from '../controllers/authUser.controller.js';
import authenticateUser from '../middleware/authentication.js';
import { uploadProfileImage, handleUploadError } from '../middleware/fileUpload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateUser, getProfile);
router.patch('/update', authenticateUser, updateUser);
router.patch('/update-sensitive', authenticateUser, updateSensitiveInfo);
router.post(
    '/upload-photo', 
    authenticateUser, 
    uploadProfileImage.single('profileImage'),
    handleUploadError,
    uploadProfilePhoto
);

// Delete user routes
router.delete('/deleteUser/:id', authenticateUser, deleteUserById);
router.delete('/deleteUser', authenticateUser, deleteUserByEmail);

export default router;
