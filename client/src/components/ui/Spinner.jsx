// Spinner component — branded gradient spinner with overlay support

import { motion as Motion } from 'framer-motion';

/**
 * Spinner
 */
export function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizeStyles = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
    xl: 'w-16 h-16 border-4',
  };

  const colorStyles = {
    primary:   'border-brand-500/30 border-t-brand-500',
    secondary: 'border-neutral-300 dark:border-dark-600 border-t-neutral-600 dark:border-t-neutral-400',
    white:     'border-white/30 border-t-white',
    success:   'border-success-500/30 border-t-success-500',
    error:     'border-error-500/30 border-t-error-500',
    accent:    'border-accent-500/30 border-t-accent-500',
  };

  const spinnerClasses = [
    sizeStyles[size] ?? sizeStyles.md,
    colorStyles[color] ?? colorStyles.primary,
    'rounded-full animate-spin',
    className,
  ].join(' ');

  return <div className={spinnerClasses} />;
}

/**
 * LoadingOverlay — full screen or contained loading overlay
 */
export function LoadingOverlay({ message, blur = true }) {
  return (
    <Motion.div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-white/80 dark:bg-dark-950/80 ${blur ? 'backdrop-blur-sm' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient spinner ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-dark-700" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin"
          style={{ borderTopColor: 'theme(colors.brand.500)' }}
        />
        {/* Center dot */}
        <div className="absolute inset-[30%] rounded-full gradient-brand" />
      </div>

      {message && (
        <p className="mt-5 text-base font-semibold text-neutral-700 dark:text-neutral-200 animate-pulse">
          {message}
        </p>
      )}
    </Motion.div>
  );
}

/**
 * FullPageSpinner — used by route guards
 */
export function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-dark-950">
      <Motion.div
        className="flex flex-col items-center gap-5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated brand logo spinner */}
        <div className="relative w-16 h-16">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-500/20" />
          {/* Spinning gradient arc */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 border-r-accent-500 animate-spin" />
          {/* Center gradient square (logo mark) */}
          <div className="absolute inset-[26%] rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-brand-sm">
            <span className="text-white font-black text-sm leading-none">U</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-neutral-700 dark:text-neutral-200">{message}</p>
          <div className="flex justify-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <Motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand-500"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </Motion.div>
    </div>
  );
}

/**
 * LoadingButton — inline spinner for buttons
 */
export function LoadingButton({ text = 'Loading...', size = 'md' }) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size={size} color="primary" />
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{text}</span>
    </div>
  );
}
