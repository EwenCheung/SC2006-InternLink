import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const EmployerSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'employer',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please provide company name'],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minLength: 6,
  },
  role: {
    type: String,
    enum: ['employer'],
    default: 'employer',
  },
  companyLogo: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /\.(jpg|jpeg|png)$/i.test(v);
      },
      message: 'Company logo must be in JPG, JPEG, or PNG format'
    }
  },
  industry: String,
  companySize: String,
  location: String,
  website: String,
  description: String,
  phoneNumber: String,
  jobPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  contactEmail: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid contact email',
    ]
  },
});

EmployerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

EmployerSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME || '30d',
    }
  );
};

EmployerSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Get Users database connection
const usersDb = mongoose.connection.useDb('Users', { useCache: true });

// Create and export model
const Employer = usersDb.model('Employer', EmployerSchema);
export default Employer;
