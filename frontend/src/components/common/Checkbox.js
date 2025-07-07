import React from 'react';
import { twMerge } from 'tailwind-merge';

const Checkbox = ({
  name,
  checked,
  onChange,
  label,
  disabled = false,
  error = false,
  className = '',
  labelClassName = '',
}) => {
  return (
    <label
      className={twMerge(
        'flex items-center cursor-pointer',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={twMerge(
          'w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500 focus:ring-2',
          error && 'border-error-500',
          'disabled:cursor-not-allowed'
        )}
      />
      {label && (
        <span
          className={twMerge(
            'ml-2 text-sm text-primary-300',
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;