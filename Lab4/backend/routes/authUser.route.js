import express from 'express';
import { register, login, updateUser, updateSensitiveInfo } from '../controllers/authUser.controller.js';
import authenticateUser from '../middleware/authentication.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/update', authenticateUser, updateUser);
router.patch('/update-sensitive', authenticateUser, updateSensitiveInfo);

export default router;
