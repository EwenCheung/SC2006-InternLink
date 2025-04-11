import express from 'express';
import {
  createDraftJob,
  getEmployerDrafts,
  convertDraftToPost,
  deleteDraftJob,
  updateDraftJob,
  createInternshipJob,
  getAllInternshipJobs,
  getEmployerInternshipJobs,
  getInternshipJobById,
  updateInternshipJob,
  deleteInternshipJob,
  createAdHocJob,
  getAllAdHocJobs,
  getEmployerAdHocJobs,
  getAdHocJobById,
  updateAdHocJob,
  deleteAdHocJob,
  createDraftAdHoc,
  updateAdHocDraft
  
} from '../controllers/job.controller.js';
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
import authMiddleware from '../middleware/authentication.js';

const router = express.Router();

// Draft routes
router.post('/drafts/adhoc', authMiddleware, createDraftAdHoc);
router.post('/drafts', authMiddleware, createDraftJob);
router.put('/drafts/adhoc/:id', authMiddleware, updateAdHocDraft);
router.put('/drafts/:id', authMiddleware, updateDraftJob);
router.get('/drafts', authMiddleware, getEmployerDrafts);
router.post('/drafts/:draftId/publish', authMiddleware, convertDraftToPost);
router.delete('/drafts/:id', authMiddleware, deleteDraftJob);

// Internship job routes
router.post('/internship', authMiddleware, createInternshipJob);
router.get('/internship', getAllInternshipJobs);
router.get('/internship/my-posts', authMiddleware, getEmployerInternshipJobs);
router.get('/internship/:id', getInternshipJobById);
router.put('/internship/:id', authMiddleware, updateInternshipJob);
router.delete('/internship/:id', authMiddleware, deleteInternshipJob);

// Ad hoc job routes
router.post('/adhoc', authMiddleware, createAdHocJob);
router.get('/adhoc', getAllAdHocJobs);
router.get('/adhoc/my-posts', authMiddleware, getEmployerAdHocJobs);
router.get('/adhoc/:id', getAdHocJobById);
router.put('/adhoc/:id', authMiddleware, updateAdHocJob);
router.delete('/adhoc/:id', authMiddleware, deleteAdHocJob);

// Application routes
router.use(authenticateUser);

// GET applications by job ID - fix route path by adding leading slash
router.get('/:id/applications', getApplicationsByJobId);

// GET all applications
router.get('/get-all-application/:id', getApplications);

// GET single application
router.get('/:id', getOneApplication);

// POST new application
router.post('/create-application/:id', authMiddleware,createApplication);

// PUT update application
router.put('/update-application/:id', updateApplication);

// DELETE application
router.delete('/delete-application/:id', deleteApplication);

// Application status update route
router.patch('/application/update-status', authMiddleware, updateApplicationStatus);

export default router;
