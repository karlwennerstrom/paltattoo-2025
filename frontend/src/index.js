import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import App from './AppTest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Global error handler for browser extension interference
window.addEventListener('unhandledrejection', (event) => {
  // Check if this is a browser extension error
  if (event.reason && event.reason.message && 
      event.reason.message.includes('message channel closed')) {
    console.warn('Browser extension interference detected and handled');
    event.preventDefault(); // Prevent the error from appearing in console
  }
});

// Suppress ResizeObserver loop limit exceeded warning
window.addEventListener('error', (event) => {
  if (event.message && (event.message.includes('ResizeObserver loop completed with undelivered notifications') ||
                       event.message.includes('ResizeObserver loop limit exceeded'))) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
});

// Also suppress ResizeObserver errors in console
const resizeObserverErr = /ResizeObserver loop (completed with undelivered notifications|limit exceeded)/;
const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && resizeObserverErr.test(args[0])) {
    return; // Suppress this specific error
  }
  originalError.apply(console, args);
};

// Throttle resize events to prevent ResizeObserver issues
let resizeTimeout;
const originalAddEventListener = window.addEventListener;
window.addEventListener = function(type, listener, options) {
  if (type === 'resize') {
    const throttledListener = function(event) {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        listener(event);
      }, 100); // 100ms throttle
    };
    return originalAddEventListener.call(this, type, throttledListener, options);
  }
  return originalAddEventListener.call(this, type, listener, options);
};

// Handle ResizeObserver errors during navigation
let navigationTimeout;
const originalPushState = window.history.pushState;
window.history.pushState = function(...args) {
  clearTimeout(navigationTimeout);
  const result = originalPushState.apply(this, args);
  
  // Debounce any ResizeObserver calculations after navigation
  navigationTimeout = setTimeout(() => {
    // Trigger a small delay to allow React to finish rendering
    if (window.ResizeObserver) {
      const originalObserve = window.ResizeObserver.prototype.observe;
      window.ResizeObserver.prototype.observe = function(target) {
        setTimeout(() => {
          try {
            originalObserve.call(this, target);
          } catch (e) {
            // Silently catch ResizeObserver errors
          }
        }, 0);
      };
    }
  }, 50);
  
  return result;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);