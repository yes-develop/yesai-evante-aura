const stylesheets = [
    'https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css',
    'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css',
    'https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-rounded/css/uicons-bold-rounded.css'
];

stylesheets.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
});

/**
 * Determine whether a chatMode value represents AI mode.
 * Only explicitly 'manual chat' / 'manual' values are treated as non-AI.
 * Everything else (including 'Active', 'Ai chat', 'Waiting response', 'Resolved', '')
 * is considered AI mode.
 */
function isAiChatMode(chatMode) {
    const mode = (chatMode || '').toLowerCase().trim();
    const manualModes = ['manual chat', 'manual'];
    return !manualModes.includes(mode);
}




// No mock data - using real conversations from Evante API backend
// Feature flag: disable message history backup by default (avoids 501 when n8n is not configured)
window.YESAURA_ENABLE_MESSAGE_HISTORY_BACKUP = (typeof window.YESAURA_ENABLE_MESSAGE_HISTORY_BACKUP !== 'undefined')
    ? window.YESAURA_ENABLE_MESSAGE_HISTORY_BACKUP
    : false;

// URL normalization function for file URLs
function normalizeFileUrl(url) {
    if (!url) return '';

    // If it's already a full GCS URL, use it as-is
    if (url.startsWith('https://storage.googleapis.com/') || url.startsWith('https://storage.cloud.google.com/')) {
        return url;
    }

    // If it's a local storage path, try to extract filename and construct GCS URL
    if (url.startsWith('/storage/chat_files/')) {
        const filename = url.replace('/storage/chat_files/', '');
        return `https://storage.googleapis.com/n8nyesaibucket/chat_files/${filename}`;
    }

    // If it's a storage path without leading slash
    if (url.startsWith('storage/chat_files/')) {
        const filename = url.replace('storage/chat_files/', '');
        return `https://storage.googleapis.com/n8nyesaibucket/chat_files/${filename}`;
    }

    // If it's a filename only (like the failing ones), try to construct proper GCS URL
    if (!url.startsWith('http') && !url.startsWith('/')) {
        return `https://storage.googleapis.com/n8nyesaibucket/chat_files/${url}`;
    }

    // Handle Google Drive links - Use local proxy for reliability
    if (typeof url === 'string' && url.includes('drive.google.com')) {
        const idMatch = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
        if (idMatch) {
            return `/drive-proxy.php?id=${idMatch[1]}&type=thumbnail`;
        }
    }

    return url;
}

// ── Google Drive filename resolution ────────────────────────────────────────
// In-memory cache: driveId → filename (null if not found)
if (!window._driveFilenameCache) window._driveFilenameCache = new Map();

/**
 * Fetch the real filename for a Google Drive file ID via drive-proxy.php.
 * Results are cached so each ID is only fetched once per page load.
 * @param {string} driveId  The Google Drive file ID
 * @returns {Promise<string|null>} Filename or null if unavailable
 */
async function fetchDriveFilename(driveId) {
    if (window._driveFilenameCache.has(driveId)) {
        return window._driveFilenameCache.get(driveId);
    }
    try {
        const res = await fetch(`/drive-proxy.php?id=${encodeURIComponent(driveId)}&type=filename`);
        if (res.ok) {
            const data = await res.json();
            const name = data.filename || null;
            window._driveFilenameCache.set(driveId, name);
            return name;
        }
    } catch (e) {
        console.warn('fetchDriveFilename failed:', driveId, e);
    }
    window._driveFilenameCache.set(driveId, null);
    return null;
}

/**
 * After a file-item is rendered with a placeholder name,
 * resolve the real Drive filename and update the DOM element.
 * @param {string} driveId
 */
function resolveDriveFilenameInDom(driveId) {
    fetchDriveFilename(driveId).then(name => {
        if (!name) return;
        // Update all .file-name elements that still carry this driveId
        document.querySelectorAll(`.file-name[data-drive-id="${driveId}"]`).forEach(el => {
            el.textContent = name;
        });
    });
}
// ────────────────────────────────────────────────────────────────────────────

// Function to get next chatSequence for a user
async function getNextChatSequence(lineUuid) {
    try {
        const response = await fetch(`/api/next-chat-sequence/${lineUuid}`);
        const result = await response.json();
        if (result.success) {
            return result.chatSequence;
        }
    } catch (error) {
        console.warn('Failed to get next chat sequence:', error);
    }
    // Fallback to 1 if API fails
    return 1;
}

// Message history backup via n8n (async, non-blocking)
async function backupToSheets(messageData) {
    try {
        // Skip when feature is disabled or endpoint not configured
        if (!window.YESAURA_ENABLE_MESSAGE_HISTORY_BACKUP) {
            return { success: true, skipped: true };
        }
        if (!messageData.lineUuid || !messageData.chatSequence) {
            return { success: false, message: 'Missing lineUuid or chatSequence' };
        }

        const payload = {
            lineUuid: messageData.lineUuid,
            chatSequence: messageData.chatSequence,
            userInput: messageData.userInput || messageData.message || '',
            aiResponse: messageData.aiResponse || '',
            timestamp: messageData.time || messageData.date || new Date().toISOString(),
            linkImage: messageData.linkImage || '',
            chatMode: messageData.chatMode || '',
            aiRead: messageData.aiRead || '',
            messageChannel: messageData.messageChannel || '',
            messageId: messageData.messageId || '',
            displayName: messageData.displayName || '',
            source: 'backoffice'
        };

        console.debug('🔄 Sending message history to backend proxy', payload);

        const response = await fetch('/api/n8n/message-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No response body');
            console.warn('n8n message history webhook failed:', response.status, response.statusText, errorText);
            return { success: false, status: response.status, message: response.statusText, body: errorText };
        }

        let data = null;
        try {
            data = await response.json();
        } catch (err) {
            // n8n may return empty body; ignore JSON parse errors
        }

        return { success: true, data };
    } catch (error) {
        console.warn('n8n message history webhook error:', error);
        return { success: false, message: error?.message || 'Unknown error' };
    }
}

// Enhanced image error handler for missing files
function handleImageLoadError(imgElement, originalUrl, fallbackText = 'Image not found') {
    if (imgElement && !imgElement.dataset.errorHandled) {
        imgElement.dataset.errorHandled = 'true';

        // Try to find alternative path if original failed
        if (originalUrl && !originalUrl.startsWith('https://storage.googleapis.com/')) {
            const normalizedUrl = normalizeFileUrl(originalUrl);
            if (normalizedUrl !== originalUrl) {
                imgElement.src = normalizedUrl;
                return; // Give the normalized URL a chance
            }
        }

        // If all else fails, show placeholder
        imgElement.outerHTML = `<div class="file-placeholder" style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; color: #666; border: 2px dashed #ccc;">
            <i class="fas fa-image" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
            ${fallbackText}
        </div>`;

        console.warn('Image failed to load:', originalUrl);
    }
}

// Current state
let currentState = {
    currentConversationId: null,
    aiVisible: false,
    teamVisible: false
};

// Improved Assignment Manager
class AssignmentManager {
    constructor() {
        this.assignments = new Map();
        this.teamMembers = [];
        this.observers = new Set();
        this.isLoading = false;
        this.currentUser = null;

        // Load from localStorage on init
        this.loadFromStorage();

        // Initialize data in proper sequence
        this.initializeUserAndData().catch(error => {
            console.error('Assignment manager initialization failed:', error);
        });
    }

