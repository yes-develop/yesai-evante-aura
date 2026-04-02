// AI Chat Class
class AIChat {
    constructor() {
        this.messageContainer = document.querySelector('.chat-messages');
        this.messageInput = document.querySelector('#messageInput');
        this.sendButton = document.querySelector('#sendMessage');
        this.typingIndicator = document.querySelector('.typing-indicator');
        this.webhookUrl = (window.AppConfig && window.AppConfig.MAKE_WEBHOOK_AI_CHAT_URL) || '';
        this.setupEventListeners();
        this.initializeScrollbar();
    }

    setupEventListeners() {
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    initializeScrollbar() {
        if (this.messageContainer) {
            new PerfectScrollbar(this.messageContainer);
        }
    }

    sendMessage() {
        if (!this.messageInput) return;
        
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.showTypingIndicator();

        // Send message to webhook
        fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                timestamp: new Date().toISOString()
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            this.hideTypingIndicator();
            // Check if the response is just "Accepted"
            if (data.trim() === 'Accepted') {
                // Show animated typing dots instead
                this.addMessageWithDots('ai');
            } else {
                this.addMessage(data || 'Message received', 'ai');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, there was an error processing your request.', 'ai');
        });
    }

    addMessage(content, type) {
        if (!this.messageContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <span class="message-time">${timestamp}</span>
        `;
        
        this.messageContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addMessageWithDots(type) {
        if (!this.messageContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <span class="message-time">${timestamp}</span>
        `;
        
        this.messageContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'flex';
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'none';
        }
    }

    scrollToBottom() {
        if (this.messageContainer) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }
}

/* =========================
   MOCK DATA + PAGINATION
========================= */

let scenarios = [
    {title:"Refund request", description:"Customer requests refund for damaged product."},
    {title:"Order tracking", description:"User asks for delivery tracking number."},
    {title:"Password reset", description:"Guide user to reset their password securely."},
    {title:"Escalation", description:"Escalate complaint to human support agent."},
    {title:"Product info", description:"Provide product details and pricing."},
    {title:"Return policy", description:"Explain return and replacement policy."},
    {title:"Late delivery", description:"Apologize and compensate for late shipment."},
    {title:"Subscription cancel", description:"Cancel subscription and confirm billing."},
    {title:"Promo code", description:"Apply discount code to order."},
    {title:"Technical issue", description:"Troubleshoot app not loading."}
];

const rowsPerPage = 5;
let currentPage = 1;
let scenarioSearchTerm = '';

function buildScenarioPageNumbers(current, total) {
    var pages = [];
    if (total <= 7) {
        for (var i = 1; i <= total; i++) pages.push(i);
        return pages;
    }
    pages.push(1);
    if (current > 3) pages.push('...');
    for (var i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}

function renderScenarioPagination(totalItems) {
    const container = document.getElementById('scenarioPagination');
    if (!container) return;

    const totalPages = Math.ceil(totalItems / rowsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pageNums = buildScenarioPageNumbers(currentPage, totalPages);
    const pagesHtml = pageNums.map(function(p) {
        if (p === '...') return '<span class="page-number">\u2026</span>';
        return '<div class="page-number' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</div>';
    }).join('');

    container.innerHTML =
        '<button class="page-btn" data-page="prev"' + (currentPage === 1 ? ' disabled' : '') + '>\u2190 Previous</button>' +
        '<div class="page-numbers">' + pagesHtml + '</div>' +
        '<button class="page-btn" data-page="next"' + (currentPage === totalPages ? ' disabled' : '') + '>Next \u2192</button>';

    container.querySelectorAll('[data-page]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (btn.disabled) return;
            const val = btn.dataset.page;
            let newPage = currentPage;
            if (val === 'prev') newPage = currentPage - 1;
            else if (val === 'next') newPage = currentPage + 1;
            else newPage = parseInt(val, 10);
            if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
                currentPage = newPage;
                renderTable();
            }
        });
    });
}

/* Render table */
function renderTable(data) {
    const tbody = document.querySelector('#scenarioTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Filter by search if no data passed
    let filtered = data || scenarios;
    if (!data && scenarioSearchTerm) {
        filtered = scenarios.filter(s =>
            s.title.toLowerCase().includes(scenarioSearchTerm) ||
            s.description.toLowerCase().includes(scenarioSearchTerm)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No scenarios found</td></tr>';
        renderScenarioPagination(0);
        return;
    }

    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filtered.slice(start, start + rowsPerPage);

    pageData.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.title}</td>
                <td>${item.description}</td>
                <td class="text-center">
                    <button class="action-btn" onclick="alert('Edit ${start + index}')">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn" onclick="alert('Delete ${start + index}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    renderScenarioPagination(filtered.length);
}

/* Search */
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        scenarioSearchTerm = this.value.toLowerCase();
        currentPage = 1;
        renderTable();
    });
}

/* Init */
if (document.querySelector('#scenarioTable tbody')) {
    renderTable();
}


// Panel Functions
function openScenarioPanel() {
    const panel = document.querySelector('#scenarioPanel');
    if (panel) {
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeScenarioPanel() {
    const panel = document.querySelector('#scenarioPanel');
    if (panel) {
        panel.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function openKnowledgePanel() {
    const panel = document.querySelector('#knowledge-panel');
    if (panel) {
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeKnowledgePanel() {
    const panel = document.querySelector('#knowledge-panel');
    if (panel) {
        panel.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AI Chat if we're on the chat page
    if (document.querySelector('.chat-container')) {
        window.aiChat = new AIChat();
        
        // Add a direct event listener for Enter key
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    const sendButton = document.getElementById('sendMessage');
                    if (sendButton) {
                        sendButton.click();
                    }
                }
            });
        }
    }

    // Close panels when clicking outside
    document.addEventListener('click', (e) => {
        const scenarioPanel = document.querySelector('#scenario-panel');
        const knowledgePanel = document.querySelector('#knowledge-panel');
        
        // Don't close if clicking the open button or inside the panel
        if (e.target.closest('[onclick*="openScenarioPanel"]') ||
            e.target.closest('[onclick*="openKnowledgePanel"]')) {
            return;
        }
        
        if (scenarioPanel && !scenarioPanel.contains(e.target)) {
            closeScenarioPanel();
        }
        
        if (knowledgePanel && !knowledgePanel.contains(e.target)) {
            closeKnowledgePanel();
        }
    });
});
