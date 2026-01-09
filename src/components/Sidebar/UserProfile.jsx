import clsx from 'clsx';
import { LogoutIcon } from '../UI/Primitives';

/**
 * User profile section for sidebar footer
 */
const UserProfile = ({ user, onLogout }) => {
    return (
        <div className="relative px-3 py-3 border-t border-border-base/50 mt-auto">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-3">
                {/* Avatar with status ring */}
                <div className="relative">
                    <div className={clsx(
                        'w-9 h-9 rounded-full flex items-center justify-center',
                        'bg-gradient-to-br from-primary/30 to-secondary/20',
                        'ring-2 ring-primary/30 ring-offset-2 ring-offset-bg-surface'
                    )}>
                        <span className="text-sm font-semibold text-text-main">
                            {user?.username?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-bg-surface" />
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main truncate">
                        {user?.username}
                    </p>
                    <p className="text-[10px] text-text-muted/60">
                        Online
                    </p>
                </div>

                {/* Logout button */}
                <button
                    onClick={onLogout}
                    className={clsx(
                        'p-2 rounded-lg transition-all duration-200',
                        'text-text-muted/60 hover:text-red-400',
                        'hover:bg-red-400/10'
                    )}
                    title="Sign out"
                >
                    <LogoutIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