    // Load assignments from localStorage (fallback only)
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('chat_assignments');
            if (stored) {
                const data = JSON.parse(stored);
                // Only load if data is recent (less than 5 minutes old)
                const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
                if (data.timestamp && data.timestamp > fiveMinutesAgo) {
                    this.assignments = new Map(data.assignments || []);
                    this.teamMembers = data.teamMembers || [];
                    console.log('📦 Loaded recent assignments from localStorage');
                } else {
                    console.log('📦 localStorage data is stale, will fetch from database');
                }
            }
        } catch (e) {
            console.error('Error loading assignments from storage:', e);
        }
    }

    // Save to localStorage
    saveToStorage() {
        try {
            const data = {
                assignments: Array.from(this.assignments.entries()),
                teamMembers: this.teamMembers,
                timestamp: Date.now()
            };
            localStorage.setItem('chat_assignments', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving assignments to storage:', e);
        }
    }

    // Initialize user and data in sequence
    async initializeUserAndData() {
        try {
            console.log('🚀 === ASSIGNMENT MANAGER INITIALIZATION START ===');

            console.log('🗄 Step 1: Fetching current user...');
            await this.fetchCurrentUser();
            console.log('🗄 Step 1 RESULT - Current User:', this.currentUser);

            console.log('👥 Step 2: Fetching team members...');
            await this.fetchTeamMembers();
            console.log('👥 Step 2 RESULT - Team Members:', this.teamMembers.length);

            console.log('📛 Step 3: Loading assignments from database...');
            await this.loadAssignmentsFromDatabase();
            console.log('📛 Step 3 RESULT - Assignments:', this.assignments.size);

            console.log('✅ === ASSIGNMENT MANAGER FULLY INITIALIZED ===');
            console.log('📊 FINAL STATE:', {
                currentUser: this.currentUser,
                isAdmin: this.canSeeAllConversations(),
                teamMembersCount: this.teamMembers.length,
                assignmentsCount: this.assignments.size
            });

            // Notify that everything is ready
            this.notifyObservers('fullInitializationComplete');

        } catch (error) {
            console.error('❌ === ASSIGNMENT MANAGER INITIALIZATION FAILED ===');
            console.error('Error details:', error);
            // Still try to render conversations for admin users
            this.notifyObservers('initializationFailed', { error });
        }
    }

    // Fetch current user information
    async fetchCurrentUser() {
        console.log('🔄 Fetching user data from server...');

        // Clear any existing cached data first
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;

        // Fetch directly from server endpoint
        try {
            const response = await fetch('/current-user', {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            if (response.ok) {
                const serverUser = await response.json();
                console.log('🔍 RAW server response:', serverUser);

                if (serverUser) {
                    // Handle different response formats
                    if (serverUser.user) {
                        this.currentUser = serverUser.user;
                    } else {
                        this.currentUser = serverUser;
                    }

                    console.log('👤 ✅ Current user loaded from server:', this.currentUser);

                    // DEBUGGING: Set up watcher to detect when currentUser changes
                    this.setupUserWatcher();
                } else {
                    console.log('⚠️ Server returned empty user data');
                }
            }
        } catch (error) {
            console.error('❌ Error fetching user from server:', error);
            // No fallback - server should be the source of truth
        }

        // Optimistically append an outgoing message to the UI immediately
        function appendOutgoingMessageOptimistic(lineUuid, text, isoTime, threadId) {
            const messagesContainer = document.getElementById('chat-messages-container');
            if (!messagesContainer) return;

            // Build an ID compatible with loadConversation's dedupe scheme
            const messageId = `RESPONSE-${threadId}_outgoing-${isoTime}`;
            if (document.querySelector(`[data-message-id="${messageId}"]`)) {
                return; // already present
            }

            const messageElement = document.createElement('div');
            messageElement.className = 'message sent';
            messageElement.setAttribute('data-message-id', messageId);
            messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-text">${text || ''}</div>
        </div>
        <div class="message-time">${formatMessageTime(isoTime)}</div>
    `;

            messagesContainer.appendChild(messageElement);
            messageElement.scrollIntoView({ behavior: 'smooth' });

            // Update conversation preview instantly
            try { updateConversationLastMessage(lineUuid, text, isoTime); } catch { }
        }

        // Simple role normalization - trust server data
        if (this.currentUser) {
            // Ensure ID is a string
            if (this.currentUser.id != null) {
                this.currentUser.id = String(this.currentUser.id);
            }

            // Use role from server, fallback to user_type if needed
            if (!this.currentUser.role && this.currentUser.user_type) {
                this.currentUser.role = this.currentUser.user_type;
            }

            // Normalize role value
            if (this.currentUser.role) {
                this.currentUser.role = this.currentUser.role.toLowerCase();
            }

            // Add username if not present
            if (!this.currentUser.username) {
                this.currentUser.username = this.currentUser.name;
            }
        } else {
            console.log('❌ No current user data after server fetch!');
        }

    }

    // DEBUGGING: Setup watcher to detect unauthorized user changes
    setupUserWatcher() {
        const originalCurrentUser = this.currentUser;
        console.log('🔍 Setting up user watcher for:', originalCurrentUser);

        // Create a getter/setter to trap changes
        let _currentUser = this.currentUser;
        Object.defineProperty(this, 'currentUser', {
            get() {
                return _currentUser;
            },
            set(newValue) {
                if (newValue && newValue !== _currentUser) {
                    console.log('🚨 UNAUTHORIZED USER CHANGE DETECTED!');
                    console.log('🔴 Old user:', _currentUser);
                    console.log('🔴 New user:', newValue);
                    console.log('🔍 Stack trace of the change:');
                    console.trace();

                    // If someone tries to set it to Ploypnd, block it
                    if (newValue && (newValue.name === 'Ploypnd Sales' || newValue.username === 'Ploypnd')) {
                        console.log('🛑 BLOCKING Ploypnd user override!');
                        return; // Don't set the value
                    }
                }
                _currentUser = newValue;
            }
        });
    }

    // Check if current user can see all conversations (admin) or only assigned ones
    canSeeAllConversations() {
        if (!this.currentUser) {
            console.log('❌ No current user, not admin');
            return false;
        }

        const roleLower = String(this.currentUser.role || this.currentUser.user_type || '').toLowerCase();
        const isAdmin = roleLower === 'admin';

        console.log('🔍 Admin check:', {
            currentUser: !!this.currentUser,
            role: this.currentUser.role,
            user_type: this.currentUser.user_type,
            roleLower,
            isAdmin,
            username: this.currentUser.username
        });

        return isAdmin;
    }

    // Check if current user can see a specific conversation
    canSeeConversation(lineUuid) {
        // Admin can see all conversations
        if (this.canSeeAllConversations()) {
            return true;
        }

        // Sales users can only see assigned conversations
        if (this.currentUser) {
            // If assignments are still loading, allow admin to see all, but sales users need to wait
            if (this.isLoading && !this.canSeeAllConversations()) {
                console.log(`⏳ Assignments loading for sales user, hiding conversation ${lineUuid}`);
                return false;
            }

            const assignment = this.assignments.get(lineUuid);

            // Check both user ID and username for matching
            const matchesUserId = !!assignment && assignment.userId === String(this.currentUser.id);
            const matchesUsername = !!assignment && assignment.userName === this.currentUser.username;
            const matchesName = !!assignment && assignment.userName === this.currentUser.name;
            const canSee = matchesUserId || matchesUsername || matchesName;

            return canSee;
        }

        // If no user or unknown role, hide conversation
        return false;
    }

    // Fetch team members from database
    async fetchTeamMembers() {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            const response = await fetch('/team-members', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.teamMembers = await response.json();
                console.log('Team members loaded from database:', this.teamMembers);
                this.saveToStorage();
                this.notifyObservers('teamMembersUpdated');
            } else {
                console.error('Failed to fetch team members:', response.status, response.statusText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            // Only use fallback if absolutely necessary
            console.log('Using fallback team members due to fetch error');
            this.teamMembers = [];
        } finally {
            this.isLoading = false;
        }
    }

    // Get assignment for a conversation
    getAssignment(lineUuid) {
        const assignment = this.assignments.get(lineUuid) || null;

        // Assignment lookup (debug logging disabled in production)

        return assignment;
    }

    // Set assignment for a conversation
    async setAssignment(lineUuid, teamMember) {
        // Prevent multiple simultaneous assignments
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        const oldAssignment = this.assignments.get(lineUuid);

        try {
            if (teamMember) {
                this.assignments.set(lineUuid, {
                    userId: teamMember.id,
                    userName: teamMember.name,
                    userRole: teamMember.role,
                    assignedAt: new Date().toISOString()
                });
            } else {
                this.assignments.delete(lineUuid);
            }

            // Save to storage immediately
            this.saveToStorage();

            // Update UI immediately (optimistic update)
            this.updateConversationUI(lineUuid);

            // Persist to database
            if (teamMember) {
                await this.persistToDatabase(lineUuid, teamMember.id);
            } else {
                await this.unassignInDatabase(lineUuid);
            }

            // Notify observers ONLY after successful database update
            this.notifyObservers('assignmentChanged', { lineUuid, assignment: this.assignments.get(lineUuid) });

            const shouldRefreshList = typeof this.canSeeAllConversations === 'function'
                ? !this.canSeeAllConversations()
                : true;

            // Sales users rely on list filtering, admins can stay in-place without a full rerender
            // Only rebuild if not yet initialized (prevent badge flash on assignment changes)
            if (shouldRefreshList && !window._conversationsInitialized && typeof renderConversationsList === 'function') {
                setTimeout(() => renderConversationsList(), 100);
            }

        } catch (error) {
            console.error('Assignment failed:', error);
            // Revert on error
            if (oldAssignment) {
                this.assignments.set(lineUuid, oldAssignment);
            } else {
                this.assignments.delete(lineUuid);
            }
            this.saveToStorage();
            this.updateConversationUI(lineUuid);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    // Persist assignment to database
    async persistToDatabase(lineUuid, userId) {
        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
            document.querySelector('input[name="_token"]')?.value || '';

        const makeRequest = async (token) => {
            return await fetch('/assign-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({
                    line_uuid: lineUuid,
                    user_id: userId
                })
            });
        };

        let response = await makeRequest(csrfToken);

        // If CSRF token is invalid, try to refresh and retry once
        if (response.status === 419) {
            console.log('🔄 CSRF token expired, refreshing and retrying...');
            const newToken = await window.refreshCSRFToken();
            if (newToken) {
                response = await makeRequest(newToken);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Failed to assign: ${errorData.message || response.statusText}`);
        }

        return response.json();
    }

    // Unassign in database
    async unassignInDatabase(lineUuid) {
        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
            document.querySelector('input[name="_token"]')?.value || '';

        const makeRequest = async (token) => {
            return await fetch('/unassign-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({ line_uuid: lineUuid })
            });
        };

        let response = await makeRequest(csrfToken);

        // If CSRF token is invalid, try to refresh and retry once
        if (response.status === 419) {
            console.log('🔄 CSRF token expired, refreshing and retrying...');
            const newToken = await window.refreshCSRFToken();
            if (newToken) {
                response = await makeRequest(newToken);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Failed to unassign: ${errorData.message || response.statusText}`);
        }

        return response.json();
    }

    // Update conversation UI efficiently
    updateConversationUI(lineUuid) {
        const assignment = this.assignments.get(lineUuid);
        const elements = document.querySelectorAll(`[data-id="${lineUuid}"], [data-line-uuid="${lineUuid}"]`);

        elements.forEach(element => {
            // Update assignment placeholder
            const placeholder = element.querySelector('.assignment-placeholder, .assign-to');
            if (placeholder) {
                if (assignment) {
                    placeholder.innerHTML = `
                        <div class="assigned-user-display" data-user-id="${assignment.userId}">
                            <span>${assignment.userName} <small class="role-label">${assignment.userRole}</small></span>
                        </div>
                    `;
                } else {
                    placeholder.innerHTML = `
                        <div class="not-assigned-display">
                            <span>Not assigned</span>
                        </div>
                    `;
                }
            }

            // Update data attributes
            if (assignment) {
                element.dataset.assignedTeam = assignment.userName;
                element.dataset.assignedUserId = assignment.userId;
            } else {
                delete element.dataset.assignedTeam;
                delete element.dataset.assignedUserId;
            }
        });
    }

    // Show assignment dropdown
    showDropdown(lineUuid, targetElement) {
        // Remove existing dropdowns
        document.querySelectorAll('.assignment-dropdown').forEach(el => el.remove());

        const dropdown = this.createDropdownElement(lineUuid);
        this.positionDropdown(dropdown, targetElement);
        document.body.appendChild(dropdown);
        dropdown.style.display = 'block';

        this.setupDropdownEvents(dropdown, lineUuid);
    }

    // Create dropdown element
    createDropdownElement(lineUuid) {
        const dropdown = document.createElement('div');
        dropdown.className = 'assignment-dropdown';

        const currentAssignment = this.assignments.get(lineUuid);

        let html = `
            <div class="dropdown-header">Assign to Team Member</div>
            <div class="dropdown-items">
                <div class="dropdown-item unassign ${!currentAssignment ? 'active' : ''}" data-action="unassign">
                    <span>Unassign</span>
                </div>
        `;

        this.teamMembers.forEach(member => {
            let isActive = false;

            if (currentAssignment) {
                // Check by user ID (handle string/number conversion)
                isActive = (
                    currentAssignment.userId === member.id ||
                    currentAssignment.userId == member.id ||
                    String(currentAssignment.userId) === String(member.id)
                );

                // If not matched by ID, try by name
                if (!isActive) {
                    isActive = (
                        currentAssignment.userName === member.name ||
                        currentAssignment.assignUser === member.name
                    );
                }
            }

            html += `
                <div class="members-dropdown-item ${isActive ? 'active' : ''}" data-user-id="${member.id}" data-action="assign">
                    <span>${member.name} <small>${member.role}</small></span>
                </div>
            `;
        });

        html += '</div>';
        dropdown.innerHTML = html;

        return dropdown;
    }

    // Position dropdown
    positionDropdown(dropdown, targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const dropdownHeight = 200; // Estimated dropdown height
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        dropdown.style.position = 'absolute';
        dropdown.style.zIndex = '1000';

        // Position dropdown above if not enough space below
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            dropdown.style.bottom = `${viewportHeight - rect.top - window.scrollY}px`;
            dropdown.style.top = 'auto';
        } else {
            dropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;
            dropdown.style.bottom = 'auto';
        }

        // Horizontal positioning with viewport edge detection
        const dropdownWidth = 250;
        const spaceRight = window.innerWidth - rect.left;

        if (spaceRight < dropdownWidth) {
            dropdown.style.right = `${window.innerWidth - rect.right - window.scrollX}px`;
            dropdown.style.left = 'auto';
        } else {
            dropdown.style.left = `${rect.left + window.scrollX}px`;
            dropdown.style.right = 'auto';
        }
    }

    // Setup dropdown events
    setupDropdownEvents(dropdown, lineUuid) {
        let isProcessing = false;

        // Click events for dropdown items
        dropdown.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const item = e.target.closest('.dropdown-item, .members-dropdown-item');
            if (!item || isProcessing) return;

            isProcessing = true;
            const action = item.dataset.action;

            try {
                // Show loading state
                item.style.opacity = '0.6';
                item.style.pointerEvents = 'none';

                if (action === 'assign') {
                    const userId = item.dataset.userId;
                    const teamMember = this.teamMembers.find(m => String(m.id) === String(userId));
                    if (teamMember) {
                        await this.setAssignment(lineUuid, teamMember);
                    }
                } else if (action === 'unassign') {
                    await this.setAssignment(lineUuid, null);
                }

                // Close dropdown after successful assignment
                dropdown.remove();

            } catch (error) {
                console.error('Assignment failed:', error);
                alert('Failed to update assignment. Please try again.');

                // Reset item state
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
            } finally {
                isProcessing = false;
            }
        });

        // Close dropdown when clicking outside
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeHandler);
            }
        };

        // Add close handler after a small delay
        setTimeout(() => {
            document.addEventListener('click', closeHandler);
        }, 100);
    }

    // Observer pattern for UI updates
    addObserver(callback) {
        this.observers.add(callback);
    }

    removeObserver(callback) {
        this.observers.delete(callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
    }

    // Get team members list
    getTeamMembers() {
        return this.teamMembers;
    }

    // Bulk load assignments from database
    async loadAssignmentsFromDatabase() {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            console.log('🔄 Loading assignments from database...');
            const response = await fetch('/chat-assignments', {
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('📡 Assignments response status:', response.status);

            if (response.ok) {
                const assignments = await response.json();
                console.log('📋 Raw assignments response:', assignments);
                console.log('📊 Assignment count:', Array.isArray(assignments) ? assignments.length : 'Not an array');

                if (Array.isArray(assignments)) {
                    // Clear existing assignments before loading new ones
                    this.assignments.clear();

                    assignments.forEach(assignment => {
                        if (assignment.line_uuid && assignment.assigned_user_name) {
                            const assignmentData = {
                                userId: String(assignment.user_id),
                                userName: assignment.assigned_user_name,
                                userRole: assignment.user_role || 'Sales',
                                assignedAt: assignment.updated_at || new Date().toISOString()
                            };

                            this.assignments.set(assignment.line_uuid, assignmentData);

                            // Dynamic debug logging for assignments
                            if (window.debugAssignments) {
                                console.log(`Assignment loaded:`, {
                                    lineUuid: assignment.line_uuid,
                                    assignmentData,
                                    rawAssignment: assignment
                                });
                            }
                        }
                    });

                    this.saveToStorage();
                    console.log('🔄 Assignments loaded and saved. Total:', this.assignments.size);

                    // Only refresh if not yet initialized (prevent badge flash)
                    if (!window._conversationsInitialized) {
                        setTimeout(() => {
                            if (typeof renderConversationsList === 'function') {
                                renderConversationsList();
                            }
                        }, 100);
                    }

                    // Debug: log all assignments for troubleshooting
                    console.log('📋 All loaded assignments:', Array.from(this.assignments.entries()));


                    // Update UI for all loaded assignments
                    this.assignments.forEach((assignment, lineUuid) => {
                        this.updateConversationUI(lineUuid);
                    });

                    this.notifyObservers('assignmentsLoaded');
                }
            } else {
                const errorText = await response.text();
                console.warn('❌ Failed to load assignments from database:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText
                });
            }
        } catch (error) {
            console.error('Error loading assignments from database:', error);
        } finally {
            this.isLoading = false;
        }
    }

}


// Initialize global assignment manager
window.assignmentManager = new AssignmentManager();


// Add CSS styles for assignment dropdown
const assignmentDropdownStyles = document.createElement('style');
assignmentDropdownStyles.textContent = `
    .assignment-dropdown {
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 200px;
        max-width: 300px;
        display: none;
        z-index: 10000;
    }
    
    .assignment-dropdown .dropdown-header {
        padding: 12px 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
        font-weight: 600;
        font-size: 14px;
        color: #333;
        border-radius: 8px 8px 0 0;
    }
    
    .assignment-dropdown .dropdown-content {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .assignment-dropdown .dropdown-item {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s;
    }
    
    .assignment-dropdown .dropdown-item:hover {
        background-color: #f8f9fa;
    }
    
    .assignment-dropdown .dropdown-item:last-child {
        border-bottom: none;
        border-radius: 0 0 8px 8px;
    }
    
    .assignment-dropdown .member-name {
        display: block;
        font-weight: 500;
        color: #333;
        margin-bottom: 2px;
    }
    
    .assignment-dropdown .member-role {
        display: block;
        color: #666;
        font-size: 12px;
    }
`;
document.head.appendChild(assignmentDropdownStyles);


// Session cleanup functions
window.clearAllCaches = function () {
    console.log('🧿 Clearing all caches and session data...');

    try {
        // Clear all storage
        sessionStorage.clear();
        localStorage.clear();

        // Clear assignment manager data
        if (window.assignmentManager) {
            window.assignmentManager.assignments.clear();
            window.assignmentManager.teamMembers = [];
            window.assignmentManager.currentUser = null;
        }

        // Clear other global variables
        if (window.optimisticAssignments) {
            window.optimisticAssignments.clear();
        }
        if (window.latestMessages) {
            window.latestMessages.clear();
        }
        if (window.userProfiles) {
            window.userProfiles.clear();
        }

        console.log('✅ All caches cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing caches:', error);
    }
};

// CSRF token refresh function
window.refreshCSRFToken = async function () {
    console.log('🔄 Refreshing CSRF token...');
    try {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.csrf_token) {
                // Update meta tag
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.setAttribute('content', data.csrf_token);
                    console.log('✅ CSRF token refreshed successfully');
                } else {
                    // Create meta tag if it doesn't exist
                    const newMetaTag = document.createElement('meta');
                    newMetaTag.setAttribute('name', 'csrf-token');
                    newMetaTag.setAttribute('content', data.csrf_token);
                    document.head.appendChild(newMetaTag);
                    console.log('✅ CSRF token meta tag created');
                }
                return data.csrf_token;
            }
        } else {
            console.warn('⚠️ Failed to refresh CSRF token:', response.status);
        }
    } catch (error) {
        console.error('❌ Error refreshing CSRF token:', error);
    }
    return null;
};

// Auto-cleanup on page visibility change (when user navigates away)
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        // Don't clear on every tab switch, only on actual navigation
        console.log('📌 Page hidden, preparing for potential cleanup');
    }
});

// Cleanup on beforeunload (when user closes tab or navigates away)
window.addEventListener('beforeunload', function () {
    console.log('🗿 Page unloading, clearing session data');
    // Clear session storage but not local storage (which persists across sessions)
    try {
        sessionStorage.clear();
    } catch (error) {
        console.error('Error clearing session storage:', error);
    }
});

// Detect logout and clear caches
const originalFetch = window.fetch;
window.fetch = function (...args) {
    return originalFetch.apply(this, args).then(response => {
        // If we get 419 (CSRF token mismatch) or 401 (unauthorized), clear caches
        if (response.status === 419 || response.status === 401) {
            console.log('🚫 Detected authentication issue (', response.status, '), clearing caches');
            window.clearAllCaches();

            // Try to refresh CSRF token
            if (response.status === 419) {
                window.refreshCSRFToken();
            }
        }

        // Check if this is a logout request
        const url = args[0];
        if (typeof url === 'string' && (url.includes('/logout') || url.includes('/auth/logout'))) {
            console.log('🚫 Logout detected, clearing all caches');
            setTimeout(() => {
                window.clearAllCaches();
            }, 100);
        }

        return response;
    }).catch(error => {
        console.error('Fetch error:', error);
        throw error;
    });
};



// Manual logout cleanup function
window.logout = function () {
    console.log('🚫 Manual logout triggered, clearing all data...');

    // Clear all caches
    window.clearAllCaches();

    // Redirect to logout endpoint or login page
    try {
        // Try to call logout endpoint
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            }
        }).then(() => {
            // Redirect to login page
            window.location.href = '/login';
        }).catch(() => {
            // If logout endpoint fails, just redirect
            window.location.href = '/login';
        });
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if logout fails
        window.location.href = '/login';
    }
};

// Function to clean up on authentication state changes
window.handleAuthStateChange = function () {
    console.log('🔄 Authentication state changed, refreshing data...');

    // Clear old cached data
    window.clearAllCaches();

    // Reinitialize assignment manager
    if (window.assignmentManager) {
        window.assignmentManager.initializeUserAndData().catch(error => {
            console.error('Failed to reinitialize after auth change:', error);
        });
    }

    // Refresh CSRF token
    window.refreshCSRFToken();
};

// Listen for storage events (in case user logs out in another tab)
window.addEventListener('storage', function (e) {
    if (e.key === 'logout' || e.key === 'currentUser') {
        console.log('💾 Storage event detected, handling auth state change');
        window.handleAuthStateChange();
    }
});

// Add convenience function to add to logout buttons
window.addLogoutHandler = function (selector) {
    const logoutButtons = document.querySelectorAll(selector);
    logoutButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            window.logout();
        });
    });
    console.log(`Added logout handlers to ${logoutButtons.length} elements`);
};






// Observer already added in DOMContentLoaded - prevent duplicate observers

// Add improved CSS for assignment dropdown
const assignmentStyles = document.createElement('style');
assignmentStyles.textContent = `
    .assignment-dropdown {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        width: 250px;
        overflow: hidden;
        border: 1px solid #e1e5e9;
        z-index: 1000;
        animation: dropdownFadeIn 0.2s ease-out;
        transform-origin: top;
    }
    
    @keyframes dropdownFadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    .assignment-dropdown .dropdown-header {
        padding: 12px 16px;
        font-weight: 600;
        border-bottom: 1px solid #e1e5e9;
        color: #333;
        font-size: 14px;
        background: #f8f9fa;
    }
    .assignment-dropdown .dropdown-items {
        max-height: 300px;
        overflow-y: auto;
    }
    .assignment-dropdown .dropdown-item {
        padding: 10px 16px;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        position: relative;
    }
    .assignment-dropdown .dropdown-item:hover {
        background: #f0f7ff;
    }
    .assignment-dropdown .dropdown-item.active {
        background: #e6f3ff;
        color: #1890ff;
        font-weight: 600;
        border-left: 3px solid #1890ff;
    }
    .assignment-dropdown .dropdown-item.active::after {
        content: '✓';
        position: absolute;
        right: 16px;
        color: #1890ff;
        font-weight: bold;
        font-size: 14px;
    }
    .assignment-dropdown .members-dropdown-item {
        padding: 10px 16px;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        position: relative;
    }
    .assignment-dropdown .members-dropdown-item:hover {
        background: #f0f7ff;
    }
    .assignment-dropdown .members-dropdown-item.active {
        background: #e6f3ff;
        color: #1890ff;
        font-weight: 600;
        border-left: 3px solid #1890ff;
    }
    .assignment-dropdown .members-dropdown-item.active::after {
        content: '✓';
        position: absolute;
        right: 16px;
        color: #1890ff;
        font-weight: bold;
        font-size: 14px;
    }
    .assignment-dropdown .dropdown-item img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-right: 12px;
        object-fit: cover;
        border: 2px solid #e1e5e9;
    }
    .assignment-dropdown .dropdown-item.unassign {
        border-bottom: 1px solid #e1e5e9;
        color: #666;
        margin-bottom: 4px;
    }
    .assignment-dropdown .dropdown-item.unassign img {
        border-color: #ccc;
        opacity: 0.7;
    }
    .assignment-dropdown .dropdown-item small {
        font-size: 11px;
        opacity: 0.7;
        margin-left: 6px;
        color: #666;
    }
    .assignment-dropdown .dropdown-item span {
        font-size: 14px;
        line-height: 1.4;
    }
    
    /* Improved assignment display in conversation items */
    .assigned-user-display {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        background: #fff7f0ff;
        border-radius: 25px;
    }
    .assigned-user-display img {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        margin-right: 6px;
    }
    .assigned-user-display span {
        font-size: 12px;
        color: #000000ff;
    }
    .assigned-user-display .role-label {
        font-size: 10px;
        opacity: 0.8;
        margin-left: 4px;
    }
    
    .not-assigned-display {
        padding: 4px 8px;
        background: #f5f5f5;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
    }
    .not-assigned-display span {
        font-size: 12px;
        color: #999;
    }
    
    /* Clickable assignment elements */
    .assign-to, .assignment-placeholder {
        cursor: pointer;
        transition: opacity 0.2s ease;
    }
    .assign-to:hover, .assignment-placeholder:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(assignmentStyles);

// Add chat mode toggle styles globally to ensure they're always available
const toggleStyles = document.createElement('style');
toggleStyles.textContent = `

    .chat-mode-toggle {
    margin-top: 20px;
    }
    
    .toggle-wrapper {
        width: 50px;
        height: 22px;
        background: #eee;
        border-radius: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        font-family: 'Nunito', sans-serif;
        user-select: none;
    }

    .slider {
        position: absolute;
        width: 15px;
        height: 15px;
        background: #ffffffff;
        border-radius: 50%;
        transition: all 0.3s ease;
        z-index: 1;
        left: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .toggle-wrapper.manual .slider {
        left: 5px;
        top: 50%;
        transform: translateY(-50%);
    }

    .toggle-wrapper.ai .slider {
        left: 30px;
        top: 50%;
        transform: translateY(-50%);
    }

    .option {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
        color: #666;
        font-size: 11px;
        font-weight: 300;
        position: relative;
    }

    .toggle-wrapper .option {
        color: #666;
    }

    .toggle-wrapper.ai .ai-option {
        position: absolute;
        color: #666;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
    }

    .toggle-wrapper.manual .manual-option {
        position: absolute;
        color: #666;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
    }

    .toggle-wrapper.ai .manual-option {
        display: none;
    }

    .toggle-wrapper.manual .ai-option {
        display: none;
    }

    .toggle-wrapper.ai .ai-option,
    .toggle-wrapper.manual .manual-option {
        color: #666;
    }

    .toggle-wrapper.ai {
        background: #f6ff00d5;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .toggle-wrapper.manual {
        width: 63px;
        height: 22px;
        background: #eee;
        border-radius: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        font-family: 'Nunito', sans-serif;
        transition: all 0.3s ease;
        user-select: none;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(toggleStyles);

// Remove empty state if conversations exist (runs every 5s to reduce overhead)
setInterval(() => {
    const conversations = document.querySelectorAll('.conversation-item');
    const emptyStates = document.querySelectorAll('.empty-state');

    // If conversations exist but empty state is showing, remove it
    if (conversations.length > 0 && emptyStates.length > 0) {
        console.log('🚨 Removing empty state - conversations exist!');
        emptyStates.forEach(empty => empty.remove());
    }
}, 5000);

// Add global event delegation for conversation clicks (fixes click issue for dynamically added conversations)
document.addEventListener('click', (e) => {
    const conversationItem = e.target.closest('.conversation-item');
    if (conversationItem) {
        // Don't load conversation if clicking on the toggle or assignment area
        if (e.target.closest('.chat-mode-toggle') || e.target.closest('.assign-to') || e.target.closest('.assignment-placeholder')) {
            return;
        }

        const lineUuid = conversationItem.getAttribute('data-id');
        if (lineUuid) {
            loadConversation(lineUuid);
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            conversationItem.classList.add('active');

            // Collapse conversations panel on mobile/tablet after selecting
            if (window.innerWidth <= 992) {
                const convPanel = document.querySelector('.message-section.conversations');
                if (convPanel) convPanel.classList.remove('hover-expanded');
                const trigger = document.getElementById('conversations-hover-trigger');
                if (trigger) trigger.style.opacity = '1';
            }

            // Clear unread indicators immediately on click
            const unreadBadge = conversationItem.querySelector('.unread-badge');
            if (unreadBadge) {
                unreadBadge.remove();
            }
            conversationItem.classList.remove('unread');
            conversationItem.setAttribute('data-unread-count', '0');

            // Update currently active panel content (with duplicate prevention)
            const currentTime = Date.now();
            if (!lastConversationChange || currentTime - lastConversationChange > 50) {
                lastConversationChange = currentTime;
                const activeTab = document.querySelector('.panel-tab.active');
                if (activeTab) {
                    const panelName = activeTab.getAttribute('data-panel');
                    updatePanelContent(panelName);
                }
            }
        }
    }
});

// Message loading state
let messageLoadingState = {
    isLoading: false,
    page: 1,
    hasMore: true,
    messagesPerPage: 1000  // Show full history on load
};

// Global variable to store team members from database
let availableTeamMembers = [];

// Function to fetch team members from database
async function fetchTeamMembers() {
    try {
        const response = await fetch('/team-members'); // Adjust endpoint as needed
        if (response.ok) {
            availableTeamMembers = await response.json();
        } else {
            console.error('Failed to fetch team members:', response.status);
        }
    } catch (error) {
        console.error('Error fetching team members:', error);
    }
}

// Function to get team member information

// Initialize team members on page load
// Ensure optimistic assignment cache exists
if (!window.optimisticAssignments) {
    window.optimisticAssignments = new Map();
}

document.addEventListener('DOMContentLoaded', function () {
    fetchTeamMembers();
});

// Function to load assignments (using the new AssignmentManager)
// Note: This is a wrapper function for backward compatibility
async function loadAssignmentsFromDatabase() {
    // Prevent duplicate calls by checking if already loading
    if (window.assignmentManager && !window.assignmentManager.isLoading) {
        await window.assignmentManager.loadAssignmentsFromDatabase();
    }
}

// Removed Firebase fallback function - using database-only approach

// Function to update assignment displays with database data
function updateAssignmentDisplays(assignments) {
    // Do not reset all items; preserve any visible state to prevent flicker

    // Overlay optimistic assignments (user just selected) so UI doesn't revert
    if (window.optimisticAssignments && window.optimisticAssignments.size > 0) {
        const byId = new Map((assignments || []).map(a => [a.line_uuid, a]));
        window.optimisticAssignments.forEach((userName, id) => {
            byId.set(id, { line_uuid: id, assigned_user_name: userName, user_type: '' });
        });
        assignments = Array.from(byId.values());
    }

    // Update with actual assignments
    assignments.forEach(assignment => {
        const lineUuid = assignment.line_uuid;
        const userName = assignment.assigned_user_name;
        const userType = assignment.user_type;

        // Update assignment display
        const placeholder = document.querySelector(`.assignment-placeholder[data-line-uuid="${lineUuid}"]`);
        if (placeholder) {
            placeholder.innerHTML = `
                <div class="assigned-user-display" data-user-id="${assignment.user_id}">
                    <img src="/images/default-user.png" alt="${userName}" onerror="this.src='/images/default-user.png'">
                    <span>${userName} <small class="role-label">${userType}</small></span>
                </div>
            `;
        }

        // Update header indicator
        const headerIndicator = document.querySelector(`.assigned-to-indicator[data-line-uuid="${lineUuid}"]`);
        if (headerIndicator) {
            headerIndicator.textContent = `→ ${userName}`;
            headerIndicator.style.display = 'inline';
        }
    });
}

// Function to refresh all assignment displays
function refreshAllAssignmentDisplays() {
    // Use the assignment manager directly instead of the wrapper function
    if (window.assignmentManager) {
        window.assignmentManager.loadAssignmentsFromDatabase();
    }
}

// Alias for backward compatibility
const refreshAssignmentDisplays = refreshAllAssignmentDisplays;

// Legacy function - now uses new assignment manager
function updateAssignment(lineUuid, assignedTeam) {
    // Find team member by name for backward compatibility
    const teamMembers = window.assignmentManager.getTeamMembers();
    const teamMember = teamMembers.find(m => m.name === assignedTeam);

    // Use new assignment manager
    window.assignmentManager.setAssignment(lineUuid, teamMember).catch(error => {
        console.error('Assignment update failed:', error);
    });
}

// Function to update assignment via database API (legacy function)
async function updateDatabaseAssignment(lineUuid, userId) {
    try {

        const response = await fetch('/assign-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({
                line_uuid: lineUuid,
                user_id: userId
            })
        });

        if (response.ok) {
            const result = await response.json();

            // Refresh assignment displays directly
            if (window.assignmentManager) {
                window.assignmentManager.loadAssignmentsFromDatabase();
            }
        } else {
            console.error('Failed to update assignment:', response.statusText);
        }
    } catch (error) {
        console.error(`Error updating assignment for ${lineUuid}:`, error);
    }
}

// Function to get team member info from available team members
function getTeamMemberInfo(teamName) {
    // If no team name provided, return not assigned
    if (!teamName) {
        return {
            name: 'Not assigned',
            role: ''
        };
    }

    // Get available team members
    const teamMembers = getAvailableTeamMembers();

    // Find the team member with the matching name
    const teamMember = teamMembers.find(member =>
        member.name.toLowerCase() === teamName.toLowerCase());

    // Return the team member info if found, otherwise return default
    if (teamMember) {
        return teamMember;
    } else {
        return {
            name: teamName,
            role: 'Sales',
        };
    }
}

// Function to get available team members from the Team Chat tab and information tab
function getAvailableTeamMembers() {
    // No default team members - use actual database data
    const defaultTeamMembers = [];

    try {
        const teamMembers = [];

        // First try to get team members from the Team Chat tab
        const teamChatTab = document.querySelector('.team-chat-tab');
        if (teamChatTab) {
            // Look for team members in the team list
            const teamList = teamChatTab.querySelector('.team-list, .team-members');
            if (teamList) {
                teamList.querySelectorAll('.team-member, .member').forEach(element => {
                    const name = element.dataset.name || element.querySelector('.member-name')?.textContent.trim();
                    const role = element.dataset.role || element.querySelector('.member-role')?.textContent.trim() || 'Sales';

                    if (name) {
                        teamMembers.push({ name, role });
                    }
                });
            }
        }

        // If no team members found in Team Chat tab, try the information tab
        if (teamMembers.length === 0) {
            const infoPanel = document.querySelector('.information-tab');
            if (infoPanel) {
                // Check if there's a team members section in the information tab
                const teamMembersSection = infoPanel.querySelector('.team-members, .assigned-to');
                if (teamMembersSection) {
                    // Get team members from the section
                    teamMembersSection.querySelectorAll('.team-member, .assigned-user').forEach(element => {
                        const name = element.dataset.team || element.dataset.name ||
                            element.querySelector('span')?.textContent.trim().split(' ')[0] || '';
                        const role = element.dataset.role || 'Sales';

                        if (name && name !== 'Not assigned') {
                            teamMembers.push({ name, role });
                        }
                    });
                }
            }
        }

        // If still no team members found, check for any assigned users in the conversation list
        if (teamMembers.length === 0) {
            document.querySelectorAll('.conversation-item .assigned-user').forEach(element => {
                const name = element.dataset.team ||
                    element.querySelector('span')?.textContent.trim().split(' ')[0] || '';
                const role = 'Sales';

                if (name && !teamMembers.some(member => member.name === name)) {
                    teamMembers.push({ name, role });
                }
            });
        }

        // Add default team members if none found
        if (teamMembers.length === 0) {
            return defaultTeamMembers;
        }

        // Remove duplicates by name
        const uniqueTeamMembers = [];
        const uniqueNames = new Set();
        teamMembers.forEach(member => {
            if (!uniqueNames.has(member.name)) {
                uniqueNames.add(member.name);
                uniqueTeamMembers.push(member);
            }
        });

        return uniqueTeamMembers;
    } catch (error) {
        console.error('Error getting team members:', error);
        return defaultTeamMembers;
    }
}

// Function to update the UI for a specific assignment
function updateAssignmentUI(lineUuid, assignedTeam) {
    const conversationItems = document.querySelectorAll(`.conversation-item[data-id="${lineUuid}"]`);
    conversationItems.forEach(item => {
        // Store the assignment in the element's dataset
        item.dataset.assignedTeam = assignedTeam || '';

        // Update the UI in the assignment placeholder
        const placeholder = item.querySelector(`.assignment-placeholder[data-line-uuid="${lineUuid}"]`);
        if (placeholder) {
            if (assignedTeam) {
                const teamMember = getTeamMemberInfo(assignedTeam);
                placeholder.innerHTML = `
                    <div class="assigned-user-display" data-user-id="">
                        <span>${teamMember.name} <small class="role-label">${teamMember.role}</small></span>
                    </div>
                `;
            } else {
                placeholder.innerHTML = `
                    <div class="not-assigned-display">
                        <span>Not assigned</span>
                    </div>
                `;
            }
        }
    });

    // Also update the information panel if this is the current conversation
    if (currentState.currentConversationId === lineUuid) {
        updateInformationPanelAssignment(lineUuid, assignedTeam);
    }
}

// Function to show assignment dropdown (uses new system)
function showAssignmentDropdown(lineUuid, targetElement) {
    window.assignmentManager.showDropdown(lineUuid, targetElement);
}

// Function to add click events to assign-to elements
function addAssignmentClickEvents() {
    document.querySelectorAll('.conversation-item .assign-to').forEach(element => {
        const lineUuid = element.closest('.conversation-item').dataset.id;
        if (!lineUuid) return;

        // Remove existing click event to avoid duplicates
        element.removeEventListener('click', handleAssignmentClick);

        // Add click event
        element.addEventListener('click', handleAssignmentClick);

        // Make it look clickable
        element.style.cursor = 'pointer';
        element.title = 'Click to change assignment';
    });
}

// Handler for assignment click events
function handleAssignmentClick(event) {
    event.stopPropagation();
    const element = event.currentTarget;
    const lineUuid = element.closest('.conversation-item').dataset.id;
    if (lineUuid) {
        showAssignmentDropdown(lineUuid, element);
    }
}

// Function to update the information panel assignment
function updateInformationPanelAssignment(lineUuid, assignedTeam) {
    const infoPanel = document.querySelector('.information-tab');
    if (!infoPanel) return;

    const assignedToSection = infoPanel.querySelector('.assigned-to');
    if (assignedToSection) {
        // Get team member info
        const teamMember = getTeamMemberInfo(assignedTeam);

        if (assignedTeam) {
            assignedToSection.innerHTML = `
                <div class="assigned-user" data-team="${assignedTeam}">
                    <span>${teamMember.name} <small class="role-label">${teamMember.role}</small></span>
                </div>
            `;
        } else {
            assignedToSection.innerHTML = `
                <div class="not-assigned">
                    <span>Not assigned</span>
                </div>
            `;
        }

        // Add click event to open assignment dropdown
        assignedToSection.onclick = function (event) {
            event.stopPropagation();
            showAssignmentDropdown(lineUuid, assignedToSection);
        };
    }
}

// Function to check for existing assignments in the information tab
function checkExistingAssignments() {

    // Get the current conversation ID
    const lineUuid = currentState.currentConversationId;
    if (!lineUuid) {
        return;
    }

    // Check for assigned team in the information tab
    setTimeout(() => {
        // Look for the Assigned To section in the information tab
        const assignedToElement = document.querySelector('.assigned-to');
        if (assignedToElement) {
            // Try to get the team from data attribute first
            const assignedUserElement = assignedToElement.querySelector('.assigned-user');
            if (assignedUserElement) {
                const teamFromData = assignedUserElement.dataset.team;
                if (teamFromData) {
                    updateAssignment(lineUuid, teamFromData);
                    return;
                }

                // If no data attribute, try to get from the text content
                const nameElement = assignedUserElement.querySelector('span');
                if (nameElement) {
                    // Extract just the name part (before any small tags)
                    const fullText = nameElement.textContent.trim();
                    const assignedTeam = fullText.split(' ')[0]; // Get first word (name)

                    if (assignedTeam && assignedTeam !== 'Not' && assignedTeam !== 'Not assigned') {
                        updateAssignment(lineUuid, assignedTeam);
                        return;
                    }
                }
            } else {
                // If no assigned-user element, check the entire text
                const assignedTeam = assignedToElement.textContent.trim();
                if (assignedTeam && !assignedTeam.includes('Not assigned')) {
                    // Try to extract just the name part
                    const teamName = assignedTeam.split(' ')[0];
                    if (teamName && teamName !== 'Not') {
                        updateAssignment(lineUuid, teamName);
                        return;
                    }
                }
            }
        }

        // Also check for specific team members by data attribute
        const teamElements = document.querySelectorAll('.assigned-to [data-team]');
        teamElements.forEach(element => {
            const team = element.dataset.team;
            if (team) {
                updateAssignment(lineUuid, team);
                return;
            }
        });
    }, 500); // Short delay to ensure the information tab has loaded
}

// Function to listen for assignment changes from the information tab
function setupAssignmentListeners() {

    // Listen for clicks on the Assign button in the information tab
    document.addEventListener('click', function (event) {
        const assignButton = event.target.closest('.assign-button, button.assign');
        if (assignButton) {

            // Get the current conversation ID
            const lineUuid = currentState.currentConversationId;
            if (!lineUuid) {
                return;
            }

            // Get the assigned team from the information tab
            const assignedToElement = document.querySelector('.assigned-to');
            if (assignedToElement) {
                // Try to get the team from data attribute first
                const assignedUserElement = assignedToElement.querySelector('.assigned-user');
                if (assignedUserElement) {
                    const teamFromData = assignedUserElement.dataset.team;
                    if (teamFromData) {
                        updateAssignment(lineUuid, teamFromData);
                    } else {
                        // If no data attribute, try to get from the text content
                        const nameElement = assignedUserElement.querySelector('span');
                        if (nameElement) {
                            // Extract just the name part (before any small tags)
                            const fullText = nameElement.textContent.trim();
                            const assignedTeam = fullText.split(' ')[0]; // Get first word (name)

                            if (assignedTeam && assignedTeam !== 'Not' && assignedTeam !== 'Not assigned') {
                                updateAssignment(lineUuid, assignedTeam);
                            }
                        }
                    }
                } else {
                    // If no assigned-user element, check the entire text
                    const assignedTeam = assignedToElement.textContent.trim();
                    if (assignedTeam && !assignedTeam.includes('Not assigned')) {
                        // Try to extract just the name part
                        const teamName = assignedTeam.split(' ')[0];
                        if (teamName && teamName !== 'Not') {
                            updateAssignment(lineUuid, teamName);
                        }
                    }
                }
            }

            // Check again after a short delay to ensure the UI has updated
            setTimeout(checkExistingAssignments, 1000);
        }
    });

    // Also observe changes to the Assigned To section in the information tab
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' || mutation.type === 'subtree') {
                const lineUuid = currentState.currentConversationId;
                if (!lineUuid) return;

                // Check if the Assigned To section changed
                setTimeout(() => {
                    checkExistingAssignments();
                }, 100); // Short delay to ensure DOM is updated
            }
        });
    });

    // Start observing the information tab
    const informationTab = document.querySelector('.information-tab');
    if (informationTab) {
        observer.observe(informationTab, { childList: true, subtree: true });
    }

    // Listen for conversation selection to check for existing assignments
    document.addEventListener('click', function (event) {
        const conversationItem = event.target.closest('.conversation-item');
        if (conversationItem) {
            // Short delay to ensure the information tab has loaded
            setTimeout(checkExistingAssignments, 500);
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    initializeApp();
    setupPanelTabs(); // Add this line
    renderAISection(); // Make sure these are called
    renderTeamChatSection();

    // Set up assignment listeners
    setupAssignmentListeners();

    // Initialize assignment system properly
    if (window.assignmentManager) {
        console.log('🚀 Setting up assignment manager observers...');

        // Set up observer for assignment changes
        window.assignmentManager.addObserver((event, data) => {
            console.log('📡 Assignment Manager Event:', event, data);

            if (event === 'assignmentChanged') {
                if (data && data.lineUuid) {
                    window.assignmentManager.updateConversationUI(data.lineUuid);
                }
            } else if (event === 'assignmentsLoaded') {
                if (!window._conversationsInitialized) {
                    console.log('🔄 Assignments loaded, rendering conversation list');
                    setTimeout(() => renderConversationsList(), 200);
                }
            } else if (event === 'fullInitializationComplete') {
                console.log('✅ Assignment manager fully ready');
                if (!window._conversationsInitialized) {
                    setTimeout(() => {
                        renderConversationsList();
                        window._conversationsInitialized = true;
                    }, 500);
                }
            } else if (event === 'initializationFailed') {
                console.error('❌ Assignment initialization failed');
                if (!window._conversationsInitialized) {
                    setTimeout(() => {
                        renderConversationsList();
                        window._conversationsInitialized = true;
                    }, 100);
                }
            }
        });

        console.log('🚀 Starting assignment manager initialization...');
        // The assignment manager will initialize automatically and trigger observers
    } else {
        console.error('❌ Assignment manager not found!');
        // Fallback: render without assignments
        renderConversationsList();
    }

    // Set up real-time conversation updates
    setupRealTimeListeners();

    // Listen for menu clicks
    document.addEventListener('click', (e) => {
        const menuLink = e.target.closest('#menu-container a');
        if (menuLink) {
            e.preventDefault();
            handleMenuClick(menuLink);
        }
    });
});

// ปรับปรุงฟังก์ชัน initializeApp

function initializeApp() {

    // Setup event listeners
    setupGlobalEventListeners();
    setupPanelTabs(); // Add this line to ensure panel tabs are set up
    setupChatEventListeners();
    // setupFilterEvents(); // Moved to renderConversationsList after HTML creation
    setupSocialAppItems();
    setupMobileLayout();
    initializeFilterDropdown(); // Add this line

    // Initial render (conversations will be rendered after assignments load)
    renderSidebar();

    // Load assignments and then render conversations - moved to assignment manager initialization
    // The assignment manager will handle this internally and trigger conversation rendering

    // Handle initial window size
    handleResize();
}

// Make sure initializeApp is called after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Add this new function to handle section activation
function activateSection(sectionName) {

    // Reset all menu items
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    // Find and activate the requested section
    switch (sectionName) {
        case 'messages':
            // Activate messages section (default view)
            document.querySelector('.sidebar-menu-item[data-section="messages"]').classList.add('active');
            break;

        case 'contacts':
            // Activate contacts section
            const contactsItem = document.querySelector('.sidebar-menu-item[data-section="contacts"]');
            contactsItem.classList.add('active');
            // Add code to show contacts view (you may need to implement this)
            showContactsView();
            break;

        case 'social-apps':
            // Open social apps popup
            document.getElementById('social-apps-btn').classList.add('active');
            setTimeout(() => {
                showSocialAppsPopup();
            }, 100);
            break;

        case 'insights':
            // Open insights panel
            document.getElementById('insights-btn').classList.add('active');
            setTimeout(() => {
                showInsightsPanel();
            }, 100);
            break;

        case 'tasks':
            // Activate tasks section
            const tasksItem = document.querySelector('.sidebar-menu-item[data-section="tasks"]');
            tasksItem.classList.add('active');
            // Add code to show tasks view (you may need to implement this)
            showTasksView();
            break;

        case 'settings':
            // Activate settings section
            const settingsItem = document.querySelector('.sidebar-menu-item[data-section="settings"]');
            settingsItem.classList.add('active');
            // Add code to show settings view (you may need to implement this)
            showSettingsView();
            break;
    }
}

// Add placeholder functions for views that don't exist yet
function showContactsView() {
    // Create or show contacts view
    alert("Contacts view is under development");
    // You can implement a proper contacts view here
}

function showTasksView() {
    // Create or show tasks view
    alert("Tasks view is under development");
    // You can implement a proper tasks view here
}

function showSettingsView() {
    // Create or show settings view
    alert("Settings view is under development");
    // You can implement a proper settings view here
}

// Add this function after your initializeApp() function
function setupPanelTabs() {

    // Ensure panels are rendered
    renderAISection();
    renderTeamChatSection();

    const panelTabs = document.querySelectorAll('.panel-tab');

    if (panelTabs.length === 0) {
        console.error("Panel tabs not found!");
        return;
    }

    panelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            panelTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all panel contents
            const panelContents = document.querySelectorAll('.panel-content');
            panelContents.forEach(content => content.classList.remove('active'));

            // Show the selected panel content
            const panelName = tab.getAttribute('data-panel');
            const selectedPanel = document.getElementById(`${panelName}-panel`);
            if (selectedPanel) {
                selectedPanel.classList.add('active');

                // Update panel content when switching tabs
                updatePanelContent(panelName);

                // Make sure panels container is visible on mobile
                const panelsContainer = document.getElementById('panels-container');
                if (panelsContainer) {
                    panelsContainer.classList.add('visible');
                }
            } else {
                console.error(`Panel with id '${panelName}-panel' not found!`);
            }
        });
    });
}

// Debounce utility to prevent multiple rapid calls
let panelUpdateTimeouts = {};
let lastConversationChange = null;

// Function to update panel content based on current conversation
function updatePanelContent(panelName) {
    const activeConversation = document.querySelector('.conversation-item.active');
    const lineUuid = activeConversation ? activeConversation.getAttribute('data-id') : null;

    // Clear any existing timeout for this panel
    if (panelUpdateTimeouts[panelName]) {
        clearTimeout(panelUpdateTimeouts[panelName]);
    }

    // Debounce the update to prevent multiple rapid calls
    panelUpdateTimeouts[panelName] = setTimeout(() => {
        switch (panelName) {
            case 'information':
                if (lineUuid) {
                    // Information panel update is handled in panels-tabs.js
                    if (typeof renderInformationSection === 'function') {
                        renderInformationSection();
                    }
                }
                break;
            case 'ai':
                // Update AI suggestions for current conversation
                if (lineUuid && typeof generateSuggestionsForConversation === 'function') {
                    generateSuggestionsForConversation(lineUuid);
                }
                break;
            case 'team':
                // Team panel is mostly static, but could be refreshed if needed
                if (typeof renderTeamChatSection === 'function') {
                    renderTeamChatSection();
                }
                break;
        }
        // Clear the timeout reference after execution
        delete panelUpdateTimeouts[panelName];
    }, 100); // 100ms debounce delay
}

// Add responsive toggle for mobile
const toggleButtons = document.querySelectorAll('#toggle-ai-btn, #toggle-team-btn');
toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const panelsContainer = document.getElementById('panels-container');
        panelsContainer.classList.toggle('visible');

        // If one of these buttons is clicked, activate the corresponding tab
        if (btn.id === 'toggle-ai-btn') {
            document.querySelector('.panel-tab[data-panel="ai"]').click();
        } else if (btn.id === 'toggle-team-btn') {
            document.querySelector('.panel-tab[data-panel="team"]').click();
        }
    });
});

function setupGlobalEventListeners() {
    // General click event handlers
    document.addEventListener('click', (e) => {
        // Handle outside clicks for popups, modals, etc.
        if (e.target.id === 'overlay') {
            // Close any open modals
            const profileModal = document.getElementById('profile-modal');
            if (profileModal && profileModal.classList.contains('active')) {
                profileModal.classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line

            const lineUuid = currentState.currentConversationId;
            if (lineUuid) {
                sendMessage(e, lineUuid);
            }

        }

        if (e.key === 'Escape') {
            // Close any open modals or popups
            hideSocialAppsPopup();

            const profileModal = document.getElementById('profile-modal');
            if (profileModal && profileModal.classList.contains('active')) {
                profileModal.classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            }
        }
    });
}

// Handle menu clicks
function handleMenuClick(menuLink) {
    const target = menuLink.getAttribute('href');

    switch (target) {
        case '#chat':
        case '#conversations':
            // Show main chat sections
            toggleMainChat(true);
            break;
        case '#ai-assistant':
            // Toggle AI assistant visibility
            toggleAIAssistant();
            break;
        case '#team-chat':
            // Toggle team chat visibility
            toggleTeamChat();
            break;
        case '#settings':
            // Show settings (not implemented yet)
            alert('Settings feature coming soon!');
            break;
    }
}

// Show Profile Modal
function showProfileModal(conversationId) {
    const conversationElement = document.querySelector(`[data-id="${conversationId}"]`);
    if (!conversationElement) return;

    // Get data from the conversation element
    const displayName = conversationElement.querySelector('.conversation-name')?.textContent || 'User';
    const avatar = conversationElement.querySelector('.conversation-avatar img')?.src || '/images/default-user.png';

    const profileModalContainer = document.getElementById('profile-modal');
    if (!profileModalContainer) return;

    profileModalContainer.innerHTML = `
        <div class="modal-content profile-modal">
            <div class="modal-header">
                <h2>Profile</h2>
                <button class="close-modal-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="profile-header">
                    <img src="${avatar}" alt="${displayName}" class="profile-avatar">
                    <h3>${displayName}</h3>
                    <p class="profile-status">LINE User</p>
                </div>
                <div class="profile-details">
                    <div class="profile-detail-item">
                        <span class="detail-label">Platform:</span>
                        <span class="detail-value">LINE</span>
                    </div>
                    <div class="profile-detail-item">
                        <span class="detail-label">User ID:</span>
                        <span class="detail-value">${conversationId}</span>
                    </div>
                    <div class="profile-detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">Active</span>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn-primary"><i class="fas fa-phone-alt"></i> Call</button>
                    <button class="btn-primary"><i class="fas fa-video"></i> Video</button>
                    <button class="btn-secondary"><i class="fas fa-flag"></i> Report</button>
                    <button class="btn-secondary"><i class="fas fa-ban"></i> Block</button>
                </div>
            </div>
        </div>
    `;

    // Show the modal
    profileModalContainer.classList.add('active');
    document.getElementById('overlay').classList.add('active');

    // Add event listener for close button
    const closeBtn = profileModalContainer.querySelector('.close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            profileModalContainer.classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
        });
    }

    // Close when clicking outside the modal
    document.getElementById('overlay').addEventListener('click', () => {
        profileModalContainer.classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    });

    // Add event listeners for profile actions
    const actionButtons = profileModalContainer.querySelectorAll('.profile-actions button');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.textContent.trim();
            alert(`${action} feature coming soon!`);
        });
    });
}

// แก้ไขฟังก์ชันที่เกี่ยวข้องกับการสลับ panel

// Show main chat and hide other sections
function toggleMainChat(show) {
    if (show) {
        // Reset visibility
        currentState.aiVisible = false;
        currentState.teamVisible = false;

        const messageHub = document.querySelector('.message-hub');
        messageHub.classList.remove('ai-visible', 'team-visible');
        document.getElementById('ai-section').style.display = 'none';
        document.getElementById('team-section').style.display = 'none';
    }
}

// แก้ไขฟังก์ชัน renderConversationsList เพื่อแสดง logo และเพิ่ม filter

// เก็บสถานะกรองล่าสุด
let selectedFilters = ['all'];

// Google Sheets Configuration - DISABLED
// Using Laravel backend instead of Google Sheets

// Function to get initials from name
function getInitials(name) {
    if (!name || typeof name !== 'string') return 'U'; // Return 'U' for undefined or non-string
    const words = name.trim().split(/\s+/);
    return words.map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
}

// Function to get random color for avatar
function getRandomColor() {
    const colors = [
        '#1976d2', '#2196f3', '#0097a7', '#00acc1',
        '#009688', '#43a047', '#7cb342', '#c0ca33',
        '#fdd835', '#ffb300', '#fb8c00', '#f4511e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to format date for headers
function formatDateHeader(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        // Format like "Sat, 19/04"
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = days[date.getDay()];
        const dayNum = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}, ${dayNum}/${month.toString().padStart(2, '0')}`;
    }
}

// Function to format time for messages
function formatMessageTime(dateStr) {
    if (!dateStr) return 'now';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return 'now';
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Update existing formatDate function to use the new format for messages
function formatDate(dateStr) {
    return formatMessageTime(dateStr);
}

// Function to handle image loading errors globally
function handleImageError(imgElement, fallbackName = 'User') {
    if (imgElement && !imgElement.dataset.errorHandled) {
        imgElement.dataset.errorHandled = 'true';
        imgElement.src = '/images/default-user.png';
        imgElement.onerror = null; // Prevent infinite loop
        console.log('Fallback image loaded for:', fallbackName);
    }
}

// Download LINE image from server
async function downloadLineImage(messageId) {
    console.log('Downloading LINE image:', messageId);
    try {
        const response = await fetch(`/api/line-image/${messageId}`);
        console.log('LINE image response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('LINE image data:', data);

        if (data.success && data.imageUrl) {
            // Find the specific loading div within the message, not the entire message
            const loadingElement = document.querySelector(`.line-image-loading[data-message-id="${messageId}"]`);
            if (loadingElement) {
                loadingElement.innerHTML = `<img src="${data.imageUrl}" alt="LINE Image" style="max-width: 300px; max-height: 300px; border-radius: 8px;">`;
                console.log('Successfully replaced loading element with image');

                // Image URL is persisted by the backend; no additional action needed here
            } else {
                console.error('Loading element not found for messageId:', messageId);
            }
        } else {
            console.error('LINE image download failed:', data);
            // Show error state
            const loadingElement = document.querySelector(`.line-image-loading[data-message-id="${messageId}"]`);
            if (loadingElement) {
                loadingElement.innerHTML = `<div class="image-error">❌ Failed to load image</div>`;
            }
        }
    } catch (error) {
        console.error('Error downloading LINE image:', error);
        const loadingElement = document.querySelector(`.line-image-loading[data-message-id="${messageId}"]`);
        if (loadingElement) {
            loadingElement.innerHTML = `<div class="image-error">❌ Error loading image</div>`;
        }
    }
}

// Firebase removed — image URL update is handled server-side
function updateFirebaseImageUrl(messageId, imageUrl) {
    // No-op: image URL is persisted by the backend when serving via /api/line-image/...
}

// Function to fetch LINE profile
async function fetchLineProfile(userId) {
    try {
        // Make API call to Laravel backend to get LINE profile
        const response = await fetch(`/api/line-profile/${encodeURIComponent(userId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            }
        });

        if (response.ok) {
            const profileData = await response.json();
            if (profileData && profileData.displayName) {
                return {
                    userId: userId,
                    displayName: profileData.displayName,
                    pictureUrl: profileData.pictureUrl || "images/default-user.png",
                    statusMessage: profileData.statusMessage || "",
                    language: profileData.language || "th",
                    success: true
                };
            }
        }

        // If API call fails, try to extract name from userId for LINE users
        if (userId.startsWith('U') && userId.length > 10) {
            const shortId = userId.substring(1, 5);
            return {
                userId: userId,
                displayName: `Line User ${shortId}`,
                pictureUrl: "images/default-user.png",
                statusMessage: "",
                language: "th",
                success: true
            };
        }

        // Fallback for other types of users
        return {
            userId: userId,
            displayName: "User",
            pictureUrl: "images/default-user.png",
            statusMessage: "",
            language: "th",
            success: true
        };
    } catch (error) {
        console.error('Error fetching LINE profile:', error);

        // Fallback: generate name from userId if it's a LINE user
        if (userId.startsWith('U') && userId.length > 10) {
            const shortId = userId.substring(1, 5);
            return {
                userId: userId,
                displayName: `Line User ${shortId}`,
                pictureUrl: "images/default-user.png",
                statusMessage: "",
                language: "th",
                success: true
            };
        }

        return {
            userId: userId,
            displayName: "User",
            pictureUrl: "images/default-user.png",
            statusMessage: "",
            language: "th",
            success: true
        };
    }
}

async function fetchMetaProfile(channel, platformUserId) {
    try {
        if (!channel || !platformUserId) {
            return null;
        }

        const search = new URLSearchParams({
            action: 'profile',
            channel,
            userId: platformUserId
        });

        const response = await fetch(`/meta-proxy.php?${search.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn('Meta profile fetch failed', channel, platformUserId, response.status);
            return null;
        }

        const data = await response.json();
        if (!data) return null;

        return {
            userId: platformUserId,
            displayName: data.displayName || (channel === 'facebook' ? platformUserId.replace('FB_', 'FB ') : platformUserId.replace('IG_', 'IG ')),
            pictureUrl: data.pictureUrl || '',
            statusMessage: data.statusMessage || ''
        };
    } catch (error) {
        console.warn('Meta profile fetch error', channel, platformUserId, error);
        return null;
    }
}

// Firebase removed — using evante API

// Global variable to store assignments (kept for backwards compatibility)

// Helper: Skip list re-render if realtime listeners are active (imperceptible updates only)
function skipListRerender() {
    return !!(window.realtimeListeners && window.realtimeListeners.active);
}
// Debounced refresh helper
function requestConversationsRefresh(delay = 300) {
    if (skipListRerender()) return;
    if (window._convRefreshTimer) clearTimeout(window._convRefreshTimer);
    window._convRefreshTimer = setTimeout(() => {
        try { renderConversationsList(); } catch (e) { console.error('Conversation refresh failed:', e); }
    }, delay);
}
// Cache for latest last-message (prevents stale overwrites)
if (!window.latestMessageCache) window.latestMessageCache = new Map();
// Legacy assignment cache (populated from Evante API, not Firebase)
if (!window.assignmentCache) window.assignmentCache = new Map();

// Function to fetch assignments from evante API
async function fetchAssignments() {
    console.log('Fetching assignments from evante API...');
    try {
        const response = await fetch('/api/all-assignments', {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data && data.data) ? data.data : []);

        // Clear existing assignments
        window.assignmentCache.clear();

        list.forEach(item => {
            const id = item.line_uuid || item.lineUuid || item.conversation_id || '';
            const team = item.assigned_user_name || item.assignTeam || item.AssignTeam || '';
            if (id && team) {
                window.assignmentCache.set(id, team);
            }
        });

        // Refresh conversation list to show updated assignments
        setTimeout(() => {
            refreshAllAssignmentDisplays();
        }, 100);

        return window.assignmentCache;
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return window.assignmentCache;
    }
}

// Function to fetch data - uses Laravel backend only
async function fetchFirebaseData() {
    console.log('fetchFirebaseData: using Laravel backend only');
    return { rows: [], assignments: new Map() };
}

// Function to process pending profile fetches
async function processPendingProfileFetches() {
    if (!window.pendingProfileFetches) return;

    const pendingFetches = Array.from(window.pendingProfileFetches);
    console.log('Processing profile fetches for LINE users:', pendingFetches);

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < pendingFetches.length; i += batchSize) {
        const batch = pendingFetches.slice(i, i + batchSize);

        // Fetch profiles for this batch
        const profilePromises = batch.map(async (lineUuid) => {
            try {
                const profile = await fetchLineProfile(lineUuid);
                if (profile && profile.displayName && profile.displayName !== 'User') {
                    console.log(`Fetched profile for ${lineUuid}:`, profile.displayName);
                    // Store in global profiles map
                    userProfiles.set(lineUuid, profile);
                    // Update conversation display name immediately
                    updateConversationDisplayNames();
                    return { lineUuid, profile };
                }
            } catch (error) {
                console.error(`Error fetching profile for ${lineUuid}:`, error);
            }
            return null;
        });

        await Promise.all(profilePromises);

        // Add delay between batches
        if (i + batchSize < pendingFetches.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Clear pending fetches
    window.pendingProfileFetches.clear();

    // Refresh the conversation list to show updated names
    setTimeout(() => {
        if (!skipListRerender()) {
            renderConversationsList();
        }
    }, 1000);
}

// Function to fetch and store a single profile immediately
async function fetchAndStoreProfile(lineUuid) {
    try {
        if (!window.userProfiles) {
            window.userProfiles = new Map();
        }

        console.log(`🔍 Fetching profile for new lineUuid: ${lineUuid}`);
        const profile = await fetchLineProfile(lineUuid);

        if (profile && profile.displayName && profile.displayName !== 'User') {
            console.log(`✅ Fetched profile for ${lineUuid}:`, profile.displayName);

            // Store in global profiles map
            window.userProfiles.set(lineUuid, profile);

            // Update the conversation list item immediately
            const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
            if (conversationItem) {
                const nameElement = conversationItem.querySelector('.conversation-name');
                if (nameElement) {
                    nameElement.textContent = profile.displayName;
                }

                // Update avatar if available
                const avatarImg = conversationItem.querySelector('.conversation-avatar img');
                if (avatarImg && profile.pictureUrl && profile.pictureUrl !== '/images/default-user.png') {
                    avatarImg.src = profile.pictureUrl;
                    avatarImg.alt = profile.displayName;
                }
            }

            return profile;
        }
    } catch (error) {
        console.warn(`Failed to fetch profile for ${lineUuid}:`, error);
    }
    return null;
}

// Function to update Firebase with fetched displayName
// Function to update conversation display names after profiles are fetched
function updateConversationDisplayNames() {
    console.log('Updating conversation display names with fetched profiles');
    console.log('Available profiles:', userProfiles);

    userProfiles.forEach((profile, lineUuid) => {
        console.log(`Processing profile update for ${lineUuid}:`, profile.displayName);

        // Update both conversation list and active chat if applicable
        updateConversationItemDisplayName(lineUuid, profile);
        updateActiveChatDisplayName(lineUuid, profile);
    });
}

// Update conversation item in the list
function updateConversationItemDisplayName(lineUuid, profile) {
    const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    if (!conversationItem || !profile.displayName) return;

    const nameElement = conversationItem.querySelector('.conversation-name, .user-name');
    if (nameElement) {
        const currentName = nameElement.textContent.trim();

        // Update if the new name is better than current
        if (shouldUpdateDisplayName(currentName, profile.displayName)) {
            console.log(`Updating conversation name for ${lineUuid} from "${currentName}" to "${profile.displayName}"`);
            nameElement.textContent = profile.displayName;

            // Update avatar
            const avatarImg = conversationItem.querySelector('.conversation-avatar img, .profile-image');
            if (avatarImg) {
                avatarImg.alt = profile.displayName;
                if (profile.pictureUrl && profile.pictureUrl !== '/images/default-user.png') {
                    avatarImg.src = profile.pictureUrl;
                }
            }

            // Update profile circle fallback
            const profileCircle = conversationItem.querySelector('.profile-circle');
            if (profileCircle && profile.pictureUrl && profile.pictureUrl !== '/images/default-user.png') {
                profileCircle.outerHTML = `<img src="${profile.pictureUrl}" alt="${profile.displayName}" class="profile-image">`;
            }
        }
    }
}

// Update active chat header if it's currently displayed
function updateActiveChatDisplayName(lineUuid, profile) {
    const chatHeader = document.querySelector('.chat-history-header h2, .conversation-header .conversation-name');
    const currentActiveChat = getCurrentActiveChatId();

    if (chatHeader && currentActiveChat === lineUuid && profile.displayName) {
        const currentName = chatHeader.textContent.trim();
        if (shouldUpdateDisplayName(currentName, profile.displayName)) {
            console.log(`Updating active chat header for ${lineUuid} to "${profile.displayName}"`);
            chatHeader.textContent = profile.displayName;
        }
    }
}

// Helper function to determine if display name should be updated
function shouldUpdateDisplayName(currentName, newName) {
    // Don't update if names are the same
    if (currentName === newName) return false;

    // Don't update with fallback names
    if (newName.startsWith('Line User') || newName === 'User' || newName === 'Unknown User') return false;

    // Update if current name is a fallback and new name is better
    if ((currentName.startsWith('Line User') || currentName === 'User' || currentName === 'Unknown User') && newName.length > 0) return true;

    // Update if new name is longer and more descriptive
    if (newName.length > currentName.length && !currentName.includes(' ')) return true;

    return false;
}

// Get current active chat ID
function getCurrentActiveChatId() {
    const activeItem = document.querySelector('.conversation-item.active');
    return activeItem ? activeItem.getAttribute('data-id') : null;
}

// Add new function to force scroll to bottom
function forceScrollToBottom(container) {
    if (!container) return;

    // First attempt - immediate
    container.scrollTop = container.scrollHeight;

    // Second attempt - after a short delay
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;

        // Third attempt - after content should definitely be rendered
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 500);
    }, 100);
}

// Update the original scrollToBottom function
function scrollToBottom(container) {
    if (!container) return;

    // Force scroll without smooth behavior for new messages
    container.scrollTop = container.scrollHeight;

    // Backup scroll
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

async function fetchSheetData(sheetName = 'Sheet1') {
    console.log(`fetchSheetData disabled for ${sheetName} - using Laravel backend instead`);
    return [];
}

// Helper to validate/sanitize image URLs
function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    // Reject placeholder words and non-URLs with spaces
    if (trimmed.toLowerCase() === 'profile image' || trimmed.includes(' ')) return '';
    // Accept absolute http(s) URLs or site-rooted paths starting with '/'
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
    // Everything else is treated as invalid
    return '';
}

// Resilient fetch with timeout and exponential backoff retries
async function fetchJsonWithRetry(url, options = {}, retries = 2, backoffMs = 600, timeoutMs = 15000) {
    let attempt = 0;
    while (true) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort('timeout'), timeoutMs);
        try {
            const resp = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(t);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
        } catch (err) {
            clearTimeout(t);
            if (attempt >= retries) throw err;
            const jitter = Math.random() * 200;
            const wait = backoffMs * Math.pow(2, attempt) + jitter;
            await new Promise(r => setTimeout(r, wait));
            attempt++;
        }
    }
}

// Modified renderConversationsList function
async function renderConversationsList() {
    // Prevent rapid re-renders that can cause corruption
    if (window._renderingConversations) {
        console.log('🔄 Skipping renderConversationsList() - already rendering');
        return;
    }
    window._renderingConversations = true;

    const renderId = Date.now();
    window._conversationListRenderId = renderId;

    // Global check: If conversations already exist, don't show empty state regardless of API data
    const existingConversations = document.querySelectorAll('.conversation-item');
    if (existingConversations.length > 0) {
        console.log('📋 Conversations already exist in DOM, preventing empty state display');
        // Remove any existing empty states that might be showing
        const existingEmptyStates = document.querySelectorAll('.empty-state');
        existingEmptyStates.forEach(emptyState => emptyState.remove());
    }

    try {
        const conversationsContainer = document.getElementById('conversations-list') || document.getElementById('conversation-list');
        if (!conversationsContainer) {
            console.error('Conversation list container not found');
            return;
        }

        // Get current user information from assignment manager (more reliable)
        let currentUser = null;
        let isAdmin = false;
        let currentUserId = null;

        if (window.assignmentManager && window.assignmentManager.currentUser) {
            currentUser = window.assignmentManager.currentUser;
            isAdmin = window.assignmentManager.canSeeAllConversations();
            currentUserId = currentUser.id;
            console.log('👤 ✅ Using assignment manager user data:', {
                username: currentUser.username,
                name: currentUser.name,
                role: currentUser.role,
                isAdmin: isAdmin
            });
        } else {
            console.warn('⚠️ Assignment manager not ready yet; defaulting to admin view so chats still render.');
            currentUser = { id: null, role: 'admin', name: 'Fallback Admin' };
            isAdmin = true;
        }

        // Log user role for debugging

        // Force admin role for testing if needed
        // Uncomment the line below to force admin role for testing
        // const isAdmin = true;

        if (conversationsContainer.id === 'conversations-list') {
            // Only show loading if list is empty - prevents flickering on refresh
            if (conversationsContainer.children.length === 0 || !conversationsContainer.querySelector('.conversation-item')) {
                conversationsContainer.innerHTML = `<div class="loading-spinner"></div>`;
            }
        } else if (!document.getElementById('conversations-list')) {
            // Wrapper container: inject header and inner list ONLY ONCE (first render)
            conversationsContainer.innerHTML = `
            <div class="conversations-header">
                <h2><i class="fas fa-comments"></i> All Chats</h2>
                <div class="search-filter-container">
                    <div class="search-box">
                        <input type="text" id="search-conversations" placeholder="Search Messages">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
            </div>
            <div class="filter-chips">
                <button class="filter-btn-show"></button>
                <button class="filter-btn filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="Unread">Unread</button>
                <button class="filter-btn" data-filter="Folow">Follow</button>
                <button class="filter-btn" data-filter="Closed">Closed</button>
            </div>
            <div class="conversations-list" id="conversations-list">
                <div class="loading-spinner"></div>
            </div>`;
        }
        // If conversations-list already exists in wrapper, reuse it (no rebuild = no flicker)
        //      <button class="filter-btn" data-filter="line">
        //          Line
        //      </button>
        //      <button class="filter-btn" data-filter="manual">
        //          Manual
        //      </button>
        //      <button class="filter-btn" data-filter="facebook">
        //          Facebook
        //      </button>
        //      <button class="filter-btn" data-filter="instagram">
        //          Instagram
        //      </button>
        //      <button class="filter-btn" data-filter="whatsapp">
        //          Whatsapp
        //      </button>
        //      <button class="filter-btn" data-filter="telegram">
        //          Telegram
        //      </button>

        // Setup filter and search events after HTML is created
        setupFilterEvents();
        setupSearchAndFilter();

        console.log('🚀 NEW VERSION: Fetching conversations from Laravel backend only...');

        // Fetch conversations from Laravel backend only (with retry & timeout)
        let conversationsData = [];
        try {
            const result = await fetchJsonWithRetry('/api/line-conversations', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }, 3, 800, 15000);

            console.log('Successfully fetched', result.data?.length || 0, 'conversations from LINE API');
            if (result.success && result.data) {
                conversationsData = result.data.map(conv => [
                    conv.lineUuid || '',
                    conv.chatSequence || '',
                    (conv.userInput || conv.message || ''),
                    (conv.aiResponse || ''),
                    (conv.time || conv.date || ''),
                    conv.linkImage || '',
                    conv.displayName || '',
                    conv.messageChannel || '',
                    conv.chatMode || '',
                    '', '', '', '', // placeholders
                    conv.assignTeam || '',
                    conv.unreadCount || 0,  // Add unreadCount at index 14
                    conv.platformUserId || '',
                    conv.platformChannel || '' // index 16: detected platform channel
                ]);
            }
        } catch (apiErr) {
            console.warn('LINE API fetch failed, will fallback to Firebase:', apiErr?.message || apiErr);
        }

        // Debug conversation data
        console.log('💬 Raw conversations data:', conversationsData);
        console.log('💬 Conversations count:', conversationsData.length);

        // If no conversations, show empty state only if there are no existing conversations in the DOM
        if (conversationsData.length === 0) {
            console.log('⚠️ No conversations found from API');
            const existingConversations = document.querySelectorAll('.conversation-item');
            const conversationsList = document.getElementById('conversations-list');

            // Only show empty state if there are truly no conversations AND no empty state already exists
            if (existingConversations.length === 0 && !conversationsList.querySelector('.empty-state')) {
                conversationsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">💬</div>
                        <p>No conversations available</p>
                        <small>Start a conversation in LINE to see it here</small>
                    </div>
                `;
            }
            return;
        } else {
            // If we have conversations, make sure to remove any empty state that might exist
            const conversationsList = document.getElementById('conversations-list');
            const existingEmptyState = conversationsList.querySelector('.empty-state');
            if (existingEmptyState) {
                existingEmptyState.remove();
            }
        }

        // Create a map to store latest messages for each conversation
        const latestMessages = new Map();

        // Process conversations data from Laravel backend
        const processMessages = (data, source) => {
            if (!Array.isArray(data) || data.length === 0) {
                return;
            }

            // Group messages by lineUuid to find the latest for each conversation
            const messagesByConversation = new Map();

            for (const row of data) {
                // Handle both object and array format
                let lineUuid = String(row.lineUuid || row[0] || '');
                const pId = String(row.platformUserId || row[15] || '');
                const platformChannel = String(row.platformChannel || row[16] || '').toLowerCase();

                // For Meta, unifyGrouping by using the prefixed platformUserId
                if (pId && (pId.startsWith('FB_') || pId.startsWith('IG_'))) {
                    lineUuid = pId;
                } else if (lineUuid.match(/^\d{10,}$/) && !platformChannel.includes('ig') && !platformChannel.includes('instagram')) {
                    // Normalize numeric ID to FB_ prefixed if it looks like a Meta ID and isn't specifically IG
                    lineUuid = 'FB_' + lineUuid;
                }
                if (!lineUuid) continue;

                // Convert to string and handle null/undefined
                const messageText = String(row.message || row[2] || '');
                const aiResponse = String(row.aiResponse || row[3] || '');

                // Skip if both message and response are empty
                if (!messageText.replace(/\s+/g, '') && !aiResponse.replace(/\s+/g, '')) continue;

                const message = {
                    lineUuid: lineUuid,
                    message: messageText,
                    aiResponse: aiResponse,
                    time: row.time || row[4] || Date.now(),
                    chatSequence: parseInt(row.chatSequence || row[1] || 0),
                    displayName: row.displayName || row[6] || '',
                    messageChannel: row.messageChannel || row[7] || '',
                    chatMode: row.chatMode || row[8] || '',
                    assignTeam: row.assignTeam || row[13] || '',
                    unreadCount: row.unreadCount || row[14] || 0, // Add unreadCount field from API response (object or array[14])
                    platformUserId: row.platformUserId || row[15] || '',
                    platformChannel: row.platformChannel || row[16] || '',
                    source: source
                };

                // Add to conversation's messages array
                if (!messagesByConversation.has(lineUuid)) {
                    messagesByConversation.set(lineUuid, []);
                }
                messagesByConversation.get(lineUuid).push(message);
            }

            // For each conversation, find the latest message
            for (const [lineUuid, messages] of messagesByConversation) {
                // Sort by time (newest first), then by chatSequence (highest first)
                messages.sort((a, b) => {
                    const timeA = new Date(a.time).getTime();
                    const timeB = new Date(b.time).getTime();
                    if (timeA !== timeB) return timeB - timeA; // Newer first
                    return b.chatSequence - a.chatSequence; // Higher sequence first
                });

                const latestMessage = messages[0]; // First after sorting is latest

                // Only update if this is newer than existing or doesn't exist
                if (!latestMessages.has(lineUuid) ||
                    new Date(latestMessage.time) > new Date(latestMessages.get(lineUuid).time) ||
                    (source === 'Sheet2' && latestMessages.get(lineUuid).source === 'Sheet1')) {

                    // Latest message selection (debug logging disabled in production)

                    latestMessages.set(lineUuid, latestMessage);
                }
            }
        };

        // Process conversations data from Laravel backend
        processMessages(conversationsData, 'Laravel');

        // Debug all messages after processing to check AssignTeam values
        for (const [lineUuid, message] of latestMessages.entries()) {
        }

        // Create conversation items
        const conversationItems = [];
        const userColors = new Map();
        // Use global userProfiles map or create if doesn't exist
        if (!window.userProfiles) {
            window.userProfiles = new Map();
        }
        const userProfiles = window.userProfiles;

        if (!window._lineProfileFetchPromises) {
            window._lineProfileFetchPromises = new Map();
        }
        const profileFetchPromises = window._lineProfileFetchPromises;

        const ensureUserProfile = (lineUuid, messageChannel, platformUserId, label, element) => {
            if (window._conversationListRenderId !== renderId) return;
            if (!lineUuid || userProfiles.has(lineUuid)) return;
            const uuid = String(lineUuid || '');
            const channel = (messageChannel || '').toLowerCase();

            const applyProfileToElement = (profile) => {
                if (window._conversationListRenderId !== renderId) return;
                if (!profile) return;

                const rawDisplayName = profile.displayName || '';
                let cleanName = rawDisplayName;
                if (label) {
                    cleanName = cleanName.replace(`[label: ${label}]`, '').trim();
                }

                if (cleanName) {
                    const nameEl = element.querySelector('.conversation-name');
                    if (nameEl) {
                        nameEl.textContent = cleanName;
                    }
                }

                const imgEl = element.querySelector('.conversation-avatar img');
                if (imgEl) {
                    let pictureUrl = sanitizeImageUrl(profile.pictureUrl || '');
                    if (!pictureUrl) {
                        pictureUrl = '/images/default-user.png';
                    }
                    imgEl.src = pictureUrl;
                    if (cleanName) {
                        imgEl.alt = cleanName;
                    }
                }
            };

            // Apply cached profile immediately
            if (userProfiles.has(lineUuid)) {
                applyProfileToElement(userProfiles.get(lineUuid));
                return;
            }

            let promise = profileFetchPromises.get(lineUuid);
            if (!promise) {
                if (channel === 'facebook' || channel === 'instagram') {
                    const metaId = platformUserId || lineUuid;
                    if (!metaId) {
                        return;
                    }
                    promise = fetchMetaProfile(channel, metaId);
                } else if (uuid.startsWith('U')) {
                    promise = fetchLineProfile(lineUuid);
                } else {
                    return;
                }

                promise = promise
                    .then((profile) => {
                        if (profile) {
                            userProfiles.set(lineUuid, profile);
                        }
                        return profile;
                    })
                    .catch(() => null)
                    .finally(() => {
                        profileFetchPromises.delete(lineUuid);
                    });

                profileFetchPromises.set(lineUuid, promise);
            }

            promise.then(applyProfileToElement);
        };

        // Function to get the name of an assigned user by ID
        function getAssignedUserName(userId) {
            // This should be replaced with actual user data fetching
            // For now, we'll use a simple mapping
            const userMap = {
                '1': 'Admin User',
                '2': 'Sales Rep 1',
                '3': 'Sales Rep 2',
                '4': 'Sales Rep 3'
            };

            return userMap[userId] || `User ${userId}`;
        }

        // Log the number of conversations found
        if (latestMessages.size === 0) {

            // Add a message to the conversation list to indicate no conversations
            conversationsContainer.innerHTML += `
                <div class="empty-conversations-message">
                    <i class="fas fa-comment-slash"></i>
                    <p>No conversations found</p>
                    <p class="sub-message">There might be a database connection issue. Please check the console for errors.</p>
                </div>
            `;

            // Add some CSS for the empty message
            const style = document.createElement('style');
            style.textContent = `
                .empty-conversations-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    text-align: center;
                    color: #888;
                    height: 200px;
                }
                .empty-conversations-message i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }
                .empty-conversations-message p {
                    margin: 0.5rem 0;
                    font-size: 1rem;
                }
                .empty-conversations-message .sub-message {
                    font-size: 0.8rem;
                    opacity: 0.7;
                }
            `;
            document.head.appendChild(style);

            return; // Exit early if no conversations
        } else {
        }

        // Use assignment manager for filtering (much faster)
        const assignmentManager = window.assignmentManager;

        for (const [lineUuid, latestMessage] of latestMessages) {
            // Get profile from userProfiles map or use displayName from conversation data
            const userProfile = userProfiles.get(lineUuid) || {};
            const lineProfileName = userProfile.displayName || latestMessage.displayName || `Line User ${lineUuid.substring(1, 5)}`;

            const timestamp = new Date(latestMessage.time || new Date()).getTime();
            const messageChannel = latestMessage.messageChannel || '';
            const platformUserId = latestMessage.platformUserId || '';

            // Permission: admins see all; sales see only conversations assigned to them
            let shouldShow = false;

            if (window.assignmentManager && window.assignmentManager.currentUser) {
                const currentUser = window.assignmentManager.currentUser;
                const assignment = window.assignmentManager.getAssignment(lineUuid);
                const isUserAdmin = window.assignmentManager.canSeeAllConversations();

                // Check if user is admin or should see all conversations
                if (isUserAdmin) {
                    shouldShow = true;
                    console.log(`👑 ADMIN: Showing conversation ${lineUuid} for admin user`);
                } else {
                    shouldShow = window.assignmentManager.canSeeConversation(lineUuid);
                }

                // Enhanced debug logging for troubleshooting
                if (window.debugAssignments) {
                    console.log(`🔍 Visibility check for ${lineUuid}:`, {
                        shouldShow,
                        currentUser: currentUser?.username,
                        currentUserId: currentUser?.id,
                        userRole: currentUser?.role,
                        assignment: assignment ? {
                            userId: assignment.userId,
                            userName: assignment.userName
                        } : null,
                        isAdmin: isUserAdmin,
                        managerReady: !!window.assignmentManager.currentUser,
                        assignmentsLoaded: window.assignmentManager.assignments.size,
                        assignmentsPending: window.assignmentManager.assignments.size === 0
                    });
                }
            } else {
                // Manager not ready or no current user - be more permissive for admin, strict for sales
                if (isAdmin) {
                    shouldShow = true;
                    console.log(`👑 Admin fallback: showing conversation ${lineUuid}`);
                } else {
                    shouldShow = false;
                    console.log(`🚫 No assignment manager or user data, hiding conversation ${lineUuid}`);
                }
            }

            // Get assigned team name for backwards compatibility
            const assignment = window.assignmentManager ? window.assignmentManager.getAssignment(lineUuid) : null;
            const assignedTeam = assignment ? assignment.userName : '';

            // Dynamic debug assignment info
            if (window.debugAssignments) {
                console.log(`Assignment debug for ${lineUuid}:`, {
                    assignment,
                    assignedTeam,
                    managerExists: !!window.assignmentManager,
                    assignmentsCount: window.assignmentManager ? window.assignmentManager.assignments.size : 0
                });
            }

            const profile = userProfiles.get(lineUuid);

            // Prioritize fresh LINE profile over sheet data
            const initials = getInitials(lineProfileName || lineUuid);
            const displayName = profile?.displayName || lineProfileName || `User ${initials}`;

            console.log(`Display name for ${lineUuid}: profile="${profile?.displayName}", sheet="${lineProfileName}", final="${displayName}"`);

            let pictureUrl = '';

            // Get profile image from user profile - updated to fix cache
            pictureUrl = profile?.pictureUrl || userProfile?.pictureUrl || '';

            // Sanitize and validate the image URL
            pictureUrl = sanitizeImageUrl(pictureUrl);

            // If no valid image URL, create a default avatar with user's initials
            if (!pictureUrl) {
                pictureUrl = '/images/default-user.png';
            }

            const statusMessage = profile?.statusMessage || '';

            if (!userColors.has(lineUuid)) {
                userColors.set(lineUuid, getRandomColor());
            }
            const userColor = userColors.get(lineUuid);

            // Create container for this conversation list item
            const conversationItem = {
                element: document.createElement('div'),
                timestamp: timestamp
            };

            conversationItem.element.className = 'conversation-item';
            conversationItem.element.dataset.id = lineUuid;
            conversationItem.element.dataset.messageChannel = messageChannel;
            if (platformUserId) {
                conversationItem.element.dataset.platformUserId = platformUserId;
            }

            // Store the assigned team in the element's dataset
            if (assignedTeam) {
                conversationItem.element.dataset.assignedTeam = assignedTeam;
            }

            // Get platformChannel from API response for accurate icon detection
            const platformChannel = latestMessage.platformChannel || messageChannel || '';
            conversationItem.element.dataset.platformChannel = platformChannel;

            // Determine app type based on platformChannel (detected platform) not messageChannel
            let appType = 'line';
            if (isFacebookChannel(platformChannel, lineUuid)) {
                appType = 'facebook';
            } else if (isInstagramChannel(platformChannel, lineUuid)) {
                appType = 'instagram';
            } else if (isWhatsAppChannel(platformChannel, lineUuid)) {
                appType = 'whatsapp';
            } else if (isTelegramChannel(platformChannel, lineUuid)) {
                appType = 'telegram';
            } else if (messageChannel && messageChannel.toLowerCase() === 'manual chat') {
                appType = 'manual';
            }
            conversationItem.element.dataset.app = appType;

            const label = latestMessage.label || '';
            const labelColor = latestMessage.labelColor || '#1890ff';
            // Don't show unread badge for the currently open conversation
            const isCurrentlyOpen = currentState.currentConversationId === lineUuid;
            const unreadCount = isCurrentlyOpen ? 0 : (latestMessage.unreadCount ? parseInt(latestMessage.unreadCount) : 0);

            // Remove label from displayName if it exists
            let cleanDisplayName = displayName;
            if (label) {
                cleanDisplayName = displayName.replace(`[label: ${label}]`, '').trim();
            }
            const labelHTML = label ? `
        <span class="conversation-label">
            <span class="color-dot" style="background-color: ${labelColor};"></span>
            <span class="label-text">${label}</span>
        </span>` : '';
            const unreadHTML = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : '';

            // Get the latest message text (support file messages)
            let latestMessageText = latestMessage.aiResponse || latestMessage.message || '';
            if (!latestMessageText) {
                if (latestMessage.linkImage) {
                    try {
                        const url = String(latestMessage.linkImage);
                        const decoded = decodeURIComponent(url.split('?')[0]);
                        let name = decoded.split('/').pop() || 'Attachment';
                        // Strip legacy timestamp prefix like '1773291665_'
                        name = name.replace(/^\d{10,}_/, '');
                        latestMessageText = `File: ${name}`;
                    } catch {
                        latestMessageText = 'File';
                    }
                } else {
                    latestMessageText = 'No messages';
                }
            }

            // Use cached newer last-message if present
            let latestTimeVal = latestMessage.time;
            const cached = window.latestMessageCache.get(lineUuid);
            if (cached) {
                try {
                    const cachedTime = new Date(cached.timestamp).getTime();
                    const baseTime = new Date(latestTimeVal).getTime();
                    if (!isNaN(cachedTime) && (isNaN(baseTime) || cachedTime > baseTime)) {
                        latestMessageText = cached.text;
                        latestTimeVal = cached.timestamp;
                        if (latestMessage.linkImage) {
                            try {
                                const url = String(latestMessage.linkImage);
                                const name = url.split('/').pop().split('?')[0];
                                latestMessageText = `File: ${name || 'Attachment'}`;
                            } catch {
                                latestMessageText = 'File';
                            }
                        } else {
                            latestMessageText = 'No messages';
                        }
                    }
                } catch (e) { }
            }

            conversationItem.element.innerHTML = ` 
            <div class="conversation-time">  
            <div class="conversation-item-content">
                <div class="conversation-avatar">
                    <img src="${pictureUrl || '/images/default-user.png'}" alt="${cleanDisplayName}" onerror="handleImageError(this, '${cleanDisplayName}')">
                    <div class="source-app-badge ${conversationItem.element.dataset.app}-badge">
                        <i class="${appType === 'manual' ? 'fas fa-hand-paper' : 'fab fa-' + appType}"></i>
                    </div>
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <span class="conversation-name">${cleanDisplayName}</span>
                        <span class="assigned-to-indicator" data-line-uuid="${lineUuid}" style="display: none;"></span>
                        
                    </div>
                    <div class="conversation-last-message">${latestMessageText}</div>
                </div>
                <div class="conversation-time-tag">
               <div class="time">${formatDate(new Date(latestTimeVal))}</div>
               <div class="conversation-indicators">
                            
                            ${unreadHTML}
                        </div>
                        ${labelHTML}
               </div>
                
                </div> 
                <div class="conversation-meta" style="display: flex; justify-content: space-between !important; align-items: center !important; gap: 8px;">
                        <div class="assign-to-display">
                            <div class="assignment-placeholder" data-line-uuid="${lineUuid}">
                                ${assignedTeam ? `
                                    <div class="assigned-user-display">
                                        <span>${assignedTeam} <small class="role-label">Sales</small></span>
                                    </div>
                                ` : `
                                    <div class="not-assigned-display">
                                        <span>Unassigned</span>
                                    </div>
                                `}
                            </div>
                        </div>
                        <div class="chat-mode-toggle">
                            <div class="toggle-wrapper ${isAiChatMode(latestMessage.chatMode) ? 'ai' : 'manual'}" data-line-uuid="${lineUuid}">
                                <div class="slider"></div>
                                <div class="option ai-option">AI</div>
                                <div class="option manual-option">Non AI</div>
                            </div>
                        </div>
                </div> 
            `;

            // Use assignment manager to update UI efficiently after element creation
            assignmentManager.updateConversationUI(lineUuid);

            ensureUserProfile(lineUuid, platformChannel, platformUserId, label, conversationItem.element);


            // Modify the conversation click handler to ignore toggle clicks
            conversationItem.element.addEventListener('click', (e) => {
                // Don't load conversation if clicking on the toggle
                if (e.target.closest('.chat-mode-toggle')) {
                    return;
                }

                loadConversation(lineUuid);
                document.querySelectorAll('.conversation-item').forEach(item => {
                    item.classList.remove('active');
                });
                conversationItem.element.classList.add('active');

                // Update currently active panel content (with duplicate prevention)
                const currentTime = Date.now();
                if (!lastConversationChange || currentTime - lastConversationChange > 50) {
                    lastConversationChange = currentTime;
                    const activeTab = document.querySelector('.panel-tab.active');
                    if (activeTab) {
                        const panelName = activeTab.getAttribute('data-panel');
                        updatePanelContent(panelName);
                    }
                }

                // เพิ่มส่วนนี้เพื่อแสดง chat-section บนมือถือ
                const chatSection = document.getElementById('chat-section');
                if (chatSection && window.innerWidth <= 480) {
                    chatSection.style.display = 'flex';
                }
            });

            // Only add conversation to the list if user has permission to see it
            if (shouldShow) {
                conversationItems.push(conversationItem);
            } else {
            }
        }

        // Sort conversations by timestamp (newest first)
        conversationItems.sort((a, b) => b.timestamp - a.timestamp);

        // Update visible count in testing interface
        const visibleCountDisplay = document.getElementById('visible-count');
        if (visibleCountDisplay) {
            visibleCountDisplay.textContent = conversationItems.length;
        }

        // Clear and append sorted conversations
        const conversationsList = document.getElementById('conversations-list');
        if (conversationsList) {
            conversationsList.innerHTML = '';

            // Remove any existing empty states before adding conversations
            const existingEmptyStates = conversationsList.querySelectorAll('.empty-state');
            existingEmptyStates.forEach(emptyState => emptyState.remove());

            if (conversationItems.length > 0) {
                const initialRenderCount = 5;
                const totalCount = conversationItems.length;
                const safeToUpdate = () => window._conversationListRenderId === renderId;

                const appendBatch = (startIndex) => {
                    if (!safeToUpdate()) return;

                    const batchSize = 25;
                    const endIndex = Math.min(startIndex + batchSize, totalCount);
                    const loadingMore = document.getElementById('conversation-list-loading-more');
                    if (loadingMore) {
                        loadingMore.remove();
                    }

                    for (let i = startIndex; i < endIndex; i++) {
                        conversationsList.appendChild(conversationItems[i].element);
                    }

                    if (typeof filterConversationElements === 'function') {
                        filterConversationElements();
                    }
                    if (typeof window._setupAssignmentClickEvents === 'function') {
                        window._setupAssignmentClickEvents();
                    }

                    if (endIndex < totalCount) {
                        const loadingMoreNext = document.createElement('div');
                        loadingMoreNext.id = 'conversation-list-loading-more';
                        loadingMoreNext.className = 'loading-spinner';
                        conversationsList.appendChild(loadingMoreNext);
                        setTimeout(() => appendBatch(endIndex), 0);
                    }
                };

                const initialItems = conversationItems.slice(0, initialRenderCount);
                initialItems.forEach(item => {
                    conversationsList.appendChild(item.element);
                });

                if (typeof filterConversationElements === 'function') {
                    filterConversationElements();
                }

                if (totalCount > initialRenderCount) {
                    const loadingMore = document.createElement('div');
                    loadingMore.id = 'conversation-list-loading-more';
                    loadingMore.className = 'loading-spinner';
                    conversationsList.appendChild(loadingMore);
                    setTimeout(() => appendBatch(initialRenderCount), 0);
                }

                // Double-check: if we have conversations, remove any empty states that might have been added later
                setTimeout(() => {
                    if (!safeToUpdate()) return;
                    const laterEmptyStates = document.querySelectorAll('.empty-state');
                    laterEmptyStates.forEach(emptyState => emptyState.remove());
                }, 100);
            } else if (!isAdmin) {
                const hasExistingEmptyState = conversationsList.querySelector('.empty-state');
                if (!hasExistingEmptyState) {
                    conversationsList.innerHTML = `
                        <div class="empty-state assignment-empty-state">
                            <i class="fas fa-user-clock"></i>
                            <p>No conversations assigned yet</p>
                            <p class="empty-state-subtitle">You'll see chats here once an admin assigns them to you.</p>
                        </div>
                    `;
                }
            }
        } else {
            console.error('conversations-list element not found!');
        }

        // No longer needed - displayName logic now prioritizes fetched profiles

        // Setup search and filter functionality
        setupSearchAndFilter();

        // Make refresh function globally available for testing
        window.refreshConversationList = () => renderConversationsList(true);

        window._setupAssignmentClickEvents = () => {
            if (window._conversationListRenderId !== renderId) return;
            const manager = window.assignmentManager;
            const isAdmin = manager?.canSeeAllConversations?.() ?? false;

            document.querySelectorAll('.assignment-placeholder, .assign-to').forEach(element => {
                const lineUuid = element.closest('[data-id]')?.dataset.id || element.dataset.lineUuid;

                if (element._assignmentHandler) {
                    element.removeEventListener('click', element._assignmentHandler);
                    delete element._assignmentHandler;
                }

                if (!lineUuid) {
                    element.style.cursor = 'default';
                    return;
                }

                if (isAdmin) {
                    element.style.cursor = 'pointer';
                    element.title = 'Click to assign';

                    const handler = (event) => {
                        event.stopPropagation();
                        if (!window.assignmentManager) {
                            return;
                        }
                        window.assignmentManager.showDropdown(lineUuid, element);
                    };

                    element._assignmentHandler = handler;
                    element.addEventListener('click', handler);
                    element.classList.remove('assignment-disabled');
                } else {
                    element.style.cursor = 'not-allowed';
                    element.title = 'Only admins can assign conversations';
                    element.classList.add('assignment-disabled');
                }
            });
        };

        // Setup assignment click events using new system
        setTimeout(() => {
            if (window._conversationListRenderId !== renderId) return;
            if (typeof window._setupAssignmentClickEvents === 'function') {
                window._setupAssignmentClickEvents();
            }
        }, 100);

        // Add styles for empty state
        const emptyStateStyles = document.createElement('style');
        emptyStateStyles.textContent = `
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                text-align: center;
                color: #666;
            }
            
            .empty-state i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #ccc;
            }
            
            .empty-state p {
                margin: 0;
                font-size: 16px;
                font-weight: 500;
            }
            
            .empty-state-subtitle {
                font-size: 14px !important;
                color: #999;
                margin-top: 8px !important;
            }
        `;
        document.head.appendChild(emptyStateStyles);

        console.log('✅ Conversations rendered successfully');

        // Always clear unread badge for the currently open conversation after render
        if (currentState.currentConversationId && typeof updateUnreadBadge === 'function') {
            updateUnreadBadge(currentState.currentConversationId, 0);
        }
    } catch (error) {
        console.error('Error rendering conversations:', error);
        const conversationsList = document.getElementById('conversations-list');
        if (conversationsList) {
            conversationsList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load conversations: ${error.message}</p>
                    <button class="btn-secondary" onclick="renderConversationsList()">Retry</button>
                </div>
            `;
        }
    } finally {
        window._renderingConversations = false;
    }
}


