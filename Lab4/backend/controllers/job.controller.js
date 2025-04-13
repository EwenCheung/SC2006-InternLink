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
  
  if (filters.location && filters.location.trim() !== '') {
    // Use $or to match either location or area field
    // This will perform a case-insensitive search on both fields
    query.$or = [
      { location: { $regex: filters.location, $options: 'i' } },
      { area: { $regex: filters.location, $options: 'i' } }
    ];
  }
  
  if (jobType === 'internship') {
    if (filters.course) {
      // Handle both string and array of course filters
      if (Array.isArray(filters.course)) {
        if (filters.course.length > 0) {
          query.courseStudy = { $in: filters.course.map(course => new RegExp(course, 'i')) };
        }
      } else if (filters.course.trim() !== '') {
        query.courseStudy = { $regex: filters.course, $options: 'i' };
      }
    }
    
    if (filters.year && filters.year.trim() !== '') {
      // Extract the numeric value from the year string (e.g., "Year 2" -> 2)
      const selectedYear = parseInt(filters.year.match(/\d+/)[0], 10);
      
      // Create a regex to match all years up to and including the selected year
      // For example, if Year 2 is selected, match Year 1, Year 2, or Year 1-2
      const yearRegexParts = [];
      
      // Match a specific year (e.g., "Year 1", "Year 2", etc.)
      for (let i = 1; i <= selectedYear; i++) {
        yearRegexParts.push(`Year\\s*${i}`);
      }
      
      // Match year ranges (e.g., "Year 1-2", "Year 1-3", etc.)
      for (let i = 1; i < selectedYear; i++) {
        for (let j = i + 1; j <= selectedYear; j++) {
          yearRegexParts.push(`Year\\s*${i}\\s*[-–]\\s*${j}`);
        }
      }
      
      // Match "All Years" or similar phrases
      yearRegexParts.push('All Years');
      yearRegexParts.push('Any Year');
      
      // Combine all patterns
      const yearRegex = new RegExp(yearRegexParts.join('|'), 'i');
      query.yearOfStudy = { $regex: yearRegex };
      
      console.log(`Year filter: ${filters.year} -> Using regex: ${yearRegex}`);
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
    
    // Handle duration range filtering
    if (filters.minDuration || filters.maxDuration) {
      // Don't set query.duration = {} directly as it causes casting issues
      
      if (filters.minDuration && filters.maxDuration) {
        // When both min and max are provided, use a single regex to match the range
        const minDuration = Number(filters.minDuration);
        const maxDuration = Number(filters.maxDuration);
        
        // Create a pattern that matches a number between minDuration and maxDuration followed by "month(s)"
        const durationPattern = Array.from({ length: maxDuration - minDuration + 1 }, (_, i) => minDuration + i)
          .map(num => `^${num}\\s*months?$`)
          .join('|');
        
        query.duration = { $regex: new RegExp(durationPattern, 'i') };
        console.log(`Duration filter: ${minDuration}-${maxDuration} months -> Using regex: ${durationPattern}`);
      } else if (filters.minDuration) {
        const minDuration = Number(filters.minDuration);
        // Use regex to match durations that are greater than or equal to minDuration
        query.$or = query.$or || [];
        query.$or.push({
          duration: { $regex: new RegExp(`^(${minDuration}|[${minDuration+1}-9][0-9]*)\\s*months?`, 'i') }
        });
      } else if (filters.maxDuration) {
        const maxDuration = Number(filters.maxDuration);
        // Use regex to match durations that are less than or equal to maxDuration
        query.$and = query.$and || [];
        query.$and.push({
          duration: { $regex: new RegExp(`^([1-9]|[1-${maxDuration}][0-9]*)\\s*months?`, 'i') }
        });
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

  // Modified to only search in job title
  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.trim();
    // Only search in title field
    query.title = { $regex: searchTerm, $options: 'i' };
  }

  console.log('Built query:', JSON.stringify(query, null, 2));
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

    // Handle courseStudy as a string for backward compatibility
    // This is a temporary fix until the database schema is updated
    if (req.body.courseStudy) {
      if (Array.isArray(req.body.courseStudy)) {
        if (req.body.courseStudy.length > 0) {
          // Join the array into a comma-separated string
          draftData.courseStudy = req.body.courseStudy[0]; // Just use the first selected course for now
        } else {
          draftData.courseStudy = '';
        }
      } else if (req.body.courseStudy !== 'Select Course' && req.body.courseStudy !== '') {
        draftData.courseStudy = req.body.courseStudy;
      } else {
        draftData.courseStudy = '';
      }
    } else {
      draftData.courseStudy = '';
    }
    
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
    // Special case: If ID is "all", return all internship jobs
    if (req.params.id === 'all') {
      const jobs = await InternshipJob.find({ status: 'posted' });
      return res.status(200).json({ success: true, data: jobs });
    }
    
    // Check if this is a job seeker viewing the job
    const isJobSeeker = req.user && req.user.role === 'jobseeker';
    
    // Find the job by ID
    const job = await InternshipJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Increment view count if it's a job seeker viewing the job
    if (isJobSeeker) {
      job.views += 1;
      await job.save();
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
    // Special case: If ID is "all", return all ad hoc jobs
    if (req.params.id === 'all') {
      const jobs = await AdHocJob.find({ status: 'posted' });
      return res.status(200).json({ success: true, data: jobs });
    }

    // Check if this is a job seeker viewing the job
    const isJobSeeker = req.user && req.user.role === 'jobseeker';
    
    // Find the job by ID
    const job = await AdHocJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Increment view count if it's a job seeker viewing the job
    if (isJobSeeker) {
      job.views += 1;
      await job.save();
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


