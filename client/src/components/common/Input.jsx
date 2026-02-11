// Reusable Input component for forms
// Supports labels, error messages, icons, and different input types

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Input Component
 * @param {string} label - Input label
 * @param {string} type - Input type: 'text', 'email', 'password', 'number', 'tel', 'date', 'time'
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message (shows red border and error text)
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {boolean} required - Show required asterisk
 * @param {boolean} disabled - Disable input
 * @param {string} value - Controlled value
 * @param {function} onChange - Change handler
 * @param {React.Ref} ref - Forwarded ref (for React Hook Form)
 */
export const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    placeholder,
    error,
    icon: Icon,
    required = false,
    disabled = false,
    className = '',
    ...props
  },
  ref
) {
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  // Determine actual input type (toggle for password)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Base input styles
  const baseInputStyles = 'w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2';

  // Theme-based styles
  const themeStyles = isDark
    ? error
      ? 'bg-dark-800 border-error-500 text-gray-100 focus:border-error-400 focus:ring-error-500/50'
      : 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50 hover:border-dark-500'
    : error
      ? 'bg-white border-error-500 text-gray-900 focus:border-error-400 focus:ring-error-500/50'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50 hover:border-gray-400';

  // Icon and password toggle padding
  const paddingWithIcon = Icon ? 'pl-11' : '';
  const paddingWithPasswordToggle = type === 'password' ? 'pr-11' : '';

  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Combine all input styles
  const inputClasses = `${baseInputStyles} ${themeStyles} ${paddingWithIcon} ${paddingWithPasswordToggle} ${disabledStyles} ${className}`;

  // Label styles
  const labelStyles = isDark
    ? 'block text-sm font-medium text-gray-200 mb-1.5'
    : 'block text-sm font-medium text-gray-700 mb-1.5';

  // Error text styles
  const errorStyles = isDark
    ? 'mt-1.5 text-sm text-error-400'
    : 'mt-1.5 text-sm text-error-500';

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className={labelStyles}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper (for icons) */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}

        {/* Input field */}
        <input
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          ref={ref}
          {...props}
        />

        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
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
