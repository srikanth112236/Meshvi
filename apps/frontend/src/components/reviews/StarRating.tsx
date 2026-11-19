import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZE_MAP = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-7 h-7',
};

export const StarRating = ({ value, onChange, size = 'md', className = '', label }: StarRatingProps) => {
  const interactive = typeof onChange === 'function';
  const iconSize = SIZE_MAP[size];

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={label || `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= Math.round(value);
        const Icon = (
          <Star
            className={`${iconSize} transition-colors ${
              active ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
            }`}
          />
        );

        if (!interactive) {
          return <span key={star}>{Icon}</span>;
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => onChange?.(star)}
            className="p-0.5 rounded-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-focus"
          >
            {Icon}
          </button>
        );
      })}
    </div>
  );
};
