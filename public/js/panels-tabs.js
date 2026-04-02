const links = [
    'https://cdn-uicons.flaticon.com/2.6.0/uicons-thin-chubby/css/uicons-thin-chubby.css',
    'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css'
];

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

links.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
});

const scripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8/index.global.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8/locales/th.global.min.js'
];

scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
});

links.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
});


// แสดง iziToast เมื่อไม่ได้เลือกการสนทนา
function showIziToast() {
    iziToast.show({
        title: '<i class="fi fi-sr-exclamation"></i>',
        message: 'Please select a conversation to summarize.',
        position: 'topCenter',
        timeout: 4000,
        class: 'custom-toast',
        displayMode: "replace",
    });
}

function toggleInformation() {
    console.log("toggleInformation called");
    const aiTab = document.querySelector('.panel-tab[data-panel="information"]');
    console.log("Information tab element:", aiTab);

    if (aiTab) {
        console.log("Clicking information tab");
        aiTab.click();

        const panelsContainer = document.getElementById('panels-container');
        console.log("Panels container:", panelsContainer);

        if (panelsContainer) {
            console.log("Removing collapsed class from panels container");
            panelsContainer.classList.remove('collapsed');

            const informationPanel = document.getElementById('information-panel');
            console.log("Information panel element:", informationPanel);

            if (informationPanel) {
                console.log("Setting information panel as active");
                document.querySelectorAll('.panel-content').forEach(content => {
                    content.classList.remove('active');
                });
                informationPanel.classList.add('active');

                // Render the information panel content
                console.log("Calling renderInformationSection");
                renderInformationSection();
            } else {
                console.error("Information panel element not found!");
            }
        } else {
            console.error("Panels container not found!");
        }
    } else {
        console.error("Information tab not found!");
    }
}

function toggleAIAssistant() {
    const aiTab = document.querySelector('.panel-tab[data-panel="ai"]');
    if (aiTab) {
        aiTab.click();

        const panelsContainer = document.getElementById('panels-container');
        if (panelsContainer) {
            panelsContainer.classList.remove('collapsed');

            const aiPanel = document.getElementById('ai-panel');
            if (aiPanel) {
                document.querySelectorAll('.panel-content').forEach(content => {
                    content.classList.remove('active');
                });
                aiPanel.classList.add('active');
            }
        }
    } else {
        console.error("AI Assistant tab not found!");
    }
}

function toggleTeamChat() {
    const teamTab = document.querySelector('.panel-tab[data-panel="team"]');
    if (teamTab) {
        teamTab.click();

        const panelsContainer = document.getElementById('panels-container');
        if (panelsContainer) {
            panelsContainer.classList.remove('collapsed');

            const teamPanel = document.getElementById('team-panel');
            if (teamPanel) {
                document.querySelectorAll('.panel-content').forEach(content => {
                    content.classList.remove('active');
                });
                teamPanel.classList.add('active');
            }
        }
    } else {
        console.error("Team Chat tab not found!");
    }
}

// Add new function to toggle panels visibility
function togglePanels() {
    const panelsContainer = document.getElementById('panels-container');
    if (panelsContainer) {
        panelsContainer.classList.toggle('visible');
    }
}

function renderAISection() {
    console.log("Rendering AI Section");
    const aiPanel = document.getElementById('ai-panel');
    if (!aiPanel) {
        console.error("AI panel element not found!");
        return;
    }

    aiPanel.innerHTML = `
        <div>
            <div class="ai-suggestion">
                <h3>Smart Suggestions <span id="suggestions-loading" style="display: none;"><i class="fas fa-spinner fa-spin" style="font-size: 14px;"></i></span></h3>
                <div class="suggestion-list" id="suggestion-list">
                    <div class="suggestion-placeholder">
                        <i class="fi fi-tr-lightbulb-on"></i>
                        <p>Select a conversation to get AI-generated reply suggestions</p>
                    </div>
                    </div>
                <button id="refresh-suggestions" class="refresh-suggestions-btn">
                    <i class="fas fa-sync-alt"></i> Generate New Suggestions
                </button>
            </div>
            
            <div class="ai-tools">
                <h3>Smart Tools</h3>
                <div class="tool-list">
                    <div class="tool-item" data-tool="summarize">
                        <i class="fi fi-tr-document"></i>
                        <span>Summarize</span>
                    </div>
                    <div class="tool-item" data-tool="translate">
                        <i class="fi fi-tr-language"></i>
                        <span>Translate</span>
                    </div>
                    <div class="tool-item" data-tool="analytics">
                        <i class="fi fi-tr-chart-histogram"></i>
                        <span>Analytics</span>
                    </div>
                    <div class="tool-item" data-tool="schedule">
                        <i class="fi fi-tr-calendar-clock"></i>
                        <span>Schedule</span>
                    </div>
                </div>
            </div>
            
            <!-- <div class="ai-chat-history">
                <h3>Recent AI Chats</h3>
                <div class="history-item">
                    <h4>Product Inquiry Analysis</h4>
                    <p>AI analysis of customer questions about new product features.</p>
                    <div class="history-meta">
                        <span>Today, 10:32 AM</span>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
                <div class="history-item">
                    <h4>Email Response Draft</h4>
                    <p>Generated email response for client technical support request.</p>
                    <div class="history-meta">
                        <span>Yesterday</span>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div> -->
        </div>
    `;

    // Wait for the conversation to be selected and generate suggestions
    checkAndGenerateSuggestions();

    // Set up listener for conversation changes
    document.addEventListener('conversationSelected', function (e) {
        if (e.detail && e.detail.lineUuid) {
            generateSuggestionsForConversation(e.detail.lineUuid);
        }
    });

    // Add click handler for refresh button
    const refreshBtn = document.getElementById('refresh-suggestions');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const currentConversation = document.querySelector('.conversation-item.active');
            if (currentConversation) {
                const lineUuid = currentConversation.getAttribute('data-id');
                if (lineUuid) {
                    generateSuggestionsForConversation(lineUuid);
                }
            } else {
                alert('Please select a conversation first');
            }
        });
    }

    const closeAiBtn = document.getElementById('close-ai-btn');
    if (closeAiBtn) {
        closeAiBtn.addEventListener('click', toggleAIAssistant);
    }

    const toolItems = aiPanel.querySelectorAll('.tool-item');
    toolItems.forEach(item => {
        item.addEventListener('click', () => {
            const tool = item.getAttribute('data-tool');
            switch (tool) {
                case 'summarize':
                    const currentConversationElement = document.querySelector('.conversation-item.active');
                    if (!currentConversationElement) {
                        showIziToast();
                        return;
                    }

                    const lineUuid = currentConversationElement.getAttribute('data-id');
                    if (!lineUuid) {
                        alert('Could not identify the current conversation.');
                        return;
                    }

                    summarizeConversation(lineUuid);
                    break;
                case 'translate':
                    showTranslationTool();
                    break;
                case 'analytics':
                    showAnalyticsModal();
                    break;
                case 'schedule':
                    showCalendarTool();
                    break;
                default:
                    alert(`${item.querySelector('span').textContent} tool will be available soon!`);
            }
        });
    });
}

// Function to check if a conversation is already selected and generate suggestions
function checkAndGenerateSuggestions() {
    // Wait a short moment for the page to fully load
    setTimeout(() => {
        const currentConversation = document.querySelector('.conversation-item.active');
        if (currentConversation) {
            const lineUuid = currentConversation.getAttribute('data-id');
            if (lineUuid) {
                generateSuggestionsForConversation(lineUuid);
            }
        }
    }, 500);
}

// Function to generate suggestions based on the current conversation
function generateSuggestionsForConversation(lineUuid) {
    const suggestionsList = document.getElementById('suggestion-list');
    const loadingIndicator = document.getElementById('suggestions-loading');

    if (!suggestionsList || !lineUuid) return;

    // Show loading indicator
    if (loadingIndicator) loadingIndicator.style.display = 'inline-block';

    // Show loading state
    suggestionsList.innerHTML = `
        <div class="suggestion-loading">
            <p>Generating smart replies...</p>
        </div>
    `;

    // Get conversation messages from evante API
    fetch(`/api/line-conversations?lineUuid=${encodeURIComponent(lineUuid)}`, {
        headers: { 'Accept': 'application/json' }
    })
        .then(res => {
            if (!res.ok) throw new Error('API HTTP ' + res.status);
            return res.json();
        })
        .then(raw => {
            const arr = Array.isArray(raw) ? raw : (Array.isArray(raw && raw.data) ? raw.data : []);
            if (!arr.length) {
                throw new Error('No chat history found for this conversation.');
            }

            const messages = arr.map(value => ({
                isFromCustomer: !value.aiResponse,
                text: value.userInput || value.message || value.aiResponse || '',
                timestamp: new Date(value.date || value.time || value.timestamp || 0).getTime() || 0,
                displayName: value.displayName || ''
            })).filter(m => m.text);

            if (messages.length === 0) {
                throw new Error('No chat history found for this conversation.');
            }

            // Sort messages by timestamp
            messages.sort((a, b) => a.timestamp - b.timestamp);

            // Get the last 3-5 messages for context
            const recentMessages = messages.slice(-5);

            // Format the conversation for the AI
            let conversationText = recentMessages.map(msg => {
                const role = msg.isFromCustomer ? "Customer" : "Agent";
                return `${role}: ${msg.text}`;
            }).join('\n');

            // Check if the last message is from a customer
            const lastMessageIsFromCustomer = recentMessages.length > 0 && recentMessages[recentMessages.length - 1].isFromCustomer;

            if (!lastMessageIsFromCustomer) {
                // If last message is not from customer, show different suggestions
                generateStandardSuggestions(suggestionsList, loadingIndicator);
                return;
            }

            // Get customer's last message for better suggestions
            const lastCustomerMessage = recentMessages.filter(msg => msg.isFromCustomer).pop();

            // Call the ChatGPT API to generate response suggestions
            generateAIResponses(conversationText, lastCustomerMessage.text, suggestionsList, loadingIndicator);
        })
        .catch(error => {
            console.error('Error generating suggestions:', error);
            suggestionsList.innerHTML = `
                <div class="suggestion-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error generating suggestions: ${error.message}</p>
                </div>
            `;

            if (loadingIndicator) loadingIndicator.style.display = 'none';
        });
}

// Function to call ChatGPT API for response suggestions
function generateAIResponses(conversationText, lastCustomerMessage, suggestionsList, loadingIndicator) {
    // For demo purposes, we'll use a mock API call with setTimeout
    // In a real implementation, you would make an API call to your ChatGPT endpoint

    setTimeout(() => {
        try {
            // Generate suggestions based on the latest customer message
            let suggestions = [];

            // Analyze the customer message for keywords and intent
            const message = lastCustomerMessage.toLowerCase();

            // Common patterns for different types of queries
            if (message.includes('price') || message.includes('cost') || message.includes('how much') || message.includes('discount')) {
                suggestions.push("Our standard package costs $99 per month. For your specific needs, I can prepare a custom quote with a special discount.");
                suggestions.push("I'd be happy to provide pricing information. Could you tell me which specific service you're interested in?");
                suggestions.push("Let me check our current pricing options for you. We're actually running a promotion this month.");
            }
            else if (message.includes('delivery') || message.includes('shipping') || message.includes('arrive') || message.includes('when')) {
                suggestions.push("Standard delivery takes 3-5 business days. For your location, I expect delivery by the end of this week.");
                suggestions.push("Let me check the status of your order. Our system shows it should be delivered within the next 48 hours.");
                suggestions.push("We offer express shipping options that can deliver your package within 24 hours. Would you like me to arrange that?");
            }
            else if (message.includes('problem') || message.includes('issue') || message.includes('not working') || message.includes('error') || message.includes('help')) {
                suggestions.push("I'm sorry to hear you're experiencing this issue. Let me help troubleshoot this for you right away.");
                suggestions.push("I understand this is frustrating. Could you provide a few more details about the problem so I can assist you better?");
                suggestions.push("Let me connect you with our technical support team who can resolve this issue. They're available now to help.");
            }
            else if (message.includes('thank') || message.includes('appreciate') || message.includes('helpful')) {
                suggestions.push("You're very welcome! Is there anything else I can assist you with today?");
                suggestions.push("I'm glad I could help. Please don't hesitate to reach out if you have any other questions.");
                suggestions.push("It's my pleasure to assist you. Would you like me to email you a summary of what we discussed?");
            }
            else if (message.includes('cancel') || message.includes('refund') || message.includes('return')) {
                suggestions.push("I understand you'd like to cancel/return your order. Let me guide you through our simple return process.");
                suggestions.push("I apologize for the inconvenience. I can process your refund right away, which will appear on your account within 3-5 business days.");
                suggestions.push("While I'm processing your return, would you mind sharing what didn't meet your expectations so we can improve?");
            }
            else if (message.includes('feature') || message.includes('work') || message.includes('function') || message.includes('do')) {
                suggestions.push("That's a great question about our features. This specific function allows you to automate reporting and save approximately 5 hours per week.");
                suggestions.push("Let me walk you through how this feature works in detail. It's designed to simplify your workflow significantly.");
                suggestions.push("I'd be happy to demonstrate this feature via a quick screen-sharing session. Would that be helpful?");
            }
            else if (message.includes('appointment') || message.includes('schedule') || message.includes('meeting') || message.includes('call')) {
                suggestions.push("I'd be happy to schedule a call with you. Would tomorrow at 2 PM work for your schedule?");
                suggestions.push("Let's set up a meeting to discuss this in more detail. I have availability this Thursday and Friday afternoon.");
                suggestions.push("I'll send you a calendar invitation for a follow-up call where we can address all your questions comprehensively.");
            }
            else {
                // General responses for other types of messages
                suggestions = [
                    "Thank you for reaching out. I'll look into this right away and get back to you as soon as possible.",
                    "I appreciate your message. Let me gather the information you need and I'll provide a comprehensive response shortly.",
                    "Thank you for sharing these details. Would it be helpful if I scheduled a quick call to discuss this further?",
                    "I understand what you're looking for. Let me check with our team and provide you with the best solution for your needs."
                ];
            }

            // Randomly select 4 suggestions or use all if less than 4
            if (suggestions.length > 4) {
                // Shuffle array using Fisher-Yates algorithm
                for (let i = suggestions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [suggestions[i], suggestions[j]] = [suggestions[j], suggestions[i]];
                }
                suggestions = suggestions.slice(0, 4);
            }

            // Render suggestions
            suggestionsList.innerHTML = suggestions.map(text =>
                `<div class="suggestion-item">${text}</div>`
            ).join('');

            // Add click handlers for suggestion items
            const suggestionItems = suggestionsList.querySelectorAll('.suggestion-item');
            suggestionItems.forEach(item => {
                item.addEventListener('click', () => {
                    const messageInput = document.getElementById('message-input');
                    if (messageInput) {
                        messageInput.value = item.textContent.trim();
                        messageInput.focus();
                    } else {
                        console.error("Message input not found when clicking suggestion");
                    }
                });
            });

        } catch (err) {
            console.error('Error in suggestion generation:', err);
            suggestionsList.innerHTML = `
                <div class="suggestion-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Sorry, we couldn't generate suggestions at this time.</p>
                </div>
            `;
        } finally {
            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }, 1000); // Simulate API delay
}

// Function to generate standard suggestions when no customer message is available
function generateStandardSuggestions(suggestionsList, loadingIndicator) {
    const standardSuggestions = [
        "I'll look into that issue and get back to you shortly.",
        "Would you like to schedule a video call to discuss this in more detail?",
        "Let me check our inventory and pricing options for you.",
        "I've attached the document you requested. Please let me know if you need anything else."
    ];

    suggestionsList.innerHTML = standardSuggestions.map(text =>
        `<div class="suggestion-item">${text}</div>`
    ).join('');

    // Add click handlers for suggestion items
    const suggestionItems = suggestionsList.querySelectorAll('.suggestion-item');
    suggestionItems.forEach(item => {
        item.addEventListener('click', () => {
            const messageInput = document.getElementById('message-input');
            if (messageInput) {
                messageInput.value = item.textContent.trim();
                messageInput.focus();
            } else {
                console.error("Message input not found when clicking suggestion");
            }
        });
    });

    // Hide loading indicator
    if (loadingIndicator) loadingIndicator.style.display = 'none';
}

// Add this function to clear customer data when changing conversations
function clearCustomerData() {
    localStorage.removeItem('customerSummary');

    // Clear input fields if they exist
    const phoneInput = document.getElementById('customer-phone');
    const emailInput = document.getElementById('customer-email');
    if (phoneInput) phoneInput.value = '';
    if (emailInput) emailInput.value = '';
}

async function summarizeConversation(lineUuid) {
    console.log("Starting summarize for:", lineUuid);

    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'summary-overlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    loadingOverlay.innerHTML = `
        <div class="summary-popup" style="max-width: 400px; background: white; border-radius: 8px; padding: 30px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            <div class="summary-header" style="margin-bottom: 20px;">
                <h3 style="margin: 0; color: #333;">Generating Summary</h3>
            </div>
            <div class="summary-content">
                <p style="text-align: center; margin: 0;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px; color: #007cba;"></i><br>
                    Analyzing conversation and creating summary...
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    try {
        // Clear previous data
        clearCustomerData();

        // Extract customer information
        const customerData = await extractCustomerInfo(lineUuid);
        console.log("Extracted customer data:", customerData);

        if (!customerData) {
            throw new Error('Could not extract customer information');
        }

        // Get customer name from chat header
        let customerName = '';
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            const nameElement = chatHeader.querySelector('.customer-name');
            if (nameElement) {
                customerName = nameElement.textContent.trim();
            }
        }

        // If no name found in chat header, use the one from customerData
        if (!customerName) {
            customerName = customerData.name || 'Unknown Customer';
        }

        // Get messages for AI analysis
        const messages = await getConversationMessages(lineUuid);

        const summary = `
            <div class="summary-content" style="padding: 20px;">
                <div class="customer-info">
                    <div class="section-title" style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 2px solid #007cba; padding-bottom: 5px;">Customer Summary</div>
                    <div class="customer-details" style="display: grid; gap: 15px;">
                        <div class="customer-field" style="display: flex; flex-direction: column; gap: 5px;">
                            <label class="field-label" style="font-weight: 500; color: #555; font-size: 14px;">Name</label>
                            <input type="text" class="field-input" value="${customerName}" readonly style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; font-size: 14px;">
                        </div>
                        <div class="customer-field" style="display: flex; flex-direction: column; gap: 5px;">
                            <label class="field-label" style="font-weight: 500; color: #555; font-size: 14px;">LINE UID</label>
                            <input type="text" class="field-input" value="${customerData.lineUuid || ''}" readonly style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; font-size: 14px;">
                        </div>
                        <div class="customer-field" style="display: flex; flex-direction: column; gap: 5px;">
                            <label class="field-label" style="font-weight: 500; color: #555; font-size: 14px;">Email</label>
                            <input type="text" class="field-input" value="${customerData.email || ''}" readonly style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; font-size: 14px;">
                        </div>
                        <div class="customer-field" style="display: flex; flex-direction: column; gap: 5px;">
                            <label class="field-label" style="font-weight: 500; color: #555; font-size: 14px;">Key Customer Focus</label>
                            <input type="text" class="field-input focus-area" value="Analyzing..." readonly style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background-color: #fff8e1; font-size: 14px;">
                        </div>
                        <div class="customer-field" style="display: flex; flex-direction: column; gap: 5px;">
                            <label class="field-label" style="font-weight: 500; color: #555; font-size: 14px;">Customer Needs</label>
                            <input type="text" class="field-input needs-area" value="Analyzing..." readonly style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background-color: #fff8e1; font-size: 14px;">
                        </div>
                        <div class="customer-field" style="display: flex; flex-direction: column; gap: 5px;">
                            <label class="field-label" style="font-weight: 500; color: #555; font-size: 14px;">Recent Question</label>
                            <textarea class="field-input questions-area" readonly style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background-color: #fff8e1; font-size: 14px; resize: vertical; min-height: 60px;">Analyzing...</textarea>
                        </div>
                    </div>
                    <div class="summary-actions" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                        <button id="confirm-summary" style="background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Save Summary</button>
                        <button class="close-summary" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Remove loading overlay and show summary
        document.body.removeChild(loadingOverlay);
        const summaryOverlay = document.createElement('div');
        summaryOverlay.className = 'summary-overlay';
        summaryOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        summaryOverlay.innerHTML = `
            <div class="summary-popup" style="max-width: 600px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); max-height: 80vh; overflow-y: auto;">
                <div class="summary-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e0e0e0;">
                    <h3 style="margin: 0; color: #333; font-size: 18px;">Chat Summary</h3>
                    <button class="close-summary" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 0; min-width: 30px; height: 30px;">&times;</button>
                </div>
                ${summary}
            </div>
        `;
        document.body.appendChild(summaryOverlay);


        // Perform AI analysis after the summary is shown
        await updateSummaryAnalysis(messages);

        // Add event listeners
        const closeBtn = summaryOverlay.querySelector('.close-summary');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(summaryOverlay);
        });

        summaryOverlay.addEventListener('click', (e) => {
            if (e.target === summaryOverlay) {
                document.body.removeChild(summaryOverlay);
            }
        });

        // Add confirm button handler
        const confirmBtn = summaryOverlay.querySelector('#confirm-summary');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const updatedData = {
                    lineUuid: customerData.lineUuid,
                    name: customerName
                };

                // Save to localStorage
                localStorage.setItem('customerSummary', JSON.stringify(updatedData));
                console.log('Saved customer data:', updatedData);

                // Update information panel if it's visible
                const infoPanel = document.getElementById('information-panel');
                if (infoPanel && infoPanel.classList.contains('active')) {
                    updateInformationPanel(lineUuid);
                }

                // Show success message and close
                alert('Customer information saved successfully');
                document.body.removeChild(summaryOverlay);
            });
        }

    } catch (error) {
        console.error('Error in summarizeConversation:', error);

        if (document.body.contains(loadingOverlay)) {
            document.body.removeChild(loadingOverlay);
        }

        // Determine error type for better user messaging
        let errorMessage = 'Unknown error occurred';
        let errorDetails = '';

        if (error.message.includes('Firebase')) {
            errorMessage = 'Unable to connect to conversation data';
            errorDetails = 'Please check your internet connection and try again.';
        } else if (error.message.includes('customer information')) {
            errorMessage = 'Customer information not available';
            errorDetails = 'The conversation may not contain extractable customer data.';
        } else if (error.message.includes('No conversation data')) {
            errorMessage = 'No conversation found';
            errorDetails = 'This conversation may not exist or has been removed.';
        } else {
            errorMessage = 'Error generating summary';
            errorDetails = error.message;
        }

        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'summary-overlay';
        errorOverlay.innerHTML = `
            <div class="summary-popup">
                <div class="summary-header">
                    <h3>Summary Error</h3>
                    <button class="close-summary">×</button>
                </div>
                <div class="summary-content">
                    <div class="error-message">
                        <p><strong>${errorMessage}</strong></p>
                        <p>${errorDetails}</p>
                        ${error.stack ? `<details><summary>Technical details</summary><pre>${error.stack}</pre></details>` : ''}
                    </div>
                    <div class="error-actions">
                        <button class="retry-summary btn btn-primary" onclick="this.closest('.summary-overlay').remove(); summarizeConversation('${lineUuid}');">Retry</button>
                        <button class="close-summary btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(errorOverlay);

        // Add event listeners
        const closeErrorBtn = errorOverlay.querySelector('.close-summary');
        closeErrorBtn.addEventListener('click', () => {
            document.body.removeChild(errorOverlay);
        });

        const retryBtn = errorOverlay.querySelector('.retry-summary');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                document.body.removeChild(errorOverlay);
                // Retry with current lineUuid
                const currentLineUuid = document.querySelector('.conversation-item.active')?.getAttribute('data-id');
                if (currentLineUuid) {
                    summarizeConversation(currentLineUuid);
                }
            });
        }

        // Auto-close after 30 seconds
        setTimeout(() => {
            if (document.body.contains(errorOverlay)) {
                document.body.removeChild(errorOverlay);
            }
        }, 30000);
    }
}

