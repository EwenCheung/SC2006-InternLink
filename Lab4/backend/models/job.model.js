import mongoose from 'mongoose';
import { connectDB, jobListConn } from '../config/db.js';

// Wait for database connection
await connectDB();

// Ensure we have the job_list connection
if (!jobListConn) {
  throw new Error('Job list database connection not established');
}

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

const InternshipJob = jobListConn.model('InternshipJob', internshipJobSchema, 'internship_job');
const AdHocJob = jobListConn.model('AdHocJob', adHocJobSchema, 'adhoc_job');

export { InternshipJob, AdHocJob };
