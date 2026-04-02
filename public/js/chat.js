/**
 * Display chat history for a specific user
 */
async function showChatHistory(lineUuid, displayName) {
    try {
        const sheetData = document.getElementById('sheetData');
        
        // Show loading indicator
        sheetData.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 15px;">กำลังโหลดประวัติการแชท...</p>
            </div>
        `;
        
        // Fetch chat history data from evante API with retry logic
        const data = await fetchSheetDataWithRetry('Sheet2', lineUuid);

        if (!data || !Array.isArray(data) || data.length === 0) {
            sheetData.innerHTML = `
                <div class="chat-history-header">
                    <button class="back-button" onclick="fetchData()">
                        <i class="fas fa-arrow-left"></i> Back to All Messages
                    </button>
                    <h2>${displayName || 'Unknown User'}</h2>
                    <div class="chat-info">
                        <span>LINE ID: ${lineUuid}</span>
                        <span>No chat history found</span>
                    </div>
                </div>
                <div class="no-messages">
                    <i class="fas fa-comments"></i>
                    <h3>No messages yet</h3>
                    <p>Start a conversation with this user</p>
                </div>
                <div class="chat-input-container">
                    <form onsubmit="sendMessage(event, '${lineUuid}', '${displayName}')">
                        <div class="message-input-wrapper">
                            <textarea id="message-input" placeholder="Type a message..." rows="1"></textarea>
                            <button type="submit" class="send-button">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                </div>
            `;
            
            setupAutoResizeTextarea();
            return;
        }
        
        // Process data rows (already an array of message objects from evante API)
        const rows = data;

        // Sort by date (newest first)
        rows.sort((a, b) => {
            const dateA = new Date(a.date || a.time || 0);
            const dateB = new Date(b.date || b.time || 0);
            return dateB - dateA;
        });

        // Group chats by thread ID
        const threads = {};
        rows.forEach(row => {
            const threadId = `${lineUuid}_${row.chatSequence || row.chat_sequence || 'unknown_thread'}`;
            if (!threads[threadId]) {
                threads[threadId] = [];
            }
            threads[threadId].push(row);
        });
        
        // Create HTML structure
        let chatHistoryHTML = `
            <div class="chat-history-header">
                <button class="back-button" onclick="fetchData()">
                    <i class="fas fa-arrow-left"></i> Back to All Messages
                </button>
                <h2>${displayName || 'Unknown User'}</h2>
                <div class="chat-info">
                    <span>LINE ID: ${lineUuid}</span>
                    <span>Total Messages: ${rows.length}</span>
                </div>
            </div>
            <div class="chat-history-list">
        `;
        
        // Add pagination controls
        const totalMessages = Object.values(threads).reduce((sum, thread) => sum + thread.length, 0);
        const messagesPerPage = 100; // Increased from 50 for better user experience
        const currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
        const totalPages = Math.ceil(totalMessages / messagesPerPage);
        const startIndex = (currentPage - 1) * messagesPerPage;
        
        // Add pagination header
        if (totalPages > 1) {
            chatHistoryHTML += `
                <div class="pagination-header">
                    <div class="pagination-info">
                        <span>Page ${currentPage} of ${totalPages} (${totalMessages} total messages)</span>
                    </div>
                    <div class="pagination-controls">
                        ${currentPage > 1 ? `<button onclick="loadChatPage(${currentPage - 1}, '${lineUuid}', '${displayName}')" class="page-btn">← Previous</button>` : ''}
                        ${currentPage < totalPages ? `<button onclick="loadChatPage(${currentPage + 1}, '${lineUuid}', '${displayName}')" class="page-btn">Next →</button>` : ''}
                    </div>
                </div>
            `;
        }
        
        // Add chat threads with pagination
        let count = 0;
        let messageIndex = 0;
        for (const threadId in threads) {
            threads[threadId].forEach((row, index) => {
                // Skip messages before current page
                if (messageIndex < startIndex) {
                    messageIndex++;
                    return;
                }
                
                // Stop if we've reached the page limit
                if (count >= messagesPerPage) return;
                count++;
                messageIndex++;
                
                const date = (row.date || row.time) ? new Date(row.date || row.time) : new Date();
                const userInput = row.message || row.userInput || row.user_input || '';
                const aiResponse = row.aiResponse || row.ai_response || '';
                const messageChannel = row.messageChannel || row.message_channel || 'Unknown';
                const messageId = row.chatSequence || row.chat_sequence || 'unknown_id';
                
                // Display messages based on messageChannel
                if (userInput) {
                    // Determine side based on messageChannel
                    const _mcLower = messageChannel.toLowerCase();
                    const isFromBackoffice = _mcLower === 'admin' || _mcLower === 'manual' || _mcLower === 'backoffice';
                    const isFromLine = messageChannel === 'Line' || messageChannel === 'LINE';
                    
                    // Check if userInput contains file attachments (URLs)
                    let messageBodyContent = userInput;
                    
                    // Check if the userInput is a file URL (common file extensions)
                    const fileExtensions = /\.(pdf|doc|docx|txt|xlsx|xls|ppt|pptx|zip|rar|mp4|mp3|wav|avi|mov|jpg|jpeg|png|gif|webp|svg)(\?|$)/i;
                    const isFileUrl = fileExtensions.test(userInput);
                    const isAdminFileFormat = userInput.includes('📎') && userInput.includes('🔗'); // Admin file format with emojis
                    
                    if (isFileUrl || isAdminFileFormat) {
                        let fileName, fileUrl, fileExt;
                        
                        if (isAdminFileFormat) {
                            // Extract filename and URL from admin format: "📎 filename\n🔗 url"
                            const lines = userInput.split('\n');
                            fileName = lines[0].replace('📎 ', '').trim();
                            fileUrl = lines[1].replace('🔗 ', '').trim();
                            fileExt = fileName.split('.').pop().toLowerCase();
                        } else {
                            // Regular file URL
                            fileName = userInput.split('/').pop().split('?')[0];
                            fileUrl = userInput;
                            fileExt = fileName.split('.').pop().toLowerCase();
                        }
                        
                        // Determine file icon and color
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
                        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
                            fileIcon = 'fas fa-image';
                            iconColor = '#9b59b6';
                        } else if (['mp4', 'avi', 'mov'].includes(fileExt)) {
                            fileIcon = 'fas fa-video';
                            iconColor = '#8e44ad';
                        } else if (['mp3', 'wav'].includes(fileExt)) {
                            fileIcon = 'fas fa-music';
                            iconColor = '#f39c12';
                        } else if (['zip', 'rar'].includes(fileExt)) {
                            fileIcon = 'fas fa-file-archive';
                            iconColor = '#95a5a6';
                        }
                        
                        // Create file attachment display
                        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
                            // For images, show preview
                            messageBodyContent = `
                                <div class="file-message">
                                    <div class="file-preview">
                                        <img src="${fileUrl}" alt="${fileName}" style="max-width: 200px; max-height: 150px; border-radius: 8px;" 
                                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                        <div class="file-item" style="display: none;">
                                            <div class="file-icon"><i class="${fileIcon}" style="color: ${iconColor};"></i></div>
                                            <div class="file-info">
                                                <div class="file-name">${fileName}</div>
                                                <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        } else {
                            // For other files, show file item
                            messageBodyContent = `
                                <div class="file-message">
                                    <div class="file-item">
                                        <div class="file-icon"><i class="${fileIcon}" style="color: ${iconColor};"></i></div>
                                        <div class="file-info">
                                            <div class="file-name">${fileName}</div>
                                            <a href="${fileUrl}" target="_blank" class="file-download"><i class="fas fa-download"></i></a>
                                        </div>
                                    </div>
                                </div>`;
                        }
                    }
                    
                    // Determine message side based on channel
                    const messageClass = isFromBackoffice ? 'received' : 'sent';
                    const messageLabel = isFromBackoffice ? 'Admin Message' : 'User Message';
                    
                    chatHistoryHTML += `
                        <div class="message ${messageClass}" data-timestamp="${date.getTime()}" data-message-id="${messageId}">
                            <div class="message-content">
                                <div class="message-header">
                                    <div class="message-date">${date.toLocaleString()}</div>
                                    <div class="message-meta">
                                        <span class="status ${isFromBackoffice ? 'admin-chat' : 'user-chat'}">${messageLabel}</span>
                                        <span class="sheet-badge">Sheet2</span>
                                    </div>
                                </div>
                                <div class="message-body">${messageBodyContent}</div>
                                <div class="message-footer">
                                    <div class="thread-id">Thread ID: ${threadId}</div>
                                    <div class="message-id">Message ID: ${messageId}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // Display AI/ADMIN responses (always on LEFT side)
                if (aiResponse) {
                    // Determine if this is AI response or Admin response based on chatMode
                    const isManualChat = messageChannel === 'Admin' || messageChannel === 'Manual' || messageChannel === 'BackOffice';
                    const responseLabel = isManualChat ? 'Admin Response' : 'AI Response';
                    
                    chatHistoryHTML += `
                        <div class="message received" data-timestamp="${date.getTime()}" data-message-id="${messageId}-ai">
                            <div class="message-content">
                                <div class="message-header">
                                    <div class="message-date">${date.toLocaleString()}</div>
                                    <div class="message-meta">
                                        <span class="status ${isManualChat ? 'admin-chat' : 'ai-chat'}">${responseLabel}</span>
                                        <span class="sheet-badge">Sheet2</span>
                                    </div>
                                </div>
                                <div class="message-body">${aiResponse}</div>
                                <div class="message-footer">
                                    <div class="thread-id">Thread ID: ${threadId}</div>
                                    <div class="message-id">Message ID: ${messageId}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        }
        
        // Add chat input form
        chatHistoryHTML += `
            </div>
            <div class="chat-input-container">
                <form onsubmit="sendMessage(event, '${lineUuid}', '${displayName}')">
                    <div class="message-input-wrapper">
                        <textarea id="message-input" placeholder="Type a message..." rows="1"></textarea>
                        <button type="submit" class="send-button">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        sheetData.innerHTML = chatHistoryHTML;
        setupAutoResizeTextarea();
        
        // Scroll to the newest message
        const chatHistoryList = document.querySelector('.chat-history-list');
        if (chatHistoryList) {
            chatHistoryList.scrollTop = 0;
        }

        // Subscribe to real-time admin replies for this user via Reverb
        if (typeof subscribeReverbChat === 'function') {
            subscribeReverbChat(lineUuid);
        }
    } catch (error) {
        handleChatError(error, 'loading chat history', `showChatHistory('${lineUuid}', '${displayName}')`);
    }
}

/**
 * Filter messages based on search input
 */
function filterMessages() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    const chatMessages = document.getElementsByClassName('chat-message');
    
    let visibleCount = 0;
    
    for (let i = 0; i < chatMessages.length; i++) {
        const messageContent = chatMessages[i].querySelector('.message-content');
        if (messageContent) {
            const text = messageContent.textContent || messageContent.innerText;
            if (text.toLowerCase().indexOf(filter) > -1) {
                chatMessages[i].style.display = "";
                visibleCount++;
            } else {
                chatMessages[i].style.display = "none";
            }
        }
    }
    
    const noResultsDiv = document.getElementById('no-results');
    if (visibleCount === 0 && filter !== '') {
        if (!noResultsDiv) {
            const newNoResults = document.createElement('div');
            newNoResults.id = 'no-results';
            newNoResults.className = 'no-messages';
            newNoResults.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>No matching messages</h3>
                <p>Try a different search term</p>
            `;
            
            const chatMessagesArea = document.querySelector('.chat-messages-area');
            if (chatMessagesArea) {
                chatMessagesArea.appendChild(newNoResults);
            }
        }
    } else if (noResultsDiv) {
        noResultsDiv.remove();
    }
}

