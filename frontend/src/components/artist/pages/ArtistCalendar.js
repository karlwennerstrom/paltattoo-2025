import React from 'react';
import { FiCalendar } from 'react-icons/fi';

const ArtistCalendar = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Calendario</h2>
        <p className="text-gray-400 mt-1">Gestiona tus citas y horarios</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12">
        <div className="text-center">
          <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Gestión de Calendario</h3>
          <p className="text-gray-500">Aquí podrás ver y programar tus citas</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistCalendar;