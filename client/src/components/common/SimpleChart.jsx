import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Card, CardHeader, CardTitle } from './Card';

/**
 * Simple Bar Chart Component
 * Renders a responsive bar chart using Flexbox and Framer Motion.
 * 
 * @param {string} title - Chart title
 * @param {Array} data - Array of { label: string, value: number, color?: string, tooltip?: string }
 * @param {string} height - Height of the chart area (default: h-64)
 */
export function SimpleBarChart({ title, data = [], height = 'h-64', className = '' }) {
    const { isDark } = useTheme();

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value), 10); // Minimum scale of 10

    return (
        <Card className={`flex flex-col ${className}`}>
            {title && (
                <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
            )}

            <div className={`flex-1 w-full p-4 pt-0 flex items-end justify-between gap-4 ${height}`}>
                {data.map((item, index) => {
                    // Calculate height percentage
                    const heightPercent = Math.max(Math.round((item.value / maxValue) * 100), 2); // Min 2% height

                    return (
                        <div key={index} className="flex flex-col items-center justify-end flex-1 h-full group relative">
                            {/* Tooltip on Hover */}
                            <div className={`mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold 
                ${isDark ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-gray-800 text-white border-gray-700'} 
                px-2 py-1 rounded absolute bottom-full mb-1 pointer-events-none whitespace-nowrap z-10 shadow-lg border`}>
                                {item.tooltip || item.value}
                            </div>

                            {/* Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                whileInView={{ height: `${heightPercent}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                                className={`w-full max-w-[40px] rounded-t-lg transition-colors duration-300 ${item.color ? '' : isDark ? 'bg-brand-500 hover:bg-brand-400' : 'bg-brand-600 hover:bg-brand-500'
                                    }`}
                                style={{ backgroundColor: item.color }}
                            />

                            {/* Label */}
                            <div className={`mt-2 text-xs text-center truncate w-full ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

/**
 * Simple Donut Chart Component
 * Renders a responsive SVG donut chart.
 */
export function SimpleDonutChart({ title, data = [], size = 160, className = '' }) {
    const { isDark } = useTheme();
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    let currentAngle = 0;

    return (
        <Card className={`flex flex-col items-center justify-center p-6 ${className}`}>
            {title && <h3 className={`text-lg font-bold mb-6 w-full text-left ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>}

            <div className="relative">
                <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
                    {data.map((item, index) => {
                        if (item.value === 0) return null;

                        const percentage = item.value / total;
                        const angle = percentage * 360;
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;

                        const circle = (
                            <motion.circle
                                key={index}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={item.color || '#3b82f6'}
                                strokeWidth="15"
                                initial={{ strokeDasharray: `0 ${circumference}` }}
                                animate={{ strokeDasharray: `${percentage * circumference} ${circumference}` }}
                                transition={{ duration: 1, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
                                style={{ transformOrigin: 'center', transform: `rotate(${currentAngle}deg)` }}
                            />
                        );

                        currentAngle += angle;
                        return circle;
                    })}
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {total}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center mt-6">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }}></span>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
