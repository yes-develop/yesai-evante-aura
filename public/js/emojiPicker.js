// This file contains functions for managing the emoji picker functionality, including displaying emojis and inserting them into the message input.

const emojiPicker = document.getElementById('emoji-picker');
const messageInput = document.getElementById('message-input');
const emojiBtn = document.getElementById('emoji-btn');

// Function to toggle the visibility of the emoji picker
export function toggleEmojiPicker() {
    emojiPicker.classList.toggle('active');
}

// Function to insert an emoji into the message input
export function insertEmoji(emoji) {
    messageInput.value += emoji;
    messageInput.focus();
    emojiPicker.classList.remove('active');
}

// Function to add event listeners to emoji items
export function setupEmojiPicker() {
    document.querySelectorAll('.emoji-item').forEach(emoji => {
        emoji.addEventListener('click', function() {
            insertEmoji(this.textContent);
        });
    });
}