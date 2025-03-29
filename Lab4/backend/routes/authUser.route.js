import express from 'express';
import { register, login, updateUser, updateSensitiveInfo, deleteUserById, deleteUserByEmail } from '../controllers/authUser.controller.js';
import authenticateUser from '../middleware/authentication.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/update', authenticateUser, updateUser);
router.patch('/update-sensitive', authenticateUser, updateSensitiveInfo);

// Delete user routes
router.delete('/deleteUser/:id', authenticateUser, deleteUserById);
router.delete('/deleteUser', authenticateUser, deleteUserByEmail);

export default router;
