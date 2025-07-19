import React from 'react';
import { FiMail } from 'react-icons/fi';

const ArtistProposals = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Propuestas</h2>
        <p className="text-gray-400 mt-1">Gestiona tus propuestas y solicitudes</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12">
        <div className="text-center">
          <FiMail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Centro de Propuestas</h3>
          <p className="text-gray-500">Aquí podrás ver y gestionar todas tus propuestas</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistProposals;