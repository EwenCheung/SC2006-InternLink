import express from 'express';
import {
  createDraftJob,
  getEmployerDrafts,
  convertDraftToPost,
  deleteDraftJob,
  updateDraftJob
} from '../controllers/draftJob.controller.js';

import {
  createInternshipJob,
  getAllInternshipJobs,
  getEmployerInternshipJobs,
  getInternshipJobById,
  updateInternshipJob,
  deleteInternshipJob
} from '../controllers/internshipJob.controller.js';

import {
  createAdHocJob,
  getAllAdHocJobs,
  getEmployerAdHocJobs,
  getAdHocJobById,
  updateAdHocJob,
  deleteAdHocJob
} from '../controllers/adhocJob.controller.js';

import authMiddleware from '../middleware/authentication.js';

const router = express.Router();

// Draft routes
router.route('/drafts')
  .post(authMiddleware, createDraftJob)
  .get(authMiddleware, getEmployerDrafts);

router.route('/drafts/:id')
  .put(authMiddleware, updateDraftJob)
  .delete(authMiddleware, deleteDraftJob);

router.post('/drafts/:draftId/publish', authMiddleware, convertDraftToPost);

// Internship job routes
router.route('/internship')
  .post(authMiddleware, createInternshipJob)
  .get(getAllInternshipJobs);

router.get('/internship/my-posts', authMiddleware, getEmployerInternshipJobs);

router.route('/internship/:id')
  .get(getInternshipJobById)
  .put(authMiddleware, updateInternshipJob)
  .delete(authMiddleware, deleteInternshipJob);

// Ad hoc job routes
router.route('/adhoc')
  .post(authMiddleware, createAdHocJob)
  .get(getAllAdHocJobs);

router.get('/adhoc/my-posts', authMiddleware, getEmployerAdHocJobs);

router.route('/adhoc/:id')
  .get(getAdHocJobById)
  .put(authMiddleware, updateAdHocJob)
  .delete(authMiddleware, deleteAdHocJob);

export default router;
