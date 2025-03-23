import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  // We'll use this to group related messages together in a conversation
  conversationId: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Helper method to generate a conversation ID from two user IDs
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  // Sort IDs to ensure consistency regardless of who initiates the conversation
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

const Message = mongoose.model('Message', messageSchema);

export default Message;