// Function to get conversation messages from evante API
async function getConversationMessages(lineUuid) {
    try {
        console.log('Fetching messages for lineUuid:', lineUuid);
        const response = await fetch(`/api/line-conversations?lineUuid=${encodeURIComponent(lineUuid)}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('API HTTP ' + response.status);
        const raw = await response.json();
        const arr = Array.isArray(raw) ? raw : (Array.isArray(raw && raw.data) ? raw.data : []);

        const messages = arr.map(msg => {
            const messageText = msg.userInput || msg.message || msg.aiResponse ||
                msg.text || msg.content || msg.messageText || '';
            if (!messageText.trim()) return null;

            const timestamp = msg.date ? new Date(msg.date).getTime() :
                msg.timestamp ? new Date(msg.timestamp).getTime() :
                msg.created_at ? new Date(msg.created_at).getTime() : Date.now();

            const isFromCustomer = !msg.aiResponse && !msg.ai_response &&
                !msg.botResponse && !msg.bot_response &&
                (msg.userInput || msg.user_input || msg.isFromUser ||
                    (!msg.fromBot && !msg.from_bot));

            return {
                text: messageText.trim(),
                timestamp: timestamp,
                isFromCustomer: isFromCustomer,
                messageType: msg.aiResponse || msg.ai_response ? 'ai' : 'user',
            };
        }).filter(Boolean);

        console.log(`Fetched ${messages.length} messages for ${lineUuid}`);

        // Sort messages by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);

        return messages;
    } catch (error) {
        console.error('Error getting conversation messages:', error);
        return [];
    }
}


// Enhanced function to analyze customer messages and update summary fields
async function updateSummaryAnalysis(messages) {
    if (!messages || messages.length === 0) {
        updateSummaryFields({
            focus: 'No conversation data available',
            needs: 'No conversation data available',
            question: 'No conversation data available'
        });
        return;
    }

    try {
        console.log('Analyzing', messages.length, 'total messages');

        // Get only customer messages and ensure text is string
        const customerMessages = messages.filter(msg => msg.isFromCustomer).map(msg => ({
            ...msg,
            text: String(msg.text || '').trim()
        }));

        console.log('Found', customerMessages.length, 'customer messages');

        if (customerMessages.length === 0) {
            updateSummaryFields({
                focus: 'No customer messages found',
                needs: 'No customer messages found',
                question: 'No customer messages found'
            });
            return;
        }

        // Join all messages text with proper type checking
        const allText = customerMessages
            .map(msg => String(msg.text || '').toLowerCase())
            .join(' ');

        console.log('All customer text preview:', allText.substring(0, 200) + '...');

        // Get the most recent messages for context (last 10 instead of 5)
        const recentMessages = customerMessages.slice(-10);

        // Enhanced focus analysis with more categories and better detection
        let focus = '';
        const focusKeywords = {
            'Price Inquiry': ['price', 'cost', 'ราคา', 'เงิน', 'money', 'fee', 'charge', 'payment', 'pay'],
            'Booking/Reservation': ['book', 'reserve', 'จอง', 'appointment', 'schedule', 'นัด'],
            'Product/Service Info': ['product', 'service', 'สินค้า', 'บริการ', 'what do you', 'tell me about'],
            'Location/Direction': ['location', 'where', 'ที่ไหน', 'address', 'ที่อยู่', 'direction', 'how to get'],
            'Problem/Issue': ['problem', 'issue', 'ปัญหา', 'error', 'wrong', 'not working', 'help', 'ช่วย'],
            'Contact/Support': ['contact', 'phone', 'email', 'support', 'ติดต่อ'],
            'Medical/Health': ['pain', 'ปวด', 'sick', 'เจ็บ', 'treatment', 'รักษา', 'doctor', 'หมอ']
        };

        let maxMatches = 0;
        for (const [category, keywords] of Object.entries(focusKeywords)) {
            const matches = keywords.filter(keyword => allText.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                focus = category;
            }
        }
        if (!focus) focus = 'General Inquiry';

        // Enhanced needs analysis
        let needs = '';
        const needsKeywords = {
            'Urgent Assistance': ['urgent', 'asap', 'ด่วน', 'emergency', 'now', 'immediately', 'quick'],
            'Information Request': ['information', 'info', 'detail', 'ข้อมูล', 'explain', 'tell me', 'what is'],
            'Technical Support': ['not working', 'error', 'problem', 'issue', 'fix', 'repair', 'แก้ไข'],
            'Consultation Needed': ['consult', 'advice', 'recommend', 'suggest', 'คำแนะนำ', 'ปรึกษา'],
            'Follow-up Required': ['follow up', 'status', 'update', 'when', 'progress', 'ติดตาม']
        };

        let maxNeedsMatches = 0;
        for (const [category, keywords] of Object.entries(needsKeywords)) {
            const matches = keywords.filter(keyword => allText.includes(keyword)).length;
            if (matches > maxNeedsMatches) {
                maxNeedsMatches = matches;
                needs = category;
            }
        }
        if (!needs) {
            if (allText.includes('help') || allText.includes('ช่วย')) {
                needs = 'General Support';
            } else {
                needs = 'General Inquiry';
            }
        }

        // Enhanced question detection - find the most recent meaningful question
        let recentQuestion = 'No recent questions found';
        const questionIndicators = ['?', 'what', 'how', 'when', 'where', 'why', 'which', 'who', 'can you', 'could you', 'is it', 'do you', 'does', 'will', 'would', 'should', 'มั้ย', 'ไหม', 'ไหน', 'อะไร', 'ทำไม', 'ยังไง', 'เมื่อไหร่', 'ที่ไหน', 'ใคร', 'อันไหน'];

        // More strict question validation
        const isLikelyQuestion = (text) => {
            const lowerText = text.toLowerCase().trim();

            // Must have question mark OR start with question word
            const hasQuestionMark = lowerText.includes('?');
            const startsWithQuestionWord = ['what', 'how', 'when', 'where', 'why', 'which', 'who', 'can you', 'could you', 'do you', 'does', 'will you', 'would you', 'should', 'is it', 'อะไร', 'ยังไง', 'ทำไม', 'เมื่อไหร่', 'ที่ไหน', 'ใคร', 'อันไหน'].some(word =>
                lowerText.startsWith(word)
            );

            // Check for Thai question particles at the end
            const hasThaiQuestionParticle = lowerText.endsWith('ไหม') || lowerText.endsWith('มั้ย') || lowerText.endsWith('หรือ') || lowerText.endsWith('เหรอ');

            // Exclude obvious non-questions (URLs, emails, statements)
            const isUrl = /https?:\/\/|www\.|\.com|\.net|\.org|\.co/.test(lowerText);
            const isEmail = /@/.test(lowerText);
            const isPhone = /\d{3}[\s-]?\d{3}[\s-]?\d{4}/.test(text);
            const isStatement = /^(website|email|phone|line|facebook|ig|instagram)[\s:]/i.test(lowerText);

            if (isUrl || isEmail || isPhone || isStatement) {
                return false;
            }

            return hasQuestionMark || startsWithQuestionWord || hasThaiQuestionParticle;
        };

        for (let i = recentMessages.length - 1; i >= 0; i--) {
            const msgText = String(recentMessages[i].text || '').trim();
            if (msgText.length > 5) { // Ignore very short messages
                if (isLikelyQuestion(msgText)) {
                    recentQuestion = msgText.length > 100 ? msgText.substring(0, 100) + '...' : msgText;
                    break;
                }
            }
        }

        // REMOVED: No fallback to non-question messages
        // Keep showing "No recent questions found" if no actual questions are detected

        console.log('Analysis results:', { focus, needs, question: recentQuestion });

        // Update the fields with analyzed data
        updateSummaryFields({
            focus: focus,
            needs: needs,
            question: recentQuestion
        });

    } catch (error) {
        console.error('Error in AI analysis:', error);
        updateSummaryFields({
            focus: 'Analysis Error: ' + error.message,
            needs: 'Analysis Error: ' + error.message,
            question: 'Analysis Error: ' + error.message
        });
    }
}

// Helper function to update summary fields
function updateSummaryFields(data) {
    const focusArea = document.querySelector('.field-input.focus-area');
    const needsArea = document.querySelector('.field-input.needs-area');
    const questionsArea = document.querySelector('.field-input.questions-area');

    if (focusArea) {
        focusArea.value = data.focus;
        focusArea.style.backgroundColor = '#e8f5e8'; // Light green to indicate completion
    }
    if (needsArea) {
        needsArea.value = data.needs;
        needsArea.style.backgroundColor = '#e8f5e8';
    }
    if (questionsArea) {
        questionsArea.value = data.question;
        questionsArea.style.backgroundColor = '#e8f5e8';
        // Auto-resize textarea to fit content
        questionsArea.style.height = 'auto';
        questionsArea.style.height = questionsArea.scrollHeight + 'px';
    }
}

// Modify the conversation click handler to clear data
document.addEventListener('DOMContentLoaded', () => {
    const conversationList = document.querySelector('.conversation-list');
    if (conversationList) {
        conversationList.addEventListener('click', async (e) => {
            const conversationItem = e.target.closest('.conversation-item');
            if (conversationItem) {
                const lineUuid = conversationItem.getAttribute('data-id');
                if (lineUuid) {
                    // Clear previous customer data
                    clearCustomerData();

                    // Update information panel if it's active
                    const infoPanel = document.getElementById('information-panel');
                    if (infoPanel && infoPanel.classList.contains('active')) {
                        // Show loading state
                        infoPanel.innerHTML = `
                            <div class="loading-state">
                                <div class="loading-spinner"></div>
                                <p>Analyzing conversation...</p>
                            </div>
                        `;

                        // Wait a moment before updating to ensure data is cleared
                        setTimeout(() => {
                            updateInformationPanel(lineUuid);
                        }, 100);
                    }
                }
            }
        });
    }
});

function showTranslationTool() {
    const overlay = document.createElement('div');
    overlay.className = 'translation-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const dialog = document.createElement('div');
    dialog.className = 'translation-dialog';
    dialog.style.width = '500px';
    dialog.style.maxWidth = '90%';
    dialog.style.backgroundColor = '#fff';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    dialog.style.padding = '0';

    dialog.innerHTML = `
<div class="translation-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee;">
    <h3 style="margin: 0; color: #333; font-size: 16px; display: flex; align-items: center; gap: 8px;"><i class="fas fa-language"></i> AI Translation Tool</h3>
    <button class="close-translation" style="background: none; border: none; color: #666; font-size: 24px; cursor: pointer; padding: 4px;">&times;</button>
</div>
<div style="padding: 20px;">
    <div class="language-selection" style="margin-bottom: 16px;">
        <label class="language-label" style="display: block; font-size: 14px; margin-bottom: 8px; color: #333; font-weight: 500;">Source Language:</label>
        <select id="source-language" class="language-select">
            <option value="en" selected>English</option>
            <option value="th">Thai</option>
            <option value="zh-cn">Chinese (Simplified)</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="vi">Vietnamese</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ru">Russian</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="pt">Portuguese</option>
            <option value="it">Italian</option>
        </select>
        <div class="text-container" style="position: relative; margin-bottom: 12px;">
            <textarea id="source-text" class="translation-textarea source-textarea" placeholder="Enter text to translate..." style="width: 100%; height: 120px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; resize: vertical; font-family: Arial, sans-serif; font-size: 14px;"></textarea>
            <div id="char-counter" class="char-counter" style="position: absolute; bottom: 8px; right: 12px; font-size: 12px; color: #888;">0 characters</div>
        </div>
    </div>

    <div class="swap-languages-container" style="text-align: center; margin: 16px 0;">
        <button id="swap-languages" class="swap-languages" style="width: 40px; height: 40px; border-radius: 50%; background-color: #4285f4; color: white; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
            <i class="fas fa-exchange-alt"></i>
        </button>
    </div>

    <div class="language-selection" style="margin-bottom: 16px;">
        <label class="language-label" style="display: block; font-size: 14px; margin-bottom: 8px; color: #333; font-weight: 500;">Target Language:</label>
        <select id="target-language" class="language-select">
            <option value="th" selected>Thai</option>
            <option value="en">English</option>
            <option value="zh-cn">Chinese (Simplified)</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="vi">Vietnamese</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ru">Russian</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="pt">Portuguese</option>
            <option value="it">Italian</option>
        </select>
        <div class="text-container" style="position: relative; margin-bottom: 16px;">
            <textarea id="target-text" class="translation-textarea target-textarea" placeholder="Translation will appear here..." readonly style="width: 100%; height: 120px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; resize: vertical; font-family: Arial, sans-serif; font-size: 14px; background-color: #f8f9fa;"></textarea>
        </div>
    </div>

    <div class="translation-controls" style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #eee;">
        <div class="auto-translate-control" style="display: flex; align-items: center;">
            <input type="checkbox" id="auto-translate" class="auto-translate-checkbox" checked style="margin-right: 8px;">
            <label for="auto-translate" class="auto-translate-label" style="font-size: 14px; color: #333; cursor: pointer;">Auto-translate</label>
        </div>
        <div class="translation-actions" style="display: flex; gap: 8px;">
            <button id="copy-translation" class="action-button copy-button" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background-color: #fff; color: #333; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-copy"></i> Copy
            </button>
            <button id="translate-button" class="action-button translate-button" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #4285f4; color: white; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-language"></i> Translate
            </button>
        </div>
    </div>
</div>
`;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Force show both language selectors
    setTimeout(() => {
        const sourceSelect = document.getElementById('source-language');
        const targetSelect = document.getElementById('target-language');

        [sourceSelect, targetSelect].forEach(select => {
            if (select) {
                select.style.display = 'block';
                select.style.visibility = 'visible';
                select.style.opacity = '1';
                select.style.position = 'relative';
                select.style.zIndex = '10';

                // Force redraw
                select.style.display = 'none';
                select.offsetHeight; // Trigger reflow
                select.style.display = 'block';
            }
        });
    }, 100);

    let translateTimeout = null;
    const TRANSLATE_DELAY = 500;
    let lastTranslatedText = '';

    const sourceText = document.getElementById('source-text');
    const charCounter = document.getElementById('char-counter');

    sourceText.addEventListener('input', () => {
        const count = sourceText.value.length;
        charCounter.textContent = `${count} character${count !== 1 ? 's' : ''}`;

        if (count > 1000) {
            charCounter.style.color = '#e74c3c';
        } else if (count > 800) {
            charCounter.style.color = '#f39c12';
        } else {
            charCounter.style.color = '#888';
        }

        if (document.getElementById('auto-translate').checked) {
            if (translateTimeout) {
                clearTimeout(translateTimeout);
            }

            if (sourceText.value.trim() !== lastTranslatedText) {
                translateTimeout = setTimeout(() => {
                    if (sourceText.value.trim() !== '') {
                        translateText();
                    }
                }, TRANSLATE_DELAY);
            }
        }
    });

    async function translateText() {
        const sourceText = document.getElementById('source-text').value;
        const sourceLanguage = document.getElementById('source-language').value;
        const targetLanguage = document.getElementById('target-language').value;

        if (sourceText.trim() === '') {
            return;
        }

        lastTranslatedText = sourceText.trim();

        const targetTextarea = document.getElementById('target-text');
        targetTextarea.value = 'Translating...';

        try {
            // Use Laravel API endpoint (bypasses CORS)
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    text: sourceText,
                    source: sourceLanguage,
                    target: targetLanguage
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.translatedText) {
                    targetTextarea.value = data.translatedText;

                    const charCounter = document.getElementById('char-counter');
                    if (charCounter) {
                        const lengthText = `${sourceText.length} character${sourceText.length !== 1 ? 's' : ''}`;
                        charCounter.textContent = lengthText;
                    }
                    return;
                }
            }

            throw new Error('Translation service unavailable');
        } catch (error) {
            console.error('Translation error:', error);

            // Fallback to Google Translate via proxy
            try {
                const fallbackResponse = await fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({
                        text: sourceText,
                        source: sourceLanguage,
                        target: targetLanguage
                    })
                });

                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.success && fallbackData.translatedText) {
                        targetTextarea.value = fallbackData.translatedText;
                        return;
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback translation error:', fallbackError);
            }

            // Final fallback with MyMemory API
            try {
                const normalizeLanguageCode = (langCode, fallback = 'EN') => {
                    if (!langCode) return fallback;
                    const trimmed = langCode.trim();
                    return trimmed
                        .split('-')
                        .map((segment, index) => index === 0 ? segment.toUpperCase() : segment.toLowerCase())
                        .join('-');
                };

                const normalizedSource = normalizeLanguageCode(sourceLanguage, 'EN');
                const normalizedTarget = normalizeLanguageCode(targetLanguage, 'EN');

                const finalFallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${normalizedSource}|${normalizedTarget}`;

                const finalResponse = await fetch(finalFallbackUrl);
                const finalData = await finalResponse.json();

                if (finalData && finalData.responseData && finalData.responseData.translatedText) {
                    targetTextarea.value = finalData.responseData.translatedText;
                } else {
                    targetTextarea.value = 'Translation failed. Please check your internet connection and try again.';
                }
            } catch (finalError) {
                console.error('Final fallback error:', finalError);
                targetTextarea.value = 'Translation service unavailable. Please try again later.';
            }
        }
    }

    document.getElementById('source-language').addEventListener('change', () => {
        if (document.getElementById('auto-translate').checked) {
            translateText();
        }
    });

    document.getElementById('target-language').addEventListener('change', () => {
        if (document.getElementById('auto-translate').checked) {
            translateText();
        }
    });

    function closeDialog() {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }

    document.querySelector('.close-translation').addEventListener('click', closeDialog);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDialog();
        }
    });

    dialog.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.getElementById('translate-button').addEventListener('click', translateText);

    const copyButton = document.getElementById('copy-translation');
    if (copyButton && !copyButton.dataset.defaultLabel) {
        copyButton.dataset.defaultLabel = copyButton.innerHTML;
    }

    copyButton?.addEventListener('click', () => {
        const targetText = document.getElementById('target-text');
        if (targetText) {
            targetText.select();
            document.execCommand('copy');
        }

        if (!copyButton) {
            return;
        }

        copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyButton.innerHTML = copyButton.dataset.defaultLabel || '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });

    document.getElementById('swap-languages').addEventListener('click', () => {
        const sourceSelect = document.getElementById('source-language');
        const targetSelect = document.getElementById('target-language');
        const sourceText = document.getElementById('source-text');
        const targetText = document.getElementById('target-text');

        const tempLang = sourceSelect.value;
        sourceSelect.value = targetSelect.value;
        targetSelect.value = tempLang;

        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;

        const count = sourceText.value.length;
        charCounter.textContent = `${count} character${count !== 1 ? 's' : ''}`;

        if (document.getElementById('auto-translate').checked && sourceText.value.trim() !== '') {
            translateText();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeDialog();
            document.removeEventListener('keydown', escapeHandler);
        }
    });

    sourceText.focus();
}

/**
 * Scheduling Assistant Calendar Tool
 * This script implements a calendar tool using FullCalendar library
 */

function showCalendarTool() {
    // Check if the calendar overlay already exists
    const existingOverlay = document.querySelector('.calendar-overlay');
    if (existingOverlay) {
        // อัปเดตทุก property ที่จำเป็นต้องใช้
        existingOverlay.style.display = 'flex';
        existingOverlay.style.justifyContent = 'center';
        existingOverlay.style.alignItems = 'center';
        // รีเฟรชปฏิทินเพื่อให้มั่นใจว่าทุกอย่างทำงานได้อย่างถูกต้อง
        refreshCalendar();
        return;
    }

    // Create the calendar overlay structure based on the provided HTML
    const calendarOverlay = document.createElement('div');
    calendarOverlay.className = 'calendar-overlay';

    // กำหนด styles ทั้งหมดที่จำเป็นโดยตรง
    calendarOverlay.style.position = 'fixed';
    calendarOverlay.style.top = '0';
    calendarOverlay.style.left = '0';
    calendarOverlay.style.right = '0';
    calendarOverlay.style.bottom = '0';
    calendarOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    calendarOverlay.style.zIndex = '1000';
    calendarOverlay.style.display = 'flex';
    calendarOverlay.style.justifyContent = 'center';
    calendarOverlay.style.alignItems = 'center';

    calendarOverlay.innerHTML = `
      <div class="calendar-popup">
        <div class="calendar-header">
          <h3>
            <i class="fi fi-tr-calendar-clock"></i>
            Scheduling Assistant
          </h3>
          <button class="close-calendar">
            <i class="fi fi-br-cross"></i>
          </button>
        </div>
        <div class="calendar-content">
          <div id="calendar-main-section">
            <div class="calendar-tabs">
              <button class="calendar-tab active" data-tab="local">Local Calendar</button>
              <button class="calendar-tab" data-tab="google">Google Calendar</button>
            </div>
  
            <div class="calendar-tab-content active" id="local-tab" style="display: block;">
              <div class="calendar-info-message">
                <i class="fas fa-info-circle"></i>
                This is a local calendar that stores events in your browser. Events won't sync with other devices.
              </div>
              <div id="calendar-container">
                <div id="close-btn">&times;</div>
                <div class="main-container">
                  <div id="external-events">
                    <p><strong>กิจกรรมที่สามารถลาก</strong></p>
                    <div class="external-event">ประชุม</div>
                    <div class="external-event">อบรม</div>
                    <div class="external-event">สัมมนา</div>
                    <div class="external-event">วันหยุด</div>
                    <div class="external-event">งานสำคัญ</div>
                    <p>
                      <input type="checkbox" id="drop-remove" checked>
                      <label for="drop-remove">ลบหลังจากใช้</label>
                    </p>
                  </div>
                  <div class="calendar-side">
                    <div id="calendar"></div>
                  </div>
                </div>
              </div>
              <div id="event-form-container">
                <div class="event-header">
                  <h3>Create Event</h3>
                  <button type="button" id="cancel-event">
                    <i class="fi fi-br-cross"></i>
                  </button>
                </div>
                <form id="event-form">
                  <div class="form-group">
                    <label for="event-title">Event Title</label>
                    <input type="text" id="event-title" required placeholder="Meeting with customer">
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-start-date">Start Date</label>
                      <input type="date" id="event-start-date" required>
                    </div>
                    <div class="form-group">
                      <label for="event-start-time">Start Time</label>
                      <input type="time" id="event-start-time" required>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="event-end-date">End Date</label>
                      <input type="date" id="event-end-date" required>
                    </div>
                    <div class="form-group">
                      <label for="event-end-time">End Time</label>
                      <input type="time" id="event-end-time" required>
                    </div>
                  </div>

                  <div class="form-group all-day-group">
                    <label class="all-day-toggle">
                      <input type="checkbox" id="event-all-day">
                      <span>All-day event</span>
                    </label>
                  </div>

                  <div class="form-group">
                    <label for="event-color">Color</label>
                    <input type="color" id="event-color" name="event-color" value="#3788d8" list="presetColors">
                    <datalist id="presetColors">
                      <option value="#3788d8" label="Blue"></option>
                      <option value="#ff0000" label="Red"></option>
                      <option value="#00cc00" label="Green"></option>
                      <option value="#ff9900" label="Orange"></option>
                      <option value="#9966ff" label="Purple"></option>
                    </datalist>
                  </div>

                  <div class="form-group">
                    <label for="event-description">Description</label>
                    <textarea id="event-description" placeholder="Add notes for this event..."></textarea>
                  </div>

                  <div class="form-group">
                    <label for="event-attendees">Attendees</label>
                    <input type="text" id="event-attendees" placeholder="Email addresses, separated by commas">
                  </div>

                  <div class="form-buttons">
                    <button type="button" id="delete-event" class="delete-button">Delete</button>
                    <button type="button" id="save-event">Save</button>
                  </div>
                  <input type="hidden" id="event-id">
                </form>
              </div>
            </div>
            <div class="calendar-tab-content" id="google-tab" style="display: none;">
              <!-- Google Calendar content will be dynamically loaded -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(calendarOverlay);
    // Setup event listeners for UI elements
    setupEventListeners();

    // Initialize the calendar
    initializeCalendar();

    // Initialize draggable external events
    initializeDraggableEvents();

    // Hide the event form initially
    document.getElementById('event-form-container').style.display = 'none';

    // Add some styles for the delete button
    const style = document.createElement('style');
    style.textContent = `
      .delete-button {
        background-color: #ff3b30;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      .delete-button:hover {
        background-color: #d63025;
      }
    `;
    document.head.appendChild(style);
}

/**
 * Setup event listeners for various UI elements
 */
function setupEventListeners() {
    // Close button listener
    document.querySelector('.close-calendar').addEventListener('click', hideCalendarTool);
    document.getElementById('close-btn').addEventListener('click', hideCalendarTool);

    // Tab switching listeners
    const tabs = document.querySelectorAll('.calendar-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Event form buttons
    document.getElementById('cancel-event').addEventListener('click', hideEventForm);
    document.getElementById('save-event').addEventListener('click', saveEventForm);
    document.getElementById('delete-event').addEventListener('click', function () {
        const eventId = document.getElementById('event-id').value;
        if (eventId) {
            deleteEvent(eventId);
        } else {
            hideEventForm();
        }
    });

    // All day checkbox
    document.getElementById('event-all-day').addEventListener('change', function () {
        const timeInputs = document.querySelectorAll('#event-start-time, #event-end-time');
        timeInputs.forEach(input => {
            input.disabled = this.checked;
        });
    });
}

/**
 * Hide calendar tool
 */
function hideCalendarTool() {
    const calendarOverlay = document.querySelector('.calendar-overlay');
    if (calendarOverlay) {
        calendarOverlay.style.display = 'none';
    }
}

function switchTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.calendar-tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update tab content
    const tabContents = document.querySelectorAll('.calendar-tab-content');
    tabContents.forEach(content => {
        if (content.id === tabName + '-tab') {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });

    // If Google tab is selected, we might need to initialize Google Calendar
    if (tabName === 'google') {
        renderGoogleCalendarPanel();
    }
}

let googleApiClientPromise = null;

function loadGoogleApiClient() {
    if (window.gapi) {
        return Promise.resolve(window.gapi);
    }

    if (!googleApiClientPromise) {
        googleApiClientPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.gapi));
                existingScript.addEventListener('error', () => reject(new Error('Failed to load Google API client')));
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(window.gapi);
            script.onerror = () => reject(new Error('Failed to load Google API client'));
            document.head.appendChild(script);
        });
    }

    return googleApiClientPromise;
}

function initializeGoogleCalendarAuthUI() {
    const authorizeButton = document.getElementById('authorize-button');
    if (!authorizeButton || authorizeButton.dataset.bound === 'true') {
        return;
    }

    authorizeButton.dataset.bound = 'true';
    authorizeButton.addEventListener('click', handleGoogleAuthorizeClick);
}

function renderGoogleCalendarPanel() {
    const container = document.getElementById('google-tab');
    if (!container) {
        return;
    }

    const status = getGoogleCalendarStatusFromUrl();

    if (status === 'connected') {
        container.innerHTML = getGoogleCalendarLoadingMarkup();
        fetchGoogleCalendarEvents();
    } else {
        container.innerHTML = getGoogleCalendarConnectMarkup();
        initializeGoogleCalendarAuthUI();
    }
}

function getGoogleCalendarConnectMarkup() {
    return `
      <div id="calendar-auth-section">
        <div class="google-calendar-info">
          <img src="https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png" alt="Google Calendar" class="google-calendar-icon">
          <h3>Connect with Google Calendar</h3>
          <p>Sync your events with Google Calendar to:</p>
          <ul>
            <li><i class="fas fa-sync"></i> Keep events synchronized across devices</li>
            <li><i class="fas fa-share-alt"></i> Share events with team members</li>
            <li><i class="fas fa-bell"></i> Get notifications and reminders</li>
            <li><i class="fas fa-video"></i> Add Google Meet video calls automatically</li>
          </ul>
        </div>
        <button id="authorize-button" class="google-auth-button">
          <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" class="google-icon">
          Sign in with Google
        </button>
        <p class="google-calendar-note">
          <i class="fas fa-info-circle"></i>
          Your calendar data will be securely synchronized
        </p>
      </div>
    `;
}

function getGoogleCalendarLoadingMarkup() {
    return `
      <div class="google-calendar-loading">
        <div class="loading-spinner"></div>
        <p>Loading upcoming events from Google Calendar…</p>
      </div>
    `;
}

function getGoogleCalendarErrorMarkup(message) {
    return `
      <div class="google-calendar-error">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button class="google-auth-button retry-google-auth">Try reconnecting</button>
      </div>
    `;
}

function getGoogleCalendarEventsMarkup(events) {
    const groupedByDay = groupEventsByDay(events);

    const daySections = groupedByDay.map(({ date, key, events: dayEvents }) => {
        const { dayName, dateLabel } = formatDayHeader(date, key);
        const eventItems = dayEvents.map(renderGoogleCalendarEvent).join('');

        return `
        <div class="google-calendar-day">
          <div class="day-header">
            <span class="day-name">${escapeHtml(dayName)}</span>
            <span class="day-date">${escapeHtml(dateLabel)}</span>
          </div>
          <div class="events-list">${eventItems}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="google-calendar-events">
        <div class="events-header">
          <div>
            <h3>Upcoming Google Calendar events</h3>
            <p>Your account is connected. Events refresh every few minutes.</p>
          </div>
          <button class="google-auth-button disconnect-google-auth">Disconnect</button>
        </div>
        <div class="events-days">${daySections}</div>
      </div>
    `;
}

function renderGoogleCalendarEvent(event) {
    const startDate = extractDateParts(event.start);
    const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);
    const timeRange = buildTimeRangeLabel(event.start, event.end, isAllDay);
    const location = event.location;
    const hangoutLink = event.hangoutLink;
    const statusLabel = isAllDay ? 'All day' : (event.status === 'confirmed' ? 'Confirmed' : event.status || 'Scheduled');
    const statusClass = isAllDay ? 'event-status all-day' : 'event-status';

    return `
      <div class="google-calendar-event">
        <div class="event-date">
          <span class="month">${startDate.month}</span>
          <span class="day-number">${startDate.day}</span>
        </div>
        <div class="event-meta">
          <div class="event-summary">${escapeHtml(event.summary || 'Untitled event')}</div>
          <div class="event-time">
            <i class="fas ${isAllDay ? 'fa-sun' : 'fa-clock'}"></i>
            <span>${timeRange}</span>
          </div>
          ${location ? `
            <div class="event-location">
              <i class="fas fa-link"></i>
              <span>${escapeHtml(location)}</span>
            </div>
          ` : ''}
          ${hangoutLink ? `
            <div class="event-link">
              <i class="fas fa-link"></i>
              <a href="${escapeAttribute(hangoutLink)}" target="_blank" rel="noopener noreferrer">Join</a>
              <span class="event-link-url">${escapeHtml(hangoutLink)}</span>
            </div>
          ` : ''}
          ${event.description ? `
            <div class="event-duration">
              <i class="fas fa-align-left"></i>
              <span>${escapeHtml(truncateText(event.description, 120))}</span>
            </div>
          ` : ''}
        </div>
        <div class="${statusClass}">
          ${statusLabel}
        </div>
      </div>
    `;
}

function extractDateParts(dateObj) {
    const dateValue = dateObj?.dateTime || dateObj?.date;
    if (!dateValue) {
        return { month: '—', day: '--' };
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return { month: '—', day: '--' };
    }

    return {
        month: date.toLocaleString(undefined, { month: 'short' }),
        day: date.getDate()
    };
}

function groupEventsByDay(events) {
    const groups = new Map();

    events.forEach(event => {
        const key = getEventDateKey(event.start);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(event);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([key, dayEvents]) => {
        const date = parseEventDateKey(key);
        const sortedDayEvents = dayEvents.sort((eventA, eventB) => {
            const aStart = new Date(eventA.start?.dateTime || eventA.start?.date || 0).getTime();
            const bStart = new Date(eventB.start?.dateTime || eventB.start?.date || 0).getTime();
            return aStart - bStart;
        });

        return {
            key,
            date,
            events: sortedDayEvents
        };
    });
}

function getEventDateKey(startObj) {
    const value = startObj?.dateTime || startObj?.date;
    if (!value) {
        return 'unknown';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'unknown';
    }

    return date.toISOString().split('T')[0];
}

function parseEventDateKey(key) {
    if (!key || key === 'unknown') {
        return null;
    }

    const date = new Date(key);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function formatDayHeader(date, key) {
    if (!date) {
        return {
            dayName: 'Unknown date',
            dateLabel: key || ''
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = date.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

    let dayName;
    if (diffDays === 0) {
        dayName = 'Today';
    } else if (diffDays === 1) {
        dayName = 'Tomorrow';
    } else {
        dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
    }

    const dateLabel = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return { dayName, dateLabel };
}

function buildTimeRangeLabel(startObj, endObj, isAllDay) {
    const startValue = startObj?.dateTime || startObj?.date;
    const endValue = endObj?.dateTime || endObj?.date;

    if (!startValue) {
        return 'No start time';
    }

    const startDate = new Date(startValue);
    if (Number.isNaN(startDate.getTime())) {
        return startValue;
    }

    if (isAllDay) {
        if (endValue) {
            const endDate = new Date(endValue);
            if (!Number.isNaN(endDate.getTime())) {
                endDate.setDate(endDate.getDate() - 1);
                return `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
            }
        }

        return startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }

    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const startTime = startDate.toLocaleTimeString(undefined, timeOptions);

    if (!endValue) {
        return `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${startTime}`;
    }

    const endDate = new Date(endValue);
    if (Number.isNaN(endDate.getTime())) {
        return `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${startTime}`;
    }

    const sameDay = startDate.toDateString() === endDate.toDateString();
    const endTime = endDate.toLocaleTimeString(undefined, timeOptions);

    if (sameDay) {
        return `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${startTime} – ${endTime}`;
    }

    return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${startTime} – ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${endTime}`;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + '…';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

function escapeAttribute(text) {
    return String(text || '').replace(/"/g, '&quot;');
}

function bindGoogleCalendarActions() {
    const container = document.getElementById('google-tab');
    if (!container) {
        return;
    }

    const reconnectButton = container.querySelector('.retry-google-auth');
    if (reconnectButton && reconnectButton.dataset.bound !== 'true') {
        reconnectButton.dataset.bound = 'true';
        reconnectButton.addEventListener('click', () => {
            container.innerHTML = getGoogleCalendarLoadingMarkup();
            initializeGoogleCalendarAuthUI();
            handleGoogleAuthorizeClick({
                preventDefault: () => { },
                currentTarget: reconnectButton
            });
        });
    }

    const disconnectButton = container.querySelector('.disconnect-google-auth');
    if (disconnectButton && disconnectButton.dataset.bound !== 'true') {
        disconnectButton.dataset.bound = 'true';
        disconnectButton.addEventListener('click', async () => {
            try {
                await fetch('/calendar/disconnect', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    }
                });

                removeGoogleStatusFromUrl();
                showNotification('success', 'Disconnected from Google Calendar.');
                renderGoogleCalendarPanel();
            } catch (error) {
                console.error('Google calendar disconnect error:', error);
                showNotification('error', 'Unable to disconnect from Google Calendar.');
            }
        });
    }
}

async function fetchGoogleCalendarEvents() {
    const container = document.getElementById('google-tab');
    if (!container) {
        return;
    }

    try {
        const response = await fetch('/calendar/events', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const message = errorBody.error || 'Unable to fetch Google Calendar events.';
            throw new Error(message);
        }

        const data = await response.json();
        const events = data?.events || [];

        if (!events.length) {
            container.innerHTML = `
          <div class="google-calendar-events empty">
            <div class="events-header">
              <div>
                <h3>Google Calendar connected</h3>
                <p>No upcoming events found.</p>
              </div>
              <button class="google-auth-button disconnect-google-auth">Disconnect</button>
            </div>
            <div class="empty-state">
              <i class="fas fa-calendar"></i>
              <p>Create events in Google Calendar to see them here.</p>
            </div>
          </div>
        `;
        } else {
            container.innerHTML = getGoogleCalendarEventsMarkup(events);
        }

        bindGoogleCalendarActions();
    } catch (error) {
        console.error('Google calendar events error:', error);
        container.innerHTML = getGoogleCalendarErrorMarkup(error.message);
        bindGoogleCalendarActions();
    }
}

function getGoogleCalendarStatusFromUrl() {
    try {
        const url = new URL(window.location.href);
        return url.searchParams.get('google_calendar');
    } catch (error) {
        return null;
    }
}

function removeGoogleStatusFromUrl() {
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('google_calendar')) {
            url.searchParams.delete('google_calendar');
            window.history.replaceState({}, '', url.toString());
        }
    } catch (error) {
        // Ignore URL parsing errors
    }
}

async function handleGoogleAuthorizeClick(event) {
    event.preventDefault();

    const button = event.currentTarget;
    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = '<span class="authorize-loading">Connecting…</span>';

    try {
        await loadGoogleApiClient();

        const currentPath = window.location.pathname + window.location.search;
        const response = await fetch(`/calendar/connect?redirect=${encodeURIComponent(currentPath)}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const message = errorBody.error || 'Unable to start Google authentication.';
            throw new Error(message);
        }

        const data = await response.json();
        if (!data?.url) {
            throw new Error('Google authentication URL was not returned.');
        }

        window.location.href = data.url;
    } catch (error) {
        console.error('Google authorize error:', error);
        showNotification('error', error.message || 'Unable to initiate Google authentication.');
    } finally {
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = originalHtml;
    }
}
/**
 * Initialize FullCalendar
 */
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true,
        droppable: true, // Allow external event dropping
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        validRange: {
            start: formatDate(new Date())
        },
        locale: 'th', // Thai locale for Thai language support
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        // Load events from local storage
        events: getEventsFromStorage(),
        selectAllow: function (selectionInfo) {
            return getStartOfDay(selectionInfo.start) >= getStartOfDay(new Date());
        },
        eventAllow: function (dropInfo) {
            return getStartOfDay(dropInfo.start) >= getStartOfDay(new Date());
        },

        // Calendar callbacks
        select: function (info) {
            showEventForm(info);
        },
        eventClick: function (info) {
            editEvent(info.event);
        },
        eventDrop: function (info) {
            updateEvent(info.event);
        },
        eventResize: function (info) {
            updateEvent(info.event);
        },
        drop: function (info) {
            if (getStartOfDay(info.date) < getStartOfDay(new Date())) {
                showNotification('error', 'Cannot schedule events in the past.');
                return;
            }
            // Create a new event when an external item is dropped
            const newEvent = {
                id: generateUniqueId(),
                title: info.draggedEl.textContent,
                start: info.date,
                allDay: info.allDay,
                backgroundColor: getRandomColor()
            };

            // Save to storage and add to calendar
            addEventToStorage(newEvent);

            // If drop-remove is checked, remove the dragged element
            if (document.getElementById('drop-remove').checked) {
                info.draggedEl.parentNode.removeChild(info.draggedEl);
            }
        }
    });

    calendar.render();

    // Store calendar instance for later reference
    calendarEl._calendar = calendar;
}

