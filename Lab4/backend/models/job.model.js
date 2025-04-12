import mongoose from 'mongoose';

// Valid options for dropdown fields
const VALID_DURATIONS = [
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
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Any Year'
];

const VALID_COURSES = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Business Analytics',
  'Information Systems',
  'Computer Engineering',
  'Any Related Field'
];

// Ad Hoc Job Schema
const adHocJobSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'adhoc_job',
    required: true
  },
  title: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  description: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  jobScope: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  company: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  location: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  tags: {
    type: [String],
    default: [],
  },
  payPerHour: {
    type: Number,
    required: function() { return this.status !== 'draft'; },
    min: [0, 'Pay per hour cannot be negative']
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
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['draft', 'posted'],
    default: 'posted'
  },
  applicationDeadline: {
    type: Date,
    required: function() { return this.status !== 'draft'; },
    validate: {
      validator: function(value) {
        return this.status === 'draft' || value > new Date();
      },
      message: 'Application deadline must be a future date'
    }
  }
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
    required: function() { return this.status !== 'draft'; }
  },
  description: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  company: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  location: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  area:{
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  tags: {
    type: [String],
    default: [],
  },
  stipend: {
    type: Number,
    required: function() { return this.status !== 'draft'; },
    min: [0, 'Stipend cannot be negative']
  },
  duration: {
    type: String,
    required: function() { return this.status !== 'draft'; },
    enum: {
      values: VALID_DURATIONS,
      message: 'Invalid duration selected'
    }
  },
  jobType: {
    type: String,
    default: 'internship',
    required: true,
  },
  courseStudy: {
    type: String,
    required: function() { return this.status !== 'draft'; },
    enum: {
      values: VALID_COURSES,
      message: 'Invalid course selected'
    }
  },
  yearOfStudy: {
    type: String,
    required: function() { return this.status !== 'draft'; },
    enum: {
      values: VALID_YEARS,
      message: 'Invalid year of study selected'
    }
  },
  views: {
    type: Number,
    default: 0
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
  status: {
    type: String,
    enum: ['draft', 'posted'],
    default: 'draft' // Changed default to draft
  },
  applicationDeadline: {
    type: Date,
    required: function() { return this.status !== 'draft'; },
    validate: {
      validator: function(value) {
        return this.status === 'draft' || value > new Date();
      },
      message: 'Application deadline must be a future date'
    }
  }
});

// Add pre-save middleware to validate posted jobs
const validatePostedJob = function(next) {
  if (this.status === 'posted') {
    const requiredFields = [
      'title', 'description', 'company', 'location', 'applicationDeadline'
    ];

    if (this.jobType === 'internship') {
      requiredFields.push('stipend', 'duration', 'courseStudy', 'yearOfStudy');
    } else {
      requiredFields.push('payPerHour');
    }

    const missingFields = requiredFields.filter(field => {
      const value = this[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      next(new Error(`Missing required fields for posted job: ${missingFields.join(', ')}`));
      return;
    }

    // Validate numeric fields
    if (this.jobType === 'internship') {
      if (typeof this.stipend !== 'number' || this.stipend < 0) {
        next(new Error('Stipend must be a non-negative number'));
        return;
      }
    } else {
      if (typeof this.payPerHour !== 'number' || this.payPerHour < 0) {
        next(new Error('Pay per hour must be a non-negative number'));
        return;
      }
    }

    // Validate application deadline
    if (this.applicationDeadline && this.applicationDeadline <= new Date()) {
      next(new Error('Application deadline must be a future date'));
      return;
    }
  }
  next();
};

internshipJobSchema.pre('save', validatePostedJob);
adHocJobSchema.pre('save', validatePostedJob);

// Export valid options for use in frontend dropdowns
export const INTERNSHIP_OPTIONS = {
  DURATIONS: VALID_DURATIONS,
  YEARS: VALID_YEARS,
  COURSES: VALID_COURSES
};

// Add default deadline values (30 days from current date)
export const DEFAULT_DEADLINE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

// Get job_list database connection
const jobListDb = mongoose.connection.useDb('job_list', { useCache: true });

// Create and export models
const InternshipJob = jobListDb.model('InternshipJob', internshipJobSchema);
const AdHocJob = jobListDb.model('AdHocJob', adHocJobSchema);


export { InternshipJob, AdHocJob };
