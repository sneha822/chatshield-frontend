import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { api } from '../../services/api';
import { NOTIFICATION_TYPES } from '../../utils/chatUtils';

// Reusable components
import Sidebar from '../Sidebar/Sidebar';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import AnalyticsView from '../Analytics/AnalyticsView';
import {
    WarningToast,
    MuteBanner,
    UnmuteNotification,
    RejectedToast,
    WarningStatusBar,
} from './MuteNotifications';

/**
 * Main chat interface - responsive layout with sidebar
 */
const ChatInterface = () => {
    const { token, logout, user } = useAuth();
    const navigate = useNavigate();
    const { roomId } = useParams();

    const currentRoom = roomId || 'general';

    // State
    const [rooms, setRooms] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [newRoomInput, setNewRoomInput] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Chat hook with mute support
    const {
        messages,
        users,
        isConnected,
        error,
        sendMessage,
        deleteMessage,
        // Mute-related
        muteInfo,
        formatRemainingTime,
        canSendMessage,
        notification,
        clearNotification,
    } = useChat(token, currentRoom);

    // Fetch rooms on mount
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await api.getMyRooms(token);
                setRooms(data.rooms || []);
            } catch (err) {
                console.error('Failed to fetch rooms', err);
            }
        }
        if (token) fetchRooms();
    }, [token]);

    // Handlers
    const handleSendMessage = (message) => {
        sendMessage(message);
        setInputMessage('');
    };

    const handleRoomSelect = (roomId) => {
        navigate(`/chat/room/${roomId}`);
    };

    const handleJoinRoom = () => {
        const roomName = newRoomInput.trim();
        if (roomName) {
            navigate(`/chat/room/${roomName}`);
            setNewRoomInput('');
            setSidebarOpen(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        const roomName = newRoomInput.trim();
        if (!roomName) return;

        const existing = rooms.find(r => r.room_id === roomName);
        if (existing) {
            navigate(`/chat/room/${roomName}`);
            setNewRoomInput('');
            setSidebarOpen(false);
            return;
        }

        try {
            await api.createRoom(roomName);
            navigate(`/chat/room/${roomName}`);
            setNewRoomInput('');
            setSidebarOpen(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-bg-main overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                rooms={rooms}
                currentRoom={currentRoom}
                onRoomSelect={handleRoomSelect}
                newRoomInput={newRoomInput}
                onNewRoomInputChange={setNewRoomInput}
                onJoinRoom={handleJoinRoom}
                onCreateRoom={handleCreateRoom}
                onlineUsers={users}
                user={user}
                onLogout={handleLogout}
            />

            {/* Main chat area */}
            <main className="flex-1 flex flex-col min-w-0">
                <ChatHeader
                    roomName={currentRoom}
                    isConnected={isConnected}
                    onMenuClick={() => setSidebarOpen(true)}
                    onAnalyticsClick={() => setShowAnalytics(true)}
                />

                {/* Mute Banner - Shows when user is muted */}
                {muteInfo.isMuted && (
                    <MuteBanner 
                        remainingTime={formatRemainingTime()} 
                        muteInfo={muteInfo} 
                    />
                )}

                {/* Warning Status Bar - Shows when not muted but has consecutive warnings */}
                {!muteInfo.isMuted && muteInfo.consecutiveToxicCount > 0 && (
                    <WarningStatusBar 
                        consecutiveCount={muteInfo.consecutiveToxicCount}
                        threshold={muteInfo.toxicThreshold || 5}
                    />
                )}

                <MessageList
                    messages={messages}
                    onDeleteMessage={deleteMessage}
                />

                {error && (
                    <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20">
                        <p className="text-xs text-red-400 text-center">{error}</p>
                    </div>
                )}

                <ChatInput
                    value={inputMessage}
                    onChange={setInputMessage}
                    onSubmit={handleSendMessage}
                    disabled={!isConnected || !canSendMessage}
                    isMuted={muteInfo.isMuted}
                    mutedPlaceholder={`Muted for ${formatRemainingTime() || '0:00'}...`}
                />
            </main>

            {/* Analytics modal */}
            {showAnalytics && (
                <AnalyticsView
                    roomId={currentRoom}
                    onClose={() => setShowAnalytics(false)}
                />
            )}

            {/* Mute Notifications */}
            {notification?.type === NOTIFICATION_TYPES.WARNING && (
                <WarningToast
                    message={notification.message}
                    muteInfo={notification.muteInfo}
                    onClose={clearNotification}
                />
            )}

            {notification?.type === NOTIFICATION_TYPES.UNMUTED && (
                <UnmuteNotification onClose={clearNotification} />
            )}

            {notification?.type === NOTIFICATION_TYPES.REJECTED && (
                <RejectedToast
                    message={notification.message}
                    onClose={clearNotification}
                />
            )}
        </div>
    );
};

export default ChatInterface;