/**
 * Initialize draggable external events
 */
function initializeDraggableEvents() {
    const draggableItems = document.querySelectorAll('.external-event');

    draggableItems.forEach(eventEl => {
        new FullCalendar.Draggable(eventEl, {
            itemSelector: '.external-event',
            eventData: function (eventEl) {
                return {
                    title: eventEl.textContent,
                    create: true
                };
            }
        });

        // Add random background color to each draggable event
        eventEl.style.backgroundColor = getRandomColor();
        eventEl.style.color = 'white';
        eventEl.style.padding = '5px 10px';
        eventEl.style.margin = '5px 0';
        eventEl.style.borderRadius = '3px';
        eventEl.style.cursor = 'pointer';
    });
}

/**
 * Generate a random color for events
 */
function getRandomColor() {
    const colors = [
        '#3788d8', // Blue
        '#ff5722', // Deep Orange
        '#4caf50', // Green
        '#9c27b0', // Purple
        '#ff9800', // Orange
        '#e91e63', // Pink
        '#009688', // Teal
        '#795548'  // Brown
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Show event form for creating or editing an event
 */
function showEventForm(info = null, eventToEdit = null) {
    const formContainer = document.getElementById('event-form-container');
    const form = document.getElementById('event-form');
    const deleteButton = document.getElementById('delete-event');
    form.reset();
    document.getElementById('event-id').value = '';

    // Set form title depending on whether creating or editing
    const formTitle = formContainer.querySelector('h3');

    if (eventToEdit) {

        formTitle.textContent = 'Edit Event';

        // Show delete button for existing events
        deleteButton.style.display = 'inline-block';

        // Fill form with event data
        document.getElementById('event-title').value = eventToEdit.title;
        document.getElementById('event-id').value = eventToEdit.id;

        // Set dates and times
        const startDate = eventToEdit.start;
        document.getElementById('event-start-date').value = formatDate(startDate);

        // Only set time if it's not an all-day event
        if (!eventToEdit.allDay) {
            document.getElementById('event-start-time').value = formatTime(startDate);

            if (eventToEdit.end) {
                document.getElementById('event-end-date').value = formatDate(eventToEdit.end);
                document.getElementById('event-end-time').value = formatTime(eventToEdit.end);
            } else {
                // If no end time, set end date same as start and end time 1 hour later
                document.getElementById('event-end-date').value = formatDate(startDate);

                const endTime = new Date(startDate);
                endTime.setHours(endTime.getHours() + 1);
                document.getElementById('event-end-time').value = formatTime(endTime);
            }
        } else {
            // All-day event
            document.getElementById('event-all-day').checked = true;
            document.getElementById('event-start-time').disabled = true;
            document.getElementById('event-end-time').disabled = true;

            if (eventToEdit.end) {
                // For all-day events, the end date in FullCalendar is exclusive
                const endDate = new Date(eventToEdit.end);
                endDate.setDate(endDate.getDate() - 1);
                document.getElementById('event-end-date').value = formatDate(endDate);
            } else {
                document.getElementById('event-end-date').value = formatDate(startDate);
            }
        }

        // Set color
        if (eventToEdit.backgroundColor) {
            document.getElementById('event-color').value = eventToEdit.backgroundColor;
        }

        // Set location if available
        if (eventToEdit.extendedProps && eventToEdit.extendedProps.attendees) {
            document.getElementById('event-attendees').value = eventToEdit.extendedProps.attendees;
        }

        // Set description if available
        if (eventToEdit.extendedProps && eventToEdit.extendedProps.description) {
            document.getElementById('event-description').value = eventToEdit.extendedProps.description;
        }
    } else if (info) {
        // Creating new event based on selection
        formTitle.textContent = 'Create Event';

        // Hide delete button for new events
        deleteButton.style.display = 'none';

        // Set dates based on selection
        document.getElementById('event-start-date').value = formatDate(info.start);

        if (info.allDay) {
            document.getElementById('event-all-day').checked = true;
            document.getElementById('event-start-time').disabled = true;
            document.getElementById('event-end-time').disabled = true;

            // For all-day selection, end date is exclusive in FullCalendar
            const endDate = new Date(info.end);
            endDate.setDate(endDate.getDate() - 1);
            document.getElementById('event-end-date').value = formatDate(endDate);
        } else {
            document.getElementById('event-start-time').value = formatTime(info.start);
            document.getElementById('event-end-date').value = formatDate(info.end);
            document.getElementById('event-end-time').value = formatTime(info.end);
        }
    } else {
        // Just opening form without any data
        formTitle.textContent = 'Create Event';

        // Hide delete button for new events
        deleteButton.style.display = 'none';

        // Set default dates to today
        const today = new Date();
        document.getElementById('event-start-date').value = formatDate(today);
        document.getElementById('event-end-date').value = formatDate(today);

        // Set default times
        document.getElementById('event-start-time').value = formatTime(today);

        const endTime = new Date(today);
        endTime.setHours(endTime.getHours() + 1);
        document.getElementById('event-end-date').value = formatDate(today);
    }

    applyDateTimeConstraints({ isEditing: Boolean(eventToEdit) });

    // Display the form
    formContainer.style.display = 'block';
}

function applyDateTimeConstraints({ isEditing = false } = {}) {
    const startDateInput = document.getElementById('event-start-date');
    const endDateInput = document.getElementById('event-end-date');
    const startTimeInput = document.getElementById('event-start-time');
    const endTimeInput = document.getElementById('event-end-time');
    const allDayCheckbox = document.getElementById('event-all-day');
    if (!startDateInput || !endDateInput) {
        return;
    }

    const todayStr = formatDate(new Date());
    const todayStart = getStartOfDay(new Date());
    const nowTime = formatTime(new Date());

    if (!isEditing || !startDateInput.min) {
        startDateInput.min = todayStr;
        endDateInput.min = todayStr;
    }

    const updateTimeLimits = () => {
        if (!startTimeInput || !endTimeInput) {
            return;
        }

        if (allDayCheckbox?.checked) {
            startTimeInput.disabled = true;
            endTimeInput.disabled = true;
            return;
        }

        startTimeInput.disabled = false;
        endTimeInput.disabled = false;

        const startDateValue = startDateInput.value || todayStr;
        if (startDateValue === todayStr) {
            startTimeInput.min = nowTime;
            if (!startTimeInput.value || startTimeInput.value < nowTime) {
                startTimeInput.value = nowTime;
            }
        } else {
            startTimeInput.min = '00:00';
            if (startTimeInput.value && startTimeInput.value < startTimeInput.min) {
                startTimeInput.value = startTimeInput.min;
            }
        }

        if (endDateInput.value === startDateValue) {
            const minEndTime = startTimeInput.value || startTimeInput.min || nowTime;
            endTimeInput.min = minEndTime;
            if (endTimeInput.value && endTimeInput.value < minEndTime) {
                endTimeInput.value = minEndTime;
            }
        } else {
            endTimeInput.min = '00:00';
        }
    };

    const ensureNotPast = (input) => {
        if (!input.value) {
            return;
        }
        if (getStartOfDay(input.value) < todayStart) {
            input.value = todayStr;
        }
    };

    if (startDateInput.dataset.constraintsBound === 'true') {
        updateTimeLimits();
        return;
    }

    startDateInput.dataset.constraintsBound = 'true';

    startDateInput.addEventListener('change', () => {
        ensureNotPast(startDateInput);
        if (endDateInput.value && endDateInput.value < startDateInput.value) {
            endDateInput.value = startDateInput.value;
        }
        updateTimeLimits();
    });

    endDateInput.addEventListener('change', () => {
        ensureNotPast(endDateInput);
        if (endDateInput.value && endDateInput.value < (startDateInput.value || todayStr)) {
            endDateInput.value = startDateInput.value || todayStr;
        }
        updateTimeLimits();
    });

    if (startTimeInput) {
        startTimeInput.addEventListener('change', updateTimeLimits);
    }

    if (endTimeInput) {
        endTimeInput.addEventListener('change', () => {
            if (!startTimeInput) {
                return;
            }
            if ((endDateInput.value || todayStr) === (startDateInput.value || todayStr) && endTimeInput.value && endTimeInput.value < startTimeInput.value) {
                endTimeInput.value = startTimeInput.value;
            }
        });
    }

    if (allDayCheckbox) {
        allDayCheckbox.addEventListener('change', updateTimeLimits);
    }

    updateTimeLimits();
}

function getStartOfDay(value) {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return new Date(NaN);
    }
    date.setHours(0, 0, 0, 0);
    return date;
}

/**
 * Hide event form
 */
function hideEventForm() {
    document.getElementById('event-form-container').style.display = 'none';
}

/**
 * Save event from form data
 */
function saveEventForm() {
    const form = document.getElementById('event-form');
    const title = document.getElementById('event-title').value;

    if (!title) {
        alert('กรุณาใส่ชื่อกิจกรรม');
        return;
    }

    const startDate = document.getElementById('event-start-date').value;
    const startTime = document.getElementById('event-start-time').value;
    const endDate = document.getElementById('event-end-date').value;
    const endTime = document.getElementById('event-end-time').value;
    const allDay = document.getElementById('event-all-day').checked;
    const color = document.getElementById('event-color').value;
    const attendees = document.getElementById('event-attendees').value;
    const description = document.getElementById('event-description').value;
    const eventId = document.getElementById('event-id').value;

    if (!startDate || !endDate) {
        alert('กรุณาเลือกวันที่');
        return;
    }

    // Create start and end date objects
    let start, end;

    if (allDay) {
        // For all-day events
        start = new Date(startDate);
        end = new Date(endDate);
        // Add a day to end date since FullCalendar uses exclusive end dates for all-day events
        end.setDate(end.getDate() + 1);
        if (getStartOfDay(start) < getStartOfDay(new Date())) {
            alert('ไม่สามารถสร้างกิจกรรมย้อนหลังได้');
            return;
        }
    } else {
        // For timed events
        if (!startTime || !endTime) {
            alert('กรุณาเลือกเวลา');
            return;
        }

        start = new Date(`${startDate}T${startTime}`);
        end = new Date(`${endDate}T${endTime}`);
        if (start < new Date()) {
            alert('ไม่สามารถสร้างกิจกรรมย้อนหลังได้');
            return;
        }
    }

    // Check if end is after start
    if (end <= start) {
        alert('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
        return;
    }

    // Create event object
    const eventData = {
        id: eventId || generateUniqueId(),
        title: title,
        start: start,
        end: end,
        allDay: allDay,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
            attendees: attendees,
            description: description
        }
    };
    document.getElementById('event-id').value = '';

    // Save to storage
    if (eventId) {
        // Update existing event
        updateEventInStorage(eventData);
    } else {
        // Add new event
        addEventToStorage(eventData);
    }

    // Hide form
    hideEventForm();

    // Refresh calendar
    refreshCalendar();
}

/**
 * Edit existing event
 */
function editEvent(event) {
    showEventForm(null, event);
}

/**
 * Update event after drag or resize
 */
function updateEvent(event) {
    const eventData = {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        backgroundColor: event.backgroundColor,
        borderColor: event.backgroundColor,
        extendedProps: event.extendedProps
    };

    updateEventInStorage(eventData);
}

/**
 * Delete event
 */
function deleteEvent(eventId) {
    if (confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) {
        removeEventFromStorage(eventId);
        refreshCalendar();
        hideEventForm();
    }
}

/**
 * Refresh calendar with events from storage
 */
function refreshCalendar() {

    const calendarEl = document.getElementById('calendar');
    const calendar = calendarEl._calendar;

    // Remove all events
    calendar.getEvents().forEach(event => event.remove());

    // Add events from storage
    const events = getEventsFromStorage();
    events.forEach(event => {
        calendar.addEvent(event);
    });


}

/**
 * Add event to local storage
 */
function addEventToStorage(eventData) {
    const events = getEventsFromStorage();
    events.push(eventData);
    localStorage.setItem('localCalendarEvents', JSON.stringify(events));
}

/**
 * Update event in local storage
 */
function updateEventInStorage(eventData) {
    const events = getEventsFromStorage();
    const index = events.findIndex(e => e.id === eventData.id);

    if (index !== -1) {
        events[index] = eventData;
        localStorage.setItem('localCalendarEvents', JSON.stringify(events));
    }
}

/**
 * Remove event from local storage
 */
function removeEventFromStorage(eventId) {
    const events = getEventsFromStorage();
    const filteredEvents = events.filter(e => e.id !== eventId);
    localStorage.setItem('localCalendarEvents', JSON.stringify(filteredEvents));
}

/**
 * Get events from local storage
 */
function getEventsFromStorage() {
    const eventsJson = localStorage.getItem('localCalendarEvents');

    if (!eventsJson) {
        return getSampleEvents();
    }

    try {
        const events = JSON.parse(eventsJson);

        // Convert string dates back to Date objects
        events.forEach(event => {
            if (typeof event.start === 'string') {
                event.start = new Date(event.start);
            }
            if (typeof event.end === 'string') {
                event.end = new Date(event.end);
            }
        });

        return events;
    } catch (e) {
        console.error('Error parsing calendar events from storage', e);
        return getSampleEvents();
    }
}

/**
 * Get sample events for initial display
 */
function getSampleEvents() {
    return [];
}

/**
 * Utility function to format date for input fields
 */
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(date) {
    const d = new Date(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}


/**
 * Generate a unique ID for events
 */
function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}


// Access control bootstrap
if (typeof window.initializeAccessControl !== 'function') {
    window.initializeAccessControl = function () {
        if (typeof window.userHasAccessToChat !== 'function') {
            window.userHasAccessToChat = function (lineUuid) {
                try {
                    if (window.assignmentManager && typeof window.assignmentManager.canSeeConversation === 'function') {
                        return window.assignmentManager.canSeeConversation(lineUuid);
                    }
                    const currentUser = (typeof window.getCurrentUser === 'function') ? window.getCurrentUser() : null;
                    if (!currentUser) return true;
                    if (currentUser.role === 'admin' || currentUser.user_type === 'admin') return true;
                    // Fallback: allow visibility to avoid blocking UI when no manager is available
                    return true;
                } catch (e) {
                    return true;
                }
            };
        }
    };
}

// Init function that can be called to show the calendar
document.addEventListener('DOMContentLoaded', function () {
    // Initialize access control
    initializeAccessControl();
    // You can call showCalendarTool() here to display calendar on page load
    // Or it can be triggered by a button click elsewhere
});
function renderTeamChatSection() {
    console.log("Rendering Team Chat Section");
    const teamPanel = document.getElementById('team-panel');
    if (!teamPanel) {
        console.error("Team panel element not found!");
        return;
    }

    // แสดง loading ก่อน
    teamPanel.innerHTML = `
        <div>
            <div class="team-members">
                <h3>Team Members</h3>
                <div class="team-member-list" id="team-member-list">
                    <div>Loading team members...</div>
                </div>
            </div>
        </div>
    `;

    // ดึงข้อมูล user จาก API
    fetch('/current-user')
        .then(response => response.json())
        .then(users => {
            const list = document.getElementById('team-member-list');
            if (!list) return;

            if (!users.length) {
                list.innerHTML = '<div>No team members found.</div>';
                return;
            }

            list.innerHTML = users.map(user => `
                <div class="team-member-item">
                    <img src="${user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : '/storage/' + user.profile_image) : '/images/default-user.png'}" alt="${user.name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;">
                    <div class="team-member-info">
                        <div class="team-member-name">${user.name}</div>
                        <div class="team-member-role">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                    </div>
                </div>
            `).join('');
        })
        .catch(err => {
            const list = document.getElementById('team-member-list');
            if (list) list.innerHTML = '<div style="color:red;">Failed to load team members.</div>';
            console.error('Error fetching users:', err);
        });
}

const teamMemberItems = document.querySelectorAll('.team-member-item');
teamMemberItems.forEach(item => {
    item.addEventListener('click', () => {
        const memberName = item.querySelector('.team-member-name').textContent;
        alert(`Starting internal chat with ${memberName}...`);
    });
});

const noteActionButtons = document.querySelectorAll('.note-actions button');
noteActionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = button.textContent.trim();
        const noteTitle = button.closest('.note-item').querySelector('.note-title').textContent;
        alert(`${action} note: "${noteTitle}"`);
    });
});

