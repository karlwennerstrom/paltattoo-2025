import React, { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
  ...props 
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full'
  };

  // Manejar el escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Manejar el focus y body scroll
  useEffect(() => {
    if (isOpen) {
      // Guardar el elemento activo actual
      previousActiveElement.current = document.activeElement;
      
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      
      // Enfocar el modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
      
      // Restaurar focus al elemento anterior
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar click en overlay
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Manejar trap de focus
  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  };

  if (!isOpen) return null;

  const overlayClasses = twMerge(
    'fixed inset-0 z-50 overflow-y-auto',
    'bg-black bg-opacity-50 backdrop-blur-sm',
    'flex items-center justify-center p-4',
    'transition-opacity duration-300',
    overlayClassName
  );

  const modalClasses = twMerge(
    'relative w-full',
    sizes[size],
    'bg-white rounded-lg shadow-xl',
    'transform transition-all duration-300',
    'max-h-[90vh] flex flex-col',
    className
  );

  const headerClasses = twMerge(
    'flex items-center justify-between',
    'px-6 py-4 border-b border-gray-200',
    'flex-shrink-0',
    headerClassName
  );

  const bodyClasses = twMerge(
    'px-6 py-4 flex-1 overflow-y-auto',
    bodyClassName
  );

  const footerClasses = twMerge(
    'px-6 py-4 border-t border-gray-200',
    'flex justify-end space-x-2',
    'flex-shrink-0',
    footerClassName
  );

  const CloseIcon = () => (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  return (
    <div
      className={overlayClasses}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={modalClasses}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={headerClasses}>
            {title && (
              <h2 
                id="modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={bodyClasses}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={footerClasses}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de confirmación
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar acción',
  message = '¿Estás seguro de que quieres realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  loading = false,
  ...props 
}) => {
  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className={twMerge(
          'px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          typeStyles[type]
        )}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </span>
        ) : (
          confirmText
        )}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      {...props}
    >
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </Modal>
  );
};

// Hook para controlar modales
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

export default Modal;
export { Modal };