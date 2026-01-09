import clsx from 'clsx';
import { MenuIcon, ChartIcon, StatusDot } from '../UI/Primitives';

/**
 * Chat header with room info and controls
 */
const ChatHeader = ({
    roomName,
    isConnected,
    onMenuClick,
    onAnalyticsClick
}) => {
    return (
        <header className="h-12 bg-bg-surface border-b border-border-base px-3 flex items-center justify-between flex-shrink-0">
            {/* Left section */}
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="p-1.5 text-text-muted hover:text-text-main rounded-md lg:hidden"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>

                {/* Room name */}
                <div className="flex items-center gap-2">
                    <span className="text-text-muted">#</span>
                    <h1 className="font-medium text-text-main text-sm">{roomName}</h1>
                </div>

                {/* Connection status */}
                <div className="flex items-center gap-1.5">
                    <StatusDot isOnline={isConnected} size="xs" />
                    <span className="text-[10px] text-text-muted hidden sm:inline">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>

            {/* Right section */}
            <button
                onClick={onAnalyticsClick}
                className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors',
                    'text-text-muted hover:text-text-main hover:bg-bg-surface-hover'
                )}
            >
                <ChartIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analytics</span>
            </button>
        </header>
    );
};

export default ChatHeader;
