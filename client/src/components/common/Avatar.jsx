import { useMemo, useState } from 'react';
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto';

/**
 * Avatar Component
 * 
 * A premium, consistent avatar wrapper with auto-initials,
 * support for gradients, and intelligent image resolution.
 */
export function Avatar({
    src,
    name = 'User',
    size = 'md',
    className = '',
    ring = false,
    status = null // 'online', 'offline', 'away'
}) {
    const [hasError, setHasError] = useState(false);
    const resolvedUrl = resolveProfilePhotoUrl(src);
    const initial = useMemo(() => {
        const parts = (name || 'U').trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return parts[0].charAt(0).toUpperCase();
    }, [name]);

    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg',
        xl: 'w-20 h-20 text-2xl',
        xxl: 'w-32 h-32 text-4xl',
    };

    const statusColors = {
        online: 'bg-success-500',
        offline: 'bg-gray-400',
        away: 'bg-warning-500',
    };

    return (
        <div className={`relative shrink-0 ${className}`}>
            <div className={`
        ${sizeClasses[size] || sizeClasses.md} 
        rounded-full 
        overflow-hidden 
        flex items-center justify-center 
        transition-all duration-300
        ${ring ? 'ring-2 ring-brand-500/20 ring-offset-2 dark:ring-offset-dark-900' : ''}
      `}>
                {(resolvedUrl && !hasError) ? (
                    <img
                        src={resolvedUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={() => setHasError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-black shadow-inner">
                        {initial}
                    </div>
                )}
            </div>

            {status && (
                <span
                    role="status"
                    aria-label={status}
                    className={`
          absolute bottom-0 right-0 
          ${size === 'xs' ? 'w-1.5 h-1.5' : size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} 
          rounded-full border-2 border-white dark:border-dark-900
          ${statusColors[status]}
        `}
                >
                    <span className="sr-only">{status}</span>
                </span>
            )}
        </div>
    );
}
