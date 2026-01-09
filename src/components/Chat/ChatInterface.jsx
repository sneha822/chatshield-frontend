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

    const { messages, users, isConnected, error, sendMessage } = useChat(token, currentRoom);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await api.getRooms(token);
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
        <div className="flex h-screen bg-neutral-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b border-neutral-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">CS</span>
                        </div>
                        <span className="font-semibold text-neutral-900">ChatShield</span>
                    </div>
                </div>

                {/* Rooms */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="mb-2">
                        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider px-2 mb-2">
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
                                className="flex-1 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400"
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
                                className="px-2.5 py-1.5 bg-neutral-100 text-neutral-700 rounded-md text-xs hover:bg-neutral-200 transition-colors"
                            >
                                →
                            </button>
                            <button
                                type="submit"
                                title="Create Room"
                                className="px-2.5 py-1.5 bg-neutral-900 text-white rounded-md text-xs hover:bg-neutral-800"
                            >
                                +
                            </button>
                        </div>
                    </form>
                </div>

                {/* Online Users */}
                <div className="p-3 border-t border-neutral-200">
                    <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider px-2 mb-2">
                        Online ({users.length})
                    </h3>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {users.map((u, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-neutral-600 truncate">{u}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User */}
                <div className="p-3 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-neutral-600">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-neutral-900">{user?.username}</span>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="text-xs text-neutral-400 hover:text-neutral-600"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-14 bg-white border-b border-neutral-200 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="font-semibold text-neutral-900"># {currentRoom}</h1>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-neutral-500">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analytics
                    </button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                            No messages yet. Start the conversation!
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                    {error && (
                        <div className="text-center text-sm text-red-500 py-2">
                            Error: {error}
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-neutral-200">
                    <form onSubmit={handleSend} className="flex gap-3">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={!isConnected}
                            className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-transparent disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!isConnected || !inputMessage.trim()}
                            className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
