import mongoose from 'mongoose';

const jobListDb = mongoose.connection.useDb('job_list', { useCache: true });

const ResumeSchema = new mongoose.Schema({
  data: String,  // Store base64 encoded resume data
  name: String,  // Original filename
  type: String,  // MIME type (e.g., application/pdf)
  size: Number   // File size in bytes
}, { _id: false });

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
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  coverLetter: {
    type: String
  },
  resume: ResumeSchema,
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  },
  feedback: {
    type: String
  },
  jobType: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ApplicationSchema.index({ jobSeeker: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ appliedDate: -1 });

const Application = jobListDb.model('Applications', ApplicationSchema);

// Fix: Export the Application model directly instead of as an object
export default Application;
