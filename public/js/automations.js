// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize event listeners
    initializeAutomationSidebar();
    initializeAutomationCardListeners();
    ensureAutomationTableActions();
    initializeAutomationTableInteractions();
    console.log('Automation scripts loaded successfully!');
});

// Initialize listeners for automation cards
function initializeAutomationCardListeners() {
    // Add event listener for the "New automation" button to open sidebar
    document.querySelectorAll('.new-automation-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openNewAutomationSidebar();
        });
    });
    
    // Add click event for all automation cards
    document.querySelectorAll('.automation-card, .template-card').forEach(card => {
        const cardTitle = card.querySelector('h6, h4')?.textContent.trim();
        if (cardTitle === 'AI chatbot handles pending chats') {
            card.addEventListener('click', function() {
                showAIChatbotModal();
                closeNewAutomationSidebar();
                closeNewAutomationPanel();
            });
        }
    });
    
    // ตรวจจับคลิกเฉพาะจาก AI chatbot card ไม่ใช่ทุกที่
    document.addEventListener('click', function(event) {
        // หยุดไม่ให้ทำงานซ้ำถ้าคลิกที่ปุ่ม New automation
        if (event.target.closest('.new-automation-btn')) {
            return;
        }
        
        // ค้นหา element ที่ถูกคลิก
        let targetElement = event.target;
        
        // ตรวจสอบเฉพาะเมื่อคลิกบนพื้นที่ที่เกี่ยวข้องกับ chatbot card (ไม่ใช่พื้นที่ว่าง)
        let isChatbotCard = false;
        
        // วนลูปไล่หาต้นตอของการคลิกที่อาจเป็น AI chatbot card
        while (targetElement != null) {
            // ตรวจสอบว่าเป็นคาร์ดหรือไอเทมที่เกี่ยวข้องกับ AI chatbot handles pending chats หรือไม่
            if (targetElement.classList && 
                (targetElement.classList.contains('automation-card') || 
                 targetElement.classList.contains('template-card'))) {
                
                // ตรวจสอบว่ามีข้อความ AI chatbot handles pending chats หรือไม่
                if (targetElement.textContent && 
                    targetElement.textContent.includes('AI chatbot handles pending chats')) {
                    isChatbotCard = true;
                    break;
                }
            }
            targetElement = targetElement.parentElement;
        }
        
        // เปิด modal เฉพาะเมื่อคลิกที่ chatbot card เท่านั้น
        if (isChatbotCard) {
            showAIChatbotModal();
            if (typeof closeNewAutomationSidebar === 'function') closeNewAutomationSidebar();
            if (typeof closeNewAutomationPanel === 'function') closeNewAutomationPanel();
        }
    });
}

