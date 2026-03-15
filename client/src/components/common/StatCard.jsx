// StatCard — gradient icon backgrounds, animated shimmer, spring entrance

import { useRef, useEffect, memo } from 'react';
import { motion as Motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function AnimatedNumber({ value }) {
  const isNumber = typeof value === 'number';
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (latest) => {
    if (!isNumber) return value;
    return Number.isInteger(value) ? Math.round(latest).toLocaleString() : latest.toFixed(1);
  });

  useEffect(() => {
    if (isNumber) spring.set(value);
  }, [spring, value, isNumber]);

  if (!isNumber) return <span>{value}</span>;
  return <Motion.span>{display}</Motion.span>;
}

export const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  color = 'brand',
  trend,
  delay = 0,
  suffix = '',
  prefix = '',
  className,
  ...restProps
}) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const colorVariants = {
    brand: {
      bg:       'bg-gradient-to-br from-brand-500/15 to-brand-600/10 dark:from-brand-500/20 dark:to-brand-600/15',
      icon:     'text-brand-600 dark:text-brand-400',
      glow:     'shadow-brand-sm',
      border:   'border-brand-200 dark:border-brand-500/20',
    },
    success: {
      bg:       'bg-gradient-to-br from-success-500/15 to-success-600/10 dark:from-success-500/20 dark:to-success-600/15',
      icon:     'text-success-600 dark:text-success-400',
      glow:     'shadow-success-sm',
      border:   'border-success-200 dark:border-success-500/20',
    },
    warning: {
      bg:       'bg-gradient-to-br from-warning-500/15 to-warning-600/10 dark:from-warning-500/20 dark:to-warning-600/15',
      icon:     'text-warning-600 dark:text-warning-400',
      glow:     '',
      border:   'border-warning-200 dark:border-warning-500/20',
    },
    error: {
      bg:       'bg-gradient-to-br from-error-500/15 to-error-600/10 dark:from-error-500/20 dark:to-error-600/15',
      icon:     'text-error-600 dark:text-error-400',
      glow:     'shadow-error-sm',
      border:   'border-error-200 dark:border-error-500/20',
    },
    accent: {
      bg:       'bg-gradient-to-br from-accent-500/15 to-accent-600/10 dark:from-accent-500/20 dark:to-accent-600/15',
      icon:     'text-accent-600 dark:text-accent-400',
      glow:     'shadow-accent-sm',
      border:   'border-accent-200 dark:border-accent-500/20',
    },
    info: {
      bg:       'bg-gradient-to-br from-blue-500/15 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/15',
      icon:     'text-blue-600 dark:text-blue-400',
      glow:     '',
      border:   'border-blue-200 dark:border-blue-500/20',
    },
  };

  const v = colorVariants[color] || colorVariants.brand;
  const trendColor = trend?.direction === 'up' ? 'text-success-600 dark:text-success-400' : trend?.direction === 'down' ? 'text-error-600 dark:text-error-400' : 'text-neutral-500';

  return (
    <Motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card hoverable className={`h-full relative overflow-hidden ${className || ''}`} {...restProps}>
        {/* Subtle inner glow hint at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />

        <div className="flex items-start justify-between mb-4">
          {/* Value */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {t(title)}
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 tabular-nums leading-tight">
              {prefix}<AnimatedNumber value={value} />{suffix}
            </h3>
          </div>

          {/* Icon */}
          {Icon && (
            <div className={`p-3 rounded-2xl ${v.bg} ${v.icon} ${v.glow}`}>
              <Icon size={22} />
            </div>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 font-bold ${trendColor}`}>
              {trend.direction === 'up'      && <TrendingUp size={15} />}
              {trend.direction === 'down'    && <TrendingDown size={15} />}
              {trend.direction === 'neutral' && <Minus size={15} />}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-neutral-400 dark:text-neutral-500 text-xs">
              {trend.label ? t(trend.label) : t('vs last month')}
            </span>
          </div>
        )}
      </Card>
    </Motion.div>
  );
});
