import express from 'express';
import { 
    getApplications, 
    getOneApplication, 
    createApplication, 
    updateApplication, 
    deleteApplication, 
    getApplicationsByJobId,
    updateApplicationStatus
} from '../controllers/application.controller.js';
import authenticateUser from '../middleware/authentication.js';

const router = express.Router();

// Get all applications for current user - requires authentication
router.get('/', authenticateUser, getApplications);

// Get all applications for a specific job
router.get('/job/:id', authenticateUser, getApplicationsByJobId);

// Get a specific application by ID
router.get('/:id', authenticateUser, getOneApplication);

// Create a new application - requires authentication
router.post('/', authenticateUser, createApplication);

// Update application status
router.patch('/status', authenticateUser, updateApplicationStatus);

// Update an existing application
router.patch('/:id', authenticateUser, updateApplication);

// Delete an application
router.delete('/:id', authenticateUser, deleteApplication);

export default router;