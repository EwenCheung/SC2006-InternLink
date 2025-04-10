import express from 'express';
import { 
    getApplications, 
    getOneApplication, 
    createApplication, 
    updateApplication, 
    deleteApplication 
} from '../controllers/application.controller.js';

const router = express.Router();

// GET all applications
router.get('/', getApplications);

// GET single application
router.get('/:id', getOneApplication);

// POST new application
router.post('/', createApplication);


// PUT update application
router.put('/:id', updateApplication);

// DELETE application
router.delete('/:id', deleteApplication);

export default router;