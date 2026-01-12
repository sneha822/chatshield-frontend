import clsx from 'clsx';
import { Crown } from 'lucide-react';

/**
 * Single online user item with avatar
 */
const UserItem = ({ username, index, isCreator }) => {
    // Generate consistent colors based on username
    const colors = [
        'bg-primary/20 text-primary',
        'bg-secondary/20 text-secondary',
        'bg-amber-500/20 text-amber-400',
        'bg-rose-500/20 text-rose-400',
        'bg-violet-500/20 text-violet-400',
    ];
    // Creator gets a special golden color
    const colorClass = isCreator ? 'bg-amber-500/20 text-amber-400' : colors[index % colors.length];

    return (
        <div className={clsx(
            'flex items-center gap-2 px-2 py-1 rounded-md transition-colors cursor-default',
            isCreator ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-bg-surface-hover/50'
        )}>
            <div className="relative">
                <div className={clsx(
                    'w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold',
                    colorClass
                )}>
                    {username?.charAt(0).toUpperCase()}
                </div>
                {isCreator && (
                    <Crown className="absolute -top-1.5 -right-1.5 w-3 h-3 text-amber-400 drop-shadow-sm" />
                )}
            </div>
            <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className={clsx(
                    'text-[11px] truncate transition-colors',
                    isCreator ? 'text-amber-400 font-medium' : 'text-text-muted hover:text-text-main'
                )}>
                    {username}
                </span>
                {isCreator && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wide shrink-0">
                        Owner
                    </span>
                )}
            </div>
            <span className={clsx(
                'w-1.5 h-1.5 rounded-full shadow-sm',
                isCreator ? 'bg-amber-400 shadow-amber-400/50' : 'bg-primary shadow-primary/50'
            )} />
        </div>
    );
};

/**
 * Online users panel for sidebar
 */
const OnlineUsers = ({ users, roomCreator }) => {
    if (!users || users.length === 0) return null;

    console.log('OnlineUsers - roomCreator:', roomCreator, 'users:', users); // Debug log

    // Sort users to show creator first
    const sortedUsers = [...users].sort((a, b) => {
        if (a === roomCreator) return -1;
        if (b === roomCreator) return 1;
        return 0;
    });

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
            <div className="space-y-0.5 max-h-32 overflow-y-auto custom-scrollbar">
                {sortedUsers.map((user, idx) => (
                    <UserItem 
                        key={user} 
                        username={user} 
                        index={idx} 
                        isCreator={user === roomCreator}
                    />
                ))}
            </div>
        </div>
    );
};

export default OnlineUsers;