// ฟังก์ชันสำหรับแสดงไอคอนของแอพ
function getAppIcon(appName) {
    switch (appName) {
        case 'messenger':
            return '<i class="fab fa-facebook-messenger"></i>';
        case 'line':
            return '<i class="fab fa-line"></i>';
        case 'instagram':
            return '<i class="fab fa-instagram"></i>';
        case 'shopee':
            return '<i class="fas fa-shopping-bag"></i>';
        case 'lazada':
            return '<i class="fas fa-shopping-cart"></i>';
        case 'tiktok':
            return '<i class="fab fa-tiktok"></i>';
        default:
            return '<i class="fas fa-comment"></i>';
    }
}

// Setup filter dropdown events
function setupFilterEvents() {
    const filterChips = document.querySelector('.filter-chips');
    if (!filterChips) {
        console.warn('Filter chips container not found, skipping filter setup');
        return;
    }

    filterChips.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('.filter-btn');
        if (!filterBtn) return;

        // Get the filter value
        const filterValue = filterBtn.dataset.filter;

        // Apply the filter (this will handle the visual changes)
        applyFilter(filterValue);
    });

    // Add hover effect styles for better UX
    const style = document.createElement('style');
    style.textContent = `
        .filter-btn {
            transition: all 0.2s ease;
            position: relative;
        }
        
        .filter-btn:hover {
            background-color: #feffe0;
        }
        
        
    `;
    document.head.appendChild(style);
}

