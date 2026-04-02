import React, { useState } from 'react';
import './chat.css';
import { chatData } from '../data/chatData';
import EmojiPicker from '../js/emojiPicker';
import ProfileModal from './ProfileModal';

const ChatSection = () => {
    const [currentConversation, setCurrentConversation] = useState('john');
    const [messageInput, setMessageInput] = useState('');
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            // Logic to send message
            setMessageInput('');
        }
    };

    const loadConversation = (userId) => {
        setCurrentConversation(userId);
        // Logic to load conversation messages
    };

    const toggleProfileModal = () => {
        setShowProfileModal(!showProfileModal);
    };

    const userData = chatData[currentConversation];

    return (
        <div className="chat-section">
            <div className="chat-header">
                <h2>{userData.name}</h2>
                <button onClick={toggleProfileModal}>View Profile</button>
            </div>
            <div className="chat-messages">
                {/* Render chat messages here */}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
                <EmojiPicker />
            </div>
            {showProfileModal && <ProfileModal userData={userData} onClose={toggleProfileModal} />}
        </div>
    );
};

export default ChatSection;