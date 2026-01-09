import clsx from 'clsx';
import { CloseIcon } from '../UI/Primitives';
import RoomList from './RoomList';
import OnlineUsers from './OnlineUsers';
import UserProfile from './UserProfile';

/**
 * Sidebar header with logo and subtle gradient
 */
const SidebarHeader = ({ onClose, showClose }) => (
    <div className="relative px-4 py-4 border-b border-border-base/50">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
                    <img
                        src="/images/logo.png"
                        alt="ChatShield"
                        className="relative w-8 h-8 object-contain"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-text-main text-sm tracking-tight">
                        ChatShield
                    </span>
                    <span className="text-[9px] text-primary font-medium tracking-wide uppercase">
                        Secure Chat
                    </span>
                </div>
            </div>
            {showClose && (
                <button
                    onClick={onClose}
                    className="p-1.5 text-text-muted hover:text-text-main hover:bg-bg-surface-hover rounded-lg transition-all lg:hidden"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            )}
        </div>
    </div>
);

/**
 * Main Sidebar component - responsive with mobile overlay
 */
const Sidebar = ({
    isOpen,
    onClose,
    rooms,
    currentRoom,
    onRoomSelect,
    newRoomInput,
    onNewRoomInputChange,
    onJoinRoom,
    onCreateRoom,
    onlineUsers,
    user,
    onLogout
}) => {
    return (
        <>
            {/* Mobile overlay backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-bg-main/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar container */}
            <aside className={clsx(
                'fixed lg:relative inset-y-0 left-0 z-50',
                'w-72 lg:w-64 bg-bg-surface flex flex-col',
                'border-r border-border-base/50',
                'transform transition-transform duration-300 ease-out',
                'lg:transform-none lg:translate-x-0',
                'shadow-2xl lg:shadow-none',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

                <SidebarHeader onClose={onClose} showClose={isOpen} />

                <RoomList
                    rooms={rooms}
                    currentRoom={currentRoom}
                    onRoomSelect={(roomId) => {
                        onRoomSelect(roomId);
                        onClose();
                    }}
                    newRoomInput={newRoomInput}
                    onNewRoomInputChange={onNewRoomInputChange}
                    onJoinRoom={onJoinRoom}
                    onCreateRoom={onCreateRoom}
                />

                <OnlineUsers users={onlineUsers} />

                <UserProfile user={user} onLogout={onLogout} />
            </aside>
        </>
    );
};

export default Sidebar;
