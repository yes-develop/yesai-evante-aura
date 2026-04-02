import React from 'react';

const TeamChat = () => {
    return (
        <div className="message-section team-chat side-panel-collapsed" id="team-section">
            <button className="side-panel-toggle" id="team-toggle"><i className="fa fa-chevron-left"></i></button>
            <div className="section-header">
                <h2><i className="fa fa-users"></i> Team Chat</h2>
            </div>
            <div className="section-content">
                <div className="team-chat-messages">
                    <div className="team-message">
                        <img src="https://via.placeholder.com/30" alt="Team Member Avatar" />
                        <div className="team-message-content">
                            <h4>Sarah (Sales)</h4>
                            <p>I've been talking with John Doe. He seems interested in our premium plan.</p>
                            <span className="time">12:30</span>
                        </div>
                    </div>
                    <div className="team-message">
                        <img src="https://via.placeholder.com/30" alt="Team Member Avatar" />
                        <div className="team-message-content">
                            <h4>Mike (Support)</h4>
                            <p>Great! I can help with the technical questions if needed.</p>
                            <span className="time">12:35</span>
                        </div>
                    </div>
                </div>
                <div className="team-chat-input">
                    <input type="text" placeholder="Message your team..." />
                    <button><i className="fa fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    );
};

export default TeamChat;