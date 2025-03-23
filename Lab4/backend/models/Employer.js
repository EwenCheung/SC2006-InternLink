const mongoose = require('mongoose');
const User = require('./User');

const EmployerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please provide company name'],
    minlength: 3,
    maxlength: 100,
  },
  companyLogo: {
    type: String,
    default: 'default_company.png'
  },
  industry: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  companySize: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  contact: {
    type: String,
    default: ''
  },
  jobPostings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }]
});

module.exports = User.discriminator('employer', EmployerSchema);
