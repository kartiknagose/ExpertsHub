// Reusable Card component for content sections
// Supports hover effects, padding variants, and clickable cards

import { motion as Motion } from 'framer-motion';

/**
 * Card Component
 * @param {React.ReactNode} children - Card content
 * @param {string} padding - Padding size: 'none', 'sm', 'md', 'lg'
 * @param {boolean} hoverable - Add hover lift effect
 * @param {boolean} clickable - Add click cursor and effect
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 */
export function Card({
  children,
  padding = 'md',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) {
  // Base card styles
  const baseStyles = 'rounded-2xl border transition-all duration-200';

  // Theme-based styles (Tailwind dark: modifier)
  const themeStyles = 'bg-white dark:bg-dark-800 border-gray-200/80 dark:border-dark-700/80 shadow-sm dark:shadow-lg dark:shadow-black/20';

  // Padding variants
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  // Hover effect styles
  const hoverStyles = hoverable
    ? 'hover:border-brand-300/60 dark:hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-100/80 dark:hover:shadow-xl dark:hover:shadow-brand-500/10 hover:-translate-y-1'
    : '';

  // Clickable cursor
  const cursorStyle = clickable || onClick ? 'cursor-pointer' : '';

  // Combine all styles
  const cardClasses = `${baseStyles} ${themeStyles} ${paddingStyles[padding]} ${hoverStyles} ${cursorStyle} ${className}`;

  // Motion variants for animations
  const cardVariants = {
    rest: { scale: 1, y: 0 },
    hover: hoverable ? { scale: 1.01, y: -2 } : {},
    tap: clickable || onClick ? { scale: 0.99 } : {},
  };

  return (
    <Motion.div
      className={cardClasses}
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </Motion.div>
  );
}

/**
 * CardHeader - Optional header section for Card
 * @param {React.ReactNode} children - Header content
 * @param {string} className - Additional CSS classes
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-gray-200 dark:border-dark-700 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardTitle - Title for Card or CardHeader
 * @param {React.ReactNode} children - Title text
 * @param {string} className - Additional CSS classes
 */
export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h3>
  );
}

/**
 * CardDescription - Subtitle or description for Card
 * @param {React.ReactNode} children - Description text
 * @param {string} className - Additional CSS classes
 */
export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

/**
 * CardFooter - Optional footer section for Card
 * @param {React.ReactNode} children - Footer content
 * @param {string} className - Additional CSS classes
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-gray-200 dark:border-dark-700 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}
