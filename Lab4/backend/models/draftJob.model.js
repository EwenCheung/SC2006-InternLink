import mongoose from 'mongoose';

// Valid options for dropdown fields
const VALID_DURATIONS = [
  'Select Duration',
  '1 month',
  '2 months',
  '3 months',
  '4 months',
  '5 months',
  '6 months',
  '8 months',
  '12 months'
];

const VALID_YEARS = [
  'Select Year',
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Any Year'
];

const VALID_COURSES = [
  'Select Course',
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Business Analytics',
  'Information Systems',
  'Computer Engineering',
  'Any Related Field'
];

// Draft Job Schema for both internship and ad hoc jobs
const draftJobSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['internship_job', 'adhoc_job'],
    required: true
  },
  title: String,
  description: String,
  company: String,
  location: String,
  tags: {
    type: [String],
    default: [],
  },
  // Internship specific fields
  stipend: Number,
  duration: {
    type: String,
    enum: {
      values: VALID_DURATIONS,
      message: 'Invalid duration value'
    }
  },
  courseStudy: {
    type: String,
    enum: {
      values: VALID_COURSES,
      message: 'Invalid course value'
    }
  },
  yearOfStudy: {
    type: String,
    enum: {
      values: VALID_YEARS,
      message: 'Invalid year value'
    }
  },
  // Ad hoc specific fields
  payPerHour: Number,
  // Common fields
  jobType: {
    type: String,
    enum: ['internship', 'adhoc'],
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
  lastModified: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'posted'],
    default: 'draft'
  }
});

// Update lastModified on save
draftJobSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Add pre-update middleware to update lastModified
draftJobSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ lastModified: new Date() });
  next();
});

// Get job_list database connection
const jobListDb = mongoose.connection.useDb('job_list', { useCache: true });

// Create and export model
const DraftJob = jobListDb.model('DraftJob', draftJobSchema);
export default DraftJob;
