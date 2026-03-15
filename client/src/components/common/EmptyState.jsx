// EmptyState — rich illustrated empty states with animated icon

import { motion as Motion } from 'framer-motion';

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  message,
  action,
  size = 'md',
  className = '',
}) {
  const sizeConfig = {
    sm: { padding: 'p-8',  iconBox: 'w-12 h-12', iconSize: 20, title: 'text-base', msg: 'text-sm' },
    md: { padding: 'p-12', iconBox: 'w-16 h-16', iconSize: 24, title: 'text-xl',  msg: 'text-base' },
    lg: { padding: 'p-16', iconBox: 'w-20 h-20', iconSize: 32, title: 'text-2xl',  msg: 'text-lg' },
  };

  const s = sizeConfig[size] || sizeConfig.md;

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={[
        s.padding,
        'rounded-2xl border text-center',
        'border-neutral-200 dark:border-dark-700',
        'bg-white dark:bg-dark-800',
        className,
      ].join(' ')}
    >
      {/* Visual */}
      {illustration ? (
        <div className="mx-auto mb-6">{illustration}</div>
      ) : Icon ? (
        <Motion.div
          className={`mx-auto mb-6 ${s.iconBox} rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-500/20 dark:to-accent-500/20 flex items-center justify-center`}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={s.iconSize} className="text-brand-500 dark:text-brand-400" />
        </Motion.div>
      ) : null}

      {/* Copy */}
      <h3 className={`${s.title} font-bold text-neutral-900 dark:text-neutral-100 mb-2`}>
        {title}
      </h3>
      {message && (
        <p className={`${s.msg} text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed`}>
          {message}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </Motion.div>
  );
}
