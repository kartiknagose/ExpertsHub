// Shared star rating component for review forms

import { useState } from 'react';
import { Star } from 'lucide-react';

export function StarRating({ value, onChange, size = 28 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform duration-150 hover:scale-125 focus:outline-none"
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
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

export const getRatingLabel = (rating) => {
  switch (rating) {
    case 1:
      return 'Poor';
    case 2:
      return 'Below Average';
    case 3:
      return 'Good';
    case 4:
      return 'Very Good';
    case 5:
      return 'Excellent';
    default:
      return '';
  }
};