function applyFilter(filterValue) {
    // If 'all' is clicked, reset the filter selections
    if (filterValue === 'all') {
        selectedFilters = ['all'];

        // Remove active class from all filter buttons except 'all'
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.filter !== 'all') {
                btn.classList.remove('active');
            } else {
                btn.classList.add('active');
            }
        });
    } else {
        // If a specific filter is clicked
        const filterBtn = document.querySelector(`.filter-btn[data-filter="${filterValue}"]`);

        // If filter already selected, remove it
        if (selectedFilters.includes(filterValue)) {
            selectedFilters = selectedFilters.filter(filter => filter !== filterValue);
            filterBtn.classList.remove('active');

            // If no filters remain, select 'all'
            if (selectedFilters.length === 0 || (selectedFilters.length === 1 && selectedFilters[0] === 'all')) {
                selectedFilters = ['all'];
                document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
            }
        } else {
            // Add the new filter
            // If 'all' was previously selected, remove it
            if (selectedFilters.includes('all')) {
                selectedFilters = selectedFilters.filter(filter => filter !== 'all');
                document.querySelector('.filter-btn[data-filter="all"]').classList.remove('active');
            }

            // Add the new filter
            selectedFilters.push(filterValue);
            filterBtn.classList.add('active');
        }
    }

    // Apply the filters
    filterConversationElements();
}

// Add styles for filter button and dropdown
const additionalFilterStyles = document.createElement('style');
additionalFilterStyles.textContent = `
    .filter-btn {
        padding: 2px 12px;
        background-color: #f7fab9ff;
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
    }

    .filter-btn:hover {
        background-color: #f7fab9ff;
    }

    .filter-btn i {
            font-size: 14px;
            color: #414141;
        }

    .filter-dropdown {
        position: relative;
        display: inline-block;
    }

    .filter-dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        top: 100%;
        background-color: #fff;
        min-width: 200px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-radius: 8px;
        z-index: 1000;
        margin-top: 5px;
        padding: 8px 0;
    }

    .filter-dropdown-content.show {
        display: block;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from { 
            opacity: 0; 
            transform: translateY(-10px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }
`;

document.head.appendChild(additionalFilterStyles);

// Update active filter chip
function updateFilterChip(filterText) {
    const filterChips = document.getElementById('filter-chips');
    if (filterChips) {
        let chipClass = '';
        let chipBadge = '';

        if (filterText === 'Line') {
            chipClass = 'line-chip';
            chipBadge = '<div class="filter-badge line-badge"><i class="fab fa-line"></i></div>';
        } else if (filterText === 'Manual') {
            chipClass = 'manual-chip';
            chipBadge = '<div class="filter-badge manual-badge"><i class="fas fa-hand-paper"></i></div>';
        } else if (filterText === 'Facebook') {
            chipClass = 'facebook-chip';
            chipBadge = '<div class="filter-badge facebook-badge"><i class="fab fa-facebook-f"></i></div>';
        } else if (filterText === 'Instagram') {
            chipClass = 'instagram-chip';
            chipBadge = '<div class="filter-badge instagram-badge"><i class="fab fa-instagram"></i></div>';
        } else if (filterText === 'All Apps') {
            chipBadge = '<div class="filter-badge all-badge"><i class="fas fa-globe"></i></div>';
        }

        filterChips.innerHTML = `<span class="active-filter-chip ${chipClass}">${chipBadge}${filterText}</span>`;
    }
}

// Filter existing conversation elements based on current filter
function filterConversationElements() {
    const conversationItems = document.querySelectorAll('.conversation-item');
    let hasVisibleItems = false;

    conversationItems.forEach(item => {
        const lineUuid = item.dataset.id;
        const messageChannel = item.dataset.messageChannel || '';
        const appType = item.dataset.app || '';

        let shouldShow = false;

        // If 'all' is selected, show everything
        if (selectedFilters.includes('all')) {
            shouldShow = true;
        } else {
            // Check if any of the selected filters match this item
            for (const filter of selectedFilters) {
                if ((filter === 'line' && isLineChannel(messageChannel, lineUuid)) ||
                    (filter === 'facebook' && isFacebookChannel(messageChannel, lineUuid)) ||
                    (filter === 'instagram' && isInstagramChannel(messageChannel, lineUuid)) ||
                    (filter === 'manual' && appType === 'manual') ||
                    (filter === 'whatsapp' && appType === 'whatsapp') ||
                    (filter === 'telegram' && appType === 'telegram')) {
                    shouldShow = true;
                    break;
                }
            }
        }

        if (shouldShow) {
            item.style.display = 'flex';
            hasVisibleItems = true;
        } else {
            item.style.display = 'none';
        }
    });

    // Show empty state if no items match filter
    showEmptyStateIfNeeded(hasVisibleItems);
}

// Helper functions to check channel types
function isLineChannel(messageChannel, lineUuid) {
    const channel = (messageChannel || '').toLowerCase();
    const uuid = String(lineUuid || '').toLowerCase();
    return channel === 'line' ||
        (!messageChannel && !uuid.includes('facebook') && !uuid.includes('instagram'));
}

function isFacebookChannel(messageChannel, lineUuid) {
    const channel = String(messageChannel || '').toLowerCase();
    const uuid = String(lineUuid || '').toLowerCase();
    return channel === 'fb' ||
        channel === 'facebook' ||
        channel === 'messenger' ||
        uuid.startsWith('fb_') ||
        uuid.includes('facebook') ||
        (uuid.match(/^\d{10,}$/) && !channel.includes('instagram') && !channel.includes('ig'));
}

function isInstagramChannel(messageChannel, lineUuid) {
    const channel = String(messageChannel || '').toLowerCase();
    const uuid = String(lineUuid || '').toLowerCase();
    return channel === 'ig' ||
        channel === 'instagram' ||
        uuid.startsWith('ig_') ||
        uuid.includes('instagram');
}

function isWhatsAppChannel(messageChannel, lineUuid) {
    const channel = (messageChannel || '').toLowerCase();
    const uuid = String(lineUuid || '').toLowerCase();
    return channel === 'whatsapp' || uuid.includes('whatsapp');
}

function isTelegramChannel(messageChannel, lineUuid) {
    const channel = (messageChannel || '').toLowerCase();
    const uuid = String(lineUuid || '').toLowerCase();
    return channel === 'telegram' || uuid.includes('telegram');
}

// Show empty state if no conversations match the filter
function showEmptyStateIfNeeded(hasVisibleItems) {
    const conversationsList = document.getElementById('conversations-list');
    const existingEmptyState = conversationsList.querySelector('.empty-filter-results');
    const totalItems = conversationsList.querySelectorAll('.conversation-item').length;

    // If there are no conversation items at all, rely on the global empty state only
    if (totalItems === 0) {
        if (existingEmptyState) existingEmptyState.remove();
        return;
    }

    if (!hasVisibleItems) {
        if (!existingEmptyState) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-filter-results';
            emptyState.innerHTML = `
                <i class="fas fa-filter"></i>
                <p>No conversations found for this filter</p>
                <button class="btn-secondary clear-filter-btn">Clear Filter</button>
            `;

            conversationsList.appendChild(emptyState);

            const clearFilterBtn = emptyState.querySelector('.clear-filter-btn');
            if (clearFilterBtn) {
                clearFilterBtn.addEventListener('click', () => {
                    applyFilter('all');
                });
            }
        }
    } else if (existingEmptyState) {
        existingEmptyState.remove();
    }
}

// Filter conversations based on search term
function filterConversations(searchTerm) {
    const conversationItems = document.querySelectorAll('.conversation-item');
    let hasVisibleItems = false;

    conversationItems.forEach(item => {
        const name = (item.querySelector('.conversation-name')?.textContent || '').toLowerCase();
        const message = (item.querySelector('.conversation-last-message')?.textContent || '').toLowerCase();
        const lineUuid = item.dataset.id;
        const messageChannel = item.dataset.messageChannel || '';
        const appType = item.dataset.app || '';

        // Check if conversation passes the app filter
        let passesAppFilter = false;

        // If 'all' is selected, pass the filter
        if (selectedFilters.includes('all')) {
            passesAppFilter = true;
        } else {
            // Check if any of the selected filters match this item
            for (const filter of selectedFilters) {
                if ((filter === 'line' && isLineChannel(messageChannel, lineUuid)) ||
                    (filter === 'facebook' && isFacebookChannel(messageChannel, lineUuid)) ||
                    (filter === 'instagram' && isInstagramChannel(messageChannel, lineUuid)) ||
                    (filter === 'manual' && appType === 'manual') ||
                    (filter === 'whatsapp' && appType === 'whatsapp') ||
                    (filter === 'telegram' && appType === 'telegram')) {
                    passesAppFilter = true;
                    break;
                }
            }
        }

        // Check if passes search filter
        const searchTermLower = searchTerm.toLowerCase();
        const passesSearchFilter = searchTerm === '' ||
            name.includes(searchTermLower) ||
            message.includes(searchTermLower);

        // Show only if both filters pass
        if (passesAppFilter && passesSearchFilter) {
            item.style.display = 'flex';
            hasVisibleItems = true;
        } else {
            item.style.display = 'none';
        }
    });

    // Show appropriate empty state
    showEmptySearchStateIfNeeded(hasVisibleItems, searchTerm);
}

// Show empty search state if no conversations match the search term
function showEmptySearchStateIfNeeded(hasVisibleItems, searchTerm) {
    const conversationsList = document.getElementById('conversations-list');
    const existingEmptyState = conversationsList.querySelector('.empty-search-results, .empty-filter-results');
    const totalItems = conversationsList.querySelectorAll('.conversation-item').length;

    // If there are no conversation items at all, do not show filter/search empty states
    if (totalItems === 0) {
        if (existingEmptyState) existingEmptyState.remove();
        return;
    }

    if (!hasVisibleItems) {
        if (!existingEmptyState) {
            const emptyState = document.createElement('div');
            emptyState.className = searchTerm ? 'empty-search-results' : 'empty-filter-results';
            emptyState.innerHTML = `
                <i class="${searchTerm ? 'fas fa-search' : 'fas fa-filter'}"></i>
                <p>No conversations found</p>
                <button class="btn-secondary clear-filter-btn">Clear ${searchTerm ? 'Search' : 'Filter'}</button>
            `;

            conversationsList.appendChild(emptyState);

            const clearFilterBtn = emptyState.querySelector('.clear-filter-btn');
            if (clearFilterBtn) {
                clearFilterBtn.addEventListener('click', () => {
                    if (searchTerm) {
                        document.getElementById('search-conversations').value = '';
                        filterConversations('');
                    } else {
                        applyFilter('all');
                    }
                });
            }
        }
    } else if (existingEmptyState) {
        existingEmptyState.remove();
    }
}

