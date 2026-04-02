@extends('layouts.app')

@section('title', 'Automations')

@section('page-title', 'Automations')
@section('page-subtitle', 'Save time and engage customers with automated responses, assignment, chatbot and more.')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/automations.css?time=') }}<?php echo time();?>">
@endsection

@section('content')
    <!-- <div class="content-header">
        <h1>Automations</h1>
        <p>Save time and engage customers with automated responses, assignment, chatbot and more.</p>
    </div> -->

    <div class="request-card">
        <div class="request-header">
            <div class="request-icon">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="request-content">
                <h2>Request for automations</h2>
                <p>Feel free to request for automations that you need.</p>
            </div>
        </div>
        <div class="action-buttons">
            <a href="#" class="tutorial-link">
                <i class="fas fa-graduation-cap"></i>
                <span>Tutorial</span>
            </a>
            <button class="new-automation-btn">
                <i class="fas fa-plus"></i>&nbsp;
                <span>New Automation</span>
            </button>
        </div>
    </div>

    <div class="automations-section">
        <div class="automations-table">
            <div class="table-header">
                <h2>All Automations</h2>
                <div class="search-box">
                    <input type="text" placeholder="Search automation...">
                </div>
            </div>
            <div class="table-responsive">
                <table style="width: 100%">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Integration Applied</th>
                            <th>Create By</th>
                            <th>Update</th>
                            <th class="table-actions-header"></th>
                        </tr>
                    </thead>
                    <tbody>
                        @if(isset($automations) && count($automations) > 0)
                            @foreach($automations as $automation)
                                <tr
                                    data-id="{{ $automation->id }}"
                                    data-name="{{ e($automation->name) }}"
                                    data-description="{{ e($automation->description ?? '') }}"
                                    data-integration="{{ e($automation->integration ?? '') }}"
                                    data-status="{{ $automation->status }}"
                                    data-response-time="{{ $automation->response_time }}"
                                >
                                    <td class="status-cell">
                                        <label class="switch">
                                            <input type="checkbox" class="status-toggle" data-id="{{ $automation->id }}" {{ $automation->status === 'active' ? 'checked' : '' }}>
                                            <span class="slider"></span>
                                        </label>
                                        <span class="status-text {{ $automation->status }}">{{ ucfirst($automation->status) }}</span>
                                        @if($automation->status === 'active')
                                            <div class="timer-bar" data-id="{{ $automation->id }}" data-time="{{ $automation->response_time }}"></div>
                                        @endif
                                    </td>
                                    <td>
                                        <div class="automation-name">{{ $automation->name }}</div>
                                        <div class="automation-description">{{ $automation->description }}</div>
                                    </td>
                                    <td class="automation-type">{{ $automation->type }}</td>
                                    <td class="automation-integration">{{ $automation->integration }}</td>
                                    <td class="automation-created-by">{{ $automation->created_by }}</td>
                                    <td class="last-updated" data-id="{{ $automation->id }}">{{ $automation->updated_at->format('M d, Y H:i') }}</td>
                                    <td>
                                        <div class="table-actions">
                                            <button type="button" class="action-btn action-btn--view" aria-label="View automation">
                                                <i class="fas fa-file-alt"></i>
                                            </button>
                                            <button class="action-btn action-btn--delete delete-automation-btn" data-id="{{ $automation->id }}" aria-label="Delete automation">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td colspan="7">No automations</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>
            <div class="performance-pagination" id="automationPagination"></div>
        </div>
    </div>

    <!-- Sliding Panel for New Automation -->
    <div class="sliding-panel" id="newAutomationPanel">
        <div class="panel-header">
            <h2>Create new automation</h2>
            <button class="close-panel" onclick="closeNewAutomationPanel()">&times;</button>
        </div>
        <div class="panel-content">
            <div class="template-section">
                <p>If you don't know where to start, try our templates or read <a href="#">how to create new automation</a>.</p>

                <div class="template-tabs">
                    <div class="template-tab active">All templates</div>
                    <div class="template-tab">Team Collaboration</div>
                    <div class="template-tab">Chatbot</div>
                    <div class="template-tab">Chat Management</div>
                </div>

                <!-- Template Cards -->
                <div class="template-grid">
                    <!-- Team Collaboration Templates -->
                    <div class="template-category">
                        <h3>Team Collaboration</h3>
                        <div class="template-card">
                            <div class="template-icon">
                                <i class="fas fa-sync"></i>
                            </div>
                            <h4>Assign chat to agents</h4>
                            <p>Auto chat assignment based on pre-configured rules to specific team.</p>
                        </div>
                    </div>

                    <!-- Chatbots Templates -->
                    <div class="template-category">
                        <h3>Chatbots</h3>
                        <div class="template-cards">
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="fas fa-robot"></i>
                                </div>
                                <h4>AI chatbot handles pending chats</h4>
                                <p>Trigger the AI chatbot for customer chats that remain unreplied for a specific period.</p>
                            </div>
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="far fa-clock"></i>
                                </div>
                                <h4>AI chatbot handles chats outside business hours</h4>
                                <p>Trigger the AI chatbot for customer chats outside of business hours</p>
                            </div>
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="fas fa-star"></i>
                                </div>
                                <h4>AI chatbot handles all unassigned chats</h4>
                                <p>Trigger the AI chatbot for customer chats that are unassigned (new chats)</p>
                            </div>
                        </div>
                    </div>

                    <!-- Automatic Messages Templates -->
                    <div class="template-category">
                        <h3>Automatic messages</h3>
                        <div class="template-cards">
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="fas fa-comment-dots"></i>
                                </div>
                                <h4>Greeting message</h4>
                                <p>Reply with a greeting when someone messages you for the first time.</p>
                            </div>
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="far fa-clock"></i>
                                </div>
                                <h4>Out of hours message</h4>
                                <p>Reply to messages outside business hours.</p>
                            </div>
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <h4>Closing chat message</h4>
                                <p>Send a message into the chat when an admin marks it as closed</p>
                            </div>
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="fab fa-facebook"></i>
                                </div>
                                <h4>Reply to Facebook comment</h4>
                                <p>Respond to comments with a Facebook reaction, public reply, or inbox message.</p>
                            </div>
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="fab fa-instagram"></i>
                                </div>
                                <h4>Reply to Instagram comment</h4>
                                <p>Respond to comments with a public reply, or inbox message.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Chat Management Templates -->
                    <div class="template-category">
                        <h3>Chat Management</h3>
                        <div class="template-cards">
                            <div class="template-card">
                                <div class="template-icon">
                                    <i class="fas fa-tags"></i>
                                </div>
                                <h4>Assign labels to chats</h4>
                                <p>Automatically create labels for customers' chats with keywords.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ asset('js/automations.js?time=') }}<?php echo time();?>"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // CSRF Token for AJAX requests
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            // Timer objects for active automations
            const timers = {};

            // Initialize status toggle switches
            document.querySelectorAll('.status-toggle').forEach(toggle => {
                toggle.addEventListener('change', function() {
                    const automationId = this.dataset.id;
                    const status = this.checked ? 'active' : 'inactive';

                    // Stop timer if it exists and status is now inactive
                    if (timers[automationId] && !this.checked) {
                        clearTimeout(timers[automationId]);
                        delete timers[automationId];

                        // Remove timer bar animation
                        const timerBar = document.querySelector(`.timer-bar[data-id="${automationId}"]`);
                        if (timerBar) {
                            timerBar.remove();
                        }
                    }

                    // Update status via AJAX
                    updateAutomationStatus(automationId, status);

                    // Update status text
                    const statusText = this.parentNode.nextElementSibling;
                    statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                    statusText.className = `status-text ${status}`;

                    // Add or remove timer bar
                    if (status === 'active') {
                        const row = this.closest('tr');
                        const responseTime = row.dataset.responseTime;

                        // Create timer bar if it doesn't exist
                        let timerBar = document.querySelector(`.timer-bar[data-id="${automationId}"]`);
                        if (!timerBar) {
                            timerBar = document.createElement('div');
                            timerBar.className = 'timer-bar';
                            timerBar.dataset.id = automationId;
                            timerBar.dataset.time = responseTime;
                            this.parentNode.parentNode.appendChild(timerBar);
                        }

                        // Start timer
                        startTimer(automationId, responseTime);
                    }
                });
            });

            // Allow clicking the status pill to toggle
            document.querySelectorAll('.status-text').forEach(statusText => {
                statusText.addEventListener('click', function() {
                    const toggle = this.previousElementSibling?.querySelector('.status-toggle');
                    if (!toggle) return;
                    toggle.checked = !toggle.checked;
                    toggle.dispatchEvent(new Event('change'));
                });
            });

            // Start timers for all active automations
            document.querySelectorAll('tr[data-id]').forEach(row => {
                const automationId = row.dataset.id;
                const responseTime = row.dataset.responseTime;
                const statusToggle = row.querySelector('.status-toggle');

                if (statusToggle && statusToggle.checked) {
                    startTimer(automationId, responseTime);
                }
            });

            // Function to update automation status
            function updateAutomationStatus(id, status) {
                fetch(`/api/automations/${id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ status }),
                    credentials: 'same-origin'
                })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error(`Failed to update status: ${text}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    // Update last updated timestamp
                    const lastUpdatedCell = document.querySelector(`.last-updated[data-id="${id}"]`);
                    if (lastUpdatedCell) {
                        const date = new Date(data.data.updated_at);
                        lastUpdatedCell.textContent = formatDate(date);
                    }

                    console.log('Status updated successfully:', data);
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Failed to update status. Please try again.', 'error');
                });
            }

            // Function to update automation mode
            function updateAutomationMode(id, mode) {
                fetch(`/api/automations/${id}/mode`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ mode }),
                    credentials: 'same-origin'
                })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error(`Failed to update mode: ${text}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    // Update last updated timestamp
                    const lastUpdatedCell = document.querySelector(`.last-updated[data-id="${id}"]`);
                    if (lastUpdatedCell) {
                        const date = new Date(data.data.updated_at);
                        lastUpdatedCell.textContent = formatDate(date);
                    }

                    console.log('Mode updated successfully:', data);

                    // Show notification
                    showNotification(`Automation mode changed to ${mode}`, 'success');
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Failed to update mode. Please try again.', 'error');
                });
            }

            // Function to start timer for an automation
            function startTimer(id, minutes) {
                // Clear existing timer if any
                if (timers[id]) {
                    clearTimeout(timers[id]);
                }

                // Start animation on timer bar
                const timerBar = document.querySelector(`.timer-bar[data-id="${id}"]`);
                if (timerBar) {
                    // Remove any existing animation
                    timerBar.style.animation = 'none';
                    // Force reflow
                    void timerBar.offsetWidth;
                    // Add animation
                    timerBar.style.animation = `countdown ${minutes * 60}s linear forwards`;
                    timerBar.classList.add('active');
                }

                // Set timeout to change mode from Manual to AI
                timers[id] = setTimeout(() => {
                    updateAutomationMode(id, 'AI');

                    // Remove timer
                    delete timers[id];

                    // Reset timer bar
                    if (timerBar) {
                        timerBar.classList.remove('active');
                        timerBar.style.animation = 'none';
                    }
                }, minutes * 60 * 1000); // Convert minutes to milliseconds
            }

            // Helper function to format date
            function formatDate(date) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = months[date.getMonth()];
                const day = date.getDate();
                const year = date.getFullYear();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');

                return `${month} ${day}, ${year} ${hours}:${minutes}`;
            }

            // Function to show notification (using the existing function in automations.js)
            function showNotification(message, type = 'info') {
                // Check if function exists in automations.js, otherwise implement it here
                if (typeof window.showNotification === 'function') {
                    window.showNotification(message, type);
                } else {
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
                }
            }
        });
    </script>
@endsection
