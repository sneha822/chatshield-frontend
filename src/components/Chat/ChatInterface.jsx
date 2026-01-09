import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { api } from '../../services/api';
import MessageBubble from './MessageBubble';
import AnalyticsView from '../Analytics/AnalyticsView';

const ChatInterface = () => {
    const { token, logout, user } = useAuth();
    const navigate = useNavigate();
    const { roomId } = useParams();
    const currentRoom = roomId || 'general';
    const [rooms, setRooms] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [newRoomInput, setNewRoomInput] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const messagesEndRef = useRef(null);

    const { messages, users, isConnected, error, sendMessage, deleteMessage } = useChat(token, currentRoom);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await api.getMyRooms(token);
                setRooms(data.rooms || []);
            } catch (err) {
                console.error('Failed to fetch rooms', err);
            }
        };
        if (token) fetchRooms();
    }, [token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;
        sendMessage(inputMessage);
        setInputMessage('');
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        const roomName = newRoomInput.trim();
        if (!roomName) return;

        const existing = rooms.find(r => r.room_id === roomName);
        if (existing) {
            navigate(`/chat/room/${roomName}`);
            setNewRoomInput('');
            return;
        }

        try {
            await api.createRoom(roomName);
            navigate(`/chat/room/${roomName}`);
            setNewRoomInput('');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="flex h-screen bg-bg-main">
            {/* Sidebar */}
            <aside className="w-64 bg-bg-surface border-r border-border-base flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b border-border-base">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="/images/logo.png" alt="ChatShield Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold text-text-main">ChatShield</span>
                    </div>
                </div>

                {/* Rooms */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="mb-4">
                        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider px-2 mb-2">
                            My Rooms
                        </h3>
                        <div className="space-y-1">
                            {rooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => navigate(`/chat/room/${room.id}`)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentRoom === room.id
                                        ? 'bg-primary/20 text-primary font-medium border border-primary/20'
                                        : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                                        }`}
                                >
                                    # {room.name || room.id}
                                </button>
                            ))}
                            {rooms.length === 0 && (
                                <p className="text-xs text-neutral-400 px-2 italic">No joined rooms.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-border-base">
                        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider px-2 mb-2">
                            Join / Create
                        </h3>
                    </div>

                    <form onSubmit={handleCreateRoom} className="mt-2">
                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                placeholder="Room name..."
                                value={newRoomInput}
                                onChange={(e) => setNewRoomInput(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 bg-input-bg border border-border-base rounded-md text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-600"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (newRoomInput.trim()) {
                                        navigate(`/chat/room/${newRoomInput.trim()}`);
                                        setNewRoomInput('');
                                    }
                                }}
                                title="Join Room"
                                className="px-2.5 py-1.5 bg-bg-main border border-border-base text-text-muted rounded-md text-xs hover:text-text-main hover:border-text-muted transition-colors"
                            >
                                →
                            </button>
                            <button
                                type="submit"
                                title="Create Room"
                                className="px-2.5 py-1.5 bg-primary text-white rounded-md text-xs hover:bg-primary-hover"
                            >
                                +
                            </button>
                        </div>
                    </form>
                </div>

                {/* Online Users */}
                <div className="p-3 border-t border-border-base">
                    <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider px-2 mb-2">
                        Online ({users.length})
                    </h3>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {users.map((u, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-sm text-text-muted truncate">{u}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User */}
                <div className="p-3 border-t border-border-base mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-bg-main border border-border-base rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-text-main">{user?.username}</span>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="text-xs text-text-muted hover:text-red-400 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col bg-bg-main relative">
                {/* Header */}
                <header className="h-14 bg-bg-surface border-b border-border-base px-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <h1 className="font-semibold text-text-main"># {currentRoom}</h1>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-text-muted">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-muted bg-bg-main border border-border-base rounded-lg hover:text-text-main hover:border-primary/50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analytics
                    </button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                            No messages yet. Start the conversation!
                        </div>
                    )}
                    {messages.map((msg, index) => {
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];
                        const isSystemMsg = msg.type === 'join' || msg.type === 'leave';
                        const prevIsSystem = prevMsg?.type === 'join' || prevMsg?.type === 'leave';
                        const nextIsSystem = nextMsg?.type === 'join' || nextMsg?.type === 'leave';

                        const isFirst = isSystemMsg || !prevMsg || prevMsg.sender !== msg.sender || prevIsSystem;
                        const isLast = isSystemMsg || !nextMsg || nextMsg.sender !== msg.sender || nextIsSystem;

                        return (
                            <MessageBubble
                                key={msg.id || index}
                                message={msg}
                                onDelete={deleteMessage}
                                isFirst={isFirst}
                                isLast={isLast}
                            />
                        );
                    })}
                    <div ref={messagesEndRef} />
                    {error && (
                        <div className="text-center text-sm text-red-500 py-2">
                            Error: {error}
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 bg-bg-surface border-t border-border-base">
                    <form onSubmit={handleSend} className="flex gap-3">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={!isConnected}
                            className="flex-1 px-4 py-2.5 bg-input-bg border border-border-base rounded-full text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 placeholder:text-gray-600"
                        />
                        <button
                            type="submit"
                            disabled={!isConnected || !inputMessage.trim()}
                            className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </main>

            {showAnalytics && (
                <AnalyticsView
                    roomId={currentRoom}
                    onClose={() => setShowAnalytics(false)}
                />
            )}
        </div>
    );
};

export default ChatInterface;
