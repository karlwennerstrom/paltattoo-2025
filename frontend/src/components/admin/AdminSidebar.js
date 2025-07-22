import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome,
  FiUsers,
  FiFileText,
  FiShoppingBag,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiTag,
  FiMessageSquare,
  FiX
} from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      section: 'PROYECTO',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/admin/users', label: 'Usuarios', icon: FiUsers },
        { path: '/admin/offers', label: 'Ofertas', icon: FiTag },
        { path: '/admin/shops', label: 'Tiendas', icon: FiShoppingBag },
        { path: '/admin/content', label: 'Contenido', icon: FiFileText },
      ]
    },
    {
      section: 'GESTIÓN',
      items: [
        { path: '/admin/payments', label: 'Pagos', icon: FiCreditCard },
        { path: '/admin/reports', label: 'Reportes', icon: FiBarChart2 },
        { path: '/admin/messages', label: 'Mensajes', icon: FiMessageSquare },
        { path: '/admin/settings', label: 'Configuración', icon: FiSettings },
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={twMerge(
      'fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64 flex flex-col h-screen',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo/Header */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">PalTattoo</h2>
              <p className="text-xs text-gray-400">Panel Admin</p>
            </div>
          </Link>
          {/* Mobile close button */}
          <button 
            className="lg:hidden text-gray-400 hover:text-white p-1"
            onClick={onClose}
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      // Close sidebar on mobile when link is clicked
                      if (onClose && window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`
                      flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group
                      ${active 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'text-gray-400 hover:bg-gray-900/50 hover:text-gray-200'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${active ? 'text-accent-500' : 'text-gray-500 group-hover:text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-200">Administrador</p>
            <p className="text-xs text-gray-500">admin@paltattoo.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;