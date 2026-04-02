@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="https://unpkg.com/perfect-scrollbar@1.5.5/css/perfect-scrollbar.css">
<link rel="stylesheet" href="{{ asset('css/ai.css?time=') }}<?php echo time();?>">
<style>
    .typing-dots {
        display: inline-flex;
        align-items: center;
        height: 20px;
    }
    
    .typing-dots span {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin: 0 3px;
        background-color: #007bff;
        border-radius: 50%;
        opacity: 0.6;
        animation: typingDot 1.4s infinite ease-in-out both;
    }
    
    .typing-dots span:nth-child(1) {
        animation-delay: 0s;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typingDot {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
        40% { transform: scale(1.2); opacity: 1; }
    }
</style>
@endpush

@section('content')
<div class="container-fluid">
    <div class="row">
        <!-- Sidebar Tabs -->
        <div class="col-md-4 col-lg-3">
            <div class="ai-tabs">
                <a href="{{ route('ai.index') }}" class="ai-tab-item {{ request()->routeIs('ai.index') ? 'active' : '' }}">
                    <i class="fas fa-robot"></i>
                    <span>Test your AI agent</span>
                </a>
                <a href="{{ route('ai.scenario') }}" class="ai-tab-item {{ request()->routeIs('ai.scenario') ? 'active' : '' }}">
                    <i class="fas fa-tasks"></i>
                    <span>Scenario Training</span>
                </a>
                <a href="{{ route('ai.knowledge') }}" class="ai-tab-item {{ request()->routeIs('ai.knowledge') ? 'active' : '' }}">
                    <i class="fas fa-book"></i>
                    <span>Knowledge Source</span>
                </a>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-8 col-lg-9">
            <div class="chat-container">
                <div class="page-header">
                    <h2 class="fw-bold">Test your AI agent</h2>
                    <p class="text-muted">Your AI agent's abilities will depend on the knowledge sources you provide and the scenarios you train it on. <a href="#" class="text-info">Learn more about AI agent</a></p>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <!-- Chat messages will be loaded from Google Sheet -->
                    <div class="typing-indicator" style="display: none;">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div class="chat-input">
                <form id="chatForm" onsubmit="event.preventDefault(); document.getElementById('sendMessage').click(); return false;">
                        <div class="input-group">
                            <input type="text" class="form-control" id="messageInput" placeholder="Aa">
                            <button class="btn" type="submit" id="sendMessage" style="background: #f0f0f0;">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                    <div class="response-hint d-none" id="responseHint">
                        Response not what you expect? Add more information to your <a href="{{ route('ai.knowledge') }}">knowledge source</a> or <a href="{{ route('ai.scenario') }}">create a scenario</a> to train your AI.
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://unpkg.com/perfect-scrollbar@1.5.5/dist/perfect-scrollbar.min.js"></script>
<script>
window.AppConfig = window.AppConfig || {};
window.AppConfig.MAKE_WEBHOOK_AI_CHAT_URL = '{{ config('services.make.webhook_ai_chat_url') }}';
</script>
<script src="{{ asset('js/ai.js?time=') }}<?php echo time();?>"></script>
<script>
    // Ensure Enter key works for sending messages
    document.addEventListener('DOMContentLoaded', () => {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // ใช้ dispatchEvent เพื่อให้เหมือนเป็นการกดปุ่มจริงๆ
                    const sendButton = document.getElementById('sendMessage');
                    if (sendButton) {
                        sendButton.click();
                        console.log('Enter key pressed - triggering send button');
                    }
                }
            });
        }
        
        // เพิ่มการล็อกเพื่อตรวจสอบว่าฟอร์มได้รับการกำหนดค่าถูกต้อง
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            console.log('Chat form found and initialized');
            chatForm.addEventListener('submit', (e) => {
                console.log('Form submitted');
                e.preventDefault();
                document.getElementById('sendMessage').click();
                return false;
            });
        } else {
            console.error('Chat form not found');
        }
    });
    
    // Extend the AIChat class once it's initialized
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for the AIChat class to be initialized
        const initInterval = setInterval(() => {
            if (window.aiChat) {
                clearInterval(initInterval);
                
                // Google Sheets API URL for public sheet (published to web)
                const gsSheetId = '{{ config('services.google_sheets.id') }}';
                const gsSheetUrl = `https://docs.google.com/spreadsheets/d/${gsSheetId}/gviz/tq?tqx=out:json&sheet=AI`;
                
                // Function to load chat messages from Google Sheet
                function loadChatMessagesFromSheet() {
                    fetch(gsSheetUrl)
                        .then(response => response.text())
                        .then(data => {
                            try {
                                // Parse the JSON-like response (it returns a JS callback)
                                const jsonData = JSON.parse(data.substring(47).slice(0, -2));
                                const rows = jsonData.table.rows;
                                
                                // Clear existing messages
                                const chatMessages = document.getElementById('chatMessages');
                                // Keep the typing indicator
                                const typingIndicator = document.querySelector('.typing-indicator');
                                chatMessages.innerHTML = '';
                                chatMessages.appendChild(typingIndicator);
                                
                                // Skip header row if exists
                                const startIndex = rows[0] && rows[0].c && 
                                                  (rows[0].c[0]?.v === 'userInput' || rows[0].c[0]?.v === 'user') ? 1 : 0;
                                
                                // Add messages from sheet
                                for (let i = startIndex; i < rows.length; i++) {
                                    const row = rows[i];
                                    
                                    // Add user message (Column A)
                                    if (row.c && row.c[0] && row.c[0].v) {
                                        const userContent = row.c[0].v;
                                        const userDiv = document.createElement('div');
                                        userDiv.className = 'chat-message user-message';
                                        
                                        const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        
                                        userDiv.innerHTML = `
                                            <div class="message-content">${userContent}</div>
                                            <span class="message-time">${userTimestamp}</span>
                                        `;
                                        
                                        chatMessages.appendChild(userDiv);
                                    }
                                    
                                    // Add AI response (Column B)
                                    if (row.c && row.c[1] && row.c[1].v) {
                                        const aiContent = row.c[1].v;
                                        const aiDiv = document.createElement('div');
                                        aiDiv.className = 'chat-message ai-message';
                                        
                                        const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        
                                        // Check if the content is "Accepted" and replace with typing dots
                                        if (aiContent.trim() === 'Accepted') {
                                            aiDiv.innerHTML = `
                                                <div class="message-content">
                                                    <div class="typing-dots">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </div>
                                                </div>
                                                <span class="message-time">${aiTimestamp}</span>
                                            `;
                                        } else {
                                            aiDiv.innerHTML = `
                                                <div class="message-content">${aiContent}</div>
                                                <span class="message-time">${aiTimestamp}</span>
                                            `;
                                        }
                                        
                                        chatMessages.appendChild(aiDiv);
                                    }
                                }
                                
                                // Scroll to bottom after loading messages
                                window.aiChat.scrollToBottom();
                            } catch (error) {
                                console.error('Error parsing sheet data:', error);
                            }
                        })
                        .catch(error => {
                            console.error('Error loading chat messages:', error);
                        });
                }
                
                // Load messages immediately
                loadChatMessagesFromSheet();
                
                // Reload messages every 30 seconds
                setInterval(loadChatMessagesFromSheet, 30000);
            }
        }, 100);
    });
</script>
@endpush
@endsection 