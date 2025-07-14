import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ 
  label,
  placeholder,
  type = 'text',
  variant = 'default',
  size = 'md',
  disabled = false,
  required = false,
  error,
  helperText,
  fullWidth = false,
  className = '',
  labelClassName = '',
  containerClassName = '',
  startIcon,
  endIcon,
  ...props 
}, ref) => {
  const baseClasses = `
    block w-full
    border rounded-md transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    default: `
      border-gray-300 text-gray-900
      focus:border-blue-500 focus:ring-blue-500
      placeholder:text-gray-400
    `,
    error: `
      border-red-300 text-red-900
      focus:border-red-500 focus:ring-red-500
      placeholder:text-red-400
    `,
    success: `
      border-green-300 text-green-900
      focus:border-green-500 focus:ring-green-500
      placeholder:text-green-400
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const inputVariant = error ? 'error' : variant;
  
  const inputClasses = twMerge(
    baseClasses,
    variants[inputVariant],
    sizes[size],
    startIcon ? 'pl-10' : '',
    endIcon ? 'pr-10' : '',
    className
  );

  const labelClasses = twMerge(
    'block font-medium mb-1',
    labelSizes[size],
    error ? 'text-red-700' : 'text-gray-700',
    labelClassName
  );

  const containerClasses = twMerge(
    'relative',
    fullWidth ? 'w-full' : '',
    containerClassName
  );

  const iconClasses = 'absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400';

  const renderIcon = (icon, position) => {
    if (!icon) return null;
    
    const positionClasses = position === 'start' ? 'left-3' : 'right-3';
    
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { 
        className: twMerge(iconClasses, positionClasses) 
      });
    }
    
    return (
      <span className={twMerge(iconClasses, positionClasses)}>
        {icon}
      </span>
    );
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {renderIcon(startIcon, 'start')}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
        
        {renderIcon(endIcon, 'end')}
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-red-600 text-xs">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-gray-500 text-xs">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Componente específico para TextArea
export const TextArea = forwardRef(({ 
  label,
  placeholder,
  variant = 'default',
  size = 'md',
  disabled = false,
  required = false,
  error,
  helperText,
  fullWidth = false,
  className = '',
  labelClassName = '',
  containerClassName = '',
  rows = 3,
  resize = 'vertical',
  ...props 
}, ref) => {
  const baseClasses = `
    block w-full
    border rounded-md transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    default: `
      border-gray-300 text-gray-900
      focus:border-blue-500 focus:ring-blue-500
      placeholder:text-gray-400
    `,
    error: `
      border-red-300 text-red-900
      focus:border-red-500 focus:ring-red-500
      placeholder:text-red-400
    `,
    success: `
      border-green-300 text-green-900
      focus:border-green-500 focus:ring-green-500
      placeholder:text-green-400
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  const inputVariant = error ? 'error' : variant;
  
  const textAreaClasses = twMerge(
    baseClasses,
    variants[inputVariant],
    sizes[size],
    resizeClasses[resize],
    className
  );

  const labelClasses = twMerge(
    'block font-medium mb-1',
    labelSizes[size],
    error ? 'text-red-700' : 'text-gray-700',
    labelClassName
  );

  const containerClasses = twMerge(
    'relative',
    fullWidth ? 'w-full' : '',
    containerClassName
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textAreaClasses}
        {...props}
      />
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-red-600 text-xs">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-gray-500 text-xs">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default Input;
export { Input };