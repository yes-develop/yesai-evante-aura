// Label Management System
class LabelManagement {
    constructor() {
        this.labels = [];
        this.fetchLabels();
        this.setupEventListeners();
    }

    // Fetch labels from the database
    fetchLabels() {
        fetch('/message/get_labels', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    this.labels = data.labels;
                    // Update global labels if they exist
                    if (window.labels) {
                        window.labels = this.labels;
                    }
                    console.log('Labels fetched successfully:', this.labels);
                } else {
                    console.error('Failed to fetch labels:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching labels:', error);
            });
    }

    setupEventListeners() {
        // Remove existing event listeners first
        const moreOptionsContainer = document.querySelector('.more-options-container');
        if (moreOptionsContainer) {
            const newContainer = moreOptionsContainer.cloneNode(true);
            moreOptionsContainer.parentNode.replaceChild(newContainer, moreOptionsContainer);
        }

        // Add new event listeners
        document.addEventListener('click', (e) => {
            const moreOptionsBtn = e.target.closest('.more-options-btn');
            const addLabelOption = e.target.closest('.add-label-option');
            const moreOptionsDropdown = e.target.closest('.more-options-dropdown');

            if (moreOptionsBtn) {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = moreOptionsBtn.nextElementSibling;
                if (dropdown) {
                    // Close all other dropdowns first
                    document.querySelectorAll('.more-options-dropdown').forEach(d => {
                        if (d !== dropdown) d.classList.remove('show');
                    });
                    dropdown.classList.toggle('show');
                }
            } else if (addLabelOption) {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = addLabelOption.closest('.more-options-dropdown');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
                this.showAddLabelModal();
            } else if (!moreOptionsDropdown) {
                // Close all dropdowns when clicking outside
                document.querySelectorAll('.more-options-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });
    }

    // แก้ไขตรงนี้: typo ในชื่อฟังก์ชัน fuctionsshowAddLabelModal เป็น showAddLabelModal
    showAddLabelModal() {
        console.log('Showing add label modal');
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);

        modalContainer.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Label</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="label-input-container">
                        <input type="text" class="label-input" placeholder="Label name">
                        <input type="color" class="color-picker" value="#1890ff">
                    </div>
                    <div class="label-preview">
                        Preview: 
                        <span class="label-preview-text">
                            <span class="preview-dot"></span>
                            <span class="preview-name">Label Preview</span>
                        </span>
                    </div>
                    <div class="existing-labels">
                        <h4>Existing Labels</h4>
                        <div class="label-list"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary cancel-btn">Cancel</button>
                    <button class="btn-primary save-btn">sss</button>
                </div>
            </div>
        `;

        // Add styles for the preview
        const previewText = modalContainer.querySelector('.label-preview-text');
        previewText.style.display = 'inline-flex';
        previewText.style.alignItems = 'center';
        previewText.style.padding = '4px 12px';
        previewText.style.border = '1px solid #e0e0e0';
        previewText.style.borderRadius = '20px';
        previewText.style.backgroundColor = '#ffffff';

        const previewDot = modalContainer.querySelector('.preview-dot');
        previewDot.style.width = '8px';
        previewDot.style.height = '8px';
        previewDot.style.borderRadius = '50%';
        previewDot.style.backgroundColor = '#1890ff';
        previewDot.style.display = 'inline-block';
        previewDot.style.marginRight = '8px';

        // เพิ่ม animation ให้ modal
        setTimeout(() => {
            modalContainer.classList.add('active');
        }, 10);

        this.setupModalEventListeners(modalContainer);
        this.renderExistingLabels(modalContainer);
    }

    // Update the setupModalEventListeners method in LabelManagement class
    setupModalEventListeners(modalContainer) {
        const closeBtn = modalContainer.querySelector('.close-modal');
        const cancelBtn = modalContainer.querySelector('.cancel-btn');
        const saveBtn = modalContainer.querySelector('.save-btn');
        const labelInput = modalContainer.querySelector('.label-input');
        const colorPicker = modalContainer.querySelector('.color-picker');
        const previewDot = modalContainer.querySelector('.preview-dot');
        const previewName = modalContainer.querySelector('.preview-name');

        // Update preview when input changes
        labelInput.addEventListener('input', () => {
            previewName.textContent = labelInput.value || 'Label Preview';
        });

        colorPicker.addEventListener('input', () => {
            previewDot.style.backgroundColor = colorPicker.value;
        });

        // Improved close modal function
        const closeModal = () => {
            if (!modalContainer.classList.contains('active')) return;

            modalContainer.classList.remove('active');

            // Remove any other visible modals with the same class
            document.querySelectorAll('.modal-container').forEach(modal => {
                if (modal !== modalContainer) {
                    modal.remove();
                }
            });

            setTimeout(() => {
                if (document.body.contains(modalContainer)) {
                    modalContainer.remove();
                }
            }, 300);
        };

        // Add event listeners with proper event handling
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });

        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            }
        });

        // Save label
        saveBtn.addEventListener('click', () => {
            const labelName = labelInput.value.trim();
            const labelColor = colorPicker.value;

            if (labelName) {
                // Get CSRF token from meta tag
                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                console.log('Sending request to save label:', {
                    name: labelName,
                    color: labelColor,
                    token: token
                });

                // Send data to PHP endpoint
                fetch('/message/save_label', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token,
                        'Accept': 'application/json'
                    },
                    credentials: 'same-origin', // Add this to include cookies
                    body: JSON.stringify({
                        name: labelName,
                        color: labelColor,
                        _token: token // Add token in body as well
                    })
                })
                    .then(response => {
                        console.log('Response status:', response.status);
                        console.log('Response headers:', response.headers);

                        if (!response.ok) {
                            throw new Error('Network response was not ok: ' + response.status);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Response:', data); // Add this for debugging
                        if (data.success) {
                            const newLabel = {
                                id: data.label.id,
                                name: labelName,
                                color: labelColor
                            };

                            // Add new label to the array
                            this.labels.push(newLabel);

                            // Update global labels if they exist
                            if (window.labels) {
                                window.labels = this.labels;
                            }

                            // Update labels list in modal
                            this.renderExistingLabels(modalContainer);

                            // Remove old success message if exists
                            const oldMsg = modalContainer.querySelector('.success-message');
                            if (oldMsg) {
                                oldMsg.remove();
                            }

                            // Show success message
                            const successMsg = document.createElement('div');
                            successMsg.className = 'success-message';
                            successMsg.textContent = `Label "${labelName}" added successfully!`;

                            // Add animation styles
                            successMsg.style.opacity = '0';
                            successMsg.style.transform = 'translateY(-10px)';
                            successMsg.style.transition = 'all 0.3s ease';

                            // Insert message at the top of the form
                            const modalBody = modalContainer.querySelector('.modal-body');
                            modalBody.insertBefore(successMsg, modalBody.firstChild);

                            // Animate in
                            setTimeout(() => {
                                successMsg.style.opacity = '1';
                                successMsg.style.transform = 'translateY(0)';
                            }, 10);

                            // Clear form for next label
                            labelInput.value = '';
                            previewName.textContent = 'Label Preview';

                            // Fade out success message
                            setTimeout(() => {
                                successMsg.style.opacity = '0';
                                successMsg.style.transform = 'translateY(-10px)';

                                // Remove element after animation
                                setTimeout(() => {
                                    if (successMsg.parentNode) {
                                        successMsg.remove();
                                    }
                                }, 300);
                            }, 3000);

                            // Focus input for next label
                            labelInput.focus();
                        } else {
                            alert(data.message || 'Failed to save label');
                        }
                    })
                    .catch(error => {
                        console.error('Error saving label:', error);
                        alert('Failed to save label. Please try again.');
                    });
            } else {
                alert('Please enter a label name');
            }
        });
    }

    // เพิ่มฟังก์ชันใหม่เพื่อส่ง label ไปใช้กับ conversation
    applyLabelToConversation(conversationId, labelId) {
        // ค้นหา label ตาม ID
        const label = this.labels.find(l => l.id === labelId);
        if (!label) return;

        // ค้นหา conversation จาก mock data หรือ API
        // นี่เป็นแค่ตัวอย่าง คุณอาจต้องปรับให้เข้ากับโครงสร้างข้อมูลจริงของคุณ
        if (window.conversations) {
            const conversation = window.conversations.find(c => c.id === parseInt(conversationId));
            if (conversation) {
                // เพิ่ม label ให้กับ conversation
                if (!conversation.labels) {
                    conversation.labels = [];
                }

                // ตรวจสอบว่า label นี้ถูกเพิ่มไปแล้วหรือไม่
                const labelExists = conversation.labels.some(l => l.id === labelId);
                if (!labelExists) {
                    conversation.labels.push(label);

                    // อัปเดต UI (ถ้ามี)
                    this.updateConversationUI(conversationId);

                    // ส่งข้อมูลไปที่ webhook
                    this.sendLabelToWebhook(conversation, label);

                    return true;
                }
            }
        }

        return false;
    }

    // เพิ่มฟังก์ชันใหม่เพื่อส่งข้อมูลไปที่ webhook
    sendLabelToWebhook(conversation, label, eventType = 'add') {
        // ดึง lineUuid จากแชทปัจจุบัน
        let lineUuid = this.getActiveLineUuid();

        // ถ้าไม่มี lineUuid จาก getActiveLineUuid ให้ลองดึงจาก conversation object ที่ส่งมา
        if (!lineUuid && conversation && conversation.lineUuid) {
            lineUuid = conversation.lineUuid;
            console.log('Using lineUuid from conversation object:', lineUuid);
        }

        // ถ้ายังไม่มี lineUuid ให้แจ้งเตือนและยกเลิกการส่งข้อมูล
        if (!lineUuid) {
            console.error('No lineUuid found. Cannot send label to webhook.');
            return;
        }

        console.log('Current lineUuid for webhook:', lineUuid);

        // ส่งข้อมูลไปที่ webhook
        fetch('https://n8n-yesai.naijai.com/webhook/update-label', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                label_id: label.id,
                label_name: label.name,
                label_color: label.color,
                lineUuid: lineUuid,
                timestamp: new Date().toISOString(),
                event_type: eventType
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.status);
                }
                console.log('Data sent to webhook successfully');
            })
            .catch(error => {
                console.error('Error sending data to webhook:', error);
            });
    }

    // เพิ่มฟังก์ชันเพื่ออัปเดต UI ของ conversation
    updateConversationUI(conversationId) {
        // ค้นหา conversation item ใน DOM
        const conversationItem = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
        if (!conversationItem) return;

        // ค้นหาข้อมูล conversation
        if (window.conversations) {
            const conversation = window.conversations.find(c => c.id === parseInt(conversationId));
            if (conversation && conversation.labels) {
                // ตรวจสอบว่ามี labels container หรือไม่
                let labelsContainer = conversationItem.querySelector('.conversation-labels');
                if (!labelsContainer) {
                    // สร้าง container ใหม่
                    labelsContainer = document.createElement('div');
                    labelsContainer.className = 'conversation-labels';

                    // แทรกหลัง conversation-meta
                    const metaContainer = conversationItem.querySelector('.conversation-meta');
                    if (metaContainer) {
                        metaContainer.appendChild(labelsContainer);
                    }
                }

                // อัปเดต HTML ของ labels container
                labelsContainer.innerHTML = conversation.labels.map(label =>
                    `<span class="conversation-label" style="background-color: ${label.color};">${label.name}</span>`
                ).join('');
            }
        }
    }

    renderExistingLabels(modalContainer) {
        const labelList = modalContainer.querySelector('.label-list');
        labelList.innerHTML = ''; // Clear existing labels

        if (this.labels.length === 0) {
            const noLabelsMsg = document.createElement('div');
            noLabelsMsg.className = 'no-labels-message';
            noLabelsMsg.textContent = 'No labels found. Create your first label!';
            labelList.appendChild(noLabelsMsg);
            return;
        }

        // ดึง lineUuid จาก getActiveLineUuid method
        const lineUuid = this.getActiveLineUuid();
        console.log('Current lineUuid for labels:', lineUuid);

        this.labels.forEach(label => {
            const labelElement = document.createElement('div');
            labelElement.className = 'label-item';
            labelElement.innerHTML = `
                <span class="color-dot" style="background-color: ${label.color}"></span>
                <span class="label-text">${label.name}</span>
            `;

            // Add styles directly to the elements
            labelElement.style.display = 'flex';
            labelElement.style.alignItems = 'center';
            labelElement.style.padding = '8px 12px';
            labelElement.style.margin = '4px 0';
            labelElement.style.border = '1px solid #e0e0e0';
            labelElement.style.borderRadius = '20px';
            labelElement.style.cursor = 'pointer';
            labelElement.style.transition = 'all 0.2s';
            labelElement.style.backgroundColor = '#ffffff';
            labelElement.style.position = 'relative'; // Add this for absolute positioning of feedback

            // Style for the color dot
            const colorDot = labelElement.querySelector('.color-dot');
            colorDot.style.width = '8px';
            colorDot.style.height = '8px';
            colorDot.style.borderRadius = '50%';
            colorDot.style.display = 'inline-block';
            colorDot.style.marginRight = '8px';

            // Style for the label text
            const labelText = labelElement.querySelector('.label-text');
            labelText.style.color = '#333333';

            // Hover effect
            labelElement.addEventListener('mouseover', () => {
                labelElement.style.backgroundColor = '#f5f5f5';
            });
            labelElement.addEventListener('mouseout', () => {
                labelElement.style.backgroundColor = '#ffffff';
            });

            // เพิ่ม event listener สำหรับการคลิก
            labelElement.addEventListener('click', () => {
                // ดึง lineUuid จากแชทปัจจุบัน
                const currentLineUuid = this.getActiveLineUuid();

                if (!currentLineUuid) {
                    console.error('No active conversation found. Cannot apply label.');
                    alert('Please select a conversation first.');
                    return;
                }

                console.log('Applying label to conversation:', currentLineUuid);

                // ส่งข้อมูลไปที่ webhook
                this.sendLabelToWebhook({
                    id: 'clicked_label',
                    title: 'Label Clicked',
                    sender: 'User',
                    date: new Date().toISOString(),
                    lineUuid: currentLineUuid // ใช้ lineUuid จากแชทปัจจุบัน
                }, label);

                // แสดง feedback ว่าส่งข้อมูลสำเร็จ
                const feedback = document.createElement('div');
                feedback.className = 'label-feedback';
                feedback.textContent = '✓ Sent to Make.com';
                feedback.style.position = 'absolute';
                feedback.style.right = '10px';
                feedback.style.top = '50%';
                feedback.style.transform = 'translateY(-50%)';
                feedback.style.color = '#52c41a';
                feedback.style.fontSize = '12px';
                feedback.style.opacity = '0';
                feedback.style.transition = 'opacity 0.3s';

                labelElement.appendChild(feedback);

                // แสดง feedback
                setTimeout(() => {
                    feedback.style.opacity = '1';
                }, 0);

                // ซ่อน feedback หลังจาก 2 วินาที
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    setTimeout(() => {
                        if (feedback.parentNode) {
                            feedback.parentNode.removeChild(feedback);
                        }
                    }, 300);
                }, 2000);
            });

            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-label-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.style.marginLeft = 'auto';
            deleteBtn.style.background = 'none';
            deleteBtn.style.border = 'none';
            deleteBtn.style.color = '#999';
            deleteBtn.style.fontSize = '18px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.padding = '0 4px';

            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Delete label "${label.name}"?`)) {
                    this.deleteLabel(label.id);
                    this.renderExistingLabels(modalContainer);
                }
            };

            labelElement.appendChild(deleteBtn);
            labelList.appendChild(labelElement);
        });
    }

    // Helper method to get active conversation ID
    getActiveConversationId() {
        // Check if there's an active conversation selected in the UI
        const activeConversationItem = document.querySelector('.conversation-item.active');
        if (activeConversationItem) {
            return activeConversationItem.getAttribute('data-id');
        }

        // Try to get from URL
        const urlParams = new URLSearchParams(window.location.search);
        const conversationId = urlParams.get('conversation_id');
        if (conversationId) {
            return conversationId;
        }

        // Check for chat container data
        const chatContainer = document.querySelector('.chat-container[data-conversation-id]');
        if (chatContainer) {
            return chatContainer.getAttribute('data-conversation-id');
        }

        return null;
    }

    // Helper method to get active conversation object
    getActiveConversation() {
        // วิธีที่ 1: ตรวจสอบแชทที่กำลังดูอยู่จาก URL
        const urlParams = new URLSearchParams(window.location.search);
        const lineUuid = urlParams.get('lineUuid');
        if (lineUuid) {
            console.log('Found lineUuid from URL:', lineUuid);
            return { lineUuid: lineUuid };
        }

        // วิธีที่ 2: ตรวจสอบแชทที่กำลังดูอยู่จาก active chat container
        const activeChat = document.querySelector('.chat-container.active');
        if (activeChat) {
            const lineUuid = activeChat.getAttribute('data-line-uuid');
            if (lineUuid) {
                console.log('Found lineUuid from active chat:', lineUuid);
                return { lineUuid: lineUuid };
            }
        }

        // วิธีที่ 3: ตรวจสอบแชทที่กำลังดูอยู่จาก active conversation item
        const activeConversationItem = document.querySelector('.conversation-item.active');
        if (activeConversationItem) {
            const lineUuid = activeConversationItem.getAttribute('data-line-uuid');
            if (lineUuid) {
                console.log('Found lineUuid from active conversation item:', lineUuid);
                return { lineUuid: lineUuid };
            }
        }

        // วิธีที่ 4: ตรวจสอบแชทที่กำลังดูอยู่จาก window.currentChat
        if (window.currentChat && window.currentChat.lineUuid) {
            console.log('Found lineUuid from window.currentChat:', window.currentChat.lineUuid);
            return { lineUuid: window.currentChat.lineUuid };
        }

        // วิธีที่ 5: ตรวจสอบแชทที่กำลังดูอยู่จาก element ที่มี data-line-uuid
        const elementWithLineUuid = document.querySelector('[data-line-uuid]');
        if (elementWithLineUuid) {
            const lineUuid = elementWithLineUuid.getAttribute('data-line-uuid');
            console.log('Found lineUuid from element with data-line-uuid:', lineUuid);
            return { lineUuid: lineUuid };
        }

        console.log('No active conversation found');
        return null;
    }

    // Helper method to get active line UUID
    getActiveLineUuid() {
        // Try to get from active conversation item's data-id attribute (most reliable)
        const activeConversationItem = document.querySelector('.conversation-item.active');
        if (activeConversationItem) {
            const lineUuid = activeConversationItem.getAttribute('data-id');
            if (lineUuid) {
                console.log('Found lineUuid from active conversation item:', lineUuid);
                return lineUuid;
            }
        }

        // Try to get from chat mode selector (like statuswebhook.js)
        const chatModeSelect = document.querySelector('.chat-mode-select');
        if (chatModeSelect && chatModeSelect.dataset.lineUuid) {
            const lineUuid = chatModeSelect.dataset.lineUuid;
            console.log('Found lineUuid from chat mode selector:', lineUuid);
            return lineUuid;
        }

        // Try to get from currentState.currentConversationId (like app.js)
        if (window.currentState && window.currentState.currentConversationId) {
            console.log('Found lineUuid from currentState:', window.currentState.currentConversationId);
            return window.currentState.currentConversationId;
        }

        // Try to get from URL
        const urlParams = new URLSearchParams(window.location.search);
        const lineUuid = urlParams.get('lineUuid');
        if (lineUuid) {
            console.log('Found lineUuid from URL:', lineUuid);
            return lineUuid;
        }

        // Try to get from window.currentChat
        if (window.currentChat && window.currentChat.lineUuid) {
            console.log('Found lineUuid from window.currentChat:', window.currentChat.lineUuid);
            return window.currentChat.lineUuid;
        }

        // Try to get from data attribute
        const element = document.querySelector('[data-line-uuid]');
        if (element) {
            const lineUuid = element.getAttribute('data-line-uuid');
            console.log('Found lineUuid from data attribute:', lineUuid);
            return lineUuid;
        }

        console.log('No lineUuid found');
        return null;
    }

    deleteLabel(labelId) {
        // Get CSRF token from meta tag
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        console.log('Sending request to delete label:', {
            id: labelId,
            token: token
        });

        // Find the label object before deleting
        const labelToDelete = this.labels.find(label => label.id === labelId);

        // Send request to delete label from database
        fetch(`/message/delete_label/${labelId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
                'Accept': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                _token: token
            })
        })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    this.labels = this.labels.filter(label => label.id !== labelId);

                    if (window.labels) {
                        window.labels = this.labels;
                    }

                    console.log('Label deleted successfully');

                    // ✅ Fix: get lineUuid first
                    if (labelToDelete) {
                        const currentLineUuid = this.getActiveLineUuid();
                        this.sendLabelToWebhook(
                            { lineUuid: currentLineUuid }, // ✅ pass lineUuid properly
                            labelToDelete,
                            'remove'
                        );
                    }
                }
            })
            .catch(error => {
                console.error('Error deleting label:', error);
                alert('Failed to delete label. Please try again.');
            });
    }
}

// Initialize Label Management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // เพิ่มส่วนนี้เพื่อให้ทำงานกับตัวแปร global labels ที่ใช้ในไฟล์ app.js
    if (window.labels) {
        window.labelManagement = new LabelManagement();
        window.labelManagement.labels = window.labels;
    } else {
        window.labels = [
            { id: 1, name: 'Important', color: '#f5222d' },
            { id: 2, name: 'Follow Up', color: '#52c41a' },
            { id: 3, name: 'Urgent', color: '#faad14' },
            { id: 4, name: 'Priority', color: '#1890ff' }
        ];
        window.labelManagement = new LabelManagement();
    }
});

// เพิ่มฟังก์ชัน global เพื่อให้สามารถเรียกใช้ได้จากภายนอก
window.showAddLabelModal = function (conversationId) {
    if (window.labelManagement) {
        window.labelManagement.showAddLabelModal(conversationId);
    } else {
        console.error('LabelManagement is not initialized');
    }
};