import clsx from 'clsx';
import { HashIcon } from '../UI/Primitives';

/**
 * Single room item with hover effects and active state
 */
const RoomItem = ({ room, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={clsx(
            'group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
            isActive
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-main border border-transparent'
        )}
    >
        <div className={clsx(
            'flex items-center justify-center w-6 h-6 rounded-md transition-colors',
            isActive ? 'bg-primary/20' : 'bg-bg-main group-hover:bg-bg-surface'
        )}>
            <HashIcon className="w-3 h-3" />
        </div>
        <span className="truncate font-medium">{room.name || room.id}</span>
        {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
        )}
    </button>
);

/**
 * Room list component with create/join functionality
 */
const RoomList = ({
    rooms,
    currentRoom,
    onRoomSelect,
    newRoomInput,
    onNewRoomInputChange,
    onJoinRoom,
    onCreateRoom
}) => {
    return (
        <div className="flex-1 overflow-y-auto py-4 px-3">
            {/* Rooms section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 px-3 mb-3">
                    <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">
                        Channels
                    </span>
                    <div className="flex-1 h-px bg-border-base/50" />
                    <span className="text-[10px] text-text-muted/40">{rooms.length}</span>
                </div>
                <div className="space-y-1">
                    {rooms.map(room => (
                        <RoomItem
                            key={room.id}
                            room={room}
                            isActive={currentRoom === room.id}
                            onClick={() => onRoomSelect(room.id)}
                        />
                    ))}
                    {rooms.length === 0 && (
                        <div className="px-3 py-4 text-center">
                            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-bg-main flex items-center justify-center">
                                <HashIcon className="w-5 h-5 text-text-muted/30" />
                            </div>
                            <p className="text-xs text-text-muted/50">
                                No channels yet
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Join section */}
            <div className="pt-4 border-t border-border-base/50">
                <div className="flex items-center gap-2 px-3 mb-3">
                    <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">
                        Quick Join
                    </span>
                    <div className="flex-1 h-px bg-border-base/50" />
                </div>
                <form onSubmit={onCreateRoom} className="px-1">
                    <div className="flex gap-1.5">
                        <input
                            type="text"
                            placeholder="Enter room name..."
                            value={newRoomInput}
                            onChange={(e) => onNewRoomInputChange(e.target.value)}
                            className="flex-1 px-3 py-2 bg-bg-main border border-border-base rounded-lg text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30 placeholder:text-text-muted/30 transition-all"
                        />
                        <button
                            type="button"
                            onClick={onJoinRoom}
                            title="Join existing room"
                            className="px-3 py-2 bg-bg-main border border-border-base text-text-muted rounded-lg text-xs hover:text-secondary hover:border-secondary/30 transition-all"
                        >
                            →
                        </button>
                        <button
                            type="submit"
                            title="Create new room"
                            className="px-3 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-all"
                        >
                            +
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomList;
