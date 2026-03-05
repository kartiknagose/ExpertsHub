// Empty state component
// Use for empty lists or zero data views

/**
 * EmptyState Component
 * @param {React.Component} icon - Icon component (from lucide-react)
 * @param {React.ReactNode} illustration - Custom illustration/image component
 * @param {string} title - Empty state title
 * @param {string} message - Empty state message
 * @param {React.ReactNode} action - Action button/element
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 */
export function EmptyState({ 
  icon: Icon, 
  illustration,
  title, 
  message, 
  action,
  size = 'md' 
}) {
  const sizes = {
    sm: {
      padding: 'p-6',
      iconSize: 20,
      iconContainer: 'h-10 w-10',
      titleSize: 'text-base',
      messageSize: 'text-sm',
    },
    md: {
      padding: 'p-8',
      iconSize: 22,
      iconContainer: 'h-12 w-12',
      titleSize: 'text-lg',
      messageSize: 'text-base',
    },
    lg: {
      padding: 'p-12',
      iconSize: 28,
      iconContainer: 'h-16 w-16',
      titleSize: 'text-xl',
      messageSize: 'text-lg',
    },
  };

  const currentSize = sizes[size];

  return (
    <div className={`rounded-xl border ${currentSize.padding} text-center border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800`}>
      {illustration ? (
        <div className="mx-auto mb-4">
          {illustration}
        </div>
      ) : Icon ? (
        <div className={`mx-auto mb-4 flex ${currentSize.iconContainer} items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white`}>
          <Icon size={currentSize.iconSize} />
        </div>
      ) : null}
      
      <h3 className={`${currentSize.titleSize} font-semibold text-gray-900 dark:text-gray-100`}>
        {title}
      </h3>
      
      {message && (
        <p className={`text-gray-600 dark:text-gray-400 mt-2 ${currentSize.messageSize}`}>
          {message}
        </p>
      )}
      
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
