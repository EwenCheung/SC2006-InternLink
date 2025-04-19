import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { INTERNSHIP_OPTIONS } from './job.model.js';

const JobSeekerSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please provide name'],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
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
    enum: ['jobseeker'],
    default: 'jobseeker',
    required: true
  },
  profileImage: {
    data: Buffer,
    contentType: String,
    originalName: String,
    uploadedAt: Date,
    size: Number
  },
  dateOfBirth: Date,
  contactList: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'github', 'linkedin', 'other'],
      required: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    }
  }],
  workExperience: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    description: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  academicHistory: [{
    id: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    field: {
      type: String,
      trim: true
    },
    startYear: {
      type: String,
      required: true
    },
    endYear: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  school: String,
  fieldOfStudy: {
    type: String,
    validate: {
      validator: function(value) {
        return !value || INTERNSHIP_OPTIONS.FIELDS.includes(value);
      },
      message: 'Invalid field of study selected'
    }
  },
  course: {
    type: String,
    validate: {
      validator: function(value) {
        return !value || INTERNSHIP_OPTIONS.COURSES.includes(value);
      },
      message: 'Invalid course selected'
    }
  },
  yearOfStudy: String,
  personalDescription: String,
  skills: [String],
  interests: [String],
  jobApplications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
});

JobSeekerSchema.pre('save', async function () {
  // Convert email to lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Hash password if modified
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

JobSeekerSchema.methods.createJWT = function () {
  return jwt.sign(
    { 
      userId: this._id,
      role: 'jobseeker'  // Explicitly set role for JWT
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME || '30d',
    }
  );
};

JobSeekerSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Create JobSeeker model in Users database
const usersDb = mongoose.connection.useDb('Users', { useCache: true });
const JobSeeker = usersDb.model('JobSeeker', JobSeekerSchema);

export default JobSeeker;
