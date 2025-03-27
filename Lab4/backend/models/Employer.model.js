import mongoose from 'mongoose';
import User from './User.js';

const EmployerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please provide company name'],
    minlength: 3,
    maxlength: 100,
  },
  companyLogo: {
    type: String,
    default: 'default_company.png',
  },
  industry: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10',
  },
  website: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  contact: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid contact email'],
    default: '',
  },
  jobPostings: {
    type: [String],
    default: [],
  }
}, { 
  collection: 'employer',  // Explicitly set collection name
  collation: {
    locale: 'en',
    strength: 2,
    caseLevel: false,
    numericOrdering: true,
    normalization: true
  }
});

const Employer = User.discriminator('employer', EmployerSchema);
export default Employer;
