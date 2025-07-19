import React from 'react';
import { FiTag } from 'react-icons/fi';

const AdminOffers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Ofertas</h2>
        <p className="text-gray-400 mt-1">Gestión de ofertas y solicitudes</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12">
        <div className="text-center">
          <FiTag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Gestión de Ofertas</h3>
          <p className="text-gray-500">Esta sección está en desarrollo</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOffers;