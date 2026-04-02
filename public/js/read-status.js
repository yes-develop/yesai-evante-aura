/**
 * Read Status Handler
 * 
 * This module handles message read status tracking and display
 */

const READ_STATUS_CONFIG = {
    markReadUrl: '/api/mark-staff-read',
    checkReadUrl: '/api/check-staff-read',
    checkInterval: 10000 // Check for updates every 10 seconds
};

/**
 * Initialize read status tracking
 */
function initReadStatusTracking() {
    console.log('Initializing read status tracking');
    
    // Mark messages as read when they come into view
    setupMessageVisibilityTracking();
    
    // Display read status indicators
    setupReadStatusDisplay();
    
    // Start periodic updates
    startReadStatusUpdates();
}

const MESSAGE_SELECTOR = '.message-item, .chat-message, .message, [data-message-id]';

/**
 * Track when messages come into view and mark them as read
 */
function setupMessageVisibilityTracking() {
    // Use Intersection Observer to detect when messages are visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const messageElement = entry.target;
                const lineUuid = messageElement.dataset.lineUuid;
                const messageId = messageElement.dataset.messageId;
                
                if (lineUuid && messageId && !messageElement.dataset.markedRead) {
                    markMessageAsRead(lineUuid, messageId);
                    messageElement.dataset.markedRead = 'true';
                }
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    });
    
    // Observe all message elements
    document.addEventListener('DOMContentLoaded', () => {
        observeMessageElements(observer);
    });
    
    // Re-observe when new messages are added
    const mutationObserver = new MutationObserver(() => {
        observeMessageElements(observer);
        addReadStatusIndicators();
    });
    
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Find and observe message elements
 */
function observeMessageElements(observer) {
    // Look for message elements - adjust selector based on your HTML structure
    const messageElements = document.querySelectorAll(MESSAGE_SELECTOR);
    
    messageElements.forEach(element => {
        if (!element.dataset.observing) {
            observer.observe(element);
            element.dataset.observing = 'true';
        }
    });
}

/**
 * Mark a message as read
 */
async function markMessageAsRead(lineUuid, messageId) {
    try {
        // Get current user ID - you may need to adjust this based on how user info is available
        const userId = getCurrentUserId();
        if (!userId) {
            console.warn('User ID not available, cannot mark message as read');
            return;
        }
        
        const payload = {
            lineUuid: lineUuid,
            messageId: messageId,
            userId: userId
        };
        
        const response = await fetch(READ_STATUS_CONFIG.markReadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`Message ${messageId} marked as read:`, data);
            
            // Update UI immediately
            updateMessageReadStatus({
                messageId,
                staffRead: true,
                staffReadAt: new Date().toISOString(),
                staffUserId: payload.userId
            });
        } else {
            console.error('Failed to mark message as read:', response.status);
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

/**
 * Setup read status display indicators
 */
function setupReadStatusDisplay() {
    // Add CSS for read status indicators
    addReadStatusStyles();
    
    // Add read status indicators to messages
    addReadStatusIndicators();
}

/**
 * Add CSS styles for read status indicators
 */
function addReadStatusStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .read-status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-left: 5px;
            font-size: 12px;
            color: #666;
        }
        
        .read-status-indicator .status {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            padding: 1px 6px;
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.05);
            color: #999;
        }
        
        .read-status-indicator .status.read {
            background: rgba(76, 175, 80, 0.15);
            color: #4CAF50;
        }
        
        .read-status-indicator .status.unread {
            color: #999;
        }
        
        .read-status-indicator .status .status-icon {
            margin-left: 1px;
        }
        
        .message-item.read {
            opacity: 0.85;
        }
        
        .message-item.unread {
            opacity: 1;
            font-weight: 500;
        }
        
        .read-by-tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            display: none;
            max-width: 200px;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Add read status indicators to message elements
 */
