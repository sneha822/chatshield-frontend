import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getToxicityLevel, TOXICITY_LEVELS, formatTime } from '../../utils/messageUtils';

const ToxicityBadge = ({ level, score }) => (
    <span className={clsx(
        'text-[10px] font-medium px-2 py-0.5 rounded-full border mb-1 w-fit',
        level.color,
        level.border
    )}>
        {score}% Toxic
    </span>
);

const MessageBubble = ({ message, onDelete }) => {
    const { user } = useAuth();
    const [isRevealed, setIsRevealed] = useState(false);

    const isOwnMessage = message.sender?.toLowerCase() === user?.username?.toLowerCase();
    const isSystem = message.type === 'join' || message.type === 'leave';

    // Get toxicity info
    const level = getToxicityLevel(message.toxicity);
    const toxicityScore = message.toxicity ? (message.toxicity.toxicity * 100).toFixed(0) : 0;
    const isSevere = level === TOXICITY_LEVELS.SEVERE;
    const shouldBlur = isSevere && !isOwnMessage && !isRevealed;

    const messageId = message.id || message._id || message.message_id;

    if (isSystem) {
        return (
            <div className="flex justify-center py-2">
                <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <div className={clsx('flex', isOwnMessage ? 'justify-end' : 'justify-start')}>
            <div className={clsx('flex flex-col max-w-[75%]', isOwnMessage ? 'items-end' : 'items-start')}>

                {/* Sender & Badge Header */}
                <div className={clsx(
                    'flex items-center gap-2 mb-1',
                    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                )}>
                    {!isOwnMessage && (
                        <span className="text-xs text-neutral-500 font-medium ml-1">{message.sender}</span>
                    )}
                    {message.toxicity && <ToxicityBadge level={level} score={toxicityScore} />}
                </div>

                {/* Bubble Row */}
                <div className="flex items-center gap-2 group relative">
                    {/* Delete Button (Left side of bubble for own messages) */}
                    {isOwnMessage && onDelete && messageId && (
                        <button
                            onClick={() => onDelete(messageId)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-neutral-300 hover:text-red-500 rounded-full hover:bg-neutral-50"
                            title="Delete message"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}

                    {/* The Message Bubble */}
                    <div
                        onClick={() => shouldBlur && setIsRevealed(true)}
                        className={clsx(
                            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all',
                            isOwnMessage
                                ? 'bg-neutral-900 text-white rounded-br-sm'
                                : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-sm',
                            shouldBlur && 'cursor-pointer select-none'
                        )}
                    >
                        <div className="relative">
                            <p className={clsx(shouldBlur && 'blur-md opacity-50')}>
                                {message.content}
                            </p>

                            {shouldBlur && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-neutral-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md uppercase tracking-wider">
                                        Tap to Reveal
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timestamp */}
                <span className={clsx(
                    'text-[10px] text-neutral-400 mt-1',
                    isOwnMessage ? 'mr-1' : 'ml-1'
                )}>
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
