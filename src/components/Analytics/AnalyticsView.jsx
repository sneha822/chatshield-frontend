import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api } from '../../services/api';
import { Shield, AlertTriangle, MessageCircle, Activity, X, Clock, VolumeX, Volume2, RefreshCw, User } from 'lucide-react';
import RosenBarChart from '../charts/RosenBarChart';
import RosenDonutChart from '../charts/RosenDonutChart';
import { useAuth } from '../../context/AuthContext';

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

// Format seconds to MM:SS
const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Calculate time progress for circular indicator
const getTimeProgress = (remaining, total) => {
    if (!remaining || !total || total <= 0) return 0;
    return Math.min((remaining / total) * 100, 100);
};

// Muted User Card Component
const MutedUserCard = ({ user, onUnmute, isUnmuting }) => {
    const [remainingSeconds, setRemainingSeconds] = useState(user.remaining_seconds || 0);
    const totalDuration = (user.mute_duration_minutes || 5) * 60;
    const progress = getTimeProgress(remainingSeconds, totalDuration);

    // Countdown timer
    useEffect(() => {
        if (remainingSeconds <= 0) return;

        const timer = setInterval(() => {
            setRemainingSeconds(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingSeconds]);

    // Sync with prop changes
    useEffect(() => {
        setRemainingSeconds(user.remaining_seconds || 0);
    }, [user.remaining_seconds]);

    const isExpired = remainingSeconds <= 0;

    return (
        <div className={`relative p-4 rounded-xl border transition-all duration-300 ${
            isExpired 
                ? 'bg-bg-surface/50 border-border-base opacity-60' 
                : 'bg-bg-surface border-red-500/30 hover:border-red-500/50'
        }`}>
            <div className="flex items-start justify-between gap-3">
                {/* User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar with timer ring */}
                    <div className="relative">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                            isExpired ? 'bg-bg-main' : 'bg-red-500/10'
                        }`}>
                            <User className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                isExpired ? 'text-text-muted' : 'text-red-400'
                            }`} />
                        </div>
                        {/* Circular progress indicator */}
                        {!isExpired && (
                            <svg className="absolute -inset-0.5 w-[calc(100%+4px)] h-[calc(100%+4px)] -rotate-90">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="calc(50% - 2px)"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-bg-main"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="calc(50% - 2px)"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray={`${progress * 1.57} 157`}
                                    strokeLinecap="round"
                                    className="text-red-400 transition-all duration-1000"
                                />
                            </svg>
                        )}
                    </div>

                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-main truncate text-sm sm:text-base">
                            {user.username}
                        </p>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                            {isExpired ? (
                                <span className="text-xs text-emerald-400 flex items-center gap-1">
                                    <Volume2 className="w-3 h-3" />
                                    Mute expired
                                </span>
                            ) : (
                                <span className="text-xs text-red-400 flex items-center gap-1">
                                    <VolumeX className="w-3 h-3" />
                                    Muted
                                </span>
                            )}
                            {user.total_mute_count > 1 && (
                                <span className="text-xs text-text-muted">
                                    • {user.total_mute_count}x muted
                                </span>
                            )}
                            {user.muted_at && (
                                <span className="text-xs text-text-muted">
                                    • {new Date(user.muted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Time & Actions */}
                <div className="flex flex-col items-end gap-2">
                    {!isExpired && (
                        <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-sm font-mono font-bold text-red-400 tabular-nums">
                                {formatTime(remainingSeconds)}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => onUnmute(user.username)}
                        disabled={isUnmuting || isExpired}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                            isExpired
                                ? 'bg-bg-main text-text-muted cursor-not-allowed'
                                : isUnmuting
                                    ? 'bg-primary/20 text-primary cursor-wait'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                    >
                        {isUnmuting ? (
                            <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Unmuting...
                            </span>
                        ) : isExpired ? (
                            'Expired'
                        ) : (
                            'Unmute'
                        )}
                    </button>
                </div>
            </div>

            {/* Warning Info */}
            {user.warning_count > 0 && !isExpired && (
                <div className="mt-3 pt-3 border-t border-border-base">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Total warnings received</span>
                        <span className="text-amber-400 font-medium">
                            {user.warning_count} warnings
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const AnalyticsView = ({ roomId, onClose }) => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Muted users state
    const [mutedUsers, setMutedUsers] = useState([]);
    const [mutedLoading, setMutedLoading] = useState(false);
    const [mutedError, setMutedError] = useState(null);
    const [unmutingUser, setUnmutingUser] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const refreshIntervalRef = useRef(null);

    // Fetch analytics data
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

    // Fetch muted users
    const fetchMutedUsers = useCallback(async () => {
        if (!roomId || !token) return;
        
        try {
            setMutedLoading(true);
            setMutedError(null);
            const response = await api.getMutedUsers(roomId, token);
            
            if (!response.is_authorized) {
                setIsCreator(false);
                setMutedUsers([]);
                return;
            }
            
            setIsCreator(true);
            setMutedUsers(response.muted_users || []);
        } catch (err) {
            console.error('Failed to fetch muted users:', err);
            setMutedError('Failed to load muted users');
        } finally {
            setMutedLoading(false);
        }
    }, [roomId, token]);

    // Fetch muted users on initial mount
    useEffect(() => {
        if (roomId && token) {
            fetchMutedUsers();
        }
    }, [roomId, token, fetchMutedUsers]);

    // Auto-refresh when on moderation tab
    useEffect(() => {
        if (activeTab === 'moderation') {
            // Auto-refresh every 10 seconds when on moderation tab
            refreshIntervalRef.current = setInterval(fetchMutedUsers, 10000);
        }
        
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [activeTab, fetchMutedUsers]);

    // Handle unmute user
    const handleUnmuteUser = useCallback(async (username) => {
        if (!token) return;
        
        try {
            setUnmutingUser(username);
            await api.unmuteUser(roomId, username, token);
            // Remove user from list or refresh
            setMutedUsers(prev => prev.filter(u => u.username !== username));
        } catch (err) {
            console.error('Failed to unmute user:', err);
            setMutedError(`Failed to unmute ${username}`);
        } finally {
            setUnmutingUser(null);
        }
    }, [roomId, token]);

    // Count active mutes
    const activeMutesCount = useMemo(() => {
        return mutedUsers.filter(u => (u.remaining_seconds || 0) > 0).length;
    }, [mutedUsers]);

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

    // Build tabs - only show moderation tab if user is creator
    const tabs = useMemo(() => {
        const baseTabs = [
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
        ];
        
        if (isCreator) {
            baseTabs.push({ 
                id: 'moderation', 
                label: 'Moderation', 
                badge: activeMutesCount > 0 ? activeMutesCount : null 
            });
        }
        
        return baseTabs;
    }, [isCreator, activeMutesCount]);

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
                                className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'text-text-muted hover:text-text-main'
                                    }`}
                            >
                                {tab.label}
                                {tab.badge && (
                                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                        activeTab === tab.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {tab.badge}
                                    </span>
                                )}
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
                                    <div className={`grid grid-cols-2 ${isCreator ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3 sm:gap-4`}>
                                        <StatCard
                                            icon={MessageCircle}
                                            label="Total Messages"
                                            value={data.total_messages || 0}
                                            color={{ bg: 'bg-blue-500/10', text: 'text-blue-400' }}
                                        />
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
                                        {isCreator && (
                                            <StatCard
                                                icon={VolumeX}
                                                label="Users Muted"
                                                value={activeMutesCount}
                                                color={{ bg: 'bg-amber-500/10', text: 'text-amber-400' }}
                                            />
                                        )}
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

                            {/* Moderation Tab */}
                            {activeTab === 'moderation' && (
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Muted Users Header */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-text-main flex items-center gap-2">
                                                <VolumeX className="w-5 h-5 text-red-400" />
                                                Muted Users
                                            </h3>
                                            <p className="text-xs sm:text-sm text-text-muted mt-1">
                                                {activeMutesCount > 0 
                                                    ? `${activeMutesCount} user${activeMutesCount !== 1 ? 's' : ''} currently muted`
                                                    : 'No users are currently muted'
                                                }
                                            </p>
                                        </div>
                                        <button
                                            onClick={fetchMutedUsers}
                                            disabled={mutedLoading}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-bg-main border border-border-base text-text-muted hover:text-text-main hover:border-border-hover transition-all disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${mutedLoading ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </button>
                                    </div>

                                    {/* Error Message */}
                                    {mutedError && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            {mutedError}
                                            <button 
                                                onClick={() => setMutedError(null)}
                                                className="ml-auto hover:text-red-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Loading State */}
                                    {mutedLoading && mutedUsers.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="w-8 h-8 border-2 border-border-base border-t-primary rounded-full animate-spin mb-3"></div>
                                            <p className="text-text-muted text-sm">Loading muted users...</p>
                                        </div>
                                    )}

                                    {/* Muted Users Grid */}
                                    {!mutedLoading && mutedUsers.length > 0 && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                            {mutedUsers.map((user) => (
                                                <MutedUserCard
                                                    key={user.username}
                                                    user={user}
                                                    onUnmute={handleUnmuteUser}
                                                    isUnmuting={unmutingUser === user.username}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {!mutedLoading && mutedUsers.length === 0 && (
                                        <div className="bg-bg-main border border-border-base rounded-2xl p-8 sm:p-12">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                                    <Volume2 className="w-8 h-8 text-emerald-400" />
                                                </div>
                                                <h4 className="text-lg font-semibold text-text-main mb-2">
                                                    All Clear! 🎉
                                                </h4>
                                                <p className="text-sm text-text-muted max-w-sm">
                                                    No users are currently muted in this room. The community is behaving well!
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mute Statistics */}
                                    {mutedUsers.length > 0 && (
                                        <div className="bg-bg-main border border-border-base rounded-2xl p-4 sm:p-6">
                                            <h4 className="text-sm font-semibold text-text-main mb-4">Mute Statistics</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                                <div className="p-3 rounded-xl bg-bg-surface border border-border-base">
                                                    <p className="text-2xl font-bold text-red-400">{activeMutesCount}</p>
                                                    <p className="text-xs text-text-muted mt-1">Active Mutes</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-bg-surface border border-border-base">
                                                    <p className="text-2xl font-bold text-amber-400">
                                                        {mutedUsers.filter(u => (u.remaining_seconds || 0) <= 0).length}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-1">Expired</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-bg-surface border border-border-base">
                                                    <p className="text-2xl font-bold text-text-main">
                                                        {mutedUsers.reduce((sum, u) => sum + (u.total_mute_count || 1), 0)}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-1">Total Mutes</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-bg-surface border border-border-base">
                                                    <p className="text-2xl font-bold text-primary">
                                                        {mutedUsers.reduce((sum, u) => sum + (u.warning_count || 0), 0)}
                                                    </p>
                                                    <p className="text-xs text-text-muted mt-1">Total Warnings</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
