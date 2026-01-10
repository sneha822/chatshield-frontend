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
        // Backend sends UTC ISO string without 'Z' (e.g. 2023-10-27T10:00:00.000000)
        // We ensure it's treated as UTC by appending 'Z' if missing and no timezone offset is present
        let timeStr = timestamp;
        if (typeof timestamp === 'string' &&
            !timestamp.endsWith('Z') &&
            !/[+-]\d{2}:?\d{2}$/.test(timestamp)) {
            timeStr += 'Z';
        }

        const date = new Date(timeStr);
        // Ensure date is valid
        if (isNaN(date.getTime())) return '';

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
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
