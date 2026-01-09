import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const MessageBubble = ({ message }) => {
    const { user } = useAuth();
    const isOwnMessage = message.sender === user?.username;
    const isSystem = message.type === 'join' || message.type === 'leave';

    if (isSystem) {
        return (
            <div className="flex justify-center py-2">
                <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    const isToxic = message.toxicity && message.toxicity.toxicity > 0.7;
    const toxicityScore = message.toxicity ? (message.toxicity.toxicity * 100).toFixed(0) : 0;

    return (
        <div className={clsx('flex', isOwnMessage ? 'justify-end' : 'justify-start')}>
            <div className={clsx('max-w-[70%]', isOwnMessage ? 'items-end' : 'items-start')}>
                {!isOwnMessage && (
                    <span className="text-xs text-neutral-400 ml-3 mb-1 block">{message.sender}</span>
                )}
                <div className={clsx(
                    'px-4 py-2.5 rounded-2xl text-sm',
                    isOwnMessage
                        ? isToxic
                            ? 'bg-red-500 text-white rounded-br-md'
                            : 'bg-neutral-900 text-white rounded-br-md'
                        : isToxic
                            ? 'bg-red-50 text-neutral-900 border border-red-200 rounded-bl-md'
                            : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-md'
                )}>
                    <p className="leading-relaxed">{message.content}</p>
                    {message.toxicity && (
                        <div className={clsx(
                            'flex items-center gap-1 mt-1.5 pt-1.5 border-t text-xs',
                            isOwnMessage ? 'border-white/20 text-white/70' : 'border-neutral-200 text-red-500'
                        )}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{toxicityScore}% toxic</span>
                        </div>
                    )}
                </div>
                <span className={clsx(
                    'text-xs text-neutral-400 mt-1 block',
                    isOwnMessage ? 'mr-3 text-right' : 'ml-3'
                )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
