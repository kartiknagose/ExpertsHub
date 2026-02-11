// Reusable Card component for content sections
// Supports hover effects, padding variants, and clickable cards

import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark } = useTheme();

  // Base card styles
  const baseStyles = 'rounded-xl border transition-all duration-200';

  // Theme-based styles
  const themeStyles = isDark
    ? 'bg-dark-800 border-dark-700 shadow-lg shadow-black/20'
    : 'bg-white border-gray-200 shadow-lg shadow-gray-200/50';

  // Padding variants
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Hover effect styles
  const hoverStyles = hoverable
    ? isDark
      ? 'hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10'
      : 'hover:border-brand-400 hover:shadow-xl hover:shadow-brand-100'
    : '';

  // Clickable cursor
  const cursorStyle = clickable || onClick ? 'cursor-pointer' : '';

  // Combine all styles
  const cardClasses = `${baseStyles} ${themeStyles} ${paddingStyles[padding]} ${hoverStyles} ${cursorStyle} ${className}`;

  // Motion variants for animations
  const cardVariants = {
    rest: { scale: 1, y: 0 },
    hover: hoverable ? { scale: 1.02, y: -4 } : {},
    tap: clickable || onClick ? { scale: 0.98 } : {},
  };

  return (
    <motion.div
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
    </motion.div>
  );
}

/**
 * CardHeader - Optional header section for Card
 * @param {React.ReactNode} children - Header content
 * @param {string} className - Additional CSS classes
 */
export function CardHeader({ children, className = '' }) {
  const { isDark } = useTheme();

  const borderStyles = isDark
    ? 'border-b border-dark-700 pb-4 mb-4'
    : 'border-b border-gray-200 pb-4 mb-4';

  return (
    <div className={`${borderStyles} ${className}`}>
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
  const { isDark } = useTheme();

  const textStyles = isDark
    ? 'text-xl font-semibold text-gray-100'
    : 'text-xl font-semibold text-gray-900';

  return (
    <h3 className={`${textStyles} ${className}`}>
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
  const { isDark } = useTheme();

  const textStyles = isDark
    ? 'text-sm text-gray-400'
    : 'text-sm text-gray-600';

  return (
    <p className={`${textStyles} ${className}`}>
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
  const { isDark } = useTheme();

  const borderStyles = isDark
    ? 'border-t border-dark-700 pt-4 mt-4'
    : 'border-t border-gray-200 pt-4 mt-4';

  return (
    <div className={`${borderStyles} ${className}`}>
      {children}
    </div>
  );
}
