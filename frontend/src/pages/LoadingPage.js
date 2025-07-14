import React from 'react';

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-700">Cargando...</h2>
        <p className="text-gray-500 mt-2">Por favor espera un momento</p>
      </div>
    </div>
  );
};

export default LoadingPage;