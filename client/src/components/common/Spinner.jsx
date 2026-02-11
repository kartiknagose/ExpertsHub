// Loading spinner component for async operations
// Supports different sizes and overlay mode for full-screen loading

import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Spinner Component
 * @param {string} size - Size: 'sm', 'md', 'lg', 'xl'
 * @param {string} color - Color: 'primary', 'secondary', 'white'
 * @param {string} className - Additional CSS classes
 */
export function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const { isDark } = useTheme();

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
    secondary: isDark ? 'border-gray-400 border-t-transparent' : 'border-gray-600 border-t-transparent',
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
  const { isDark } = useTheme();

  const overlayStyles = isDark
    ? 'bg-dark-900/80'
    : 'bg-white/80';

  const blurStyles = blur ? 'backdrop-blur-sm' : '';

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${overlayStyles} ${blurStyles}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Spinner size="xl" color="primary" />
      {message && (
        <p className={`mt-4 text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {message}
        </p>
      )}
    </motion.div>
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
