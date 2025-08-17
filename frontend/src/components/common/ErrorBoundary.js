import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress ResizeObserver errors
    if (error.message && error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      this.setState({ hasError: false, error: null });
      return;
    }

    // Log other errors
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Don't show error UI for ResizeObserver errors
      if (this.state.error?.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
        return this.props.children;
      }

      // Show fallback UI for other errors
      return this.props.fallback || (
        <div className="min-h-screen bg-primary-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-primary-100 mb-4">Algo salió mal</h2>
            <p className="text-primary-300 mb-6">Ha ocurrido un error inesperado.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 transition"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;