import express from 'express';
import { 
    getApplications, 
    getOneApplication, 
    createApplication, 
    updateApplication, 
    deleteApplication 
} from '../controllers/application.controller.js';
import authenticateUser from '../middleware/authentication.js';

const router = express.Router();

// Protect all routes
router.use(authenticateUser);

// GET all applications
router.get('/application', getApplications);

// GET single application
router.get('/application/:id', getOneApplication);

// POST new application
router.post('/application', createApplication);

// PUT update application
router.put('/application/:id', updateApplication);

// DELETE application
router.delete('/application/:id', deleteApplication);

export default router;
