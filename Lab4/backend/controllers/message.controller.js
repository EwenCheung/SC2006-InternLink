import mongoose from "mongoose";
import Message from "../models/message.model.js";
import User from "../models/User.js";

// Get conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token

    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    // Extract unique conversation IDs
    const conversationIds = [...new Set(messages.map(msg => msg.conversationId))];

    // For each conversation, get the most recent message and other user details
    const conversations = [];
    for (const convId of conversationIds) {
      // Get most recent message in this conversation
      const recentMessage = await Message.findOne({ conversationId: convId })
        .sort({ createdAt: -1 })
        .limit(1);

      // Get the other user's ID
      const otherUserId = recentMessage.senderId.toString() === userId 
        ? recentMessage.receiverId 
        : recentMessage.senderId;

      // Get other user details
      const otherUser = await User.findById(otherUserId).select('userName companyName email role');

      // Count unread messages in this conversation where user is the receiver
      const unreadCount = await Message.countDocuments({
        conversationId: convId,
        receiverId: userId,
        isRead: false
      });

      conversations.push({
        conversationId: convId,
        withUser: otherUser,
        lastMessage: recentMessage,
        unreadCount
      });
    }

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Generate conversation ID
    const conversationId = Message.generateConversationId(userId, otherUserId);

    // Get messages in this conversation
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    // Mark messages as read if user is the receiver
    await Message.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ success: false, message: "Invalid receiver ID" });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: "Message content cannot be empty" });
    }

    // Generate conversation ID
    const conversationId = Message.generateConversationId(senderId, receiverId);

    // Create and save new message
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      conversationId
    });

    await newMessage.save();

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message ID" });
    }

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this message" });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
