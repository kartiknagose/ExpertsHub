// Button component — premium multi-variant with glow effects and micro-animations

import { motion as Motion } from 'framer-motion';

const Spinner = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
  const baseStyles = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'focus:ring-offset-white dark:focus:ring-offset-dark-950',
    'disabled:opacity-50 disabled:cursor-not-allowed select-none',
  ].join(' ');

  const variantStyles = {
    primary: [
      'text-white focus:ring-brand-500',
      'bg-gradient-to-r from-brand-500 to-brand-600',
      'hover:from-brand-600 hover:to-brand-700',
      'shadow-[0_4px_14px_0_rgba(59,130,246,0.35)]',
      'hover:shadow-[0_6px_20px_0_rgba(59,130,246,0.45)]',
    ].join(' '),

    gradient: [
      'text-white focus:ring-brand-500',
      'bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500',
      'bg-size-200 bg-left',
      'hover:bg-right',
      'shadow-[0_4px_20px_0_rgba(59,130,246,0.30)]',
      'hover:shadow-[0_8px_28px_0_rgba(59,130,246,0.45)]',
    ].join(' '),

    secondary: [
      'bg-neutral-100 dark:bg-dark-700 text-neutral-800 dark:text-neutral-100',
      'hover:bg-neutral-200 dark:hover:bg-dark-600 focus:ring-neutral-400',
      'border border-neutral-200 dark:border-dark-600',
    ].join(' '),

    outline: [
      'border-2 border-brand-500/60 text-brand-600 dark:text-brand-400',
      'bg-transparent hover:bg-brand-50 dark:hover:bg-brand-500/10',
      'focus:ring-brand-500',
    ].join(' '),

    ghost: [
      'text-neutral-700 dark:text-neutral-300',
      'hover:bg-neutral-100 dark:hover:bg-dark-700',
      'focus:ring-neutral-400',
    ].join(' '),

    danger: [
      'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
      'shadow-[0_4px_14px_0_rgba(239,68,68,0.30)]',
      'hover:shadow-[0_6px_20px_0_rgba(239,68,68,0.40)]',
    ].join(' '),

    success: [
      'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500',
      'shadow-[0_4px_14px_0_rgba(34,197,94,0.30)]',
    ].join(' '),
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs rounded-lg',
    sm: 'px-3.5 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const buttonClasses = `${baseStyles} ${variantStyles[variant] ?? variantStyles.primary} ${sizeStyles[size] ?? sizeStyles.md} ${widthStyle} ${className}`;

  const iconSize = { xs: 14, sm: 16, md: 18, lg: 20, xl: 24 }[size] ?? 18;

  return (
    <Motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.97, y: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : Icon && iconPosition === 'left' ? (
        <Icon size={iconSize} />
      ) : null}

      {children && <span>{children}</span>}

      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={iconSize} />
      )}
    </Motion.button>
  );
}
