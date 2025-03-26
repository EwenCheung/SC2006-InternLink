import mongoose from 'mongoose';

// Internship Job Schema
const internshipJobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  tags: {
    type: [String],
    default: [],
  },
  stipend: {
    type: String,
  },
  duration: {
    type: String,
  },
  jobType: {
    type: String,
    default: 'internship',
    required: true,
  },
  courseStudy: {
    type: String,
  },
  yearOfStudy: {
    type: String,
  },
  employerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'internship_job' }); // Explicitly set collection name

// Ad Hoc Job Schema
const adHocJobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  tags: {
    type: [String],
    default: [],
  },
  payPerHour: {
    type: Number,
    required: true,
  },
  jobType: {
    type: String,
    default: 'adhoc',
    required: true,
  },
  employerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'adhoc_job' }); // Explicitly set collection name

const InternshipJob = mongoose.model('InternshipJob', internshipJobSchema);
const AdHocJob = mongoose.model('AdHocJob', adHocJobSchema);

export { InternshipJob, AdHocJob };
