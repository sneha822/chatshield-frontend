import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { getWebSocketUrl, deduplicateUsers, parseMessage } from '../utils/wsUtils';
import { getMessageId, MESSAGE_TYPES } from '../utils/chatUtils';

export const useChat = (token, roomId = 'general') => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        const wsUrl = getWebSocketUrl(token, roomId);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const loadHistory = async () => {
            try {
                const history = await api.getRoomMessages(roomId);
                setMessages(history);
            } catch (err) {
                console.error('Failed to load history', err);
            }
        };

        const loadUsers = async () => {
            try {
                const data = await api.getRoomUsers(roomId);
                setUsers(deduplicateUsers(data.users));
            } catch (err) {
                console.error('Failed to load users', err);
            }
        };

        loadHistory();
        loadUsers();

        ws.onopen = () => {
            setIsConnected(true);
            setError(null);
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            const data = parseMessage(event.data);
            if (!data) return;

            // Update users list if present in any event type
            if (data.users) {
                setUsers(deduplicateUsers(data.users));
            }

            switch (data.type) {
                case MESSAGE_TYPES.JOIN:
                    setMessages(prev => [...prev, { ...data, isSystem: true }]);
                    break;

                case MESSAGE_TYPES.SYNC:
                case MESSAGE_TYPES.LEAVE:
                    // Handled by user list update above
                    break;

                case MESSAGE_TYPES.CHAT:
                    setMessages(prev => [...prev, data]);
                    // If the echoed message fails to have an ID (rare), reload to be safe
                    if (!getMessageId(data)) {
                        loadHistory();
                    }
                    break;

                case MESSAGE_TYPES.DELETE:
                    setMessages(prev => prev.filter(msg => getMessageId(msg) !== data.message_id));
                    break;

                case MESSAGE_TYPES.ERROR:
                    setError(data.content);
                    break;

                default:
                    console.warn('Unknown message type:', data.type);
            }
        };

        ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            setError('Connection error occurred');
            setIsConnected(false);
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket');
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [token, roomId]);

    const sendMessage = useCallback((content) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ content }));
        } else {
            console.error('WebSocket is not connected');
            setError('Not connected to chat server');
        }
    }, []);

    const deleteMessage = useCallback(async (messageId) => {
        try {
            await api.deleteMessage(messageId, token);
            setMessages(prev => prev.filter(msg => getMessageId(msg) !== messageId));
        } catch (err) {
            console.error('Failed to delete message:', err);
            setError('Failed to delete message');
        }
    }, [token]);

    return { messages, users, isConnected, error, sendMessage, deleteMessage };
};
