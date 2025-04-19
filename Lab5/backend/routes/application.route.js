import express from 'express';
import { 
    getApplications, 
    getOneApplication, 
    createApplication, 
    updateApplication, 
    deleteApplication, 
    getApplicationsByJobId,
    updateApplicationStatus,
    getApplicationResume
} from '../controllers/application.controller.js';
import authenticateUser from '../middleware/authentication.js';

const router = express.Router();

// Get all applications for current user - requires authentication
router.get('/', authenticateUser, getApplications);

// Get all applications for a specific job
router.get('/job/:id', authenticateUser, getApplicationsByJobId);

// Get a specific application by ID
router.get('/:id', authenticateUser, getOneApplication);

// Get resume for an application
router.get('/:id/resume', authenticateUser, getApplicationResume);

// Create a new application - requires authentication
router.post('/', authenticateUser, createApplication);

// Update application status
router.patch('/status', authenticateUser, updateApplicationStatus);

// Update an existing application
router.patch('/:id', authenticateUser, updateApplication);

// Delete an application
router.delete('/:id', authenticateUser, deleteApplication);

// Add route to get applications by user ID - use the controller not direct model access
router.get('/user/:userId', authenticateUser, async (req, res) => {
  try {
    // Use the existing controller function but with userId from params
    req.user = { userId: req.params.userId };
    return await getApplications(req, res);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

export default router;