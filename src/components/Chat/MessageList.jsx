import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

/**
 * Helper to determine if a message is a system message
 */
const isSystemMessage = (msg) => msg?.type === 'join' || msg?.type === 'leave';

/**
 * Message list with auto-scroll and grouping logic
 */
const MessageList = ({ messages, onDeleteMessage }) => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-text-muted/50 text-sm">
                    No messages yet. Start the conversation!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-3 py-2">
            {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const nextMsg = messages[index + 1];
                const isSysMsg = isSystemMessage(msg);
                const prevIsSys = isSystemMessage(prevMsg);
                const nextIsSys = isSystemMessage(nextMsg);

                const isFirst = isSysMsg || !prevMsg || prevMsg.sender !== msg.sender || prevIsSys;
                const isLast = isSysMsg || !nextMsg || nextMsg.sender !== msg.sender || nextIsSys;

                return (
                    <MessageBubble
                        key={msg.id || index}
                        message={msg}
                        onDelete={onDeleteMessage}
                        isFirst={isFirst}
                        isLast={isLast}
                    />
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
