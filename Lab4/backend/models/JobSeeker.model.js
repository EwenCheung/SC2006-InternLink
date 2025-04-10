import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JobSeekerSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'jobseeker',
    required: true
  },
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
    enum: ['jobseeker'],
    default: 'jobseeker',
  },
  profileImage: {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    uploadedAt: Date,
    url: {
      type: String,
      default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    },
    contentType: {
      type: String,
      default: 'image/jpeg'
    }
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
      trim: true,
      validate: {
        validator: function(value) {
          switch (this.type) {
            case 'email':
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'phone':
              return /^\+?[\d\s-]+$/.test(value);
            case 'linkedin':
              return value.includes('linkedin.com/');
            case 'github':
              return value.includes('github.com/');
            default:
              return true;
          }
        },
        message: props => {
          switch (props.value.type) {
            case 'email': return 'Please enter a valid email address';
            case 'phone': return 'Please enter a valid phone number';
            case 'linkedin': return 'Please enter a valid LinkedIn URL';
            case 'github': return 'Please enter a valid GitHub URL';
            default: return 'Invalid value';
          }
        }
      }
    },
    label: {
      type: String,
      trim: true
    }
  }],
  school: String,
  course: String,
  yearOfStudy: String,
  resume: {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    uploadedAt: Date,
    url: String,
    contentType: {
      type: String,
      enum: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      default: 'application/pdf'
    },
    filename: String,
    originalName: String,
    size: Number
  },
  personalDescription: String,
  skills: [String],
  interests: [String],
  jobApplications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
});

JobSeekerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

JobSeekerSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, role: this.role },
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

// Use Users database for JobSeeker model
const usersDb = mongoose.connection.useDb('Users', { useCache: true });

// Create JobSeeker model
const JobSeeker = usersDb.model('JobSeeker', JobSeekerSchema);
export default JobSeeker;