// Show empty chat when no conversation is selected
function renderEmptyChat() {
    const chatSection = document.getElementById('chat-section');
    chatSection.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-actions">
                <button class="btn-icon" id="start-audio-call" title="Audio call"><i class="fas fa-phone-alt"></i></button>
                <button class="btn-icon" id="start-video-call" title="Video call"><i class="fas fa-video"></i></button>
                <button class="btn-icon" id="shoew-panels" ><i class="fi fi-br-menu-dots-vertical"></i></button>
                <!-- <button class="btn-icon" id="show-profile-modal" title="View profile"><i class="fas fa-user"></i></button> -->
                <div class="more-options">
                    <button class="btn-icon more-options-btn" title="More options"><i class="fas fa-ellipsis-v"></i></button>
                    <div class="more-options-dropdown">
                        <div class="more-options-item block-option">
                            <i class="fas fa-ban"></i>
                            <span>Block</span>
                        </div>
                        <div class="more-options-item delete-option">
                            <i class="fas fa-trash"></i>
                            <span>Delete</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="empty-chat-state">
            <i class="fas fa-comments"></i>
            <p>Select a conversation to start messaging</p>
        </div>
    `;
}

// Add styles for more options dropdown
const moreOptionsStyles = document.createElement('style');
moreOptionsStyles.textContent = `
    .more-options {
        position: relative;
        display: inline-block;
    }
    
    .more-options-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        width: 200px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: none;
        overflow: hidden;
        margin-top: 5px;
    }
    
    .more-options-dropdown.show {
        display: block;
        animation: fadeIn 0.2s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .more-options-item {
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .more-options-item:hover {
        background-color: #f5f5f5;
    }
    
    .more-options-item i {
        width: 16px;
        text-align: center;
    }
    
    .add-label-option i {
        color: #1890ff;
    }
    
    .block-option i {
        color: #ff9800;
    }
    
    .delete-option i {
        color: #f44336;
    }
`;

document.head.appendChild(moreOptionsStyles);

// Update setupChatEventListeners function
function setupChatEventListeners() {
    // ... existing event listeners ...

    // Handle more options dropdown
    document.addEventListener('click', function (e) {
        const moreOptionsBtn = e.target.closest('.more-options-btn');
        if (moreOptionsBtn) {
            e.preventDefault();
            e.stopPropagation();

            const dropdown = moreOptionsBtn.closest('.more-options').querySelector('.more-options-dropdown');
            if (dropdown) {
                // Close all other dropdowns
                document.querySelectorAll('.more-options-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('show');
                });
                dropdown.classList.toggle('show');
            }
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.more-options-dropdown') && !e.target.closest('.more-options-btn')) {
            document.querySelectorAll('.more-options-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Handle dropdown options
    document.addEventListener('click', function (e) {
        const option = e.target.closest('.more-options-item');
        if (!option) return;

        if (option.classList.contains('add-label-option')) {
            // Add your label logic here
        } else if (option.classList.contains('block-option')) {
            const conversationId = currentState.currentConversationId;
            if (conversationId) {
                handleBlockUser(conversationId);
            }
        } else if (option.classList.contains('delete-option')) {
            const conversationId = currentState.currentConversationId;
            if (conversationId) {
                handleDeleteConversation(conversationId);
            }
        }
    });

    // Handle message input keypress
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent new line
                const message = this.value.trim();
                if (message) {
                    const lineUuid = currentState.currentConversationId;
                    if (lineUuid) {
                        sendMessage(e, lineUuid);
                    }
                }
            }
        });

        // Auto-resize textarea
        messageInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
}

// แก้ไขส่วนของฟังก์ชัน loadConversation และ sendMessage

// แก้ไขฟังก์ชัน loadConversation เพื่อให้ chat header แสดงตลอด


// Add this function after fetchSheetData
async function clearUnreadCount(lineUuid) {
    try {
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbyNdkxRcLkls4tvZS5UPN8cGB-WUtr6ClXgnyQlF3Frkg3sYuEq77jCfSMc4nsXcLPN-A/exec';

        const data = {
            lineUuid: lineUuid,
            unreadChat: '0' // Clear the unread count with explicit zero for sheet/n8n
        };

        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Notify backend to mark conversation as viewed (updates Firebase conversation_views)
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        await fetch('/api/clear-unread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ lineUuid })
        }).catch(error => {
            console.warn('Failed to notify backend to clear unread count:', error);
        });

        // Update any cached latest message entries so rerenders stay in sync without reload
        if (window.latestMessages instanceof Map && window.latestMessages.has(lineUuid)) {
            const latestMessage = window.latestMessages.get(lineUuid) || {};
            window.latestMessages.set(lineUuid, { ...latestMessage, unreadCount: 0 });
        }

        return true;
    } catch (error) {
        console.error('Error clearing unread count:', error);
        return false;
    }
}

// Update unread badge displays consistently and keep cache in sync
function updateUnreadBadge(lineUuid, unreadCount) {
    if (!lineUuid) return;

    if (!Number.isFinite(unreadCount)) {
        unreadCount = parseInt(unreadCount, 10);
    }
    unreadCount = Math.max(0, unreadCount || 0);

    if (!(window.unreadBadgeCounts instanceof Map)) {
        window.unreadBadgeCounts = new Map();
    }

    const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    if (conversationItem) {
        const indicatorsDiv = conversationItem.querySelector('.conversation-indicators');
        let unreadBadge = indicatorsDiv?.querySelector('.unread-badge');

        if (unreadCount > 0) {
            if (!unreadBadge && indicatorsDiv) {
                unreadBadge = document.createElement('span');
                unreadBadge.className = 'unread-badge';
                indicatorsDiv.appendChild(unreadBadge);
            }
            if (unreadBadge) {
                unreadBadge.textContent = String(unreadCount);
            }
            conversationItem.classList.add('unread');
            conversationItem.setAttribute('data-unread-count', String(unreadCount));
        } else {
            if (unreadBadge) unreadBadge.remove();
            conversationItem.classList.remove('unread');
            conversationItem.setAttribute('data-unread-count', '0');
        }
    }

    // Update global cache to ensure future renders keep in sync
    if (window.latestMessages instanceof Map && window.latestMessages.has(lineUuid)) {
        const latestMessage = window.latestMessages.get(lineUuid) || {};
        window.latestMessages.set(lineUuid, { ...latestMessage, unreadCount });
    }

    if (unreadCount > 0) {
        window.unreadBadgeCounts.set(lineUuid, unreadCount);
    } else {
        window.unreadBadgeCounts.delete(lineUuid);
    }
}

window.updateUnreadBadge = updateUnreadBadge;

async function loadConversation(lineUuid, isLoadingMore = false) {
    if (messageLoadingState.isLoading) return;
    messageLoadingState.isLoading = true;

    // Check for existing assignments in the information tab after a short delay
    setTimeout(checkExistingAssignments, 1000);

    try {
        // Validate lineUuid
        if (!lineUuid) {
            console.error('Invalid lineUuid:', lineUuid);
            throw new Error('Invalid conversation ID');
        }

        // Reset state if loading a new conversation
        if (!isLoadingMore) {
            messageLoadingState.page = 1;
            messageLoadingState.hasMore = true;
            currentState.currentConversationId = lineUuid;

            // Subscribe to Reverb channel for real-time messages in this chat
            if (typeof subscribeReverbChat === 'function') {
                subscribeReverbChat(lineUuid);
            }
        }

        // Calculate message range for pagination
        const startIndex = (messageLoadingState.page - 1) * messageLoadingState.messagesPerPage;

        // Show loading state in chat section
        const chatSection = document.getElementById('chat-section');
        const selectedConversation = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
        let displayNameFromList = 'User';
        let profileImageUrl = 'images/default-user.jpg';
        let appType = 'line';
        let platformUserId = '';

        // Get initial display info from conversation list item for immediate display
        if (selectedConversation) {
            const nameElement = selectedConversation.querySelector('.conversation-name');
            if (nameElement && nameElement.textContent) {
                displayNameFromList = nameElement.textContent;
            }
            const avatarImg = selectedConversation.querySelector('.conversation-avatar img');
            if (avatarImg) {
                profileImageUrl = avatarImg.src;
            }
            appType = selectedConversation.dataset.app || 'line';
            platformUserId = selectedConversation.dataset.platformUserId || '';
            const platformChannel = selectedConversation.dataset.platformChannel || appType || '';
            // Fallback: for Meta, if platformUserId is missing, use lineUuid as the platform key
            if (!platformUserId && (platformChannel === 'facebook' || platformChannel === 'instagram' || lineUuid.startsWith('FB_') || lineUuid.startsWith('IG_'))) {
                platformUserId = lineUuid;
            }
        }

        // Immediately show chat UI with available info
        if (!isLoadingMore) {
            chatSection.innerHTML = `
                <div class="chat-header">
                    <div class="chat-header-info">
                         <button class="btn-icon close-chat-btn" id="close-chat"><i class="fi fi-br-circle-xmark"></i></button>
                        <div class="chat-profile">
                            <div class="conversation-avatar">
                                <img src="${profileImageUrl}" alt="${displayNameFromList}" onerror="handleImageError(this, '${displayNameFromList}')">
                                <div class="source-app-badge ${appType}-badge">
                                    <i class="fab fa-${appType}"></i>
                                </div>
                            </div>
                            <div class="chat-profile-info">
                                <h3>${displayNameFromList}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button class="btn-icon" id="start-audio-call"><i class="fa-solid fa-phone" style="color: #000000ff; font-size: 0.9rem"></i></button>
                        <button class="btn-icon" id="start-video-call"><i class="fa-solid fa-video" style="color: #000000ff; font-size: 0.9rem"></i></button>
                        <button class="btn-icon" id="shoew-panels"><i class="fi fi-br-menu-dots-vertical"></i></button>
                    </div>
                </div>
                <div class="chat-messages-wrapper">
                    <div id="chat-messages-container" class="chat-messages">    
                        <div class="loading-indicator">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <button class="btn-icon" onclick="triggerFileUpload('${lineUuid}')"><i class="fas fa-paperclip"></i></button>
                        <input type="file" id="file-upload-${lineUuid}" style="display: none;" onchange="handleFileUpload(event, '${lineUuid}')" accept="image/*,application/pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.zip,.rar,.mp4,.mp3,.wav,.avi,.mov">
                        <textarea id="message-input" placeholder="Aa" rows="1"></textarea>
                        <button class="btn-icon" onclick="toggleEmojiPicker()"><i class="fi fi-rr-grin-alt"></i></button>
                        <button class="send-btn" onclick="sendMessage(event, '${lineUuid}', '${displayNameFromList.replace(/'/g, '\\\'')}')">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Fetch data from Laravel backend instead of Google Sheets
        let sheet1Data = [], sheet2Data = [], manualChatData = [], userProfile = {};

        try {
            const queryParams = new URLSearchParams({ lineUuid });
            if (platformUserId) {
                queryParams.append('platformUserId', platformUserId);
            }

            // Fetch conversations from Laravel backend with specific lineUuid/platform filter
            const response = await fetch(`/api/line-conversations?${queryParams.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const conversationsData = await response.json();
                if (conversationsData.success && conversationsData.data) {
                    const filteredRecords = conversationsData.data.filter(conv => {
                        const matchesLineUuid = conv.lineUuid === lineUuid;
                        const matchesPlatform = platformUserId && conv.platformUserId === platformUserId;
                        return matchesLineUuid || matchesPlatform;
                    });

                    // Convert to expected format
                    // For Meta platforms, use platformUserId as primary key in row[0]
                    sheet2Data = filteredRecords.map(conv => [
                        (platformUserId && conv.platformUserId === platformUserId) ? platformUserId : (conv.lineUuid || ''),
                        conv.chatSequence || '',
                        conv.message || '',
                        conv.aiResponse || '',
                        conv.time || '',
                        conv.linkImage || '',
                        conv.displayName || '',
                        conv.messageChannel || '',
                        conv.chatMode || '',
                        '', '', '', '', // placeholders
                        conv.assignTeam || '',
                        conv.unreadCount || 0,
                        conv.platformUserId || platformUserId || ''
                    ]);

                    console.log(`📋 Loaded ${sheet2Data.length} messages for conversation ${lineUuid}`);
                }
            } else {
                console.warn('Failed to fetch conversation history from Laravel backend');
                sheet2Data = [];
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            sheet2Data = [];
        }

        // Skip ManualChat entirely as it's causing 400 errors and not essential
        manualChatData = [];

        // Check if we have conversation data from Laravel backend
        if (!sheet2Data || sheet2Data.length === 0) {
            console.log('No conversation data available for this chat');
            // Don't throw error, just show empty chat
        }

        // Clear unread count after loading data
        if (!isLoadingMore) {
            clearUnreadCount(lineUuid).catch(console.error); // Don't await this
        }

        // Update chat header with complete info
        if (!isLoadingMore) {
            let labelColor = '#1890ff';
            let label = '';
            let unreadCount = 0;

            // Find user data in Sheet1
            const userData = sheet1Data.find(row => row[0] === lineUuid);
            if (userData) {
                if (userData[11] && userData[11].trim()) profileImageUrl = userData[11];
                if (userData[10] && userData[10].trim()) label = userData[10];
                if (userData[13] && userData[13].trim()) labelColor = userData[13];
                unreadCount = userData[12] ? parseInt(userData[12]) : 0;
            }

            // Update header with complete info
            const chatHeader = document.querySelector('.chat-header');
            if (chatHeader) {
                const headerInfo = chatHeader.querySelector('.chat-profile-info');
                if (headerInfo && label) {
                    headerInfo.innerHTML = `
                        <span class="conversation-label">
                            <span class="label-dot" style="background-color: ${labelColor}"></span>
                            ${label}
                        </span>
                        <h3>${displayNameFromList}</h3>
                    `;
                }
            }
        }

        // Continue with message loading...

        // Process messages from both sheets
        const allMessages = [];
        let lastDate = null;
        const chatMessagesContainer = document.getElementById('chat-messages-container');
        if (!chatMessagesContainer) return;

        const conversationChannel = selectedConversation?.dataset.messageChannel || '';

        // Process Sheet1 data (legacy source). Keep header-skip.
        if (sheet1Data && sheet1Data.length > 1) {
            for (let i = 1; i < sheet1Data.length; i++) {
                const row = sheet1Data[i];
                if (row && row[0] === lineUuid) {
                    allMessages.push({
                        message: row[2],
                        aiResponse: row[3],
                        time: row[4],
                        linkImage: row[5] || '',
                        chatSequence: row[1],
                        source: 'Sheet1'
                    });
                }
            }
        }

        // Process Sheet2 data from Laravel/Firebase (no header row)
        if (sheet2Data && sheet2Data.length > 0) {
            for (let i = 0; i < sheet2Data.length; i++) {
                const row = sheet2Data[i];
                if (!row) continue;

                const rowLineUuid = row[0];
                const rowPlatformId = row[15] || '';
                // For Meta platforms, row[0] is already set to platformUserId by the map above
                const matchesLineUuid = rowLineUuid === lineUuid;
                const matchesPlatform = platformUserId && (rowLineUuid === platformUserId || rowPlatformId === platformUserId);

                if (!matchesLineUuid && !matchesPlatform) {
                    continue;
                }

                const userInput = (row[2] ?? '').toString().trim();
                const aiResponse = (row[3] ?? '').toString().trim();
                const linkImage = row[5] || '';
                const timestamp = row[4];
                const chatSequence = row[1];
                const rowMessageChannel = row[7] || ''; // Use only the row's own messageChannel; avoid card-level fallback
                const displayName = row[6] || 'LINE User';
                const normalizedRowChannel = (rowMessageChannel || '').toString().toLowerCase();
                const isBackofficeChannel = (
                    normalizedRowChannel.includes('backoffice') ||
                    normalizedRowChannel.includes('manual') ||
                    normalizedRowChannel.includes('admin') ||
                    normalizedRowChannel === 'ai'
                );

                // Determine message source based on which field has content
                // Incoming/user message: only when NOT a backoffice record
                if (!isBackofficeChannel && (userInput || (!aiResponse && linkImage))) {
                    // User message (from LINE) or image-only from user
                    allMessages.push({
                        message: userInput,
                        time: timestamp,
                        linkImage: linkImage,
                        chatSequence: chatSequence + '_incoming',
                        source: 'WEBHOOK',
                        type: 'incoming',
                        isUserMessage: false,
                        messageChannel: rowMessageChannel || 'Line',
                        displayName: displayName
                    });
                }

                // Admin/backoffice response: prefer aiResponse, but also support text in 'message' (row[2])
                const adminText = aiResponse || (isBackofficeChannel ? userInput : '');
                if (adminText || (!userInput && !aiResponse && linkImage && isBackofficeChannel)) {
                    // Admin response (from backoffice) or image-only from admin
                    allMessages.push({
                        message: adminText,
                        aiResponse: adminText, // Include aiResponse field for rendering consistency
                        time: timestamp,
                        linkImage: linkImage,
                        chatSequence: chatSequence + '_outgoing',
                        source: 'RESPONSE',
                        type: 'outgoing',
                        isUserMessage: true,
                        messageChannel: rowMessageChannel || 'BackOffice',
                        displayName: displayName,
                        platformUserId: row[15] || platformUserId || ''
                    });
                } else if (!userInput && linkImage && !isBackofficeChannel) {
                    // Image-only from admin (backoffice upload)
                    allMessages.push({
                        message: '',
                        time: timestamp,
                        linkImage: linkImage,
                        chatSequence: chatSequence + '_outgoing',
                        source: 'FRONTEND',
                        type: 'outgoing',
                        isUserMessage: true,
                        messageChannel: rowMessageChannel || 'BackOffice',
                        displayName: displayName
                    });
                }
            }
        }

        // Process manual chat messages (no header row)
        if (manualChatData && manualChatData.length > 0) {
            for (let i = 0; i < manualChatData.length; i++) {
                const row = manualChatData[i];
                if (!row || row[0] !== lineUuid) continue;

                allMessages.push({
                    message: row[2],
                    time: row[4],
                    linkImage: row[5] || '',
                    chatSequence: row[1],
                    source: 'manual',
                    displayName: '',
                    messageChannel: row[7] || '',
                    type: 'message'
                });
            }
        }

        // Sort messages by time (newest to oldest)
        allMessages.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Get the latest message
        const latestMessage = allMessages[0];

        // Don't update conversation list here - it should only be updated when new messages arrive


        // Sort messages by time (oldest to newest) for chat display
        allMessages.sort((a, b) => new Date(a.time) - new Date(b.time));

        // For pagination, we want to show the most recent messages first
        // and load older messages when scrolling to top
        const totalMessages = allMessages.length;
        const messagesToShow = Math.min(messageLoadingState.page * messageLoadingState.messagesPerPage, totalMessages);

        // Update hasMore flag - there are more messages if we haven't shown all yet
        messageLoadingState.hasMore = messagesToShow < totalMessages;

        // Get the most recent messages up to the current page
        const paginatedMessages = allMessages.slice(-messagesToShow);

        // Get the messages container
        const messagesContainer = document.getElementById('chat-messages-container');
        const messagesWrapper = document.querySelector('.chat-messages-wrapper');

        // Remove loading indicator if it exists
        const loadingIndicator = messagesContainer.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Clear existing messages only if not loading more and not in a conversation
        if (!isLoadingMore && !currentState.currentConversationId) {
            messagesContainer.innerHTML = '';
        }

        // Get existing message IDs to prevent duplicates
        const existingMessageIds = new Set(
            Array.from(messagesContainer.children).map(el => el.dataset.messageId)
        );

        // Add a function to insert date headers
        const insertDateHeader = (date, container, insertBeforeElement) => {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.innerHTML = `<span>${formatDateHeader(date)}</span>`;

            if (insertBeforeElement) {
                container.insertBefore(dateHeader, insertBeforeElement);
            } else {
                container.appendChild(dateHeader);
            }

            return dateHeader;
        };

        // Track dates for adding headers
        let currentDate = null;

        // Add messages to the container
        paginatedMessages.forEach(msg => {
            // Create unique identifier for the message
            const messageId = `${msg.source}-${msg.chatSequence}-${msg.time}`;

            // Skip if message already exists
            if (existingMessageIds.has(messageId)) {
                return;
            }

            // Get message content - check both text and image content
            const messageContent = msg.message || msg.userInput || msg.aiResponse || '';
            const hasImage = !!(msg.linkImage && msg.linkImage.trim());

            // Skip only if there's no text content AND no image
            if (!messageContent.trim() && !hasImage) {
                return;
            }

            // Check if we need to add a date header
            const messageDate = new Date(msg.time).toDateString();
            if (currentDate !== messageDate) {
                insertDateHeader(msg.time, messagesContainer, null);
                currentDate = messageDate;
            }

            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.setAttribute('data-message-id', messageId);

            // Determine message class based on messageChannel and content
            const normalizedChannel = (msg.messageChannel || '').trim().toLowerCase();
            const isFromBackoffice = (
                normalizedChannel === 'admin' ||
                normalizedChannel === 'manual' ||
                normalizedChannel === 'manual chat' ||
                normalizedChannel === 'backoffice' ||
                normalizedChannel === 'ai'
            );
            const isFromLine = normalizedChannel === 'line' || normalizedChannel === '';

            // Determine by content when channel value carries platform info (e.g., facebook)
            const hasUserInput = Boolean(
                (msg.userInput && msg.userInput.trim()) ||
                (!msg.aiResponse && msg.message && msg.message.trim())
            );
            const hasAiResponse = Boolean(msg.aiResponse && msg.aiResponse.trim());

            let isOutgoingMessage = false;
            let isReceivedMessage = false;

            if (hasAiResponse && !hasUserInput) {
                // AI/Admin reply
                isOutgoingMessage = true;
                isReceivedMessage = false;
            } else if (hasUserInput && !hasAiResponse) {
                // User message
                isOutgoingMessage = false;
                isReceivedMessage = true;
            } else if (isFromBackoffice) {
                isOutgoingMessage = true;
                isReceivedMessage = false;
            } else if (isFromLine || !normalizedChannel) {
                isOutgoingMessage = false;
                isReceivedMessage = true;
            } else {
                // Fallback: default to incoming to avoid showing admin bubble for user text
                isOutgoingMessage = false;
                isReceivedMessage = true;
            }

            // Debug logging for file messages to check classification
            if (msg.linkImage || msg.fileName || (msg.aiResponse && msg.aiResponse.includes('📎'))) {
                console.log('🔍 File message classification:', {
                    messageId: msg.messageId,
                    source: msg.source,
                    messageChannel: msg.messageChannel,
                    type: msg.type,
                    isOutgoingMessage,
                    isReceivedMessage,
                    finalClass: (isOutgoingMessage && !isReceivedMessage) ? 'sent' : 'received'
                });
            }

            if (isOutgoingMessage && !isReceivedMessage) {
                messageElement.classList.add('sent'); // Your messages on the right (yellow)
            } else {
                messageElement.classList.add('received'); // Incoming LINE messages on the left (gray)
            }

            // Create message content - handle both text and images
            let messageContentHtml = '';

            if (hasImage) {
                // Handle image messages
                const url = msg.linkImage;
                const fileName = (() => {
                    try {
                        let n = '';
                        
                        // 1. Try explicitly provided fileName
                        if (msg.fileName && String(msg.fileName) !== 'undefined' && String(msg.fileName) !== 'null') {
                            n = String(msg.fileName);
                        } 
                        
                        // 2. Try to extract from message content (e.g. from n8n format)
                        if (!n || n === 'undefined') {
                            const match = messageContent.match(/\[ผู้ใช้ส่งไฟล์: (.*?)\]/);
                            if (match && match[1] && match[1] !== 'undefined') n = match[1];
                        }
                        
                        // 3. For Google Drive URLs – leave placeholder; async resolution happens after render
                        if ((!n || n === 'undefined') && typeof url === 'string' && url.includes('drive.google.com')) {
                            // Don't set n here; the file-item renderer will handle async name resolution
                            n = '';
                        }

                        // 4. Try parsing URL path
                        if (!n || n === 'undefined') {
                            if (url && String(url) !== 'undefined' && String(url) !== 'null') {
                                const decoded = decodeURIComponent(String(url).split('?')[0]);
                                n = decoded.split('/').pop();
                            }
                        }

                        // Final sanitization
                        if (n) {
                            // 1. ตัดส่วนที่ขึ้นต้นด้วย LINE_ จนถึงชุดตัวเลขหรืออักษรยาวๆ ที่คั่นด้วย underscore
                            n = n.replace(/^LINE_[a-z0-9]+(_[a-z0-9]+)*[-_]/i, '');
                            // 2. ถ้ายังมี timestamp ตัวเลขยาวๆ (10 หลักขึ้นไป) นำหน้า ให้ตัดออก
                            n = n.replace(/^\d{10,}_/, '');
                        }
                        
                        if (!n || n === 'undefined' || n === 'null' || n === 'drive-proxy.php') return 'Attachment';
                        return n;
                    } catch {
                        return 'Attachment';
                    }
                })();

                let preview = '';
                if (typeof url === 'string' && url.startsWith('LINE_IMAGE:')) {
                    const messageId = url.replace('LINE_IMAGE:', '');
                    preview = `<div class="file-preview">
                        <div class="line-image-loading" data-message-id="${messageId}">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>`;
                    // Download LINE image asynchronously
                    setTimeout(() => downloadLineImage(messageId), 100);
                } else if (typeof url === 'string' && (
                    /(png|jpg|jpeg|gif|webp|svg)/i.test(url.split('?')[0]) || 
                    /(png|jpg|jpeg|gif|webp|svg)/i.test(fileName) ||
                    (url.includes('drive.google.com') && (messageContent.includes('[ผู้ใช้ส่งรูปภาพ]') || messageContent.includes('[Image]')))
                )) {
                    const normalizedUrl = normalizeFileUrl(url);
                    preview = `<div class="file-preview"><img src="${normalizedUrl}" alt="file" style="max-width: 300px; max-height: 300px; border-radius: 8px;" onerror="handleImageLoadError(this, '${url}', 'Image not available')"></div>`;
                } else {
                    // Handle other file types (PDF, documents, etc.)
                    const fileExt = fileName.split('.').pop().toLowerCase();
                    let fileIcon = 'fas fa-file';
                    let iconColor = '#7f8c8d';

                    if (fileExt === 'pdf') {
                        fileIcon = 'fas fa-file-pdf';
                        iconColor = '#e74c3c';
                    } else if (['doc', 'docx'].includes(fileExt)) {
                        fileIcon = 'fas fa-file-word';
                        iconColor = '#2980b9';
                    } else if (['xls', 'xlsx'].includes(fileExt)) {
                        fileIcon = 'fas fa-file-excel';
                        iconColor = '#27ae60';
                    } else if (['ppt', 'pptx'].includes(fileExt)) {
                        fileIcon = 'fas fa-file-powerpoint';
                        iconColor = '#d35400';
                    } else if (['zip', 'rar', '7z'].includes(fileExt)) {
                        fileIcon = 'fas fa-file-archive';
                        iconColor = '#95a5a6';
                    } else if (fileExt === 'txt') {
                        fileIcon = 'fas fa-file-alt';
                        iconColor = '#34495e';
                    } else if (['mp4', 'avi', 'mov', 'mkv'].includes(fileExt)) {
                        fileIcon = 'fas fa-video';
                        iconColor = '#8e44ad';
                    } else if (['mp3', 'wav', 'ogg'].includes(fileExt)) {
                        fileIcon = 'fas fa-music';
                        iconColor = '#f39c12';
                    }

                    // Get file size if available (this would need to be passed from the backend)
                    const fileSizeText = ''; // We don't have size info here

                    const downloadUrl = (() => {
                        if (typeof url === 'string' && url.includes('drive.google.com')) {
                            const idMatch = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
                            if (idMatch) return `/drive-proxy.php?id=${idMatch[1]}&type=dl`;
                        }
                        return url;
                    })();

                    // For Google Drive files, resolve filename asynchronously
                    const driveIdForFile = (() => {
                        if (typeof url === 'string' && url.includes('drive.google.com')) {
                            const m = url.match(/\/file\/d\/([^/?#]+)/) || url.match(/[?&]id=([^&]+)/);
                            return m ? m[1] : null;
                        }
                        return null;
                    })();

                    const displayFileName = fileName || (driveIdForFile ? '\u0e42\u0e2b\u0e25\u0e14\u0e44\u0e1f\u0e25\u0e4c...' : 'Attachment');
                    const driveAttr = driveIdForFile ? ` data-drive-id="${driveIdForFile}"` : '';

                    preview = `<div class="file-item">
                        <div class="file-icon"><i class="${fileIcon}" style="color: ${iconColor};"></i></div>
                        <div class="file-info">
                            <div class="file-name"${driveAttr}>${displayFileName}</div>
                            ${fileSizeText ? `<div class="file-size">${fileSizeText}</div>` : ''}
                            <a href="${downloadUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
                        </div>
                    </div>`;

                    // Kick off async Drive filename resolution
                    if (driveIdForFile) {
                        resolveDriveFilenameInDom(driveIdForFile);
                    }
                }

                messageContentHtml = `
                    <div class="file-message">
                        ${preview}
                    </div>`;
            } else {
                // Handle text messages and make URLs clickable
                let processedContent = messageContent;

                // Convert URLs to clickable links
                processedContent = processedContent.replace(
                    /(https?:\/\/[^\s]+)/g,
                    '<a href="$1" target="_blank" class="message-link">$1</a>'
                );

                // Convert newlines to <br> for proper formatting
                processedContent = processedContent.replace(/\n/g, '<br>');

                messageContentHtml = `<div class="message-text">${processedContent}</div>`;
            }

            messageElement.innerHTML = `
                ${messageElement.classList.contains('received') ? `
                <div class="message-avatar">
                    <img src="${document.querySelector('.chat-profile img')?.src || '/images/default-user.png'}" alt="Profile" onerror="handleImageError(this, 'Profile')">
                </div>` : ''}
                <div class="message-content">
                    ${messageContentHtml}
                </div>
                <div class="message-time">${formatMessageTime(msg.time)}</div>
            `;

            messagesContainer.appendChild(messageElement);
        });

        // Rest of the code...

        // After rendering messages, scroll to bottom if not loading more
        if (messagesContainer && !isLoadingMore) {
            scrollToBottom(messagesContainer);
        }

        // Add scroll event listener for infinite scroll
        if (messagesWrapper) {
            // Remove existing scroll event listener if any
            messagesWrapper.removeEventListener('scroll', handleScroll);

            // Add new scroll event listener
            messagesWrapper.addEventListener('scroll', handleScroll);
        }

        if (!isLoadingMore) {
            // Scroll to bottom for new conversation
            // Wait for messages to render and images to load
            setTimeout(() => {
                if (messagesWrapper) {
                    messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
                }
            }, 100);

            // Add another check after a longer delay to ensure everything is loaded
            setTimeout(() => {
                if (messagesWrapper) {
                    messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
                }
            }, 500);
        }

        // Setup chat event listeners
        setupChatEventListeners();

        // After successfully loading conversation, update the last message in the conversation list
        const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
        if (conversationItem) {
            const lastMessageElement = conversationItem.querySelector('.conversation-last-message');
            if (lastMessageElement) {
                const lastMessage = allMessages[allMessages.length - 1];
                const cached = (window.latestMessageCache && window.latestMessageCache.get) ? window.latestMessageCache.get(lineUuid) : null;
                if (cached) {
                    const cachedTime = new Date(cached.timestamp).getTime();
                    const lastTime = new Date(lastMessage?.time || 0).getTime();
                    if (!isNaN(cachedTime) && (isNaN(lastTime) || cachedTime >= lastTime)) {
                        lastMessageElement.textContent = cached.text || (lastMessage ? lastMessage.message : '');
                    } else if (lastMessage) {
                        lastMessageElement.textContent = lastMessage.message;
                    }
                } else if (lastMessage) {
                    lastMessageElement.textContent = lastMessage.message;
                }
            }
        }

        // After chat is loaded, setup message input listener
        const messageInput = document.querySelector('.message-input');
        if (messageInput) {
            // Remove existing listener if any
            const newMessageInput = messageInput.cloneNode(true);
            messageInput.parentNode.replaceChild(newMessageInput, messageInput);

            newMessageInput.addEventListener('input', function () {
                const currentLineUuid = currentState.currentConversationId;

                if (currentLineUuid) {
                    const toggleWrapper = document.querySelector(`.toggle-wrapper[data-line-uuid="${currentLineUuid}"]`);
                    if (toggleWrapper && toggleWrapper.classList.contains('ai')) {
                        // เปลี่ยน toggle UI เป็น manual
                        toggleWrapper.classList.remove('ai');
                        toggleWrapper.classList.add('manual');
                        // ส่ง webhook
                        if (window.statusWebhook && window.statusWebhook.sendUpdate) {
                            window.statusWebhook.sendUpdate(currentLineUuid, 'manual chat');
                        }
                        // แจ้งเตือน Manual
                        if (typeof showStatusUpdateSuccess === 'function') {
                            showStatusUpdateSuccess('manual chat');
                        }
                    }
                }
            });
        } else {
        }

        // Clear unread badge when entering chat
        if (!isLoadingMore && window.unreadChat) {
            window.unreadChat.clearUnreadOnChatEnter(lineUuid);
        }

    } catch (error) {
        console.error('Error loading conversation:', error);
        if (!isLoadingMore) {
            const chatSection = document.getElementById('chat-section');
            chatSection.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load conversation: ${error.message}</p>
                    <button class="btn-secondary" onclick="loadConversation('${lineUuid}')">Retry</button>
                </div>
            `;
        }
    } finally {
        messageLoadingState.isLoading = false;
        // Always clear unread badge for the conversation we just opened
        if (typeof updateUnreadBadge === 'function') {
            updateUnreadBadge(lineUuid, 0);
        }
    }
}

// Function to update conversation last message in real-time
function updateConversationLastMessage(lineUuid, messageText, timestamp) {
    // Allow new conversations to appear for all users initially
    // Assignment filtering will be applied when rendering the full conversation list
    if (window.assignmentManager && window.assignmentManager.currentUser) {
        const isAdmin = window.assignmentManager.canSeeAllConversations();
        const assignment = window.assignmentManager.getAssignment(lineUuid);
        const canSeeAssigned = window.assignmentManager.canSeeConversation(lineUuid);

        // Allow if: admin, has assignment access, OR it's a new conversation (no assignment yet)
        if (!isAdmin && !canSeeAssigned && assignment) {
            // Only block if user is not admin AND can't see assigned conversation AND conversation is already assigned to someone else
            console.log('🚫 User cannot see assigned conversation, skipping update:', lineUuid);
            return;
        }
    }

    const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    if (conversationItem) {
        // Track whether anything actually changed to avoid unnecessary DOM operations
        let changed = false;

        // Update the last message text only if different
        const lastMessageElement = conversationItem.querySelector('.conversation-last-message');
        const newText = messageText || 'No messages';
        if (lastMessageElement && lastMessageElement.textContent !== newText) {
            lastMessageElement.textContent = newText;
            changed = true;
        }

        // Update the conversation time only if different
        const timeElement = conversationItem.querySelector('.conversation-time-tag .time');
        if (timeElement && timestamp) {
            const formattedTime = formatMessageTime(timestamp);
            if (timeElement.textContent !== formattedTime) {
                timeElement.textContent = formattedTime;
                changed = true;
            }
        }

        const isActiveConversation = currentState.currentConversationId === lineUuid;

        // Always clear badge for the active conversation
        if (isActiveConversation) {
            updateUnreadBadge(lineUuid, 0);
            if (window.unreadBadgeCounts instanceof Map) {
                window.unreadBadgeCounts.delete(lineUuid);
            }
        }
        // NOTE: Removed optimistic unread increment. Unread badges are only set
        // from API data during renderConversationsList initial render.
        // This prevents badge flash/flicker when messages are updated via polling.

        // Move conversation to top only if content changed
        if (changed) {
            const conversationsList = document.getElementById('conversations-list');
            if (conversationsList && conversationsList.firstElementChild !== conversationItem) {
                conversationsList.prepend(conversationItem);
            }
        }

        if (changed) {
            console.log(`📨 Updated last message for ${lineUuid}: ${messageText} (checking unread badge...)`);
        }
    }

    // Update cache
    window.latestMessageCache.set(lineUuid, { text: messageText || 'No messages', timestamp: timestamp || new Date().toISOString() });
}

// Create or update a single conversation item without a full list refresh
function upsertConversationListItem(lineUuid, messageText, timestamp) {
    // Validate lineUuid to prevent corruption
    const uuid = String(lineUuid || '');
    if (!uuid || uuid.startsWith('file_') || uuid.includes('LINE_FILE')) {
        console.warn('🚫 Invalid lineUuid blocked from conversation list:', lineUuid);
        return;
    }

    // Debug logging for file-related messages
    if (messageText && messageText.includes('File:')) {
        console.log('📁 File message upsert:', { lineUuid, messageText, timestamp });
    }

    let item = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    const listContainer = document.getElementById('conversations-list');

    // Allow new conversations to appear for all users initially
    // Assignment filtering will be applied when rendering the full conversation list
    if (window.assignmentManager && window.assignmentManager.currentUser) {
        const isAdmin = window.assignmentManager.canSeeAllConversations();
        const assignment = window.assignmentManager.getAssignment(lineUuid);
        const canSeeAssigned = window.assignmentManager.canSeeConversation(lineUuid);

        // Allow if: admin, has assignment access, OR it's a new conversation (no assignment yet)
        if (!isAdmin && !canSeeAssigned && assignment) {
            // Only block if user is not admin AND can't see assigned conversation AND conversation is already assigned to someone else
            console.log('🚫 User cannot see assigned conversation, skipping upsert:', lineUuid);
            return;
        }
    }

    if (!item && listContainer) {
        // Build minimal card consistent with existing markup
        const profile = (window.userProfiles && window.userProfiles.get && window.userProfiles.get(lineUuid)) || {};
        const displayName = profile.displayName || `User`;
        let pictureUrl = sanitizeImageUrl(profile.pictureUrl) || '/images/default-user.png';
        const selectedConversation = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
        const existingChannel = selectedConversation?.dataset?.messageChannel || '';
        const existingPlatformId = selectedConversation?.dataset?.platformUserId || '';
        const existingPlatformChannel = selectedConversation?.dataset?.platformChannel || '';
        const appType = selectedConversation?.dataset?.app || 'line';

        item = document.createElement('div');
        item.className = 'conversation-item';
        item.dataset.id = lineUuid;
        item.dataset.app = appType;
        if (existingChannel) {
            item.dataset.messageChannel = existingChannel;
        }
        if (existingPlatformId) {
            item.dataset.platformUserId = existingPlatformId;
        }
        if (existingPlatformChannel) {
            item.dataset.platformChannel = existingPlatformChannel;
        }
        // <div class="chat-mode-toggle">
        //             <div class="toggle-wrapper manual" data-line-uuid="${lineUuid}">
        //                 <div class="slider"></div>
        //                 <div class="option ai-option">AI</div>
        //                 <div class="option manual-option">Manual</div>
        //             </div>
        //         </div>
        item.innerHTML = ` 
        <div class="conversation-time">  
        <div class="conversation-container">
            <div class="conversation-item-content">
                <div class="conversation-avatar">
                    <img src="${pictureUrl}" alt="${displayName}" onerror="handleImageError(this, '${displayName}')">
                    <div class="source-app-badge ${appType}-badge">
                        <i class="fab fa-${appType}"></i>
                    </div>
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <span class="conversation-name">${displayName}</span>
                        <span class="assigned-to-indicator" data-line-uuid="${lineUuid}" style="display: none;"></span>
                    </div>
                    <div class="conversation-last-message"></div>
                </div>
                <div class="conversation-time-tag">
                    <div class="time"></div>
                    <div class="conversation-indicators"></div>
                </div>
                
            </div>
        </div>
            <div class="conversation-meta">
                    <div class="assign-to-display">
                        <span class="assign-to-label">Assign to:</span>
                        <div class="assignment-placeholder" data-line-uuid="${lineUuid}">
                            <div class="not-assigned-display">
                                <span>Not assigned</span>
                            </div>
                        </div>
                    </div>
            </div> `;
        listContainer.prepend(item);
    }
    // Update content and move to top
    updateConversationLastMessage(lineUuid, messageText, timestamp);
}

// Function to add new message to currently open chat for real-time updates (from external sources only)
function addMessageToCurrentChat(messageData) {
    const messagesContainer = document.getElementById('chat-messages-container');
    if (!messagesContainer) return;

    // Generate message ID matching loadConversation format: source-chatSequence-time
    // This ensures dedup works between initial render and polling refresh
    const source = messageData.source || messageData.messageChannel || 'unknown';
    const seq = messageData.chatSequence || '';
    const time = messageData.time || messageData.date || '';
    const canonicalId = (source && seq && time) ? `${source}-${seq}-${time}` : '';
    const fallbackId = messageData.messageId || messageData.chatSequence || Date.now().toString();
    const messageId = canonicalId || fallbackId;

    // Check if message already exists to avoid duplicates (check BOTH formats)
    if (document.querySelector(`[data-message-id="${messageId}"]`)) {
        return;
    }
    // Also check fallback ID format
    if (canonicalId && fallbackId && canonicalId !== fallbackId) {
        if (document.querySelector(`[data-message-id="${fallbackId}"]`)) {
            return;
        }
    }

    // Only add messages from external sources (LINE app), not from current user
    if (window.recentlySentMessages?.has(messageId)) {
        console.log('Skipping recently sent message to prevent duplication:', messageId);
        return;
    }

    const text = messageData.userInput || messageData.aiResponse || messageData.message || '';
    const url = messageData.linkImage || messageData.attachmentId;
    const isFile = !!(url || (text && text.includes('📎')));
    const timeVal = messageData.time || messageData.date || Date.now();
    const avatarSrc = document.querySelector('.chat-profile img')?.src || '/images/default-user.png';

    // Decide direction based on messageChannel and content
    const isFromBackoffice = (
        messageData.messageChannel === 'Admin' ||
        messageData.messageChannel === 'Manual' ||
        messageData.messageChannel === 'BackOffice' ||
        messageData.messageChannel === 'Backoffice' ||
        messageData.messageChannel === 'ADMIN'
    );
    const isFromLine = messageData.messageChannel === 'Line' || messageData.messageChannel === 'LINE';

    // If no messageChannel, determine by content:
    const hasUserInput = messageData.userInput && messageData.userInput.trim();
    const hasAiResponse = messageData.aiResponse && messageData.aiResponse.trim();

    let isOutgoingMessage, isReceivedMessage;

    // Simple logic: messageChannel determines side
    if (isFromBackoffice) {
        // BackOffice messages = RIGHT (sent/yellow)
        isOutgoingMessage = true;
        isReceivedMessage = false;
    } else {
        // Line messages = LEFT (received/grey)
        isOutgoingMessage = false;
        isReceivedMessage = true;
    }

    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.setAttribute('data-message-id', messageId);
    messageElement.classList.add((isOutgoingMessage && !isReceivedMessage) ? 'sent' : 'received');

    // Build inner HTML consistent with loadConversation renderer
    let inner = '';
    if (!(isOutgoingMessage && !isReceivedMessage)) {
        inner += `
            <div class="message-avatar">
                <img src="${avatarSrc}" alt="Profile" onerror="handleImageError(this, 'Profile')">
            </div>`;
    }
    if (isFile) {
        const name = (() => {
            try {
                let n = '';
                
                // 1. Try explicitly provided fileName
                if (messageData.fileName && String(messageData.fileName) !== 'undefined' && String(messageData.fileName) !== 'null') {
                    n = String(messageData.fileName);
                } 
                
                // 2. Try to extract from text (e.g. from n8n format)
                if (!n || n === 'undefined') {
                    const match = text.match(/\[ผู้ใช้ส่งไฟล์: (.*?)\]/);
                    if (match && match[1] && match[1] !== 'undefined') n = match[1];
                }
                
                // 3. Try Google Drive ID extraction
                if ((!n || n === 'undefined') && typeof url === 'string' && url.includes('drive.google.com')) {
                    const idMatch = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
                    if (idMatch) n = `Drive_${idMatch[1].substring(0, 5)}`;
                }

                // 4. Try parsing URL path
                if (!n || n === 'undefined') {
                    if (url && String(url) !== 'undefined' && String(url) !== 'null') {
                        const decoded = decodeURIComponent(String(url).split('?')[0]);
                        n = decoded.split('/').pop();
                    }
                }

                if (!n || n === 'undefined' || n === 'null' || n === 'drive-proxy.php') return 'Attachment';
                return n;
            } catch {
                return 'Attachment';
            }
        })();

        // Handle LINE image placeholders
        let preview = '';
        if (typeof url === 'string' && url.startsWith('LINE_IMAGE:')) {
            const messageId = url.replace('LINE_IMAGE:', '');
            preview = `<div class="file-preview">
                <div class="line-image-loading" data-message-id="${messageId}">
                    <div class="loading-spinner"></div>
                </div>
            </div>`;
            // Download LINE image asynchronously
            setTimeout(() => downloadLineImage(messageId), 100);
        } else if (typeof url === 'string' && (
            /(png|jpg|jpeg|gif|webp|svg)/i.test(url.split('?')[0]) || 
            /(png|jpg|jpeg|gif|webp|svg)/i.test(name) ||
            (url.includes('drive.google.com') && (text.includes('[ผู้ใช้ส่งรูปภาพ]') || text.includes('[Image]')))
        )) {
            const normalizedUrl = normalizeFileUrl(url);
            preview = `<div class="file-preview"><img src="${normalizedUrl}" alt="file" onerror="handleImageLoadError(this, '${url}', 'Image not available')"></div>`;
        } else {
            // Handle other file types (PDF, documents, etc.)
            const fileExt = name.split('.').pop().toLowerCase();
            let fileIcon = 'fas fa-file';
            let iconColor = '#7f8c8d';

            if (fileExt === 'pdf') {
                fileIcon = 'fas fa-file-pdf';
                iconColor = '#e74c3c';
            } else if (['doc', 'docx'].includes(fileExt)) {
                fileIcon = 'fas fa-file-word';
                iconColor = '#2980b9';
            } else if (['xls', 'xlsx'].includes(fileExt)) {
                fileIcon = 'fas fa-file-excel';
                iconColor = '#27ae60';
            } else if (['ppt', 'pptx'].includes(fileExt)) {
                fileIcon = 'fas fa-file-powerpoint';
                iconColor = '#d35400';
            } else if (['zip', 'rar', '7z'].includes(fileExt)) {
                fileIcon = 'fas fa-file-archive';
                iconColor = '#95a5a6';
            } else if (fileExt === 'txt') {
                fileIcon = 'fas fa-file-alt';
                iconColor = '#34495e';
            } else if (['mp4', 'avi', 'mov', 'mkv'].includes(fileExt)) {
                fileIcon = 'fas fa-video';
                iconColor = '#8e44ad';
            } else if (['mp3', 'wav', 'ogg'].includes(fileExt)) {
                fileIcon = 'fas fa-music';
                iconColor = '#f39c12';
            }

            const downloadUrl = (() => {
                if (typeof url === 'string' && url.includes('drive.google.com')) {
                    const idMatch = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
                    if (idMatch) return `/drive-proxy.php?id=${idMatch[1]}&type=dl`;
                }
                return url;
            })();
                
            preview = `<div class="file-item">
                <div class="file-icon"><i class="${fileIcon}" style="color: ${iconColor};"></i></div>
                <div class="file-info">
                    <div class="file-name">${name}</div>
                    <a href="${downloadUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
                </div>
            </div>`;
        }

        inner += `
            <div class="message-content">
                <div class="file-message">
                    ${preview}
                </div>
            </div>`;
    } else {
        inner += `
            <div class="message-content">
                <div class="message-text">${text || ''}</div>
            </div>`;
    }
    inner += `
        <div class="message-time">${formatMessageTime(timeVal)}</div>`;

    messageElement.innerHTML = inner;
    messagesContainer.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: 'smooth' });

    console.log('Added real-time LINE message to chat:', messageId);
}


