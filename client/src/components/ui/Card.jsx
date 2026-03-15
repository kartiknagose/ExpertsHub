// Card component — glassmorphism-ready, gradient borders, spring hover

import { motion as Motion } from 'framer-motion';

export function Card({
  children,
  padding = 'md',
  hoverable = false,
  clickable = false,
  onClick,
  variant = 'default',    // 'default' | 'glass' | 'gradient' | 'flat'
  className = '',
  ...props
}) {
  const paddingStyles = {
    none: '',
    xs:   'p-3',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
    xl:   'p-10',
  };

  const variantStyles = {
    default:  'bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700/80 shadow-card',
    glass:    'card-glass',
    gradient: 'card-gradient-border',
    flat:     'bg-neutral-50 dark:bg-dark-800/50 border border-neutral-100 dark:border-dark-700',
  };

  const hoverStyles = hoverable
    ? 'hover:shadow-card-hover hover:-translate-y-1.5 hover:border-brand-200 dark:hover:border-brand-500/30 cursor-pointer'
    : '';

  const cursorStyle = clickable || onClick ? 'cursor-pointer' : '';

  const cardClasses = [
    'rounded-2xl transition-all duration-[220ms] ease-spring',
    variantStyles[variant] ?? variantStyles.default,
    paddingStyles[padding] ?? paddingStyles.md,
    hoverStyles,
    cursorStyle,
    className,
  ].join(' ');

  const motionVariants = {
    rest:  { scale: 1, y: 0 },
    hover: hoverable ? { scale: 1.005, y: -4 } : {},
    tap:   (clickable || onClick) ? { scale: 0.99 } : {},
  };

  return (
    <Motion.div
      className={cardClasses}
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={motionVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </Motion.div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-neutral-200 dark:border-dark-700 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-bold text-neutral-900 dark:text-neutral-100 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-neutral-200 dark:border-dark-700 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}