function addReadStatusIndicators() {
    // Find all message elements and add indicators
    const messageElements = document.querySelectorAll(MESSAGE_SELECTOR);
    
    messageElements.forEach(element => {
        if (!element.querySelector('.read-status-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'read-status-indicator';
            indicator.innerHTML = `
                <span class="status staff unread" data-role="staff">
                    <i class="fas fa-user-tie"></i>
                    <i class="status-icon fas fa-circle"></i>
                </span>
                <span class="status client unread" data-role="client">
                    <i class="fas fa-user"></i>
                    <i class="status-icon fas fa-circle"></i>
                </span>
            `;
            indicator.title = 'Message read status';

            const metaTarget = element.querySelector('.message-meta, .message-time');
            if (metaTarget) {
                metaTarget.appendChild(indicator);
            } else {
                element.appendChild(indicator);
            }
        }
    });
}

/**
 * Update message read status in UI
 */
function updateMessageReadStatus(statusUpdate) {
    if (!statusUpdate || !statusUpdate.messageId) {
        console.warn('Invalid status update payload:', statusUpdate);
        return;
    }

    const {
        messageId,
        staffRead,
        staffReadAt,
        staffUserId,
        clientRead,
        clientReadAt,
        readByUsers = []
    } = statusUpdate;

    const messageElements = document.querySelectorAll(`[data-message-id="${messageId}"]`);

    messageElements.forEach(element => {
        const previousStaffRead = element.dataset.staffRead === 'true';
        const previousClientRead = element.dataset.clientRead === 'true';
        const currentStaffRead = typeof staffRead === 'boolean' ? staffRead : previousStaffRead;
        const currentClientRead = typeof clientRead === 'boolean' ? clientRead : previousClientRead;
        const currentStaffReadAt = staffReadAt || element.dataset.staffReadAt || null;
        const currentClientReadAt = clientReadAt || element.dataset.clientReadAt || null;

        element.dataset.staffRead = currentStaffRead;
        element.dataset.clientRead = currentClientRead;
        element.dataset.staffReadAt = currentStaffReadAt || '';
        element.dataset.clientReadAt = currentClientReadAt || '';
        if (staffUserId) {
            element.dataset.staffUserId = staffUserId;
        }

        const indicator = element.querySelector('.read-status-indicator');
        if (indicator) {
            setIndicatorState(indicator, 'staff', {
                isRead: currentStaffRead,
                readAt: currentStaffReadAt,
                readByUsers
            });
            setIndicatorState(indicator, 'client', {
                isRead: currentClientRead,
                readAt: currentClientReadAt
            });

            indicator.title = buildCombinedTooltip({
                staff: { isRead: currentStaffRead, readAt: currentStaffReadAt, readByUsers },
                client: { isRead: currentClientRead, readAt: currentClientReadAt }
            });
        }

        const isAnyRead = currentStaffRead || currentClientRead;
        element.classList.toggle('read', isAnyRead);
        element.classList.toggle('unread', !isAnyRead);
    });
}

function setIndicatorState(indicator, role, { isRead, readAt, readByUsers = [] }) {
    const roleElement = indicator.querySelector(`[data-role="${role}"]`);
    if (!roleElement) return;

    roleElement.classList.toggle('read', !!isRead);
    roleElement.classList.toggle('unread', !isRead);

    const statusIcon = roleElement.querySelector('.status-icon');
    if (statusIcon) {
        statusIcon.className = `status-icon fas ${isRead ? 'fa-check-double' : 'fa-circle'}`;
    }

    let tooltip = role === 'staff' ? 'Staff' : 'Client';
    tooltip += isRead ? ' read' : ' unread';

    if (isRead && readAt) {
        tooltip += ` at ${new Date(readAt).toLocaleString()}`;
    }

    if (role === 'staff' && readByUsers.length > 0) {
        const userNames = readByUsers.map(user => user.staff_name || user.name).filter(Boolean);
        if (userNames.length > 0) {
            tooltip += `\nBy: ${userNames.join(', ')}`;
        }
    }

    roleElement.title = tooltip;
}

function buildCombinedTooltip({ staff, client }) {
    const tooltipLines = [];
    if (staff) {
        const staffLine = staff.isRead
            ? `Staff read at ${staff.readAt ? new Date(staff.readAt).toLocaleString() : 'unknown time'}`
            : 'Staff unread';
        tooltipLines.push(staffLine);
        if (staff.readByUsers && staff.readByUsers.length > 0) {
            const userNames = staff.readByUsers.map(user => user.staff_name || user.name).filter(Boolean);
            if (userNames.length > 0) {
                tooltipLines.push(`By: ${userNames.join(', ')}`);
            }
        }
    }

    if (client) {
        const clientLine = client.isRead
            ? `Client read at ${client.readAt ? new Date(client.readAt).toLocaleString() : 'unknown time'}`
            : 'Client unread';
        tooltipLines.push(clientLine);
    }

    return tooltipLines.join('\n');
}

function normalizeStatusPayload(messageId, data) {
    return {
        messageId,
        staffRead: normalizedGet(data, ['staffRead', 'staff_read'], false),
        staffReadAt: normalizedGet(data, ['staffReadAt', 'staff_read_at', 'lastReadAt'], null),
        staffUserId: normalizedGet(data, ['staffUserId', 'staff_user_id'], null),
        clientRead: normalizedGet(data, ['clientRead', 'client_read'], false),
        clientReadAt: normalizedGet(data, ['clientReadAt', 'client_read_at'], null),
        readByUsers: normalizedGet(data, ['readBy', 'read_by'], [])
    };
}

function normalizedGet(source, keys, fallback) {
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined && source[key] !== null) {
            return source[key];
        }
    }
    return fallback;
}

