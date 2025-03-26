import { InternshipJob, AdHocJob } from '../models/job.model.js';

// Create Internship Job
export const createInternshipJob = async (req, res) => {
  try {
    const job = await InternshipJob.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Create Ad Hoc Job
export const createAdHocJob = async (req, res) => {
  try {
    const job = await AdHocJob.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get All Internship Jobs
export const getAllInternshipJobs = async (req, res) => {
  try {
    const jobs = await InternshipJob.find();
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get All Ad Hoc Jobs
export const getAllAdHocJobs = async (req, res) => {
  try {
    const jobs = await AdHocJob.find();
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get Single Internship Job
export const getInternshipJobById = async (req, res) => {
  try {
    const job = await InternshipJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get Single Ad Hoc Job
export const getAdHocJobById = async (req, res) => {
  try {
    const job = await AdHocJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update Internship Job
export const updateInternshipJob = async (req, res) => {
  try {
    const job = await InternshipJob.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update Ad Hoc Job
export const updateAdHocJob = async (req, res) => {
  try {
    const job = await AdHocJob.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Internship Job
export const deleteInternshipJob = async (req, res) => {
  try {
    const job = await InternshipJob.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Ad Hoc Job
export const deleteAdHocJob = async (req, res) => {
  try {
    const job = await AdHocJob.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
