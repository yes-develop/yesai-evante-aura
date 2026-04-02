// Core state management
let currentState = {
    currentConversationId: null,
    aiVisible: true,
    teamVisible: false
};

// Mock data for conversations
const conversations = [
    {
        id: 1,
        name: 'John Doe',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        lastMessage: 'Hey, how are you doing?',
        time: '12:45',
        unread: 3,
        online: true,
        sourceApp: 'messenger',
        assign_to: { name: 'Jane Smith' },
        labels: ['Important']
    }
];

// Mock messages for each conversation
const messages = {
    1: [
        {
            id: 1,
            sender: 'John Doe',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            message: 'Hey, how are you doing?',
            time: '12:45',
            received: true
        },
        {
            id: 2,
            sender: 'Me',
            message: "I'm good! Just finished the project we discussed.",
            time: '12:47',
            received: false
        }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log("App initializing...");
    initializeMessageApp();
    setupDropdownMenu();
    setupPanelTabs();
    setupGlobalEventListeners();
});

function initializeMessageApp() {
    console.log("Initializing message app...");
    
    // Render conversations list
    renderConversationsList();
    
    // Load the first conversation by default
    if (conversations.length > 0) {
        loadConversation(conversations[0].id);
    }
    
    // Render both panels immediately
    renderAISection();
    renderTeamChatSection();
}

function setupDropdownMenu() {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenuContainer = document.querySelector('.dropdown-menu-container');

    if (dropdownToggle && dropdownMenuContainer) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMenuContainer.classList.toggle('active');
            dropdownToggle.classList.toggle('active');
        });

        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                loadSection(section);
            });
        });
    }
}

function setupPanelTabs() {
    const panelTabs = document.querySelectorAll('.panel-tab');
    
    panelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            panelTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const panelContents = document.querySelectorAll('.panel-content');
            panelContents.forEach(content => content.classList.remove('active'));
            
            const panelName = tab.getAttribute('data-panel');
            const selectedPanel = document.getElementById(`${panelName}-panel`);
            if (selectedPanel) {
                selectedPanel.classList.add('active');
            }
        });
    });
}

function setupGlobalEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'overlay') {
            const profileModal = document.getElementById('profile-modal');
            if (profileModal && profileModal.classList.contains('active')) {
                profileModal.classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            }
        }
    });
}

function loadSection(section) {
    console.log(`Loading section: ${section}`);
    updateActiveStates(section);
    
    switch(section) {
        case 'messages':
            break;
        case 'contacts':
            showContactsView();
            break;
        case 'social-apps':
            showSocialAppsPopup();
            break;
        case 'insights':
            showInsightsPanel();
            break;
    }
}

function updateActiveStates(section) {
    document.querySelectorAll('.dropdown-item').forEach(item => {
        const itemSection = item.getAttribute('data-section');
        item.classList.toggle('active', itemSection === section);
    });
}

function renderAISection() {
    const aiPanel = document.getElementById('ai-panel');
    if (!aiPanel) return;

    aiPanel.innerHTML = `
        <div class="ai-section">
            <h3>Smart Suggestions</h3>
            <div class="suggestion-list">
                <div class="suggestion-item">I'll look into that issue and get back to you shortly.</div>
                <div class="suggestion-item">Would you like to schedule a video call to discuss this in more detail?</div>
                <div class="suggestion-item">Let me check our inventory and pricing options for you.</div>
                <div class="suggestion-item">I've attached the document you requested. Please let me know if you need anything else.</div>
            </div>
            
            <h3>Smart Tools</h3>
            <div class="tools-grid">
                <div class="tool-item">
                    <i class="fas fa-file-alt"></i>
                    <span>Summarize</span>
                </div>
                <div class="tool-item">
                    <i class="fas fa-language"></i>
                    <span>Translate</span>
                </div>
                <div class="tool-item">
                    <i class="fas fa-chart-line"></i>
                    <span>Analytics</span>
                </div>
                <div class="tool-item">
                    <i class="fas fa-calendar"></i>
                    <span>Schedule</span>
                </div>
            </div>
        </div>
    `;

    // Add event listeners for suggestions and tools
    aiPanel.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const messageInput = document.getElementById('message-input');
            if (messageInput) {
                messageInput.value = item.textContent;
                messageInput.focus();
            }
        });
    });

    aiPanel.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', () => {
            const toolName = item.querySelector('span').textContent;
            alert(`${toolName} tool will be available soon!`);
        });
    });
}

function renderTeamChatSection() {
    const teamPanel = document.getElementById('team-panel');
    if (!teamPanel) return;

    teamPanel.innerHTML = `
        <div class="team-section">
            <h3>Team Members</h3>
            <div class="team-members-list">
                <div class="team-member">
                    <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Team Member">
                    <div class="member-info">
                        <span class="member-name">John Smith</span>
                        <span class="member-role">Support Agent</span>
                    </div>
                    <span class="online-status"></span>
                </div>
                <!-- Add more team members as needed -->
            </div>

            <h3>Recent Activity</h3>
            <div class="activity-list">
                <div class="activity-item">
                    <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Activity">
                    <div class="activity-content">
                        <span class="activity-text">John assigned a new ticket</span>
                        <span class="activity-time">5 min ago</span>
                    </div>
                </div>
                <!-- Add more activities as needed -->
            </div>
        </div>
    `;
}

// Export functions for use in other files
window.loadSection = loadSection;
window.renderAISection = renderAISection;
window.renderTeamChatSection = renderTeamChatSection; 