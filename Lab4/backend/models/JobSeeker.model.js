import mongoose from 'mongoose';
import { comparePassword, createJWT, hashPassword } from './User.js';
import { connectDB, usersConn } from '../config/db.js';

// Wait for database connection
await connectDB();

// Ensure we have the users connection
if (!usersConn) {
  throw new Error('Users database connection not established');
}

const JobSeekerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  role: {
    type: String,
    default: 'jobseeker',
    immutable: true
  },
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
  },
  course: {
    type: String,
  },
  yearOfStudy: {
    type: String,
  },
  contact: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid contact email'],
  },
  resume: {
    type: String,
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
});

// Pre-save middleware to hash password
JobSeekerSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
});

// Instance methods
JobSeekerSchema.methods.comparePassword = async function(candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

JobSeekerSchema.methods.createJWT = function() {
  return createJWT(this._id, this.email, this.role);
};

const JobSeeker = usersConn.model('JobSeeker', JobSeekerSchema, 'jobseeker');
export default JobSeeker;
