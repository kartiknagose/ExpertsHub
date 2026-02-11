// Reusable page header with title, subtitle, and actions

import { useTheme } from '../../context/ThemeContext';

export function PageHeader({ title, subtitle, actions }) {
  const { isDark } = useTheme();

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
