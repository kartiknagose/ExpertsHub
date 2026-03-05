// Loading spinner component for async operations
// Supports different sizes and overlay mode for full-screen loading

import { motion as Motion } from 'framer-motion';

/**
 * Spinner Component
 * @param {string} size - Size: 'sm', 'md', 'lg', 'xl'
 * @param {string} color - Color: 'primary', 'secondary', 'white'
 * @param {string} className - Additional CSS classes
 */
export function Spinner({ size = 'md', color = 'primary', className = '' }) {
  // Size styles
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  // Color styles
  const colorStyles = {
    primary: 'border-brand-500 border-t-transparent',
    secondary: 'border-gray-600 dark:border-gray-400 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const spinnerClasses = `${sizeStyles[size]} ${colorStyles[color]} rounded-full animate-spin ${className}`;

  return <div className={spinnerClasses}></div>;
}

/**
 * LoadingOverlay - Full screen loading overlay
 * @param {string} message - Optional loading message
 * @param {boolean} blur - Blur background
 */
export function LoadingOverlay({ message, blur = true }) {
  const overlayStyles = 'bg-white/80 dark:bg-dark-900/80';

  const blurStyles = blur ? 'backdrop-blur-sm' : '';

  return (
    <Motion.div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${overlayStyles} ${blurStyles}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Spinner size="xl" color="primary" />
      {message && (
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">
          {message}
        </p>
      )}
    </Motion.div>
  );
}

/**
 * FullPageSpinner - Centered spinner for full-page loading states
 * Used by route guards (ProtectedRoute, AdminRoute, etc.) while checking auth
 * @param {string} message - Loading text (default: 'Loading...')
 */
export function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

/**
 * LoadingButton - Shows spinner inside button area
 * Use this for inline loading states
 */
export function LoadingButton({ text = 'Loading...', size = 'md' }) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size={size} color="primary" />
      <span>{text}</span>
    </div>
  );
}
