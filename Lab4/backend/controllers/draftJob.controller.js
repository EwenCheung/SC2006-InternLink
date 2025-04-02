import DraftJob from '../models/draftJob.model.js';
import InternshipJob from '../models/internshipJob.model.js';
import AdHocJob from '../models/adhocJob.model.js';
import Employer from '../models/Employer.model.js';

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

export const getEmployerDrafts = async (req, res) => {
  try {
    const drafts = await DraftJob.find({ employerID: req.user.userId });
    res.status(200).json({ success: true, data: drafts });
  } catch (error) {
    console.error('Error getting employer drafts:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateDraftJob = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastModified: new Date()
    };

    if (updateData.stipend) {
      updateData.stipend = Number(updateData.stipend);
    }

    const updatedDraft = await DraftJob.findOneAndUpdate(
      { _id: req.params.id, employerID: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or you do not have permission to update it'
      });
    }

    res.status(200).json({ success: true, data: updatedDraft });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ success: false, error: error.message });
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
