// Badge component — vivid semantic colors, dot/icon support, animated variants

import { motion as Motion } from 'framer-motion';

export function Badge({
  variant = 'default',
  size = 'md',
  icon: Icon,
  dot = false,
  pulse = false,        // adds a pulsing dot (for live status)
  children,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold rounded-full tracking-wide';

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variantStyles = {
    default: 'bg-neutral-100 dark:bg-dark-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-dark-600',
    primary: 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30',
    success: 'bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-500/30',
    warning: 'bg-warning-100 dark:bg-warning-500/20 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-500/30',
    error:   'bg-error-100 dark:bg-error-500/20 text-error-700 dark:text-error-300 border border-error-200 dark:border-error-500/30',
    accent:  'bg-accent-100 dark:bg-accent-500/20 text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-accent-500/30',
    outline: 'bg-transparent text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-dark-600',
    // Solid filled variants
    'solid-primary': 'bg-brand-500 text-white',
    'solid-success': 'bg-success-500 text-white',
    'solid-warning': 'bg-warning-500 text-white',
    'solid-error':   'bg-error-500 text-white',
    'solid-accent':  'bg-accent-500 text-white',
    // Gradient
    gradient: 'text-white bg-gradient-to-r from-brand-500 to-accent-500',
  };

  const dotColors = {
    default: 'bg-neutral-400',
    primary: 'bg-brand-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error:   'bg-error-500',
    accent:  'bg-accent-500',
    outline: 'bg-neutral-400',
    'solid-primary': 'bg-white',
    'solid-success': 'bg-white',
    'solid-warning': 'bg-white',
    'solid-error':   'bg-white',
    'solid-accent':  'bg-white',
    gradient: 'bg-white',
  };

  const iconSize = size === 'xs' ? 10 : size === 'sm' ? 11 : size === 'lg' ? 14 : 12;

  const badgeClasses = [
    baseStyles,
    sizeStyles[size] ?? sizeStyles.md,
    variantStyles[variant] ?? variantStyles.default,
    className,
  ].join(' ');

  const dotColor = dotColors[variant] ?? 'bg-neutral-400';

  return (
    <span className={badgeClasses} {...props}>
      {dot ? (
        <span className="relative flex items-center">
          {pulse && (
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColor}`} />
          )}
          <span className={`relative inline-flex rounded-full w-2 h-2 ${dotColor}`} />
        </span>
      ) : Icon ? (
        <Icon size={iconSize} />
      ) : null}
      {children}
    </span>
  );
}
