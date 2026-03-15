/** @type {import('tailwindcss').Config} */

// ─── Brand Palette (Electric Blue) ──────────────────────────────────────────
const brandPalette = {
  50:  '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',   // core blue
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

// ─── Accent Palette (Vivid Violet / Fuchsia) ────────────────────────────────
const accentPalette = {
  50:  '#fdf4ff',
  100: '#fae8ff',
  200: '#f5d0fe',
  300: '#f0abfc',
  400: '#e879f9',
  500: '#d946ef',   // fuchsia core
  600: '#c026d3',
  700: '#a21caf',
  800: '#86198f',
  900: '#701a75',
  950: '#4a044e',
};

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────────────────────
      colors: {
        brand:   brandPalette,
        primary: brandPalette,
        accent:  accentPalette,

        // Semantic colors
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },

        // Dark mode surface colors
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },

        // Override pure white with a slightly softer off-white for less eye strain
        white: '#fdfdfd',

        // Neutral palette updated to a professional, softer slate-tinted gray
        neutral: {
          25:  '#fcfcfd', // Extra light for extremely subtle cards/surfaces
          50:  '#f4f5f7', // Background
          100: '#eef0f3', // Subtle borders / hovered backgrounds
          200: '#e0e4e9',
          300: '#c6cbd2',
          400: '#9aa2ac',
          500: '#757e8a',
          600: '#5c636f',
          700: '#4a515a',
          800: '#3c4149',
          900: '#32363c',
          950: '#212428',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Space Grotesk', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',   { lineHeight: '1rem'     }],
        sm:    ['0.875rem',  { lineHeight: '1.25rem'  }],
        base:  ['1rem',      { lineHeight: '1.5rem'   }],
        lg:    ['1.125rem',  { lineHeight: '1.75rem'  }],
        xl:    ['1.25rem',   { lineHeight: '1.75rem'  }],
        '2xl': ['1.5rem',    { lineHeight: '2rem'     }],
        '3xl': ['1.875rem',  { lineHeight: '2.25rem'  }],
        '4xl': ['2.25rem',   { lineHeight: '2.5rem'   }],
        '5xl': ['3rem',      { lineHeight: '1.1'      }],
        '6xl': ['3.75rem',   { lineHeight: '1.05'     }],
        '7xl': ['4.5rem',    { lineHeight: '1'        }],
        '8xl': ['6rem',      { lineHeight: '1'        }],
        '9xl': ['8rem',      { lineHeight: '1'        }],
      },

      // ─── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        18:  '4.5rem',
        22:  '5.5rem',
        30:  '7.5rem',
        112: '28rem',
        128: '32rem',
        144: '36rem',
      },

      // ─── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        none:    '0',
        sm:      '0.25rem',
        DEFAULT: '0.375rem',
        md:      '0.5rem',
        lg:      '0.75rem',
        xl:      '1rem',
        '2xl':   '1.25rem',
        '3xl':   '1.5rem',
        '4xl':   '2rem',
        '5xl':   '2.5rem',
        full:    '9999px',
      },

      // ─── Box Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        xs:      '0 1px 2px 0 rgba(0,0,0,0.05)',
        sm:      '0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)',
        DEFAULT: '0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)',
        md:      '0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)',
        lg:      '0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)',
        xl:      '0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)',
        '2xl':   '0 25px 50px -12px rgba(0,0,0,0.25)',
        '3xl':   '0 35px 60px -15px rgba(0,0,0,0.3)',
        inner:   'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
        none:    'none',
        // Brand glow shadows
        'brand-sm':  '0 0 12px 0 rgba(59,130,246,0.25)',
        'brand-md':  '0 0 20px 0 rgba(59,130,246,0.35)',
        'brand-lg':  '0 0 40px 0 rgba(59,130,246,0.40)',
        'accent-sm': '0 0 12px 0 rgba(217,70,239,0.25)',
        'accent-md': '0 0 20px 0 rgba(217,70,239,0.35)',
        'accent-lg': '0 0 40px 0 rgba(217,70,239,0.40)',
        'success-sm':'0 0 12px 0 rgba(34,197,94,0.25)',
        'error-sm':  '0 0 12px 0 rgba(239,68,68,0.25)',
        // Card glow
        'card':      '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        'card-hover':'0 16px 48px -8px rgba(0,0,0,0.16), 0 4px 8px rgba(0,0,0,0.08)',
      },

      // ─── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs:  '2px',
        sm:  '4px',
        md:  '8px',
        lg:  '16px',
        xl:  '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // ─── Animations ────────────────────────────────────────────────────────
      animation: {
        // Entrances
        'fade-in':         'fadeIn 0.35s ease-out both',
        'fade-in-up':      'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-down':    'fadeInDown 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-left':    'fadeInLeft 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-right':   'fadeInRight 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':        'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':        'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'slide-down':      'slideDown 0.35s cubic-bezier(0.16,1,0.3,1) both',
        // Continuous
        'float':           'float 6s ease-in-out infinite',
        'float-delayed':   'float 6s ease-in-out 2s infinite',
        'pulse-slow':      'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':       'spin 3s linear infinite',
        'bounce-slow':     'bounce 3s infinite',
        'shimmer':         'shimmer 2s linear infinite',
        'gradient-shift':  'gradientShift 6s ease infinite',
        'ping-slow':       'ping 3s cubic-bezier(0,0,0.2,1) infinite',
        'blob':            'blob 7s infinite',
      },

      // ─── Keyframes ─────────────────────────────────────────────────────────
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-12px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        blob: {
          '0%':   { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':  { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
        },
      },

      // ─── Transition Timing Functions ───────────────────────────────────────
      transitionTimingFunction: {
        'spring':         'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth':         'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in':      'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-expo':   'cubic-bezier(0.7, 0, 0.84, 0)',
        'ease-out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      // ─── Background sizes ──────────────────────────────────────────────────
      backgroundSize: {
        'size-200': '200% 200%',
      },

      // ─── Z-index ───────────────────────────────────────────────────────────
      zIndex: {
        1:    '1',
        2:    '2',
        60:   '60',
        70:   '70',
        80:   '80',
        90:   '90',
        100:  '100',
      },
    },
  },
  plugins: [],
};