import { InternshipJob, AdHocJob } from '../models/job.model.js';
import DraftJob from '../models/draftJob.model.js';
import Employer from '../models/Employer.model.js';

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
    if (filters.stipend) {
      switch (filters.stipend) {
        case 'low': query.stipend = { $lt: 500 }; break;
        case 'medium': query.stipend = { $gte: 500, $lte: 1000 }; break;
        case 'high': query.stipend = { $gt: 1000 }; break;
      }
    }
  } else if (jobType === 'adhoc') {
    if (filters.stipend) {
      switch (filters.stipend) {
        case 'low': query.payPerHour = { $lt: 15 }; break;
        case 'medium': query.payPerHour = { $gte: 15, $lte: 25 }; break;
        case 'high': query.payPerHour = { $gt: 25 }; break;
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

    draftData.employerID = req.user.userId;
    draftData.type = 'internship_job';
    draftData.jobType = 'internship';
    draftData.status = 'draft';
    draftData.lastModified = new Date();

    console.log('Processed draft data:', draftData);
    const draft = await DraftJob.create(draftData);
    console.log('Created draft:', draft);
    
    res.status(201).json({ success: true, data: draft });
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

    const updateData = {
      ...req.body,
      lastModified: new Date(),
      type: 'internship_job',
      jobType: 'internship',
      status: 'draft',
      employerID: req.user.userId
    };

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

    console.log('Updated draft:', updatedDraft);
    res.status(200).json({ success: true, data: updatedDraft });
  } catch (error) {
    console.error('Error updating draft:', error);
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

export const convertDraftToPost = async (req, res) => {
  try {
    const draft = await DraftJob.findById(req.params.draftId);
    if (!draft) {
      return res.status(404).json({ success: false, error: 'Draft not found' });
    }

    const requiredFields = ['title', 'company', 'location', 'description'];
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
