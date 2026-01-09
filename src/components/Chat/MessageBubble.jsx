import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getToxicityLevel, TOXICITY_LEVELS } from '../../utils/messageUtils';
import { getMessageId, formatTime } from '../../utils/chatUtils';

const ToxicityBadge = ({ level, score }) => (
    <div className={clsx(
        'flex items-center justify-center px-1.5 rounded-lg border self-stretch',
        level.color,
        level.border
    )}>
        <div className="flex flex-col items-center gap-0.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-[8px] font-bold leading-none">{score}%</span>
        </div>
    </div>
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

    // Toxicity
    const level = getToxicityLevel(message.toxicity);
    const toxicityScore = message.toxicity ? (message.toxicity.toxicity * 100).toFixed(0) : 0;
    const isSevere = level === TOXICITY_LEVELS.SEVERE;
    const shouldBlur = isSevere && !isOwnMessage && !isRevealed;
    const messageId = getMessageId(message);

    if (isSystem) {
        return (
            <div className="flex justify-center py-1">
                <span className="text-[10px] text-text-muted bg-bg-surface/50 px-2 py-0.5 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    // Dynamic border radius based on position in group
    const getBorderRadius = () => {
        if (isOwnMessage) {
            if (isFirst && isLast) return 'rounded-xl rounded-br-sm';
            if (isFirst) return 'rounded-xl rounded-br-sm rounded-tr-xl';
            if (isLast) return 'rounded-xl rounded-br-sm rounded-tr-sm';
            return 'rounded-xl rounded-r-sm';
        } else {
            if (isFirst && isLast) return 'rounded-xl rounded-bl-sm';
            if (isFirst) return 'rounded-xl rounded-bl-sm rounded-tl-xl';
            if (isLast) return 'rounded-xl rounded-bl-sm rounded-tl-sm';
            return 'rounded-xl rounded-l-sm';
        }
    };

    return (
        <div className={clsx(
            'flex flex-col',
            isOwnMessage ? 'items-end' : 'items-start',
            !isLast && 'mb-px'
        )}>
            {/* Sender Name (outside bubble) */}
            {!isOwnMessage && isFirst && (
                <span className="text-[10px] text-secondary font-medium mb-0.5 ml-1">{message.sender}</span>
            )}

            {/* Bubble Row */}
            <div className={clsx(
                'flex items-stretch gap-1.5 group',
                isOwnMessage ? 'justify-end' : 'justify-start'
            )}>
                {/* Delete Button */}
                {isOwnMessage && onDelete && messageId && (
                    <button
                        onClick={() => onDelete(messageId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-text-muted hover:text-red-400 self-center"
                        title="Delete"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}

                {/* Toxicity Badge (before bubble for own messages) */}
                {isOwnMessage && message.toxicity && (
                    <ToxicityBadge level={level} score={toxicityScore} />
                )}

                {/* Bubble */}
                <div
                    onClick={() => shouldBlur && setIsRevealed(true)}
                    className={clsx(
                        'relative px-2.5 py-1 text-[13px] leading-snug w-fit max-w-[75%]',
                        getBorderRadius(),
                        isOwnMessage
                            ? 'bg-primary text-white'
                            : 'bg-bg-surface text-text-main border border-border-base',
                        shouldBlur && 'cursor-pointer select-none'
                    )}
                >
                    {/* Content + Timestamp */}
                    <div className="flex items-end gap-1.5">
                        <p className={clsx('flex-1 wrap-break-word', shouldBlur && 'blur-sm opacity-50')}>
                            {message.content}
                        </p>
                        <span className={clsx(
                            'text-[9px] whitespace-nowrap shrink-0',
                            isOwnMessage ? 'text-white/70' : 'text-text-muted'
                        )}>
                            {formatTime(message.timestamp)}
                        </span>
                    </div>

                    {shouldBlur && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                            <span className="text-[9px] font-bold text-text-muted bg-bg-main/90 px-1.5 py-0.5 rounded uppercase">
                                Tap to reveal
                            </span>
                        </div>
                    )}
                </div>

                {/* Toxicity Badge (after bubble for other messages) */}
                {!isOwnMessage && message.toxicity && (
                    <ToxicityBadge level={level} score={toxicityScore} />
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
