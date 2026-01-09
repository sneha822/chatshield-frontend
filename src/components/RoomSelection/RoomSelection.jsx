import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const RoomSelection = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await api.getRooms(token);
                setRooms(data.rooms || []);
            } catch (err) {
                console.error('Failed to load rooms', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchRooms();
    }, [token]);

    const handleJoin = (roomId) => {
        if (roomId) navigate(`/chat/room/${roomId}`);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const roomName = newRoom.trim();
        if (!roomName) return;

        try {
            await api.createRoom(roomName);
            navigate(`/chat/room/${roomName}`);
        } catch (err) {
            if (err.message === 'Room already exists') {
                alert('Room already exists');
            } else {
                alert(err.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-bg-main">
            {/* Header */}
            <header className="bg-bg-surface border-b border-border-base">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="/images/logo.png" alt="ChatShield Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold text-text-main">ChatShield</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-text-muted">{user?.username}</span>
                        <button
                            onClick={logout}
                            className="text-sm text-text-muted hover:text-text-main transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-xl font-semibold text-text-main mb-1">Rooms</h1>
                    <p className="text-sm text-text-muted">Join an existing room or create a new one</p>
                </div>

                {/* Create/Join Form */}
                <div className="bg-bg-surface rounded-xl border border-border-base p-4 mb-6">
                    <form className="flex gap-2" onSubmit={handleCreate}>
                        <input
                            type="text"
                            placeholder="Enter room name..."
                            value={newRoom}
                            onChange={(e) => setNewRoom(e.target.value)}
                            className="flex-1 px-3.5 py-2 bg-input-bg border border-border-base rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-600"
                        />
                        <button
                            type="button"
                            onClick={() => handleJoin(newRoom.trim())}
                            disabled={!newRoom.trim()}
                            className="px-4 py-2 text-sm font-medium text-text-muted bg-bg-main border border-border-base rounded-lg hover:text-text-main hover:border-text-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Join
                        </button>
                        <button
                            type="submit"
                            disabled={!newRoom.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Create
                        </button>
                    </form>
                </div>

                {/* Room List */}
                <div>
                    <h2 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                        Active Rooms
                    </h2>
                    {loading ? (
                        <p className="text-sm text-text-muted">Loading...</p>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-12 text-text-muted">
                            <p className="text-sm">No active rooms</p>
                            <p className="text-xs mt-1">Create one to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {rooms.map(room => (
                                <button
                                    key={room.room_id}
                                    onClick={() => handleJoin(room.room_id)}
                                    className="w-full flex items-center justify-between p-4 bg-bg-surface border border-border-base rounded-xl hover:border-primary/30 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-bg-main rounded-lg flex items-center justify-center border border-border-base group-hover:border-primary/30">
                                            <span className="text-text-muted font-medium group-hover:text-primary">#</span>
                                        </div>
                                        <span className="font-medium text-text-main group-hover:text-primary transition-colors">{room.room_id}</span>
                                    </div>
                                    <span className="text-sm text-text-muted">{room.user_count} online</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RoomSelection;