const noteItems = document.querySelectorAll('.note-item');
noteItems.forEach(item => {
    item.addEventListener('click', () => {
        const noteTitle = item.querySelector('.note-title').textContent;
        alert(`Opening detailed view for note: "${noteTitle}"`);
    });
});

const activityItems = document.querySelectorAll('.activity-item');
activityItems.forEach(item => {
    item.addEventListener('click', () => {
        const activityText = item.querySelector('.activity-text').textContent;
        alert(`View details of: ${activityText}`);
    });
});

// Add Font Awesome CSS if not already loaded
function addFontAwesomeCSS() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesomeCSS = document.createElement('link');
        fontAwesomeCSS.rel = 'stylesheet';
        fontAwesomeCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesomeCSS);
    }
}





// Firebase removed — no-op stubs kept for backwards compatibility
function loadFirebaseIfNeeded(callback) {
    if (typeof callback === 'function') callback();
}

function initializeFirebase() {
    // Firebase removed — using evante API
}








// Function to show notification
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '4px';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    notification.style.zIndex = '9999';
    notification.style.transform = 'translateY(-20px)';
    notification.style.opacity = '0';
    notification.style.transition = 'transform 0.3s, opacity 0.3s';

    if (type === 'success') {
        notification.style.backgroundColor = '#f6ffed';
        notification.style.border = '1px solid #b7eb8f';
        notification.style.color = '#52c41a';
    } else {
        notification.style.backgroundColor = '#fff2f0';
        notification.style.border = '1px solid #ffccc7';
        notification.style.color = '#ff4d4f';
    }

    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(-20px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// Add this function to extract customer info from chat
async function extractCustomerInfo(lineUuid) {
    console.log("Extracting info for:", lineUuid);

    // First, check if we have data from summarize
    const summaryData = JSON.parse(localStorage.getItem('customerSummary') || '{}');
    console.log("Existing summary data:", summaryData);

    // Get customer name from conversation list first (more reliable)
    let customerName = '';

    // Try to get name from conversation list first
    const conversationItem = document.querySelector(`.conversation-item[data-id="${lineUuid}"]`);
    if (conversationItem) {
        // Try different selectors for the name
        const nameSelectors = [
            '.customer-name',
            '.conversation-name',
            '.name',
            'h3',  // Some implementations might use h3 for names
            '.title' // Or a title class
        ];

        for (const selector of nameSelectors) {
            const nameElement = conversationItem.querySelector(selector);
            if (nameElement) {
                const possibleName = nameElement.textContent.trim();
                if (possibleName && possibleName !== '') {
                    customerName = possibleName;
                    console.log("Found name in conversation list:", customerName);
                    break;
                }
            }
        }
    }

    // If name not found in conversation list, try chat header
    if (!customerName) {
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            // Try the same selectors in the chat header
            const nameSelectors = [
                '.customer-name',
                '.conversation-name',
                '.name',
                'h3',
                '.title'
            ];

            for (const selector of nameSelectors) {
                const nameElement = chatHeader.querySelector(selector);
                if (nameElement) {
                    const possibleName = nameElement.textContent.trim();
                    if (possibleName && possibleName !== '') {
                        customerName = possibleName;
                        console.log("Found name in chat header:", customerName);
                        break;
                    }
                }
            }
        }
    }

    // If still no name, try to get it from the conversation preview text
    if (!customerName && conversationItem) {
        const previewText = conversationItem.textContent.trim();
        console.log("Trying to extract name from preview text:", previewText);
        customerName = previewText.split('\n')[0].trim(); // Usually the first line is the name
    }

    console.log("Final customer name found:", customerName);

    // Fetch conversation messages from evante API
    try {
        const apiResponse = await fetch(`/api/line-conversations?lineUuid=${encodeURIComponent(lineUuid)}`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!apiResponse.ok) throw new Error('API HTTP ' + apiResponse.status);
        const raw = await apiResponse.json();
        const arr = Array.isArray(raw) ? raw : (Array.isArray(raw && raw.data) ? raw.data : []);

        const messages = arr.map(msg => {
            const messageText = msg.userInput || msg.message || msg.aiResponse || '';
            if (!messageText) return null;
            if (!customerName && msg.displayName) {
                customerName = msg.displayName.trim();
                console.log("Found name in message data:", customerName);
            }
            return {
                text: messageText,
                timestamp: new Date(msg.date || msg.time || msg.timestamp || 0).getTime() || 0,
                source: 'api'
            };
        }).filter(Boolean);

        console.log(`Messages found: ${messages.length}`);

        // Sort messages by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);

        // Combine all text for analysis
        const allText = messages.map(m => m.text).join(' ');
        console.log("Combined text length:", allText.length);

        // Extract email addresses with multiple patterns
        const emailPatterns = [
            // Basic email pattern
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            // Email with keywords (English)
            /(?:email|mail|e-mail)[\s:]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
            // Email with keywords (Thai)
            /(?:อีเมล|อีเมลล์|เมล)[\s:]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
            // Email in text like "my email is xxx@yyy.com"
            /(?:my email is|email is|email:|e-mail:|mail:)[\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
            // Thai version "อีเมลของผมคือ xxx@yyy.com"
            /(?:อีเมลของ|อีเมลคือ|อีเมล คือ)[\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
        ];

        let emails = [];
        console.log("Searching for emails in text:", allText.substring(0, 500) + "...");

        emailPatterns.forEach((pattern, index) => {
            const matches = [...allText.matchAll(pattern)];
            console.log(`Email pattern ${index + 1} found ${matches.length} matches:`, matches.map(m => m[1] || m[0]));
            emails = [...emails, ...matches.map(match => match[1] || match[0])];
        });

        emails = [...new Set(emails)]; // Remove duplicates
        console.log("Final extracted emails:", emails);

        // Enhanced phone number patterns
        const phonePatterns = [
            // Thai mobile numbers (both with and without +66)
            /(?:^|\s|:|>)(\+66[689]\d{8})/g,
            /(?:^|\s|:|>)(0[689]\d{8})/g,
            // Numbers after specific keywords
            /(?:โทร|เบอร์|tel|phone|mobile|เบอร์โทร|เบอร์มือถือ|หมายเลข)[\s:]+([0-9+]{9,})/gi,
            // Formatted Thai numbers
            /(?:^|\s|:|>)(\d{3}[-.]?\d{3}[-.]?\d{4})/g
        ];

        let phones = [];
        phonePatterns.forEach(pattern => {
            const matches = [...allText.matchAll(pattern)];
            phones = [...phones, ...matches.map(match => {
                // Clean up the phone number
                let phone = (match[1] || match[0]).replace(/[-.]/g, '');
                // Convert +66 format to 0 format if needed
                if (phone.startsWith('+66')) {
                    phone = '0' + phone.slice(3);
                }
                return phone;
            })];
        });

        // Filter valid phone numbers
        phones = phones.filter(phone => {
            // Must start with 0
            if (!phone.startsWith('0')) return false;
            // Must be 10 digits for Thai numbers
            if (phone.length !== 10) return false;
            // Must start with valid Thai prefixes
            if (!['06', '08', '09'].includes(phone.substring(0, 2))) return false;
            return true;
        });

        phones = [...new Set(phones)]; // Remove duplicates
        console.log("Found phones:", phones);

        // If we still don't have a name, try one last time from the summary data
        if (!customerName && summaryData.name) {
            customerName = summaryData.name;
            console.log("Using name from summary data:", customerName);
        }

        // If we still don't have a name, use a default
        if (!customerName) {
            customerName = 'Unknown Customer';
            console.log("Using default name");
        }

        // Try to get email from UI input field
        let inputEmail = '';
        const emailInput = document.getElementById('customer-email');
        if (emailInput && emailInput.value.trim()) {
            inputEmail = emailInput.value.trim();
            console.log("Found email from input field:", inputEmail);
        }

        // Try to get email from customer API as fallback
        let apiEmail = '';
        try {
            const customerResponse = await fetch(`/api/customer/${lineUuid}`);
            if (customerResponse.ok) {
                const customerApiResponse = await customerResponse.json();
                console.log("Customer API response:", customerApiResponse);

                if (customerApiResponse.success && customerApiResponse.data && customerApiResponse.data.email) {
                    apiEmail = customerApiResponse.data.email;
                    console.log("Found email from API:", apiEmail);
                }
            } else {
                console.log("Customer API request failed with status:", customerResponse.status);
            }
        } catch (apiError) {
            console.log("Could not fetch customer data from API:", apiError.message);
        }

        // Combine data from all sources, preferring input field, then extracted data, then API data, then summary data
        const combinedData = {
            lineUuid,
            email: inputEmail || (emails.length > 0 ? emails[0] : (apiEmail || summaryData.email || '')),
            phone: phones.length > 0 ? phones[0] : (summaryData.phone || ''),
            name: customerName
        };

        console.log("Combined customer data:", combinedData);
        return combinedData;

    } catch (error) {
        console.error('Error extracting customer info:', error);
        // If error occurs, return existing summary data if available, with the found name
        if (summaryData.lineUuid === lineUuid) {
            return { ...summaryData, name: customerName || 'Unknown Customer' };
        }
        return { lineUuid, name: customerName || 'Unknown Customer' };
    }
}

// Add event listener for conversation changes
document.addEventListener('DOMContentLoaded', () => {
    const conversationList = document.querySelector('.conversation-list');
    if (conversationList) {
        conversationList.addEventListener('click', async (e) => {
            const conversationItem = e.target.closest('.conversation-item');
            if (conversationItem) {
                const lineUuid = conversationItem.getAttribute('data-id');
                if (lineUuid) {
                    // Clear previous customer data
                    clearCustomerData();

                    // Update information panel if it's active
                    const infoPanel = document.getElementById('information-panel');
                    if (infoPanel && infoPanel.classList.contains('active')) {
                        // Show loading state
                        infoPanel.innerHTML = `
                            <div class="loading-state">
                                <div class="loading-spinner"></div>
                                <p>Analyzing conversation...</p>
                            </div>
                        `;

                        // Wait a moment before updating to ensure data is cleared
                        setTimeout(() => {
                            updateInformationPanel(lineUuid);
                        }, 100);
                    }
                }
            }
        });
    }
});

function ensureTagModalStyles() {
    if (document.getElementById('tag-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'tag-modal-styles';
    style.textContent = `
        .tag-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
            backdrop-filter: blur(4px);
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .tag-modal-overlay.active {
            opacity: 1;
            transform: translateY(0);
        }

        .tag-modal {
            width: min(420px, 90vw);
            background: #ffffff;
            border-radius: 18px;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .tag-modal-header {
            padding: 20px 24px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 1;
        }

        .tag-modal-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
        }

        .tag-close-btn {
            border: none;
            background: rgba(15, 23, 42, 0.08);
            color: #0f172a;
            width: 34px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .tag-close-btn:hover {
            background: rgba(15, 23, 42, 0.16);
        }

        .tag-modal-body {
            padding: 0 24px 24px;
            position: relative;
            z-index: 1;
        }

        .tag-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 18px;
        }

        .tag-field label {
            font-size: 13px;
            font-weight: 600;
            color: #1e293b;
            letter-spacing: 0.02em;
            text-transform: uppercase;
        }

        .tag-input {
            border: 1px solid rgba(148, 163, 184, 0.55);
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 15px;
            transition: border 0.2s ease, box-shadow 0.2s ease;
        }

        .tag-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            outline: none;
        }

        .tag-color-picker {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .tag-color-picker input[type="color"] {
            -webkit-appearance: none;
            width: 100%;
            height: 32px;
            border: none;
            background: transparent;
            cursor: pointer;
        }

        .tag-color-picker input[type="color"]::-webkit-color-swatch-wrapper {
            padding: 0;
        }

        .tag-color-picker input[type="color"]::-webkit-color-swatch {
            border: none;
            border-radius: 8px;
        }

        .tag-preview-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            border-radius: 999px;
            background: rgba(99, 102, 241, 0.12);
            color: #312e81;
            font-weight: 500;
            font-size: 14px;
            margin-top: 8px;
            transition: background 0.2s ease, color 0.2s ease;
        }

        .tag-preview-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
        }

        .tag-modal-footer {
            padding: 16px 24px 24px;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            background: rgba(248, 250, 252, 0.75);
            position: relative;
            z-index: 1;
        }

        .tag-btn {
            border: none;
            border-radius: 12px;
            padding: 10px 18px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .tag-btn:active {
            transform: translateY(1px);
        }

        .tag-btn-secondary {
            background: rgba(15, 23, 42, 0.05);
            color: #0f172a;
        }

        .tag-btn-secondary:hover {
            background: rgba(15, 23, 42, 0.08);
        }

        .tag-feedback {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #10b981;
            color: white;
            padding: 12px 18px;
            border-radius: 14px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transform: translateY(12px);
            transition: opacity 0.25s ease, transform 0.25s ease;
            z-index: 1400;
        }

        .tag-feedback.show {
            opacity: 1;
            transform: translateY(0);
        }

        .tag-existing-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }

        .tag-existing-chip {
            border-radius: 14px;
            padding: 8px 12px;
            background: rgba(15, 23, 42, 0.04);
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid transparent;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s.ease, border 0.2s ease;
        }

        .tag-existing-chip:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
            border-color: rgba(99, 102, 241, 0.35);
        }

        .tags-list-empty {
            padding: 14px;
            text-align: center;
            color: rgba(148, 163, 184, 0.9);
            font-size: 13px;
            border: 1px dashed rgba(148, 163, 184, 0.5);
            border-radius: 12px;
            background: rgba(248, 250, 252, 0.6);
        }
    `;

    document.head.appendChild(style);
}

async function fetchTags() {
    try {
        const response = await fetch('/message/get_labels', {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Failed to load labels (${response.status})`);

        const data = await response.json();
        return Array.isArray(data.labels) ? data.labels : [];
    } catch (error) {
        console.error('Error fetching labels:', error);
        return [];
    }
}

function getActiveLineUuid() {
    const activeConversationItem = document.querySelector('.conversation-item.active');
    if (activeConversationItem) {
        const id = activeConversationItem.getAttribute('data-id');
        if (id) return id;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlLineUuid = urlParams.get('lineUuid');
    if (urlLineUuid) return urlLineUuid;

    if (window.currentChat?.lineUuid) return window.currentChat.lineUuid;

    const element = document.querySelector('[data-line-uuid]');
    if (element) return element.getAttribute('data-line-uuid');

    return document.getElementById('line-uid')?.value || null;
}

function getActiveLabelMetadata() {
    const labelElement = document.querySelector('.conversation-label');
    if (!labelElement) {
        return { name: '', color: '' };
    }

    const name = labelElement.textContent?.trim() || '';
    const colorSource = labelElement.querySelector('.label-dot') || labelElement;
    let color = '';

    if (colorSource) {
        const computedStyle = window.getComputedStyle(colorSource);
        color = computedStyle.backgroundColor || computedStyle.background || '';
    }

    return { name, color };
}

function getCustomerInfoForWebhook() {
    const nameFromHeader = document.querySelector('.chat-profile-info h3')?.textContent?.trim();
    const nameFromInput = document.getElementById('customer-name')?.value?.trim();
    const phone = document.getElementById('customer-phone')?.value?.trim() || '';
    const email = document.getElementById('customer-email')?.value?.trim() || '';

    return {
        name: nameFromHeader || nameFromInput || '',
        phone,
        email
    };
}

async function openTagModal() {
    ensureTagModalStyles();

    const overlay = document.createElement('div');
    overlay.className = 'tag-modal-overlay';

    overlay.innerHTML = `
        <div class="tag-modal" role="dialog" aria-modal="true">
            <div class="tag-modal-header">
                <h3>Add a label</h3>
                <button class="tag-close-btn" aria-label="Close">&times;</button>
            </div>
            <div class="tag-modal-body">
                <div class="tag-field">
                    <label for="tag-name-input">Label name</label>
                    <input id="tag-name-input" class="tag-input" type="text" placeholder="e.g. VIP, Follow-up" autocomplete="off" />
                </div>
                <div class="tag-field">
                    <label>Pick a color</label>
                    <div class="tag-color-picker">
                        <input id="tag-color-input" type="color" value="#6366f1" />
                    </div>
                </div>
                <div class="tag-field">
                    <label>Preview</label>
                    <span class="tag-preview-chip" id="tag-preview-chip">
                        <span class="tag-preview-dot"></span>
                        <span id="tag-preview-text">Label Preview</span>
                    </span>
                </div>
                <div class="tag-field">
                    <label>Existing labels</label>
                    <div id="tag-existing-list" class="tag-existing-list"></div>
                </div>
            </div>
            <div class="tag-modal-footer">
                <button type="button" class="tag-btn tag-btn-secondary" id="tag-cancel-btn">Cancel</button>
                <button type="button" class="tag-btn tag-btn-primary" id="tag-save-btn">
                    <i class="fi fi-tr-check"></i>
                    Save label
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const close = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
    };

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) close();
    });

    overlay.querySelector('.tag-close-btn').addEventListener('click', close);
    overlay.querySelector('#tag-cancel-btn').addEventListener('click', close);

    const nameInput = overlay.querySelector('#tag-name-input');
    const colorInput = overlay.querySelector('#tag-color-input');
    const previewChip = overlay.querySelector('#tag-preview-chip');
    const previewText = overlay.querySelector('#tag-preview-text');
    const saveBtn = overlay.querySelector('#tag-save-btn');
    const existingList = overlay.querySelector('#tag-existing-list');

    nameInput.focus();

    const renderExisting = async () => {
        existingList.innerHTML = '';
        const labels = await fetchTags();

        if (!labels.length) {
            existingList.innerHTML = '<div class="tags-list-empty">No labels yet. Create your first label above.</div>';
            return;
        }

        labels.forEach((label) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'tag-existing-chip';
            chip.innerHTML = `
                <span class="tag-preview-dot" style="background:${label.color}"></span>
                <span>${label.name}</span>
            `;

            chip.addEventListener('click', async () => {
                const activeLineUuid = getActiveLineUuid();
                if (!activeLineUuid) {
                    alert('Please select a conversation first.');
                    return;
                }

                try {
                    console.log('Label added:', { label: label.name, lineUuid: activeLineUuid });

                    // Send to n8n webhook
                    await fetch('https://n8n-yesai.naijai.com/webhook/update-label', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            label_id: label.id,
                            label_name: label.name,
                            label_color: label.color,
                            lineUuid: activeLineUuid,
                            timestamp: new Date().toISOString(),
                            event_type: 'add'
                        })
                    });

                    // Save applied label to customer data locally
                    await saveAppliedLabel(activeLineUuid, label);

                    showTagFeedback(`Label "${label.name}" applied`);

                    const infoPanel = document.getElementById('information-panel');
                    if (infoPanel && infoPanel.classList.contains('active') && activeLineUuid) {
                        updateInformationPanel(activeLineUuid);
                    }
                } catch (error) {
                    console.error('Failed to apply label:', error);
                    alert('Failed to apply label. Please try again.');
                }
            });

            existingList.appendChild(chip);
        });
    };

    renderExisting();

    const updatePreview = () => {
        previewText.textContent = nameInput.value.trim() || 'Label Preview';
        previewChip.style.background = `${colorInput.value}1f`;
        previewChip.style.color = colorInput.value;
    };

    nameInput.addEventListener('input', updatePreview);
    colorInput.addEventListener('input', updatePreview);
    updatePreview();

    saveBtn.addEventListener('click', async () => {
        const labelName = nameInput.value.trim();
        if (!labelName) {
            nameInput.focus();
            nameInput.classList.add('shake');
            setTimeout(() => nameInput.classList.remove('shake'), 300);
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/message/save_label', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: labelName,
                    color: colorInput.value,
                    _token: csrfToken
                })
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle duplicate label case specially
                if (response.status === 409 && result.existing_label) {
                    const useExisting = confirm(
                        `Label "${labelName}" already exists with color ${result.existing_label.color}.\n\n` +
                        `Would you like to use the existing label instead?\n` +
                        `Click OK to use existing, Cancel to choose a different name.`
                    );

                    if (useExisting) {
                        // Close the modal and refresh the label list
                        showTagFeedback(`Using existing label "${labelName}"`);
                        nameInput.value = '';
                        updatePreview();
                        renderExisting();
                        document.body.removeChild(overlay);
                        return;
                    } else {
                        // Let user try again with different name
                        nameInput.focus();
                        nameInput.select();
                        return;
                    }
                }

                throw new Error(`${response.status}: ${result.message || 'Save label failed'}`);
            }

            if (!result.success) {
                throw new Error(result.message || 'Save label returned error');
            }

            showTagFeedback(`Label “${labelName}” created`);
            nameInput.value = '';
            updatePreview();
            renderExisting();

            const infoPanel = document.getElementById('information-panel');
            const activeLineUuid = getActiveLineUuid();
            if (infoPanel && infoPanel.classList.contains('active') && activeLineUuid) {
                updateInformationPanel(activeLineUuid);
            }
        } catch (error) {
            console.error('Error saving label:', error);

            // Handle other error cases
            if (error.message.includes('400')) {
                alert('Invalid label data. Please check the name and color.');
            } else if (error.message.includes('409')) {
                alert(`Label "${labelName}" already exists. Please choose a different name.`);
                nameInput.focus();
                nameInput.select();
            } else {
                alert('Failed to save label. Please try again.');
            }
        }
    });
}

