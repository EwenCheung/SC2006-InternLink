import mongoose from 'mongoose';

// Ad Hoc Job Schema
const adHocJobSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'adhoc_job',
    required: true
  },
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
    required: [true, 'Pay per hour is required'],
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
});

// Internship Job Schema
const internshipJobSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'internship_job',
    required: true
  },
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
    required: [true, 'Stipend is required'],
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
  },
  jobType: {
    type: String,
    default: 'internship',
    required: true,
  },
  courseStudy: {
    type: String,
    required: [true, 'Course of study is required'],
  },
  yearOfStudy: {
    type: String,
    required: [true, 'Year of study is required'],
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
});

// Get job_list database connection
const jobListDb = mongoose.connection.useDb('job_list', { useCache: true });

// Create and export models
const InternshipJob = jobListDb.model('InternshipJob', internshipJobSchema);
const AdHocJob = jobListDb.model('AdHocJob', adHocJobSchema);

export { InternshipJob, AdHocJob };
