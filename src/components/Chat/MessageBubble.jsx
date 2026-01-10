import React, { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getToxicityLevel, TOXICITY_LEVELS } from '../../utils/messageUtils';
import { getMessageId, formatTime } from '../../utils/chatUtils';

/**
 * Minimal toxicity dot indicator
 */
const ToxicityIndicator = ({ level, score }) => {
    const getColors = () => {
        if (level === TOXICITY_LEVELS.SAFE) {
            return 'bg-primary/20 text-primary border-primary/30';
        }
        if (level === TOXICITY_LEVELS.MILD) {
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        }
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    };

    return (
        <div
            className={clsx(
                'flex items-center gap-1 px-1 rounded-sm text-[8px] font-medium border',
                getColors()
            )}
            title={`Toxicity: ${score}%`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            <span>{score}%</span>
        </div>
    );
};

/**
 * Delete button with minimal hover effect
 */
const DeleteButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10"
        title="Delete message"
    >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    </button>
);

/**
 * @param {Object} props
 * @param {Object} props.message - The message object
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.isFirst - Is first message in a group from same sender
 * @param {boolean} props.isLast - Is last message in a group from same sender
 */
const MessageBubble = ({ message, onDelete, isFirst = true, isLast = true }) => {
    const { user } = useAuth();
    const [isRevealed, setIsRevealed] = useState(false);



    const isOwnMessage = message.sender?.toLowerCase() === user?.username?.toLowerCase();
    const isSystem = message.type === 'join' || message.type === 'leave';

    // Toxicity handling
    const level = getToxicityLevel(message.toxicity);
    const toxicityScore = message.toxicity ? (message.toxicity.toxicity * 100).toFixed(0) : 0;
    const isSevere = level === TOXICITY_LEVELS.SEVERE;
    const shouldBlur = isSevere && !isOwnMessage && !isRevealed;
    const messageId = getMessageId(message);
    const hasToxicity = message.toxicity && toxicityScore > 0;

    // System messages
    if (isSystem) {
        return (
            <div className="flex justify-center py-2">
                <span className="text-[10px] text-text-muted/70 tracking-wide">
                    {message.content}
                </span>
            </div>
        );
    }



    // Calculate gap between grouped messages
    const getSpacing = () => {
        if (isLast) return 'mb-2';
        return 'mb-[2px]';
    };

    return (
        <div className={clsx(
            'flex flex-col',
            isOwnMessage ? 'items-end' : 'items-start',
            getSpacing()
        )}>
            {/* Sender name - only show for first message of other users */}
            {!isOwnMessage && isFirst && (
                <span className="text-[11px] text-secondary font-medium mb-1 ml-1">
                    {message.sender}
                </span>
            )}

            {/* Message row */}
            <div className={clsx(
                'flex items-end gap-2 group max-w-[75%] rounded-2xl',
                isOwnMessage && 'flex-row-reverse'
            )}>
                {/* Bubble */}
                <div
                    onClick={() => shouldBlur && setIsRevealed(true)}
                    className={clsx(
                        'relative px-2 py-1.5 min-w-[70px] rounded-md border',
                        isOwnMessage
                            ? 'bg-bubble-sender text-white'
                            : 'bg-bg-surface text-text-main',
                        shouldBlur && 'cursor-pointer',
                        isSevere ? 'border-red-500' : 'border-transparent',
                    )}
                >
                    {/* Message content */}
                    <p className={clsx(
                        'text-base leading-6',
                        shouldBlur && 'blur-sm select-none'
                    )}>
                        {message.content}
                    </p>

                    {/* Timestamp + Toxicity row */}
                    <div className={clsx(
                        'flex items-center justify-between gap-2 mt-1',
                        isOwnMessage && 'flex-row-reverse'
                    )}>
                        {hasToxicity && (
                            <ToxicityIndicator level={level} score={toxicityScore} />
                        )}
                        <span className={clsx(
                            'text-[8px]',
                            isOwnMessage ? 'text-white/60' : 'text-text-muted/70'
                        )}>
                            {formatTime(message.timestamp)}
                        </span>
                    </div>

                    {/* Blur overlay for severe messages */}
                    {shouldBlur && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-bg-surface/50 backdrop-blur-[2px]">
                            <span className="text-[10px] font-medium text-text-muted px-2 py-1 rounded-full bg-bg-main/80 border border-border-base">
                                Click to reveal
                            </span>
                        </div>
                    )}
                </div>

                {/* Delete button - only for own messages */}
                {isOwnMessage && onDelete && messageId && (
                    <DeleteButton onClick={() => onDelete(messageId)} />
                )}
            </div>
        </div>
    );
};

export default React.memo(MessageBubble);
