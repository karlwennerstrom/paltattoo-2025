import React from 'react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false,
  showLoadMore = false,
  onLoadMore,
  className = '',
  variant = 'default' // 'default' | 'simple' | 'compact'
}) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const showPages = variant === 'compact' ? 3 : 7;
    
    if (totalPages <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination logic
      const start = Math.max(1, currentPage - Math.floor(showPages / 2));
      const end = Math.min(totalPages, start + showPages - 1);
      
      // Adjust start if we're near the end
      const adjustedStart = Math.max(1, end - showPages + 1);
      
      for (let i = adjustedStart; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and first/last pages if needed
      if (adjustedStart > 1) {
        if (adjustedStart > 2) {
          pages.unshift('...');
        }
        pages.unshift(1);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const PageButton = ({ page, isActive, onClick, disabled = false }) => (
    <button
      key={page}
      onClick={() => !disabled && onClick(page)}
      disabled={disabled || loading}
      className={twMerge(
        'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        'border border-transparent',
        'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-primary-900',
        isActive
          ? 'bg-accent-500 text-white border-accent-500 shadow-lg'
          : 'text-primary-300 hover:text-primary-100 hover:bg-primary-700 hover:border-primary-600',
        disabled && 'opacity-50 cursor-not-allowed',
        variant === 'compact' && 'px-2 py-1 text-xs'
      )}
    >
      {page}
    </button>
  );

  const NavigationButton = ({ direction, onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={twMerge(
        'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        'border border-primary-600 text-primary-300',
        'hover:text-primary-100 hover:bg-primary-700 hover:border-primary-500',
        'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-primary-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'compact' && 'px-2 py-1'
      )}
    >
      {children}
    </button>
  );

  if (variant === 'simple') {
    return (
      <div className={twMerge('flex items-center justify-between', className)}>
        <div className="text-sm text-primary-400">
          Página {currentPage} de {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <NavigationButton
            direction="prev"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <FiChevronLeft className="w-4 h-4" />
            Anterior
          </NavigationButton>
          <NavigationButton
            direction="next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Siguiente
            <FiChevronRight className="w-4 h-4 ml-1" />
          </NavigationButton>
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge('space-y-4', className)}>
      {/* Traditional pagination */}
      <div className="flex items-center justify-center space-x-1">
        {/* Previous button */}
        <NavigationButton
          direction="prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <FiChevronLeft className="w-4 h-4" />
          {variant !== 'compact' && <span className="ml-1">Anterior</span>}
        </NavigationButton>

        {/* Page numbers */}
        <div className="flex items-center space-x-1 mx-2">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-2 text-primary-500"
                >
                  <FiMoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            return (
              <PageButton
                key={page}
                page={page}
                isActive={page === currentPage}
                onClick={onPageChange}
              />
            );
          })}
        </div>

        {/* Next button */}
        <NavigationButton
          direction="next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          {variant !== 'compact' && <span className="mr-1">Siguiente</span>}
          <FiChevronRight className="w-4 h-4" />
        </NavigationButton>
      </div>

      {/* Load more option */}
      {showLoadMore && currentPage < totalPages && (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            variant="secondary"
            loading={loading}
            className="min-w-40"
          >
            Cargar más artistas
          </Button>
        </div>
      )}

      {/* Page info */}
      {variant !== 'compact' && (
        <div className="text-center text-sm text-primary-400">
          Página {currentPage} de {totalPages}
          {showLoadMore && (
            <span className="ml-2">• Cargados {currentPage * 12} de {totalPages * 12}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;