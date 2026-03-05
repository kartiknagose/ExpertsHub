/* eslint-disable react-refresh/only-export-components */
// Shared star rating component for review forms

import { useState, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';
import { getRatingLabel } from '../../../utils/rating';

export { getRatingLabel };

export function StarRating({ value, onChange, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  const starsRef = useRef([]);

  const handleKeyDown = useCallback((e, star) => {
    let nextStar = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextStar = star < 5 ? star + 1 : 1;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextStar = star > 1 ? star - 1 : 5;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextStar = 1;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextStar = 5;
    }
    if (nextStar !== null) {
      onChange(nextStar);
      starsRef.current[nextStar - 1]?.focus();
    }
  }, [onChange]);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          ref={(el) => { starsRef.current[star - 1] = el; }}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          tabIndex={star === (value || 1) ? 0 : -1}
          onClick={() => onChange(star)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform duration-150 hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:rounded"
        >
          <Star
            size={size}
            className={`transition-colors duration-200 ${star <= (hovered || value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-transparent text-gray-300 dark:text-gray-600'
              }`}
          />
        </button>
      ))}
    </div>
  );
}
