import React from 'react';
import { twMerge } from 'tailwind-merge';

const Layout = ({ 
  children, 
  header, 
  footer, 
  sidebar, 
  className = '',
  containerClassName = '',
  headerClassName = '',
  mainClassName = '',
  footerClassName = '',
  sidebarClassName = '',
  fluid = false,
  sidebarPosition = 'left',
  sidebarWidth = 'w-64',
  ...props 
}) => {
  const layoutClasses = twMerge(
    'min-h-screen flex flex-col bg-black text-white',
    className
  );

  const containerClasses = twMerge(
    'flex flex-1',
    containerClassName
  );

  const headerClasses = twMerge(
    'flex-shrink-0',
    headerClassName
  );

  const mainClasses = twMerge(
    'flex-1',
    fluid ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    mainClassName
  );

  const footerClasses = twMerge(
    'flex-shrink-0',
    footerClassName
  );

  const sidebarClasses = twMerge(
    'flex-shrink-0',
    sidebarWidth,
    sidebarClassName
  );

  const renderContent = () => {
    if (sidebar) {
      return (
        <div className={containerClasses}>
          {sidebarPosition === 'left' && (
            <aside className={sidebarClasses}>
              {sidebar}
            </aside>
          )}
          
          <main className={mainClasses}>
            {children}
          </main>
          
          {sidebarPosition === 'right' && (
            <aside className={sidebarClasses}>
              {sidebar}
            </aside>
          )}
        </div>
      );
    }

    return (
      <main className={mainClasses}>
        {children}
      </main>
    );
  };

  return (
    <div className={layoutClasses} {...props}>
      {header && (
        <header className={headerClasses}>
          {header}
        </header>
      )}
      
      {renderContent()}
      
      {footer && (
        <footer className={footerClasses}>
          {footer}
        </footer>
      )}
    </div>
  );
};

// Componente de página simple
export const PageLayout = ({ 
  title, 
  subtitle, 
  children, 
  actions,
  breadcrumbs,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  contentClassName = '',
  headerClassName = '',
  ...props 
}) => {
  const pageClasses = twMerge(
    'py-6',
    className
  );

  const headerClasses = twMerge(
    'mb-6',
    headerClassName
  );

  const titleClasses = twMerge(
    'text-3xl font-bold text-white',
    titleClassName
  );

  const subtitleClasses = twMerge(
    'mt-2 text-lg text-primary-300',
    subtitleClassName
  );

  const contentClasses = twMerge(
    'space-y-6',
    contentClassName
  );

  return (
    <div className={pageClasses} {...props}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="mb-4" aria-label="Breadcrumb">
          {breadcrumbs}
        </nav>
      )}

      {/* Page header */}
      {(title || subtitle || actions) && (
        <div className={headerClasses}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className={titleClasses}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className={subtitleClasses}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page content */}
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

// Componente de sección
export const Section = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  contentClassName = '',
  actions,
  ...props 
}) => {
  const sectionClasses = twMerge(
    'bg-black/80 backdrop-blur-xl shadow-2xl rounded-lg border border-white/10 hover:border-accent-500/30 transition-all duration-300',
    className
  );

  const titleClasses = twMerge(
    'text-lg font-semibold text-white',
    titleClassName
  );

  const subtitleClasses = twMerge(
    'mt-1 text-sm text-primary-300',
    subtitleClassName
  );

  const contentClasses = twMerge(
    'p-6',
    contentClassName
  );

  return (
    <div className={sectionClasses} {...props}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-primary-600">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={titleClasses}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={subtitleClasses}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

// Componente de grid
export const Grid = ({ 
  children, 
  cols = 1,
  gap = 6,
  className = '',
  ...props 
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12'
  };

  const gridClasses = twMerge(
    'grid',
    colsClasses[cols],
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

// Componente de card
export const Card = ({ 
  children, 
  className = '',
  padding = 'default',
  shadow = 'default',
  rounded = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    default: 'rounded-lg',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const cardClasses = twMerge(
    'bg-black/60 backdrop-blur-xl border border-white/10 hover:border-accent-500/20 transition-all duration-300 hover:shadow-2xl hover:transform hover:-translate-y-1',
    shadowClasses[shadow],
    roundedClasses[rounded],
    paddingClasses[padding],
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Componente de contenedor
export const Container = ({ 
  children, 
  size = 'default',
  className = '',
  actions,
  maxWidth,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    lg: 'max-w-none',
    full: 'w-full'
  };

  const containerClasses = twMerge(
    'mx-auto px-4 sm:px-6 lg:px-8',
    sizeClasses[size],
    maxWidth && `max-w-${maxWidth}`,
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {children}
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
};

// Componente de divider
export const Divider = ({ 
  orientation = 'horizontal',
  className = '',
  ...props 
}) => {
  const dividerClasses = twMerge(
    'border-primary-600',
    orientation === 'horizontal' ? 'border-t w-full' : 'border-l h-full',
    className
  );

  return <div className={dividerClasses} {...props} />;
};

// PageContainer component with Neon styling
export const PageContainer = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  maxWidth = 'full',
  ...props 
}) => {
  const containerClasses = twMerge(
    'min-h-screen bg-gradient-to-br from-black via-black to-primary-950',
    maxWidth === 'full' ? 'w-full' : `max-w-${maxWidth} mx-auto`,
    'px-4 sm:px-6 lg:px-8 py-8',
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/3 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-primary-300 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};

// Stack component for vertical layout
export const Stack = ({ children, spacing = 4, className = '', ...props }) => {
  const spacingClasses = {
    1: 'space-y-1',
    2: 'space-y-2',
    3: 'space-y-3',
    4: 'space-y-4',
    5: 'space-y-5',
    6: 'space-y-6',
    8: 'space-y-8',
    12: 'space-y-12',
    16: 'space-y-16',
    20: 'space-y-20',
  };

  return (
    <div 
      className={`${spacingClasses[spacing] || 'space-y-4'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Layout;