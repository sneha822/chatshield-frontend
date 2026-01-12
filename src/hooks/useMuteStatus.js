import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook to manage mute status for the toxic message muting system.
 * Handles countdown timer, mute state updates, and formatting.
 */
export const useMuteStatus = () => {
    const [muteInfo, setMuteInfo] = useState({
        isMuted: false,
        muteExpiresAt: null,
        remainingSeconds: null,
        warningCount: 0,
        consecutiveToxicCount: 0,
        totalMuteCount: 0,
        warningsUntilMute: 5,
        muteDurationMinutes: 5,
        toxicThreshold: 5,
    });

    const timerRef = useRef(null);

    /**
     * Update mute info from server response
     * @param {Object} serverMuteInfo - The mute_info object from the server
     */
    const updateMuteInfo = useCallback((serverMuteInfo) => {
        if (!serverMuteInfo) return;

        setMuteInfo({
            isMuted: serverMuteInfo.is_muted ?? false,
            muteExpiresAt: serverMuteInfo.mute_expires_at ?? null,
            remainingSeconds: serverMuteInfo.remaining_seconds ?? null,
            warningCount: serverMuteInfo.warning_count ?? 0,
            consecutiveToxicCount: serverMuteInfo.consecutive_toxic_count ?? 0,
            totalMuteCount: serverMuteInfo.total_mute_count ?? 0,
            warningsUntilMute: serverMuteInfo.warnings_until_mute ?? 5,
            muteDurationMinutes: serverMuteInfo.mute_duration_minutes ?? 5,
            toxicThreshold: serverMuteInfo.toxic_threshold ?? 5,
        });
    }, []);

    /**
     * Clear mute status (e.g., when leaving a room)
     */
    const clearMuteStatus = useCallback(() => {
        setMuteInfo({
            isMuted: false,
            muteExpiresAt: null,
            remainingSeconds: null,
            warningCount: 0,
            consecutiveToxicCount: 0,
            totalMuteCount: 0,
            warningsUntilMute: 5,
            muteDurationMinutes: 5,
            toxicThreshold: 5,
        });
    }, []);

    // Start countdown timer when muted
    useEffect(() => {
        // Only start the timer if we have a positive remaining time
        const currentRemaining = muteInfo.remainingSeconds;
        
        if (muteInfo.isMuted && currentRemaining > 0) {
            // Clear any existing timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            timerRef.current = setInterval(() => {
                setMuteInfo(prev => {
                    const newRemaining = Math.max(0, (prev.remainingSeconds ?? 0) - 1);

                    // Auto-unmute when timer reaches 0
                    if (newRemaining === 0) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                        return {
                            ...prev,
                            isMuted: false,
                            remainingSeconds: null,
                            muteExpiresAt: null,
                            consecutiveToxicCount: 0,
                            warningsUntilMute: 5,
                        };
                    }

                    return {
                        ...prev,
                        remainingSeconds: newRemaining,
                    };
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
        // We intentionally only restart the timer when isMuted or muteExpiresAt changes,
        // not on every remainingSeconds decrement
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [muteInfo.isMuted, muteInfo.muteExpiresAt]);

    /**
     * Format remaining time for display (MM:SS)
     * @returns {string|null} Formatted time string or null
     */
    const formatRemainingTime = useCallback(() => {
        if (!muteInfo.remainingSeconds || muteInfo.remainingSeconds <= 0) return null;

        const minutes = Math.floor(muteInfo.remainingSeconds / 60);
        const seconds = muteInfo.remainingSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [muteInfo.remainingSeconds]);

    /**
     * Get progress percentage for warning bar (0-100)
     * @returns {number} Progress percentage
     */
    const getWarningProgress = useCallback(() => {
        const threshold = muteInfo.toxicThreshold || 5;
        return Math.min((muteInfo.consecutiveToxicCount / threshold) * 100, 100);
    }, [muteInfo.consecutiveToxicCount, muteInfo.toxicThreshold]);

    return {
        muteInfo,
        updateMuteInfo,
        clearMuteStatus,
        formatRemainingTime,
        getWarningProgress,
        canSendMessage: !muteInfo.isMuted,
    };
};
