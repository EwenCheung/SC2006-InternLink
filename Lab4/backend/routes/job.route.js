import express from 'express';
import {
  createInternshipJob,
  createAdHocJob,
  getAllInternshipJobs,
  getAllAdHocJobs,
  getInternshipJobById,
  getAdHocJobById,
  updateInternshipJob,
  updateAdHocJob,
  deleteInternshipJob,
  deleteAdHocJob,
  getEmployerInternshipJobs,
  changeJobStatus,
} from '../controllers/job.controller.js';

const router = express.Router();

// Routes for Internship Jobs
router.post('/internship', createInternshipJob);
router.get('/internship/my-posts', getEmployerInternshipJobs); // Specific route before dynamic route
router.get('/internship', getAllInternshipJobs);
router.get('/internship/:id', getInternshipJobById);
router.put('/internship/:id', updateInternshipJob);
router.patch('/internship/:id/status/:status', changeJobStatus);
router.delete('/internship/:id', deleteInternshipJob);

// Routes for Ad Hoc Jobs
router.post('/adhoc', createAdHocJob);
router.get('/adhoc/my-posts', getEmployerInternshipJobs); // Specific route before dynamic route
router.get('/adhoc', getAllAdHocJobs);
router.get('/adhoc/:id', getAdHocJobById);
router.put('/adhoc/:id', updateAdHocJob);
router.patch('/adhoc/:id/status/:status', changeJobStatus);
router.delete('/adhoc/:id', deleteAdHocJob);

export default router;
