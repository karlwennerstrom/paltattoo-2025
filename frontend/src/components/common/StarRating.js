import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onChange = null,
  showValue = false,
  className = '',
  disabled = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [tempRating, setTempRating] = useState(rating);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleClick = (value) => {
    if (!interactive || disabled) return;
    setTempRating(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!interactive || disabled) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!interactive || disabled) return;
    setHoverRating(0);
  };

  const displayRating = interactive ? (hoverRating || tempRating) : rating;

  return (
    <div className={twMerge('flex items-center space-x-1', className)}>
      <div className="flex items-center space-x-0.5">
        {[...Array(maxRating)].map((_, index) => {
          const value = index + 1;
          const isFilled = value <= displayRating;
          const isPartial = !isFilled && value - 1 < displayRating && displayRating < value;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive || disabled}
              className={twMerge(
                'relative transition-colors duration-150',
                interactive && !disabled ? 'cursor-pointer hover:scale-110' : 'cursor-default',
                disabled ? 'opacity-50' : ''
              )}
            >
              <FiStar
                className={twMerge(
                  sizes[size],
                  'transition-colors duration-150',
                  isFilled 
                    ? 'text-yellow-400 fill-current' 
                    : interactive && hoverRating >= value
                    ? 'text-yellow-300'
                    : 'text-primary-600'
                )}
                fill={isFilled ? 'currentColor' : 'none'}
              />
              
              {/* Partial star overlay */}
              {isPartial && (
                <div 
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${(displayRating - (value - 1)) * 100}%` }}
                >
                  <FiStar
                    className={twMerge(sizes[size], 'text-yellow-400')}
                    fill="currentColor"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-primary-300 ml-2">
          {displayRating.toFixed(1)} / {maxRating}
        </span>
      )}
    </div>
  );
};

export default StarRating;