import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useInView } from 'framer-motion';

/**
 * Animated number counter
 */
function AnimatedNumber({ value }) {
    // Simple implementation for now - full animation would use useSpring/useMotionValue
    return <span>{value}</span>;
}

/**
 * StatCard Component
 * Displays a statistic with an icon, value, label, and optional trend.
 * 
 * @param {string} title - The label for the stat (e.g., "Total Bookings")
 * @param {string|number} value - The main value to display
 * @param {React.Component} icon - Lucide icon component
 * @param {string} color - Color theme: 'brand', 'success', 'warning', 'error', 'info'
 * @param {object} trend - Optional trend object { value: 12, direction: 'up'|'down'|'neutral', label: 'vs last month' }
 * @param {number} delay - Animation delay index
 */
export function StatCard({
    title,
    value,
    icon: Icon,
    color = 'brand',
    trend,
    delay = 0,
    ...props
}) {
    const { isDark } = useTheme();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    // Color variants for icon background and text
    const colorVariants = {
        brand: {
            bg: isDark ? 'bg-brand-500/20' : 'bg-brand-100',
            text: isDark ? 'text-brand-400' : 'text-brand-600',
        },
        success: {
            bg: isDark ? 'bg-green-500/20' : 'bg-green-100',
            text: isDark ? 'text-green-400' : 'text-green-600',
        },
        warning: {
            bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
            text: isDark ? 'text-yellow-400' : 'text-yellow-600',
        },
        error: {
            bg: isDark ? 'bg-red-500/20' : 'bg-red-100',
            text: isDark ? 'text-red-400' : 'text-red-600',
        },
        info: {
            bg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
            text: isDark ? 'text-blue-400' : 'text-blue-600',
        },
    };

    const currentVariant = colorVariants[color] || colorVariants.brand;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
        >
            <Card hoverable className={`h-full ${props.className || ''}`} {...props}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {title}
                        </p>
                        <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <AnimatedNumber value={value} />
                        </h3>
                    </div>

                    {Icon && (
                        <div className={`p-3 rounded-xl ${currentVariant.bg} ${currentVariant.text}`}>
                            <Icon size={24} />
                        </div>
                    )}
                </div>

                {trend && (
                    <div className="flex items-center gap-2 text-sm">
                        <span
                            className={`flex items-center gap-1 font-medium ${trend.direction === 'up'
                                ? 'text-green-500'
                                : trend.direction === 'down'
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                                }`}
                        >
                            {trend.direction === 'up' && <TrendingUp size={16} />}
                            {trend.direction === 'down' && <TrendingDown size={16} />}
                            {trend.direction === 'neutral' && <Minus size={16} />}
                            {Math.abs(trend.value)}%
                        </span>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                            {trend.label || 'vs last month'}
                        </span>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
