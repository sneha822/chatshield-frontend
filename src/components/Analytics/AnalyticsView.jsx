import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Shield, AlertTriangle, MessageCircle, Activity, X } from 'lucide-react';
import RosenBarChart from '../charts/RosenBarChart';
import RosenDonutChart from '../charts/RosenDonutChart';

// Simple stat card component
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="p-4 sm:p-5 rounded-2xl bg-bg-main border border-border-base">
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className={`p-1.5 sm:p-2 rounded-xl ${color.bg}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color.text}`} />
            </div>
        </div>
        <p className={`text-2xl sm:text-3xl font-bold ${color.text} mb-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs sm:text-sm text-text-muted">{label}</p>
    </div>
);

// Empty state component
const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-text-muted py-8 sm:py-12">
        <Shield className="w-10 h-10 sm:w-12 sm:h-12 opacity-20 mb-3" />
        <p className="text-xs sm:text-sm">{message}</p>
    </div>
);

const AnalyticsView = ({ roomId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [analyticsData, messagesData] = await Promise.all([
                    api.getRoomAnalytics(roomId),
                    api.getRoomMessages(roomId)
                ]);
                setData({ ...analyticsData, messages: messagesData });
            } catch (err) {
                setError('Failed to load analytics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (roomId) fetchAnalytics();
    }, [roomId]);

    // Data transformations
    const safeUsersData = useMemo(() => {
        if (!data?.messages?.length) return [];

        const safeCounts = {};

        data.messages.forEach(msg => {
            // Skip system messages
            if (msg.type === 'join' || msg.type === 'leave' || !msg.sender) return;

            // Check toxicity (safe if <= 0.6)
            const toxicity = msg.toxicity?.toxicity || 0;
            if (toxicity <= 0.6) {
                // Use lowercase for consistent grouping if needed, but display usually preserves case
                // Assuming sender is the username
                const user = msg.sender;
                safeCounts[user] = (safeCounts[user] || 0) + 1;
            }
        });

        return Object.entries(safeCounts)
            .map(([username, count]) => ({
                username,
                message_count: count,
            }))
            .sort((a, b) => b.message_count - a.message_count)
            .slice(0, 5);
    }, [data?.messages]);

    const toxicUsersData = useMemo(() => {
        if (!data?.most_toxic_users?.length) return [];
        return data.most_toxic_users.map((u) => ({
            username: u.username,
            toxic_messages: u.toxic_messages,
        }));
    }, [data?.most_toxic_users]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!data) return { safePercent: 0, toxicPercent: 0, toxicTotal: 0 };

        let total = 0;
        let safeTotal = 0;
        let toxicTotal = 0;

        if (data.messages) {
            data.messages.forEach(msg => {
                if (msg.type === 'join' || msg.type === 'leave') return;
                total++;
                const toxicity = msg.toxicity?.toxicity || 0;
                if (toxicity > 0.6) {
                    toxicTotal++;
                } else {
                    safeTotal++;
                }
            });
        } else {
            // Fallback to backend data if messages missing (shouldn't happen with new logic)
            total = data.total_messages || 1;
            toxicTotal = data.most_toxic_users?.reduce((sum, u) => sum + (u.toxic_messages || 0), 0) || 0;
            // Rough estimate for fallback
            safeTotal = Math.max(0, total - toxicTotal);
        }

        if (total === 0) total = 1; // Avoid divide by zero

        return {
            safePercent: Math.round((safeTotal / total) * 100),
            toxicPercent: Math.round((toxicTotal / total) * 100),
            toxicTotal,
        };
    }, [data]);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'users', label: 'Users' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-bg-surface border border-border-base rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 sm:px-6 sm:py-5 border-b border-border-base gap-4 text-bg-main sm:gap-0">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-text-main">Room Analytics</h2>
                                <p className="text-xs sm:text-sm text-text-muted">
                                    Insights for <span className="text-primary font-medium">#{roomId}</span>
                                </p>
                            </div>
                        </div>
                        {/* Close button for mobile inside header top row */}
                        <div className="sm:hidden">
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-bg-main p-1 rounded-xl w-full sm:w-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'text-text-muted hover:text-text-main'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="hidden sm:block p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-3 sm:p-6 overflow-y-auto custom-scrollbar">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-2 border-border-base border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-text-muted">Loading analytics...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {data && (
                        <div className="space-y-4 sm:space-y-6">

                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <>
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                        <div className="col-span-2 md:col-span-1">
                                            <StatCard
                                                icon={MessageCircle}
                                                label="Total Messages"
                                                value={data.total_messages || 0}
                                                color={{ bg: 'bg-blue-500/10', text: 'text-blue-400' }}
                                            />
                                        </div>
                                        <StatCard
                                            icon={Shield}
                                            label="Safe Messages"
                                            value={`${stats.safePercent}%`}
                                            color={{ bg: 'bg-emerald-500/10', text: 'text-emerald-400' }}
                                        />
                                        <StatCard
                                            icon={AlertTriangle}
                                            label="Toxic Detected"
                                            value={stats.toxicTotal}
                                            color={{ bg: 'bg-red-500/10', text: 'text-red-400' }}
                                        />
                                    </div>

                                    {/* Toxic Users Chart */}
                                    <div className="bg-bg-main border border-border-base rounded-2xl p-4 sm:p-6">
                                        <div className="mb-4 sm:mb-6">
                                            <h3 className="text-base sm:text-lg font-semibold text-text-main">Flagged Activity</h3>
                                            <p className="text-xs sm:text-sm text-text-muted">Users with the most toxic messages</p>
                                        </div>

                                        {toxicUsersData.length > 0 ? (
                                            <RosenBarChart
                                                data={toxicUsersData}
                                                valueKey="toxic_messages"
                                                labelKey="username"
                                                colorScheme="red"
                                            />
                                        ) : (
                                            <EmptyState message="No toxic messages detected 🎉" />
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                                    {/* Toxic Users */}
                                    <div className="bg-bg-main border border-border-base rounded-2xl p-4 sm:p-6">
                                        <div className="mb-4 sm:mb-6">
                                            <h3 className="text-base sm:text-lg font-semibold text-text-main">Flagged Activity</h3>
                                            <p className="text-xs sm:text-sm text-text-muted">Users with toxic messages</p>
                                        </div>

                                        {toxicUsersData.length > 0 ? (
                                            <RosenBarChart
                                                data={toxicUsersData}
                                                valueKey="toxic_messages"
                                                labelKey="username"
                                                colorScheme="red"
                                            />
                                        ) : (
                                            <EmptyState message="No toxic users detected" />
                                        )}
                                    </div>

                                    {/* Safe Users */}
                                    <div className="bg-bg-main border border-border-base rounded-2xl p-4 sm:p-6">
                                        <div className="mb-4 sm:mb-6">
                                            <h3 className="text-base sm:text-lg font-semibold text-text-main">Positive Contributors</h3>
                                            <p className="text-xs sm:text-sm text-text-muted">Top safe message contributors</p>
                                        </div>

                                        {safeUsersData.length > 0 ? (
                                            <RosenDonutChart
                                                data={safeUsersData}
                                                labelKey="username"
                                                valueKey="message_count"
                                            />
                                        ) : (
                                            <EmptyState message="No contributor data yet" />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
