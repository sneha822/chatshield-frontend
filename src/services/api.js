export const API_BASE_URL = 'http://localhost:8000';

// Auth error handler - will be set by AuthContext
let onAuthError = null;

export const setAuthErrorHandler = (handler) => {
    onAuthError = handler;
};

/**
 * Helper to handle response and trigger logout on 401
 */
const handleAuthResponse = async (response) => {
    if (response.status === 401) {
        // Token expired or invalid - trigger logout
        if (onAuthError) {
            onAuthError();
        }
        throw new Error('Session expired. Please log in again.');
    }
    return response;
};

export const api = {
    async register(username, password) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ username, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Registration failed');
        }
        return response.json();
    },

    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ username, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Login failed');
        }
        return response.json();
    },

    async getMyRooms(token) {
        const response = await fetch(`${API_BASE_URL}/chat/my-rooms`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        await handleAuthResponse(response);
        if (!response.ok) {
            throw new Error('Failed to fetch my rooms');
        }
        return response.json();
    },

    async getRooms(token) {
        const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        await handleAuthResponse(response);
        if (!response.ok) {
            throw new Error('Failed to fetch rooms');
        }
        return response.json();
    },

    async getRoomAnalytics(roomId) {
        const response = await fetch(`${API_BASE_URL}/analytics/rooms/${roomId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }
        return response.json();
    },

    async createRoom(roomId, name) {
        const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ room_id: roomId, name: name || roomId }),
        });

        if (response.status === 400) {
            throw new Error('Room already exists');
        }

        if (!response.ok) {
            try {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to create room');
            } catch (e) {
                throw new Error('Failed to create room');
            }
        }
        return response.json();
    },

    async deleteMessage(messageId, token) {
        const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        await handleAuthResponse(response);
        if (!response.ok) {
            throw new Error('Failed to delete message');
        }
    },

    async getRoomUsers(roomId) {
        const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/users`);
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return response.json();
    },

    async getRoomMessages(roomId) {
        const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`);
        if (!response.ok) {
            // If room doesn't exist or other error, might just return empty
            // But let's throw so the UI knows.
            throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        return data.messages || [];
    }
};
