/**
 * Resolves the unique ID for a message, handling various backend ID formats.
 * @param {Object} message - The message object.
 * @returns {string|undefined} The resolved unique ID.
 */
export const getMessageId = (message) => {
    return message?.id || message?._id || message?.message_id;
};

/**
 * Formats a message timestamp into a readable time string.
 * @param {string} timestamp - The ISO timestamp string.
 * @returns {string} Formatted time (e.g., "10:30 AM") or empty string if invalid.
 */
export const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
};

/**
 * Constants for message types
 */
export const MESSAGE_TYPES = {
    JOIN: 'join',
    LEAVE: 'leave',
    CHAT: 'chat',
    SYNC: 'sync',
    DELETE: 'delete',
    ERROR: 'error'
};
