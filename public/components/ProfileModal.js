import React from 'react';
import './modal.css';

const ProfileModal = ({ userData, onClose }) => {
    return (
        <div id="profile-modal" className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>User Profile</h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fa fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="profile-info">
                        <img id="profile-avatar" src={userData.avatar} alt="User Avatar" />
                        <h3 id="profile-name">{userData.name}</h3>
                        <span id="profile-status" className={userData.status}></span>
                    </div>
                    <div className="contact-info">
                        <h4>Contact Information</h4>
                        <p>Email: <span id="profile-email">{userData.email}</span></p>
                        <p>Phone: <span id="profile-phone">{userData.phone}</span></p>
                        <p>Location: <span id="profile-location">{userData.location}</span></p>
                    </div>
                    <div className="about-section">
                        <h4>About</h4>
                        <p id="profile-about">{userData.about}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;