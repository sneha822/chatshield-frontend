import clsx from 'clsx';

/**
 * Single online user item with avatar
 */
const UserItem = ({ username, index }) => {
    // Generate consistent colors based on username
    const colors = [
        'bg-primary/20 text-primary',
        'bg-secondary/20 text-secondary',
        'bg-amber-500/20 text-amber-400',
        'bg-rose-500/20 text-rose-400',
        'bg-violet-500/20 text-violet-400',
    ];
    const colorClass = colors[index % colors.length];

    return (
        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-bg-surface-hover/50 transition-colors cursor-default">
            <div className={clsx(
                'w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold',
                colorClass
            )}>
                {username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] text-text-muted hover:text-text-main truncate flex-1 transition-colors">{username}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
        </div>
    );
};

/**
 * Online users panel for sidebar
 */
const OnlineUsers = ({ users }) => {
    if (!users || users.length === 0) return null;

    return (
        <div className="px-2 py-3 border-t border-border-base/30">
            <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest">
                    Online
                </span>
                <div className="flex items-center gap-1.5 bg-bg-main/50 px-1.5 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                    </span>
                    <span className="text-[9px] font-medium text-text-muted/60">
                        {users.length}
                    </span>
                </div>
            </div>
            <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {users.map((user, idx) => (
                    <UserItem key={idx} username={user} index={idx} />
                ))}
            </div>
        </div>
    );
};

export default OnlineUsers;
