import React from 'react';
import { FiShoppingBag } from 'react-icons/fi';

const AdminShops = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Tiendas</h2>
        <p className="text-gray-400 mt-1">Gestión de tiendas y patrocinios</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12">
        <div className="text-center">
          <FiShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Gestión de Tiendas</h3>
          <p className="text-gray-500">Esta sección está en desarrollo</p>
        </div>
      </div>
    </div>
  );
};

export default AdminShops;