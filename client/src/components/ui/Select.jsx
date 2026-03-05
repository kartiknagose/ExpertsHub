// Reusable Select component for forms
// Mirrors Input.jsx API — supports labels, error messages, icons, and dark/light theme

import { forwardRef, useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Select Component
 * @param {string} label - Select label
 * @param {string} error - Error message (shows red border and error text)
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {boolean} required - Show required asterisk
 * @param {boolean} disabled - Disable select
 * @param {string} value - Controlled value
 * @param {function} onChange - Change handler
 * @param {React.ReactNode} children - <option> elements
 * @param {React.Ref} ref - Forwarded ref (for React Hook Form)
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    icon: Icon,
    required = false,
    disabled = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const autoId = useId();
  const selectId = props.id || autoId;

  // Base styles
  const baseStyles = 'w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer';

  // Theme-based styles
  const themeStyles = error
    ? 'bg-white dark:bg-dark-800 border-error-500 text-gray-900 dark:text-gray-100 focus:border-error-400 focus:ring-error-500/50'
    : 'bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 focus:border-brand-600 dark:focus:border-brand-500 focus:ring-brand-600/50 dark:focus:ring-brand-500/50 hover:border-gray-400 dark:hover:border-dark-500';

  // Icon padding
  const paddingWithIcon = Icon ? 'pl-11' : '';

  // Right padding for chevron
  const paddingRight = 'pr-10';

  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Combine all styles
  const selectClasses = `${baseStyles} ${themeStyles} ${paddingWithIcon} ${paddingRight} ${disabledStyles} ${className}`;

  // Label styles
  const labelStyles = 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5';

  // Error text styles
  const errorStyles = 'mt-1.5 text-sm text-error-500 dark:text-error-400';

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label htmlFor={selectId} className={labelStyles}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Select wrapper */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}

        {/* Select field */}
        <select
          id={selectId}
          disabled={disabled}
          className={selectClasses}
          ref={ref}
          {...props}
        >
          {children}
        </select>

        {/* Chevron icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
          {error ? <AlertCircle size={18} className="text-error-500" /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className={errorStyles}>
          {error}
        </p>
      )}
    </div>
  );
});
