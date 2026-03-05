/**
 * Skeleton Component
 * Displays a placeholder with shimmer effect for loading states.
 * 
 * @param {string} className - Additional CSS classes (width, height, etc)
 * @param {string} variant - 'rectangular' | 'circular' | 'text'
 */
export function Skeleton({ className = '', variant = 'rectangular', ...props }) {
    const baseStyles = 'animate-pulse rounded';

    const themeStyles = 'bg-gray-200 dark:bg-dark-700';

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
 * BookingCardSkeleton Component
 * 
 * Reusable loading placeholder for the BookingCard.
 */
export function BookingCardSkeleton() {
    return (
        <div className="p-6 rounded-3xl border border-gray-100 dark:border-dark-700 space-y-6">
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="w-40 h-6 rounded-lg" />
                        <Skeleton className="w-24 h-4 rounded-lg" />
                    </div>
                </div>
                <Skeleton className="w-20 h-7 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-6 pl-1">
                <div className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <div className="space-y-1">
                        <Skeleton className="w-12 h-2" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <div className="space-y-1">
                        <Skeleton className="w-12 h-2" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * StatGridSkeleton Component
 */
export function StatGridSkeleton({ count = 4 }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
        </div>
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
