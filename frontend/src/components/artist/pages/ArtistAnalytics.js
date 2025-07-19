import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';

const ArtistAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analíticas</h2>
        <p className="text-gray-400 mt-1">Análisis de tu rendimiento como artista</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12">
        <div className="text-center">
          <FiBarChart2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Analíticas Avanzadas</h3>
          <p className="text-gray-500">Aquí podrás ver estadísticas detalladas de tu actividad</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistAnalytics;