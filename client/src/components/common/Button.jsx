// Reusable Button component with variants, sizes, and animations
// Supports loading state, icons, and disabled state

import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Button Component
 * @param {string} variant - Style variant: 'primary', 'secondary', 'outline', 'ghost', 'danger'
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {string} iconPosition - Icon position: 'left' or 'right'
 * @param {boolean} fullWidth - Take full width of container
 * @param {function} onClick - Click handler
 * @param {string} type - Button type: 'button', 'submit', 'reset'
 * @param {React.ReactNode} children - Button text/content
 */
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
  const { isDark } = useTheme();

  // Base styles (always applied)
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles (different colors/effects)
  const variantStyles = {
    primary: isDark
      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:from-brand-600 hover:to-accent-600 focus:ring-brand-500'
      : 'bg-gradient-to-r from-brand-600 to-accent-600 text-white hover:from-brand-700 hover:to-accent-700 focus:ring-brand-600',
    
    secondary: isDark
      ? 'bg-dark-700 text-gray-100 hover:bg-dark-600 focus:ring-dark-500'
      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
    
    outline: isDark
      ? 'border-2 border-brand-500 text-brand-400 hover:bg-brand-500/10 focus:ring-brand-500'
      : 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-brand-600',
    
    ghost: isDark
      ? 'text-gray-300 hover:bg-dark-700 focus:ring-dark-500'
      : 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    
    danger: isDark
      ? 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500'
      : 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
  };

  // Size styles (padding and text size)
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';

  // Combine all styles
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

  // Loading spinner SVG
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <motion.button
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
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      ) : null}

      {/* Button text */}
      {children}

      {/* Icon on right (if not loading) */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
    </motion.button>
  );
}
