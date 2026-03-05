// Reusable Textarea component for forms
// Mirrors Input.jsx API — supports labels, error messages, icons, and dark/light theme

import { forwardRef, useId } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Textarea Component
 * @param {string} label - Textarea label
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message (shows red border and error text)
 * @param {boolean} success - Show success state (green border and checkmark)
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {boolean} required - Show required asterisk
 * @param {boolean} disabled - Disable textarea
 * @param {number} rows - Number of visible text rows (default: 3)
 * @param {string} value - Controlled value
 * @param {function} onChange - Change handler
 * @param {React.Ref} ref - Forwarded ref (for React Hook Form)
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    placeholder,
    error,
    success = false,
    icon: Icon,
    required = false,
    disabled = false,
    rows = 3,
    className = '',
    ...props
  },
  ref
) {
  const autoId = useId();
  const textareaId = props.id || autoId;

  // Base styles
  const baseStyles = 'w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 resize-vertical';

  // Theme-based styles
  const themeStyles = error
    ? 'bg-white dark:bg-dark-800 border-error-500 text-gray-900 dark:text-gray-100 focus:border-error-400 focus:ring-error-500/50'
    : success
    ? 'bg-white dark:bg-dark-800 border-success-500 text-gray-900 dark:text-gray-100 focus:border-success-400 focus:ring-success-500/50'
    : 'bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-600 dark:focus:border-brand-500 focus:ring-brand-600/50 dark:focus:ring-brand-500/50 hover:border-gray-400 dark:hover:border-dark-500';

  // Icon padding
  const paddingWithIcon = Icon ? 'pl-11' : '';

  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Combine all styles
  const textareaClasses = `${baseStyles} ${themeStyles} ${paddingWithIcon} ${disabledStyles} ${className}`;

  // Label styles
  const labelStyles = 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5';

  // Error text styles
  const errorStyles = 'mt-1.5 text-sm text-error-500 dark:text-error-400';

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label htmlFor={textareaId} className={labelStyles}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea wrapper (for icon) */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            <Icon size={20} />
          </div>
        )}

        {/* Textarea field */}
        <textarea
          id={textareaId}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={textareaClasses}
          ref={ref}
          {...props}
        />

        {/* Validation icons */}
        {success && !error && (
          <div className="absolute right-3 top-3 text-success-500">
            <CheckCircle size={20} />
          </div>
        )}
        {error && (
          <div className="absolute right-3 top-3 text-error-500">
            <AlertCircle size={20} />
          </div>
        )}
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
