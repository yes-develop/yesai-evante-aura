/**
 * Get user initials from name
 */
function getInitials(name) {
    if (!name) return '?';
    const words = name.split(/[\s@_-]/);
    return words.map(word => word[0] || '').join('').slice(0, 2).toUpperCase();
}

/**
 * Get a random color for user avatars
 */
function getRandomColor() {
    const colors = [
        '#1976d2', '#2196f3', '#0097a7', '#00acc1',
        '#009688', '#43a047', '#7cb342', '#c0ca33',
        '#fdd835', '#ffb300', '#fb8c00', '#f4511e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Format date based on how recent it is
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    // If less than 24 hours, show time
    if (diff < 86400000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If less than 7 days, show day of week
    if (diff < 604800000) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Auto resize textarea based on content
 */
function setupAutoResizeTextarea() {
    const textarea = document.getElementById('message-input');
    if (!textarea) return;

    function resize() {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    textarea.addEventListener('input', resize);
    textarea.addEventListener('focus', resize);
}