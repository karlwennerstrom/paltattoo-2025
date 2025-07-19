import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome,
  FiImage,
  FiMail,
  FiCalendar,
  FiBarChart2,
  FiCreditCard,
  FiSettings,
  FiUser
} from 'react-icons/fi';

const ArtistSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      section: 'PRINCIPAL',
      items: [
        { path: '/artist/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/artist/portfolio', label: 'Portafolio', icon: FiImage },
        { path: '/artist/proposals', label: 'Propuestas', icon: FiMail },
        { path: '/artist/calendar', label: 'Calendario', icon: FiCalendar },
      ]
    },
    {
      section: 'NEGOCIO',
      items: [
        { path: '/artist/analytics', label: 'Analíticas', icon: FiBarChart2 },
        { path: '/artist/subscription', label: 'Suscripción', icon: FiCreditCard },
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-black border-r border-gray-800 h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link to="/artist/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">PalTattoo</h2>
            <p className="text-xs text-gray-400">Panel Artista</p>
          </div>
        </Link>
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
            <FiUser className="text-white w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-200">Artista</p>
            <p className="text-xs text-gray-500">artista@paltattoo.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistSidebar;