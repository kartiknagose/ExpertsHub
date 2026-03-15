// Skeleton component — shimmer effect with gradient animation

/**
 * Skeleton — base shimmering placeholder
 */
export function Skeleton({ className = '', variant = 'rectangular', ...props }) {
  const baseStyles = 'relative overflow-hidden rounded-xl';

  const themeStyles = 'bg-neutral-200 dark:bg-dark-700';

  const variantStyles = {
    rectangular: '',
    circular:    'rounded-full',
    text:        'rounded-lg h-4',
  };

  return (
    <div
      className={`${baseStyles} ${themeStyles} ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          animation: 'shimmer 1.8s linear infinite',
        }}
      />
    </div>
  );
}

/**
 * BookingCardSkeleton
 */
export function BookingCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-neutral-100 dark:border-dark-700 space-y-5 bg-white dark:bg-dark-800">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="space-y-2 pt-1">
            <Skeleton className="w-44 h-5 rounded-lg" />
            <Skeleton className="w-28 h-4 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="w-16 h-3 rounded" />
              <Skeleton className="w-full h-4 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-1">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * StatGridSkeleton
 */
export function StatGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-6 rounded-2xl border border-neutral-100 dark:border-dark-700 space-y-4 bg-white dark:bg-dark-800">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="w-28 h-3.5 rounded" />
              <Skeleton className="w-20 h-8 rounded-lg" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          </div>
          <Skeleton className="w-36 h-3.5 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonContainer
 */
export function SkeletonContainer({ children, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ListItemSkeleton
 */
export function ListItemSkeleton({ lines = 2 }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-neutral-100 dark:border-dark-700 bg-white dark:bg-dark-800">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        {[...Array(lines)].map((_, i) => (
          <Skeleton key={i} className={`h-4 rounded ${i === 0 ? 'w-3/4' : 'w-1/2'}`} />
        ))}
      </div>
    </div>
  );
}
