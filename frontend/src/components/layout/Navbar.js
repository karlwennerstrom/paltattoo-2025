import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasCalendarAccess } from '../../utils/subscriptionHelpers';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isArtist, isClient, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
        isActivePath(to) 
          ? 'text-accent-500 bg-accent-500/10 border border-accent-500/30' 
          : 'text-gray-300 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
      {isActivePath(to) && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-500/20 to-accent-600/20 animate-pulse"></div>
      )}
    </Link>
  );

  return (
    <nav className="bg-black/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={isAdmin ? "/admin/dashboard" : isArtist ? "/artist" : "/"} className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/paltattoo-icono.png" 
                  alt="PalTattoo" 
                  className="w-8 h-8 object-contain transition-all duration-300 group-hover:drop-shadow-lg"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))'
                  }}
                />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-accent-500 transition-all duration-300">
                Pal<span className="text-accent-500">Tattoo</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {!isAuthenticated && <NavLink to="/">Inicio</NavLink>}
              <NavLink to="/artists">Tatuadores</NavLink>
              {isAuthenticated && isArtist && (
                <NavLink to="/feed">Feed</NavLink>
              )}
              <NavLink to="/shops">Tiendas</NavLink>
              
              {isAuthenticated && isClient && (
                <>
                  <NavLink to="/dashboard">Solicitar Tatuaje</NavLink>
                  <NavLink to="/my-requests">Mis Solicitudes</NavLink>
                  <NavLink to="/my-appointments">Mis Citas</NavLink>
                  <NavLink to="/favorites">Favoritos</NavLink>
                </>
              )}
              
              {isAuthenticated && isArtist && (
                <>
                  <NavLink to="/artist/portfolio">Portafolio</NavLink>
                  <NavLink to="/artist/proposals">Propuestas</NavLink>
                  {hasCalendarAccess(user) && (
                    <NavLink to="/artist/calendar">Calendario</NavLink>
                  )}
                </>
              )}
              
              {isAuthenticated && isAdmin && (
                <>
                  <NavLink to="/admin/dashboard">Panel Admin</NavLink>
                </>
              )}
            </div>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 text-white hover:text-accent-500 focus:outline-none rounded-lg p-2 transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-500/30"
                >
                  <img
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-accent-500/50"
                    src={user?.profile_image || '/placeholder-avatar.jpg'}
                    alt={user?.name || 'Usuario'}
                  />
                  <span className="font-medium">{user?.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="dropdown-menu">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Configuración
                    </Link>
                    {isArtist && (
                      <Link
                        to="/artist/subscription"
                        className="dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Suscripción
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="dropdown-item w-full text-left text-red-600 hover:bg-red-50"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-accent-500 focus:outline-none p-2 rounded-lg transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-500/30"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-2 bg-black/95 backdrop-blur-xl border-t border-white/10">
            {!isAuthenticated && (
              <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>
                Inicio
              </NavLink>
            )}
            <NavLink to="/artists" onClick={() => setIsMobileMenuOpen(false)}>
              Tatuadores
            </NavLink>
            {isAuthenticated && isArtist && (
              <NavLink to="/feed" onClick={() => setIsMobileMenuOpen(false)}>
                Feed
              </NavLink>
            )}
            <NavLink to="/shops" onClick={() => setIsMobileMenuOpen(false)}>
              Tiendas
            </NavLink>
            
            {isAuthenticated && isClient && (
              <>
                <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  Solicitar Tatuaje
                </NavLink>
                <NavLink to="/my-requests" onClick={() => setIsMobileMenuOpen(false)}>
                  Mis Solicitudes
                </NavLink>
                <NavLink to="/my-appointments" onClick={() => setIsMobileMenuOpen(false)}>
                  Mis Citas
                </NavLink>
                <NavLink to="/favorites" onClick={() => setIsMobileMenuOpen(false)}>
                  Favoritos
                </NavLink>
              </>
            )}
            
            {isAuthenticated && isArtist && (
              <>
                <NavLink to="/artist/portfolio" onClick={() => setIsMobileMenuOpen(false)}>
                  Portafolio
                </NavLink>
                <NavLink to="/artist/proposals" onClick={() => setIsMobileMenuOpen(false)}>
                  Propuestas
                </NavLink>
                {hasCalendarAccess(user) && (
                  <NavLink to="/artist/calendar" onClick={() => setIsMobileMenuOpen(false)}>
                    Calendario
                  </NavLink>
                )}
              </>
            )}
            
            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  Panel Admin
                </NavLink>
              </>
            )}

            {/* Mobile User Menu */}
            {isAuthenticated ? (
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center px-3 py-3 mb-3 bg-white/5 rounded-lg">
                  <img
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-accent-500/50"
                    src={user?.profile_image || '/placeholder-avatar.jpg'}
                    alt={user?.name || 'Usuario'}
                  />
                  <span className="ml-3 font-medium text-white">{user?.name}</span>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Configuración
                  </Link>
                  {isArtist && (
                    <Link
                      to="/artist/subscription"
                      className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Suscripción
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-3 bg-accent-500 text-black font-semibold rounded-lg text-center transition-all duration-300 hover:bg-accent-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;