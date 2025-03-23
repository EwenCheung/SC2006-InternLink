import express from 'express';
import { createJob, deleteJob, getJobs, getOneJob, updateJob } from '../controllers/job.controller.js';

const router = express.Router();

router.get("/", getJobs);
router.get("/",getOneJob);
router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;

