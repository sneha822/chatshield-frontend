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
        <div className="flex items-center gap-2.5 px-1 py-1.5 rounded-md hover:bg-bg-surface-hover transition-colors">
            <div className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold',
                colorClass
            )}>
                {username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-text-muted truncate flex-1">{username}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
    );
};

/**
 * Online users panel for sidebar
 */
const OnlineUsers = ({ users }) => {
    if (!users || users.length === 0) return null;

    return (
        <div className="px-3 py-4 border-t border-border-base/50">
            <div className="flex items-center gap-2 px-2 mb-3">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">
                    Online
                </span>
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {users.length}
                </span>
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
