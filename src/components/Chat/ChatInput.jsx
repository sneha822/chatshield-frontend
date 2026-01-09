import { SendIcon } from '../UI/Primitives';

/**
 * Message input area with send button
 */
const ChatInput = ({
    value,
    onChange,
    onSubmit,
    disabled,
    placeholder = "Type a message..."
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (value.trim() && !disabled) {
            onSubmit(value);
        }
    };

    return (
        <div className="px-3 py-2.5 bg-bg-surface border-t border-border-base flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 px-4 py-2 bg-input-bg border border-border-base rounded-full text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 placeholder:text-text-muted/40"
                />
                <button
                    type="submit"
                    disabled={disabled || !value.trim()}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <SendIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                </button>
            </form>
        </div>
    );
};

export default ChatInput;
