export const API_BASE_URL = 'http://localhost:8000';

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

    async getRooms(token) {
        const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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

        if (!response.ok) {
            throw new Error('Failed to delete message');
        }
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
