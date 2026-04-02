import React from 'react';
import './conversations.css';

const ConversationList = ({ conversations, onSelectConversation }) => {
    return (
        <div className="conversation-list">
            {conversations.map(conversation => (
                <div 
                    key={conversation.id} 
                    className={`conversation ${conversation.active ? 'active' : ''}`} 
                    onClick={() => onSelectConversation(conversation.id)}
                >
                    <div className="conversation-avatar-container">
                        <img src={conversation.avatar} alt={`${conversation.name}'s Avatar`} />
                        <div className={`user-status ${conversation.status}`}></div>
                    </div>
                    <div className="conversation-info">
                        <h3>{conversation.name}</h3>
                        <p>{conversation.lastMessage}</p>
                    </div>
                    <span className="time">{conversation.time}</span>
                </div>
            ))}
        </div>
    );
};

export default ConversationList;