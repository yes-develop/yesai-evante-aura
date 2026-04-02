// This file contains functions for managing the profile modal, including opening, closing, and updating the modal content.

const profileModal = document.getElementById('profile-modal');
const closeProfile = document.getElementById('close-profile');

function openProfileModal(userData) {
    document.getElementById('profile-avatar').src = userData.avatar;
    document.getElementById('profile-name').textContent = userData.name;

    const statusText = userData.status === 'status-online' ? 'Online' : 
                      userData.status === 'status-away' ? 'Away' : 'Offline';
    const statusColor = userData.status === 'status-online' ? '#4CAF50' : 
                       userData.status === 'status-away' ? '#FFC107' : '#9E9E9E';

    document.getElementById('profile-status').textContent = statusText;
    document.getElementById('profile-status').style.color = statusColor;

    document.getElementById('profile-email').textContent = userData.email;
    document.getElementById('profile-phone').textContent = userData.phone;
    document.getElementById('profile-location').textContent = userData.location;
    document.getElementById('profile-about').textContent = userData.about;

    profileModal.style.display = 'flex';
}

function closeProfileModal() {
    profileModal.style.display = 'none';
}

closeProfile.addEventListener('click', closeProfileModal);

profileModal.addEventListener('click', function(event) {
    if (event.target === profileModal) {
        closeProfileModal();
    }
});

export { openProfileModal, closeProfileModal };