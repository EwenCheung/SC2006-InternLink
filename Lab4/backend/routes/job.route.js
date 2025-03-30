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
  deleteAdHocJob
} from '../controllers/job.controller.js';
import authMiddleware from '../middleware/authentication.js';

const router = express.Router();

// Draft routes
router.post('/drafts', authMiddleware, createDraftJob);
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

export default router;
