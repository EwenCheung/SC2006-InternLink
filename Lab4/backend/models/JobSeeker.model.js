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
    type: String,
    default: 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
    validate: {
      validator: function(v) {
        return !v || /\.(jpg|jpeg|png)$/i.test(v);
      },
      message: 'Profile image must be in JPG, JPEG, or PNG format'
    }
  },
  dateOfBirth: Date,
  phoneNumber: String,
  school: String,
  course: String,
  yearOfStudy: String,
  resume: String,
  skills: [String],
  interests: [String],
  jobApplications: [{
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

const usersDb = mongoose.connection.useDb('Users', { useCache: true });
const JobSeeker = usersDb.model('JobSeeker', JobSeekerSchema);
export default JobSeeker;
