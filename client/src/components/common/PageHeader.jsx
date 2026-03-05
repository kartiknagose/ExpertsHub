// Reusable page header with title, subtitle, badges, and actions

import { Badge } from '../ui/Badge';

/**
 * PageHeader Component
 * @param {string} title - Page title
 * @param {string} subtitle - Optional subtitle/description
 * @param {Object} badge - Optional badge config: { text: string, variant: string }
 * @param {React.ReactNode} actions - Action buttons
 * @param {string} size - Header size: 'sm', 'md', 'lg' (default: 'lg')
 * @param {string} className - Additional CSS classes
 */
export function PageHeader({ 
  title, 
  subtitle, 
  badge, 
  actions, 
  size = 'lg',
  className = '' 
}) {
  const titleSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className={`${titleSizes[size]} font-bold text-gray-900 dark:text-gray-100`}>
            {title}
          </h1>
          {badge && (
            <Badge variant={badge.variant || 'default'} size={badge.size || 'md'}>
              {badge.text}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
}
