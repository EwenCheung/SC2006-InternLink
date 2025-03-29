import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  jobSeeker: {
    type: mongoose.Types.ObjectId,
    ref: 'JobSeeker',
    required: [true, 'Please provide job seeker ID']
  },
  job: {
    type: mongoose.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Please provide job ID']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: {
    type: String
  },
  resume: {
    type: String
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ApplicationSchema.index({ jobSeeker: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ appliedDate: -1 });

export default mongoose.model('Application', ApplicationSchema);
