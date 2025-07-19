import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FiBell, FiRefreshCw } from 'react-icons/fi';

const AdminLayout = () => {
  const location = useLocation();
  
  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles = {
      dashboard: 'Dashboard',
      users: 'Usuarios',
      offers: 'Ofertas',
      shops: 'Tiendas',
      content: 'Contenido',
      payments: 'Pagos',
      reports: 'Reportes',
      messages: 'Mensajes',
      settings: 'Configuración'
    };
    return titles[path] || 'Panel de Administración';
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200">
                <FiBell className="w-5 h-5" />
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium">
                <FiRefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;