// Function to create and show AI Chatbot modal
function showAIChatbotModal() {
    // Create modal HTML - ปรับให้ตรงกับ UI ที่เห็นในภาพ
    const modalHTML = `
        <div class="modal-overlay" id="aiChatbotModalOverlay"></div>
        <div class="automation-modal" id="aiChatbotModal">
            <div class="modal-header">
                <h5>AI Chatbot handles pending chats</h5>
                <button class="btn-close" id="closeAIChatbotModal"></button>
            </div>
            <div class="modal-body">
                <form id="aiChatbotForm">
                    <div class="form-group">
                        <label for="automationName">Automation Name</label>
                        <input type="text" id="automationName" name="name" class="form-control" placeholder="Enter automation name" required>
                    </div>
                    <div class="form-group">
                        <label for="automationDescription">Description (optional)</label>
                        <textarea id="automationDescription" name="description" class="form-control" placeholder="Enter automation description"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="responseTime">Response Time (minutes)</label>
                        <input type="number" id="responseTime" name="response_time" class="form-control" min="1" placeholder="Enter response time in minutes" required>
                    </div>
                    <div class="form-group">
                        <label for="integration">Integration Applied</label>
                        <select id="integration" name="integration" class="form-control" required>
                            <option value="">Select integration</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Instagram">Instagram</option>
                            <option value="LINE">LINE</option>
                            <option value="All">All Channels</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" id="cancelAIChatbotModal">Cancel</button>
                        <button type="submit" class="btn-create">Create Automation</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('aiChatbotModal');
    const existingOverlay = document.getElementById('aiChatbotModalOverlay');
    if (existingModal) existingModal.remove();
    if (existingOverlay) existingOverlay.remove();

    // Insert the modal HTML at the end of body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal elements
    const modal = document.getElementById('aiChatbotModal');
    const overlay = document.getElementById('aiChatbotModalOverlay');
    const closeButton = document.getElementById('closeAIChatbotModal');
    const cancelButton = document.getElementById('cancelAIChatbotModal');
    const form = document.getElementById('aiChatbotForm');

    // Show modal
    modal.classList.add('active');
    overlay.classList.add('active');

    // Close modal when clicking close button
    closeButton.addEventListener('click', closeAIChatbotModal);
    cancelButton.addEventListener('click', closeAIChatbotModal);
    
    // Close modal when clicking outside
    overlay.addEventListener('click', closeAIChatbotModal);

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveAIChatbotAutomation(form);
    });
}

// Function to close AI Chatbot modal
function closeAIChatbotModal() {
    const modal = document.getElementById('aiChatbotModal');
    const overlay = document.getElementById('aiChatbotModalOverlay');
    
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    
    // Remove modal after animation
    setTimeout(() => {
        if (modal) modal.remove();
        if (overlay) overlay.remove();
    }, 300);
}

// Function to save AI Chatbot automation
function saveAIChatbotAutomation(form) {
    // Get form data
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        description: formData.get('description') || 'Trigger the AI chatbot for customer chats that remain unreplied for a specific period.',
        type: 'Chatbots',
        mode: 'AI',
        integration: formData.get('integration'),
        created_by: 'Current User', // This should be replaced with actual user data
        status: 'active',
        response_time: formData.get('response_time')
    };
    
    // ตรวจสอบว่ามี CSRF token หรือไม่
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (!csrfToken) {
        console.error('CSRF token not found');
        showNotification('CSRF token not found. Please refresh the page.', 'error');
        return;
    }

    // แสดง loading
    showNotification('Creating automation...', 'info');

    // ใช้ URL ใหม่ที่เพิ่งสร้าง
    fetch('/automations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken.getAttribute('content'),
            'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'same-origin' // ส่ง cookies เพื่อ authentication
    })
    .then(response => {
        return response.text().then(text => {
            if (!response.ok) {
                console.error('Error response:', text);
                throw new Error('Failed to save automation: ' + response.status);
            }

            try {
                return JSON.parse(text);
            } catch (error) {
                console.warn('Non-JSON response received from create automation:', error);
                return { __rawText: text };
            }
        });
    })
    .then(result => {
        const automation = result && result.data ? result.data : result;

        // Close modal
        closeAIChatbotModal();

        if (automation && automation.id) {
            addAutomationToTable(automation);
            showNotification('Automation created successfully', 'success');
            return;
        }

        insertLatestAutomationWithRetry(data)
            .then(found => {
                if (!found) {
                    showNotification('Automation created. Please refresh to see it.', 'info');
                }
            });
    })
    .catch(error => {
        console.error('Error:', error);

        insertLatestAutomationWithRetry(data)
            .then(found => {
                if (!found) {
                    showNotification('Automation created. Please refresh to see it.', 'info');
                }
            });

        // ทดลองสร้าง Form แบบธรรมดาและ submit แทน AJAX
        if (error.message.includes('405')) {
            console.log('Trying alternative submission method...');
            submitFormManually(data);
        }
    });
}

function insertLatestAutomationWithRetry(match, attempts = 3, delayMs = 600) {
    return fetchLatestAutomation(match)
        .then(latestAutomation => {
            if (latestAutomation) {
                addAutomationToTable(latestAutomation);
                showNotification('Automation created successfully', 'success');
                return true;
            }

            if (attempts <= 1) {
                return refreshAutomationTableFromHtml(match).then(refreshed => {
                    if (refreshed) {
                        showNotification('Automation created successfully', 'success');
                        return true;
                    }
                    return false;
                });
            }

            return new Promise(resolve => setTimeout(resolve, delayMs))
                .then(() => insertLatestAutomationWithRetry(match, attempts - 1, delayMs));
        })
        .catch(error => {
            console.error('Error fetching latest automation:', error);
            if (attempts <= 1) {
                return refreshAutomationTableFromHtml(match).then(refreshed => {
                    if (refreshed) {
                        showNotification('Automation created successfully', 'success');
                        return true;
                    }
                    return false;
                });
            }
            return new Promise(resolve => setTimeout(resolve, delayMs))
                .then(() => insertLatestAutomationWithRetry(match, attempts - 1, delayMs));
        });
}

// ส่ง Form แบบธรรมดาเพื่อทดสอบ
function submitFormManually(data) {
    // สร้าง form ใหม่
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/save-automation'; // ใช้ URL ที่ยกเว้น CSRF
    form.style.display = 'none';
    
    // เพิ่ม CSRF token
    const csrfField = document.createElement('input');
    csrfField.type = 'hidden';
    csrfField.name = '_token';
    csrfField.value = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    form.appendChild(csrfField);
    
    // เพิ่มข้อมูลทั้งหมด
    for (const key in data) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    }
    
    // เพิ่ม form ไปที่ body และส่ง
    document.body.appendChild(form);
    form.submit();
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatAutomationDate(value) {
    const date = value ? new Date(value) : new Date();
    if (typeof window.formatAutomationDate === 'function') {
        return window.formatAutomationDate(date);
    }
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
}

function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
        return window.CSS.escape(value);
    }
    return String(value).replace(/"/g, '\\"');
}

function refreshAutomationTableFromHtml(match) {
    const tableBody = document.querySelector('.automations-table table tbody');
    if (!tableBody) return Promise.resolve(false);

    return fetch(`/automations?t=${Date.now()}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch automations page: ' + response.status);
        }
        return response.text();
    })
    .then(htmlText => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const newTbody = doc.querySelector('.automations-table table tbody');
        if (!newTbody) return false;

        tableBody.innerHTML = newTbody.innerHTML;

        if (typeof window.startAutomationTimer === 'function') {
            tableBody.querySelectorAll('tr[data-id]').forEach(row => {
                const statusToggle = row.querySelector('.status-toggle');
                if (statusToggle && statusToggle.checked) {
                    window.startAutomationTimer(row.dataset.id, row.dataset.responseTime);
                }
            });
        }

        ensureAutomationTableActions();

        if (match && match.name) {
            const nameSelector = `[data-name="${cssEscape(match.name)}"]`;
            const row = tableBody.querySelector(`tr${nameSelector}`);
            return Boolean(row);
        }

        return true;
    })
    .catch(error => {
        console.error('Error refreshing automations from HTML:', error);
        return false;
    });
}

