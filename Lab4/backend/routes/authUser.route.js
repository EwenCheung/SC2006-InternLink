import express from 'express';
import { register, login, updateUser, resetPassword, deleteUserById, deleteUserByEmail } from '../controllers/authUser.controller.js';
import authenticateUser from '../middleware/authentication.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/update', authenticateUser, updateUser);
router.post('/resetPassword/:id', resetPassword);


// Delete user routes
router.delete('/deleteUser/:id', authenticateUser, deleteUserById);
router.delete('/deleteUser', authenticateUser, deleteUserByEmail);

export default router;