/**
 * Display data from Google Sheet
 */
async function displayData(rows) {
    // Get the headers (first row)
    const headers = rows[0];
    // Get the data (remaining rows)
    const dataRows = rows.slice(1);
    
    // Map column indexes
    const lineIdIndex = headers.indexOf('LineID');
    const nameIndex = headers.indexOf('Name');
    const lastMessageIndex = headers.indexOf('LastMessage');
    const timestampIndex = headers.indexOf('Timestamp');
    const channelIndex = headers.indexOf('Channel');
    const unreadIndex = headers.indexOf('Unread');
    
    // Check if we have essential columns
    if (lineIdIndex === -1 || nameIndex === -1) {
        throw new Error('Required columns not found in sheet');
    }
    
    // Sort by timestamp (newest first)
    dataRows.sort((a, b) => {
        const timeA = a[timestampIndex] ? new Date(a[timestampIndex]) : new Date(0);
        const timeB = b[timestampIndex] ? new Date(b[timestampIndex]) : new Date(0);
        return timeB - timeA;
    });
    
    // Generate HTML
    let html = "";
    
    if (dataRows.length === 0) {
        html = `
            <div class="no-messages">
                <i class="fas fa-comments"></i>
                <h3>No messages found</h3>
                <p>There are no chat messages in the system yet.</p>
            </div>
        `;
    } else {
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const lineId = row[lineIdIndex] || 'unknown';
            const name = row[nameIndex] || 'Unknown User';
            const lastMessage = row[lastMessageIndex] || 'No message content';
            const timestamp = row[timestampIndex] ? formatDate(row[timestampIndex]) : 'Unknown time';
            const channel = row[channelIndex] || 'LINE';
            const unread = row[unreadIndex] === 'TRUE' || row[unreadIndex] === 'true';
            
            // Create a unique ID for this chat
            const chatId = `chat-${i}-${lineId.replace(/[^a-zA-Z0-9]/g, '')}`;
            
            html += `
                <div class="chat-message" id="${chatId}" onclick="showChatHistory('${lineId}', '${name}')">
                    <div class="profile-container">
                        <div class="profile-circle" style="background-color: ${getRandomColor()}">${getInitials(name)}</div>
                    </div>
                    <div class="message-content">
                        <div class="user-name">
                            ${name}
                            <span class="message-time">${timestamp}</span>
                        </div>
                        <div class="summary">${channel} Message</div>
                        <div class="message-preview">${lastMessage}</div>
                        <div class="message-details">
                            <div class="message-meta">
                                <i class="fas fa-${channel === 'LINE' ? 'comment' : 'comments'}"></i>
                                <span>${channel}</span>
                            </div>
                            ${unread ? '<span class="status unread">Unread</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
            
            // Try to fetch and update LINE profile pictures asynchronously
            if (lineId && lineId !== 'unknown') {
                fetchLineProfile(lineId).then(profile => {
                    if (profile && profile.pictureUrl) {
                        const chatElement = document.getElementById(chatId);
                        if (chatElement) {
                            const profileCircle = chatElement.querySelector('.profile-circle');
                            if (profileCircle) {
                                profileCircle.outerHTML = `<img src="${profile.pictureUrl}" alt="${name}" class="profile-image">`;
                            }
                        }
                    }
                }).catch(error => {
                    console.warn(`Could not fetch LINE profile for ${lineId}:`, error);
                });
            }
        }
    }
    
    document.getElementById("sheetData").innerHTML = html;
    
    // Add event listener for search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                filterMessages();
            }
        });
    }
}

/**
 * Load specific page of chat history
 */
function loadChatPage(page, lineUuid, displayName) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
    showChatHistory(lineUuid, displayName);
}

/**
 * Enhanced error handling for chat operations
 */
function handleChatError(error, operation, fallbackAction = null) {
    console.error(`Chat ${operation} error:`, error);
    
    const errorMessage = `
        <div class="chat-error">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error during ${operation}</h3>
            <p>${error.message || 'An unexpected error occurred'}</p>
            ${fallbackAction ? `<button onclick="${fallbackAction}" class="retry-button">Try Again</button>` : ''}
            <button onclick="fetchData()" class="back-button">
                <i class="fas fa-arrow-left"></i> Back to All Messages
            </button>
        </div>
    `;
    
    document.getElementById('sheetData').innerHTML = errorMessage;
}

/**
 * Fetch chat history from internal Laravel API with retry logic.
 * Uses /api/line-conversations (same-origin, no CORS) instead of Google Sheets.
 */
async function fetchSheetDataWithRetry(sheetName, lineUuid = null, maxRetries = 3) {
    const url = lineUuid
        ? `/api/line-conversations?lineUuid=${encodeURIComponent(lineUuid)}`
        : '/api/line-conversations';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Fetching chat history (attempt ${attempt}/${maxRetries})`);

            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const raw = await response.json();
            // Support both plain array and { data: [...] } wrapper
            const messages = Array.isArray(raw) ? raw : (Array.isArray(raw && raw.data) ? raw.data : []);

            if (messages.length > 0) {
                return messages;
            } else if (attempt === maxRetries) {
                return [];
            }

            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

        } catch (error) {
            if (attempt === maxRetries) {
                throw new Error(`Failed to fetch chat history after ${maxRetries} attempts: ${error.message}`);
            }
            console.warn(`Attempt ${attempt} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

/**
 * Real-time chat updates via Reverb/Echo.
 * Listens for admin replies on the user's private channel and appends
 * new messages to the existing chat history list without rebuilding the DOM.
 */
(function setupChatRealtime() {
    const REVERB_KEY = document.querySelector('meta[name="reverb-key"]')?.content;
    if (!REVERB_KEY) return;

    function tryConnectEcho() {
        if (typeof Echo === 'undefined' || typeof Pusher === 'undefined') return;

        try {
            const reverbHost   = document.querySelector('meta[name="reverb-host"]')?.content   || 'localhost';
            const reverbPort   = parseInt(document.querySelector('meta[name="reverb-port"]')?.content   || '8080');
            const reverbScheme = document.querySelector('meta[name="reverb-scheme"]')?.content || 'http';
            const echo = new Echo({
                broadcaster: 'pusher',
                key: REVERB_KEY,
                wsHost: reverbHost,
                wsPort: reverbPort,
                wssPort: reverbPort,
                forceTLS: reverbScheme === 'https',
                enabledTransports: ['ws', 'wss'],
                cluster: 'mt1',
                disableStats: true,
            });

            // Listen on a general chat channel; re-subscribe per conversation when lineUuid changes
            window._chatReverbEcho = echo;
            console.log('Chat: Reverb connected');
        } catch (e) {
            console.warn('Chat: Reverb connection failed', e);
        }
    }

    // Subscribe to a specific user's channel and append new admin messages to the visible chat list
    window.subscribeReverbChat = function (lineUuid) {
        const echo = window._chatReverbEcho;
        if (!echo || !lineUuid) return;

        // Leave previous subscription if any
        try {
            if (window._chatReverbChannel && typeof echo.leave === 'function') {
                echo.leave(window._chatReverbChannel);
            }
        } catch (e) { console.warn('[Reverb] Leave failed:', e.message); }
        window._chatReverbChannel = `chat.${lineUuid}`;

        echo.channel(`chat.${lineUuid}`).listen('.MessageSent', function (event) {
            console.log('[Reverb] MessageSent received:', event);

            const msg = event.message || event;

            // Build messageData compatible with addMessageToCurrentChat (app.js)
            const messageData = {
                messageId: msg.messageId || msg.id || '',
                chatSequence: msg.chatSequence || msg.id || '',
                userInput: msg.userInput || (msg.sender_type === 'user' ? (msg.content || msg.message || '') : ''),
                aiResponse: msg.aiResponse || (msg.sender_type === 'admin' ? (msg.content || msg.message || '') : ''),
                message: msg.message || msg.content || '',
                messageChannel: msg.messageChannel || (msg.sender_type === 'admin' ? 'BackOffice' : 'Line'),
                source: msg.source || msg.messageChannel || (msg.sender_type === 'admin' ? 'BackOffice' : 'Line'),
                time: msg.date || msg.timestamp || msg.created_at || new Date().toISOString(),
                date: msg.date || msg.timestamp || msg.created_at || new Date().toISOString(),
                linkImage: msg.linkImage || '',
                chatMode: msg.chatMode || 'Active',
                displayName: msg.displayName || '',
            };

            // Skip admin/backoffice messages — already shown via optimistic UI in sendMessage()
            const ch = (messageData.messageChannel || '').toLowerCase();
            if (ch === 'backoffice' || ch === 'admin' || ch === 'manual' || msg.sender_type === 'admin') {
                console.log('[Reverb] Skipping admin message (optimistic UI handles it)');
                return;
            }

            // Use app.js's addMessageToCurrentChat for consistent rendering
            if (typeof addMessageToCurrentChat === 'function') {
                addMessageToCurrentChat(messageData);
            }

            // Also update sidebar (skip unread increment for the currently open chat)
            if (typeof upsertConversationListItem === 'function') {
                const text = messageData.message || messageData.userInput || messageData.aiResponse || '';
                upsertConversationListItem(lineUuid, text, messageData.time);
            }

            // Defensively clear unread badge if this is the currently open chat
            if (typeof currentState !== 'undefined' && currentState.currentConversationId === lineUuid) {
                if (typeof updateUnreadBadge === 'function') {
                    updateUnreadBadge(lineUuid, 0);
                }
            }
        });
    };

    // If Echo/Pusher already loaded, connect immediately; otherwise wait for DOM ready
    if (typeof Echo !== 'undefined' && typeof Pusher !== 'undefined') {
        tryConnectEcho();
    } else {
        document.addEventListener('DOMContentLoaded', tryConnectEcho);
    }
})();