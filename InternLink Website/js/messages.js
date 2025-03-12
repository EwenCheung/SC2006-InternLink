// Messages data structure
let currentUser = null;
let selectedUser = null;
let messages = {};

// Initialize the messaging system
document.addEventListener('DOMContentLoaded', () => {
    initializeMessaging();
    setupEventListeners();
    loadDemoData(); // For demonstration purposes
});

// Core initialization
function initializeMessaging() {
    // Demo: Set current user type (this would normally come from login)
    currentUser = {
        id: 'user1',
        name: 'Current User',
        role: 'jobseeker',
        avatar: 'https://via.placeholder.com/40'
    };

    // Load messages from localStorage
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    }

    // Initialize search
    const searchInput = document.querySelector('.search-container input');
    searchInput.addEventListener('input', handleSearch);
}

// Set up event listeners
function setupEventListeners() {
    // Send message on button click
    const sendButton = document.querySelector('.message-input button');
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    const messageInput = document.querySelector('.message-input input');
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // User selection
    const usersList = document.querySelector('.users-list');
    usersList.addEventListener('click', (e) => {
        const userItem = e.target.closest('.user-item');
        if (userItem) {
            selectUser(userItem.dataset.userId);
        }
    });
}

// Handle user search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const userItems = document.querySelectorAll('.user-item');

    userItems.forEach(item => {
        const userName = item.querySelector('h4').textContent.toLowerCase();
        item.style.display = userName.includes(searchTerm) ? 'flex' : 'none';
    });
}

// Select a user to chat with
function selectUser(userId) {
    selectedUser = userId;
    
    // Update UI to show selected user
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.userId === userId) {
            item.classList.add('active');
            
            // Update chat header
            const userName = item.querySelector('h4').textContent;
            const userImg = item.querySelector('img').src;
            updateChatHeader(userName, userImg);
        }
    });

    // Load and display messages
    displayMessages(userId);
}

// Update chat header with selected user info
function updateChatHeader(name, img) {
    const chatHeader = document.querySelector('.chat-header');
    chatHeader.querySelector('img').src = img;
    chatHeader.querySelector('h3').textContent = name;
}

// Display messages for selected user
function displayMessages(userId) {
    const messagesContainer = document.querySelector('.messages-container');
    messagesContainer.innerHTML = '';

    const conversation = messages[`${currentUser.id}-${userId}`] || 
                        messages[`${userId}-${currentUser.id}`] || [];

    conversation.forEach(msg => {
        const messageElement = createMessageElement(msg);
        messagesContainer.appendChild(messageElement);
    });

    scrollToBottom();
}

// Create message element
function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.senderId === currentUser.id ? 'sent' : 'received'}`;
    
    const content = document.createElement('p');
    content.textContent = message.content;
    
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = formatTime(message.timestamp);
    
    div.appendChild(content);
    div.appendChild(time);
    
    return div;
}

// Send a new message
function sendMessage() {
    if (!selectedUser) return;

    const input = document.querySelector('.message-input input');
    const content = input.value.trim();
    
    if (!content) return;

    const newMessage = {
        senderId: currentUser.id,
        receiverId: selectedUser,
        content: content,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };

    // Add message to conversation
    const conversationKey = `${currentUser.id}-${selectedUser}`;
    if (!messages[conversationKey]) {
        messages[conversationKey] = [];
    }
    messages[conversationKey].push(newMessage);

    // Save to localStorage
    localStorage.setItem('messages', JSON.stringify(messages));

    // Update UI
    const messagesContainer = document.querySelector('.messages-container');
    const messageElement = createMessageElement(newMessage);
    messagesContainer.appendChild(messageElement);
    
    // Clear input and scroll
    input.value = '';
    scrollToBottom();

    // Update message status (demo)
    setTimeout(() => updateMessageStatus(newMessage.timestamp, 'delivered'), 1000);
    setTimeout(() => updateMessageStatus(newMessage.timestamp, 'read'), 2000);
}

// Update message status
function updateMessageStatus(timestamp, status) {
    if (!selectedUser) return;
    
    const conversationKey = `${currentUser.id}-${selectedUser}`;
    const conversation = messages[conversationKey];
    
    if (conversation) {
        const message = conversation.find(m => m.timestamp === timestamp);
        if (message) {
            message.status = status;
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }
}

// Scroll to bottom of messages
function scrollToBottom() {
    const messagesContainer = document.querySelector('.messages-container');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Load demo data
function loadDemoData() {
    const demoUsers = [
        { id: 'user2', name: 'John Doe', role: 'employer', lastMessage: 'Interested in the position' },
        { id: 'user3', name: 'Jane Smith', role: 'employer', lastMessage: 'When can you start?' },
        { id: 'user4', name: 'Mike Johnson', role: 'employer', lastMessage: 'Thanks for applying' }
    ];

    const usersList = document.querySelector('.users-list');
    usersList.innerHTML = ''; // Clear existing demo users

    demoUsers.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.dataset.userId = user.id;
        
        userElement.innerHTML = `
            <img src="https://via.placeholder.com/40" alt="${user.name}">
            <div class="user-info">
                <h4>${user.name}</h4>
                <p>${user.lastMessage}</p>
            </div>
        `;
        
        usersList.appendChild(userElement);
    });

    // Add some demo messages
    messages = {
        'user1-user2': [
            {
                senderId: 'user2',
                receiverId: 'user1',
                content: 'Hello, I saw your application',
                timestamp: '2024-03-12T04:00:00Z',
                status: 'read'
            },
            {
                senderId: 'user1',
                receiverId: 'user2',
                content: 'Yes, I\'m very interested in the position',
                timestamp: '2024-03-12T04:01:00Z',
                status: 'read'
            }
        ]
    };

    localStorage.setItem('messages', JSON.stringify(messages));
}
