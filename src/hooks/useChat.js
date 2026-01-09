import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL, api } from '../services/api';

export const useChat = (token, roomId = 'general') => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        // Construct WebSocket URL
        // Guide: ws://localhost:8000/ws?token=<YOUR_ACCESS_TOKEN>&room=general
        // We need to use query parameters for token and room.
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Assuming API_BASE_URL is http://localhost:8000, we replace http with ws (or wss)
        // Note: API_BASE_URL might not include 'http', but in our api.js it does.
        const wsBase = API_BASE_URL.replace(/^http/, 'ws');
        const wsUrl = `${wsBase}/ws?token=${token}&room=${roomId}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        // Fetch history
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
                setUsers([...new Set(data.users || [])]);
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
            try {
                const data = JSON.parse(event.data);

                // Update users list if present in any event type
                if (data.users) {
                    setUsers([...new Set(data.users)]);
                }

                switch (data.type) {
                    case 'join':
                        // Join always has content
                        setMessages(prev => [...prev, { ...data, isSystem: true }]);
                        break;

                    case 'sync':
                        // Sync never shows chat bubble, just updates users (handled above)
                        break;

                    case 'leave':
                        // Don't show bubble for leave, just update users (handled above)
                        break;

                    case 'chat':
                        setMessages(prev => [...prev, data]);
                        // If the echoed message lacks an ID, fetch history to get the persisted message (with ID)
                        if (!data.id && !data._id && !data.message_id) {
                            loadHistory();
                        }
                        break;

                    case 'delete':
                        setMessages(prev => prev.filter(msg => (msg.id || msg._id || msg.message_id) !== data.message_id));
                        break;

                    case 'error':
                        setError(data.content);
                        break;

                    default:
                        console.warn('Unknown message type:', data.type);
                }
            } catch (err) {
                console.error('Failed to parse message:', err);
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
            setMessages(prev => prev.filter(msg => (msg.id || msg._id || msg.message_id) !== messageId));
        } catch (err) {
            console.error('Failed to delete message:', err);
            setError('Failed to delete message');
        }
    }, [token]);

    return { messages, users, isConnected, error, sendMessage, deleteMessage };
};
