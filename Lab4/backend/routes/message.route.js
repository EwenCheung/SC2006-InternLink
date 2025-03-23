import express from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  deleteMessage 
} from '../controllers/message.controller.js';
import authenticateUser from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get messages between current user and another user
router.get('/:otherUserId', getMessages);

// Send a message
router.post('/', sendMessage);

// Delete a message
router.delete('/:messageId', deleteMessage);

export default router;