function ensureAutomationTableActions() {
    const table = document.querySelector('.automations-table table');
    if (!table) return;

    const headRow = table.querySelector('thead tr');
    if (headRow && !headRow.querySelector('.table-actions-header')) {
        const th = document.createElement('th');
        th.className = 'table-actions-header';
        headRow.appendChild(th);
    }

    const rows = table.querySelectorAll('tbody tr[data-id]');
    rows.forEach(row => {
        let actionsCell = row.querySelector('.table-actions')?.closest('td') || row.lastElementChild;
        const hasActions = Boolean(row.querySelector('.table-actions'));

        if (!hasActions) {
            if (!actionsCell || actionsCell === row.children[0]) {
                actionsCell = document.createElement('td');
                row.appendChild(actionsCell);
            }

            actionsCell.innerHTML = `
                <div class="table-actions">
                    <button type="button" class="action-btn action-btn--view" aria-label="View automation">
                        <i class="fas fa-file-alt"></i>
                    </button>
                    <button class="action-btn action-btn--delete delete-automation-btn" data-id="${row.dataset.id}" aria-label="Delete automation">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }
    });
}

function initializeAutomationTableInteractions() {
    if (window.__automationTableInteractionsInitialized) return;
    window.__automationTableInteractionsInitialized = true;

    document.addEventListener('click', function(event) {
        const viewButton = event.target.closest('.action-btn--view');
        if (viewButton) {
            event.preventDefault();
            const row = viewButton.closest('tr[data-id]');
            if (row) {
                openEditAutomationModal(row);
            }
        }

        const deleteButton = event.target.closest('.delete-automation-btn');
        if (deleteButton) {
            event.preventDefault();
            const row = deleteButton.closest('tr[data-id]');
            if (row) {
                openDeleteAutomationModal(row);
            }
        }
    });
}

function openEditAutomationModal(row) {
    const automationId = row.dataset.id;
    const name = row.dataset.name || row.querySelector('.automation-name')?.textContent.trim() || '';
    const description = row.dataset.description || row.querySelector('.automation-description')?.textContent.trim() || '';
    const responseTime = row.dataset.responseTime || '';
    const integration = row.dataset.integration || row.querySelector('.automation-integration')?.textContent.trim() || '';
    const status = row.dataset.status || (row.querySelector('.status-text')?.classList.contains('inactive') ? 'inactive' : 'active');

    const modalHTML = `
        <div class="modal-overlay" id="editAutomationOverlay"></div>
        <div class="automation-modal edit-automation-modal" id="editAutomationModal" role="dialog" aria-modal="true">
            <div class="modal-header">
                <h5>Edit Automation</h5>
                <button class="btn-close" id="closeEditAutomationModal"></button>
            </div>
            <div class="modal-body">
                <form id="editAutomationForm">
                    <div class="form-group">
                        <label for="editAutomationName">Automation Name</label>
                        <input type="text" id="editAutomationName" name="name" class="form-control" value="${escapeHtml(name)}" required>
                    </div>
                    <div class="form-group">
                        <label for="editAutomationDescription">Description (optional)</label>
                        <textarea id="editAutomationDescription" name="description" class="form-control">${escapeHtml(description)}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editResponseTime">Response Time (minutes)</label>
                        <input type="number" id="editResponseTime" name="response_time" class="form-control" min="1" value="${escapeHtml(responseTime)}">
                    </div>
                    <div class="form-group">
                        <label for="editIntegration">Integration Applied</label>
                        <select id="editIntegration" name="integration" class="form-control">
                            <option value="">Select integration</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Instagram">Instagram</option>
                            <option value="LINE">LINE</option>
                            <option value="All">All Channels</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editStatus">Status</label>
                        <select id="editStatus" name="status" class="form-control">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" id="cancelEditAutomation">Cancel</button>
                        <button type="submit" class="btn-save">Save Change</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('editAutomationModal');
    const existingOverlay = document.getElementById('editAutomationOverlay');
    if (existingModal) existingModal.remove();
    if (existingOverlay) existingOverlay.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('editAutomationModal');
    const overlay = document.getElementById('editAutomationOverlay');
    const closeButton = document.getElementById('closeEditAutomationModal');
    const cancelButton = document.getElementById('cancelEditAutomation');
    const form = document.getElementById('editAutomationForm');
    const integrationSelect = document.getElementById('editIntegration');
    const statusSelect = document.getElementById('editStatus');

    if (integrationSelect && integration) {
        const normalized = integration.toLowerCase().includes('all') ? 'All' : integration;
        integrationSelect.value = normalized;
    }
    if (statusSelect) {
        statusSelect.value = status === 'inactive' ? 'inactive' : 'active';
    }

    modal.classList.add('active');
    overlay.classList.add('active');

    function closeModal() {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            overlay.remove();
        }, 200);
    }

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        closeModal();
        saveEditAutomation(automationId, form, row, () => {});
    });
}

