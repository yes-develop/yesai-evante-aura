// chatHandler.js

let currentConversation = 'john';
const chatData = {
    'john': {
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40',
        messages: [
            { sender: 'john', text: 'Hello! I have some questions about your services.', time: '12:40' },
            { sender: 'me', text: 'Hi there! I\'d be happy to help. What would you like to know?', time: '12:42' },
            { sender: 'john', text: 'How much does your premium plan cost?', time: '12:45' }
        ]
    },
    'jane': {
        name: 'Jane Smith',
        avatar: 'https://via.placeholder.com/40',
        messages: [
            { sender: 'jane', text: 'I\'m interested in your product...', time: '09:30' },
            { sender: 'me', text: 'That\'s great! What specific features are you looking for?', time: '09:35' }
        ]
    }
};

function loadConversation(userId) {
    currentConversation = userId;
    const userData = chatData[userId];
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    userData.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = message.sender === 'me' ? 'message sent' : 'message received';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${message.text}</p>
                <span class="time">${message.time}</span>
            </div>
        `;
        chatMessages.appendChild(messageElement);
    });
}

let currentState = {
    currentConversationId: null
};

// ข้อมูล mock จาก app.js (คุณอาจต้องกำหนดเองหรือส่งผ่านพารามิเตอร์)
const messages = {};
const conversations = [];

/**
 * ส่งข้อความในการสนทนาปัจจุบัน
 * @param {string} message - ข้อความที่ต้องการส่ง
 * @param {number} conversationId - ID ของการสนทนา (optional - จะใช้ค่าปัจจุบันถ้าไม่ระบุ)
 */
function sendMessage(message, conversationId) {
    // ถ้าไม่มีข้อความหรือไม่ได้ระบุ ID ของการสนทนา
    if (!message || (!conversationId && !currentState.currentConversationId)) return;
    
    // ใช้ ID ที่ระบุหรือใช้ ID ปัจจุบัน
    const targetConversationId = conversationId || currentState.currentConversationId;

    // Get current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    // Show typing indicator (optional)
    const messagesContainer = document.getElementById('chat-messages-container');
    if (messagesContainer) {
        // อาจเพิ่ม typing indicator ที่นี่
    }

    // Create new message object
    const newMessage = {
        id: Date.now(),
        sender: 'Me',
        message: message,
        time: time,
        received: false
    };

    // Add message to the messages array if exists
    if (messages[targetConversationId]) {
        messages[targetConversationId].push(newMessage);
    }

    // Update UI
    const messageElement = document.createElement('div');
    messageElement.className = 'message sent';
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-text">${message}</div>
            <div class="message-time">${time}</div>
        </div>
    `;

    // Add to appropriate container
    const container = messagesContainer || document.getElementById('chat-messages');
    if (container) {
        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    }

    // ส่วนนี้คุณอาจต้องเพิ่ม function เพื่ออัพเดท UI อื่นๆ ด้วย
    updateConversationIfExists(targetConversationId, message, time);
    
    // Simulate reply ถ้าต้องการ
    return newMessage;
}

// Helper function to update conversation if it exists
function updateConversationIfExists(conversationId, message, time) {
    // อาจเพิ่มโค้ดเพื่ออัพเดทข้อความล่าสุดใน conversation list ที่นี่
    const conversation = conversations.find(c => c.id === parseInt(conversationId));
    if (conversation) {
        conversation.lastMessage = message;
        conversation.time = time;
        
        // อัพเดท UI ถ้าจำเป็น
        const conversationItem = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
        if (conversationItem) {
            const lastMessageEl = conversationItem.querySelector('.conversation-last-message');
            const timeEl = conversationItem.querySelector('.conversation-time');
            
            if (lastMessageEl) lastMessageEl.textContent = message;
            if (timeEl) timeEl.textContent = time;
        }
    }
}

// Set current conversation ID
function setCurrentConversation(conversationId) {
    currentState.currentConversationId = conversationId;
}

// Export functions
export { sendMessage, setCurrentConversation };