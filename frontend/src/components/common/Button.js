import React from 'react';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  fullWidth = false, 
  className = '', 
  type = 'button',
  startIcon,
  endIcon,
  ...props 
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${loading ? 'cursor-not-allowed' : ''}
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-accent-500 to-accent-600 
      hover:from-accent-400 hover:to-accent-500 
      text-black font-semibold
      border-accent-500 hover:border-accent-400
      shadow-neon hover:shadow-neon-lg
      disabled:opacity-50 disabled:shadow-none
      transform hover:-translate-y-0.5 active:translate-y-0
      transition-all duration-300
    `,
    secondary: `
      bg-transparent border border-white/20 text-white
      hover:border-accent-500/50 hover:bg-accent-500/10
      backdrop-blur-sm
      disabled:opacity-50
      transition-all duration-300
    `,
    success: `
      bg-gradient-to-r from-success to-green-600 
      hover:from-green-400 hover:to-success 
      text-black font-semibold
      border-success shadow-glow-green
      disabled:opacity-50
      transform hover:-translate-y-0.5 active:translate-y-0
      transition-all duration-300
    `,
    danger: `
      bg-gradient-to-r from-error to-red-600 
      hover:from-red-400 hover:to-error 
      text-white font-semibold
      border-error
      disabled:opacity-50
      transform hover:-translate-y-0.5 active:translate-y-0
      transition-all duration-300
    `,
    warning: `
      bg-gradient-to-r from-warning to-yellow-600 
      hover:from-yellow-400 hover:to-warning 
      text-black font-semibold
      border-warning
      disabled:opacity-50
      transform hover:-translate-y-0.5 active:translate-y-0
      transition-all duration-300
    `,
    outline: `
      bg-transparent border-2 border-accent-500 text-accent-500
      hover:bg-accent-500 hover:text-black hover:shadow-neon
      disabled:opacity-50 disabled:hover:bg-transparent
      disabled:hover:text-accent-500
      transition-all duration-300
    `,
    ghost: `
      bg-transparent border-transparent text-gray-300
      hover:bg-white/5 hover:text-white
      disabled:opacity-50
      transition-all duration-300
    `,
    link: `
      bg-transparent border-transparent text-accent-500
      hover:text-accent-400 hover:underline
      disabled:opacity-50
      transition-all duration-300
    `
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs rounded-md',
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl'
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-5 w-5'
  };

  const LoadingSpinner = ({ size }) => (
    <svg 
      className={twMerge('animate-spin', iconSizes[size])} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderIcon = (icon, position) => {
    if (!icon) return null;
    
    const iconClasses = twMerge(
      iconSizes[size],
      position === 'start' ? 'mr-2' : 'ml-2'
    );
    
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { className: iconClasses });
    }
    
    return <span className={iconClasses}>{icon}</span>;
  };

  const buttonClasses = twMerge(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size={size} />
          <span className="ml-2">Cargando...</span>
        </>
      ) : (
        <>
          {renderIcon(startIcon, 'start')}
          {children}
          {renderIcon(endIcon, 'end')}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
export { Button };