import clsx from 'clsx';
import { LogoutIcon } from '../UI/Primitives';

/**
 * User profile section for sidebar footer
 */
const UserProfile = ({ user, onLogout }) => {
    return (
        <div className="relative px-2 py-2 border-t border-border-base/30 mt-auto">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-2">
                {/* Avatar with status ring */}
                <div className="relative">
                    <div className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        'bg-gradient-to-br from-primary/30 to-secondary/20',
                        'ring-2 ring-primary/20 ring-offset-1 ring-offset-bg-surface'
                    )}>
                        <span className="text-xs font-bold text-text-main">
                            {user?.username?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-bg-surface" />
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-xs font-semibold text-text-main truncate leading-tight">
                        {user?.username}
                    </p>
                    <p className="text-[10px] text-primary/80 font-medium leading-none mt-0.5">
                        In {user?.room || 'Lobby'}
                    </p>
                </div>

                {/* Logout button */}
                <button
                    onClick={onLogout}
                    className={clsx(
                        'p-1.5 rounded-md transition-all duration-200',
                        'text-text-muted/60 hover:text-red-400',
                        'hover:bg-red-400/10'
                    )}
                    title="Sign out"
                >
                    <LogoutIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
