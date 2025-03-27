import mongoose from 'mongoose';
import User from './User.js';

const JobSeekerSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50,
  },
  profileImage: {
    type: String,
    default: 'default.png',
  },
  school: {
    type: String,
    default: '',
  },
  course: {
    type: String,
    default: '',
  },
  yearOfStudy: {
    type: String,
    default: '',
  },
  contact: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid contact email'],
    default: '',
  },
  resume: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        return v === '' || v.endsWith('.pdf');
      },
      message: 'Resume must be a PDF file'
    }
  },
  skills: {
    type: [String],
    default: [],
  },
  applications: {
    type: [String],
    default: [],
  }
}, { 
  collection: 'jobseeker'  // Explicitly set collection name
});

const JobSeeker = User.discriminator('jobseeker', JobSeekerSchema);
export default JobSeeker;
