import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/common/Layout';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { offerService, catalogService, statsService } from '../services/api';
import { FiMapPin, FiClock, FiDollarSign, FiImage, FiTrendingUp, FiZap, FiHeart, FiUser, FiSettings, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, on, off } = useSocket();
  const [quickForm, setQuickForm] = useState({
    tattooIdea: '',
    bodyPart: '',
    budgetRange: '',
    urgency: 'flexible'
  });
  const [activeOffers, setActiveOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    onlineArtists: 0,
    newOffersToday: 0,
    avgResponseTime: 2
  });

  useEffect(() => {
    loadActiveOffers();
    loadSuggestions();
    loadDashboardStats();
    
    // Listen for real-time artists online count updates
    const handleArtistsOnlineUpdate = (data) => {
      console.log('Received artists online update:', data);
      setDashboardStats(prev => ({
        ...prev,
        onlineArtists: data.count
      }));
    };
    
    // Fallback: reload stats every 30 seconds if socket is not connected
    const statsInterval = setInterval(() => {
      if (!socket || !socket.isConnected()) {
        console.log('Socket not connected, reloading stats via API');
        loadDashboardStats();
      }
    }, 30000);
    
    // Only set up socket listeners if socket is available
    if (on && off) {
      on('artists_online_count', handleArtistsOnlineUpdate);
    }
    
    return () => {
      clearInterval(statsInterval);
      if (off) {
        off('artists_online_count', handleArtistsOnlineUpdate);
      }
    };
  }, [on, off, socket]);

  const loadActiveOffers = async () => {
    try {
      const response = await offerService.getMyOffers();
      setActiveOffers(response.data?.filter(offer => offer.status === 'active') || []);
    } catch (error) {
      console.error('Error loading offers:', error);
      // Set empty array on error to prevent crash
      setActiveOffers([]);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await statsService.getGeneral();
      if (response.data?.dashboard) {
        setDashboardStats(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadSuggestions = () => {
    // Static suggestions based on popular tattoo types
    setSuggestions([
      {
        id: 'minimalist',
        title: 'Minimalista',
        description: 'Diseños simples y elegantes',
        icon: <FiHeart />,
        avgPrice: '50,000 - 150,000',
        popularity: 'Muy popular',
        image: '/suggestions/minimalist.jpg'
      },
      {
        id: 'traditional',
        title: 'Tradicional',
        description: 'Estilo clásico con colores vibrantes',
        icon: <FiTrendingUp />,
        avgPrice: '80,000 - 300,000',
        popularity: 'Popular',
        image: '/suggestions/traditional.jpg'
      },
      {
        id: 'flash',
        title: 'Flash',
        description: 'Diseños predefinidos disponibles inmediatamente',
        icon: <FiZap />,
        avgPrice: '30,000 - 100,000',
        popularity: 'Disponible ya',
        image: '/suggestions/flash.jpg'
      }
    ]);
  };

  const handleQuickRequest = () => {
    if (!quickForm.tattooIdea.trim()) {
      toast.error('Describe tu idea de tatuaje');
      return;
    }
    
    setLoading(true);
    // Navigate to create offer with pre-filled data
    navigate('/offers/create', {
      state: {
        prefilledData: quickForm,
        fromQuickRequest: true
      }
    });
  };

  const handleSuggestionClick = (suggestion) => {
    navigate('/offers/create', {
      state: {
        suggestionType: suggestion.id,
        prefilledData: {
          title: `Tatuaje ${suggestion.title}`,
          description: suggestion.description
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-primary-950">
      {/* Compact Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="relative">
                <img 
                  src={user?.profile_image || "/placeholder-avatar.jpg"} 
                  alt={user?.first_name || 'Usuario'} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary-600"
                  onError={(e) => {
                    e.target.src = "/placeholder-avatar.jpg";
                  }}
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success-500 border-2 border-primary-800 rounded-full"></div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-white">
                    ¡Hola, {user?.first_name || 'Cliente'}! 👋
                  </h1>
                  {user?.last_name && (
                    <span className="text-lg text-primary-300">{user.last_name}</span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-primary-400">
                  <span>
                    {activeOffers.length > 0 
                      ? `${activeOffers.length} solicitud${activeOffers.length > 1 ? 'es' : ''} activa${activeOffers.length > 1 ? 's' : ''}`
                      : 'Encuentra tu próximo tatuaje'
                    }
                  </span>
                  {user?.email && (
                    <>
                      <span>•</span>
                      <span>{user.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2"
              >
                <FiSettings className="w-4 h-4" />
                <span>Perfil</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-requests')}
              >
                Mis solicitudes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/artists')}
              >
                Explorar artistas
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Create New Request - Main Action */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="bg-gradient-to-br from-accent-500/20 to-accent-600/10 rounded-2xl p-8 border border-accent-500/30 hover:border-accent-500/50 transition-all group cursor-pointer"
                 onClick={() => navigate('/offers/create')}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Solicita tu tatuaje</h2>
                  <p className="text-primary-300">Describe tu idea y recibe propuestas de artistas</p>
                </div>
                <div className="text-accent-400 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => navigate('/offers/create')}
                  variant="primary"
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold shadow-neon-lg hover:shadow-neon-xl"
                >
                  Comenzar ahora
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-black/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-accent-500/20 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiTrendingUp className="w-5 h-5 mr-2 text-accent-400" />
                Actividad
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-primary-400">Tatuadores en línea</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-white font-medium">{dashboardStats.onlineArtists}</span>
                  </div>
                </div>
                
                {/* Debug info */}
                <div className="mt-2 text-xs text-primary-500">
                  Socket: {socket && socket.isConnected() ? '🟢 Conectado' : '🔴 Desconectado'}
                  {socket && socket.isConnected() && (
                    <span className="ml-2">
                      (Actualizaciones en tiempo real activas)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-400">Nuevas ofertas hoy</span>
                  <span className="text-white font-medium">{dashboardStats.newOffersToday}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-400">Tiempo promedio de respuesta</span>
                  <span className="text-accent-400 font-medium">{dashboardStats.avgResponseTime}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* My Requests */}
          <div 
            onClick={() => navigate('/my-requests')}
            className="bg-black/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-accent-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FiImage className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm text-primary-400 group-hover:text-accent-400 transition-colors">
                {activeOffers.length}
              </span>
            </div>
            <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors">
              Mis Solicitudes
            </h3>
            <p className="text-primary-400 text-sm mt-2">
              Ver y gestionar tus solicitudes de tatuaje
            </p>
          </div>

          {/* Explore Artists */}
          <div 
            onClick={() => navigate('/artists')}
            className="bg-black/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-accent-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FiUser className="w-6 h-6 text-purple-500" />
              </div>
              <svg className="w-4 h-4 text-primary-400 group-hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors">
              Explorar Artistas
            </h3>
            <p className="text-primary-400 text-sm mt-2">
              Descubre tatuadores en tu área
            </p>
          </div>

          {/* Favorites */}
          <div 
            onClick={() => navigate('/favorites')}
            className="bg-black/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-accent-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <FiHeart className="w-6 h-6 text-red-500" />
              </div>
              <svg className="w-4 h-4 text-primary-400 group-hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors">
              Favoritos
            </h3>
            <p className="text-primary-400 text-sm mt-2">
              Artistas y diseños guardados
            </p>
          </div>

          {/* User Profile */}
          <div 
            onClick={() => navigate('/profile')}
            className="bg-black/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-accent-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FiUser className="w-6 h-6 text-green-500" />
              </div>
              <svg className="w-4 h-4 text-primary-400 group-hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors">
              Mi Perfil
            </h3>
            <p className="text-primary-400 text-sm mt-2">
              Configurar información personal
            </p>
          </div>

          {/* Appointments */}
          <div 
            onClick={() => navigate('/my-appointments')}
            className="bg-black/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-accent-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FiClock className="w-6 h-6 text-green-500" />
              </div>
              <svg className="w-4 h-4 text-primary-400 group-hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-white group-hover:text-accent-400 transition-colors">
              Mis Citas
            </h3>
            <p className="text-primary-400 text-sm mt-2">
              Próximas sesiones de tatuaje
            </p>
          </div>
        </div>

        {/* Active Requests Section */}
        {activeOffers.length > 0 && (
          <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Tus solicitudes activas</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-requests')}
              >
                Ver todas
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOffers.slice(0, 3).map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => navigate(`/offers/${offer.id}/track`)}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-4 hover:border-accent-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-white group-hover:text-accent-400 transition-colors text-sm">
                      {offer.title}
                    </h4>
                    <div className={`w-2 h-2 rounded-full ${
                      offer.proposals_count > 0 ? 'bg-green-500' : 'bg-accent-500'
                    } animate-pulse flex-shrink-0 ml-2`}></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-primary-400">
                    <span>{offer.proposals_count || 0} propuestas</span>
                    <span>{offer.views_count || 0} vistas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;