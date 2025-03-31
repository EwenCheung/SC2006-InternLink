import mongoose from 'mongoose';
import { VALID_INDUSTRIES } from '../constants/courses.js';

// Base schema with common fields
const JobBaseSchema = new mongoose.Schema({
  employerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  jobScope: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true,
    enum: {
      values: ['Select Industry', ...VALID_INDUSTRIES],
      message: 'Invalid industry selected'
    }
  },
  stipend: {
    type: Number,
    required: true,
    min: [0, 'Stipend cannot be negative']
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'posted', 'closed'],
    default: 'posted'
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  discriminatorKey: 'jobType',
  timestamps: true
});

// Base validation middleware
JobBaseSchema.pre('save', function(next) {
  if (this.status !== 'draft' && this.industry === 'Select Industry') {
    next(new Error('Please select a valid industry'));
  }
  next();
});

const Job = mongoose.model('Job', JobBaseSchema);

export default Job;
