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
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">CS</span>
                        </div>
                        <span className="font-semibold text-neutral-900">ChatShield</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-500">{user?.username}</span>
                        <button
                            onClick={logout}
                            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-xl font-semibold text-neutral-900 mb-1">Rooms</h1>
                    <p className="text-sm text-neutral-500">Join an existing room or create a new one</p>
                </div>

                {/* Create/Join Form */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
                    <form className="flex gap-2" onSubmit={handleCreate}>
                        <input
                            type="text"
                            placeholder="Enter room name..."
                            value={newRoom}
                            onChange={(e) => setNewRoom(e.target.value)}
                            className="flex-1 px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={() => handleJoin(newRoom.trim())}
                            disabled={!newRoom.trim()}
                            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Join
                        </button>
                        <button
                            type="submit"
                            disabled={!newRoom.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Create
                        </button>
                    </form>
                </div>

                {/* Room List */}
                <div>
                    <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
                        Active Rooms
                    </h2>
                    {loading ? (
                        <p className="text-sm text-neutral-500">Loading...</p>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400">
                            <p className="text-sm">No active rooms</p>
                            <p className="text-xs mt-1">Create one to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {rooms.map(room => (
                                <button
                                    key={room.room_id}
                                    onClick={() => handleJoin(room.room_id)}
                                    className="w-full flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                                            <span className="text-neutral-600 font-medium">#</span>
                                        </div>
                                        <span className="font-medium text-neutral-900">{room.room_id}</span>
                                    </div>
                                    <span className="text-sm text-neutral-400">{room.user_count} online</span>
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