/**
 * Start periodic read status updates
 */
function startReadStatusUpdates() {
    setInterval(updateConversationReadStatus, READ_STATUS_CONFIG.checkInterval);
    console.log(`Started read status updates (every ${READ_STATUS_CONFIG.checkInterval/1000}s)`);
}

/**
 * Update read status for current conversation
 */
async function updateConversationReadStatus() {
    // Get current conversation UUID
    const currentLineUuid = getCurrentConversationUuid();
    if (!currentLineUuid) return;
    
    // Get all visible message elements and check their read status
    const messageElements = document.querySelectorAll('[data-message-id]');
    
    for (const element of messageElements) {
        const messageId = element.dataset.messageId;
        if (messageId) {
            try {
                const response = await fetch(`${READ_STATUS_CONFIG.checkReadUrl}/${currentLineUuid}/${messageId}`);
                if (response.ok) {
                    const data = await response.json();
                    const isSuccess = data.success === undefined ? true : !!data.success;
                    if (isSuccess) {
                        updateMessageReadStatus(normalizeStatusPayload(messageId, data));
                    }
                }
            } catch (error) {
                console.error(`Error checking read status for message ${messageId}:`, error);
            }
        }
    }
}

/**
 * Get current conversation UUID from the page
 */
function getCurrentConversationUuid() {
    // Try to find line UUID from various possible sources
    
    // Check if there's a data attribute on the chat container
    const chatContainer = document.querySelector('[data-line-uuid]');
    if (chatContainer) {
        return chatContainer.dataset.lineUuid;
    }
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const lineUuid = urlParams.get('lineUuid') || urlParams.get('line_uuid');
    if (lineUuid) return lineUuid;
    
    // Check if it's in the page HTML somewhere
    const uuidElement = document.querySelector('#current-line-uuid, .current-line-uuid');
    if (uuidElement) return uuidElement.textContent.trim();
    
    return null;
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    // Try to find user ID from various possible sources
    
    // Check if there's a user data element
    const userElement = document.querySelector('[data-user-id]');
    if (userElement) {
        return userElement.dataset.userId;
    }
    
    // Check if user info is stored in a global variable
    if (window.currentUser && window.currentUser.id) {
        return window.currentUser.id;
    }
    
    // Check meta tag
    const userMeta = document.querySelector('meta[name="user-id"]');
    if (userMeta) {
        return userMeta.getAttribute('content');
    }
    
    // Check if there's a user ID element on the page
    const userIdElement = document.querySelector('#current-user-id, .current-user-id');
    if (userIdElement) return userIdElement.textContent.trim();
    
    // Check localStorage or sessionStorage
    const storedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (storedUserId) return storedUserId;
    
    return null;
}

/**
 * Manually trigger read status check for specific message
 */
async function checkMessageReadStatus(lineUuid, messageId) {
    try {
        const response = await fetch(`${READ_STATUS_CONFIG.checkReadUrl}/${lineUuid}/${messageId}`);
        if (response.ok) {
            const data = await response.json();
            const isSuccess = data.success === undefined ? true : !!data.success;
            if (isSuccess) {
                updateMessageReadStatus(normalizeStatusPayload(messageId, data));
            }
            return data;
        }
    } catch (error) {
        console.error('Error checking message read status:', error);
    }
    return null;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initReadStatusTracking();
    console.log('Read status tracking initialized');
});

// Export functions for external use
window.readStatus = {
    init: initReadStatusTracking,
    markAsRead: markMessageAsRead,
    updateStatus: updateMessageReadStatus,
    checkStatus: checkMessageReadStatus,
    updateConversation: updateConversationReadStatus
};