function showTagFeedback(message) {
    const existing = document.querySelector('.tag-feedback');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'tag-feedback';
    toast.innerHTML = `<i class="fi fi-tr-sparkles"></i>${message}`;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 2800);
}

// Add this function to get applied labels for current conversation
async function getExistingLabels() {
    const activeConversation = document.querySelector('.conversation-item.active');
    const lineUuid = activeConversation ? activeConversation.getAttribute('data-id') : null;

    if (!lineUuid) {
        return [];
    }

    try {
        // Try to get applied labels from customer data API
        const response = await fetch(`/api/customer/${lineUuid}`);
        const result = await response.json();

        if (result.success && result.data) {
            // Return only applied labels (handle both null and empty cases)
            const labels = result.data.labels || [];
            return Array.isArray(labels) ? labels : [];
        }

        // Fallback: check if labels are stored in localStorage for this conversation
        const storedData = localStorage.getItem('customer_' + lineUuid);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.labels) {
                return Array.isArray(parsed.labels) ? parsed.labels : [];
            }
        }

        // If no applied labels found, return empty array (not all labels)
        return [];
    } catch (error) {
        console.error('Error getting applied labels:', error);
        return [];
    }
}

// Function to save applied label to customer data
async function saveAppliedLabel(lineUuid, label) {
    try {
        // Get existing customer data
        let customerData = {};
        const response = await fetch(`/api/customer/${lineUuid}`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                customerData = result.data;
            }
        }

        // Initialize labels array if it doesn't exist
        if (!customerData.labels) {
            customerData.labels = [];
        }

        // Check if label is already applied
        const existingLabel = customerData.labels.find(l => l.id === label.id);
        if (existingLabel) {
            return; // Label already applied
        }

        // Add the new label
        customerData.labels.push({
            id: label.id,
            name: label.name,
            color: label.color
        });

        // Save updated customer data
        const saveResponse = await fetch('/api/customer/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
                line_uuid: lineUuid,
                name: customerData.name || '',
                phone: customerData.phone || '',
                email: customerData.email || '',
                notes: customerData.notes || [],
                labels: customerData.labels || []
            })
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to save applied label');
        }

        console.log('Applied label saved successfully');
    } catch (error) {
        console.error('Error saving applied label:', error);
    }
}

// Function to remove applied label from customer data
async function removeAppliedLabel(lineUuid, labelId) {
    try {
        // Get existing customer data
        let customerData = {};
        const response = await fetch(`/api/customer/${lineUuid}`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                customerData = result.data;
            }
        }

        // Remove the label from the array
        if (customerData.labels) {
            customerData.labels = customerData.labels.filter(l => l.id !== labelId);
        }

        // Save updated customer data
        const saveResponse = await fetch('/api/customer/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
                line_uuid: lineUuid,
                name: customerData.name || '',
                phone: customerData.phone || '',
                email: customerData.email || '',
                notes: customerData.notes || [],
                labels: customerData.labels || []
            })
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to remove applied label');
        }

        console.log('Applied label removed successfully');
    } catch (error) {
        console.error('Error removing applied label:', error);
    }
}

// Global configuration loaded from environment
let APP_CONFIG = null;

// Load configuration from Laravel backend
async function loadAppConfig() {
    if (!APP_CONFIG) {
        try {
            const response = await fetch('/js-config');
            APP_CONFIG = await response.json();
            console.log('App configuration loaded:', APP_CONFIG);
        } catch (error) {
            console.error('Failed to load app configuration:', error);
            APP_CONFIG = { n8n_webhook_url: '' }; // Default empty config
        }
    }
    return APP_CONFIG;
}

// Function to send data to n8n webhook for Google Sheets integration
async function sendToN8nWebhook(eventType, data) {
    // Load configuration if not already loaded
    const config = await loadAppConfig();

    // Skip if webhook URL is not configured
    if (!config.n8n_webhook_url || config.n8n_webhook_url === '') {
        console.log('N8N webhook not configured in environment, skipping...');
        return;
    }

    try {
        console.log('Sending to n8n webhook:', eventType, data);

        const response = await fetch(config.n8n_webhook_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: eventType,
                ...data
            })
        });

        if (response.ok) {
            console.log('Successfully sent to n8n webhook');
        } else {
            console.warn('n8n webhook responded with status:', response.status);
        }
    } catch (error) {
        // Don't throw error - n8n is secondary, don't break main functionality
        console.warn('Failed to send to n8n webhook (continuing normally):', error);
    }
}

// Function to load existing customer data 
async function loadCustomerData(lineUuid) {
    try {
        console.log('Loading customer data for:', lineUuid);
        const response = await fetch(`/api/customer/${lineUuid}`);
        const result = await response.json();

        if (result.success && result.data) {
            const data = result.data;
            const normalizedData = {
                lineUuid: data.line_uuid || lineUuid,
                name: data.name || '',
                phone: data.phone || '',
                email: data.email || '',
                notes: Array.isArray(data.notes) ? data.notes : [],
                raw: data
            };
            console.log('Customer data loaded:', normalizedData);
            return normalizedData;
        } else {
            console.log('No existing customer data found');
            return null;
        }
    } catch (error) {
        console.error('Error loading customer data:', error);
        return null;
    }
}

// Modify updateInformationPanel to include labels section
async function updateInformationPanel(lineUuid) {
    const informationPanel = document.getElementById('information-panel');
    if (!informationPanel) return;

    try {
        // Clear any existing data first
        clearCustomerData();

        // Load existing customer data from database
        const existingCustomerData = await loadCustomerData(lineUuid);

        // Extract customer information from chat if no database data exists
        const customerData = existingCustomerData || await extractCustomerInfo(lineUuid);
        if (!customerData) {
            throw new Error('Could not extract customer information');
        }

        // Extract information from chat header
        const chatHeader = document.querySelector('.chat-header');
        const profileImageUrl = chatHeader?.querySelector('.conversation-avatar img')?.src || 'images/default-user.png';
        const appBadge = chatHeader?.querySelector('.app-badge')?.outerHTML || '';
        const labelElement = chatHeader?.querySelector('.conversation-label');

        // Get label text and color
        const label = labelElement?.textContent?.trim() || '';
        let labelColor = '#e0e0e0';  // default color

        // Try to get the color from the label dot if it exists
        const labelDot = labelElement?.querySelector('.label-dot');
        if (labelDot) {
            // Try getting computed style
            const computedStyle = window.getComputedStyle(labelDot);
            labelColor = computedStyle.backgroundColor || computedStyle.background || '#e0e0e0';
        } else if (labelElement) {
            // If no dot, try getting color from the label element itself
            const computedStyle = window.getComputedStyle(labelElement);
            labelColor = computedStyle.backgroundColor || computedStyle.background || '#e0e0e0';
        }

        // Get existing labels (เฉพาะ label ของตัวเอง ไม่รวม label จาก chat header)
        const existingLabels = await getExistingLabels();
        const savedLabels = Array.isArray(existingLabels) ? existingLabels.filter(lbl => lbl && (lbl.name || '').trim() !== '') : [];
        const hasSavedLabels = savedLabels.length > 0;

        const labelsHtml = hasSavedLabels ? savedLabels.map(savedLabel => `
            <div class="label-item${label === savedLabel.name ? ' is-active' : ''}" data-label-id="${savedLabel.id}" data-label-name="${savedLabel.name}">
                <span class="label-dot" style="background-color: ${savedLabel.color}"></span>
                ${savedLabel.name}
                <button class="delete-label-btn" title="Delete label" style="margin-left:6px;background:none;border:none;color:#e74c3c;cursor:pointer;font-size:14px;">×</button>
            </div>
        `).join('') : '';

        // Get assignment data from assignment manager
        let assignedTeam = null;
        if (window.assignmentManager) {
            const assignment = window.assignmentManager.getAssignment(lineUuid);
            if (assignment && assignment.assignedUser) {
                assignedTeam = assignment.assignedUser.name;
            }
        }

        // Update the panel content
        informationPanel.innerHTML = `
            <div class="customer-profile">
                <div class="profile-header">
                    <div class="chat-header-info">
                        <div class="chat-profile panels">
                            <div class="conversation-avatar-panels">
                                <img src="${profileImageUrl}" alt="${customerData.name}" onerror="this.src='images/default-user.png'">
                                ${appBadge}
                            </div>
                            <div class="chat-profile-info">
                                ${label ? `
                                    <span class="conversation-label">
                                        <span class="label-dot" style="background-color: ${labelColor}"></span>
                                        ${label}
                                    </span>
                                ` : ''}
                                <h3>${customerData.name}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-details" >
                    <div class="detail-field">
                        <h4>Contact Info</h4>
                        <div class="panels-uid">
                            <i class="fa-solid fa-key" style="color: #000000ff; font-size: 0.9rem; position: absolute; left: 8px;"></i>
                            <span class="detail-input" id="line-uid" style="padding-left: 30px;">${customerData.lineUuid}</span>
                        </div>
                        <div class="panels-input">
                            <i class="fa-solid fa-phone" style="color: #000000ff; font-size: 0.9rem; position: absolute; left: 8px;"></i>
                            <input type="text" class="detail-input" id="customer-phone" value="${customerData.phone || ''}" placeholder="Enter phone number" style="flex: 1; padding-left: 30px;">
                        </div>
                        <div class="panels-input">
                            <i class="fa-solid fa-envelope" style="color: #000000ff; font-size: 0.9rem; position: absolute; left: 8px;"></i>
                            <input type="email" class="detail-input" id="customer-email" value="${customerData.email || ''}" placeholder="Enter email address" style="flex: 1; padding-left: 30px;">
                        </div>
                    </div>
                    <button id="save-customer-info" class="save-info-btn">
                        <i class="fi fi-tr-disk"></i> Save Changes
                    </button>
                </div>

                <div class="customer-notes" style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                    <h4>Customer Notes</h4>
                    <div class="notes-list" id="notes-list">
                        <!-- Notes will be dynamically added here -->
                    </div>
                    <div class="add-note">
                        <input type="text" id="new-note" placeholder="Add a note..."></input>
                        <button id="add-note-btn">
                            <i class="fi fi-rr-plus"></i> Add note
                        </button>
                    </div>
                </div>

                <div class="customer-tags" style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
                    <div class="tags-header">
                        <h4>Tags</h4>
                        ${hasSavedLabels ? `
                            <div class="tags-list" id="tags-list">
                                ${labelsHtml}
                            </div>
                        ` : ''}
                    </div>
                    <div class="add-tag">
                        <button id="add-tag-btn">
                            <i class="fi fi-rr-plus"></i> Add Label
                        </button>
                    </div>
                </div>

                <div class="assigned-person" style="margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                    <h4>Assigned to person</h4>
                    <div class="assigned-display cstm-profile">
                        <div class="assignment-placeholder" data-line-uuid="${lineUuid}">
                            ${assignedTeam ? `
                                <div class="assigned-display">
                                    <span>${assignedTeam} <small class="role-label">Sales</small></span>
                                </div>
                            ` : `
                                <div class="unassigned-display">
                                    <span>Unassigned</span>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add CSS for labels
        const style = document.createElement('style');
        style.textContent = `

            .panels-uid {
                display: flex;
                align-items: center;
                margin-top: 16px;
                gap: 8px;
                position: relative;    
            }

            .panels-input {
                display: flex;
                align-items: center;
                margin-top: 8px;
                gap: 8px;
                position: relative;
            }

            .chat-profile.panels {
                display: flex;
                flex-direction: column;
                gap: 12px;
                height: auto;
            }
            
            .conversation-avatar-panels {
                align-items: center;
                justify-content: center;
                position: relative;
                width: 100%;
                height: auto;
            }

            .conversation-avatar-panels img {
                width: 70px;
                height: 70px;
            }
            
            .tags-header {
                margin-bottom: 12px;
            }
            .tags-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }
            .label-item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
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
            
            .save-info-btn {
                background-color: #414141;
                color: white;
                border: none;
                border-radius: 80px;
                padding: 8px 16px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                margin-top: 10px;
            }
            
            .save-info-btn:hover {
                background-color: #818181ff;
                color: black;
                border: none;
                border-radius: 80px;
            }
            
            
            .team-header {
                margin-bottom: 12px;
            }
            
            .team-header h4 {
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: 500;
            }
            
            .team-assignment-container {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 8px;
            }
            
            
            .team-assign-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #e6f7ff;
                border: 1px solid #91d5ff;
                border-radius: 4px;
                padding: 6px 12px;
                cursor: pointer;
                color: #1890ff;
                transition: all 0.2s;
                font-size: 13px;
            }
            
            .team-assign-btn:hover {
                background-color: #1890ff;
                color: white;
            }
            
            .team-assign-btn i {
                margin-right: 5px;
            }
            
            .no-team-assigned, .no-member-assigned {
                color: #999;
                font-style: italic;
            }
            
            
            .assigned-member {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                background-color: white;
                flex-grow: 1;
                font-size: 13px;
            }
            
            .assigned-member img {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                object-fit: cover;
            }
            
            /* Team assignment dropdown */
            .team-assignment-dropdown {
                position: relative;
            }
            
            .team-assignment-dropdown-content {
                display: none;
                position: absolute;
                right: 0;
                top: 100%;
                background-color: #fff;
                min-width: 250px;
                max-height: 400px;
                overflow-y: auto;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                border-radius: 4px;
                z-index: 1000;
                margin-top: 5px;
                border: 1px solid #91d5ff;
            }
            
            .team-assignment-dropdown.active .team-assignment-dropdown-content {
                display: block;
            }
            
            .team-assignment-search {
                padding: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .team-search-input {
                width: 100%;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .team-assignment-list {
                max-height: 300px;
                overflow-y: auto;
            }
            
            .member-item {
                display: flex;
                align-items: center;
                padding: 8px 10px;
                cursor: pointer;
                transition: background-color 0.2s;
                border-bottom: 1px solid #f5f5f5;
            }
            
            .member-item:hover {
                background-color: #f0f7ff;
            }
            
            .member-item .member-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                overflow: hidden;
                margin-right: 10px;
            }
            
            .member-item .member-role {
                margin-left: auto;
                font-size: 11px;
                color: #999;
            }
        `;
        document.head.appendChild(style);

        // Set up event listeners with a delay to ensure DOM is ready
        setTimeout(() => {
            setupInformationPanelListeners();
            // Load existing notes if available
            if (existingCustomerData && existingCustomerData.notes) {
                loadExistingNotes(existingCustomerData.notes);
            }

            // Populate assignment and chat mode data
            populateConversationMeta(lineUuid);
        }, 100);

    } catch (error) {
        console.error('Error updating information panel:', error);
        informationPanel.innerHTML = `
            <div class="error-state">
                <i class="fi fi-tr-exclamation"></i>
                <p>Error loading customer information: ${error.message}</p>
            </div>
        `;
    }

    // หลังจาก render labels แล้ว ให้เพิ่ม event handler ให้ปุ่มลบ
    setTimeout(() => {
        document.querySelectorAll('.delete-label-btn').forEach(btn => {
            btn.addEventListener('click', async function (e) {
                e.stopPropagation();
                const labelItem = btn.closest('.label-item');
                if (!labelItem) return;

                const labelId = labelItem.getAttribute('data-label-id');
                const labelName = labelItem.getAttribute('data-label-name') || 'label';

                if (!labelId) {
                    console.warn('No label ID found for deletion');
                    return;
                }

                if (!confirm(`Delete label "${labelName}"?`)) {
                    return;
                }

                try {
                    const activeLineUuid = getActiveLineUuid();
                    if (!activeLineUuid) {
                        alert('No conversation selected');
                        return;
                    }

                    // Remove applied label from customer data
                    await removeAppliedLabel(activeLineUuid, parseInt(labelId));

                    labelItem.remove();
                    showTagFeedback(`Label "${labelName}" removed`);

                    const infoPanel = document.getElementById('information-panel');
                    if (infoPanel && infoPanel.classList.contains('active') && activeLineUuid) {
                        updateInformationPanel(activeLineUuid);
                    }

                    // Optional webhook notification
                    let lineUuid = document.getElementById('line-uid')?.value || activeLineUuid;

                    const customerInfo = getCustomerInfoForWebhook();
                    const labelMetadata = getActiveLabelMetadata();

                    // Send remove event to n8n webhook
                    console.log('Label removed:', { label: labelName, lineUuid: lineUuid });
                    await fetch('https://n8n-yesai.naijai.com/webhook/update-label', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            label_id: parseInt(labelId),
                            label_name: labelName,
                            label_color: '',
                            lineUuid: lineUuid,
                            timestamp: new Date().toISOString(),
                            event_type: 'remove'
                        })
                    });

                } catch (error) {
                    console.error('Failed to delete label:', error);
                    alert(error.message || 'Failed to delete label. Please try again.');
                }
            });
        });
    }, 100);
}

