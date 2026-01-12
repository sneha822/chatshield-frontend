import clsx from 'clsx';
import { SendIcon } from '../UI/Primitives';

/**
 * Message input area with send button
 * Supports muted state with visual feedback
 */
const ChatInput = ({
    value,
    onChange,
    onSubmit,
    disabled,
    placeholder = "Type a message...",
    isMuted = false,
    mutedPlaceholder = "You are muted...",
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value.trim() && !disabled && !isMuted) {
            onSubmit(value);
        }
    };

    const inputPlaceholder = isMuted ? mutedPlaceholder : placeholder;

    return (
        <div className={clsx(
            "px-3 py-2.5 border-t shrink-0 transition-colors",
            isMuted 
                ? "bg-bg-surface border-red-500/20" 
                : "bg-bg-surface border-border-base"
        )}>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={inputPlaceholder}
                    disabled={disabled || isMuted}
                    className={clsx(
                        "flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-1 transition-all",
                        isMuted
                            ? "bg-bg-main border-red-500/30 text-text-muted cursor-not-allowed placeholder:text-red-400/60"
                            : "bg-input-bg border-border-base text-text-main focus:ring-primary/50 placeholder:text-text-muted/40",
                        disabled && !isMuted && "opacity-50"
                    )}
                />
                <button
                    type="submit"
                    disabled={disabled || isMuted || !value.trim()}
                    className={clsx(
                        "px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2",
                        isMuted
                            ? "bg-bg-surface-hover text-text-muted cursor-not-allowed border border-red-500/20"
                            : "bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                >
                    <SendIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                </button>
            </form>
            
            {/* Muted indicator */}
            {isMuted && (
                <p className="text-xs text-text-muted text-center mt-2 flex items-center justify-center gap-1">
                    <span className="text-red-400">🔇</span>
                    <span>You cannot send messages while muted</span>
                </p>
            )}
        </div>
    );
};

export default ChatInput;
