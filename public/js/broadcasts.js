document.addEventListener('DOMContentLoaded', function () {
    // เพิ่มตัวแปรในระดับ global เพื่อติดตามการอัปเดต
    let previewUpdateTimeout;

    // Schedule options (Schedule/Now)
    const sendNow = document.getElementById('sendNow');
    const schedule = document.getElementById('schedule');
    const scheduleOptions = document.getElementById('scheduleOptions');

    if (sendNow && schedule) {
        sendNow.addEventListener('change', function () {
            if (this.checked) {
                scheduleOptions.classList.add('d-none');
            }
        });

        schedule.addEventListener('change', function () {
            if (this.checked) {
                scheduleOptions.classList.remove('d-none');
            }
        });
    }

    // Targeting options (Everyone/Specific)
    const sendToEveryone = document.getElementById('sendToEveryone');
    const sendToSpecific = document.getElementById('sendToSpecific');
    const specificOptions = document.getElementById('specificOptions');
    let labelsLoaded = false;
    let labelsData = []; // [{name, count}, ...]

    if (sendToEveryone && sendToSpecific) {
        sendToEveryone.addEventListener('change', function () {
            if (this.checked) {
                specificOptions.classList.add('d-none');
            }
        });

        sendToSpecific.addEventListener('change', function () {
            if (this.checked) {
                specificOptions.classList.remove('d-none');
                if (!labelsLoaded) {
                    loadLabels();
                }
            }
        });
    }

    function loadLabels() {
        const container = document.getElementById('labelsContainer');
        const loading = document.getElementById('labelsLoading');
        if (loading) loading.style.display = '';

        fetch('/broadcasts/labels', {
            headers: { 'Accept': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if (loading) loading.style.display = 'none';

            if (!data.success || !data.labels || data.labels.length === 0) {
                container.innerHTML = '<div class="text-muted py-2"><i class="fas fa-tag me-1"></i> No labels found in contacts.</div>';
                return;
            }

            labelsData = data.labels;
            labelsLoaded = true;

            let html = '';
            data.labels.forEach(function(label, i) {
                const safeId = 'label_' + i;
                const safeName = label.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html += '<div class="mb-2">' +
                    '<div class="form-check">' +
                    '<input class="form-check-input label-check" type="checkbox" id="' + safeId + '" value="' + safeName + '" data-count="' + label.count + '">' +
                    '<label class="form-check-label d-flex justify-content-start" for="' + safeId + '">' +
                    '<div>' + safeName + '</div>' +
                    '<span class="badge bg-secondary ms-2">' + label.count + '</span>' +
                    '</label>' +
                    '</div>' +
                    '</div>';
            });
            container.innerHTML = html;

            // Attach change listeners
            container.querySelectorAll('.label-check').forEach(function(cb) {
                cb.addEventListener('change', updateAudienceCount);
            });
            updateAudienceCount();
        })
        .catch(function(err) {
            if (loading) loading.style.display = 'none';
            container.innerHTML = '<div class="text-danger py-2"><i class="fas fa-exclamation-circle me-1"></i> Failed to load labels.</div>';
            console.error('Labels fetch error:', err);
        });
    }

    function updateAudienceCount() {
        const audienceCount = document.getElementById('audienceCount');
        if (!audienceCount) return;

        const checked = document.querySelectorAll('.label-check:checked');
        let total = 0;
        checked.forEach(function(cb) {
            total += parseInt(cb.getAttribute('data-count') || '0', 10);
        });

        if (checked.length === 0) {
            audienceCount.textContent = '0 contacts';
        } else {
            audienceCount.textContent = checked.length + ' label' + (checked.length > 1 ? 's' : '') + ' (' + total + ' contacts)';
        }
    }

    // Message actions
    const messageCanvas = document.getElementById('messageCanvas');

    // Handle initial message block
    const initialTextBlock = messageCanvas.querySelector('.text-block');
    if (initialTextBlock) {
        // Add event listener to the initial textarea for real-time preview
        const textarea = initialTextBlock.querySelector('textarea');
        if (textarea) {
            textarea.addEventListener('input', function () {
                updateMessagePreview();
            });
        }

        // Delete button functionality
        const deleteBtn = initialTextBlock.querySelector('.fa-trash-alt').closest('button');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                initialTextBlock.remove();
                updateMessagePreview();
            });
        }
    }

    // Add message type buttons
    const addTextBtn = document.getElementById('addTextBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const addRichBtn = document.getElementById('addRichBtn');
    const addCardBtn = document.getElementById('addCardBtn');

    if (addTextBtn) {
        addTextBtn.addEventListener('click', function () {
            const textBlock = document.createElement('div');
            textBlock.className = 'message-block text-block';
            textBlock.innerHTML = `
                <textarea class="form-control" rows="4" placeholder="Enter your message here..."></textarea>
                <div class="message-block-actions">
                    <button type="button" class="btn btn-sm btn-light"><i class="fas fa-arrows-alt"></i></button>
                    <button type="button" class="btn btn-sm btn-light delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            messageCanvas.appendChild(textBlock);

            // Add event listener to new textarea
            const textarea = textBlock.querySelector('textarea');
            textarea.addEventListener('input', function () {
                updateMessagePreview();
            });

            // Delete button functionality
            const deleteBtn = textBlock.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function () {
                textBlock.remove();
                updateMessagePreview();
            });

            // Set focus to new textarea
            textarea.focus();

            // Update preview
            updateMessagePreview();
        });
    }

    if (addImageBtn) {
        addImageBtn.addEventListener('click', function () {
            // Template HTML for image block
            const template = document.getElementById('imageMessageTemplate');
            const clone = template.content.cloneNode(true);
            messageCanvas.appendChild(clone);

            // Get the newly added block
            const imageBlock = messageCanvas.lastElementChild;

            // Add click handler to placeholder
            const placeholder = imageBlock.querySelector('.placeholder-content');
            const fileInput = imageBlock.querySelector('input[type="file"]');

            placeholder.addEventListener('click', function () {
                fileInput.click();
            });

            // Handle file upload
            fileInput.addEventListener('change', function (e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    const previewImage = imageBlock.querySelector('.preview-image');

                    reader.onload = function (e) {
                        previewImage.src = e.target.result;
                        previewImage.classList.remove('d-none');
                        placeholder.style.display = 'none';
                        updateMessagePreview();
                    };

                    reader.readAsDataURL(this.files[0]);
                }
            });

            // Delete button functionality
            const deleteBtn = imageBlock.querySelector('.fa-trash-alt').closest('button');
            deleteBtn.addEventListener('click', function () {
                imageBlock.remove();
                updateMessagePreview();
            });

            // Update preview
            updateMessagePreview();
        });
    }

    if (addRichBtn) {
        addRichBtn.addEventListener('click', function () {
            // Template HTML for rich message block
            const template = document.getElementById('richMessageTemplate');
            const clone = template.content.cloneNode(true);
            messageCanvas.appendChild(clone);

            // Get the newly added block
            const richBlock = messageCanvas.lastElementChild;

            // Add input event handlers for real-time preview
            const inputs = richBlock.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', function () {
                    updateMessagePreview();
                });
            });

            // Delete button functionality
            const deleteBtn = richBlock.querySelector('.fa-trash-alt').closest('button');
            deleteBtn.addEventListener('click', function () {
                richBlock.remove();
                updateMessagePreview();
            });

            // Update preview
            updateMessagePreview();
        });
    }

    if (addCardBtn) {
        addCardBtn.addEventListener('click', function () {
            // Template HTML for card message block
            const template = document.getElementById('cardMessageTemplate');
            const clone = template.content.cloneNode(true);
            messageCanvas.appendChild(clone);

            // Get the newly added block
            const cardBlock = messageCanvas.lastElementChild;

            // Add input event handlers for real-time preview
            const inputs = cardBlock.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', function () {
                    updateMessagePreview();
                });
            });

            // Add click handler to placeholder
            const placeholder = cardBlock.querySelector('.placeholder-content');
            const fileInput = cardBlock.querySelector('input[type="file"]');

            if (placeholder && fileInput) {
                placeholder.addEventListener('click', function () {
                    fileInput.click();
                });

                // Handle file upload
                fileInput.addEventListener('change', function (e) {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        const previewImage = cardBlock.querySelector('.preview-image');

                        reader.onload = function (e) {
                            previewImage.src = e.target.result;
                            previewImage.classList.remove('d-none');
                            placeholder.style.display = 'none';
                            updateMessagePreview();
                        };

                        reader.readAsDataURL(this.files[0]);
                    }
                });
            }

            // Delete button functionality
            const deleteBtn = cardBlock.querySelector('.fa-trash-alt').closest('button');
            deleteBtn.addEventListener('click', function () {
                cardBlock.remove();
                updateMessagePreview();
            });

            // Update preview
            updateMessagePreview();
        });
    }

    // Update mobile preview with throttling to improve performance
    function updateMessagePreview() {
        // Clear previous timeout
        if (previewUpdateTimeout) {
            clearTimeout(previewUpdateTimeout);
        }

        // Set a new timeout (throttling)
        previewUpdateTimeout = setTimeout(() => {
            const previewMessages = document.getElementById('previewMessages');
            if (!previewMessages) return;

            // Clear existing messages
            previewMessages.innerHTML = '';

            // Get all message blocks
            const messageBlocks = messageCanvas.querySelectorAll('.message-block');

            // Add each message to preview
            messageBlocks.forEach(block => {
                let messageHTML = '';

                if (block.classList.contains('text-block')) {
                    const text = block.querySelector('textarea').value || 'Your message text will appear here';
                    messageHTML = `
                        <div class="chat-message">
                            <div class="message-bubble">
                                <div class="message-text">${text}</div>
                            </div>
                            
                        
                    `;
                }
                else if (block.classList.contains('image-block')) {
                    const imgSrc = block.querySelector('.preview-image')?.src || '';
                    if (imgSrc) {
                        messageHTML = `
                            <div class="chat-message">
                                <div class="message-bubble">
                                    <div class="message-image">
                                        <img src="${imgSrc}" class="img-fluid rounded mb-2">
                                    </div>
                                </div>
                                
                            </div>
                        `;
                    }
                }
                else if (block.classList.contains('rich-block')) {
                    const title = block.querySelector('input[type="text"]')?.value || 'Rich Message Title';
                    const text = block.querySelector('textarea')?.value || 'Description text';
                    const buttonText = block.querySelector('input[placeholder="Button text"]')?.value || 'Learn More';

                    messageHTML = `
                        <div class="chat-message">
                            <div class="message-bubble rich-message">
                                <div class="rich-content">
                                    <h6 class="mb-2">${title}</h6>
                                    <p class="mb-3 small">${text}</p>
                                    <button class="btn btn-sm btn-primary w-100">${buttonText}</button>
                                </div>
                            </div>
                            
                        </div>
                    `;
                }
                else if (block.classList.contains('card-block')) {
                    const title = block.querySelector('input[placeholder="Card title"]')?.value || 'Card Title';
                    const description = block.querySelector('textarea')?.value || '';
                    const buttonText = block.querySelector('input[placeholder="Button 1"]')?.value || 'Button';

                    messageHTML = `
                        <div class="chat-message">
                            <div class="message-bubble card-message">
                                <div class="card-content">
                                    <h6 class="mb-2">${title}</h6>
                                    ${description ? `<p class="mb-3 small">${description}</p>` : ''}
                                    <button class="btn btn-sm btn-outline-primary w-100">${buttonText}</button>
                                </div>
                            </div>
                            
                        </div>
                    `;
                }

                if (messageHTML) {
                    previewMessages.insertAdjacentHTML('beforeend', messageHTML);
                }
            });

            // Add more empty messages to ensure scrolling is possible
            if (messageBlocks.length < 3) {
                for (let i = 0; i < 3; i++) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'chat-message empty-space';
                    emptyMessage.style.height = '60px';
                    previewMessages.appendChild(emptyMessage);
                }
            }

            // Scroll to the bottom of preview on new content
            const mobileContent = document.querySelector('.mobile-content');
            if (mobileContent) {
                setTimeout(() => {
                    mobileContent.scrollTop = mobileContent.scrollHeight;
                }, 100);
            }
        }, 100); // 100ms throttle
    }

    // Initialize scrolling for mobile preview
    function initializeMobilePreview() {
        const mobileContent = document.querySelector('.mobile-content');
        if (!mobileContent) return;

        // Make sure the content is scrollable
        mobileContent.style.overflowY = 'auto';

        // Add touch events for mobile
        let startY, currentY;
        let initialScrollTop;
        let isTouching = false;

        // Touch events for mobile devices
        mobileContent.addEventListener('touchstart', function (e) {
            startY = e.touches[0].clientY;
            initialScrollTop = this.scrollTop;
            isTouching = true;
        }, { passive: true });

        mobileContent.addEventListener('touchmove', function (e) {
            if (!isTouching) return;

            currentY = e.touches[0].clientY;
            const diffY = startY - currentY;
            this.scrollTop = initialScrollTop + diffY;
        }, { passive: true });

        mobileContent.addEventListener('touchend', function () {
            isTouching = false;
        }, { passive: true });

        // Mouse events for desktop
        mobileContent.addEventListener('wheel', function (e) {
            // The default behavior is fine for wheel events
        }, { passive: true });

        // Add visual scroll indicator
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.innerHTML = "";
        //     <div class="scroll-up"><i class="fas fa-chevron-up"></i></div>
        //     <div class="scroll-down"><i class="fas fa-chevron-down"></i></div>
        // `;

        const mobileFrame = document.querySelector('.mobile-frame');
        if (mobileFrame) {
            mobileFrame.appendChild(scrollIndicator);

            // Show/hide scroll indicators based on scroll position
            mobileContent.addEventListener('scroll', function () {
                const atTop = this.scrollTop <= 10;
                const atBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 10;

                scrollIndicator.querySelector('.scroll-up').style.opacity = atTop ? '0.3' : '1';
                scrollIndicator.querySelector('.scroll-down').style.opacity = atBottom ? '0.3' : '1';
            });

            // Click on indicators to scroll
            scrollIndicator.querySelector('.scroll-up').addEventListener('click', function () {
                mobileContent.scrollBy({ top: -100, behavior: 'smooth' });
            });

            scrollIndicator.querySelector('.scroll-down').addEventListener('click', function () {
                mobileContent.scrollBy({ top: 100, behavior: 'smooth' });
            });
        }
    }

    // Test broadcast button
    const testBroadcastBtn = document.getElementById('testBroadcastBtn');
    if (testBroadcastBtn) {
        testBroadcastBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const testModal = new bootstrap.Modal(document.getElementById('testBroadcastModal'));
            testModal.show();
        });

        // Send test button in modal
        const sendTestBtn = document.querySelector('#testBroadcastModal .btn-primary');
        if (sendTestBtn) {
            sendTestBtn.addEventListener('click', function () {
                const testEmail = document.getElementById('testEmail');
                const testPhone = document.getElementById('testPhone');

                if ((!testEmail || !testEmail.value) && (!testPhone || !testPhone.value)) {
                    alert('Please enter at least one contact method for testing');
                    return;
                }

                // Show success message
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success mt-3';
                successAlert.textContent = 'Test broadcast sent successfully!';

                const modalBody = document.querySelector('#testBroadcastModal .modal-body');
                modalBody.appendChild(successAlert);

                // Close modal after delay
                setTimeout(() => {
                    bootstrap.Modal.getInstance(document.getElementById('testBroadcastModal')).hide();

                    // Remove success message on close
                    setTimeout(() => {
                        successAlert.remove();
                        if (testEmail) testEmail.value = '';
                        if (testPhone) testPhone.value = '';
                    }, 300);
                }, 1500);
            });
        }
    }

    // Form submission
    const broadcastForm = document.getElementById('broadcastForm');
    if (broadcastForm) {
        broadcastForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate form
            let isValid = true;

            // Title validation
            const broadcastTitle = document.getElementById('broadcastTitle');
            if (!broadcastTitle.value.trim()) {
                broadcastTitle.classList.add('is-invalid');
                if (!broadcastTitle.nextElementSibling || !broadcastTitle.nextElementSibling.classList.contains('invalid-feedback')) {
                    const feedback = document.createElement('div');
                    feedback.className = 'invalid-feedback';
                    feedback.textContent = 'Please enter a title for your broadcast';
                    broadcastTitle.parentNode.appendChild(feedback);
                }
                isValid = false;
            } else {
                broadcastTitle.classList.remove('is-invalid');
            }

            // Validate schedule if enabled
            if (document.getElementById('schedule') && document.getElementById('schedule').checked) {
                const scheduleDate = document.getElementById('scheduleDate');
                const scheduleTime = document.getElementById('scheduleTime');

                if (!scheduleDate.value) {
                    scheduleDate.classList.add('is-invalid');
                    isValid = false;
                } else {
                    scheduleDate.classList.remove('is-invalid');
                }

                if (!scheduleTime.value) {
                    scheduleTime.classList.add('is-invalid');
                    isValid = false;
                } else {
                    scheduleTime.classList.remove('is-invalid');
                }
            }

            // Check if message canvas has content
            if (messageCanvas.children.length === 0) {
                const alert = document.createElement('div');
                alert.className = 'alert alert-danger';
                alert.textContent = 'Please add at least one message to your broadcast';
                messageCanvas.parentNode.insertBefore(alert, messageCanvas);

                setTimeout(() => {
                    alert.remove();
                }, 3000);

                isValid = false;
            }

            // Collect the text message from all text blocks
            const textBlocks = messageCanvas.querySelectorAll('.text-block textarea');
            let fullMessage = '';
            textBlocks.forEach(ta => {
                const val = ta.value.trim();
                if (val) {
                    fullMessage += (fullMessage ? '\n' : '') + val;
                }
            });

            if (!fullMessage) {
                const alert = document.createElement('div');
                alert.className = 'alert alert-danger';
                alert.textContent = 'Please enter a message text for your broadcast';
                messageCanvas.parentNode.insertBefore(alert, messageCanvas);
                setTimeout(() => alert.remove(), 3000);
                isValid = false;
            }

            if (!isValid) return;

            // Get selected channel
            const selectedChannel = document.querySelector('input[name="channel"]:checked');
            const channel = selectedChannel ? selectedChannel.value : '';

            // Get targeting
            const selectedTargeting = document.querySelector('input[name="targeting"]:checked');
            const targeting = selectedTargeting ? selectedTargeting.value : 'everyone';
            const selectedTiming = document.querySelector('input[name="timing"]:checked');
            const timing = selectedTiming ? selectedTiming.value : 'now';
            const scheduleDateValue = document.getElementById('scheduleDate')?.value || '';
            const scheduleTimeValue = document.getElementById('scheduleTime')?.value || '';

            // --- LINE Broadcast ---
            if (channel === 'line') {
                const title = broadcastTitle.value.trim();
                const isScheduled = timing === 'schedule';

                // Collect selected labels for specific targeting
                let selectedLabels = [];
                if (targeting === 'specific') {
                    document.querySelectorAll('.label-check:checked').forEach(function(cb) {
                        selectedLabels.push(cb.value);
                    });
                    if (selectedLabels.length === 0) {
                        const warnAlert = document.createElement('div');
                        warnAlert.className = 'alert alert-warning alert-dismissible fade show';
                        warnAlert.innerHTML = '<strong>No labels selected</strong>' +
                            '<p class="mb-0 mt-1">Please select at least one label to target specific people.</p>' +
                            '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
                        const cardBody = broadcastForm.closest('.card-body');
                        cardBody.insertBefore(warnAlert, cardBody.firstChild);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        return;
                    }
                }

                // Confirmation dialog
                let confirmMsg = '⚠️ ' + (isScheduled ? 'Schedule LINE Broadcast' : 'Send LINE Broadcast') + '\n\n' +
                    'Title: ' + title + '\n' +
                    'Message: ' + fullMessage.substring(0, 80) + (fullMessage.length > 80 ? '...' : '') + '\n\n';

                if (targeting === 'specific') {
                    confirmMsg += 'Target: Contacts with labels: ' + selectedLabels.join(', ') + '\n';
                } else {
                    confirmMsg += (isScheduled
                        ? ('This will schedule for: ' + scheduleDateValue + ' ' + scheduleTimeValue + ' (Asia/Bangkok).\n')
                        : 'This will send to ALL LINE followers immediately.\n');
                }
                confirmMsg += 'Are you sure?';

                if (!confirm(confirmMsg)) {
                    return;
                }

                // Show loading state
                const sendBtn = document.getElementById('sendBroadcastBtn');
                const originalBtnText = sendBtn.textContent;
                sendBtn.disabled = true;
                sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> ' + (isScheduled ? 'Scheduling...' : 'Sending...');

                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                if (!csrfToken) {
                    alert('CSRF token is missing. Please refresh the page and try again.');
                    sendBtn.disabled = false;
                    sendBtn.textContent = originalBtnText;
                    return;
                }

                // Build request body
                const requestBody = {
                    message: fullMessage,
                    title: title,
                    channel: channel,
                    targeting: targeting,
                    timing: timing,
                    schedule_date: scheduleDateValue,
                    schedule_time: scheduleTimeValue,
                };
                if (targeting === 'specific') {
                    requestBody.labels = selectedLabels;
                }

                // Send to backend
                fetch('/broadcasts/send-line', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify(requestBody)
                })
                    .then(res => res.json().then(data => ({ status: res.status, data })))
                    .then(({ status, data }) => {
                        if (data.success) {
                            // Success
                            let successMsg = data.message || 'Your LINE broadcast has been sent.';
                            if (data.sent_count !== undefined) {
                                successMsg += ' (' + data.sent_count + '/' + data.recipient_count + ' delivered)';
                            }
                            const successAlert = document.createElement('div');
                            successAlert.className = 'alert alert-success';
                            successAlert.innerHTML = `
                            <div class="d-flex align-items-center">
                                <i class="fas fa-check-circle fa-2x me-3"></i>
                                <div>
                                    <h5 class="alert-heading mb-1">${data.scheduled ? 'Broadcast Scheduled!' : 'Broadcast Sent!'}</h5>
                                    <p class="mb-0">${successMsg}</p>
                                </div>
                            </div>
                        `;
                            const cardBody = broadcastForm.closest('.card-body');
                            cardBody.insertBefore(successAlert, cardBody.firstChild);
                            window.scrollTo({ top: 0, behavior: 'smooth' });

                            // Reset button after delay
                            setTimeout(() => {
                                sendBtn.disabled = false;
                                sendBtn.textContent = originalBtnText;
                            }, 3000);
                        } else {
                            // Error from server
                            const errorMsg = data.error || data.message || `Request failed (${status})`;
                            const validationMsg = data.errors
                                ? Object.values(data.errors).flat().join(' | ')
                                : '';
                            const detailMsg = data.details
                                ? ('\n' + JSON.stringify(data.details))
                                : (validationMsg ? ('\n' + validationMsg) : '');

                            const errorAlert = document.createElement('div');
                            errorAlert.className = 'alert alert-danger alert-dismissible fade show';
                            errorAlert.innerHTML = `
                            <strong><i class="fas fa-exclamation-triangle me-1"></i> Broadcast Failed</strong>
                            <p class="mb-0 mt-1">${errorMsg}${detailMsg ? '<br><small class="text-muted">' + detailMsg + '</small>' : ''}</p>
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        `;
                            const cardBody = broadcastForm.closest('.card-body');
                            cardBody.insertBefore(errorAlert, cardBody.firstChild);
                            window.scrollTo({ top: 0, behavior: 'smooth' });

                            sendBtn.disabled = false;
                            sendBtn.textContent = originalBtnText;
                        }
                    })
                    .catch(err => {
                        console.error('Broadcast fetch error:', err);
                        alert('Network error: ' + err.message);
                        sendBtn.disabled = false;
                        sendBtn.textContent = originalBtnText;
                    });

                return; // Done — don't fall through
            }

            // --- Other channels (not yet implemented) ---
            const infoAlert = document.createElement('div');
            infoAlert.className = 'alert alert-info alert-dismissible fade show';
            infoAlert.innerHTML = `
                <strong>Channel not available</strong>
                <p class="mb-0 mt-1">Only LINE broadcast is supported at the moment. Please select the LINE channel.</p>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            const cardBody = broadcastForm.closest('.card-body');
            cardBody.insertBefore(infoAlert, cardBody.firstChild);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // แก้ไขฟังก์ชัน setupDragAndDrop เพื่อให้สามารถลากบล็อกไปตำแหน่งบนสุดและล่างสุดได้
    function setupDragAndDrop() {
        const messageCanvas = document.getElementById('messageCanvas');
        if (!messageCanvas) return;

        // เก็บตัวแปรที่ใช้ร่วมกันสำหรับการลากและวาง
        let draggedBlock = null;
        let placeholder = null;
        let mouseUpHandler = null;
        let mouseMoveHandler = null;

        // เคลียร์สถานะการลากที่อาจค้างคาจากครั้งก่อน
        document.removeEventListener('mouseup', mouseUpHandler);
        document.removeEventListener('mousemove', mouseMoveHandler);

        if (draggedBlock && document.body.contains(draggedBlock)) {
            document.body.removeChild(draggedBlock);
        }

        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }

        // ฟังก์ชันสำหรับตั้งค่าปุ่ม move สำหรับบล็อก
        function setupMoveButtonForBlock(block) {
            const moveBtn = block.querySelector('.fa-arrows-alt')?.closest('button');
            if (!moveBtn) return;

            // ป้องกันการเพิ่ม event listener ซ้ำ
            moveBtn.removeEventListener('mousedown', handleMouseDown);
            moveBtn.addEventListener('mousedown', handleMouseDown);

            function handleMouseDown(e) {
                e.preventDefault();
                e.stopPropagation();

                // ถ้ามีการลากอยู่แล้ว ให้ยกเลิกก่อน
                if (draggedBlock || placeholder) {
                    cleanupDrag();
                }

                const rect = block.getBoundingClientRect();
                const initialY = e.clientY;
                const initialTop = rect.top;

                // สร้าง placeholder
                placeholder = document.createElement('div');
                placeholder.className = 'message-block-placeholder';
                placeholder.style.height = rect.height + 'px';
                placeholder.style.border = '2px dashed #4e73df';
                placeholder.style.borderRadius = '5px';
                placeholder.style.marginBottom = '15px';
                placeholder.style.backgroundColor = '#f8f9fc';

                // ตั้งค่า style สำหรับการลาก
                block.style.position = 'absolute';
                block.style.zIndex = '1000';
                block.style.width = rect.width + 'px';
                block.style.left = rect.left + 'px';
                block.style.top = initialTop + 'px';
                block.style.opacity = '0.9';
                block.style.cursor = 'grabbing';
                block.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';

                // แทนที่บล็อกด้วย placeholder
                block.parentNode.insertBefore(placeholder, block);
                document.body.appendChild(block);

                draggedBlock = block;

                // ฟังก์ชันจัดการ mouse move
                mouseMoveHandler = function (e) {
                    // อัปเดตตำแหน่งของบล็อกที่ลาก
                    const newY = initialTop + (e.clientY - initialY);
                    draggedBlock.style.top = newY + 'px';

                    // หาตำแหน่งใหม่ของ placeholder
                    const allBlocks = Array.from(messageCanvas.children);

                    // ตรวจสอบว่าควรวางที่ตำแหน่งบนสุด
                    const firstBlock = allBlocks[0];
                    if (firstBlock && e.clientY < firstBlock.getBoundingClientRect().top + 20 && firstBlock !== placeholder) {
                        messageCanvas.insertBefore(placeholder, firstBlock);
                        return; // จบการทำงานหากวางที่ตำแหน่งบนสุด
                    }

                    // ตรวจสอบว่าควรวางที่ตำแหน่งล่างสุด
                    const lastBlock = allBlocks[allBlocks.length - 1];
                    if (lastBlock && e.clientY > lastBlock.getBoundingClientRect().bottom - 20 && lastBlock !== placeholder) {
                        messageCanvas.appendChild(placeholder);
                        return; // จบการทำงานหากวางที่ตำแหน่งล่างสุด
                    }

                    // ตรวจสอบตำแหน่งระหว่างบล็อก
                    for (let i = 0; i < allBlocks.length - 1; i++) {
                        if (allBlocks[i] === placeholder) continue;

                        const currentBlock = allBlocks[i];
                        const nextBlock = allBlocks[i + 1];

                        if (nextBlock === placeholder) continue;

                        const currentRect = currentBlock.getBoundingClientRect();
                        const nextRect = nextBlock.getBoundingClientRect();

                        // หาจุดกึ่งกลางระหว่างบล็อกปัจจุบันและบล็อกถัดไป
                        const midPoint = currentRect.bottom + (nextRect.top - currentRect.bottom) / 2;

                        if (e.clientY > currentRect.top && e.clientY < midPoint) {
                            // วางที่ด้านบนของบล็อกปัจจุบัน
                            if (placeholder !== currentBlock.previousSibling) {
                                messageCanvas.insertBefore(placeholder, currentBlock);
                            }
                            return;
                        } else if (e.clientY >= midPoint && e.clientY < nextRect.bottom) {
                            // วางที่ด้านล่างของบล็อกปัจจุบันและด้านบนของบล็อกถัดไป
                            if (placeholder !== nextBlock.previousSibling) {
                                messageCanvas.insertBefore(placeholder, nextBlock);
                            }
                            return;
                        }
                    }
                };

                // ฟังก์ชันจัดการ mouse up
                mouseUpHandler = function (e) {
                    if (!draggedBlock) return;

                    try {
                        // คืนค่า style กลับเป็นปกติ
                        draggedBlock.style.position = '';
                        draggedBlock.style.zIndex = '';
                        draggedBlock.style.width = '';
                        draggedBlock.style.left = '';
                        draggedBlock.style.top = '';
                        draggedBlock.style.opacity = '';
                        draggedBlock.style.cursor = '';
                        draggedBlock.style.boxShadow = '';

                        // วางบล็อกใหม่ในตำแหน่งของ placeholder
                        if (placeholder && placeholder.parentNode) {
                            placeholder.parentNode.insertBefore(draggedBlock, placeholder);
                            placeholder.remove();
                        } else {
                            // กรณีที่ placeholder หายไป
                            messageCanvas.appendChild(draggedBlock);
                        }

                        // ตรวจสอบถ้ายังอยู่ใน body ให้ลบออก
                        if (document.body.contains(draggedBlock) && draggedBlock.parentNode === document.body) {
                            document.body.removeChild(draggedBlock);
                        }
                    } catch (err) {
                        console.error("Error during drag end:", err);

                        // Recovery: ensure block is back in the message canvas
                        if (!document.contains(draggedBlock)) {
                            messageCanvas.appendChild(draggedBlock);
                        }
                    }

                    // เคลียร์ event listeners
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);

                    // รีเซ็ตตัวแปร
                    draggedBlock = null;
                    placeholder = null;

                    // อัปเดต preview
                    updateMessagePreview();
                };

                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            }
        }

        // ฟังก์ชันเคลียร์สถานะการลาก (ใช้ในกรณีที่มีปัญหา)
        function cleanupDrag() {
            if (mouseUpHandler) {
                document.removeEventListener('mouseup', mouseUpHandler);
            }

            if (mouseMoveHandler) {
                document.removeEventListener('mousemove', mouseMoveHandler);
            }

            if (draggedBlock) {
                try {
                    // คืนค่า style กลับเป็นปกติ
                    draggedBlock.style.position = '';
                    draggedBlock.style.zIndex = '';
                    draggedBlock.style.width = '';
                    draggedBlock.style.left = '';
                    draggedBlock.style.top = '';
                    draggedBlock.style.opacity = '';
                    draggedBlock.style.cursor = '';
                    draggedBlock.style.boxShadow = '';

                    // ถ้ายังอยู่ใน body ให้ลบออก
                    if (document.body.contains(draggedBlock) && draggedBlock.parentNode === document.body) {
                        document.body.removeChild(draggedBlock);
                    }

                    // ถ้าอยู่นอก DOM ให้เพิ่มกลับเข้าไป
                    if (!document.contains(draggedBlock)) {
                        messageCanvas.appendChild(draggedBlock);
                    }
                } catch (err) {
                    console.error("Error during cleanup:", err);
                }
            }

            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }

            draggedBlock = null;
            placeholder = null;
        }

        // ตั้งค่าปุ่ม move สำหรับบล็อกที่มีอยู่แล้ว
        function setupExistingBlocks() {
            const blocks = messageCanvas.querySelectorAll('.message-block');
            blocks.forEach(block => setupMoveButtonForBlock(block));
        }

        // ตั้งค่าเริ่มต้น
        setupExistingBlocks();

        // เพิ่ม failsafe event listener สำหรับทั้งหน้าเว็บ
        window.addEventListener('mouseup', function () {
            if (draggedBlock) {
                cleanupDrag();
            }
        });

        // เพิ่ม style สำหรับการลาก
        const style = document.createElement('style');
        style.textContent = `
        .message-block-placeholder {
            transition: margin 0.2s;
        }
        .message-block {
            transition: box-shadow 0.3s, transform 0.2s;
        }
        .message-block:hover .fa-arrows-alt {
            color: #4e73df;
            cursor: move;
        }
        .message-block .message-block-actions {
            opacity: 0.3;
            transition: opacity 0.3s;
        }
        .message-block:hover .message-block-actions {
            opacity: 1;
        }
    `;
        document.head.appendChild(style);

        // ตรวจจับการเพิ่มบล็อกใหม่
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('message-block')) {
                            setTimeout(() => {
                                setupMoveButtonForBlock(node);
                            }, 0);
                        }
                    });
                }
            });
        });

        // เริ่มการสังเกตการณ์
        observer.observe(messageCanvas, { childList: true });
    }

    // เรียกใช้ฟังก์ชันตั้งค่าลากและวาง
    setupDragAndDrop();

    // Initialize mobile preview scrolling
    initializeMobilePreview();

    // Initialize preview
    updateMessagePreview();

});

// Global function for Clear button (called via onclick in HTML)
function clearBroadcastForm() {
    // Reset title
    var titleInput = document.getElementById('broadcastTitle');
    if (titleInput) {
        titleInput.value = '';
        titleInput.classList.remove('is-invalid');
    }

    // Reset message canvas — keep one empty text block
    var canvas = document.getElementById('messageCanvas');
    if (canvas) {
        canvas.innerHTML = '';
        var textBlock = document.createElement('div');
        textBlock.className = 'message-block text-block';
        textBlock.innerHTML = '<textarea class="form-control" rows="4" placeholder="Enter your message here..."></textarea>' +
            '<div class="message-block-actions">' +
            '<button type="button" class="btn btn-sm btn-light"><i class="fas fa-arrows-alt"></i></button>' +
            '<button type="button" class="btn btn-sm btn-light"><i class="fas fa-trash-alt"></i></button>' +
            '</div>';
        canvas.appendChild(textBlock);
    }

    // Reset timing to "Send now"
    var sendNow = document.getElementById('sendNow');
    if (sendNow) sendNow.checked = true;
    var scheduleOpts = document.getElementById('scheduleOptions');
    if (scheduleOpts) scheduleOpts.classList.add('d-none');

    // Reset targeting to "Everyone"
    var everyone = document.getElementById('sendToEveryone');
    if (everyone) everyone.checked = true;
    var specificOpts = document.getElementById('specificOptions');
    if (specificOpts) specificOpts.classList.add('d-none');

    // Clear preview
    var preview = document.getElementById('previewMessages');
    if (preview) preview.innerHTML = '<div class="chat-message"></div>';

    // Remove any alerts
    var form = document.getElementById('broadcastForm');
    if (form) {
        var cardBody = form.closest('.card-body');
        if (cardBody) {
            cardBody.querySelectorAll('.alert').forEach(function (a) { a.remove(); });
        }
    }
}