// Function to load existing notes into the UI
function loadExistingNotes(notes) {
    const notesList = document.getElementById('notes-list');
    if (!notesList || !notes || !Array.isArray(notes)) return;

    console.log('Loading existing notes:', notes);

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.dataset.noteId = note.id; // Add note ID for edit/delete operations
        noteElement.innerHTML = `
            <div class="note-content">${note.text}</div>
            <div class="note-meta">
                <div class="note-actions">
                    <button class="edit-note"><i class="fi fi-tr-pencil"></i> Edit</button>
                    <button class="remove-note"><i class="fi fi-tr-trash"></i> Remove</button>
                </div>
            </div>
        `;

        notesList.appendChild(noteElement);

        // Add event listeners for edit/remove buttons
        setupNoteEventListeners(noteElement);
    });
}

// Function to set up event listeners for note buttons
function setupNoteEventListeners(noteElement) {
    const editButton = noteElement.querySelector('.edit-note');
    const removeButton = noteElement.querySelector('.remove-note');

    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const noteContent = noteElement.querySelector('.note-content');
        const currentText = noteContent.textContent;

        // Replace the content with an editable textarea
        noteContent.innerHTML = `
            <textarea class="edit-note-textarea">${currentText}</textarea>
            <div class="edit-actions">
                <button class="save-edit"><i class="fi fi-tr-check"></i> Save</button>
                <button class="cancel-edit"><i class="fi fi-tr-cross"></i> Cancel</button>
            </div>
        `;

        // Add event listeners for save/cancel
        const textarea = noteContent.querySelector('.edit-note-textarea');
        const saveBtn = noteContent.querySelector('.save-edit');
        const cancelBtn = noteContent.querySelector('.cancel-edit');

        saveBtn.addEventListener('click', async () => {
            const newText = textarea.value.trim();
            if (newText) {
                try {
                    // Get lineUuid from active conversation
                    const activeConversation = document.querySelector('.conversation-item.active');
                    if (!activeConversation) {
                        alert('No conversation selected');
                        return;
                    }
                    const lineUuid = activeConversation.getAttribute('data-id');

                    // Update note in database
                    const response = await fetch('/api/customer/update-note', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                        },
                        body: JSON.stringify({
                            lineUuid: lineUuid,
                            noteId: noteElement.dataset.noteId,
                            newText: newText
                        })
                    });

                    if (response.ok) {
                        noteContent.innerHTML = newText;
                        console.log('Note updated successfully');
                    } else {
                        throw new Error('Failed to update note');
                    }
                } catch (error) {
                    console.error('Error updating note:', error);
                    alert('Failed to update note');
                    noteContent.innerHTML = currentText; // Revert on error
                }
            }
        });

        cancelBtn.addEventListener('click', () => {
            noteContent.innerHTML = currentText;
        });

        textarea.focus();
        textarea.select();
    });

    removeButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                // Get lineUuid from active conversation
                const activeConversation = document.querySelector('.conversation-item.active');
                if (!activeConversation) {
                    alert('No conversation selected');
                    return;
                }
                const lineUuid = activeConversation.getAttribute('data-id');

                // Delete note from database
                const response = await fetch('/api/customer/delete-note', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({
                        lineUuid: lineUuid,
                        noteId: noteElement.dataset.noteId
                    })
                });

                if (response.ok) {
                    // Add fade out animation
                    noteElement.style.opacity = '0';
                    noteElement.style.transition = 'opacity 0.3s ease';

                    // Remove the note after animation completes
                    setTimeout(() => {
                        if (noteElement.parentNode) {
                            noteElement.parentNode.removeChild(noteElement);
                        }
                    }, 300);
                    console.log('Note deleted successfully');
                } else {
                    throw new Error('Failed to delete note');
                }
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Failed to delete note');
            }
        }
    });
}

function setupInformationPanelListeners() {
    console.log('Setting up Information panel listeners...');

    // Add note button handler
    const addNoteBtn = document.getElementById('add-note-btn');
    const newNoteTextarea = document.getElementById('new-note');
    const notesList = document.getElementById('notes-list');

    console.log('Found elements:', { addNoteBtn, newNoteTextarea, notesList });

    if (addNoteBtn && newNoteTextarea && notesList) {
        console.log('Setting up Add Note listeners...');
        // Add event listener for Enter key in the textarea
        newNoteTextarea.addEventListener('keydown', (e) => {
            // Check if Enter was pressed without Shift (Shift+Enter adds a new line)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default action (new line)
                addNoteBtn.click(); // Trigger the click event on the Add Note button
            }
        });

        addNoteBtn.addEventListener('click', async () => {
            console.log('Add Note button clicked!');
            const noteText = newNoteTextarea.value.trim();
            console.log('Note text:', noteText);
            if (noteText) {
                // Get customer name
                const customerName = document.querySelector('.chat-profile-info h3')?.textContent || 'Unknown Customer';

                // Get lineUuid using multiple methods
                let lineUuid = document.getElementById('line-uid')?.value;

                // If no lineUuid from line-uid input, try other methods (similar to label-management.js)
                if (!lineUuid) {
                    // Try to get from active conversation item's data-id attribute
                    const activeConversationItem = document.querySelector('.conversation-item.active');
                    if (activeConversationItem) {
                        lineUuid = activeConversationItem.getAttribute('data-id');
                    }

                    // Try to get from URL
                    if (!lineUuid) {
                        const urlParams = new URLSearchParams(window.location.search);
                        lineUuid = urlParams.get('lineUuid');
                    }

                    // Try to get from window.currentChat
                    if (!lineUuid && window.currentChat && window.currentChat.lineUuid) {
                        lineUuid = window.currentChat.lineUuid;
                    }

                    // Try to get from data attribute
                    if (!lineUuid) {
                        const element = document.querySelector('[data-line-uuid]');
                        if (element) {
                            lineUuid = element.getAttribute('data-line-uuid');
                        }
                    }
                }

                console.log('Found lineUuid for note:', lineUuid);

                if (!lineUuid) {
                    alert('Error: Cannot add note without LINE UUID');
                    return;
                }

                try {
                    // Save note via API
                    const response = await fetch('/api/customer/add-note', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            line_uuid: lineUuid,
                            note: noteText
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        const notesFromResponse = Array.isArray(result.data?.notes) ? result.data.notes : [];
                        const latestNote = notesFromResponse[notesFromResponse.length - 1] || null;
                        // Create note element in UI
                        const noteElement = document.createElement('div');
                        noteElement.className = 'note-item';
                        if (latestNote?.id) {
                            noteElement.dataset.noteId = latestNote.id;
                        }

                        noteElement.innerHTML = `
            <div class="note-content">${noteText}</div>
            <div class="note-meta">
                <div class="note-actions">
                    <button class="edit-note"><i class="fi fi-tr-pencil"></i> Edit</button>
                    <button class="remove-note"><i class="fi fi-tr-trash"></i> Remove</button>
                </div>
            </div>
        `;

                        // Add to the list and clear the textarea
                        notesList.appendChild(noteElement);
                        newNoteTextarea.value = '';

                        // Set up event listeners for the new note
                        setupNoteEventListeners(noteElement);

                        // Send to n8n webhook for Google Sheets integration
                        sendToN8nWebhook('customer_note_added', {
                            lineUuid: lineUuid,
                            note_data: {
                                content: noteText,
                                customer_name: customerName,
                                created_at: new Date().toISOString()
                            },
                            timestamp: new Date().toISOString()
                        });

                        // Show success feedback
                        const feedbackMsg = document.createElement('div');
                        feedbackMsg.className = 'note-feedback';
                        feedbackMsg.textContent = '✓ Note saved successfully!';
                        feedbackMsg.style.position = 'fixed';
                        feedbackMsg.style.right = '20px';
                        feedbackMsg.style.bottom = '20px';
                        feedbackMsg.style.backgroundColor = '#52c41a';
                        feedbackMsg.style.color = '#fff';
                        feedbackMsg.style.padding = '10px 15px';
                        feedbackMsg.style.borderRadius = '5px';
                        feedbackMsg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        feedbackMsg.style.zIndex = '9999';
                        document.body.appendChild(feedbackMsg);

                        setTimeout(() => {
                            feedbackMsg.style.opacity = '0';
                            feedbackMsg.style.transition = 'opacity 0.5s ease';
                            setTimeout(() => {
                                if (document.body.contains(feedbackMsg)) {
                                    document.body.removeChild(feedbackMsg);
                                }
                            }, 500);
                        }, 3000);

                    } else {
                        throw new Error(result.message || 'Failed to save note');
                    }

                } catch (error) {
                    console.error('Error saving note:', error);
                    alert('Failed to save note: ' + error.message);
                }
            }
        });
    } else {
        console.warn('Add Note button or related elements not found:', {
            addNoteBtn: !!addNoteBtn,
            newNoteTextarea: !!newNoteTextarea,
            notesList: !!notesList
        });
    }

    // Save customer info button handler
    const saveBtn = document.getElementById('save-customer-info');
    console.log('Found Save button:', saveBtn);

    if (saveBtn) {
        console.log('Setting up Save button listener...');
        saveBtn.addEventListener('click', async () => {
            console.log('Save Changes button clicked!');
            // Get customer name
            const customerName = document.querySelector('.chat-profile-info h3')?.textContent || '';
            console.log('Customer name:', customerName);

            // Get lineUuid using multiple methods
            let lineUuid = document.getElementById('line-uid')?.value;

            // If no lineUuid from line-uid input, try other methods (similar to label-management.js)
            if (!lineUuid) {
                // Try to get from active conversation item's data-id attribute
                const activeConversationItem = document.querySelector('.conversation-item.active');
                if (activeConversationItem) {
                    lineUuid = activeConversationItem.getAttribute('data-id');
                }

                // Try to get from URL
                if (!lineUuid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    lineUuid = urlParams.get('lineUuid');
                }

                // Try to get from window.currentChat
                if (!lineUuid && window.currentChat && window.currentChat.lineUuid) {
                    lineUuid = window.currentChat.lineUuid;
                }

                // Try to get from data attribute
                if (!lineUuid) {
                    const element = document.querySelector('[data-line-uuid]');
                    if (element) {
                        lineUuid = element.getAttribute('data-line-uuid');
                    }
                }
            }

            console.log('Found lineUuid for customer info:', lineUuid);

            if (!lineUuid) {
                console.error('No lineUuid found for saving customer info');
                alert('Error: Cannot save customer info without LINE UUID');
                return;
            }

            // Create updated data object
            const updatedData = {
                line_uuid: lineUuid,
                phone: document.getElementById('customer-phone')?.value || '',
                email: document.getElementById('customer-email')?.value || '',
                name: customerName
            };

            console.log('Saving customer data:', updatedData);

            // Create a feedback message element
            const feedbackMsg = document.createElement('div');
            feedbackMsg.className = 'save-feedback';
            feedbackMsg.textContent = 'Saving customer info...';
            feedbackMsg.style.position = 'fixed';
            feedbackMsg.style.right = '20px';
            feedbackMsg.style.bottom = '20px';
            feedbackMsg.style.backgroundColor = '#1890ff';
            feedbackMsg.style.color = '#fff';
            feedbackMsg.style.padding = '10px 15px';
            feedbackMsg.style.borderRadius = '5px';
            feedbackMsg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            feedbackMsg.style.zIndex = '9999';
            document.body.appendChild(feedbackMsg);

            try {
                // Save to local API
                const response = await fetch('/api/customer/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                const result = await response.json();
                console.log('Local API response:', result);

                if (result.success) {
                    feedbackMsg.textContent = '✓ Customer info saved successfully!';
                    feedbackMsg.style.backgroundColor = '#52c41a';

                    // Store in localStorage for immediate retrieval
                    localStorage.setItem('customer_' + lineUuid, JSON.stringify(updatedData));

                    // Send to n8n webhook for Google Sheets integration
                    sendToN8nWebhook('customer_info_saved', {
                        lineUuid: updatedData.line_uuid,
                        customer_info: {
                            name: updatedData.name,
                            phone: updatedData.phone,
                            email: updatedData.email
                        },
                        timestamp: new Date().toISOString()
                    });

                } else {
                    throw new Error(result.message || 'Failed to save customer info');
                }

                // Remove feedback after 3 seconds
                setTimeout(() => {
                    feedbackMsg.style.opacity = '0';
                    feedbackMsg.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        if (document.body.contains(feedbackMsg)) {
                            document.body.removeChild(feedbackMsg);
                        }
                    }, 500);
                }, 3000);

            } catch (error) {
                console.error('Error saving customer data:', error);
                feedbackMsg.textContent = '✗ Failed to save customer info';
                feedbackMsg.style.backgroundColor = '#ff4d4f';

                // Remove feedback after 3 seconds
                setTimeout(() => {
                    feedbackMsg.style.opacity = '0';
                    feedbackMsg.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        if (document.body.contains(feedbackMsg)) {
                            document.body.removeChild(feedbackMsg);
                        }
                    }, 500);
                }, 3000);
            }
        });
    } else {
        console.warn('Save button not found or missing elements');
    }

    // Check Add Label button too
    const addLabelBtn = document.getElementById('add-tag-btn');
    if (addLabelBtn) {
        addLabelBtn.addEventListener('click', async () => {
            const activeLineUuid = getActiveLineUuid();
            if (!activeLineUuid) {
                alert('Please select a conversation first.');
                return;
            }

            await openTagModal();
        });
    }
}

// Add CSS styles for the Information panel
const style = document.createElement('style');
style.textContent = `
    .customer-profile {
        animation: fadeIn 0.3s ease;
    }

    .profile-header {
        display: flex;
        align-items: center;
   เ
    }

    .profile-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-right: 15px;
    }

    .profile-info {
        flex: 1;
    }

    .profile-info h3 {
        margin: 0;
        font-size: 1.2em;
    }

    .vip-tag {
        background: #FFD700;
        color: #000;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        margin-left: 8px;
    }

    .profile-details {
        margin-bottom: 20px;
    }

    .detail-field {
        margin-bottom: 15px;
    }

    .detail-field label {
        display: block;
        margin-bottom: 5px;
        color: #666;
    }

    .detail-input {
        width: 100%;
        padding: 12px 16px;
        background-color: #fff;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        color: #666;
        outline: none;
        box-sizing: border-box;
        height: 40px;
        line-height: 40px;
        display: inline-flex;
        align-items: center;
    }

    .customer-notes, .customer-tags {
        margin-top: 20px;
    }

    .notes-list, .tags-list {
        margin-bottom: 10px;
    }

    .note-item {
        background: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 10px;
    }

    .note-content {
        margin-bottom: 8px;
    }

    .note-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.9em;
        color: #666;
    }

    .note-actions button {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        margin-left: 10px;
    }

    .add-note {
        margin-top: 10px;
    }

    #new-note {
        width: 100%;
        padding: 12px 16px;
        background-color: #fff;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        color: #666;
        outline: none;
        margin-bottom: 10px;
    }

    #add-note-btn, #add-tag-btn {
        background-color: #414141;
        color: white;
        border: none;
        border-radius: 80px;
        padding: 8px 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        margin-top: 10px;
    }

    #add-note-btn:hover, #add-tag-btn:hover {
        background-color: #818181ff;
        color: black;
    }



    .tag-item {
        display: inline-flex;
        align-items: center;
        background: #e9ecef;
        border-radius: 15px;
        padding: 5px 10px;
        margin: 0 5px 5px 0;
    }

    .tag-text {
        margin-right: 5px;
    }

    .remove-tag {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 0 5px;
    }
`;

document.head.appendChild(style);

// Add event listener for the Information tab click
document.addEventListener('DOMContentLoaded', () => {
    console.log("Setting up Information tab click listener");
    const informationTab = document.querySelector('.panel-tab[data-panel="information"]');
    console.log("Information tab found:", informationTab);

    if (informationTab) {
        informationTab.addEventListener('click', () => {
            console.log("Information tab clicked");
            toggleInformation();
        });
    } else {
        console.error("Could not find Information tab element on DOMContentLoaded");
    }
});

// Function to render information section
async function renderInformationSection() {
    console.log("renderInformationSection started");
    const informationPanel = document.getElementById('information-panel');

    if (!informationPanel) {
        console.error("Information panel element not found in renderInformationSection!");
        return;
    }

    // Show initial loading state
    informationPanel.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading customer information...</p>
        </div>
    `;

    // Get the current conversation ID
    const activeConversation = document.querySelector('.conversation-item.active');
    const lineUuid = activeConversation?.getAttribute('data-id');

    if (lineUuid) {
        // Check if user has access to this conversation
        const hasAccess = await userHasAccessToChat(lineUuid);
        if (!hasAccess) {
            informationPanel.innerHTML = `
                <div class="access-denied" style="text-align:center;padding:40px 20px;">
                    <div style="font-size:48px;color:#ff4d4f;margin-bottom:20px;"><i class="fas fa-lock"></i></div>
                    <h3 style="font-size:18px;margin-bottom:10px;">Access Denied</h3>
                    <p style="color:#666;">You don't have permission to view this conversation.</p>
                    <p style="color:#666;">Only the assigned sales person and admins can access it.</p>
                </div>
            `;
            return;
        }

        // Clear any existing data first
        clearCustomerData();


        // Update the panel with the current conversation's data
        updateInformationPanel(lineUuid);
    } else {
        informationPanel.innerHTML = `
            <div class="error-state">
                <i class="fi fi-tr-exclamation"></i>
                <p>No active conversation selected. Please select a conversation to view customer information.</p>
            </div>
        `;
    }
}

// Analytics Modal Functions
let analyticsFirebaseListeners = [];
let analyticsDatabase = null;
let currentAnalyticsConversation = null;
let conversationChangeListener = null;
let lastKnownConversationStates = new Map(); // Track conversation element states

// Debug function to examine available conversation elements
window.debugConversations = function () {
    console.log('🔍 DEBUG: Scanning for conversation elements...');

    // Check for various possible conversation element patterns
    const selectors = [
        '[data-id]',
        '[data-line-uuid]',
        '[data-conversation-id]',
        '[data-user-id]',
        '.conversation-item',
        '.conversation',
        '.user-item',
        '.chat-item',
        '.line-user',
        '.contact-item',
        '.user-list-item',
        '[onclick*="loadChatHistory"]',
        '[onclick*="conversation"]',
        '[onclick*="chat"]',
        '[onclick*="user"]'
    ];

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`📋 Found ${elements.length} elements with selector "${selector}":`, elements);
            elements.forEach((el, index) => {
                const attrs = Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`);
                console.log(`  ${index + 1}. Tag: ${el.tagName}, Classes: ${el.className || 'none'}, Attributes: ${attrs.join(', ')}`);
                if (el.onclick) {
                    console.log(`    Onclick: ${el.onclick.toString().substring(0, 100)}...`);
                }
            });
        }
    });

    // Check for currently active/selected elements
    const activeSelectors = [
        '.active',
        '.selected',
        '.current',
        '.highlight',
        '.focused'
    ];

    activeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`🎯 Active elements with "${selector}":`, elements);
        }
    });

    console.log('🏁 Debug scan complete. Call debugConversations() again after clicking a conversation item.');
};

// Setup observer specifically for tracking display changes
function setupTrackingDisplayObserver() {
    if (window.trackingDisplayPoller) {
        clearInterval(window.trackingDisplayPoller);
        window.trackingDisplayPoller = null;
    }
}

