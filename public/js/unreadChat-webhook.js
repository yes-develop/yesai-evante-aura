/**
 * Chat Webhook Integration - MySQL Version
 * 
 * This script handles unread chat tracking using MySQL database
 * instead of Google Sheets for better performance and integration.
 */

(function() {
  
  const N8N_UNREAD_ENDPOINT = '/api/n8n/unread-tracking';
  const MESSAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const processedMessageCache = new Map();

  function normalizeTimestamp(value) {
    if (!value) {
      return Date.now();
    }

    if (typeof value === 'number') {
      return value;
    }

    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : Date.now();
  }

  function createMessageCacheKey(lineUuid, messageText, timestamp, messageId = '') {
    const baseTimestamp = normalizeTimestamp(timestamp);
    return [lineUuid || '', messageId || '', baseTimestamp, messageText || '']
      .map(part => String(part).trim())
      .join('::');
  }

  function hasRecentlyProcessedMessage(key) {
    const recordedAt = processedMessageCache.get(key);
    if (!recordedAt) {
      return false;
    }

    if (Date.now() - recordedAt < MESSAGE_CACHE_TTL) {
      return true;
    }

    processedMessageCache.delete(key);
    return false;
  }

  function markMessageProcessed(key) {
    if (!key) return;
    processedMessageCache.set(key, Date.now());
  }

  async function fetchNextChatSequence(lineUuid) {
    try {
      const response = await fetch(`/api/next-chat-sequence/${lineUuid}`);
      if (response.ok) {
        const data = await response.json();
        if (data?.success && data.chatSequence) {
          return String(data.chatSequence);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch next chat sequence:', error);
    }
    return String(Date.now());
  }

  async function emitUnreadUpdate(lineUuid, unreadCount, options = {}) {
    try {
      if (!lineUuid) {
        return false;
      }

      const {
        messageText = '',
        source = 'backoffice',
        action = unreadCount > 0 ? 'set_unread' : 'clear_unread',
        assignedAt,
        chatSequence: explicitSequence = ''
      } = options;

      const timestamp = new Date().toISOString();
      const customerInfo = extractCustomerInfo(lineUuid);
      const assignmentInfo = await extractAssignedMember(lineUuid);

      let chatSequence = explicitSequence;
      if (!chatSequence && unreadCount > 0) {
        chatSequence = await fetchNextChatSequence(lineUuid);
      }

      const messageId = `msg_${lineUuid}_${chatSequence || '0'}_${Date.now()}`;

      const payload = {
        lineUuid,
        unreadCount,
        unreadChat: String(unreadCount),
        action,
        customer_info: customerInfo,
        profileName: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
        assignedMember: assignmentInfo.assignedMember,
        assignedMemberId: assignmentInfo.assignedMemberId,
        assignedAt: assignedAt || assignmentInfo.assignedAt,
        userInput: messageText || (unreadCount > 0 ? 'Unread message detected' : 'Message read'),
        aiResponse: '',
        chatMode: unreadCount > 0 ? 'Waiting response' : 'Read',
        messageChannel: 'Line',
        messageId,
        chatSequence,
        linkImage: '',
        aiRead: unreadCount > 0 ? 'false' : 'true',
        date: timestamp,
        needsNotification: unreadCount > 0,
        notificationScheduledAt: unreadCount > 0 ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null,
        timestamp,
        source,
        returnChat: unreadCount > 0 ? 'false' : 'true',
        summary: messageText ? `${messageText.substring(0, 50)}...` : `${action} - ${unreadCount > 0 ? 'Unread' : 'Read'}`,
        sequence: chatSequence,
        label: '',
        note: options.note || `Unread tracking update (${action})`
      };

      const cacheKey = createMessageCacheKey(lineUuid, messageText || action, timestamp, messageId);
      if (hasRecentlyProcessedMessage(cacheKey)) {
        console.log('🛑 Skipping duplicate unread webhook:', cacheKey);
        return false;
      }

      const success = await triggerUnreadWebhook(payload);
      if (success) {
        markMessageProcessed(cacheKey);
      }
      return success;
    } catch (error) {
      console.error('emitUnreadUpdate failed:', error);
      return false;
    }
  }
  
  // Function to clear all unread indicators
  function clearUnreadIndicators(lineUuid) {
    if (window.unreadBadgeCounts instanceof Map) {
      window.unreadBadgeCounts.delete(lineUuid);
    }
    // Remove from conversation list
    const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    if (conversationItem) {
      const unreadBadge = conversationItem.querySelector('.unread-badge');
      if (unreadBadge) {
        unreadBadge.remove();
      }
      conversationItem.classList.remove('unread');
      conversationItem.setAttribute('data-unread-count', '0');
    }

    // Remove from chat header
    const chatHeader = document.querySelector(`.chat-header[data-line-uuid="${lineUuid}"]`);
    if (chatHeader) {
      const unreadBadge = chatHeader.querySelector('.unread-badge');
      if (unreadBadge) {
        unreadBadge.remove();
      }
      chatHeader.classList.remove('unread');
    }

    // Remove from chat profile areas
    const chatProfile = document.querySelector('.chat-profile');
    if (chatProfile) {
      const unreadBadge = chatProfile.querySelector('.unread-badge');
      if (unreadBadge) {
        unreadBadge.remove();
      }
      chatProfile.classList.remove('unread');
    }

    // Remove from chat messages
    const chatMessages = document.querySelectorAll(`.chat-message[data-line-uuid="${lineUuid}"]`);
    chatMessages.forEach(message => {
      message.classList.remove('unread');
      const unreadIndicator = message.querySelector('.unread-indicator');
      if (unreadIndicator) {
        unreadIndicator.remove();
      }
    });
  }

  async function triggerUnreadWebhook(payload) {
    if (!N8N_UNREAD_ENDPOINT) return false;

    try {
      console.log('🎯 Triggering n8n webhook via backend proxy:', N8N_UNREAD_ENDPOINT);
      
      // Create abort controller for timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5 second timeout
      
      const response = await fetch(N8N_UNREAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          // Ensure string payload for compatibility with existing workflows
          unreadChat: payload?.unreadChat ?? (payload?.unreadCount ?? '').toString()
        }),
        signal: abortController.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        if (response.status === 404) {
          console.warn('⚠️ n8n webhook proxy returned 404. Check backend route configuration.');
        } else {
          console.warn('❌ n8n webhook responded with non-OK status:', response.status, response.statusText, errorText);
        }
        return false;
      }

      console.log('✅ n8n webhook successful');
      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ n8n webhook timeout after 5 seconds');
      } else if (error.message.includes('cors') || error.message.includes('CORS')) {
        console.warn('⚠️ CORS error calling n8n webhook. This is expected if n8n is not configured for CORS.');
      } else {
        console.warn('❌ Failed to trigger unread tracking webhook:', error);
      }
      return false;
    }
  }

  // Function to extract customer information from UI
  function extractCustomerInfo(lineUuid) {
    try {
      const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
      let customerName = '';
      let customerEmail = '';
      let customerPhone = '';
      
      if (conversationItem) {
        const nameSelectors = ['.customer-name', '.conversation-name', '.name', 'h3', '.title'];
        for (const selector of nameSelectors) {
          const nameElement = conversationItem.querySelector(selector);
          if (nameElement) {
            const possibleName = nameElement.textContent.trim();
            if (possibleName && possibleName !== '') {
              customerName = possibleName;
              break;
            }
          }
        }
      }
      
      return {
        name: customerName || 'Unknown Customer',
        email: customerEmail || '',
        phone: customerPhone || ''
      };
    } catch (error) {
      return { name: 'Unknown Customer', email: '', phone: '' };
    }
  }

  // Function to extract assigned member information
  async function extractAssignedMember(lineUuid) {
    try {
      let assignedMember = 'Unassigned';
      let assignedMemberId = '';
      
      // First try to get assignment from Laravel API (if available)
      try {
        console.log(`🔍 Checking assignment for lineUuid: ${lineUuid}`);
        const response = await fetch(`/api/chat-assignment/${lineUuid}`, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        console.log(`📡 API Response status: ${response.status}`);

        if (response.ok) {
          const assignmentData = await response.json();
          console.log('📋 Raw assignment data from API:', assignmentData);

          // Handle different response formats
          if (assignmentData.assigned !== false) {
            assignedMember = assignmentData.assigned_member || assignmentData.assigned_user_name || 'Unassigned';
            assignedMemberId = assignmentData.assigned_member_id || assignmentData.user_id || '';

            console.log('✅ Successfully extracted assignment:', {
              lineUuid,
              assignedMember,
              assignedMemberId,
              rawData: assignmentData
            });

            return {
              assignedMember: assignedMember,
              assignedMemberId: assignedMemberId,
              assignedAt: assignmentData.assigned_at || new Date().toISOString()
            };
          } else {
            console.log('❌ Assignment data indicates no assignment found');
          }
        } else {
          const errorText = await response.text();
          console.warn(`❌ Assignment API failed with status ${response.status}:`, errorText);
        }
      } catch (apiError) {
        console.warn('❌ Assignment API error:', apiError);
      }
      
      // Fallback to UI extraction
      const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
      if (conversationItem) {
        const assignmentSelectors = [
          '.assigned-to', 
          '.agent-name', 
          '.member-assigned', 
          '.assignment',
          '[data-assigned-member]',
          '[data-agent-name]'
        ];
        
        for (const selector of assignmentSelectors) {
          const assignmentElement = conversationItem.querySelector(selector);
          if (assignmentElement) {
            const memberText = assignmentElement.textContent.trim();
            const memberId = assignmentElement.getAttribute('data-user-id') || 
                           assignmentElement.getAttribute('data-member-id') ||
                           assignmentElement.getAttribute('data-assigned-id');
            
            if (memberText && memberText !== 'Unassigned' && memberText !== '') {
              assignedMember = memberText;
              assignedMemberId = memberId || '';
              break;
            }
          }
        }
      }
      
      return {
        assignedMember: assignedMember,
        assignedMemberId: assignedMemberId || '',
        assignedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting assigned member:', error);
      return { assignedMember: 'Unassigned', assignedMemberId: '', assignedAt: new Date().toISOString() };
    }
  }

  // Enhanced throttling to prevent duplicate webhook calls
  const webhookThrottle = new Map();
  const processedMessages = new Set();
  
  // Function to handle new customer message from Firebase or UI interception
  async function handleCustomerMessage(lineUuid, messageText, sourceData = null) {
    try {
      console.log('🔔 Processing customer message:', { lineUuid, messageText, sourceData });
      
      // Create unique message identifier
      const messageHash = `${lineUuid}-${messageText}-${Math.floor(Date.now() / 5000)}`; // 5-second window
      const throttleKey = `${lineUuid}-${messageText.substring(0, 50)}`;
      const now = Date.now();
      
      // Check if this exact message was already processed recently
      if (processedMessages.has(messageHash)) {
        console.log('🚫 Message already processed:', messageHash);
        return false;
      }
      
      // Throttle webhook calls - prevent duplicates within 5 seconds
      const lastCall = webhookThrottle.get(throttleKey);
      if (lastCall && (now - lastCall) < 5000) {
        console.log('🚫 Throttling duplicate webhook call for:', throttleKey);
        return false;
      }
      
      // Mark message as processed and update throttle
      processedMessages.add(messageHash);
      webhookThrottle.set(throttleKey, now);
      
      // Clean up old entries
      setTimeout(() => {
        processedMessages.delete(messageHash);
      }, 10000); // Clean after 10 seconds
      
      for (const [key, timestamp] of webhookThrottle.entries()) {
        if (now - timestamp > 10000) {
          webhookThrottle.delete(key);
        }
      }
      
      const customerInfo = extractCustomerInfo(lineUuid);
      const assignmentInfo = await extractAssignedMember(lineUuid);
      
      // Always increment unread count for customer messages
      const currentUnreadCount = getCurrentUnreadCount(lineUuid);
      const newUnreadCount = currentUnreadCount + 1;
      
      console.log('📈 Incrementing unread count:', { lineUuid, currentUnreadCount, newUnreadCount });
      
      // Update UI first
      await updateUnreadBadge(lineUuid, newUnreadCount);
      
      // Prepare data with actual customer message
      const success = await emitUnreadUpdate(lineUuid, newUnreadCount, {
        messageText,
        source: 'line_customer_message',
        action: 'set_unread'
      });

      if (success) {
        console.log('✅ Customer message processed successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error processing customer message:', error);
      return false;
    }
  }

  // Function to get current unread count from UI
  function getCurrentUnreadCount(lineUuid) {
    const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    if (conversationItem) {
      const unreadBadge = conversationItem.querySelector('.unread-badge');
      if (unreadBadge) {
        const count = parseInt(unreadBadge.textContent) || 0;
        return count;
      }
    }
    return 0;
  }

  // Firebase removed — message detection handled via UI interception

  // Function to intercept chat clicks and message updates
  function interceptChatClicks() {
    // Intercept loadConversation function
    if (window.loadConversation) {
      const originalLoadConversation = window.loadConversation;
      
      window.loadConversation = async function(lineUuid, row) {
        // Get current unread count before clearing
        const unreadCount = getCurrentUnreadCount(lineUuid);
        
        // Send to database (this will clear unread if count > 0)
        if (unreadCount > 0) {
          await emitUnreadUpdate(lineUuid, 0, {
            source: 'backoffice',
            action: 'clear_unread',
            messageText: 'Conversation viewed'
          });
        }

        if (window.unreadBadgeCounts instanceof Map) {
          window.unreadBadgeCounts.delete(lineUuid);
        }

        // Call original function
        return originalLoadConversation(lineUuid, row);
      };
    }
    
    // Intercept clearUnreadCount function
    if (window.clearUnreadCount) {
      const originalClearUnreadCount = window.clearUnreadCount;
      
      window.clearUnreadCount = async function(lineUuid, row) {
        // Send to database to clear unread
        await emitUnreadUpdate(lineUuid, 0, {
          source: 'backoffice',
          action: 'clear_unread',
          messageText: 'Conversation cleared'
        });

        if (window.unreadBadgeCounts instanceof Map) {
          window.unreadBadgeCounts.delete(lineUuid);
        }

        // Call original function
        return originalClearUnreadCount(lineUuid, row);
      };
    }

    // *** NEW: Intercept message arrival functions ***
    // Intercept upsertConversationListItem to detect new messages
    if (window.upsertConversationListItem) {
      const originalUpsert = window.upsertConversationListItem;
      
      window.upsertConversationListItem = async function(lineUuid, messageText, timestamp) {
        console.log('🔔 Message detected via upsertConversationListItem:', { lineUuid, messageText, timestamp });
        
        // Call original function first to update UI
        const result = originalUpsert(lineUuid, messageText, timestamp);
        
        // Check if this is a customer message (not agent response)
        const isCurrentConversation = window.currentState?.currentConversationId === lineUuid;
        const isCustomerMessage = messageText && !messageText.includes('[Agent]') && !messageText.includes('[AUTO]');
        
        console.log('📍 Message analysis:', { 
          isCurrentConversation, 
          currentId: window.currentState?.currentConversationId,
          isCustomerMessage,
          messageText: messageText?.substring(0, 50)
        });
        
        // Only process customer messages when user is NOT actively viewing the conversation
        if (lineUuid && isCustomerMessage && !isCurrentConversation) {
          const currentUnreadCount = getCurrentUnreadCount(lineUuid);
          const newUnreadCount = currentUnreadCount + 1;
          
          console.log('📈 Processing customer message as unread:', { lineUuid, currentUnreadCount, newUnreadCount });
          
          // Update unread badge in UI
          await updateUnreadBadge(lineUuid, newUnreadCount);
          
          // Use dedicated customer message handler with proper webhook data
          await handleCustomerMessage(lineUuid, messageText);
          
        } else if (isCurrentConversation) {
          console.log('👀 User is viewing conversation, not marking as unread');
        } else if (!isCustomerMessage) {
          console.log('🤖 Agent message detected, not marking as unread');
        }
        
        return result;
      };
      console.log('✅ Successfully intercepted upsertConversationListItem');
    }
    
    // Intercept updateConversationLastMessage as backup
    if (window.updateConversationLastMessage) {
      const originalUpdate = window.updateConversationLastMessage;
      
      window.updateConversationLastMessage = async function(lineUuid, messageText, timestamp) {
        // Call original function first
        const result = originalUpdate(lineUuid, messageText, timestamp);
        
        // Check if this creates an unread message
        const isCurrentConversation = window.currentState?.currentConversationId === lineUuid;
        
        if (!isCurrentConversation && lineUuid && messageText) {
          const currentUnreadCount = getCurrentUnreadCount(lineUuid);
          const newUnreadCount = currentUnreadCount + 1;
          
          // Update unread badge in UI
          await updateUnreadBadge(lineUuid, newUnreadCount);
          
          // Send webhook for new unread message  
          await emitUnreadUpdate(lineUuid, newUnreadCount, {
            messageText,
            source: 'backoffice_listener',
            action: 'set_unread'
          });
        }
        
        return result;
      };
    }
  }

  // Helper function to update unread badge in UI
  function updateUnreadBadge(lineUuid, unreadCount) {
    const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    if (conversationItem) {
      const indicatorsDiv = conversationItem.querySelector('.conversation-indicators');
      if (indicatorsDiv) {
        let unreadBadge = indicatorsDiv.querySelector('.unread-badge');
        
        if (unreadCount > 0) {
          if (!unreadBadge) {
            unreadBadge = document.createElement('span');
            unreadBadge.className = 'unread-badge';
            indicatorsDiv.appendChild(unreadBadge);
          }
          unreadBadge.textContent = unreadCount;
          conversationItem.classList.add('unread');
        } else {
          if (unreadBadge) {
            unreadBadge.remove();
          }
          conversationItem.classList.remove('unread');
        }
      }
    }
  }
  
  // Initialize when DOM is ready, but wait for app.js functions to load
  function waitForFunctions() {
    if (window.loadConversation && window.upsertConversationListItem) {
      console.log('✅ App.js functions detected, setting up webhook interception...');
      interceptChatClicks();
      return;
    }
    
    // Retry every 100ms until functions are available
    setTimeout(waitForFunctions, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForFunctions();
    });
  } else {
    waitForFunctions();
  }
  
  // Test function for manual webhook testing
  window.testMessageHistoryWebhook = function(lineUuid = 'test-uuid-123') {
    const testPayload = {
      lineUuid: lineUuid,
      unreadCount: 1,
      unreadChat: '1',
      action: 'test_webhook',
      customer_info: {
        name: 'Test Customer',
        phone: '+66123456789',
        email: 'test@example.com'
      },
      assignment_info: {
        assignedMember: 'Test Agent',
        assignedMemberId: 'agent123'
      },
      timestamp: new Date().toISOString(),
      source: 'manual_test',
      messageChannel: 'Line'
    };
    
    console.log('🧪 Testing message history webhook...', testPayload);
    return triggerUnreadWebhook(testPayload);
  };

  // Expose functions for external use
  window.unreadChatMySQL = {
    clearUnreadIndicators,
    emitUnreadUpdate,
    getCurrentUnreadCount,
    testWebhook: window.testMessageHistoryWebhook
  };

})();