import { InternshipJob, AdHocJob } from '../models/job.model.js';

const buildFilterQuery = (filters, jobType) => {
  const query = {
    // Only show posted jobs by default (for job seekers)
    status: 'posted'
  };

  // If employer ID is provided, show all posts (draft and posted) for that employer
  if (filters.employerId) {
    delete query.status;
    query.employerID = filters.employerId;
  }

  if (filters.location) {
    query.location = { $regex: `^${filters.location}$`, $options: 'i' };
  }

  if (jobType === 'internship') {
    if (filters.course) {
      query.courseStudy = { $regex: `^${filters.course}$`, $options: 'i' };
    }

    if (filters.year) {
      query.yearOfStudy = { $regex: `^${filters.year}$`, $options: 'i' };
    }

    if (filters.stipend) {
      switch (filters.stipend) {
        case 'low':
          query.stipend = { $regex: '^(?:\\$)?(?:(?:[0-4]?\\d{2})|(?:[0-4]\\d{2}))(?:\\.\\d{2})?$', $options: 'i' };
          break;
        case 'medium':
          query.stipend = { $regex: '^(?:\\$)?(?:[5-9]\\d{2}|1000)(?:\\.\\d{2})?$', $options: 'i' };
          break;
        case 'high':
          query.stipend = { $regex: '^(?:\\$)?(?:1[0-9]\\d{2}|[2-9]\\d{3,})(?:\\.\\d{2})?$', $options: 'i' };
          break;
      }
    }

    if (filters.duration) {
      switch (filters.duration) {
        case 'short':
          query.duration = { $regex: '^[1-2]\\s*months?$|^less than 3\\s*months?$', $options: 'i' };
          break;
        case 'medium':
          query.duration = { $regex: '^[3-6]\\s*months?$', $options: 'i' };
          break;
        case 'long':
          query.duration = { $regex: '^([7-9]|1[0-2])\\s*months?$|^more than 6\\s*months?$', $options: 'i' };
          break;
      }
    }
  } else {
    if (filters.stipend) {
      const payRanges = {
        'low': { $lt: 15 },
        'medium': { $gte: 15, $lte: 25 },
        'high': { $gt: 25 }
      };
      query.payPerHour = payRanges[filters.stipend];
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

// Validate post data based on whether it's a draft
const validatePostData = (data, isDraft) => {
  if (isDraft) {
    // For drafts, only validate fields that are present
    const errors = [];
    Object.entries(data).forEach(([key, value]) => {
      if (value && typeof value === 'string' && !value.trim()) {
        errors.push(`${key} cannot be empty if provided`);
      }
    });
    return errors;
  } else {
    // For published posts, validate all required fields
    const requiredFields = [
      'title',
      'company',
      'location',
      'description',
      'stipend',
      'duration',
      'courseStudy',
      'yearOfStudy'
    ];
    
    const errors = [];
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`${field} is required`);
      }
    });
    return errors;
  }
};

// Create Internship Job
export const createInternshipJob = async (req, res) => {
  try {
    const isDraft = req.body.status === 'draft';
    const validationErrors = validatePostData(req.body, isDraft);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors
      });
    }

    const job = await InternshipJob.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllInternshipJobs = async (req, res) => {
  try {
    const { search, ...filters } = req.query;
    const query = buildFilterQuery({ ...filters, search }, 'internship');
    const jobs = await InternshipJob.find(query);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEmployerInternshipJobs = async (req, res) => {
  try {
    const { search, ...filters } = req.query;
    const query = buildFilterQuery({ 
      ...filters, 
      search, 
      employerId: req.params.employerId 
    }, 'internship');
    
    const jobs = await InternshipJob.find(query);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
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
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateInternshipJob = async (req, res) => {
  try {
    const isDraft = req.body.status === 'draft';
    const validationErrors = validatePostData(req.body, isDraft);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors
      });
    }

    const job = await InternshipJob.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: !isDraft, // Only run validators for non-draft posts
    });
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

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

// Ad Hoc Job Controllers
export const createAdHocJob = async (req, res) => {
  try {
    const job = await AdHocJob.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllAdHocJobs = async (req, res) => {
  try {
    const { search, ...filters } = req.query;
    const query = buildFilterQuery({ ...filters, search }, 'adhoc');
    const jobs = await AdHocJob.find(query);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

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

// Change Job Status
export const changeJobStatus = async (req, res) => {
  try {
    const { id, status } = req.params;
    const JobModel = req.query.type === 'adhoc' ? AdHocJob : InternshipJob;
    
    const job = await JobModel.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // If changing from draft to posted, validate all required fields
    if (status === 'posted') {
      const validationErrors = validatePostData(job, false);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          validationErrors
        });
      }
    }

    job.status = status;
    await job.save({ validateBeforeSave: status === 'posted' });
    
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
