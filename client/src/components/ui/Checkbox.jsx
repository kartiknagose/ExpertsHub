// Checkbox component — Premium rebuild with micro-animations
// Matching the overall premium design system

import { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    error,
    disabled = false,
    className = '',
    checked,
    onChange,
    ...props
  },
  ref
) {
  const autoId = useId();
  const checkboxId = props.id || autoId;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={checkboxId}
        className={`
          inline-flex items-center gap-2.5 cursor-pointer select-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="relative flex items-center justify-center">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          
          <div className={`
            w-5 h-5 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
            ${error 
              ? 'border-error-500 bg-error-50 dark:bg-error-500/10' 
              : 'border-neutral-200 dark:border-dark-700 bg-white dark:bg-dark-800'
            }
            peer-checked:border-brand-500 peer-checked:bg-brand-500
            peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/20
            hover:border-brand-400 dark:hover:border-brand-600
          `}>
            <Motion.div
              initial={false}
              animate={{ 
                scale: checked ? 1 : 0,
                opacity: checked ? 1 : 0
              }}
              className="text-white"
            >
              <Check size={14} strokeWidth={4} />
            </Motion.div>
          </div>
        </div>

        {label && (
          <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
            {label}
          </span>
        )}
      </label>

      {error && (
        <p className="px-1 text-[10px] font-black uppercase tracking-widest text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  );
});
