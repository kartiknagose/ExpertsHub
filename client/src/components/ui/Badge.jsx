// Badge component for status indicators, labels, and tags
// Supports different variants, sizes, and icon support

/**
 * Badge Component
 * @param {string} variant - Style variant: 'default', 'success', 'warning', 'error', 'info', 'outline'
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {boolean} dot - Show colored dot instead of icon
 * @param {React.ReactNode} children - Badge text/content
 * @param {string} className - Additional CSS classes
 */
export function Badge({
  variant = 'default',
  size = 'md',
  icon: Icon,
  dot = false,
  children,
  className = '',
  ...props
}) {
  // Base badge styles
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors duration-200';

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Variant styles (different colors)
  const variantStyles = {
    default: 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-600',
    
    success: 'bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-700',
    
    warning: 'bg-warning-100 dark:bg-warning-900/50 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-700',
    
    error: 'bg-error-100 dark:bg-error-900/50 text-error-700 dark:text-error-300 border border-error-200 dark:border-error-700',
    
    info: 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700',
    
    accent: 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-accent-700',
    
    outline: 'bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-600',
  };

  // Dot color based on variant
  const dotColors = {
    default: 'bg-gray-500 dark:bg-gray-400',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-brand-500',
    accent: 'bg-accent-500',
    outline: 'bg-gray-500 dark:bg-gray-400',
  };

  // Icon size based on badge size
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  // Combine all styles
  const badgeClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <span className={badgeClasses} {...props}>
      {/* Show dot or icon */}
      {dot ? (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant]}`}></span>
      ) : Icon ? (
        <Icon size={iconSize} />
      ) : null}

      {/* Badge text */}
      {children}
    </span>
  );
}
