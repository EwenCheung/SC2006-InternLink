import InternshipJob from '../models/internshipJob.model.js';
import Employer from '../models/Employer.model.js';

const buildFilterQuery = (filters) => {
  const query = { status: 'posted' };
  
  if (filters.employerId) {
    delete query.status;
    query.employerID = filters.employerId;
  }
  
  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }
  
  if (filters.course) {
    query.courseStudy = { $regex: filters.course, $options: 'i' };
  }
  
  if (filters.year) {
    query.yearOfStudy = { $regex: filters.year, $options: 'i' };
  }
  
  if (filters.minStipend || filters.maxStipend) {
    query.stipend = {};
    if (filters.minStipend) {
      query.stipend.$gte = Number(filters.minStipend);
    }
    if (filters.maxStipend) {
      query.stipend.$lte = Number(filters.maxStipend);
    }
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { company: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  return query;
};

export const createInternshipJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employerID: req.user.userId,
      type: 'internship_job',
      jobType: 'internship',
      status: 'posted'
    };

    console.log('Creating internship job with data:', jobData);
    const job = await InternshipJob.create(jobData);
    console.log('Created job:', job);

    await Employer.findByIdAndUpdate(req.user.userId, { $push: { jobPosts: job._id } });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllInternshipJobs = async (req, res) => {
  try {
    console.log('Getting all internship jobs...');
    const { search, ...filters } = req.query;
    const query = buildFilterQuery({ ...filters, search });
    console.log('Query:', query);
    const jobs = await InternshipJob.find(query);
    console.log('Found jobs:', jobs);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error getting all internships:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEmployerInternshipJobs = async (req, res) => {
  try {
    const jobs = await InternshipJob.find({ employerID: req.user.userId });
    res.status(200).json({ success: true, data: { jobs } });
  } catch (error) {
    console.error('Error getting employer internships:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getInternshipJobById = async (req, res) => {
  try {
    const job = await InternshipJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error('Error getting internship by ID:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateInternshipJob = async (req, res) => {
  try {
    const job = await InternshipJob.findOneAndUpdate(
      { _id: req.params.id, employerID: req.user.userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission to update it'
      });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteInternshipJob = async (req, res) => {
  try {
    const job = await InternshipJob.findOneAndDelete({
      _id: req.params.id,
      employerID: req.user.userId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission to delete it'
      });
    }

    await Employer.findByIdAndUpdate(req.user.userId, { $pull: { jobPosts: req.params.id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting internship:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};
