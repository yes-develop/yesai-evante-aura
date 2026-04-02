/**
 * Status Webhook Handler
 * 
 * This module handles status changes for chat modes (AI/Manual)
 * and sends updates to the n8n webhook, which writes status into Google Sheets column C
 */

const WEBHOOK_URL = 'https://n8n-yesai.naijai.com/webhook/status-toggle';

/**
 * Initialize status change event listeners
 * Attaches listeners to chat mode dropdowns
 */
function initStatusWebhook() {
  console.log('Initializing status webhook handlers');

  // Listen for changes to existing chat mode selectors
  document.addEventListener('change', handleChatModeChange);

  // Also set up a mutation observer to catch dynamically added selectors
  setupMutationObserver();
}

/**
 * Handle chat mode selection changes
 * @param {Event} event - The change event
 */
function handleChatModeChange(event) {
  const target = event.target;

  // Check if the changed element is a chat mode select dropdown
  if (target.classList.contains('chat-mode-select')) {
    const lineUuid = target.dataset.lineUuid;
    const selectedMode = target.value;

    if (!lineUuid) {
      console.error('Missing lineUuid for chat mode change');
      return;
    }

    console.log(`Chat mode changed to ${selectedMode} for ${lineUuid}`);

    // Update the dropdown styling
    target.className = `chat-mode-select ${selectedMode === 'manual' ? 'manual' : 'ai'}`;

    // Send the status update to webhook
    sendStatusUpdate(lineUuid, selectedMode)
      .then(() => {
        showStatusUpdateSuccess(selectedMode);
      })
      .catch(error => {
        console.error('Error in handleChatModeChange:', error);
      });
  }
}

async function sendStatusUpdate(lineUuid, mode) {
  // Normalize ID: Strip FB_ or IG_ prefix if present to match raw IDs in Google Sheets
  const cleanId = String(lineUuid || '').replace(/^(FB_|IG_)/, '');
  
  // Convert mode to the expected value for Google Sheets ('manual chat' or empty)
  const statusValue = mode === 'ai' ? '' : mode;

  console.log(`Sending status update for ${cleanId}: ${statusValue}`);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lineUuid: cleanId,
        status: statusValue,
        timestamp: new Date().toISOString()
      })
    });

    console.log('Status update triggered:', response.status);

    // Try to parse response as JSON but don't throw if it fails
    let data;
    try {
      data = await response.json();
      console.log('Status update response data:', data);
    } catch (e) {
      // It's OK if the response isn't valid JSON, webhook might not return JSON
      console.log('Status update completed (non-JSON response)');
    }

    // Always show success notification
    showStatusUpdateSuccess(statusValue);
    return { success: true };
  } catch (error) {
    console.error('Error sending status update to webhook:', error);
    showStatusUpdateError();
    throw error; // Re-throw to allow handling by caller
  }
}

/**
 * Display error notification when status update fails
 */
function showStatusUpdateError() {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'status-update-error';
  notification.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>Failed to update chat mode. Please try again.</span>
    <button class="close-notification"><i class="fas fa-times"></i></button>
  `;

  // Add to document
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add('show'), 10);

  // Add close button handler
  const closeBtn = notification.querySelector('.close-notification');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });
  }

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

/**
 * Display success notification when status update succeeds
 * @param {string} mode - The selected mode ('ai' or 'manual')
 */
function showStatusUpdateSuccess(mode) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'status-update-success';
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Successfully updated to ${mode === 'manual chat' ? 'Manual' : 'AI'} mode.</span>
    <button class="close-notification"><i class="fas fa-times"></i></button>
  `;

  // Add to document
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add('show'), 10);

  // Add close button handler
  const closeBtn = notification.querySelector('.close-notification');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });
  }

  // Auto dismiss after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

/**
 * Set up mutation observer to attach listeners to dynamically added chat mode selectors
 */
function setupMutationObserver() {
  // Create a new observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is an element and contains chat mode selectors
          if (node.nodeType === Node.ELEMENT_NODE) {
            const selectors = node.querySelectorAll('.chat-mode-select');
            if (selectors.length > 0) {
              console.log(`Found ${selectors.length} new chat mode selectors`);
            }
          }
        });
      }
    });
  });

  // Start observing the document body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Add CSS styles for the error notification
function addStatusWebhookStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .status-update-error, .status-update-success {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      transform: translateY(100px);
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
    }
    
    .status-update-error {
      background-color: #ff4d4f;
      color: white;
    }
    
    .status-update-success {
      background-color: #52c41a;
      color: white;
    }
    
    .status-update-error.show, .status-update-success.show {
      transform: translateY(0);
      opacity: 1;
    }
    
    .status-update-error i, .status-update-success i {
      font-size: 18px;
    }
    
    .close-notification {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      margin-left: 10px;
      padding: 0;
    }
    
    .chat-mode-select {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid #d9d9d9;
      transition: all 0.3s;
    }
    
    .chat-mode-select.manual {
      background-color: #ff4d4f;
      color: white;
      border-color: #ff4d4f;
    }
    
    .chat-mode-select.ai {
      background-color: #1890ff;
      color: white;
      border-color: #1890ff;
    }
  `;

  document.head.appendChild(style);
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  addStatusWebhookStyles();
  initStatusWebhook();
  console.log('Status webhook handler initialized');
});

// Export functions for potential use in other modules
window.statusWebhook = {
  init: initStatusWebhook,
  sendUpdate: sendStatusUpdate
};