// Manual debugging function to see what's selected when you switch conversations
window.debugCurrentSelection = function () {
    console.log('🔍 MANUAL DEBUG - Current conversation state:');

    // Check all possible selectors
    const selectors = [
        '.conversation-item.active',
        '.conversation-item.selected',
        '.conversation.active',
        '.active.conversation-item',
        '[data-id].active',
        '[data-id].selected',
        '.selected[data-id]',
        '.active[data-id]'
    ];

    selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`✅ Found with "${selector}":`, {
                element: element,
                dataId: element.getAttribute('data-id'),
                classes: element.className,
                style: window.getComputedStyle(element).backgroundColor
            });
        } else {
            console.log(`❌ No element found with "${selector}"`);
        }
    });

    // Show all conversation elements and their current state
    console.log('📋 All [data-id] elements:');
    document.querySelectorAll('[data-id]').forEach((el, index) => {
        const style = window.getComputedStyle(el);
        const isActive = el.classList.contains('active') ||
            el.classList.contains('selected') ||
            el.classList.contains('current');
        const hasVisualStyle = style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
            style.backgroundColor !== 'transparent' &&
            style.backgroundColor !== 'rgb(255, 255, 255)';

        console.log(`  ${index + 1}. ${el.getAttribute('data-id')} - Active: ${isActive}, Visual: ${hasVisualStyle}, BG: ${style.backgroundColor}, Classes: ${el.className}`);
    });

    // Show current tracking display
    const trackingDisplay = document.getElementById('tracking-display');
    if (trackingDisplay) {
        console.log('🎯 Tracking display currently shows:', trackingDisplay.textContent);
    }
};

// Function to update tracking display and automatically load new analytics
function updateTrackingDisplay(conversationId = null) {
    if (!conversationId && !currentAnalyticsConversation) {
        return;
    }

    const newConversationId = conversationId || currentAnalyticsConversation;

    if (conversationId) {
        console.log('🔄 Auto-loading analytics for conversation:', conversationId);
        console.log('🔄 Previous conversation was:', currentAnalyticsConversation);

        currentAnalyticsConversation = conversationId;

        const analyticsModal = document.querySelector('.analytics-overlay');
        const currentAnalyticsContainer = document.getElementById('current-analytics');

        if (analyticsModal && analyticsModal.style.display !== 'none' && currentAnalyticsContainer) {
            currentAnalyticsContainer.style.opacity = '0.5';
            currentAnalyticsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-sync fa-spin" style="font-size: 24px; color: #007cba; margin-bottom: 10px;"></i>
                    <p>Loading analytics for conversation ${conversationId}...</p>
                </div>
            `;

            setTimeout(() => {
                console.log('🚀 Loading analytics for:', conversationId);
                currentAnalyticsContainer.style.opacity = '1';
                loadCurrentConversationAnalytics(conversationId);
            }, 300);
        }
    }

    return newConversationId;
}
;

// Universal conversation state detection function
function detectActiveConversationByStateChange() {
    const analyticsModal = document.querySelector('.analytics-overlay');
    if (!analyticsModal || analyticsModal.style.display === 'none') {
        return null;
    }

    // Get all elements with data-id (potential conversations)
    const allConversationElements = document.querySelectorAll('[data-id]');
    const currentStates = new Map();
    let activeElement = null;
    let stateChangeDetected = false;

    // Analyze each conversation element's current state
    allConversationElements.forEach((element) => {
        const dataId = element.getAttribute('data-id');
        if (!dataId) return;

        // Capture comprehensive state information
        const computedStyle = window.getComputedStyle(element);
        const currentState = {
            classList: Array.from(element.classList).join(' '),
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            fontWeight: computedStyle.fontWeight,
            border: computedStyle.border,
            opacity: computedStyle.opacity,
            transform: computedStyle.transform,
            inlineStyle: element.style.cssText,
            hasActiveClass: element.classList.contains('active') ||
                element.classList.contains('selected') ||
                element.classList.contains('current'),
            isVisible: element.offsetWidth > 0 && element.offsetHeight > 0,
            boundingRect: element.getBoundingClientRect()
        };

        currentStates.set(dataId, currentState);

        // Compare with previous state
        const previousState = lastKnownConversationStates.get(dataId);
        if (previousState) {
            // Check if this element's state changed (indicating possible selection)
            const hasStateChanged =
                previousState.classList !== currentState.classList ||
                previousState.backgroundColor !== currentState.backgroundColor ||
                previousState.fontWeight !== currentState.fontWeight ||
                previousState.inlineStyle !== currentState.inlineStyle ||
                previousState.hasActiveClass !== currentState.hasActiveClass;

            if (hasStateChanged) {
                console.log(`🔄 State change detected for conversation ${dataId}:`, {
                    previous: previousState,
                    current: currentState
                });
                stateChangeDetected = true;

                // If this element gained active styling, it's likely the new active conversation
                if (!previousState.hasActiveClass && currentState.hasActiveClass) {
                    activeElement = element;
                    console.log(`✅ Element ${dataId} gained active state`);
                } else if (currentState.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                    currentState.backgroundColor !== 'transparent' &&
                    previousState.backgroundColor !== currentState.backgroundColor) {
                    activeElement = element;
                    console.log(`✅ Element ${dataId} gained background color: ${currentState.backgroundColor}`);
                }
            }
        }

        // Check if this element currently appears to be active/selected
        if (currentState.hasActiveClass ||
            (currentState.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                currentState.backgroundColor !== 'transparent' &&
                currentState.backgroundColor !== 'rgb(255, 255, 255)')) {
            if (!activeElement) {
                activeElement = element;
            }
        }
    });

    // Update our state tracking
    lastKnownConversationStates = currentStates;

    // If we found an active element, return its conversation ID
    if (activeElement) {
        const conversationId = activeElement.getAttribute('data-id') ||
            activeElement.getAttribute('data-line-uuid') ||
            activeElement.getAttribute('data-conversation-id') ||
            activeElement.getAttribute('data-uuid') ||
            activeElement.id;

        if (stateChangeDetected) {
            console.log(`🎯 Active conversation detected by state change: ${conversationId}`);
        }

        return conversationId;
    }

    return null;
};

function showAnalyticsModal() {
    const existingOverlay = document.querySelector('.analytics-overlay');
    if (existingOverlay) {
        existingOverlay.style.display = 'flex';
        setupTrackingDisplayObserver();
        loadAnalyticsData();
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'analytics-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    overlay.innerHTML = `
        <div class="analytics-popup" style="max-width: 900px; width: 90%; max-height: 80vh; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); overflow-y: auto;">
            <div class="analytics-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e0e0e0; position: sticky; top: 0; background: white; z-index: 1;">
                <h3 style="margin: 0; color: #333; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                    <i class="fi fi-tr-chart-histogram"></i> Conversation Analytics
                </h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button class="close-analytics" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 0; min-width: 30px; height: 30px;">&times;</button>
                </div>
            </div>
            <div class="analytics-content" style="padding: 20px;">
                <div class="analytics-tabs" style="display: flex; border-bottom: 1px solid #e0e0e0; margin-bottom: 20px;">
                    <button class="analytics-tab active" data-tab="current" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid #007cba; color: #007cba; cursor: pointer; font-weight: 500;">Current Conversation</button>
                    <button class="analytics-tab" data-tab="overall" style="padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; color: #666; cursor: pointer;">Overall Statistics</button>
                </div>
                <div class="analytics-tab-content" id="current-analytics">
                    <div class="loading-analytics" style="text-align: center; padding: 40px;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #007cba; margin-bottom: 10px;"></i>
                        <p>Analyzing current conversation...</p>
                    </div>
                </div>
                <div class="analytics-tab-content" id="overall-analytics" style="display: none;">
                    <div class="loading-analytics" style="text-align: center; padding: 40px;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #007cba; margin-bottom: 10px;"></i>
                        <p>Loading overall statistics...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Set up event listeners
    const closeBtn = overlay.querySelector('.close-analytics');
    closeBtn.addEventListener('click', () => {
        cleanupAnalyticsListeners();
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            cleanupAnalyticsListeners();
            overlay.style.display = 'none';
        }
    });

    // Tab switching
    const tabs = overlay.querySelectorAll('.analytics-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            switchAnalyticsTab(tabType);
        });
    });

    // Load analytics data
    loadAnalyticsData();
}

function cleanupAnalyticsListeners() {
    console.log('Cleaning up analytics listeners...', analyticsFirebaseListeners.length, 'listeners');
    analyticsFirebaseListeners.forEach(listener => {
        if (listener.intervalId) {
            clearInterval(listener.intervalId);
        }
    });
    analyticsFirebaseListeners = [];

    // Clean up conversation change listener
    if (conversationChangeListener) {
        document.removeEventListener('click', conversationChangeListener);
        conversationChangeListener = null;
    }
    currentAnalyticsConversation = null;
}

function cleanupCurrentConversationListeners() {
    console.log('Cleaning up current conversation listeners...');
    const remainingListeners = [];

    analyticsFirebaseListeners.forEach(listener => {
        if (listener.type === 'current-conversation') {
            if (listener.intervalId) {
                clearInterval(listener.intervalId);
                console.log('Removed current conversation listener');
            }
        } else {
            // Keep overall analytics listeners
            remainingListeners.push(listener);
        }
    });

    analyticsFirebaseListeners = remainingListeners;
}

