// Error handler utilities
export const suppressResizeObserverErrors = () => {
  // Suppress ResizeObserver loop errors
  const resizeObserverErr = /ResizeObserver loop completed with undelivered notifications/;
  const originalError = console.error;
  
  console.error = (...args) => {
    if (args.length > 0 && typeof args[0] === 'string' && resizeObserverErr.test(args[0])) {
      return; // Suppress this specific error
    }
    originalError.apply(console, args);
  };

  // Also handle uncaught errors
  window.addEventListener('error', (event) => {
    if (resizeObserverErr.test(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason.message === 'string' && resizeObserverErr.test(event.reason.message)) {
      event.preventDefault();
      return false;
    }
  });
};

export const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};