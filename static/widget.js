/**
 * Cybersecurity Chatbot Widget
 * Embeddable chatbot widget for explaining cybersecurity terminology
 */

(function() {
    'use strict';

    // Configuration - update this URL when deploying
    const API_BASE_URL = window.CHATBOT_API_URL || 'http://localhost:8080';

    // Widget state
    let isOpen = false;
    let isLoading = false;
    let isMaximized = false;
    let lastRequestTime = 0;
    const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests

    // Create widget HTML structure
    function createWidget() {
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'cyber-chatbot-widget';
        widgetContainer.innerHTML = `
            <style>
                #cyber-chatbot-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                }

                #cyber-chatbot-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                #cyber-chatbot-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                }

                #cyber-chatbot-button svg {
                    width: 28px;
                    height: 28px;
                    fill: white;
                }

                #cyber-chatbot-window {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    width: 380px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                #cyber-chatbot-window.open {
                    display: flex;
                }

                #cyber-chatbot-window.maximized {
                    width: 90vw;
                    height: 90vh;
                    bottom: 5vh;
                    right: 5vw;
                    max-width: none;
                }

                #cyber-chatbot-window.maximized .chatbot-messages {
                    max-height: none;
                }

                .chatbot-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .chatbot-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    flex: 1;
                }

                .chatbot-header-buttons {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .chatbot-maximize,
                .chatbot-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: background 0.2s;
                }

                .chatbot-maximize:hover,
                .chatbot-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .chatbot-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    background: #f9fafb;
                }

                .chatbot-message {
                    margin-bottom: 12px;
                    display: flex;
                    flex-direction: column;
                }

                .chatbot-message.user {
                    align-items: flex-end;
                }

                .chatbot-message.bot {
                    align-items: flex-start;
                }

                .message-bubble {
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 12px;
                    word-wrap: break-word;
                    line-height: 1.4;
                    font-size: 14px;
                }

                .chatbot-message.user .message-bubble {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .chatbot-message.bot .message-bubble {
                    background: white;
                    color: #1f2937;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }

                .chatbot-input-area {
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 8px;
                }

                .chatbot-input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .chatbot-input:focus {
                    border-color: #667eea;
                }

                .chatbot-send-btn {
                    padding: 10px 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: opacity 0.2s;
                }

                .chatbot-send-btn:hover {
                    opacity: 0.9;
                }

                .chatbot-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 10px 14px;
                }

                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #9ca3af;
                    animation: typing 1.4s infinite;
                }

                .typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing {
                    0%, 60%, 100% {
                        opacity: 0.3;
                        transform: translateY(0);
                    }
                    30% {
                        opacity: 1;
                        transform: translateY(-4px);
                    }
                }

                .welcome-message {
                    text-align: center;
                    padding: 20px;
                    color: #6b7280;
                    font-size: 14px;
                }

                @media (max-width: 480px) {
                    #cyber-chatbot-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 110px);
                        right: 20px;
                        bottom: 90px;
                    }

                    #cyber-chatbot-window.maximized {
                        width: 100vw;
                        height: 100vh;
                        bottom: 0;
                        right: 0;
                        border-radius: 0;
                    }
                }
            </style>

            <button id="cyber-chatbot-button" aria-label="Open chatbot">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                    <!-- Robot head -->
                    <rect x="6" y="8" width="12" height="10" rx="2" stroke="white" stroke-width="0.5"/>
                    <!-- Antenna -->
                    <line x1="12" y1="4" x2="12" y2="8" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="12" cy="3" r="1.5" fill="white"/>
                    <!-- Eyes -->
                    <circle cx="9" cy="12" r="1.5" fill="white"/>
                    <circle cx="15" cy="12" r="1.5" fill="white"/>
                    <!-- Mouth/display -->
                    <rect x="8.5" y="15" width="7" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
                    <!-- Body connection -->
                    <rect x="11" y="18" width="2" height="2" fill="white"/>
                </svg>
            </button>

            <div id="cyber-chatbot-window">
                <div class="chatbot-header">
                    <h3>🤖 Cybersecurity AI Assistant</h3>
                    <div class="chatbot-header-buttons">
                        <button class="chatbot-maximize" id="chatbot-maximize" aria-label="Maximize chatbot" title="Maximize">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3h10v10H3V3z" stroke="currentColor" stroke-width="2" fill="none"/>
                                <path d="M5 1h8v2M13 5v8h-2" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                        </button>
                        <button class="chatbot-close" aria-label="Close chatbot">&times;</button>
                    </div>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="welcome-message">
                        🤖 Hello! I'm your AI-powered cybersecurity tutor. I can help you understand security concepts, attack types, and terminology. Ask me anything!
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input 
                        type="text" 
                        class="chatbot-input" 
                        id="chatbot-input" 
                        placeholder="Ask about cybersecurity..."
                        aria-label="Chat message"
                    />
                    <button class="chatbot-send-btn" id="chatbot-send-btn">Send</button>
                </div>
            </div>
        `;

        document.body.appendChild(widgetContainer);
        attachEventListeners();
    }

    // Attach event listeners
    function attachEventListeners() {
        const button = document.getElementById('cyber-chatbot-button');
        const closeBtn = document.querySelector('.chatbot-close');
        const maximizeBtn = document.getElementById('chatbot-maximize');
        const sendBtn = document.getElementById('chatbot-send-btn');
        const input = document.getElementById('chatbot-input');

        button.addEventListener('click', toggleWidget);
        closeBtn.addEventListener('click', toggleWidget);
        maximizeBtn.addEventListener('click', toggleMaximize);
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !isLoading) {
                sendMessage();
            }
        });
    }

    // Toggle widget open/close
    function toggleWidget() {
        isOpen = !isOpen;
        const window = document.getElementById('cyber-chatbot-window');
        if (isOpen) {
            window.classList.add('open');
            document.getElementById('chatbot-input').focus();
        } else {
            window.classList.remove('open');
            // Reset maximize state when closing
            if (isMaximized) {
                toggleMaximize();
            }
        }
    }

    // Toggle maximize/minimize
    function toggleMaximize() {
        isMaximized = !isMaximized;
        const window = document.getElementById('cyber-chatbot-window');
        const maximizeBtn = document.getElementById('chatbot-maximize');
        
        if (isMaximized) {
            window.classList.add('maximized');
            maximizeBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6H3v7h7v-3" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M7 7h6v6H7V7z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
            `;
            maximizeBtn.setAttribute('title', 'Restore');
            maximizeBtn.setAttribute('aria-label', 'Restore chatbot size');
        } else {
            window.classList.remove('maximized');
            maximizeBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h10v10H3V3z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M5 1h8v2M13 5v8h-2" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            `;
            maximizeBtn.setAttribute('title', 'Maximize');
            maximizeBtn.setAttribute('aria-label', 'Maximize chatbot');
        }
    }

    // Send message to API
    async function sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message || isLoading) return;

        // Rate limiting check
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
            addMessage(`Please wait ${waitTime} second(s) before sending another message to avoid rate limits.`, 'bot');
            return;
        }
        lastRequestTime = now;

        // Add user message to chat
        addMessage(message, 'user');
        input.value = '';

        // Show loading indicator
        isLoading = true;
        updateSendButton();
        showTypingIndicator();

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();

            if (response.ok) {
                addMessage(data.response, 'bot');
            } else {
                addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            addMessage('Sorry, I\'m having trouble connecting. Please check if the chatbot service is running.', 'bot');
        } finally {
            isLoading = false;
            updateSendButton();
            removeTypingIndicator();
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = formatMessage(text);
        
        messageDiv.appendChild(bubble);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Format message with basic markdown support
    function formatMessage(text) {
        // Escape HTML to prevent XSS
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        // Convert markdown-like formatting
        let formatted = escaped
            // Bold text: **text** or __text__
            .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/__([^_]+)__/g, '<strong>$1</strong>')
            // Italic text: *text* or _text_
            .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            // Inline code: `code`
            .replace(/`([^`]+)`/g, '<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
            // Line breaks
            .replace(/\n/g, '<br>');
        
        // Code blocks: ```code```
        formatted = formatted.replace(/```([^`]+)```/g, '<pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto; margin: 8px 0;"><code>$1</code></pre>');
        
        // Numbered lists
        formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin-left: 16px;">$1. $2</div>');
        
        // Bullet points
        formatted = formatted.replace(/^[•\-\*]\s+(.+)$/gm, '<div style="margin-left: 16px;">• $1</div>');
        
        return formatted;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const indicator = document.createElement('div');
        indicator.className = 'chatbot-message bot';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Update send button state
    function updateSendButton() {
        const sendBtn = document.getElementById('chatbot-send-btn');
        sendBtn.disabled = isLoading;
        sendBtn.textContent = isLoading ? 'Sending...' : 'Send';
    }

    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();

