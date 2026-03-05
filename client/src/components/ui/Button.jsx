// Reusable Button component with variants, sizes, and animations
// Supports loading state, icons, and disabled state

import { motion as Motion } from 'framer-motion';

/**
 * Button Component
 * @param {string} variant - Style variant: 'primary', 'secondary', 'outline', 'ghost', 'danger'
 * @param {string} size - Size: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {string} iconPosition - Icon position: 'left' or 'right'
 * @param {boolean} fullWidth - Take full width of container
 * @param {function} onClick - Click handler
 * @param {string} type - Button type: 'button', 'submit', 'reset'
 * @param {React.ReactNode} children - Button text/content
 */
const Spinner = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  // Base styles (always applied)
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles (different colors/effects)
  const variantStyles = {
    primary: 'bg-gradient-to-r from-brand-600 dark:from-brand-500 to-accent-600 dark:to-accent-500 text-white hover:from-brand-700 dark:hover:from-brand-600 hover:to-accent-700 dark:hover:to-accent-600 focus:ring-brand-600 dark:focus:ring-brand-500',

    secondary: 'bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-dark-600 focus:ring-gray-400 dark:focus:ring-dark-500',

    outline: 'border-2 border-brand-600 dark:border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 focus:ring-brand-600 dark:focus:ring-brand-500',

    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 focus:ring-gray-400 dark:focus:ring-dark-500',

    danger: 'bg-error-500 dark:bg-error-600 text-white hover:bg-error-600 dark:hover:bg-error-700 focus:ring-error-500',
  };

  // Size styles (padding and text size)
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl', // Added XL size
  };

  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';

  // Combine all styles
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

  // Determine icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 24;
      case 'xl': return 28; // Icon size for XL
      default: return 20;
    }
  };

  const iconSize = getIconSize();

  return (
    <Motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {/* Show spinner when loading, otherwise show icon on left */}
      {loading ? (
        <Spinner />
      ) : Icon && iconPosition === 'left' ? (
        <Icon size={iconSize} />
      ) : null}

      {/* Button text */}
      {children}

      {/* Icon on right (if not loading) */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={iconSize} />
      )}
    </Motion.button>
  );
}