// Function to detect conversation changes and update analytics
function setupConversationChangeDetection() {
    // Remove existing listener if any
    if (conversationChangeListener) {
        document.removeEventListener('click', conversationChangeListener);
    }

    conversationChangeListener = function (event) {
        // Enhanced debugging
        console.log('🖱️ Click detected on:', event.target);
        console.log('🏷️ Click target tag:', event.target.tagName);
        console.log('🎨 Click target classes:', event.target.className);
        console.log('📝 Click target ID:', event.target.id);

        // Log all attributes of clicked element
        if (event.target.attributes) {
            const attrs = Array.from(event.target.attributes).map(attr => `${attr.name}="${attr.value}"`);
            console.log('🔧 Click target attributes:', attrs.join(', '));
        }

        // Log all parent elements up to body
        let parentChain = [];
        let element = event.target;
        while (element && element !== document.body) {
            parentChain.push({
                tag: element.tagName,
                classes: element.className,
                id: element.id,
                attributes: element.attributes ? Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ') : 'none'
            });
            element = element.parentElement;
        }
        console.log('🏗️ Parent chain:', parentChain);

        // Try multiple ways to find conversation items
        const possibleSelectors = [
            '.conversation-item',
            '[data-id]',
            '.conversation',
            '.conversation-list-item',
            '.chat-item',
            '.user-item',
            '.line-user',
            '[data-line-uuid]',
            '[data-conversation-id]',
            '.user-list-item',
            '.chat-user',
            '.contact-item',
            '[onclick*="loadChatHistory"]',
            '[onclick*="conversation"]',
            '[onclick*="chat"]'
        ];

        let conversationItem = null;
        for (const selector of possibleSelectors) {
            conversationItem = event.target.closest(selector);
            if (conversationItem) {
                console.log('✅ Found conversation item with selector:', selector, conversationItem);
                break;
            }
        }

        // Also try to find any parent element with data attributes or onClick handlers
        if (!conversationItem) {
            let element = event.target;
            while (element && element !== document.body) {
                if (element.hasAttribute && (
                    element.hasAttribute('data-id') ||
                    element.hasAttribute('data-line-uuid') ||
                    element.hasAttribute('data-conversation-id') ||
                    element.hasAttribute('onclick') ||
                    element.className?.includes('conversation') ||
                    element.className?.includes('chat') ||
                    element.className?.includes('user') ||
                    element.className?.includes('contact')
                )) {
                    conversationItem = element;
                    console.log('✅ Found conversation item by traversing:', conversationItem);
                    break;
                }
                element = element.parentElement;
            }
        }

        if (conversationItem) {
            console.log('Conversation item found:', conversationItem);
            console.log('All attributes:', Array.from(conversationItem.attributes).map(attr => `${attr.name}="${attr.value}"`));

            // Get the lineUuid from various possible attributes
            let newLineUuid = conversationItem.getAttribute('data-id') ||
                conversationItem.getAttribute('data-line-uuid') ||
                conversationItem.getAttribute('data-conversation-id') ||
                conversationItem.getAttribute('data-uuid') ||
                conversationItem.getAttribute('data-user-id') ||
                conversationItem.id;

            console.log('Extracted lineUuid:', newLineUuid);
            console.log('Current tracked conversation:', currentAnalyticsConversation);

            // Check if this is a different conversation
            if (newLineUuid && newLineUuid !== currentAnalyticsConversation) {
                console.log('🔄 Click detected conversation change from', currentAnalyticsConversation, 'to', newLineUuid);
                // updateTrackingDisplay will handle both display update and analytics loading
                updateTrackingDisplay(newLineUuid);
            }
        }
    };

    // Add the event listener to document to catch all clicks
    document.addEventListener('click', conversationChangeListener, true);

    // Add ultra-aggressive conversation change detection
    let lastDetectedConversation = null;

    const ultraAggressiveCheck = setInterval(() => {
        const analyticsModal = document.querySelector('.analytics-overlay');
        if (!analyticsModal || analyticsModal.style.display === 'none') {
            clearInterval(ultraAggressiveCheck);
            return;
        }

        // Method 1: Direct tracking display monitoring
        const trackingDisplay = document.getElementById('tracking-display');
        let conversationFromTracking = null;
        if (trackingDisplay) {
            const match = trackingDisplay.textContent.match(/Tracking:\s*(.+)/);
            if (match) {
                conversationFromTracking = match[1].trim();
            }
        }

        // Method 2: State change detection
        let conversationFromState = detectActiveConversationByStateChange();

        // Method 3: Traditional selectors
        let conversationFromSelectors = null;
        const selectorTests = [
            '.conversation-item.active',
            '.conversation-item.selected',
            '.conversation.active',
            '.active.conversation-item',
            '[data-id].active',
            '[data-id].selected',
            '.selected[data-id]',
            '.active[data-id]'
        ];

        for (const selector of selectorTests) {
            const element = document.querySelector(selector);
            if (element) {
                conversationFromSelectors = element.getAttribute('data-id') ||
                    element.getAttribute('data-line-uuid') ||
                    element.getAttribute('data-conversation-id') ||
                    element.getAttribute('data-uuid') ||
                    element.id;
                if (conversationFromSelectors) break;
            }
        }

        // Method 4: Visual style analysis
        let conversationFromVisual = null;
        const allElements = document.querySelectorAll('[data-id]');
        for (const element of allElements) {
            const style = window.getComputedStyle(element);
            const isVisuallyActive = element.classList.contains('active') ||
                element.classList.contains('selected') ||
                element.classList.contains('current') ||
                (style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                    style.backgroundColor !== 'transparent' &&
                    style.backgroundColor !== 'rgb(255, 255, 255)') ||
                style.fontWeight === 'bold' ||
                style.fontWeight === '700' ||
                style.fontWeight === '600';

            if (isVisuallyActive) {
                conversationFromVisual = element.getAttribute('data-id') ||
                    element.getAttribute('data-line-uuid') ||
                    element.getAttribute('data-conversation-id') ||
                    element.getAttribute('data-uuid') ||
                    element.id;
                if (conversationFromVisual) break;
            }
        }

        // Priority: tracking display > state > selectors > visual
        const detectedConversation = conversationFromTracking ||
            conversationFromState ||
            conversationFromSelectors ||
            conversationFromVisual;

        // Log detection results only when something changes to avoid spam
        const currentDetectionHash = JSON.stringify({
            tracking: conversationFromTracking,
            state: conversationFromState,
            selectors: conversationFromSelectors,
            visual: conversationFromVisual,
            final: detectedConversation
        });

        if (window.lastDetectionHash !== currentDetectionHash) {
            console.log('🔍 Detection results changed:', {
                tracking: conversationFromTracking,
                state: conversationFromState,
                selectors: conversationFromSelectors,
                visual: conversationFromVisual,
                final: detectedConversation,
                current: currentAnalyticsConversation
            });
            window.lastDetectionHash = currentDetectionHash;

            // Also log all conversation elements to debug what's available
            console.log('📋 All conversation elements in DOM:');
            const allConversationElements = document.querySelectorAll('[data-id]');
            allConversationElements.forEach((el, index) => {
                const style = window.getComputedStyle(el);
                console.log(`  ${index + 1}. ID: ${el.getAttribute('data-id')}, Classes: ${el.className}, BgColor: ${style.backgroundColor}, Active: ${el.classList.contains('active')}, Selected: ${el.classList.contains('selected')}`);
            });
        }

        // If we detected a conversation change, force update immediately
        if (detectedConversation && detectedConversation !== lastDetectedConversation) {
            console.log('🚨 CONVERSATION CHANGE DETECTED!');
            console.log('🚨 From:', lastDetectedConversation, '→ To:', detectedConversation);

            lastDetectedConversation = detectedConversation;

            // Force immediate analytics update using the same logic as refresh button
            if (detectedConversation !== currentAnalyticsConversation) {
                console.log('🔥 FORCING AUTO-UPDATE WITH loadAnalyticsData()');
                currentAnalyticsConversation = detectedConversation;

                // Update tracking display
                const trackingDisplay = document.getElementById('tracking-display');
                if (trackingDisplay) {
                    trackingDisplay.textContent = `Tracking: ${detectedConversation}`;
                    trackingDisplay.style.color = '#28a745';
                }

                // Force reload analytics using same method as refresh button
                const currentAnalyticsContainer = document.getElementById('current-analytics');
                if (currentAnalyticsContainer) {
                    currentAnalyticsContainer.style.opacity = '0.5';
                    currentAnalyticsContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-sync fa-spin" style="font-size: 24px; color: #007cba; margin-bottom: 10px;"></i>
                            <p><strong>Auto-detected conversation change!</strong></p>
                            <p>Loading: ${detectedConversation}</p>
                        </div>
                    `;

                    setTimeout(() => {
                        console.log('🚀 AUTO-EXECUTING loadAnalyticsData()');
                        currentAnalyticsContainer.style.opacity = '1';
                        loadAnalyticsData(); // Same as refresh button!
                    }, 100);
                }
            }
        }
    }, 300); // Check every 300ms for ultra-responsive detection

    // Add MutationObserver to detect DOM changes (like class changes on conversation elements)
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;

        mutations.forEach((mutation) => {
            // Check if any conversation-related elements had their attributes or classes changed
            if (mutation.type === 'attributes' &&
                (mutation.attributeName === 'class' ||
                    mutation.attributeName === 'style' ||
                    mutation.attributeName === 'data-id')) {

                const element = mutation.target;
                if (element.hasAttribute('data-id') ||
                    element.className?.includes('conversation') ||
                    element.className?.includes('chat') ||
                    element.className?.includes('user') ||
                    element.className?.includes('active') ||
                    element.className?.includes('selected')) {
                    shouldCheck = true;
                }
            }

            // Also check if new conversation elements were added
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.hasAttribute && node.hasAttribute('data-id')) {
                            shouldCheck = true;
                        }
                        // Check if any child elements have data-id
                        const hasConversationElements = node.querySelectorAll && node.querySelectorAll('[data-id]').length > 0;
                        if (hasConversationElements) {
                            shouldCheck = true;
                        }
                    }
                });
            }
        });

        if (shouldCheck) {
            // Debounce the check to avoid excessive calls
            clearTimeout(window.analyticsCheckTimeout);
            window.analyticsCheckTimeout = setTimeout(() => {
                const analyticsModal = document.querySelector('.analytics-overlay');
                if (analyticsModal && analyticsModal.style.display !== 'none') {
                    console.log('🔍 DOM change detected, checking for conversation change...');

                    // Use state change detection for most accurate results
                    let lineUuid = detectActiveConversationByStateChange();

                    // Fallback to selector-based detection if state detection doesn't work
                    if (!lineUuid) {
                        let currentConversation = document.querySelector('.conversation-item.active');

                        if (!currentConversation) {
                            currentConversation = document.querySelector('.conversation-item.selected') ||
                                document.querySelector('.conversation.active') ||
                                document.querySelector('.active.conversation-item') ||
                                document.querySelector('[data-id].active') ||
                                document.querySelector('[data-id].selected') ||
                                document.querySelector('.selected[data-id]') ||
                                document.querySelector('.active[data-id]');
                        }

                        lineUuid = currentConversation?.getAttribute('data-id');

                        if (!lineUuid && currentConversation) {
                            lineUuid = currentConversation.getAttribute('data-line-uuid') ||
                                currentConversation.getAttribute('data-conversation-id') ||
                                currentConversation.getAttribute('data-uuid') ||
                                currentConversation.getAttribute('data-user-id') ||
                                currentConversation.id;
                        }
                    }

                    if (lineUuid && lineUuid !== currentAnalyticsConversation) {
                        console.log('🔍 DOM observer detected conversation change:', currentAnalyticsConversation, '→', lineUuid);
                        // updateTrackingDisplay will handle both display update and analytics loading
                        updateTrackingDisplay(lineUuid);
                    }
                }
            }, 100); // 100ms debounce
        }
    });

    // Start observing the document for changes
    observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['class', 'style', 'data-id']
    });

    // Clean up observer when modal is closed
    const originalCleanup = cleanupAnalyticsListeners;
    cleanupAnalyticsListeners = function () {
        observer.disconnect();
        clearTimeout(window.analyticsCheckTimeout);

        // Clean up tracking display polling
        if (window.trackingDisplayPoller) {
            clearInterval(window.trackingDisplayPoller);
            window.trackingDisplayPoller = null;
        }

        originalCleanup();
    };

    console.log('Conversation change detection setup complete (click + periodic + DOM observer)');
}

// Throttle function to prevent too many updates
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

function switchAnalyticsTab(tabType) {
    const tabs = document.querySelectorAll('.analytics-tab');
    const contents = document.querySelectorAll('.analytics-tab-content');

    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabType) {
            tab.classList.add('active');
            tab.style.borderBottomColor = '#007cba';
            tab.style.color = '#007cba';
        } else {
            tab.classList.remove('active');
            tab.style.borderBottomColor = 'transparent';
            tab.style.color = '#666';
        }
    });

    contents.forEach(content => {
        if (content.id === tabType + '-analytics') {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
}

async function loadAnalyticsData() {
    // Try multiple ways to detect current conversation
    let currentConversation = document.querySelector('.conversation-item.active');

    // If that doesn't work, try other possible selectors
    if (!currentConversation) {
        currentConversation = document.querySelector('.conversation-item.selected') ||
            document.querySelector('.conversation.active') ||
            document.querySelector('.active.conversation-item') ||
            document.querySelector('[data-id].active');
    }

    let lineUuid = currentConversation?.getAttribute('data-id');

    // If still no lineUuid, try to get it from other sources
    if (!lineUuid && currentConversation) {
        lineUuid = currentConversation.getAttribute('data-line-uuid') ||
            currentConversation.getAttribute('data-conversation-id') ||
            currentConversation.id;
    }

    console.log('Analytics Debug - Current conversation:', currentConversation);
    console.log('Analytics Debug - Line UUID:', lineUuid);
    console.log('Analytics Debug - Available conversations:', document.querySelectorAll('[data-id]'));

    if (lineUuid && lineUuid.trim() !== '') {
        currentAnalyticsConversation = lineUuid; // Track the current conversation
        updateTrackingDisplay(lineUuid);
        await loadCurrentConversationAnalytics(lineUuid);
    } else {
        updateTrackingDisplay(null);
        const currentContent = document.getElementById('current-analytics');
        if (currentContent) {
            currentContent.innerHTML = `
                <div class="no-conversation" style="text-align: center; padding: 40px;">
                    <i class="fi fi-tr-exclamation" style="font-size: 48px; color: #ffa500; margin-bottom: 20px;"></i>
                    <h3 style="color: #333;">No Conversation Selected</h3>
                    <p style="color: #666;">Please select a conversation to view its analytics.</p>
                </div>
            `;
        }
    }

    await loadOverallAnalytics();

    // Setup conversation change detection
    setupConversationChangeDetection();
}

async function loadCurrentConversationAnalytics(lineUuid) {
    const container = document.getElementById('current-analytics');
    if (!container) return;

    console.log('Setting up polling analytics for conversation:', lineUuid);

    // Clean up any existing current conversation listeners first
    cleanupCurrentConversationListeners();

    const fetchAndUpdate = async () => {
        try {
            const response = await fetch(`/api/line-conversations?lineUuid=${encodeURIComponent(lineUuid)}`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('API HTTP ' + response.status);
            const raw = await response.json();
            const arr = Array.isArray(raw) ? raw : (Array.isArray(raw && raw.data) ? raw.data : []);

            const messages = arr.map(value => {
                const messageText = value.userInput || value.message || value.aiResponse || '';
                if (!messageText.trim()) return null;
                const timestamp = value.date ? new Date(value.date).getTime() :
                    value.timestamp ? new Date(value.timestamp).getTime() :
                    value.created_at ? new Date(value.created_at).getTime() : Date.now();
                const isFromCustomer = !value.aiResponse && !value.ai_response &&
                    !value.botResponse && !value.bot_response &&
                    (value.userInput || value.user_input || value.isFromUser ||
                        (!value.fromBot && !value.from_bot));
                return {
                    text: messageText.trim(),
                    timestamp,
                    isFromCustomer,
                    messageType: value.aiResponse || value.ai_response ? 'ai' : 'user'
                };
            }).filter(Boolean);

            messages.sort((a, b) => a.timestamp - b.timestamp);
            console.log('Polling update - Messages count:', messages.length);

            if (messages.length === 0) {
                container.innerHTML = `
                    <div class="no-data" style="text-align: center; padding: 40px;">
                    <i class="fi fi-tr-comment" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #666;">No Messages Found</h3>
                    <p style="color: #999;">This conversation doesn't have any messages yet.</p>
                    <div style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 4px; font-size: 12px; color: #666;">
                        Live monitoring: Waiting for messages...
                    </div>
                </div>
            `;
                return;
            }

            const analytics = processConversationAnalytics(messages);
            displayCurrentConversationAnalytics(analytics, container, true); // true = live mode

        } catch (error) {
            console.error('Error in polling analytics update:', error);
            container.innerHTML = `
                <div class="error-analytics" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ff4444; margin-bottom: 20px;"></i>
                    <h3 style="color: #333;">Error in Live Analytics</h3>
                    <p style="color: #666;">${error.message}</p>
                    <button onclick="loadCurrentConversationAnalytics('${lineUuid}')" style="background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Restart Live Monitoring</button>
                </div>
            `;
        }
    };

    // Initial fetch
    await fetchAndUpdate();

    // Poll every 10 seconds
    const intervalId = setInterval(fetchAndUpdate, 10000);

    // Track the interval for cleanup
    analyticsFirebaseListeners.push({ intervalId, type: 'current-conversation' });

    console.log('Polling analytics established (10s interval)');
}

function processConversationAnalytics(messages) {
    const customerMessages = messages.filter(msg => msg.isFromCustomer);
    const agentMessages = messages.filter(msg => !msg.isFromCustomer);

    // Basic stats
    const totalMessages = messages.length;
    const customerMessageCount = customerMessages.length;
    const agentMessageCount = agentMessages.length;

    // Time analysis
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const conversationDuration = lastMessage.timestamp - firstMessage.timestamp;

    // Response time analysis
    const responseTimes = [];
    for (let i = 1; i < messages.length; i++) {
        const currentMsg = messages[i];
        const previousMsg = messages[i - 1];

        // If agent responds to customer
        if (!currentMsg.isFromCustomer && previousMsg.isFromCustomer) {
            const responseTime = currentMsg.timestamp - previousMsg.timestamp;
            responseTimes.push(responseTime);
        }
    }

    const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    // Text analysis
    const customerText = customerMessages.map(msg => msg.text.toLowerCase()).join(' ');
    const commonWords = extractCommonWords(customerText);
    const sentiment = analyzeSentiment(customerText);

    return {
        totalMessages,
        customerMessageCount,
        agentMessageCount,
        conversationDuration,
        avgResponseTime,
        responseTimes,
        commonWords,
        sentiment,
        firstMessage: firstMessage.timestamp,
        lastMessage: lastMessage.timestamp
    };
}

function extractCommonWords(text) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];

    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));

    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
}

function analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'satisfied', 'perfect', 'awesome', 'brilliant'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'problem', 'issue', 'wrong', 'error', 'broken'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
}

function displayCurrentConversationAnalytics(analytics, container, isLive = false) {
    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
    };

    const formatResponseTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const liveIndicator = isLive ? `
        <div style="background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.05)); padding: 14px 18px; border-radius: 14px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; gap: 12px; border: 1px solid rgba(34, 197, 94, 0.25);">
            <span style="width: 10px; height: 10px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,0.15);"></span>
            <span style="font-size: 14px; color: #0f172a;">Last updated</span>
            <span style="font-family: 'SFMono-Regular', ui-monospace, SFMono, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 14px; color: #0f172a;">${new Date().toLocaleTimeString()}</span>
        </div>
    ` : '';

    container.innerHTML = `
        ${liveIndicator}
        <div class="analytics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="analytics-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #007cba; margin-bottom: 5px;">${analytics.totalMessages}</div>
                <div style="color: #666; font-size: 14px;">Total Messages</div>
            </div>
            <div class="analytics-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #28a745; margin-bottom: 5px;">${analytics.customerMessageCount}</div>
                <div style="color: #666; font-size: 14px;">Customer Messages</div>
            </div>
            <div class="analytics-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #dc3545; margin-bottom: 5px;">${analytics.agentMessageCount}</div>
                <div style="color: #666; font-size: 14px;">Agent Responses</div>
            </div>
            <div class="analytics-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #ffc107; margin-bottom: 5px;">${formatDuration(analytics.conversationDuration)}</div>
                <div style="color: #666; font-size: 14px;">Duration</div>
            </div>
        </div>
        
        <div class="analytics-sections" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="analytics-section">
                <h4 style="margin-bottom: 15px; color: #333;">Response Time</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #007cba; margin-bottom: 5px;">
                        ${analytics.avgResponseTime > 0 ? formatResponseTime(analytics.avgResponseTime) : 'N/A'}
                    </div>
                    <div style="color: #666; font-size: 14px;">Average Response Time</div>
                    <div style="margin-top: 10px; font-size: 12px; color: #999;">
                        ${analytics.responseTimes.length} responses analyzed
                    </div>
                </div>
            </div>
            
            <div class="analytics-section">
                <h4 style="margin-bottom: 15px; color: #333;">Sentiment Analysis</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: ${analytics.sentiment === 'Positive' ? '#28a745' : analytics.sentiment === 'Negative' ? '#dc3545' : '#ffc107'}; margin-bottom: 5px;">
                        ${analytics.sentiment}
                    </div>
                    <div style="color: #666; font-size: 14px;">Overall Tone</div>
                    <div style="margin-top: 10px; font-size: 12px; color: #999;">
                        Based on keyword analysis
                    </div>
                </div>
            </div>
        </div>
        
        ${analytics.commonWords.length > 0 ? `
        <div class="analytics-section">
            <h4 style="margin-bottom: 15px; color: #333;">Most Common Words</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <div style="display: flex; flex-wrap: gap: 10px;">
                    ${analytics.commonWords.map(({ word, count }) => `
                        <span style="background: #007cba; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">
                            ${word} (${count})
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="analytics-section">
            <h4 style="margin-bottom: 15px; color: #333;">Timeline</h4>
            <div style="background: #f8f9fa; padding: 18px 20px; border-radius: 14px; display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Started</span>
                        <span style="font-size: 15px; font-weight: 600; color: #0f172a;">${new Date(analytics.firstMessage).toLocaleString()}</span>
                    </div>
                    <i class="fas fa-flag-checkered" style="color: #3b82f6;"></i>
                </div>
                <div style="height: 1px; background: rgba(148, 163, 184, 0.35);"></div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Last activity</span>
                        <span style="font-size: 15px; font-weight: 600; color: #0f172a;">${new Date(analytics.lastMessage).toLocaleString()}</span>
                    </div>
                    <i class="fas fa-bolt" style="color: #f59e0b;"></i>
                </div>
            </div>
        </div>
    `;
}

async function loadOverallAnalytics() {
    const container = document.getElementById('overall-analytics');
    if (!container) return;

    console.log('Setting up polling overall analytics...');

    const fetchAndUpdate = async () => {
        try {
            console.log('Polling update - Overall analytics data');
            const backendStats = await fetchBackendAnalytics();
            displayOverallAnalytics(backendStats, container, true); // true = live mode
        } catch (error) {
            console.error('Error in polling overall analytics update:', error);
            container.innerHTML = `
                <div class="error-analytics" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ff4444; margin-bottom: 20px;"></i>
                    <h3 style="color: #333;">Error in Live Overall Analytics</h3>
                    <p style="color: #666;">${error.message}</p>
                    <button onclick="loadOverallAnalytics()" style="background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Restart Live Monitoring</button>
                </div>
            `;
        }
    };

    // Initial fetch
    await fetchAndUpdate();

    // Poll every 30 seconds
    const intervalId = setInterval(fetchAndUpdate, 30000);

    // Track the interval for cleanup
    analyticsFirebaseListeners.push({ intervalId, type: 'overall-analytics' });

    console.log('Overall analytics polling established (30s interval)');
}

// Function to fetch analytics data from Laravel backend
async function fetchBackendAnalytics() {
    try {
        const response = await fetch('/api/analytics?tab=chat&date_range=last_7_days', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const chatSummary = data.chatSummary || {};

        // Use actual daily breakdown from backend and normalize structure
        const recentActivityRaw = chatSummary.recent_activity;
        const recentActivity = Array.isArray(recentActivityRaw)
            ? recentActivityRaw.map(item => ({
                date: item.date || '',
                isoDate: item.isoDate || item.iso_date || '',
                messages: Number(item.messages ?? 0),
                conversations: Number(item.conversations ?? 0)
            }))
            : [];

        const todayIso = new Date().toISOString().split('T')[0];
        const activeTodayEntry = recentActivity.find(item => item.isoDate === todayIso);
        const activeToday = activeTodayEntry ? activeTodayEntry.messages : 0;

        // Normalize peak hours data from backend object structure
        const hourlyBreakdown = Array.isArray(chatSummary.peak_hours?.hourly_breakdown)
            ? chatSummary.peak_hours.hourly_breakdown
            : [];

        const topHours = hourlyBreakdown
            .map(({ hour, count }) => {
                const parsedHour = typeof hour === 'string'
                    ? parseInt(hour.split(':')[0], 10)
                    : Number.isFinite(hour)
                        ? hour
                        : 0;
                return {
                    hour: Number.isFinite(parsedHour) ? parsedHour : 0,
                    count: Number(count ?? 0)
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalConversations: chatSummary.total_chats || 0,
            totalMessages: chatSummary.messages_received || 0,
            activeToday,
            avgMessagesPerConversation: chatSummary.total_chats > 0
                ? Math.round(((chatSummary.messages_received || 0) / chatSummary.total_chats) * 10) / 10
                : 0,
            topHours,
            recentActivity
        };
    } catch (error) {
        console.error('Error fetching backend analytics:', error);
        throw error;
    }
}

function processOverallAnalytics(data) {
    if (!data) {
        return {
            totalConversations: 0,
            totalMessages: 0,
            activeToday: 0,
            avgMessagesPerConversation: 0,
            topHours: [],
            recentActivity: []
        };
    }

    const conversations = new Set();
    const messages = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process all Firebase data
    const processMessage = (obj) => {
        if (!obj || typeof obj !== 'object') return;

        Object.entries(obj).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                if (value.lineUuid && (value.userInput || value.message || value.aiResponse)) {
                    const lineUuid = value.lineUuid;
                    conversations.add(lineUuid);

                    const msgDate = value.date ? new Date(value.date) : new Date();
                    messages.push({
                        lineUuid,
                        timestamp: msgDate.getTime(),
                        isFromCustomer: !value.aiResponse,
                        hour: msgDate.getHours(),
                        date: msgDate.toDateString()
                    });
                }
                processMessage(value);
            }
        });
    };

    processMessage(data);

    // Calculate stats
    const totalConversations = conversations.size;
    const totalMessages = messages.length;
    const activeToday = messages.filter(msg =>
        new Date(msg.timestamp).toDateString() === today.toDateString()
    ).length;

    const avgMessagesPerConversation = totalConversations > 0
        ? Math.round(totalMessages / totalConversations)
        : 0;

    // Hour analysis
    const hourCounts = {};
    messages.forEach(msg => {
        hourCounts[msg.hour] = (hourCounts[msg.hour] || 0) + 1;
    });

    const topHours = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayMessages = messages.filter(msg =>
            msg.timestamp >= date.getTime() && msg.timestamp < nextDate.getTime()
        );

        recentActivity.push({
            date: date.toLocaleDateString(),
            messages: dayMessages.length,
            conversations: new Set(dayMessages.map(m => m.lineUuid)).size
        });
    }

    return {
        totalConversations,
        totalMessages,
        activeToday,
        avgMessagesPerConversation,
        topHours,
        recentActivity
    };
}

function displayOverallAnalytics(stats, container, isLive = false) {
    const liveIndicator = isLive ? `
        <div style="background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.05)); padding: 14px 18px; border-radius: 14px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; gap: 12px; border: 1px solid rgba(34, 197, 94, 0.25);">
            <span style="width: 10px; height: 10px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,0.15);"></span>
            <span style="font-size: 14px; color: #0f172a;">Last updated</span>
            <span style="font-family: 'SFMono-Regular', ui-monospace, SFMono, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 14px; color: #0f172a;">${new Date().toLocaleTimeString()}</span>
        </div>
    ` : '';

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const todayIso = todayMidnight.toISOString().split('T')[0];

    const formatActivityDay = (isoDate, fallback) => {
        if (!isoDate) {
            return fallback;
        }

        const dateObj = new Date(isoDate);
        if (Number.isNaN(dateObj.getTime())) {
            return fallback;
        }

        const targetMidnight = new Date(dateObj);
        targetMidnight.setHours(0, 0, 0, 0);
        const diffDays = Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays === 0) {
            return 'Today';
        }

        if (diffDays === -1) {
            return 'Yesterday';
        }

        return dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    };

    const formatActivityDate = (isoDate, fallback) => {
        if (!isoDate) {
            return fallback;
        }

        const dateObj = new Date(isoDate);
        if (Number.isNaN(dateObj.getTime())) {
            return fallback;
        }

        return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const recentActivityMarkup = stats.recentActivity.map(({ date, isoDate, messages, conversations }) => {
        const isToday = isoDate === todayIso;
        const hasActivity = (messages ?? 0) > 0 || (conversations ?? 0) > 0;

        const dayLabel = formatActivityDay(isoDate, date);
        const fullDateLabel = formatActivityDate(isoDate, date);

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 14px 18px; border-radius: 16px; background: rgba(248, 250, 252, 0.8); border: 1px solid rgba(148, 163, 184, 0.2);">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <span style="width: 10px; height: 10px; border-radius: 999px; background: #6366f1; box-shadow: 0 0 0 4px #6366f11a;"></span>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${dayLabel}</span>
                        <span style="font-size: 12px; color: #64748b;">${fullDateLabel}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; color: #1d4ed8; background: rgba(37, 99, 235, 0.12);">
                        <i class="fas fa-comments"></i>
                        ${conversations} chats
                    </span>
                    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; color: #16a34a; background: rgba(22, 163, 74, 0.12);">
                        <i class="fas fa-envelope-open-text"></i>
                        ${messages} msgs
                    </span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        ${liveIndicator}
        <div class="analytics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="analytics-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #007cba; margin-bottom: 5px;">${stats.totalConversations}</div>
                <div style="color: #666; font-size: 14px;">Total Conversations</div>
            </div>
            <div class="analytics-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #28a745; margin-bottom: 5px;">${stats.totalMessages}</div>
                <div style="color: #666; font-size: 14px;">Total Messages</div>
            </div>
            <div class="analytics-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #dc3545; margin-bottom: 5px;">${stats.activeToday}</div>
                <div style="color: #666; font-size: 14px;">Messages Today</div>
            </div>
            <div class="analytics-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #ffc107; margin-bottom: 5px;">${stats.avgMessagesPerConversation}</div>
                <div style="color: #666; font-size: 14px;">Avg Messages/Chat</div>
            </div>
        </div>
        
        <div class="analytics-sections" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="analytics-section">
                <h4 style="margin-bottom: 15px; color: #333;">Peak Hours</h4>
                <div style="background: rgba(248, 250, 252, 0.8); padding: 18px 20px; border-radius: 18px; display: flex; flex-direction: column; gap: 12px;">
                    ${stats.topHours.length > 0 ? stats.topHours.map(({ hour, count }, idx) => {
        const isTop = idx === 0;
        const cardBg = isTop ? 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(14,165,233,0.08))' : 'rgba(241, 245, 249, 0.85)';
        const borderColor = isTop ? 'rgba(14, 165, 233, 0.45)' : 'rgba(148, 163, 184, 0.18)';
        const indicatorColor = isTop ? '#0ea5e9' : '#6366f1';

        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 14px 18px; border-radius: 16px; background: ${cardBg}; border: 1px solid ${borderColor};">
                                <div style="display: flex; align-items: center; gap: 14px;">
                                    <span style="width: 10px; height: 10px; border-radius: 999px; background: ${indicatorColor}; box-shadow: 0 0 0 4px ${indicatorColor}1a;"></span>
                                    <div style="display: flex; flex-direction: column;">
                                        <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${hour}:00 - ${hour + 1}:00</span>
                                        <span style="font-size: 12px; color: #64748b;">${isTop ? 'Busiest hour' : 'Steady chats'}</span>
                                    </div>
                                </div>
                                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; color: #0f172a; background: rgba(15, 23, 42, 0.07);">
                                    <i class="fas fa-chart-line"></i>
                                    ${count} interactions
                                </span>
                            </div>
                        `;
    }).join('') : '<p style="color: #666; text-align: center;">No data available</p>'}
                </div>
            </div>
            
            <div class="analytics-section">
                <h4 style="margin-bottom: 15px; color: #333;">Recent Activity (7 Days)</h4>
                <div style="background: rgba(248, 250, 252, 0.8); padding: 18px 20px; border-radius: 18px; display: flex; flex-direction: column; gap: 12px;">
                    ${recentActivityMarkup}
                </div>
            </div>
        </div>
    `;
}

// Function to populate conversation meta data (assignment)
function populateConversationMeta(lineUuid) {
    if (!lineUuid) return;

    // Get assignment data from assignment manager
    let assignment = null;
    if (window.assignmentManager) {
        assignment = window.assignmentManager.getAssignment(lineUuid);
    }

    // Update assignment display with correct data structure
    const assignmentPlaceholder = document.querySelector('.customer-profile .assignment-placeholder');
    if (assignmentPlaceholder) {
        if (assignment && assignment.userName) {
            assignmentPlaceholder.innerHTML = `
                <div class="assigned-display">
                    <span>${assignment.userName} <small class="role-label">${assignment.userRole || 'Sales'}</small></span>
                </div>
            `;
        } else {
            assignmentPlaceholder.innerHTML = `
                <div class="unassigned-display">
                    <span>Unassigned</span>
                </div>
            `;
        }
    }

    // Add click event to open assignment dropdown using existing system
    const assignToDisplay = document.querySelector('.customer-profile .assigned-display.cstm-profile');
    if (assignToDisplay && window.assignmentManager) {
        assignToDisplay.addEventListener('click', function (event) {
            event.stopPropagation();
            showAssignmentDropdown(lineUuid, assignToDisplay);
        });
    }
}

// Function to update customer profile assignment display (called after assignment changes)
function updateCustomerProfileAssignment(lineUuid) {
    if (!lineUuid) return;

    const assignmentPlaceholder = document.querySelector('.customer-profile .assignment-placeholder');
    if (!assignmentPlaceholder) return;

    // Get current assignment from assignment manager
    const assignment = window.assignmentManager?.getAssignment(lineUuid);

    if (assignment && assignment.userName) {
        assignmentPlaceholder.innerHTML = `
            <div class="assigned-display">
                <span>${assignment.userName} <small class="role-label">${assignment.userRole || 'Sales'}</small></span>
            </div>
        `;
    } else {
        assignmentPlaceholder.innerHTML = `
            <div class="unassigned-display">
                <span>Unassigned</span>
            </div>
        `;
    }

    // Re-add click event to maintain functionality
    const assignToDisplay = document.querySelector('.customer-profile .assigned-display.cstm-profile');
    if (assignToDisplay) {
        // Remove existing listeners to prevent duplicates
        const newAssignToDisplay = assignToDisplay.cloneNode(true);
        assignToDisplay.parentNode.replaceChild(newAssignToDisplay, assignToDisplay);

        newAssignToDisplay.addEventListener('click', function (event) {
            event.stopPropagation();
            showAssignmentDropdown(lineUuid, newAssignToDisplay);
        });
    }
}

// Listen for assignment changes and update customer profile
document.addEventListener('DOMContentLoaded', function () {
    // Set up observer for assignment changes
    if (window.assignmentManager) {
        // Override the setAssignment method to also update customer profile
        const originalSetAssignment = window.assignmentManager.setAssignment.bind(window.assignmentManager);
        window.assignmentManager.setAssignment = async function (lineUuid, teamMember) {
            try {
                // Call original method
                await originalSetAssignment(lineUuid, teamMember);
                // Update customer profile display
                updateCustomerProfileAssignment(lineUuid);
            } catch (error) {
                console.error('Assignment update failed:', error);
                throw error;
            }
        };
    }
});