// Set up real-time listeners for chat updates
function setupRealTimeListeners() {
    // Real-time updates handled by Laravel Reverb (chat.js) and Evante API polling
    console.log('Real-time updates: using Laravel Reverb + Evante API polling');
}

// Expose functions globally for webhook compatibility
window.clearUnreadCount = clearUnreadCount;
window.loadConversation = loadConversation;
window.updateConversationLastMessage = updateConversationLastMessage;
if (!window.appendOutgoingMessageOptimistic) {
    window.appendOutgoingMessageOptimistic = function (lineUuid, text, isoTime, threadId) {
        const messagesContainer = document.getElementById('chat-messages-container');
        if (!messagesContainer) return;
        const messageId = `RESPONSE-${threadId}_outgoing-${isoTime}`;
        if (document.querySelector(`[data-message-id="${messageId}"]`)) return;
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.setAttribute('data-message-id', messageId);
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text || ''}</div>
            </div>
            <div class="message-time">${formatMessageTime(isoTime)}</div>
        `;
        messagesContainer.appendChild(messageElement);
        messageElement.scrollIntoView({ behavior: 'smooth' });
        try { updateConversationLastMessage(lineUuid, text, isoTime); } catch (e) { }
    };
}

// Function to handle scroll events for infinite scrolling
function handleScroll() {
    if (!messageLoadingState.isLoading && messageLoadingState.hasMore) {
        // Check if scrolled near the top (within 50px)
        if (this.scrollTop <= 50) {
            // Save current scroll position and height
            const scrollHeight = this.scrollHeight;
            const scrollTop = this.scrollTop;

            // Load more messages
            messageLoadingState.page++;
            loadConversation(currentState.currentConversationId, true).then(() => {
                // Restore scroll position after new messages are loaded
                const newScrollHeight = this.scrollHeight;
                const heightDiff = newScrollHeight - scrollHeight;
                this.scrollTop = scrollTop + heightDiff;
            });
        }
    }
}

// Function to send message to LINE user via LINE API
async function sendToLineAPI(lineUuid, messageText, fileOptions = null) {
    try {
        // Prepare request body
        const requestBody = {
            lineUuid: lineUuid
        };

        if (fileOptions && fileOptions.fileUrl && fileOptions.fileName) {
            // File message
            requestBody.fileUrl = fileOptions.fileUrl;
            requestBody.fileName = fileOptions.fileName;
            requestBody.fileType = fileOptions.fileType || '';
        } else {
            // Text message
            requestBody.message = messageText;
        }

        // Try the direct LINE API endpoint first
        const response = await fetch('/send-line-message.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                const responseText = await response.text();
                console.error('❌ LINE API returned invalid JSON:', responseText);
                return { success: false, message: 'LINE API returned invalid response: ' + responseText.substring(0, 200) };
            }

            if (result.success) {
                console.log('✅ Message sent to LINE API successfully');
                return { success: true, message: 'Message sent to LINE user' };
            } else {
                console.error('❌ LINE API returned error:', result.message || result.error);
                return { success: false, message: result.message || result.error || 'LINE API error' };
            }
        } else if (response.status === 404) {
            console.warn('⚠️ LINE API endpoint not available (404) - using fallback');
            // Fallback: message already saved via Evante API
            return { success: true, message: 'Message stored (LINE API unavailable)' };
        } else {
            console.error('❌ LINE API HTTP error:', response.status, response.statusText);
            return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
        }
    } catch (error) {
        console.error('❌ Error sending to LINE API:', error);
        // Graceful fallback - don't fail the entire send operation
        return { success: true, message: 'Message stored (LINE API error: ' + error.message + ')' };
    }
}

/**
 * Send message or file to Meta (Facebook/Instagram) platforms via proxy
 */
async function sendToMetaAPI(recipientId, channel, messageText, fileOptions = null) {
    try {
        if (!recipientId || !channel) {
            console.warn('⚠️ Meta API: Missing recipientId or channel');
            return { success: false, message: 'Missing recipientId or channel' };
        }

        const formData = new FormData();
        formData.append('action', 'send');
        formData.append('channel', channel);
        formData.append('recipient_id', recipientId);

        if (fileOptions && fileOptions.fileUrl) {
            formData.append('fileUrl', fileOptions.fileUrl);
            formData.append('fileType', fileOptions.fileType || '');
            formData.append('fileName', fileOptions.fileName || '');
        } else {
            formData.append('message', messageText);
        }

        console.log(`Sending to Meta (${channel}) via proxy:`, recipientId);

        const response = await fetch('/meta-proxy.php', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log(`✅ Message sent to Meta (${channel}) successfully`);
                return { success: true, message: `Message sent to ${channel}` };
            } else {
                console.error(`❌ Meta API error (${channel}):`, result.error || result.message);
                return { success: false, message: result.error || result.message || 'Meta API error' };
            }
        } else {
            const errorText = await response.text();
            console.error(`❌ Meta API HTTP error (${channel}):`, response.status, errorText);
            return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
        }
    } catch (error) {
        console.error(`❌ Error sending to Meta API (${channel}):`, error);
        return { success: false, message: error.message };
    }
}

// แก้ไขฟังก์ชัน sendMessage และย้ายฟังก์ชันอื่นออกมา

// แก้ไขฟังก์ชัน sendMessage เพื่อให้ทำงานกับโครงสร้างใหม่

async function sendMessage(event, lineUuid, displayName) {
    event.preventDefault();

    // Prevent multiple concurrent sends
    if (window.isSendingMessage) {
        console.log('Already sending a message, please wait...');
        return;
    }

    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();

    if (!message) return;

    // Set sending flag
    window.isSendingMessage = true;

    // Try to get the real profile name from global userProfiles map first
    const profile = window.userProfiles?.get(lineUuid);
    const realDisplayName = profile?.displayName || displayName || 'User';

    // Detect current chat mode from toggle
    const toggleWrapper = document.querySelector(`[data-line-uuid="${lineUuid}"] .toggle-wrapper`);
    const isManualMode = toggleWrapper && toggleWrapper.classList.contains('manual');
    // Force "Manual Chat" for BackOffice messages
    const chatModeValue = 'Manual Chat';

    // Get platformUserId and platformChannel from selected conversation card
    const selectedConversation = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    const platformUserId = selectedConversation?.dataset?.platformUserId || '';
    const platformChannel = selectedConversation?.dataset?.platformChannel || '';
    const platformUserIdStr = String(platformUserId || '');
    const isMetaChat = platformUserIdStr.startsWith('IG_') || platformUserIdStr.startsWith('FB_') || ['facebook', 'instagram'].includes((platformChannel || '').toLowerCase());

    console.log('Sending message with displayName:', realDisplayName);
    console.log('Profile data for', lineUuid, ':', profile);
    console.log('Platform info:', { platformUserId, platformChannel });

    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';

    const messagesContainer = document.getElementById('chat-messages-container');
    const now = new Date();

    // Don't show optimistic message to prevent duplicates
    // Just disable the input temporarily
    messageInput.disabled = true;
    messageInput.placeholder = 'Sending...';

    try {
        // Reserve the next numeric chatSequence so numbering stays contiguous with LINE messages
        const chatSequence = await getNextChatSequence(lineUuid);
        const timestamp = Date.now();
        const threadId = chatSequence;
        const uniqueMessageId = `admin_${timestamp}`;

        // Track recently sent messages to prevent duplication
        if (!window.recentlySentMessages) {
            window.recentlySentMessages = new Set();
        }
        window.recentlySentMessages.add(uniqueMessageId);
        // Also track chatSequence so Reverb Echo can match by sequence ID
        if (chatSequence) {
            window.recentlySentMessages.add(String(chatSequence));
        }

        // Clean up old message IDs after 30 seconds
        setTimeout(() => {
            window.recentlySentMessages.delete(uniqueMessageId);
            if (chatSequence) {
                window.recentlySentMessages.delete(String(chatSequence));
            }
        }, 30000);

        // Create message data to match previous development format
        const messageData = {
            lineUuid: String(lineUuid || ''),
            chatSequence: chatSequence,
            userInput: "",          // Keep empty so it is not treated as incoming on reload
            aiResponse: message,     // Store admin response here for proper rendering
            message: message,        // Provide fallback for downstream webhooks
            date: now.toISOString(),
            linkImage: "",
            chatMode: chatModeValue,     // "AI Chat" or "Manual Chat" based on toggle
            aiRead: "FALSE",
            messageChannel: "BackOffice",  // Admin messages from backoffice
            messageId: uniqueMessageId,
            displayName: realDisplayName, // Use real displayName from profile
            platformUserId: platformUserId, // Include platform ID for Meta conversations
            platformChannel: platformChannel // Include platform channel for proper detection
        };

        // Optimistic UI: append outgoing message immediately
        appendOutgoingMessageOptimistic(lineUuid, message, messageData.date, threadId);

        // Send to webhook + evante API; call LINE API only for LINE chats
        let webhookResult, evanteResult, lineResult, sheetsResult;

        try {
            [webhookResult, evanteResult] = await Promise.all([
                sendTon8nWebhook(messageData),
                sendToEvanteApi(messageData),
            ]);

            const ch = (platformChannel || '').toLowerCase();
            const isLine = !isMetaChat && (!ch || ch === 'line');
            if (isLine) {
                lineResult = await sendToLineAPI(lineUuid, message);
            } else if (isMetaChat) {
                // If it's a Meta chat, use the raw id (stripped of FB_/IG_ prefix) if available
                const metaRecipientId = (platformUserId || lineUuid).replace(/^(FB_|IG_)/, '');
                const metaChannel = (platformChannel || (String(lineUuid).startsWith('IG_') ? 'instagram' : 'facebook')).toLowerCase();
                lineResult = await sendToMetaAPI(metaRecipientId, metaChannel, message);
            }

            // Backup to sheets (async, don't wait for it)
            backupToSheets(messageData).then(sheetsResult => {
                if (!sheetsResult?.success) {
                    console.warn('Sheets backup (admin message) failed:', sheetsResult?.message || sheetsResult);
                }
            }).catch(error => {
                console.warn('Sheets backup (admin message) error:', error.message);
            });
        } finally {
            // Clear flag to allow next message
            window.isSendingMessage = false;
        }

        const sentToEvante = !!(evanteResult && evanteResult.success === true);
        const sentToLine = !!(lineResult && lineResult.success === true);
        if (!sentToEvante) {
            console.warn('Evante API write failed:', evanteResult?.message);
        }
        const overallSuccess = sentToEvante || sentToLine || isMetaChat;

        if (overallSuccess) {
            // Update sidebar preview text (no badge increment since we're viewing this chat)
            upsertConversationListItem(lineUuid, message, now.toISOString());
            // Ensure unread badge stays 0 for the active conversation
            if (typeof updateUnreadBadge === 'function') {
                updateUnreadBadge(lineUuid, 0);
            }
        } else {
            if (!webhookResult?.success) {
                console.warn('Webhook send issue:', webhookResult?.message);
            }
            if (!sentToLine && !isMetaChat) {
                console.error('Failed to send to LINE API:', lineResult?.message);
            }
            showNotification('Failed to send message. Check console for details.', 'error');
        }

        // Auto-refresh conversation list to show the new message
        setTimeout(async () => {
            try {
                // Do not re-render the full list; ensure cache is up-to-date
                if (window.latestMessageCache && window.latestMessageCache.set) {
                    window.latestMessageCache.set(lineUuid, { text: message, timestamp: now.toISOString() });
                }
                // Item already upserted above; no spinner shown
            } catch (error) {
                // Silent safeguard
            }
        }, 500);

    } catch (error) {
        console.error('Error sending message:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        // Always restore input state
        messageInput.disabled = false;
        messageInput.placeholder = 'Type a message...';
        window.isSendingMessage = false;
    }
}

// Google Sheets integration removed; chat relies on Evante API/LINE/Webhook only.

async function sendTon8nWebhook(messageData) {
    try {
        const webhookUrl = 'https://n8n-yesai.naijai.com/webhook/back-office-toggle';

        let source = 'GoogleSheetApp';
        const ch = (messageData.platformChannel || '').toLowerCase();
        if (ch === 'facebook') {
            source = 'FB';
        } else if (ch === 'instagram') {
            source = 'IG';
        } else {
            source = 'Line';
        }

        if (messageData.messageChannel && messageData.messageChannel !== "GoogleSheetApp") {
            source = messageData.messageChannel;
        }


        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lineUuid: String(messageData.lineUuid || '').replace(/^FB_/, ''),
                platformUserId: messageData.platformUserId || '',
                platformChannel: messageData.platformChannel || '',
                message: messageData.userInput || messageData.message,
                aiResponse: messageData.aiResponse || messageData.message, // Ensure aiResponse is sent
                threadId: messageData.chatSequence,
                messageId: messageData.messageId,
                timestamp: messageData.date,
                displayName: messageData.displayName || 'Unknown User',
                source: source
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Webhook error (${response.status}): ${errorText}`);
        }

        const responseData = await response.json().catch(() => ({}));

        return { success: true, message: "Sent to webhook successfully" };
    } catch (error) {
        console.error('Error sending to webhook:', error);
        return { success: false, message: error.message };
    }
}



/**
 * Store admin reply in evante API via Laravel proxy route.
 * Called alongside the LINE/Meta delivery so the message is persisted.
 */
async function sendToEvanteApi(messageData) {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
        const response = await fetch('/api/admin-send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(messageData),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Evante API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('sendToEvanteApi error:', error);
        return { success: false, message: error.message };
    }
}