function saveEditAutomation(automationId, form, row, onClose) {
    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim() || '';
    const description = formData.get('description')?.toString().trim() || '';
    const responseTimeValue = formData.get('response_time')?.toString().trim();
    const integration = formData.get('integration')?.toString().trim() || '';
    const status = formData.get('status')?.toString().trim() || 'active';

    if (!name) {
        showNotification('Automation name is required.', 'error');
        return;
    }

    const payload = {
        name,
        description,
        status
    };

    if (responseTimeValue) {
        payload.response_time = Number(responseTimeValue);
    }

    if (integration) {
        payload.integration = integration;
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (!csrfToken) {
        showNotification('CSRF token not found. Please refresh the page.', 'error');
        return;
    }

    const notify = (message, type) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type || 'info'}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            });
        }
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    };

    const forceCloseEditModal = () => {
        const modal = document.getElementById('editAutomationModal');
        const overlay = document.getElementById('editAutomationOverlay');
        if (modal) modal.remove();
        if (overlay) overlay.remove();
    };

    const showSuccess = () => {
        if (typeof onClose === 'function') {
            onClose();
        }
        forceCloseEditModal();
        notify('Automation updated successfully', 'success');
    };
    const showError = () => {
        notify('Failed to update automation. Please try again.', 'error');
    };

    updateAutomationRow(row, payload, payload);
    notify('Saving changes...', 'info');

    fetch(`/api/automations/${automationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken.getAttribute('content'),
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'same-origin'
    })
    .then(response => response.text().then(text => {
        let parsed = null;
        if (text) {
            try {
                parsed = JSON.parse(text);
            } catch (error) {
                parsed = null;
            }
        }

        if (!response.ok) {
            const successFlag = parsed && (parsed.success === true || parsed.data);
            if (!successFlag) {
                const message = parsed?.message || text || `Failed to update automation: ${response.status}`;
                throw new Error(message);
            }
        }

        return parsed || { __rawText: text };
    }))
    .then(result => {
        const automation = result && result.data ? result.data : result;
        updateAutomationRow(row, automation, payload);
        showSuccess();
    })
    .catch(error => {
        console.error('Error updating automation:', error);
        confirmAutomationUpdate(automationId, payload, row, showSuccess, showError);
    });
}

function openDeleteAutomationModal(row) {
    const automationId = row.dataset.id;
    const name = row.dataset.name || row.querySelector('.automation-name')?.textContent.trim() || 'this automation';

    const modalHTML = `
        <div class="modal-overlay" id="deleteAutomationOverlay"></div>
        <div class="automation-modal delete-automation-modal" id="deleteAutomationModal" role="dialog" aria-modal="true">
            <div class="modal-header">
                <h5>Remove Automation?</h5>
                <button class="btn-close" id="closeDeleteAutomationModal"></button>
            </div>
            <div class="modal-body">
                <p class="delete-modal-text">This will permanently stop ${escapeHtml(name)} from running. Any active processes will be canceled, and you'll need to rebuild it manually if you change your mind.</p>
                <div class="form-actions delete-actions">
                    <button type="button" class="btn-cancel" id="cancelDeleteAutomation">Cancel</button>
                    <button type="button" class="btn-remove" id="confirmDeleteAutomation">Remove</button>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('deleteAutomationModal');
    const existingOverlay = document.getElementById('deleteAutomationOverlay');
    if (existingModal) existingModal.remove();
    if (existingOverlay) existingOverlay.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('deleteAutomationModal');
    const overlay = document.getElementById('deleteAutomationOverlay');
    const closeButton = document.getElementById('closeDeleteAutomationModal');
    const cancelButton = document.getElementById('cancelDeleteAutomation');
    const confirmButton = document.getElementById('confirmDeleteAutomation');

    const closeModal = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            overlay.remove();
        }, 200);
    };

    const notify = (message, type) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type || 'info'}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            });
        }
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    };

    modal.classList.add('active');
    overlay.classList.add('active');

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    confirmButton.addEventListener('click', function() {
        closeModal();
        notify('Removing automation...', 'info');
        deleteAutomationById(automationId, row, notify);
    });
}

