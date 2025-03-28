import mongoose from 'mongoose';
import { comparePassword, createJWT, hashPassword } from './User.js';
import { connectDB, usersConn } from '../config/db.js';

// Wait for database connection
await connectDB();

// Ensure we have the users connection
if (!usersConn) {
  throw new Error('Users database connection not established');
}

const EmployerSchema = new mongoose.Schema({
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
    default: 'employer',
    immutable: true
  },
  accountUserName: {
    type: String,
    required: [true, 'Please provide a username'],
    minlength: 3,
    maxlength: 50,
  },
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
  },
  location: {
    type: String,
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10',
  },
  website: {
    type: String,
  },
  description: {
    type: String,
  },
  contact: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid contact email'],
  },
  jobPostings: {
    type: [String],
    default: [],
  }
});

// Pre-save middleware to hash password
EmployerSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
});

// Instance methods
EmployerSchema.methods.comparePassword = async function(candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

EmployerSchema.methods.createJWT = function() {
  return createJWT(this._id, this.email, this.role);
};

const Employer = usersConn.model('Employer', EmployerSchema, 'employer');
export default Employer;