// Toggle emoji picker
function toggleEmojiPicker() {
    const emojiPicker = document.querySelector('.emoji-picker');

    if (emojiPicker) {
        // If picker exists, toggle visibility
        if (emojiPicker.style.display === 'none' || !emojiPicker.style.display) {
            emojiPicker.style.display = 'flex';
        } else {
            emojiPicker.style.display = 'none';
        }
        return;
    }

    // Create emoji picker container
    const picker = document.createElement('div');
    picker.className = 'emoji-picker';

    // Common emojis
    const commonEmojis = ['😀', '😁', '😂', '🤣', '😊', '😍', '🥰', '😘', '👍', '❤️', '🙏', '👏', '🎉', '🔥', '✅', '🤔', '😎', '😢', '😭', '😡'];

    // Create emoji grid
    const emojiGrid = document.createElement('div');
    emojiGrid.className = 'emoji-grid';

    // Add emojis to grid
    commonEmojis.forEach(emoji => {
        const emojiBtn = document.createElement('button');
        emojiBtn.className = 'emoji-btn';
        emojiBtn.textContent = emoji;
        emojiBtn.onclick = () => {
            const messageInput = document.getElementById('message-input');
            if (messageInput) {
                // Insert emoji at cursor position
                const cursorPos = messageInput.selectionStart;
                const text = messageInput.value;
                messageInput.value = text.slice(0, cursorPos) + emoji + text.slice(cursorPos);

                // Move cursor after inserted emoji
                messageInput.selectionStart = cursorPos + emoji.length;
                messageInput.selectionEnd = cursorPos + emoji.length;
                messageInput.focus();
            }
        };
        emojiGrid.appendChild(emojiBtn);
    });

    // Add category tabs (can be expanded later)
    const categoryTabs = document.createElement('div');
    categoryTabs.className = 'emoji-categories';
    categoryTabs.innerHTML = `
        <button class="emoji-category active" data-category="recent">🕒</button>
        <button class="emoji-category" data-category="smileys">😀</button>
        <button class="emoji-category" data-category="people">👪</button>
        <button class="emoji-category" data-category="animals">🐶</button>
        <button class="emoji-category" data-category="food">🍔</button>
        <button class="emoji-category" data-category="activities">⚽</button>
        <button class="emoji-category" data-category="travel">🚗</button>
        <button class="emoji-category" data-category="objects">💡</button>
        <button class="emoji-category" data-category="symbols">❤️</button>
        <button class="emoji-category" data-category="flags">🏁</button>
    `;

    // Compose the emoji picker
    picker.appendChild(emojiGrid);
    picker.appendChild(categoryTabs);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'emoji-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = toggleEmojiPicker;
    picker.appendChild(closeBtn);

    // Add click outside to close
    document.addEventListener('click', (e) => {
        if (picker.style.display !== 'none' &&
            !picker.contains(e.target) &&
            !e.target.matches('.btn-icon') &&
            !e.target.matches('.fi-rr-grin-alt')) {
            picker.style.display = 'none';
        }
    });

    // Add to chat input area
    const chatInputWrapper = document.querySelector('.chat-input-wrapper');
    if (chatInputWrapper) {
        chatInputWrapper.appendChild(picker);
    }
}

// Add CSS for emoji picker
const emojiPickerCss = document.createElement('style');
emojiPickerCss.textContent = `
    .emoji-picker {
        position: absolute;
        bottom: 60px;
        right: 10px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        width: 280px;
        height: 300px;
        display: flex;
        flex-direction: column;
        z-index: 1000;
        overflow: hidden;
    }
    
    .emoji-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        padding: 16px;
        flex: 1;
        overflow-y: auto;
    }
    
    .emoji-btn {
        background: none;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 24px;
        padding: 8px;
        transition: background-color 0.2s;
    }
    
    .emoji-btn:hover {
        background-color: #f0f0f0;
    }
    
    .emoji-categories {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        background-color: #f8f8f8;
        border-top: 1px solid #eee;
    }
    
    .emoji-category {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        font-size: 18px;
        border-radius: 50%;
        transition: background-color 0.2s;
    }
    
    .emoji-category:hover, .emoji-category.active {
        background-color: #e0e0e0;
    }
    
    .emoji-close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #888;
    }
`;
document.head.appendChild(emojiPickerCss);

// Toggle Social Apps Panel
function toggleSocialAppsPanel(show) {
    const socialAppsPanel = document.getElementById('social-apps-panel');
    const overlay = document.getElementById('overlay');

    if (show) {
        socialAppsPanel.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('social-panel-visible');
    } else {
        socialAppsPanel.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('social-panel-visible');
    }
}

// Setup social app item click handlers
function setupSocialAppItems() {
    const socialAppItems = document.querySelectorAll('.social-app-item');
    socialAppItems.forEach(item => {
        item.addEventListener('click', () => {
            const appName = item.querySelector('.social-app-name').textContent;
            alert(`Opening ${appName} integration... This feature is coming soon!`);
            toggleSocialAppsPanel(false);
        });
    });
}

// Add event listeners after DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up social apps functionality
    document.addEventListener('click', (e) => {
        const socialAppsLink = e.target.closest('#social-apps-btn');
        if (socialAppsLink) {
            e.preventDefault();
            toggleSocialAppsPanel(true);
        }

        if (e.target.id === 'overlay' || e.target.id === 'close-social-apps' ||
            e.target.closest('#close-social-apps')) {
            toggleSocialAppsPanel(false);
        }
    });

    // Setup social app items with a delay
    setTimeout(setupSocialAppItems, 500);
});

// ฟังก์ชันเพื่อสร้าง sidebar ใหม่

// ฟังก์ชันเพื่อสร้าง sidebar ใหม่

function renderSidebar() {
    const sidebarContent = `
        <div class="sidebar-header">
            <h3>Insights</h3>
            <button class="close-sidebar-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="sidebar-content">
            <!-- Add your sidebar content here -->
        </div>
    `;

    const insightsOverlay = document.createElement('div');
    insightsOverlay.id = 'insights-overlay';
    insightsOverlay.className = 'insights-overlay';
    insightsOverlay.innerHTML = sidebarContent;

    // Remove existing overlay if it exists
    const existingOverlay = document.getElementById('insights-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    document.body.appendChild(insightsOverlay);

    // Setup close button event
    const closeBtn = insightsOverlay.querySelector('.close-sidebar-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideInsightsPanel);
    }
}



// แสดง panel
setTimeout(() => {
    const overlayEl = document.getElementById('insights-overlay');
    if (!overlayEl) return;
    overlayEl.classList.add('active');

    // ใช้ setTimeout เพื่อให้ animation ทำงานหลังจากเพิ่ม class active
    setTimeout(() => {
        // เพิ่ม animation สำหรับกราฟแท่ง
        const channelBars = overlayEl.querySelectorAll('.channel-bar');
        channelBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.opacity = '1';
            }, index * 100);
        });
    }, 300);
}, 10);


function hideInsightsPanel() {
    const insightsOverlay = document.getElementById('insights-overlay');
    if (insightsOverlay) {
        insightsOverlay.classList.remove('active');
        setTimeout(() => {
            if (insightsOverlay && insightsOverlay.parentNode) {
                insightsOverlay.parentNode.removeChild(insightsOverlay);
            }
        }, 300);
    }
}

// ฟังก์ชันเพื่อแสดง Social Apps Popup

// ฟังก์ชันเพื่อแสดง Social Apps Popup

function showSocialAppsPopup() {

    // ตรวจสอบว่ามีโครงสร้าง overlay อยู่แล้วหรือไม่
    let socialAppsOverlay = document.getElementById('social-apps-overlay');

    // ถ้ายังไม่มีให้สร้างใหม่
    if (!socialAppsOverlay) {
        socialAppsOverlay = document.createElement('div');
        socialAppsOverlay.id = 'social-apps-overlay';
        socialAppsOverlay.className = 'social-apps-overlay';

        socialAppsOverlay.innerHTML = `
            <div class="social-apps-popup">
                <div class="social-apps-header">
                    <h2>Connect Social Apps</h2>
                    <button class="btn-icon close-social-apps-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="social-apps-content">
                    <div class="social-apps-grid">
                        <div class="social-app-item">
                            <div class="social-app-icon line-icon">
                                <i class="fab fa-line"></i>
                            </div>
                            <div class="social-app-name">Line</div>
                        </div>
                        <div class="social-app-item">
                            <div class="social-app-icon messenger-icon">
                                <i class="fab fa-facebook-messenger"></i>
                            </div>
                            <div class="social-app-name">Messenger</div>
                        </div>
                        <div class="social-app-item">
                            <div class="social-app-icon instagram-icon">
                                <i class="fab fa-instagram"></i>
                            </div>
                            <div class="social-app-name">Instagram</div>
                        </div>
                        <div class="social-app-item">
                            <div class="social-app-icon whatsapp-icon">
                                <i class="fab fa-whatsapp"></i>
                            </div>
                            <div class="social-app-name">WhatsApp</div>
                        </div>
                        <div class="social-app-item">
                            <div class="social-app-icon shopee-icon">
                                <i class="fas fa-shopping-bag"></i>
                            </div>
                            <div class="social-app-name">Shopee</div>
                        </div>
                        <div class="social-app-item">
                            <div class="social-app-icon lazada-icon">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="social-app-name">Lazada</div>
                        </div>
                        <div class="social-app-item">
                            <div class="social-app-icon tiktok-icon">
                                <i class="fab fa-tiktok"></i>
                            </div>
                            <div class="social-app-name">TikTok Shop</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(socialAppsOverlay);

        // เพิ่ม event listener เพื่อปิด popup
        const closeBtn = socialAppsOverlay.querySelector('.close-social-apps-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideSocialAppsPopup);
        }

        // ปิด popup เมื่อคลิกด้านนอก
        socialAppsOverlay.addEventListener('click', (e) => {
            if (e.target === socialAppsOverlay) {
                hideSocialAppsPopup();
            }
        });

        // เพิ่ม event listener สำหรับแต่ละ social app
        const socialAppItems = socialAppsOverlay.querySelectorAll('.social-app-item');
        socialAppItems.forEach(item => {
            item.addEventListener('click', () => {
                const appName = item.querySelector('.social-app-name').textContent;
                alert(`Connecting to ${appName}... This feature is coming soon!`);
                hideSocialAppsPopup();
            });
        });
    }

    // แสดง popup
    setTimeout(() => {
        socialAppsOverlay.classList.add('active');
    }, 10);
}

function hideSocialAppsPopup() {
    const socialAppsOverlay = document.getElementById('social-apps-overlay');
    if (socialAppsOverlay) {
        socialAppsOverlay.classList.remove('active');

        // ลบ element หลังจาก animation เสร็จสิ้น
        setTimeout(() => {
            if (socialAppsOverlay && socialAppsOverlay.parentNode) {
                socialAppsOverlay.parentNode.removeChild(socialAppsOverlay);
            }
        }, 300);
    }
}

// Mobile specific functions

// เพิ่มฟังก์ชันสำหรับจัดการเลย์เอาท์บนมือถือ
function setupMobileLayout() {
    // Add mobile menu button
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(mobileMenuButton);

    // Add mobile back button
    const mobileBackButton = document.createElement('button');
    mobileBackButton.className = 'mobile-back-button';
    mobileBackButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
    mobileBackButton.style.display = 'none';
    document.body.appendChild(mobileBackButton);

    // Add mobile overlay
    const mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';
    document.body.appendChild(mobileOverlay);

    // Add event listeners
    mobileMenuButton.addEventListener('click', toggleSidebar);
    mobileBackButton.addEventListener('click', () => {
        document.querySelector('.message-hub').classList.remove('conversation-active');
        document.querySelector('.message-hub').classList.add('conversations-visible');
        mobileBackButton.style.display = 'none';
    });

    mobileOverlay.addEventListener('click', () => {
        if (document.body.classList.contains('sidebar-visible')) {
            toggleSidebar();
        }
    });

    // Update sidebar menu items for mobile
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    menuItems.forEach(item => {
        const title = item.querySelector('.tooltip').textContent;
        item.setAttribute('data-title', title);
    });

    // Handle initial state based on screen size
    handleResize();

    // Add resize event listener
    window.addEventListener('resize', handleResize);
}

// Toggle sidebar visibility
function toggleSidebar() {
    document.body.classList.toggle('sidebar-visible');
}

// Handle resize
function handleResize() {
    const isMobile = window.innerWidth <= 576;
    const messageHub = document.querySelector('.message-hub');

    if (isMobile) {
        messageHub.classList.add('conversations-visible');

        if (currentState.currentConversationId) {
            messageHub.classList.add('conversation-active');
            document.querySelector('.mobile-back-button').style.display = 'flex';
        }
    } else {
        messageHub.classList.remove('conversations-visible');
        document.body.classList.remove('sidebar-visible');
    }

    // Close panels if screen is small
    if (window.innerWidth <= 768) {
        if (currentState.aiVisible) {
            toggleAIAssistant();
        }
        if (currentState.teamVisible) {
            toggleTeamChat();
        }
    }
}

// เพิ่มฟังก์ชันนี้เพื่อจัดการ dropdown menu

function loadSection(section) {

    // Remove active class from all sidebar items first
    document.querySelectorAll('.sidebar-menu a').forEach(item => {
        item.classList.remove('active');
    });

    // Handle Messages section specially
    const messagesContainer = document.querySelector('.dropdown-menu-container');
    const messagesToggle = document.querySelector('.dropdown-toggle');

    if (section === 'messages' || section === 'contacts' || section === 'social-apps') {
        // Activate the Messages dropdown
        messagesContainer.classList.add('active');
        messagesToggle.classList.add('active');
    } else {
        messagesContainer.classList.remove('active');
        messagesToggle.classList.remove('active');
    }

    // Update active states for dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update URL without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url);

    // Handle section specific content loading
    switch (section) {
        case 'messages':
            renderConversationsList();
            break;
        case 'contacts':
            showContactsView();
            break;
        case 'social-apps':
            showSocialAppsPanel(true);
            break;
        // Add other cases as needed
    }
}

function updateActiveStates(section) {
    // อัพเดทสถานะ active ของ dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        const itemSection = item.getAttribute('data-section');
        if (itemSection === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // เปิด dropdown เมื่อเลือก item ที่อยู่ในนั้น
    if (section === 'messages' || section === 'contacts' || section === 'social-apps' || section === 'insights') {
        const dropdownContainer = document.querySelector('.dropdown-menu-container');
        if (dropdownContainer) {
            dropdownContainer.classList.add('active');
        }

        // ทำให้ dropdown toggle active
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.classList.add('active');
        }
    }
}

// เพิ่ม event listener สำหรับ dropdown toggle
document.addEventListener('DOMContentLoaded', function () {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function (e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('active');
        });
    }

    // ตรวจสอบ URL parameter เพื่อเปิดหน้าที่ถูกต้อง
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    if (sectionParam) {
        loadSection(sectionParam);
    }
});

// Add this after the DOMContentLoaded event listener
document.addEventListener('click', function (e) {
    // Handle more options dropdown
    const moreOptionsBtn = e.target.closest('.more-options-btn');
    const moreOptionsDropdown = e.target.closest('.more-options-dropdown');

    if (moreOptionsBtn) {
        e.stopPropagation();
        const dropdown = moreOptionsBtn.nextElementSibling;
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    } else if (!moreOptionsDropdown) {
        // Close dropdown when clicking outside
        const dropdowns = document.querySelectorAll('.more-options-dropdown');
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Handle dropdown options
    const addLabelOption = e.target.closest('.add-label-option');
    const blockOption = e.target.closest('.block-option');
    const deleteOption = e.target.closest('.delete-option');
    const toggleWrapper = e.target.closest('.toggle-wrapper');

    if (addLabelOption) {
        e.stopPropagation();
        showAddLabelModal();
    } else if (blockOption) {
        e.stopPropagation();
        handleBlockUser();
    } else if (deleteOption) {
        e.stopPropagation();
        handleDeleteConversation();
    } else if (toggleWrapper) {
        e.stopPropagation();
        const lineUuid = toggleWrapper.getAttribute('data-line-uuid');
        if (lineUuid) {
            toggleChatMode(lineUuid);
        }
    }
});

// Block user functionality
function handleBlockUser(conversationId) {
    const conversationElement = document.querySelector(`[data-id="${conversationId}"]`);
    if (!conversationElement) return;

    const displayName = conversationElement.querySelector('.conversation-name')?.textContent || 'User';

    // Show confirmation dialog
    if (confirm(`Are you sure you want to block ${displayName}?`)) {
        // TODO: Implement actual blocking functionality with backend API
        alert(`${displayName} has been blocked!`);
    }
}

// Delete conversation functionality
function handleDeleteConversation(conversationId) {
    const conversationElement = document.querySelector(`[data-id="${conversationId}"]`);
    if (!conversationElement) return;

    const displayName = conversationElement.querySelector('.conversation-name')?.textContent || 'conversation';

    // Show confirmation dialog
    if (confirm(`Are you sure you want to delete this conversation with ${displayName}?`)) {
        // Remove conversation item from UI
        conversationElement.remove();

        // TODO: Implement actual deletion with backend API
        // For now, just clear the chat window
        renderEmptyChat();

        // Show success message
        alert("Conversation has been deleted!");
    }
}


// Update the styles for chat messages
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .chat-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: calc(100vh - 64px); /* ปรับความสูงให้เหมาะสม */
        position: relative;
    }

    .chat-messages-wrapper {
        flex: 1;
        overflow-y: auto;
        scroll-behavior: smooth;
        background-color: #f3f3f3;
    }

    .chat-messages {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .message {
        max-width: 70%;
        margin-bottom: 8px;
        opacity: 0;
        transform: translateY(20px);
        animation: messageAppear 0.3s forwards;
    }

    @keyframes messageAppear {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .message.sent {
        align-self: flex-end;
    }

    .message.received {
        align-self: flex-start;
        max-width: 80%;
        display: flex;
        align-items: flex-end;
        margin-right: auto;
        margin-bottom: 16px;
    }

    .message.received .message-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        margin-right: 8px;
        overflow: hidden;
        flex-shrink: 0;
    }

    .message.received .message-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .message.sent {
        align-self: flex-end;
        max-width: 80%;
        margin-bottom: 16px;
        gap: 10px;
    }

    .message-content {
        position: relative;
        padding: 12px 16px;
        border-radius: 18px;
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
    }

    .message.received .message-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: -8px;
        width: 20px;
        height: 20px;
        background-color: #E8E8E8;
        border-top-right-radius: 15px;
        z-index: -1;
    }
    
    .message.received .message-content::after {
        content: '';
        position: absolute;
        top: 0;
        left: -10px;
        width: 10px;
        height: 20px;
        background-color: #f3f3f3;
        border-top-right-radius: 10px;
        z-index: -1;
    }

    .message-meta {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
    }

    .message.sent .message-meta {
        text-align: right;
        color: #999;
    }

    .chat-input-container {
        position: sticky;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
        padding: 16px;
        border-top: 1px solid #e0e0e0;
        z-index: 100;
    }

    .chat-input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f5f5f5;
        border-radius: 24px;
        padding: 8px 16px;
        margin-bottom: env(safe-area-inset-bottom);
    }

    .input-wrapper {
        flex: 1;
        min-width: 0;
    }

    #message-input {
        width: 100%;
        border: none;
        background: transparent;
        resize: none;
        padding: 8px 0;
        line-height: 1.5;
        max-height: 100px;
        font-size: 14px;
        font-family: Nunito;
    }

    #message-input:focus {
        outline: none;
    }

    .loading-indicator {
        display: flex;
        justify-content: center;
        padding: 10px;
        margin: 10px 0;
    }

    .loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #ecf000ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .message-link {
        color: #007bff;
        text-decoration: underline;
        word-break: break-all;
    }
    .message-link:hover {
        color: #0056b3;
        text-decoration: underline;
    }

    .message-channel {
        display: inline-block;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 10px;
        background-color: #f0f0f0;
        color: #666;
        margin-left: 8px;
    }

    .message.sent .message-meta,
    .message.sent .message-channel {
        color: rgba(255, 255, 255, 0.8);
    }

    .message.sent .message-channel {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .chat-profile {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .chat-profile-avatar {
        position: relative;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
    }

    .chat-profile-avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }

    .chat-profile-avatar .profile-initials {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
            font-weight: 500;
        font-size: 16px;
    }

    .chat-profile-avatar .source-app-badge {
        position: absolute;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        border: 2px solid #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        z-index: 1;
    }

    .chat-profile-info h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
    }
`;

document.head.appendChild(chatStyles);


// Add this new function for filter dropdown functionality
function initializeFilterDropdown() {
    const filterBtn = document.getElementById('filter-btn');
    const filterDropdown = document.getElementById('filter-dropdown-content');

    if (filterBtn && filterDropdown) {
        // Toggle dropdown on filter button click
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown') && filterDropdown.classList.contains('show')) {
                filterDropdown.classList.remove('show');
            }
        });

        // Handle filter option clicks
        const filterOptions = filterDropdown.querySelectorAll('.filter-option');
        filterOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                // Remove selected class from all options
                filterOptions.forEach(op => op.classList.remove('selected'));

                // Add selected class to clicked option
                option.classList.add('selected');

                // Get and apply filter value
                const filterValue = option.getAttribute('data-filter');
                applyFilter(filterValue);

                // Close dropdown
                filterDropdown.classList.remove('show');
            });
        });
    }
}

// Add CSS styles for the filter dropdown
const filterStyles = document.createElement('style');
filterStyles.textContent = `
    .filter-dropdown {
        position: relative;
        display: inline-block;
    }

        .filter-dropdown-content {
            display: none;
            position: absolute;
        right: 0;
        top: 100%;
            background-color: #fff;
        min-width: 200px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-radius: 8px;
            z-index: 1000;
        margin-top: 5px;
        padding: 8px 0;
    }

    .filter-dropdown-content.show {
        display: block;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .filter-option {
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .filter-option:hover {
        background-color: #f5f5f5;
    }

    .filter-option.selected {
        background-color: #e3f2fd;
    }

    .filter-badge {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .all-badge {
        background-color: #666;
    }

    .line-badge {
        background-color: #00B900;
    }

    .facebook-badge {
        background-color: #1877F2;
    }

    .instagram-badge {
        background-color: #E4405F;
    }

    .manual-badge {
        background-color: #FF9800;
    }
`;

document.head.appendChild(filterStyles);

// Add polling function for Sheet1 and Evante API
let lastPolledData = [];
let pollingInterval;

// Check Evante API for new messages (replaces Firebase polling)
async function checkFirebaseForNewMessages() {
    try {
        const result = await fetch('/api/line-conversations', {
            headers: { 'Accept': 'application/json' }
        });
        if (!result.ok) return false;
        const data = await result.json();
        if (!data.success || !data.data) return false;

        // Upsert latest message for each conversation
        for (const conv of data.data) {
            const lineUuid = conv.lineUuid || '';
            if (!lineUuid) continue;
            const text = conv.message || conv.userInput || conv.aiResponse || '';
            const time = conv.time || conv.date || new Date().toISOString();
            if (window.latestMessageCache && window.latestMessageCache.set) {
                window.latestMessageCache.set(lineUuid, { text, timestamp: time });
            }
            if (typeof upsertConversationListItem === 'function') {
                upsertConversationListItem(lineUuid, text, time);
            }
        }
        return true;
    } catch (error) {
        console.warn('checkFirebaseForNewMessages (Evante API):', error);
        return false;
    }
}

async function startPollingSheet1() {
    console.log('Sheet1 polling disabled - using Laravel backend instead');
    return;
}

function stopPollingSheet1() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// Start polling when document is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupPanelTabs();
    renderAISection();
    renderTeamChatSection();
    startPollingSheet1(); // Start polling

    // Listen for menu clicks
    document.addEventListener('click', (e) => {
        const menuLink = e.target.closest('#menu-container a');
        if (menuLink) {
            e.preventDefault();
            handleMenuClick(menuLink);
        }
    });
});

// Add cleanup when page is unloaded
window.addEventListener('beforeunload', () => {
    stopPollingSheet1();
});

// Add setupSearchAndFilter function
function setupSearchAndFilter() {
    const searchInput = document.getElementById('search-conversations');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        filterConversations(searchTerm);
    });

    // Filter events are now setup in renderConversationsList()
    // setupFilterEvents(); // Removed duplicate call

    // Initial filter application
    filterConversationElements();
}

function renderConversationLabels(labels, container) {
    if (!labels || !Array.isArray(labels)) return;

    // Clear existing labels
    const existingLabelsContainer = container.querySelector('.conversation-labels');
    if (existingLabelsContainer) {
        existingLabelsContainer.remove();
    }

    // Create new labels container
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'conversation-labels';
    labelsContainer.style.display = 'flex';
    labelsContainer.style.flexWrap = 'wrap';
    labelsContainer.style.gap = '4px';
    labelsContainer.style.marginTop = '4px';

    labels.forEach(label => {
        const labelElement = document.createElement('div');
        labelElement.className = 'conversation-label';
        labelElement.innerHTML = `
            <span class="label-dot" style="background-color: ${label.color}"></span>
            <span class="label-text">${label.name}</span>
            ${container.classList.contains('chat-profile') ? '<button class="remove-label">&times;</button>' : ''}
        `;

        // Add styles
        labelElement.style.display = 'inline-flex';
        labelElement.style.alignItems = 'center';
        labelElement.style.padding = '2px 8px';
        labelElement.style.borderRadius = '20px';
        labelElement.style.border = '1px solid #e0e0e0';
        labelElement.style.backgroundColor = '#ffffff';
        labelElement.style.fontSize = '12px';
        labelElement.style.lineHeight = '1.5';
        labelElement.style.margin = '0';

        // Style the dot
        const dot = labelElement.querySelector('.label-dot');
        dot.style.width = '6px';
        dot.style.height = '6px';
        dot.style.borderRadius = '50%';
        dot.style.display = 'inline-block';
        dot.style.marginRight = '4px';

        // Style the text
        const text = labelElement.querySelector('.label-text');
        text.style.color = '#333333';

        // Add remove button styles if in chat profile
        if (container.classList.contains('chat-profile')) {
            const removeBtn = labelElement.querySelector('.remove-label');
            if (removeBtn) {
                removeBtn.style.marginLeft = '4px';
                removeBtn.style.background = 'none';
                removeBtn.style.border = 'none';
                removeBtn.style.color = '#999';
                removeBtn.style.fontSize = '14px';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.padding = '0 2px';
                removeBtn.style.lineHeight = '1';

                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Remove label "${label.name}"?`)) {
                        // Remove label logic here
                        labelElement.remove();
                        // You might want to call your webhook or update database here
                    }
                });
            }
        }

        labelsContainer.appendChild(labelElement);
    });

    container.appendChild(labelsContainer);
}

// Update the updateChatProfile function to use the new renderConversationLabels
function updateChatProfile(conversation) {
    const chatProfile = document.querySelector('.chat-profile');
    if (!chatProfile) return;

    // ... existing chat profile update code ...

    // Update labels
    if (conversation.labels) {
        renderConversationLabels(conversation.labels, chatProfile);
    }
}

// Update the renderConversation function to use the new renderConversationLabels
function renderConversation(conversation) {
    const conversationElement = document.createElement('div');
    conversationElement.className = 'conversation-item';
    conversationElement.setAttribute('data-id', conversation.id);

    // ... existing conversation rendering code ...

    // Add labels
    if (conversation.labels) {
        renderConversationLabels(conversation.labels, conversationElement);
    }

    return conversationElement;
}

async function toggleChatMode(lineUuid) {
    const toggleWrapper = document.querySelector(`.toggle-wrapper[data-line-uuid="${lineUuid}"]`);
    if (!toggleWrapper) return;

    const isCurrentlyManual = toggleWrapper.classList.contains('manual');
    const newMode = isCurrentlyManual ? 'ai' : 'manual chat';

    try {
        // Use the statusWebhook module instead of direct API calls
        if (window.statusWebhook) {
            await window.statusWebhook.sendUpdate(lineUuid, newMode);

            // Update the toggle UI
            toggleWrapper.classList.toggle('manual');
            toggleWrapper.classList.toggle('ai');
        } else {
            console.warn('statusWebhook module not available, falling back to direct update');
        }
    } catch (error) {
        console.error('Critical error updating chat mode:', error);
        // Revert the toggle state on error
        toggleWrapper.classList.toggle('manual');
        toggleWrapper.classList.toggle('ai');
    }
}

// Add styles for the new label format
const labelStyles = document.createElement('style');
labelStyles.textContent = `
    .conversation-label {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        margin: 2px;
        border: 1px solid #e0e0e0;
        border-radius: 20px;
        background-color: #ffffff;
        font-size: 11px;
        font-family: 'Nunito', sans-serif;
        font-weight: 300;
    }

    .conversation-label .color-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
    }

    .conversation-label .label-text {
        color: #666;
    }
`;
document.head.appendChild(labelStyles);

// Add CSS for the new label style
const labelStyle = document.createElement('style');
labelStyle.textContent = `
    .conversation-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin-bottom: 4px;
        background-color: white;
        border: 1px solid #e0e0e0;
        color: #333;
    }

    .label-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
    }
`;
document.head.appendChild(labelStyle);

// Add styles for the message-avatar in .message.received (at an appropriate place in your CSS section)
const messageCss = document.createElement('style');
messageCss.textContent = `
    .message {
        display: flex;
        align-items: flex-start;
        max-width: 75%;
        margin-bottom: 10px;
        position: relative;
    }
    
    .message.received {
        justify-content: flex-start;
        margin-right: auto;
    }
    
    .message.sent {
        justify-content: flex-end;
        margin-left: auto;
    }
    
    .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 10px;
        flex-shrink: 0;
    }
    
    .message-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .message-content {
        padding: 10px 15px;
        position: relative;
        border-radius: 18px;
    }
    
    .message.received .message-content {
        background-color: #E8E8E8;
        color: #333;
        border-radius: 22px;
        padding: 10px 15px;
        border-top-left-radius: 4px;
    }
    
    .message.sent .message-content {
        background-color: #dcf8c6;
        color: #333;
        border-radius: 18px 4px 18px 18px;
        padding: 10px 15px;
        position: relative;
        margin-left: auto;
    }

    .message.sent .message-content::before {
        content: '';
        position: absolute;
        top: 0;
        right: -8px;
        width: 20px;
        height: 20px;
        background-color: #dcf8c6;
        border-top-left-radius: 15px;
        z-index: -1;
    }
    
    .message.sent .message-content::after {
        content: '';
        position: absolute;
        top: 0;
        right: -10px;
        width: 10px;
        height: 20px;
        background-color: #f3f3f3;
        border-top-left-radius: 10px;
        z-index: -1;
    }
    
    .message.sent .message-content {
        background-color: #F7FF00;
        color: #333;
        border-radius: 18px 4px 18px 18px;
        padding: 10px 15px;
        position: relative;
        margin-left: auto;
    }
    
    .message.sent .message-content::before {
        content: '';
        position: absolute;
        top: 0;
        right: -8px;
        width: 20px;
        height: 20px;
        background-color: #F7FF00;
        border-top-left-radius: 15px;
        z-index: -1;
    }
    
    .message.sent .message-content::after {
        content: '';
        position: absolute;
        top: 0;
        right: -10px;
        width: 10px;
        height: 20px;
        background-color: #f3f3f3;
        border-top-left-radius: 10px;
        z-index: -1;
    }
    
    .message-time {
        font-size: 12px;
        color: #505D75;
        margin-top: auto;
        margin-bottom: 5px;
        white-space: nowrap;
        align-self: flex-end;
        margin-left: 8px;
        min-width: 45px;
        text-align: center;
    }
    
    .message.received .message-time {
        margin-left: 5px;
    }
    
    .date-header {
        text-align: center;
        margin: 15px 0;
        position: relative;
    }
    
    .date-header span {
        background-color: #7c90b49c;
        color: white;
        padding: 2px 12px;
        border-radius: 15px;
        font-size: 12.5px;
        display: inline-block;
    }
    
    .message.read-status {
        font-size: 12px;
        color: #888;
        text-align: right;
        margin-right: 10px;
        margin-top: -5px;
        margin-bottom: 5px;
    }
    
    .messages-container {
        background-color: #EFFAFB;
    }
`;
document.head.appendChild(messageCss);

// Initialize filter button functionality
function initializeFilterButton() {
    const filterBtnShow = document.querySelector('.filter-btn-show');
    const filterBtns = document.querySelectorAll('.filter-btn');
    // Use global selectedFilters declared earlier

    if (filterBtnShow) {
        // Set initial text
        filterBtnShow.textContent = 'All';

        // Add click event listener
        filterBtnShow.addEventListener('click', (e) => {
            e.stopPropagation();

            // Toggle dropdown
            const dropdown = document.querySelector('.filter-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }

            // Toggle show class on filter buttons
            filterBtns.forEach(btn => {
                btn.classList.toggle('show');
            });
        });

        // Handle filter button clicks
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const filterValue = btn.dataset.filter;

                // Handle 'all' filter specially
                if (filterValue === 'all') {
                    selectedFilters = ['all'];
                    filterBtns.forEach(b => {
                        if (b.dataset.filter === 'all') {
                            b.classList.add('active');
                        } else {
                            b.classList.remove('active');
                        }
                    });
                } else {
                    // Remove 'all' from selected filters if it exists
                    selectedFilters = selectedFilters.filter(f => f !== 'all');

                    // Toggle the current filter
                    if (selectedFilters.includes(filterValue)) {
                        selectedFilters = selectedFilters.filter(f => f !== filterValue);
                        btn.classList.remove('active');
                    } else {
                        selectedFilters.push(filterValue);
                        btn.classList.add('active');
                    }

                    // If no filters are selected, default to 'all'
                    if (selectedFilters.length === 0) {
                        selectedFilters = ['all'];
                        filterBtns.forEach(b => {
                            if (b.dataset.filter === 'all') {
                                b.classList.add('active');
                            } else {
                                b.classList.remove('active');
                            }
                        });
                    }
                }

                // Update filter button text
                if (selectedFilters.length === 1) {
                    filterBtnShow.textContent = selectedFilters[0] === 'all' ? 'All' :
                        Array.from(filterBtns).find(b => b.dataset.filter === selectedFilters[0]).textContent.trim();
                } else {
                    filterBtnShow.textContent = `${selectedFilters.length} Selected`;
                }

                // Hide dropdown
                const dropdown = document.querySelector('.filter-dropdown');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }

                // Hide filter buttons
                filterBtns.forEach(b => b.classList.remove('show'));

                // Apply filter using global selectedFilters
                filterConversationElements();
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdown = document.querySelector('.filter-dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
            filterBtns.forEach(btn => {
                btn.classList.remove('show');
            });
        });
    }
}

// Removed duplicate applyFilter(array) to avoid conflicts with the primary applyFilter(string)

// Add CSS for filter button dropdown
const filterButtonStyles = document.createElement('style');
filterButtonStyles.textContent = `
    .filter-chips {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        flex-wrap: wrap;
    }

    .filter-btn-show {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 20px;
        background: #f7fab9ff;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        position: relative;
    }

    .filter-btn-show::after {
        content: '▼';
        font-size: 10px;
        margin-left: 4px;
    }

    .filter-btn-show.active {
        background: #f7fab9ff;
    }

    .filter-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 8px;
        background: white;

        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        min-width: 150px;
    }

    .filter-dropdown.show {
        display: block;
        animation: fadeIn 0.2s ease-out;
    }

    .filter-btn {
        display: none;
        padding: 6px 12px;
        border-radius: 20px;
        background: white;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        transition: all 0.2s;
    }

    .filter-btn:hover {
        background: #feffe0;
    }

    .filter-btn.active {
        background: #f7fab9ff;
        color: #414141;
        font-weight: 500;
    }

    @media (max-width: 480px) {
        .filter-btn {
            display: none;
            width: 100%;
            text-align: left;
            padding: 10px 16px;
            border: none;
            border-radius: 0;
            border-bottom: 1px solid #e0e0e0;
        }

        .filter-btn:last-child {
            border-bottom: none;
        }

        .filter-btn.show {
            display: block;
        }

        .filter-dropdown {
            width: 100%;
            min-width: 200px;
        }
    }

    @media (min-width: 481px) {
        .filter-btn {
            display: inline-flex;
        }

        .filter-btn-show {
            display: none;
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(filterButtonStyles);

// Call initializeFilterButton when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeFilterButton();
});

