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