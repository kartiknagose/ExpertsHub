import { useTheme } from '../../context/ThemeContext';

/**
 * Skeleton Component
 * Displays a placeholder with shimmer effect for loading states.
 * 
 * @param {string} className - Additional CSS classes (width, height, etc)
 * @param {string} variant - 'rectangular' | 'circular' | 'text'
 */
export function Skeleton({ className = '', variant = 'rectangular', ...props }) {
    const { isDark } = useTheme();

    const baseStyles = 'animate-pulse rounded';

    const themeStyles = isDark
        ? 'bg-dark-700'
        : 'bg-gray-200';

    const variantStyles = {
        rectangular: '',
        circular: 'rounded-full',
        text: 'rounded h-4 w-3/4',
    };

    return (
        <div
            className={`${baseStyles} ${themeStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        />
    );
}

/**
 * Skeleton container to layout text lines or blocks
 */
export function SkeletonContainer({ children, className = '' }) {
    return (
        <div className={`space-y-4 ${className}`}>
            {children}
        </div>
    );
}
