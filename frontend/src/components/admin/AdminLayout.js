import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FiBell, FiRefreshCw, FiMenu, FiX } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Top bar */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/60 px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile hamburger menu */}
              <button
                className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
                <p className="text-sm text-gray-400 mt-1">Gestiona y administra tu plataforma</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200">
                <FiBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
              </button>
              <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-lg">
                <FiRefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
              <button className="sm:hidden p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-200">
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;