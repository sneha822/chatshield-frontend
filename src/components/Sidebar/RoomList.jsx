import clsx from 'clsx';
import { HashIcon, PlusIcon, ArrowRightIcon } from '../UI/Primitives';

/**
 * Single room item with hover effects and active state
 */
const RoomItem = ({ room, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={clsx(
            'group w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all duration-200',
            isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-main border border-transparent'
        )}
    >
        <div className={clsx(
            'flex items-center justify-center w-5 h-5 rounded transition-colors',
            isActive ? 'bg-primary/20' : 'bg-bg-main/50 group-hover:bg-bg-surface-hover'
        )}>
            <HashIcon className="w-3 h-3" />
        </div>
        <span className="truncate font-medium flex-1 text-left">{room.name || room.id}</span>
        {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
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
        <div className="flex-1 overflow-y-auto py-3 px-2">
            {/* Rooms section */}
            <div className="mb-4">
                <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest">
                        Channels
                    </span>
                    <span className="text-[9px] text-text-muted/30 font-medium bg-bg-main/50 px-1.5 py-0.5 rounded-full">
                        {rooms.length}
                    </span>
                </div>
                <div className="space-y-0.5">
                    {rooms.map(room => (
                        <RoomItem
                            key={room.id}
                            room={room}
                            isActive={currentRoom === room.id}
                            onClick={() => onRoomSelect(room.id)}
                        />
                    ))}
                    {rooms.length === 0 && (
                        <div className="px-2 py-3 text-center border border-dashed border-border-base/30 rounded-lg">
                            <p className="text-[10px] text-text-muted/40">
                                No channels yet
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Join section */}
            <div className="pt-3 border-t border-border-base/30">
                <div className="px-2 mb-2">
                    <span className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest">
                        Quick Join
                    </span>
                </div>
                <form onSubmit={onCreateRoom} className="px-1 flex gap-1.5">
                    <input
                        type="text"
                        placeholder="Room..."
                        value={newRoomInput}
                        onChange={(e) => onNewRoomInputChange(e.target.value)}
                        className="flex-1 min-w-0 px-2.5 py-1.5 bg-bg-main/50 border border-border-base/50 rounded-md text-xs text-text-main focus:outline-none focus:border-primary/40 focus:bg-bg-main transition-all placeholder:text-text-muted/30"
                    />
                    <button
                        type="button"
                        onClick={onJoinRoom}
                        title="Join existing room"
                        className="p-1.5 bg-bg-main/50 border border-border-base/50 text-text-muted hover:text-secondary hover:border-secondary/30 rounded-md transition-all shrink-0"
                    >
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="submit"
                        title="Create new room"
                        className="p-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-md transition-all shrink-0"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RoomList;