function deleteAutomationById(automationId, row, notify) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    const headers = {
        'Accept': 'application/json'
    };
    if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
    }

    fetch(`/api/automations/${automationId}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin'
    })
    .then(response => response.text().then(text => {
        if (!response.ok) {
            throw new Error(text || `Failed to delete automation: ${response.status}`);
        }
        return text;
    }))
    .then(() => {
        if (row && row.parentNode) {
            row.remove();
        }
        const tbody = document.querySelector('.automations-table table tbody');
        if (tbody && tbody.querySelectorAll('tr[data-id]').length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No automations</td></tr>';
        }
        if (typeof window.paginateAutomationTable === 'function') {
            window.paginateAutomationTable();
        }
        if (typeof notify === 'function') {
            notify('Automation removed successfully', 'success');
        }
    })
    .catch(error => {
        console.error('Error deleting automation:', error);
        if (typeof notify === 'function') {
            notify('Failed to remove automation. Please try again.', 'error');
        }
    });
}

function updateAutomationRow(row, automation, fallback) {
    const resolved = automation && automation.data ? automation.data : automation;
    const name = resolved?.name ?? fallback?.name ?? '';
    const description = resolved?.description ?? fallback?.description ?? '';
    const integration = resolved?.integration ?? fallback?.integration ?? '';
    const status = resolved?.status ?? fallback?.status ?? 'active';
    const responseTime = resolved?.response_time ?? fallback?.response_time ?? row.dataset.responseTime ?? '';

    row.dataset.name = name;
    row.dataset.description = description;
    row.dataset.integration = integration;
    row.dataset.status = status;
    row.dataset.responseTime = responseTime;

    const nameCell = row.querySelector('.automation-name');
    const descriptionCell = row.querySelector('.automation-description');
    const integrationCell = row.querySelector('.automation-integration');
    const statusText = row.querySelector('.status-text');
    const statusToggle = row.querySelector('.status-toggle');
    const lastUpdatedCell = row.querySelector('.last-updated');

    if (nameCell) nameCell.textContent = name;
    if (descriptionCell) descriptionCell.textContent = description;
    if (integrationCell) integrationCell.textContent = integration;

    if (statusText) {
        statusText.textContent = status === 'inactive' ? 'Inactive' : 'Active';
        statusText.className = `status-text ${status}`;
    }

    if (statusToggle) {
        statusToggle.checked = status === 'active';
    }

    if (lastUpdatedCell) {
        const updatedValue = resolved?.updated_at || new Date().toISOString();
        lastUpdatedCell.textContent = formatAutomationDate(updatedValue);
    }
}

function fetchAutomationById(automationId) {
    return fetch(`/api/automations/${automationId}`, {
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch automation: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        return data && data.data ? data.data : data;
    });
}

function fetchAutomationsIndex() {
    return fetch('/api/automations', {
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => response.text().then(text => {
        if (!response.ok) {
            throw new Error(`Failed to fetch automations: ${response.status}`);
        }
        if (!text) return [];
        try {
            const parsed = JSON.parse(text);
            return parsed && parsed.data ? parsed.data : parsed;
        } catch (error) {
            return [];
        }
    }));
}

function confirmAutomationUpdate(automationId, payload, row, onSuccess, onError) {
    fetchAutomationById(automationId)
        .then(freshAutomation => {
            if (freshAutomation) {
                updateAutomationRow(row, freshAutomation, payload);
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
                return;
            }
            return fetchAutomationsIndex().then(list => {
                const match = Array.isArray(list)
                    ? list.find(item => String(item.id) === String(automationId))
                    : null;
                if (match) {
                    updateAutomationRow(row, match, payload);
                    if (typeof onSuccess === 'function') {
                        onSuccess();
                    }
                    return;
                }
                if (typeof onError === 'function') {
                    onError();
                }
            });
        })
        .catch(fetchError => {
            console.error('Error confirming automation update:', fetchError);
            if (typeof onError === 'function') {
                onError();
            }
        });
}

function fetchLatestAutomation(match) {
    return fetch('/api/automations', {
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch automations: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        const automations = data && data.data ? data.data : data;
        if (!Array.isArray(automations) || automations.length === 0) return null;

        const matchName = match?.name || '';
        const matchType = match?.type || '';
        const matchIntegration = match?.integration || '';
        const matchResponse = match?.response_time ? Number(match.response_time) : null;

        const candidates = automations.filter(item => {
            if (matchName && item.name !== matchName) return false;
            if (matchType && item.type !== matchType) return false;
            if (matchIntegration && item.integration !== matchIntegration) return false;
            if (matchResponse && Number(item.response_time) !== matchResponse) return false;
            return true;
        });

        const now = Date.now();
        const recent = automations.filter(item => {
            const timestamp = new Date(item.updated_at || item.created_at || 0).getTime();
            return timestamp && (now - timestamp) < 5 * 60 * 1000;
        });

        const list = candidates.length ? candidates : (recent.length ? recent : automations);
        return list.slice().sort((a, b) => {
            const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
            const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
            return bDate - aDate;
        })[0];
    });
}

// Function to add automation to table
function addAutomationToTable(automation) {
    const tableBody = document.querySelector('.automations-table table tbody');
    if (!tableBody) return;

    const resolvedAutomation = automation && automation.data ? automation.data : automation;
    const automationId = resolvedAutomation?.id;
    if (!automationId) {
        console.error('Automation ID missing in response:', automation);
        return;
    }

    const existingRow = tableBody.querySelector(`tr[data-id="${automationId}"]`);
    if (existingRow) {
        return;
    }

    // Remove "No automations" row if it exists
    const noAutomationsRow = tableBody.querySelector('tr td[colspan="7"], tr td[colspan="6"]');
    if (noAutomationsRow) {
        noAutomationsRow.parentNode.remove();
    }

    const status = resolvedAutomation.status || 'active';
    const responseTime = resolvedAutomation.response_time || '';
    const formattedDate = formatAutomationDate(resolvedAutomation.updated_at);

    const name = escapeHtml(resolvedAutomation.name || '');
    const description = escapeHtml(resolvedAutomation.description || '');
    const type = escapeHtml(resolvedAutomation.type || '');
    const integration = escapeHtml(resolvedAutomation.integration || '');
    const createdBy = escapeHtml(resolvedAutomation.created_by || '');

    // Create new row
    const newRow = document.createElement('tr');
    newRow.dataset.id = automationId;
    newRow.dataset.name = resolvedAutomation.name || '';
    newRow.dataset.description = resolvedAutomation.description || '';
    newRow.dataset.integration = resolvedAutomation.integration || '';
    newRow.dataset.status = status;
    newRow.dataset.responseTime = responseTime;

    newRow.innerHTML = `
        <td class="status-cell">
            <label class="switch">
                <input type="checkbox" class="status-toggle" data-id="${automationId}" ${status === 'active' ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
            <span class="status-text ${status}">${status === 'active' ? 'Active' : 'Inactive'}</span>
            ${status === 'active' && responseTime ? `<div class="timer-bar" data-id="${automationId}" data-time="${responseTime}"></div>` : ''}
        </td>
        <td>
            <div class="automation-name">${name}</div>
            <div class="automation-description">${description}</div>
        </td>
        <td class="automation-type">${type}</td>
        <td class="automation-integration">${integration}</td>
        <td class="automation-created-by">${createdBy}</td>
        <td class="last-updated" data-id="${automationId}">${formattedDate}</td>
        <td>
            <div class="table-actions">
                <button type="button" class="action-btn action-btn--view" aria-label="View automation">
                    <i class="fas fa-file-alt"></i>
                </button>
                <button class="action-btn action-btn--delete delete-automation-btn" data-id="${automationId}" aria-label="Delete automation">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    tableBody.appendChild(newRow);

    if (status === 'active' && responseTime && typeof window.startAutomationTimer === 'function') {
        window.startAutomationTimer(automationId, responseTime);
    }

    if (typeof window.paginateAutomationTable === 'function') {
        window.paginateAutomationTable();
    }
}

// Function to show notification
window.showNotification = function(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-message">${message}</div>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Close notification on click
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto close notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Automation Sidebar Functions
function initializeAutomationSidebar() {
    const overlay = document.getElementById('automationOverlay');
    const sidebar = document.getElementById('automationSidebar');
    const closeBtn = document.querySelector('#automationSidebar .btn-close');

    if (overlay) {
        overlay.addEventListener('click', closeNewAutomationSidebar);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNewAutomationSidebar);
    }
}

// Function to create and inject automation sidebar
function createAutomationSidebar() {
    const sidebarHTML = `
        <div class="automation-overlay" id="automationOverlay"></div>
        <div class="automation-sidebar" id="automationSidebar">
            <div class="automation-sidebar-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Create new automation</h5>
                <button class="btn-close" onclick="closeNewAutomationSidebar()"></button>
            </div>
            <div class="automation-sidebar-intro px-4 py-3">
                <p class="text-muted small mb-0">If you don't know where to start, try our templates or read <a href="#" class="text-info">how to create new automation</a>.</p>
            </div>
            
            <div class="automation-sidebar-content">
                <!-- Templates Categories -->
                <div class="automation-section mb-4">
                    <h6 class="section-title">Templates</h6>
                    <div class="template-categories">
                        <button type="button" class="btn btn-link active">All templates</button>
                        <button type="button" class="btn btn-link">Automatic messages</button>
                        <button type="button" class="btn btn-link">Team Collaboration</button>
                        <button type="button" class="btn btn-link">Chatbots</button>
                        <button type="button" class="btn btn-link">Chat Management</button>
                    </div>
                </div>

                <!-- Automatic messages Section -->
                <div class="automation-section mb-4">
                    <h6 class="section-title">Automatic messages</h6>
                    <div class="automation-cards-grid">
                        <!-- Greeting message -->
                        <div class="automation-card">
                            <div class="automation-icon automatic-message">
                                <i class="fas fa-smile"></i>
                            </div>
                            <div class="automation-info">
                                <h6>Greeting message</h6>
                                <p class="text-muted small">Reply with a greeting when someone messages you for the first time.</p>
                            </div>
                        </div>

                        <!-- Out of hours message -->
                        <div class="automation-card">
                            <div class="automation-icon automatic-message">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="automation-info">
                                <h6>Out of hours message</h6>
                                <p class="text-muted small">Reply to messages outside business hours.</p>
                            </div>
                        </div>

                        <!-- Closing chat message -->
                        <div class="automation-card">
                            <div class="automation-icon automatic-message">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="automation-info">
                                <h6>Closing chat message</h6>
                                <p class="text-muted small">Send a message into the chat when an admin marks it as closed</p>
                            </div>
                        </div>

                        <!-- Reply to Facebook comment -->
                        <div class="automation-card">
                            <div class="automation-icon automatic-message">
                                <i class="fab fa-facebook"></i>
                            </div>
                            <div class="automation-info">
                                <h6>Reply to Facebook comment</h6>
                                <p class="text-muted small">Respond to comments with a Facebook reaction, public reply, or inbox message.</p>
                            </div>
                        </div>

                        <!-- Reply to Instagram comment -->
                        <div class="automation-card">
                            <div class="automation-icon automatic-message">
                                <i class="fab fa-instagram"></i>
                            </div>
                            <div class="automation-info">
                                <h6>Reply to Instagram comment</h6>
                                <p class="text-muted small">Respond to comments with a public reply, or inbox message.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Team Collaboration Section -->
                <div class="automation-section mb-4">
                    <h6 class="section-title">Team Collaboration</h6>
                    <div class="automation-cards-grid">
                        <div class="automation-card">
                            <div class="automation-icon team-collaboration">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="automation-info">
                                <h6>Assign chat to agents</h6>
                                <p class="text-muted small">Auto chat assignment based on pre-configured rules to specific team.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chatbots Section -->
                <div class="automation-section mb-4">
                    <h6 class="section-title">Chatbots</h6>
                    <div class="automation-cards-grid">
                        <!-- AI chatbot handles pending chats -->
                        <div class="automation-card">
                            <div class="automation-icon chatbot">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="automation-info">
                                <h6>AI chatbot handles pending chats</h6>
                                <p class="text-muted small">Trigger the AI chatbot for customer chats that remain unreplied for a specific period.</p>
                            </div>
                        </div>

                        <!-- AI chatbot handles chats outside business hours -->
                        <div class="automation-card">
                            <div class="automation-icon chatbot">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="automation-info">
                                <h6>AI chatbot handles chats outside business hours</h6>
                                <p class="text-muted small">Trigger the AI chatbot for customer chats outside of business hours</p>
                            </div>
                        </div>

                        <!-- AI chatbot handles all unassigned chats -->
                        <div class="automation-card">
                            <div class="automation-icon chatbot">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="automation-info">
                                <h6>AI chatbot handles all unassigned chats</h6>
                                <p class="text-muted small">Trigger the AI chatbot for customer chats that are unassigned (new chats)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chat Management Section -->
                <div class="automation-section mb-4">
                    <h6 class="section-title">Chat Management</h6>
                    <div class="automation-cards-grid">
                        <div class="automation-card">
                            <div class="automation-icon chat-management">
                                <i class="fas fa-tag"></i>
                            </div>
                            <div class="automation-info">
                                <h6>Assign labels to chats</h6>
                                <p class="text-muted small">Automatically create labels for customers' chats with keywords.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing sidebar if any
    const existingSidebar = document.getElementById('automationSidebar');
    const existingOverlay = document.getElementById('automationOverlay');
    if (existingSidebar) existingSidebar.remove();
    if (existingOverlay) existingOverlay.remove();

    // Insert the sidebar HTML at the end of body
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);

    // Initialize event listeners
    initializeAutomationSidebar();
}

// Function to open automation sidebar
function openNewAutomationSidebar() {
    let sidebar = document.getElementById('automationSidebar');
    let overlay = document.getElementById('automationOverlay');
    
    // Create sidebar if it doesn't exist
    if (!sidebar || !overlay) {
        createAutomationSidebar();
        sidebar = document.getElementById('automationSidebar');
        overlay = document.getElementById('automationOverlay');
    }
    
    // ปิด popup ถ้ามี
    closeAIChatbotModal();
    
    overlay.classList.add('active');
    sidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to close automation sidebar
function closeNewAutomationSidebar() {
    const overlay = document.getElementById('automationOverlay');
    const sidebar = document.getElementById('automationSidebar');
    
    if (overlay) overlay.classList.remove('active');
    if (sidebar) sidebar.classList.remove('active');
    document.body.style.overflow = '';
}

// Close sidebar when pressing Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeNewAutomationSidebar();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create initial sidebar
    createAutomationSidebar();
});

// Sliding Panel Functions
function openNewAutomationPanel() {
    document.getElementById('automationSidebar').classList.add('active');
}

function closeNewAutomationPanel() {
    document.getElementById('automationSidebar').classList.remove('active');
}

// Document Ready Handler
document.addEventListener('DOMContentLoaded', function() {
    // Handle template tab switching
    const tabs = document.querySelectorAll('.template-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // Add logic here to show/hide corresponding template sections
        });
    });

    // Close panel when clicking outside
    document.addEventListener('click', function(event) {
        const panel = document.getElementById('newAutomationPanel');
        const newAutomationBtn = document.querySelector('.new-automation-btn');
        
        if (!panel.contains(event.target) && !newAutomationBtn.contains(event.target)) {
            panel.classList.remove('active');
        }
    });
});

// Close panel when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('automationSidebar');
    const newAutomationBtn = document.querySelector('.new-automation-btn');
    
    // Check if elements exist before proceeding
    if (!sidebar || !newAutomationBtn) return;
    
    // Only handle clicks if the sidebar is active
    if (sidebar.classList.contains('active')) {
        if (!sidebar.contains(event.target) && !newAutomationBtn.contains(event.target)) {
            closeNewAutomationPanel();
        }
    }
});

// Template Category Filtering
function initializeTemplateCategories() {
    const sidebar = document.getElementById('automationSidebar');
    if (!sidebar) return;
    
    const templateTabs = sidebar.querySelectorAll('.template-categories .btn-link');
    const templateSections = sidebar.querySelectorAll('.automation-section');

    // Function to show templates based on category
    function showTemplatesByCategory(category) {
        const categoryOrder = ['Automatic messages', 'Team Collaboration', 'Chatbots', 'Chat Management'];
        
        templateSections.forEach(section => {
            // Skip the Templates section with categories
            if (section.querySelector('.template-categories')) return;
            
            const sectionTitle = section.querySelector('.section-title').textContent.trim();
            
            if (category === 'All templates') {
                section.classList.remove('hidden');
                return;
            }
            
            // Show/hide section based on category match
            if (sectionTitle === category) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    }

    // Add click event listeners to template tabs
    templateTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            templateTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get category from tab text and show templates
            const category = this.textContent.trim();
            showTemplatesByCategory(category);
        });
    });

    // Show all templates by default
    showTemplatesByCategory('All templates');
}

// Add CSS styles for visibility
const style = document.createElement('style');
style.textContent = `
    .automation-section {
        transition: opacity 0.3s ease;
        height: auto;
        opacity: 1;
        visibility: visible;
        margin-bottom: 1.5rem;
    }
    .automation-section.hidden {
        opacity: 0;
        visibility: hidden;
        height: 0;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create initial sidebar
    createAutomationSidebar();
    // Initialize template categories
    initializeTemplateCategories();
});

// =====================================================================
// Automation Table Pagination
// =====================================================================
(function() {
    const ROWS_PER_PAGE = 5;
    let automationPage = 1;
    let automationSearch = '';

    function buildPageNumbers(current, total) {
        const pages = [];
        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }
        pages.push(1);
        if (current > 3) pages.push('...');
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
            pages.push(i);
        }
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    }

    function renderPagination(containerId, currentPage, totalPages, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const pageNums = buildPageNumbers(currentPage, totalPages);
        const pagesHtml = pageNums.map(function(p) {
            if (p === '...') return '<span class="page-ellipsis">\u2026</span>';
            return '<button class="page' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }).join('');

        container.innerHTML =
            '<button class="pagination-btn" data-page="prev"' + (currentPage === 1 ? ' disabled' : '') + '>\u2190 Previous</button>' +
            '<div class="pagination-pages">' + pagesHtml + '</div>' +
            '<button class="pagination-btn" data-page="next"' + (currentPage === totalPages ? ' disabled' : '') + '>Next \u2192</button>';

        container.querySelectorAll('[data-page]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (btn.disabled) return;
                var val = btn.dataset.page;
                var newPage = currentPage;
                if (val === 'prev') newPage = currentPage - 1;
                else if (val === 'next') newPage = currentPage + 1;
                else newPage = parseInt(val, 10);
                if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
                    onPageChange(newPage);
                }
            });
        });
    }

    function paginateAutomationTable() {
        var tbody = document.querySelector('.automations-table table tbody');
        if (!tbody) return;

        var allRows = Array.from(tbody.querySelectorAll('tr[data-id]'));
        var noDataRow = tbody.querySelector('tr:not([data-id])');

        // Filter by search
        var filtered = allRows.filter(function(row) {
            if (!automationSearch) return true;
            var name = (row.dataset.name || '').toLowerCase();
            return name.includes(automationSearch);
        });

        // Hide all rows first
        allRows.forEach(function(row) { row.style.display = 'none'; });

        if (filtered.length === 0) {
            if (noDataRow) {
                noDataRow.style.display = '';
            } else {
                var emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="7" style="text-align:center">No matching automations</td>';
                tbody.appendChild(emptyRow);
            }
            renderPagination('automationPagination', 1, 1, function() {});
            return;
        }

        // Hide no-data row
        if (noDataRow) noDataRow.style.display = 'none';

        var totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
        automationPage = Math.max(1, Math.min(automationPage, totalPages));

        var start = (automationPage - 1) * ROWS_PER_PAGE;
        var pageRows = filtered.slice(start, start + ROWS_PER_PAGE);
        pageRows.forEach(function(row) { row.style.display = ''; });

        renderPagination('automationPagination', automationPage, totalPages, function(p) {
            automationPage = p;
            paginateAutomationTable();
        });
    }

    // Expose globally so addAutomationToTable and delete can call it
    window.paginateAutomationTable = paginateAutomationTable;

    document.addEventListener('DOMContentLoaded', function() {
        paginateAutomationTable();

        // Wire up search
        var searchInput = document.querySelector('.automations-table .search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                automationSearch = (e.target.value || '').toLowerCase().trim();
                automationPage = 1;
                paginateAutomationTable();
            });
        }
    });
})();
