// Empty state component
// Use for empty lists or zero data views

import { useTheme } from '../../context/ThemeContext';

export function EmptyState({ icon: Icon, title, message, action }) {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-xl border p-8 text-center ${isDark ? 'border-dark-700 bg-dark-800' : 'border-gray-200 bg-white'}`}>
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white">
          <Icon size={22} />
        </div>
      )}
      <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        {title}
      </h3>
      {message && (
        <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
