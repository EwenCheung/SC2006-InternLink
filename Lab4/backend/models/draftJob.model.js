import mongoose from 'mongoose';
import { VALID_COURSES, VALID_INDUSTRIES } from '../constants/courses.js';

const DraftJobSchema = new mongoose.Schema({
  employerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  title: {
    type: String
  },
  company: {
    type: String
  },
  location: {
    type: String
  },
  type: {
    type: String,
    enum: ['internship_job', 'adhoc_job'],
    required: true
  },
  jobType: {
    type: String,
    enum: ['internship', 'adhoc'],
    required: true
  },
  description: {
    type: String
  },
  jobScope: {
    type: String
  },
  industry: {
    type: String,
    enum: {
      values: ['Select Industry', ...VALID_INDUSTRIES],
      message: 'Invalid industry selected'
    }
  },
  courseStudy: {
    type: [String],
    default: [],
    validate: {
      validator: function(array) {
        return array.every(course => VALID_COURSES.includes(course));
      },
      message: 'Invalid course selection'
    }
  },
  yearOfStudy: {
    type: String,
    enum: ['Select Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Any Year']
  },
  duration: {
    type: String,
    enum: [
      'Select Duration',
      '1 month',
      '2 months',
      '3 months',
      '4 months',
      '5 months',
      '6 months',
      '8 months',
      '12 months'
    ]
  },
  stipend: {
    type: Number,
    min: [0, 'Stipend cannot be negative']
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'posted', 'closed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

DraftJobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DraftJob = mongoose.model('DraftJob', DraftJobSchema);

export default DraftJob;
