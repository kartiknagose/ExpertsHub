// Centralized layout constants for consistent spacing and sizing
// Use these instead of inline Tailwind classes for better maintainability

/**
 * Container max-width constants
 * Use these for page containers to ensure consistent content width
 */
export const CONTAINER = {
  // Narrow content (forms, single-column content, reviews)
  narrow: 'max-w-4xl',
  
  // Default content width (most pages, bookings, services)
  default: 'max-w-6xl',
  
  // Wide content (dashboards, analytics, multi-column layouts)
  wide: 'max-w-7xl',
  
  // Extra wide (landing pages, marketing content)
  full: 'max-w-screen-2xl',
};

/**
 * Spacing constants for consistent padding/margins
 */
export const SPACING = {
  // Standard page container padding with responsive breakpoints
  page: 'px-4 sm:px-6 lg:px-8 py-10',
  
  // Page container padding without vertical spacing
  pageX: 'px-4 sm:px-6 lg:px-8',
  
  // Page container padding without horizontal spacing
  pageY: 'py-10',
  
  // Section spacing
  section: 'mb-8',
  sectionLg: 'mb-12',
  
  // Card/component padding
  card: 'p-6',
  cardSm: 'p-4',
  cardLg: 'p-8',
  
  // Gap utilities
  gap: 'gap-4',
  gapSm: 'gap-2',
  gapLg: 'gap-6',
};

/**
 * Grid layout patterns
 */
export const GRID = {
  // Two column responsive grid
  twoCol: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  
  // Three column responsive grid
  threeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  
  // Four column responsive grid
  fourCol: 'grid grid-cols-2 lg:grid-cols-4 gap-4',
  
  // Auto-fit grid (responsive cards)
  autoFit: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  
  // Sidebar layout (2/3 content, 1/3 sidebar)
  sidebar: 'grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6',
  
  // Stats grid (2 cols on mobile, 4 on desktop)
  stats: 'grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6',
};

/**
 * Flex layout patterns
 */
export const FLEX = {
  // Centered content
  center: 'flex items-center justify-center',
  
  // Space between with center alignment
  between: 'flex items-center justify-between',
  
  // Vertical stack
  col: 'flex flex-col',
  
  // Responsive row to column
  responsiveRow: 'flex flex-col sm:flex-row gap-4',
  
  // Wrap with gap
  wrap: 'flex flex-wrap gap-2',
};

/**
 * Common page layout wrapper
 * Combines container width + spacing
 */
export const getPageLayout = (width = 'default') => {
  return `${CONTAINER[width]} mx-auto ${SPACING.page}`;
};

/**
 * Typography scale using Tailwind defaults
 * Reference for consistent text sizing
 */
export const TEXT_SIZE = {
  micro: 'text-xs',      // 12px - badges, labels, metadata
  small: 'text-sm',      // 14px - secondary text, descriptions
  base: 'text-base',     // 16px - body text
  lg: 'text-lg',         // 18px - emphasized text
  xl: 'text-xl',         // 20px - section headers
  '2xl': 'text-2xl',     // 24px - page subtitles
  '3xl': 'text-3xl',     // 30px - large headers
  '4xl': 'text-4xl',     // 36px - page titles
  '5xl': 'text-5xl',     // 48px - hero titles
};

/**
 * Border radius constants
 */
export const RADIUS = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};
