import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { getWebSocketUrl, deduplicateUsers, parseMessage } from '../utils/wsUtils';
import { getMessageId, MESSAGE_TYPES, NOTIFICATION_TYPES } from '../utils/chatUtils';
import { useMuteStatus } from './useMuteStatus';

export const useChat = (token, roomId = 'general') => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const wsRef = useRef(null);

    // Mute status management
    const {
        muteInfo,
        updateMuteInfo,
        clearMuteStatus,
        formatRemainingTime,
        getWarningProgress,
        canSendMessage,
    } = useMuteStatus();

    // Clear notification helper
    const clearNotification = useCallback(() => {
        setNotification(null);
    }, []);

    // Reset state when room changes
    useEffect(() => {
        setMessages([]);
        setUsers([]);
        setError(null);
        setNotification(null);
        clearMuteStatus();
    }, [roomId, clearMuteStatus]);

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

                // Mute system message handlers
                case MESSAGE_TYPES.MUTE_STATUS:
                    // Initial mute status on connection
                    if (data.mute_info) {
                        updateMuteInfo(data.mute_info);
                    }
                    break;

                case MESSAGE_TYPES.WARNING:
                    // User received a warning for toxic message
                    if (data.mute_info) {
                        updateMuteInfo(data.mute_info);
                    }
                    setNotification({
                        type: NOTIFICATION_TYPES.WARNING,
                        message: data.content,
                        muteInfo: {
                            consecutiveToxicCount: data.mute_info?.consecutive_toxic_count ?? 0,
                            warningsUntilMute: data.mute_info?.warnings_until_mute ?? 5,
                            toxicThreshold: data.mute_info?.toxic_threshold ?? 5,
                            warningCount: data.mute_info?.warning_count ?? 0,
                        },
                    });
                    // Auto-dismiss warning after 5 seconds
                    setTimeout(() => setNotification(null), 5000);
                    break;

                case MESSAGE_TYPES.MUTED:
                    // User has been muted OR someone in room was muted
                    if (data.mute_info) {
                        // This is for the muted user themselves
                        updateMuteInfo(data.mute_info);
                        setNotification({
                            type: NOTIFICATION_TYPES.MUTED,
                            message: data.content,
                            muteInfo: data.mute_info,
                        });
                    } else if (data.username) {
                        // This is a broadcast about another user being muted
                        setMessages(prev => [...prev, {
                            type: 'system_mute',
                            content: data.content,
                            sender: 'System',
                            timestamp: data.timestamp,
                            muteType: 'muted',
                        }]);
                    }
                    break;

                case MESSAGE_TYPES.UNMUTED:
                    // User has been unmuted
                    if (data.mute_info) {
                        updateMuteInfo(data.mute_info);
                        setNotification({
                            type: NOTIFICATION_TYPES.UNMUTED,
                            message: data.content,
                        });
                    } else if (data.username) {
                        // Broadcast about another user being unmuted
                        setMessages(prev => [...prev, {
                            type: 'system_mute',
                            content: data.content,
                            sender: 'System',
                            timestamp: data.timestamp,
                            muteType: 'unmuted',
                        }]);
                    }
                    break;

                case MESSAGE_TYPES.MUTE_REJECTED:
                    // Message was rejected because user is muted
                    if (data.mute_info) {
                        updateMuteInfo(data.mute_info);
                    }
                    setNotification({
                        type: NOTIFICATION_TYPES.REJECTED,
                        message: data.content,
                        muteInfo: data.mute_info,
                    });
                    setTimeout(() => setNotification(null), 3000);
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
    }, [token, roomId, updateMuteInfo]);

    const sendMessage = useCallback((content) => {
        // Check if user is muted before sending
        if (!canSendMessage) {
            setNotification({
                type: NOTIFICATION_TYPES.REJECTED,
                message: `You are muted. Please wait ${formatRemainingTime() || 'a moment'}.`,
            });
            setTimeout(() => setNotification(null), 3000);
            return false;
        }

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ content }));
            return true;
        } else {
            console.error('WebSocket is not connected');
            setError('Not connected to chat server');
            return false;
        }
    }, [canSendMessage, formatRemainingTime]);

    const deleteMessage = useCallback(async (messageId) => {
        try {
            await api.deleteMessage(messageId, token);
            setMessages(prev => prev.filter(msg => getMessageId(msg) !== messageId));
        } catch (err) {
            console.error('Failed to delete message:', err);
            setError('Failed to delete message');
        }
    }, [token]);

    return {
        messages,
        users,
        isConnected,
        error,
        sendMessage,
        deleteMessage,
        // Mute-related exports
        muteInfo,
        formatRemainingTime,
        getWarningProgress,
        canSendMessage,
        notification,
        clearNotification,
    };
};
