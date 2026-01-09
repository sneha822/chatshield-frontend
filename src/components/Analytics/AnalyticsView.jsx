import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../../services/api';

const AnalyticsView = ({ roomId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const result = await api.getRoomAnalytics(roomId);
                setData(result);
            } catch (err) {
                setError('Failed to load analytics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (roomId) fetchAnalytics();
    }, [roomId]);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-slide-in shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900">Room Analytics</h2>
                        <p className="text-sm text-neutral-500">#{roomId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
                    )}

                    {data && (
                        <div className="space-y-8">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-neutral-900">{data.total_messages}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Total Messages</p>
                                </div>
                                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-neutral-900">{data.most_toxic_users?.length || 0}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Users Flagged</p>
                                </div>
                                <div className="bg-neutral-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-neutral-900">{data.safest_users?.length || 0}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Safe Users</p>
                                </div>
                            </div>

                            {/* Most Toxic Users Chart */}
                            <div>
                                <h3 className="text-sm font-medium text-neutral-900 mb-4">
                                    Users with Most Toxic Messages
                                </h3>
                                {data.most_toxic_users?.length === 0 ? (
                                    <div className="bg-neutral-50 rounded-xl p-8 text-center text-neutral-400 text-sm">
                                        No toxic activity detected
                                    </div>
                                ) : (
                                    <div className="bg-neutral-50 rounded-xl p-4 h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.most_toxic_users} layout="vertical" margin={{ left: 60 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                                <XAxis type="number" tick={{ fontSize: 12, fill: '#737373' }} />
                                                <YAxis dataKey="username" type="category" tick={{ fontSize: 12, fill: '#737373' }} width={50} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e5e5e5',
                                                        borderRadius: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Bar dataKey="toxic_messages" name="Toxic" radius={[0, 4, 4, 0]}>
                                                    {data.most_toxic_users?.map((entry, index) => (
                                                        <Cell key={index} fill="#ef4444" />
                                                    ))}
                                                </Bar>
                                                <Bar dataKey="message_count" name="Total" radius={[0, 4, 4, 0]}>
                                                    {data.most_toxic_users?.map((entry, index) => (
                                                        <Cell key={index} fill="#d4d4d4" />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Safest Users Chart */}
                            <div>
                                <h3 className="text-sm font-medium text-neutral-900 mb-4">
                                    Safest Contributors
                                </h3>
                                {data.safest_users?.length === 0 ? (
                                    <div className="bg-neutral-50 rounded-xl p-8 text-center text-neutral-400 text-sm">
                                        No data yet
                                    </div>
                                ) : (
                                    <div className="bg-neutral-50 rounded-xl p-4 h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.safest_users} layout="vertical" margin={{ left: 60 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                                                <XAxis type="number" tick={{ fontSize: 12, fill: '#737373' }} />
                                                <YAxis dataKey="username" type="category" tick={{ fontSize: 12, fill: '#737373' }} width={50} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e5e5e5',
                                                        borderRadius: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Bar dataKey="message_count" name="Messages" radius={[0, 4, 4, 0]}>
                                                    {data.safest_users?.map((entry, index) => (
                                                        <Cell key={index} fill="#22c55e" />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
