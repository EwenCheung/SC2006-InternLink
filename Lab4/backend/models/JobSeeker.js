const mongoose = require('mongoose');
const User = require('./User');

const JobSeekerSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50,
  },
  profileImage: {
    type: String,
    default: 'default.png'
  },
  school: {
    type: String,
    default: ''
  },
  course: {
    type: String,
    default: ''
  },
  yearOfStudy: {
    type: String,
    default: ''
  },
  contact: {
    type: String,
    default: ''
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication'
  }]
});

module.exports = User.discriminator('jobseeker', JobSeekerSchema);
