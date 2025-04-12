import { InternshipJob, AdHocJob } from '../models/job.model.js';
import {DraftJob, AdHocDraft} from '../models/draftJob.model.js';
import Employer from '../models/Employer.model.js';
import Application from '../models/application.model.js';
import { application } from 'express';

const buildFilterQuery = (filters, jobType) => {
  const query = { status: 'posted' };
  
  if (filters.employerId) {
    delete query.status;
    query.employerID = filters.employerId;
  }
  
  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }
  
  if (jobType === 'internship') {
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
  } else if (jobType === 'adhoc') {
    if (filters.minPayPerHour || filters.maxPayPerHour) {
      query.payPerHour = {};
      if (filters.minPayPerHour) {
        query.payPerHour.$gte = Number(filters.minPayPerHour);
      }
      if (filters.maxPayPerHour) {
        query.payPerHour.$lte = Number(filters.maxPayPerHour);
      }
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

export const createDraftJob = async (req, res) => {
  try {
    console.log('Creating draft with body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const draftData = Object.entries(req.body).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'stipend' && value) {
          acc[key] = Number(value);
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    // Ensure area and description fields are properly set
    draftData.area = draftData.area || req.body.area || '';
    draftData.description = draftData.description || req.body.description || '';
    draftData.jobScope = draftData.jobScope || req.body.jobScope || '';    
    draftData.employerID = req.user.userId;
    draftData.jobType = req.body.jobType || 'internship';
    draftData.status = 'draft';
    draftData.lastModified = new Date();
    draftData.applicationDeadline = new Date(req.body.applicationDeadline);
    
    console.log('Setting application deadline in draft to:', draftData.applicationDeadline);
    console.log('Processed draft data:', draftData);
    
    const draft = await DraftJob.create(draftData);
    const responseData = draft.toObject();
    
    if (responseData.applicationDeadline) {
      responseData.applicationDeadline = new Date(responseData.applicationDeadline);
    }
    
    console.log('Created draft:', responseData);
    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error creating draft job:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const createDraftAdHoc = async (req, res) => {
  try {
    console.log('Creating ad hoc draft with body:', req.body);
    console.log('User ID:', req.user.userId);
    
    const draftData = Object.entries(req.body).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'stipend' && value) {
          acc[key] = Number(value);
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    // Ensure area and description fields are properly set
    draftData.area = draftData.area || req.body.area || '';
    draftData.description = draftData.description || req.body.description || '';
    draftData.jobScope = draftData.jobScope || req.body.jobScope || '';    
    draftData.employerID = req.user.userId;
    draftData.type = 'adhoc_job';
    draftData.jobType = 'ad-hoc';
    draftData.status = 'draft';
    draftData.lastModified = new Date();
    
    // Ensure application deadline is set exactly as provided by employer
    if (req.body.applicationDeadline) {
      draftData.applicationDeadline = new Date(req.body.applicationDeadline);
    } else {
      draftData.applicationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    console.log('Setting application deadline in ad hoc draft to:', draftData.applicationDeadline);
    console.log('Processed draft data:', draftData);
    
    const draft = await AdHocDraft.create(draftData);
    const responseData = draft.toObject();
    
    if (responseData.applicationDeadline) {
      responseData.applicationDeadline = new Date(responseData.applicationDeadline);
    }
    
    console.log('Created ad hoc draft:', responseData);
    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error creating draft job:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateDraftJob = async (req, res) => {
  try {
    console.log('Updating draft:', req.params.id);
    console.log('User ID:', req.user.userId);
    console.log('Update data:', req.body);

    // First find the existing draft to get the current applicationDeadline if not provided
    const existingDraft = await DraftJob.findOne({ _id: req.params.id, employerID: req.user.userId });
    if (!existingDraft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or you do not have permission to update it'
      });
    }

    const updateData = {
      ...req.body,
      lastModified: new Date(),
      status: 'draft',
      employerID: req.user.userId
    };

    // Ensure area and description fields are properly set
    updateData.area = updateData.area || req.body.area || '';
    updateData.description = updateData.description || req.body.description || '';
    updateData.jobScope = updateData.jobScope || req.body.jobScope || '';

    // Preserve application deadline - use the one from request, or keep existing one
    if (req.body.applicationDeadline) {
      updateData.applicationDeadline = new Date(req.body.applicationDeadline);
    } else if (existingDraft.applicationDeadline) {
      updateData.applicationDeadline = new Date(existingDraft.applicationDeadline);
    } else {
      updateData.applicationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    console.log('Setting application deadline in update to:', updateData.applicationDeadline);

    if (updateData.stipend) {
      updateData.stipend = Number(updateData.stipend);
    }

    console.log('Final update data:', updateData);

    const updatedDraft = await DraftJob.findOneAndUpdate(
      { _id: req.params.id, employerID: req.user.userId },
      updateData,
      { new: true, runValidators: false }
    );

    if (!updatedDraft) {
      console.log('Draft not found or permission denied');
      return res.status(404).json({
        success: false,
        message: 'Draft not found or you do not have permission to update it'
      });
    }

    const draftData = updatedDraft.toObject();
    if (draftData.applicationDeadline) {
      draftData.applicationDeadline = new Date(draftData.applicationDeadline);
    }

    console.log('Updated draft:', draftData);
    res.status(200).json({ success: true, data: draftData });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAdHocDraft = async (req, res) => {
  try {
    console.log('Updating ad hoc draft:', req.params.id);
    console.log('User ID:', req.user.userId);
    console.log('Update data:', req.body);

    // First find the existing draft to get the current applicationDeadline if not provided
    const existingDraft = await AdHocDraft.findOne({ _id: req.params.id, employerID: req.user.userId });
    if (!existingDraft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or you do not have permission to update it'
      });
    }

    const updateData = {
      ...req.body,
      lastModified: new Date(),
      status: 'draft',
      employerID: req.user.userId
    };

    // Ensure area and description fields are properly set
    updateData.area = updateData.area || req.body.area || '';
    updateData.description = updateData.description || req.body.description || '';
    updateData.jobScope = updateData.jobScope || req.body.jobScope || '';
    
    // Ensure applicationDeadline is properly set and formatted
    console.log('Deadline from request:', req.body.applicationDeadline);
    console.log('Existing deadline:', existingDraft.applicationDeadline);
    
    if (req.body.applicationDeadline) {
      updateData.applicationDeadline = new Date(req.body.applicationDeadline);
    } else if (existingDraft.applicationDeadline) {
      updateData.applicationDeadline = new Date(existingDraft.applicationDeadline);
    } else {
      updateData.applicationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    
    console.log('Setting application deadline in update to:', updateData.applicationDeadline);

    if (updateData.stipend) {
      updateData.stipend = Number(updateData.stipend);
    }

    console.log('Final update data:', updateData);

    const updatedDraft = await AdHocDraft.findOneAndUpdate(
      { _id: req.params.id, employerID: req.user.userId },
      updateData,
      { new: true, runValidators: false }
    );

    if (!updatedDraft) {
      console.log('Draft not found or permission denied');
      return res.status(404).json({
        success: false,
        message: 'Draft not found or you do not have permission to update it'
      });
    }

    const draftData = updatedDraft.toObject();
    if (draftData.applicationDeadline) {
      draftData.applicationDeadline = new Date(draftData.applicationDeadline);
    }

    console.log('Updated ad hoc draft:', draftData);
    res.status(200).json({ success: true, data: draftData });
  } catch (error) {
    console.error('Error updating ad hoc draft:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEmployerDrafts = async (req, res) => {
  try {
    const drafts = await DraftJob.find({ employerID: req.user.userId });
    res.status(200).json({ success: true, data: drafts });
  } catch (error) {
    console.error('Error getting employer drafts:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getDraftById = async (req, res) => {
  try {
    const draft = await DraftJob.findOne({ 
      _id: req.params.id, 
      employerID: req.user.userId 
    });
    
    if (!draft) {
      return res.status(404).json({ 
        success: false, 
        error: 'Draft not found or you do not have permission to access it' 
      });
    }
    
    // Ensure the applicationDeadline is properly formatted
    const draftData = draft.toObject();
    if (draftData.applicationDeadline) {
      draftData.applicationDeadline = new Date(draftData.applicationDeadline);
    }
    
    console.log('Returning draft data with deadline:', draftData.applicationDeadline);
    res.status(200).json({ success: true, data: draftData });
  } catch (error) {
    console.error('Error getting draft by ID:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAdHocDraftById = async (req, res) => {
  try {
    const draft = await AdHocDraft.findOne({ 
      _id: req.params.id, 
      employerID: req.user.userId 
    });
    
    if (!draft) {
      return res.status(404).json({ 
        success: false, 
        error: 'Draft not found or you do not have permission to access it' 
      });
    }
    
    // Ensure the applicationDeadline is properly formatted
    const draftData = draft.toObject();
    if (draftData.applicationDeadline) {
      draftData.applicationDeadline = new Date(draftData.applicationDeadline);
    }
    
    console.log('Returning ad-hoc draft data with deadline:', draftData.applicationDeadline);
    res.status(200).json({ success: true, data: draftData });
  } catch (error) {
    console.error('Error getting ad-hoc draft by ID:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const convertDraftToPost = async (req, res) => {
  try {
    const draft = await DraftJob.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ success: false, error: 'Draft not found' });
    }

    const requiredFields = ['title', 'company', 'location', 'description', 'applicationDeadline'];
    if (draft.type === 'internship_job') {
      requiredFields.push('stipend', 'duration', 'courseStudy', 'yearOfStudy');
    } else {
      requiredFields.push('payPerHour');
    }

    const missingFields = requiredFields.filter(field => !draft[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const JobModel = draft.type === 'internship_job' ? InternshipJob : AdHocJob;
    const postData = draft.toObject();
    delete postData._id;
    delete postData.lastModified;
    postData.status = 'posted';
    
    // Ensure application deadline is maintained when converting from draft to post
    if (postData.applicationDeadline) {
      postData.applicationDeadline = new Date(postData.applicationDeadline);
    } else {
      postData.applicationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const job = await JobModel.create(postData);
    await Employer.findByIdAndUpdate(draft.employerID, { $push: { jobPosts: job._id } });
    await DraftJob.findByIdAndDelete(req.params.draftId);

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error('Error converting draft to post:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteDraftJob = async (req, res) => {
  try {
    const draft = await DraftJob.findOneAndDelete({
      _id: req.params.id,
      employerID: req.user.userId
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: 'Draft not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(400).json({ success: false, error: error.message });
  }
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
    
    // Use employer-provided application deadline or default to 30 days
    if (req.body.applicationDeadline) {
      jobData.applicationDeadline = new Date(req.body.applicationDeadline);
    } else {
      jobData.applicationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const job = await InternshipJob.create(jobData);
    await Employer.findByIdAndUpdate(req.user.userId, { $push: { jobPosts: job._id } });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('Error creating internship:', error);
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
    console.error('Error getting all internships:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEmployerInternshipJobs = async (req, res) => {
  try {
    const [jobs, drafts] = await Promise.all([
      InternshipJob.find({ employerID: req.user.userId }),
      DraftJob.find({ employerID: req.user.userId, type: 'internship_job' })
    ]);
    res.status(200).json({ success: true, data: { jobs, drafts } });
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

export const createAdHocJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      employerID: req.user.userId,
      type: 'adhoc_job',
      jobType: 'adhoc',
      status: 'posted'
    };
    
    // Use employer-provided application deadline or default to 30 days
    if (req.body.applicationDeadline) {
      jobData.applicationDeadline = new Date(req.body.applicationDeadline);
    } else {
      jobData.applicationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const job = await AdHocJob.create(jobData);
    await Employer.findByIdAndUpdate(req.user.userId, { $push: { jobPosts: job._id } });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('Error creating ad hoc job:', error);
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
    console.error('Error getting all ad hoc jobs:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEmployerAdHocJobs = async (req, res) => {
  try {
    const [jobs, drafts] = await Promise.all([
      AdHocJob.find({ employerID: req.user.userId }),
      DraftJob.find({ employerID: req.user.userId, type: 'adhoc_job' })
    ]);
    res.status(200).json({ success: true, data: { jobs, drafts } });
  } catch (error) {
    console.error('Error getting employer ad hoc jobs:', error);
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
    console.error('Error getting ad hoc job by ID:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateAdHocJob = async (req, res) => {
  try {
    const job = await AdHocJob.findOneAndUpdate(
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
    console.error('Error updating ad hoc job:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteAdHocJob = async (req, res) => {
  try {
    const job = await AdHocJob.findOneAndDelete({
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
    console.error('Error deleting ad hoc job:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};


