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
    required: function() { return this.status !== 'draft'; } // Only required for posted jobs
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
  tags: {
    type: [String],
    default: [],
  },
  payPerHour: {
    type: Number,
    required: function() { return this.status !== 'draft'; }
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
  status: {
    type: String,
    enum: ['draft', 'posted'],
    default: 'posted'
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
  tags: {
    type: [String],
    default: [],
  },
  stipend: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  duration: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  jobType: {
    type: String,
    default: 'internship',
    required: true,
  },
  courseStudy: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  yearOfStudy: {
    type: String,
    required: function() { return this.status !== 'draft'; }
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
    default: 'posted'
  }
});

// Add pre-save middleware to validate required fields for posted jobs
const validatePostedJob = function(next) {
  if (this.status === 'posted') {
    const requiredFields = [
      'title', 'description', 'company', 'location', 
      ...(this.jobType === 'internship' ? 
        ['stipend', 'duration', 'courseStudy', 'yearOfStudy'] : 
        ['payPerHour']
      )
    ];

    const missingFields = requiredFields.filter(field => !this[field]);
    if (missingFields.length > 0) {
      next(new Error(`Missing required fields for posted job: ${missingFields.join(', ')}`));
      return;
    }
  }
  next();
};

internshipJobSchema.pre('save', validatePostedJob);
adHocJobSchema.pre('save', validatePostedJob);

// Get job_list database connection
const jobListDb = mongoose.connection.useDb('job_list', { useCache: true });

// Create and export models
const InternshipJob = jobListDb.model('InternshipJob', internshipJobSchema);
const AdHocJob = jobListDb.model('AdHocJob', adHocJobSchema);

export { InternshipJob, AdHocJob };
