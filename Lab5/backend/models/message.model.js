import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel'
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel'
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['JobSeeker', 'Employer']
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ['JobSeeker', 'Employer']
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    conversationId: {
      type: String,
      required: true,
      index: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create indexes for better query performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Custom method to format message
messageSchema.methods.toClientObject = function() {
  return {
    id: this._id,
    senderId: this.senderId,
    receiverId: this.receiverId,
    content: this.content,
    conversationId: this.conversationId,
    isRead: this.isRead,
    createdAt: this.createdAt
  };
};

const Message = mongoose.model("Message", messageSchema);

export default Message;