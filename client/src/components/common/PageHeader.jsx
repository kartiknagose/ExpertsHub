// PageHeader — gradient heading option, animated slide-in, responsive actions

import { motion as Motion } from 'framer-motion';
import { Badge } from '../ui/Badge';

/**
 * PageHeader
 * @param {string} title
 * @param {string} subtitle
 * @param {Object} badge — { text, variant }
 * @param {React.ReactNode} actions
 * @param {string} size — 'sm' | 'md' | 'lg'
 * @param {boolean} gradient — Apply gradient text to the title
 * @param {string} className
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  size = 'lg',
  gradient = false,
  className = '',
}) {
  const titleSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            className={[
              titleSizes[size],
              'font-bold tracking-tight leading-tight',
              gradient ? 'gradient-text' : 'text-neutral-900 dark:text-neutral-50',
            ].join(' ')}
          >
            {title}
          </h1>
          {badge && (
            <Badge variant={badge.variant || 'primary'} size={badge.size || 'md'}>
              {badge.text}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2 sm:flex-nowrap shrink-0">
          {actions}
        </div>
      )}
    </Motion.div>
  );
}
