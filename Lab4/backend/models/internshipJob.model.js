import mongoose from 'mongoose';
import { VALID_COURSES, VALID_INDUSTRIES, VALID_YEARS, VALID_DURATIONS } from '../constants/courses.js';

const InternshipJobSchema = new mongoose.Schema({
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
  courseStudy: {
    type: [String],
    required: true,
    validate: {
      validator: function(array) {
        return array && array.length > 0 && array.every(course => VALID_COURSES.includes(course));
      },
      message: 'Invalid course selection or no courses selected'
    }
  },
  yearOfStudy: {
    type: String,
    enum: VALID_YEARS,
    required: true
  },
  duration: {
    type: String,
    required: true,
    enum: VALID_DURATIONS
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
});

InternshipJobSchema.pre('save', function(next) {
  if (this.status !== 'draft') {
    if (
      this.industry === 'Select Industry' ||
      this.yearOfStudy === 'Select Year' ||
      this.duration === 'Select Duration'
    ) {
      next(new Error('Please select valid values for industry, year of study, and duration'));
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

const InternshipJob = mongoose.model('InternshipJob', InternshipJobSchema);

export default InternshipJob;