// เพิ่มในส่วนของ setupChatEventListeners หรือฟังก์ชันที่เกี่ยวข้อง
document.addEventListener('click', function (e) {
    if (e.target.closest('#close-chat')) {
        const chatSection = document.getElementById('chat-section');
        if (chatSection) {
            chatSection.style.display = 'none';
        }
    }
});
// เพิ่ม event listener สำหรับปุ่ม show panels
document.addEventListener('click', function (e) {
    if (e.target.closest('#shoew-panels')) {
        const panelsContainer = document.querySelector('.panels-container');
        if (panelsContainer) {
            panelsContainer.classList.add('visible');
        }
    }

    // เพิ่ม event listener สำหรับปิด panels เมื่อคลิกที่พื้นหลัง
    if (e.target.classList.contains('panels-container')) {
        e.target.classList.remove('visible');
    }
});



function setViewportHeight() {

    const vh = window.innerHeight * 0.01;

    document.documentElement.style.setProperty('--vh', `${vh}px`);
}


setViewportHeight();


window.addEventListener('resize', setViewportHeight);

// File upload functions
function triggerFileUpload(lineUuid) {
    const fileInput = document.getElementById(`file-upload-${lineUuid}`);
    if (fileInput) {
        fileInput.click();
    }
}

function handleFileUpload(event, lineUuid) {
    const file = event.target.files[0];
    if (!file) return;

    // Clean filename: Remove common timestamp prefixes like '1234567890_'
    // This ensures both the user and the system see a clean name.
    const cleanFileName = file.name.replace(/^\d{10,}_/, '');

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('File size too large. Maximum size is 10MB.');
        return;
    }

    // Show upload progress
    showUploadProgress(lineUuid);

    // Upload via backend (/upload-file) — Firebase Storage SDK removed
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('line_uuid', lineUuid);

    // Pass platform info to backend fallback
    const selectedItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    if (selectedItem) {
        if (selectedItem.dataset.platformUserId) formData.append('platform_user_id', selectedItem.dataset.platformUserId);
        if (selectedItem.dataset.platformChannel) formData.append('platform_channel', selectedItem.dataset.platformChannel);
    }

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    fetch('/upload-file', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            return response.json();
        })
        .then(data => {
            hideUploadProgress(lineUuid);
            if (data.success) {
                console.log('File uploaded successfully:', data);

                // Send file to LINE user only if not Meta
                const selectedItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
                const platformChannel = selectedItem?.dataset?.platformChannel || '';
                const platformUserId = selectedItem?.dataset?.platformUserId || '';
                const platformChannelLower = (platformChannel || '').toLowerCase();
                const isMeta = platformChannelLower === 'facebook' || platformChannelLower === 'instagram' || String(platformUserId).startsWith('FB_') || String(platformUserId).startsWith('IG_');

                if (data.file_url) {
                    if (!isMeta) {
                        try {
                            sendToLineAPI(lineUuid, '', {
                                fileUrl: data.file_url,
                                fileName: cleanFileName,
                                fileType: file.type
                            }).then(() => {
                                console.log('✅ File sent to LINE user successfully');
                            }).catch(lineError => {
                                console.error('❌ Failed to send file to LINE user:', lineError);
                            });
                        } catch (lineError) {
                            console.error('❌ Failed to send file to LINE user:', lineError);
                        }
                    } else {
                        // Send file to Meta (FB/IG) (fallback)
                        try {
                            const metaRecipientId = (platformUserId || lineUuid).replace(/^(FB_|IG_)/, '');
                            const metaChannel = platformChannelLower || (String(lineUuid).startsWith('IG_') ? 'instagram' : 'facebook');
                            sendToMetaAPI(metaRecipientId, metaChannel, '', {
                                fileUrl: data.file_url,
                                fileName: cleanFileName,
                                fileType: file.type
                            }).then(() => {
                                console.log('✅ File sent to Meta successfully');
                            }).catch(metaError => {
                                console.error('❌ Failed to send file to Meta:', metaError);
                            });
                        } catch (metaError) {
                            console.error('❌ Failed to send file to Meta:', metaError);
                        }
                    }
                }

                // If Meta, trigger the webhook for sync
                if (isMeta && data.success) {
                    const displayMsg = `📎 ${cleanFileName}`;
                    sendToMakeWebhook({
                        lineUuid,
                        platformUserId: platformUserId,
                        platformChannel: platformChannel,
                        message: displayMsg,
                        chatSequence: data.chat_sequence || 0,
                        messageId: data.file_id || `file_${Date.now()}`,
                        date: new Date().toISOString(),
                        displayName: 'Admin'
                    }).catch(err => console.error('Failed to sync fallback file to webhook:', err));
                }

                // File info is handled by the backend; no additional client-side storage needed
                event.target.value = '';
            } else {
                console.error('Upload failed:', data);
                alert('Upload failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            hideUploadProgress(lineUuid);
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
            event.target.value = '';
        });
}

function showUploadProgress(lineUuid) {
    const messagesContainer = document.getElementById('chat-messages-container') || document.getElementById('messages-container');
    if (!messagesContainer) return;

    const progressDiv = document.createElement('div');
    progressDiv.id = `upload-progress-${lineUuid}`;
    progressDiv.className = 'upload-progress';
    progressDiv.innerHTML = `
        <div class="upload-progress-content">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Uploading file...</span>
        </div>
    `;

    messagesContainer.appendChild(progressDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideUploadProgress(lineUuid) {
    const progressDiv = document.getElementById(`upload-progress-${lineUuid}`);
    if (progressDiv) {
        progressDiv.remove();
    }
}

function addFileMessageToChat(lineUuid, file, fileUrl, fileInfo = null) {
    const messagesContainer = document.getElementById('chat-messages-container') || document.getElementById('messages-container');
    if (!messagesContainer) {
        console.log('No messages container found, file message will appear on refresh');
        return;
    }

    const timestamp = new Date().toISOString();
    const timeStr = formatMessageTime(timestamp);

    // Determine file type and icon
    const fileType = file.type;
    let fileIcon = 'fas fa-file';
    let filePreview = '';

    if (fileType.startsWith('image/')) {
        fileIcon = 'fas fa-image';
        const normalizedUrl = normalizeFileUrl(fileUrl);
        filePreview = `<div class="file-preview"><img src="${normalizedUrl}" alt="${file.name}" style="max-width: 200px; max-height: 150px; border-radius: 8px;"></div>`;
    } else if (fileType.includes('pdf')) {
        fileIcon = 'fas fa-file-pdf';
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #e74c3c;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    } else if (fileType.includes('word') || fileType.includes('document')) {
        fileIcon = 'fas fa-file-word';
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #2980b9;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        fileIcon = 'fas fa-file-excel';
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #27ae60;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
        fileIcon = 'fas fa-file-powerpoint';
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #d35400;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    } else if (fileType.includes('zip') || fileType.includes('archive') || file.name.endsWith('.zip') || file.name.endsWith('.rar') || file.name.endsWith('.7z')) {
        fileIcon = 'fas fa-file-archive';
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #95a5a6;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    } else if (fileType.includes('text') || file.name.endsWith('.txt')) {
        fileIcon = 'fas fa-file-alt';
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #34495e;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    } else if (fileType.includes('video/')) {
        fileIcon = 'fas fa-video';
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #8e44ad;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    } else if (fileType.includes('audio/')) {
        fileIcon = 'fas fa-music';
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #f39c12;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    } else {
        // Default file type
        filePreview = `<div class="file-item">
            <div class="file-icon"><i class="${fileIcon}" style="color: #7f8c8d;"></i></div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
            </div>
        </div>`;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent file-message-item';
    messageDiv.setAttribute('data-file-id', fileInfo?.id || 'temp_' + Date.now());
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="file-message">
                ${filePreview}
            </div>
        </div>
        <div class="message-time">${timeStr}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Copy file link to clipboard
function copyFileLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        // Show temporary notification
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = 'Link copied to clipboard!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #52c41a;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link to clipboard');
    });
}


// Add CSS styles for file upload
const fileUploadStyles = document.createElement('style');
fileUploadStyles.textContent = `
    .upload-progress {
        padding: 10px;
        margin: 10px 0;
        background: #f0f7ff;
        border-radius: 8px;
        text-align: center;
    }
    
    .upload-progress-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #1890ff;
    }
    
    .upload-progress-content i {
        font-size: 16px;
    }
    
    .file-preview img {
        width: 100%;
        height: auto;
        border-radius: 6px;
    }
    
    .file-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        max-width: 300px;
    }
    
    .file-icon {
        flex-shrink: 0;
    }
    
    .file-icon i {
        font-size: 24px;
    }
    
    .file-info {
        flex: 1;
        min-width: 0;
    }
    
    .file-name {
        font-weight: 500;
        font-size: 14px;
        color: #333;
        word-break: break-word;
        margin-bottom: 4px;
    }
    
    .file-size {
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;
    }
    
    .file-download {
        font-size: 12px;
        color: #1890ff;
        text-decoration: none;
        font-weight: 500;
    }
    
    .file-download:hover {
        text-decoration: underline;
    }
    
    .file-info {
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }
    
    .file-info i {
        display: flex;
        justify-content: center;
        font-size: 24px;
        color: #666;
        min-width: 24px;
        margin-top: 2px;
    }
    
    .file-details {
        flex: 1;
        min-width: 0;
    }
    
    .file-name {
        font-weight: 500;
        color: #333;
        word-break: break-word;
        font-size: 14px;
        line-height: 1.3;
    }
    
    .file-size {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
    }
    
    .file-status {
        font-size: 11px;
        color: #52c41a;
        margin-top: 4px;
        font-weight: 500;
    }
    
    .file-actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-left: 8px;
    }
    
    .file-download, .file-copy {
        color: #1890ff;
        text-decoration: none;
        padding: 6px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
    }
    
    .file-download:hover, .file-copy:hover {
        background-color: #e6f3ff;
    }
    
    .file-download i, .file-copy i {
        font-size: 14px;
    }
    
    .file-message-item {
        margin-bottom: 10px;
    }
    
    .file-message-item .message-time {
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        text-align: right;
    }
    
    .btn-icon {
        background: none;
        border: none;
        padding: 8px;
        border-radius: 50%;
        cursor: pointer;
        color: #666;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .btn-icon:hover {
        background-color: #f0f0f0;
        color: #1890ff;
    }
    
    .btn-icon i {
        font-size: 18px;
    }
`;
document.head.appendChild(fileUploadStyles);

// Setup periodic LINE API refresh
function setupLineApiRefresh() {
    // Refresh conversations from LINE API every 15 seconds
    setInterval(async () => {
        try {
            console.log('Refreshing conversations from LINE API...');
            const lineResponse = await fetch('/api/line-conversations');
            if (lineResponse.ok) {
                const lineData = await lineResponse.json();
                if (lineData.success && lineData.values && lineData.values.length > 1) {
                    console.log('Refreshed', lineData.total, 'conversations from LINE API');
                    // Trigger a refresh of the conversation list (debounced, and only if needed)
                    requestConversationsRefresh(500);
                }
            }
        } catch (error) {
            console.error('Error refreshing LINE conversations:', error);
        }
    }, 15000); // 15 seconds - reduced for faster LINE API updates

    console.log('LINE API refresh setup complete - refreshing every 15 seconds');
}

// Intelligent polling - checks for triggers instead of fixed intervals
let intelligentPollingActive = true;
let lastUpdateCheck = 0;

async function checkForMessageUpdates() {
    try {
        const response = await fetch('/api/check-message-updates');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.hasUpdate) {
            console.log('🚀 Intelligent polling detected new message:', data);

            // Update only the affected conversation without full refresh/spinner
            try {
                const lineUuid = data.lineUuid;
                if (lineUuid) {
                    const res = await fetch(`/api/line-conversations?lineUuid=${encodeURIComponent(lineUuid)}`);
                    if (res.ok) {
                        const payload = await res.json();
                        const arr = payload?.data || [];
                        if (arr.length > 0) {
                            // Find latest by time
                            const toTime = v => (typeof v === 'number') ? v : (Date.parse(v || '') || 0);
                            arr.sort((a, b) => toTime(b.time) - toTime(a.time));
                            const latest = arr[0];
                            const text = latest.aiResponse || latest.message || '';
                            const time = latest.time || new Date().toISOString();
                            if (window.latestMessageCache && window.latestMessageCache.set) {
                                window.latestMessageCache.set(lineUuid, { text, timestamp: time });
                            }
                            if (typeof upsertConversationListItem === 'function') {
                                upsertConversationListItem(lineUuid, text, time);
                            } else if (typeof updateConversationLastMessage === 'function') {
                                updateConversationLastMessage(lineUuid, text, time);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('Lightweight upsert failed, skipping full refresh:', e);
            }

            // Update last check time
            lastUpdateCheck = Date.now();

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking for message updates:', error);
        return false;
    }
}

// Setup intelligent polling that adapts based on activity - DISABLED
function setupIntelligentPolling() {
    console.log('Intelligent polling disabled - Firebase not available');
    return;
    const baseInterval = 3000; // 3 seconds base check
    const fallbackInterval = 15000; // 15 seconds fallback

    async function intelligentCheck() {
        if (!intelligentPollingActive) return;

        try {
            const hasUpdate = await checkForMessageUpdates();

            // If we got an update, check again soon in case there are more messages
            const nextCheckDelay = hasUpdate ? 2000 : baseInterval;

            // Also do periodic fallback checks
            const timeSinceLastUpdate = Date.now() - lastUpdateCheck;
            const shouldDoFallback = timeSinceLastUpdate > fallbackInterval;

            if (shouldDoFallback) {
                console.log('Performing fallback Firebase check...');
                await checkFirebaseForNewMessages();
                lastUpdateCheck = Date.now();
            }

            setTimeout(intelligentCheck, nextCheckDelay);

        } catch (error) {
            console.error('Error in intelligent polling:', error);
            // Retry after a longer delay on error
            setTimeout(intelligentCheck, fallbackInterval);
        }
    }

    // Start intelligent polling
    intelligentCheck();

    console.log('🧠 Intelligent polling initialized - adapts based on message activity');
    console.log('- Checks for triggers every 3 seconds');
    console.log('- Accelerates to 2 seconds after detecting messages');
    console.log('- Fallback Firebase check every 15 seconds');
}

// Function to pause/resume intelligent polling
window.pauseIntelligentPolling = () => {
    intelligentPollingActive = false;
    console.log('Intelligent polling paused');
};

window.resumeIntelligentPolling = () => {
    intelligentPollingActive = true;
    setupIntelligentPolling();
    console.log('Intelligent polling resumed');
};

// Test function for Firebase polling (for debugging)
window.testFirebasePolling = async function () {
    console.log('Testing Firebase polling...');
    try {
        const hasNewMessages = await checkFirebaseForNewMessages();
        console.log('Firebase polling test result:', hasNewMessages);
        return hasNewMessages;
    } catch (error) {
        console.error('Firebase polling test error:', error);
        return false;
    }
};

// Real-time listener stub — Firebase SSE disabled; Laravel Reverb + Evante API polling handle updates
function setupFirebaseRealTimeListener() {
    // Firebase SSE disabled — using Laravel Reverb (chat.js) + Evante API polling
    console.log('Real-time: Laravel Reverb + Evante API polling active');
}

// Helper functions for intelligent notifications
function showDesktopNotification(messageData) {
    // Request notification permission if not already granted
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                createNotification(messageData);
            }
        });
    } else if (Notification.permission === 'granted') {
        createNotification(messageData);
    }
}

function createNotification(messageData) {
    const title = 'New Message';
    const options = {
        body: `From: ${messageData.displayName || 'LINE User'}\n${messageData.userInput || 'New message received'}`,
        icon: '/images/notification-icon.png',
        badge: '/images/badge-icon.png',
        tag: messageData.lineUuid, // Prevent duplicate notifications
        requireInteraction: false,
        silent: false
    };

    const notification = new Notification(title, options);

    // Auto close after 5 seconds
    setTimeout(() => {
        notification.close();
    }, 5000);

    // Click to focus on the conversation
    notification.onclick = function () {
        window.focus();
        // Open the specific conversation if possible
        if (messageData.lineUuid) {
            const conversationElement = document.querySelector(`[data-id="${messageData.lineUuid}"]`);
            if (conversationElement) {
                conversationElement.click();
            }
        }
        notification.close();
    };
}

function flashTabOnNewMessage() {
    if (document.hidden) {
        const originalTitle = document.title;
        let flashCount = 0;
        const maxFlashes = 6;

        const flashInterval = setInterval(() => {
            document.title = flashCount % 2 === 0 ? '🔔 New Message!' : originalTitle;
            flashCount++;

            if (flashCount >= maxFlashes) {
                clearInterval(flashInterval);
                document.title = originalTitle;
            }
        }, 1000);

        // Stop flashing when user returns to tab
        const stopFlashing = () => {
            clearInterval(flashInterval);
            document.title = originalTitle;
            document.removeEventListener('visibilitychange', stopFlashing);
        };

        document.addEventListener('visibilitychange', stopFlashing);
    }
}

function playNotificationSound() {
    // Create audio element for notification sound
    const audio = new Audio();
    audio.volume = 0.3; // 30% volume

    // Try multiple sound formats for compatibility
    const soundUrls = [
        '/sounds/notification.mp3',
        '/sounds/notification.wav',
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBTyY4O7MeywFJHfH8N+QQAoUXrTp66hVFAo='
    ];

    // Try to play notification sound
    for (const url of soundUrls) {
        audio.src = url;
        audio.play().catch(() => {
            // If audio fails, continue to next format
        });
        break; // Use first available sound
    }
}

// Laravel Server-Sent Events for real-time updates
function setupLaravelSSE() {
    let eventSource = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    function connectToLaravelSSE() {
        try {
            // Connect to Laravel SSE endpoint
            eventSource = new EventSource('/sse/message-updates');

            eventSource.onopen = function (event) {
                console.log('🚀 Laravel SSE connected!');
                reconnectAttempts = 0;
            };

            eventSource.onmessage = function (event) {
                try {
                    const data = JSON.parse(event.data);

                    console.log('🚀 Laravel SSE update:', data);

                    if (data.type === 'new_message') {
                        console.log('📨 New message via Laravel SSE from:', data.lineUuid);

                        // Upsert only the affected conversation item
                        try {
                            const lineUuid = data.lineUuid;
                            const text = data.aiResponse || data.message || data.userInput || '';
                            const time = data.time || data.date || new Date().toISOString();
                            if (window.latestMessageCache && window.latestMessageCache.set) {
                                window.latestMessageCache.set(lineUuid, { text, timestamp: time });
                            }
                            if (typeof upsertConversationListItem === 'function') {
                                upsertConversationListItem(lineUuid, text, time);
                            } else if (typeof updateConversationLastMessage === 'function') {
                                updateConversationLastMessage(lineUuid, text, time);
                            }
                        } catch (e) {
                            console.warn('SSE upsert failed:', e);
                        }

                        // Show notification
                        showDesktopNotification({
                            lineUuid: data.lineUuid,
                            displayName: 'LINE User',
                            userInput: data.message
                        });

                        // Flash tab and play sound
                        flashTabOnNewMessage();
                        playNotificationSound();
                    }

                } catch (parseError) {
                    console.warn('Error parsing Laravel SSE data:', parseError);
                }
            };

            eventSource.onerror = function (event) {
                console.warn('🚀 Laravel SSE error:', event);

                if (eventSource) {
                    eventSource.close();
                }

                // Attempt to reconnect
                if (reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    const delay = 1000 * reconnectAttempts;

                    console.log(`🔄 Reconnecting to Laravel SSE in ${delay}ms (attempt ${reconnectAttempts})`);

                    setTimeout(() => {
                        connectToLaravelSSE();
                    }, delay);
                } else {
                    console.warn('🚀 Max Laravel SSE reconnection attempts reached');
                }
            };

        } catch (error) {
            console.error('🚀 Failed to connect to Laravel SSE:', error);
        }
    }

    // Start Laravel SSE connection
    connectToLaravelSSE();

    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (eventSource) {
            eventSource.close();
        }
    });

    console.log('🚀 Laravel SSE initialized');
}

// Initialize intelligent polling and LINE API refresh on page load
document.addEventListener('DOMContentLoaded', () => {
    setupLineApiRefresh();
    setupIntelligentPolling();
    setupFirebaseRealTimeListener(); // noop stub — real-time via Laravel Reverb + Evante API polling

    // Google Sheets polling disabled - using Evante API + Reverb
    // startPollingSheet1();

    // Log that intelligent polling is ready
    console.log('✅ Intelligent real-time polling initialized');
    console.log('- Webhook-triggered updates (immediate)');
    console.log('- Smart polling adapts to message activity');
    console.log('- Google Sheets backup polling every 10 seconds');
    console.log('- LINE API refresh every 15 seconds');
    console.log('- Use window.testFirebasePolling() to test manually');
    console.log('- Use window.pauseIntelligentPolling() / window.resumeIntelligentPolling() to control');
});

// Simple live update system for conversation list
let lastConversationCount = 0;

async function checkForNewConversations() {
    try {
        const response = await fetch('/api/line-conversations', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            const conversations = result.data || [];
            const currentCount = conversations.length;

            // Only add NEW conversations (not in DOM yet) — don't touch existing ones
            if (lastConversationCount > 0 && currentCount > lastConversationCount) {
                for (const conv of conversations) {
                    const lineUuid = conv.lineUuid;
                    if (!lineUuid) continue;
                    // Skip if already in the sidebar
                    if (document.querySelector(`.conversation-item[data-id="${lineUuid}"]`)) continue;
                    const text = conv.aiResponse || conv.message || '';
                    const time = conv.time || new Date().toISOString();
                    if (typeof upsertConversationListItem === 'function') {
                        upsertConversationListItem(lineUuid, text, time);
                    }
                }
            }

            lastConversationCount = currentCount;
        }
    } catch (error) {
        console.error('Error checking for new conversations:', error);
    }
}

// Start live updates when the page loads
document.addEventListener('DOMContentLoaded', function () {
    // Initial count
    setTimeout(async () => {
        try {
            const response = await fetch('/api/line-conversations');
            const result = await response.json();
            lastConversationCount = result.data?.length || 0;
            console.log('🔄 Live updates initialized with', lastConversationCount, 'conversations');
        } catch (error) {
            console.error('Failed to initialize live updates:', error);
        }
    }, 2000);

    // Check for updates every 5 seconds
    setInterval(checkForNewConversations, 5000);
    console.log('🔄 Live conversation updates started (checking every 5 seconds)');

    // Chat area updates are handled by Reverb Echo (real-time) in chat.js.
    // Removed 5-second full-message polling to prevent duplicate messages.
    console.log('🔄 Chat updates via Reverb Echo (no polling)');
});

// ============================================================
// Responsive: Conversations hover expand + Panels toggle (≤992px)
// ============================================================
(function () {
    const conversations = document.querySelector('.message-section.conversations');
    const hoverTrigger = document.getElementById('conversations-hover-trigger');
    let collapseTimer = null;

    function isTablet() {
        return window.innerWidth <= 992;
    }

    function expandConversations() {
        if (!isTablet() || !conversations) return;
        clearTimeout(collapseTimer);
        conversations.classList.add('hover-expanded');
        if (hoverTrigger) hoverTrigger.style.opacity = '0';
    }

    function collapseConversations() {
        if (!conversations) return;
        collapseTimer = setTimeout(() => {
            conversations.classList.remove('hover-expanded');
            if (hoverTrigger) hoverTrigger.style.opacity = '1';
        }, 250);
    }

    // Hover trigger strip — expand on enter
    if (hoverTrigger) {
        hoverTrigger.addEventListener('mouseenter', expandConversations);
        hoverTrigger.addEventListener('mouseleave', collapseConversations);
    }

    // Keep expanded while hovering conversations panel itself
    if (conversations) {
        conversations.addEventListener('mouseenter', function () {
            if (!isTablet()) return;
            clearTimeout(collapseTimer);
        });
        conversations.addEventListener('mouseleave', collapseConversations);
    }

    // Touch support: tap trigger tab to toggle
    if (hoverTrigger) {
        hoverTrigger.addEventListener('touchstart', function (e) {
            if (!isTablet() || !conversations) return;
            e.preventDefault();
            var isExpanded = conversations.classList.toggle('hover-expanded');
            hoverTrigger.style.opacity = isExpanded ? '0' : '1';
        }, { passive: false });
    }

    // Panels toggle button
    const panelsToggleBtn = document.getElementById('panels-toggle-btn');
    if (panelsToggleBtn) {
        panelsToggleBtn.addEventListener('click', function () {
            const panelsContainer = document.querySelector('.panels-container');
            if (panelsContainer) {
                panelsContainer.classList.toggle('visible');
            }
        });
    }

    // Back button in panels header — close panels
    document.addEventListener('click', function (e) {
        if (e.target.closest('#back-button')) {
            const panelsContainer = document.querySelector('.panels-container');
            if (panelsContainer) {
                panelsContainer.classList.remove('visible');
            }
        }
    });

    // Peek animation — briefly slide conversations in on page load
    if (isTablet() && conversations) {
        conversations.classList.add('peek-animate');
        conversations.addEventListener('animationend', function () {
            conversations.classList.remove('peek-animate');
        }, { once: true });
    }
})();

// Function to handle chat mode toggle (used by both conversation list and customer profile)
async function handleChatModeToggle(lineUuid, newMode) {
    try {
        // ส่ง webhook
        if (window.statusWebhook && window.statusWebhook.sendUpdate) {
            await window.statusWebhook.sendUpdate(lineUuid, newMode);
        }
        // แจ้งเตือน
        if (typeof showStatusUpdateSuccess === 'function') {
            showStatusUpdateSuccess(newMode);
        }

        // Update the latest message cache
        const cached = window.latestMessageCache?.get(lineUuid);
        if (cached) {
            cached.chatMode = newMode === 'ai' ? 'Active' : 'Manual Chat';
            window.latestMessageCache?.set(lineUuid, cached);
        }

    } catch (error) {
        console.error('Error handling chat mode toggle:', error);
        throw error;
    }
}
