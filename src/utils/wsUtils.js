import { API_BASE_URL } from '../services/api';

/**
 * Constructs the WebSocket URL for a given room and token.
 * @param {string} token - The authentication token.
 * @param {string} roomId - The room ID to connect to.
 * @returns {string} The fully constructed WebSocket URL.
 */
export const getWebSocketUrl = (token, roomId) => {
    // Replace http/https with ws/wss
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    return `${wsBase}/ws?token=${token}&room=${roomId}`;
};

/**
 * Deduplicates a list of users.
 * @param {Array} users - The list of users (strings).
 * @returns {Array} A new array with unique user strings.
 */
export const deduplicateUsers = (users) => {
    return [...new Set(users || [])];
};

/**
 * Safely parses a JSON string.
 * @param {string} data - The JSON string to parse.
 * @returns {Object|null} The parsed object or null if parsing fails.
 */
export const parseMessage = (data) => {
    try {
        return JSON.parse(data);
    } catch (err) {
        console.error('Failed to parse message:', err);
        return null;
    }
};
