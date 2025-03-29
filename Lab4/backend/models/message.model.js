import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['JobSeeker', 'Employer']
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['JobSeeker', 'Employer']
  },
  content: {
    type: String,
    required: [true, 'Please provide message content'],
    trim: true
  },
  job: {
    type: mongoose.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ job: 1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', MessageSchema);
