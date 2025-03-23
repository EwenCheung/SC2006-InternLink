import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Search, Send, User, Building } from "lucide-react";

export default function MessagesComponent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch conversations on load
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        setConversations(data.data);
        
        // If there's a conversation, set the first one as active
        if (data.data.length > 0) {
          setActiveConversation(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const otherUserId = activeConversation.withUser._id;
        const { data } = await api.get(`/messages/${otherUserId}`);
        setMessages(data.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const receiverId = activeConversation.withUser._id;
      const { data } = await api.post("/messages", {
        receiverId,
        content: newMessage
      });

      // Add new message to the list
      setMessages([...messages, data.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const userName = conv.withUser.userName || conv.withUser.companyName;
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Using mock data for now
  const mockConversations = [
    {
      conversationId: "conv1",
      withUser: {
        _id: "user1",
        role: "employer",
        companyName: "Tech Solutions Pte Ltd",
        email: "hr@techsolutions.com"
      },
      lastMessage: {
        content: "Thank you for your application, we would like to schedule an interview.",
        createdAt: "2024-03-20T08:30:00Z",
        isRead: true
      },
      unreadCount: 0
    },
    {
      conversationId: "conv2",
      withUser: {
        _id: "user2",
        role: "jobseeker",
        userName: "Jane Smith",
        email: "jane.smith@example.com"
      },
      lastMessage: {
        content: "I'm interested in learning more about the position requirements.",
        createdAt: "2024-03-18T14:15:00Z",
        isRead: false
      },
      unreadCount: 2
    },
    {
      conversationId: "conv3",
      withUser: {
        _id: "user3",
        role: "employer",
        companyName: "Creative Studios",
        email: "jobs@creativestudios.com"
      },
      lastMessage: {
        content: "We've reviewed your portfolio and are impressed with your work.",
        createdAt: "2024-03-15T11:20:00Z",
        isRead: true
      },
      unreadCount: 0
    }
  ];

  const mockMessages = [
    {
      _id: "msg1",
      senderId: "user1",
      receiverId: user?.userId,
      content: "Hello! Thank you for your application to the Frontend Developer position.",
      createdAt: "2024-03-19T09:00:00Z"
    },
    {
      _id: "msg2",
      senderId: user?.userId,
      receiverId: "user1",
      content: "Thank you for considering my application. I'm very interested in the role.",
      createdAt: "2024-03-19T09:05:00Z"
    },
    {
      _id: "msg3",
      senderId: "user1",
      receiverId: user?.userId,
      content: "We'd like to schedule an interview with you. Are you available next week?",
      createdAt: "2024-03-19T09:10:00Z"
    },
    {
      _id: "msg4",
      senderId: user?.userId,
      receiverId: "user1",
      content: "Yes, I'm available on Monday and Tuesday afternoon.",
      createdAt: "2024-03-19T09:15:00Z"
    },
    {
      _id: "msg5",
      senderId: "user1",
      receiverId: user?.userId,
      content: "Great! Let's schedule for Tuesday at 2pm. I'll send you a calendar invite with the details.",
      createdAt: "2024-03-20T08:30:00Z"
    }
  ];

  const activeConv = activeConversation || mockConversations[0];
  const currentMessages = messages.length > 0 ? messages : mockMessages;

  return (
    <div className="h-[calc(100vh-76px)] flex flex-col">
      <div className="flex h-full">
        {/* Conversations sidebar */}
        <div className="w-1/3 border-r">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <h2 className="font-semibold text-lg mb-3">Messages</h2>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-180px)]">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <div 
                  key={conv.conversationId} 
                  className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                    activeConv?.conversationId === conv.conversationId ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleConversationSelect(conv)}
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      {conv.withUser.role === 'employer' ? 
                        <Building className="h-5 w-5 text-gray-500" /> : 
                        <User className="h-5 w-5 text-gray-500" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">
                          {conv.withUser.role === 'employer' ? 
                            conv.withUser.companyName : 
                            conv.withUser.userName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold' : 'text-gray-500'}`}>
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 mt-1 inline-block">
                          {conv.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            )}
          </div>
        </div>
        
        {/* Message detail view */}
        <div className="w-2/3 flex flex-col">
          {activeConv ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    {activeConv.withUser.role === 'employer' ? 
                      <Building className="h-5 w-5 text-gray-500" /> : 
                      <User className="h-5 w-5 text-gray-500" />
                    }
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {activeConv.withUser.role === 'employer' ? 
                        activeConv.withUser.companyName : 
                        activeConv.withUser.userName}
                    </h2>
                    <p className="text-sm text-gray-500">{activeConv.withUser.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                  {currentMessages.map((message) => {
                    const isSentByMe = message.senderId === user?.userId;
                    return (
                      <div 
                        key={message._id} 
                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isSentByMe 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white border text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${isSentByMe ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}