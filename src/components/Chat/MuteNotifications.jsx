import React, { useEffect } from 'react';
import clsx from 'clsx';

/**
 * Warning Toast Component - Shows when user receives a toxic message warning
 * Uses theme colors: dark surface with amber accent
 */
export const WarningToast = ({ message, muteInfo, onClose }) => {
    const progress = muteInfo ? 
        ((muteInfo.consecutiveToxicCount || 0) / (muteInfo.toxicThreshold || 5)) * 100 : 0;
    
    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right max-w-sm">
            <div className="bg-bg-surface border border-amber-500/30 text-text-main p-4 rounded-xl shadow-lg shadow-black/40">
                <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug text-amber-400">{message}</p>
                        
                        {/* Progress bar */}
                        <div className="mt-3 h-1.5 bg-bg-main rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        
                        <p className="text-xs mt-2 text-text-muted">
                            {muteInfo?.warningsUntilMute || 0} more toxic messages until mute
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main text-xl leading-none p-1 -mr-1 -mt-1 transition-colors"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Mute Banner Component - Shows at top of chat when user is muted
 * Uses theme colors: dark surface with red accent
 */
export const MuteBanner = ({ remainingTime, muteInfo }) => {
    return (
        <div className="bg-bg-surface border-b border-red-500/30 text-text-main px-4 py-3 flex items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-2xl">🔇</span>
            </div>
            <div className="flex-1">
                <p className="text-base font-semibold text-red-400">You are muted</p>
                <p className="text-2xl font-bold tabular-nums text-text-main">
                    Time remaining: <span className="text-red-400">{remainingTime || '0:00'}</span>
                </p>
                {muteInfo?.totalMuteCount > 0 && (
                    <p className="text-xs text-text-muted mt-1">
                        Total mutes in this room: {muteInfo.totalMuteCount}
                    </p>
                )}
            </div>
        </div>
    );
};

/**
 * Unmute Notification Component - Shows when mute expires
 * Uses theme colors: dark surface with primary emerald accent
 */
export const UnmuteNotification = ({ onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-main/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-bg-surface border border-primary/30 text-text-main p-8 rounded-2xl shadow-2xl shadow-primary/20 text-center animate-pop-in max-w-sm mx-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🔊</span>
                </div>
                <p className="text-lg font-medium mb-6 text-primary">
                    Your mute has expired. You can send messages again!
                </p>
                <button 
                    onClick={onClose}
                    className="bg-primary text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

/**
 * Rejected Toast Component - Shows when muted user tries to send message
 * Uses theme colors: dark surface
 */
export const RejectedToast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
            <div className="bg-bg-surface border border-border-base text-text-main px-6 py-3 rounded-lg shadow-lg shadow-black/40 text-sm font-medium">
                <span className="text-red-400">🔇</span> {message}
            </div>
        </div>
    );
};

/**
 * Warning Status Bar - Shows warning progress in chat header area
 * Uses theme colors: subtle amber on dark surface
 */
export const WarningStatusBar = ({ consecutiveCount, threshold = 5 }) => {
    if (consecutiveCount <= 0) return null;
    
    const progress = (consecutiveCount / threshold) * 100;
    
    return (
        <div className="bg-bg-surface/50 border-l-4 border-amber-500 px-4 py-2 flex items-center gap-3 animate-fade-in">
            <span className="text-amber-400 text-sm">
                ⚠️ Toxic message warnings: {consecutiveCount}/{threshold}
            </span>
            <div className="flex-1 max-w-30 h-1 bg-bg-main rounded-full overflow-hidden">
                <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

/**
 * System Message for mute/unmute broadcasts
 * Uses theme colors: themed pills
 */
export const MuteSystemMessage = ({ content, type }) => {
    const isMuted = type === 'muted';
    
    return (
        <div className="flex justify-center py-2 animate-fade-in">
            <span className={clsx(
                'text-xs px-3 py-1 rounded-full',
                isMuted 
                    ? 'bg-bg-surface text-red-400 border border-red-500/20'
                    : 'bg-bg-surface text-primary border border-primary/20'
            )}>
                {isMuted ? '🔇' : '🔊'} {content}
            </span>
        </div>
    );
};

export default {
    WarningToast,
    MuteBanner,
    UnmuteNotification,
    RejectedToast,
    WarningStatusBar,
    MuteSystemMessage,
};
