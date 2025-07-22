import React, { useState, useEffect } from 'react';
import { artistService, profileService, portfolioService, paymentService, statsService } from '../../../services/api';
import { 
  FiUsers, 
  FiEye, 
  FiHeart, 
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ArtistOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadArtistData();
  }, []);

  const loadArtistData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, using mock data');
      }
      
      // Use mock data temporarily until backend is fully connected
      const mockData = {
        artistStatsRes: {
          data: {
            profile_views: 1250,
            profile_views_change: '+15%',
            total_likes: 89,
            likes_change: '+23%',
            monthly_earnings: 2500,
            earnings_change: '+18%',
            portfolio_count: 12,
            portfolio_views: 3450
          }
        },
        proposalsRes: {
          data: [
            { id: 1, status: 'pending', created_at: '2024-01-15T10:00:00Z' },
            { id: 2, status: 'accepted', created_at: '2024-01-14T15:30:00Z' },
            { id: 3, status: 'pending', created_at: '2024-01-13T09:15:00Z' }
          ]
        },
        appointmentsRes: {
          data: [
            { id: 1, title: 'Consulta inicial', date: '2024-01-20T14:00:00Z', status: 'scheduled', created_at: '2024-01-12T11:00:00Z' },
            { id: 2, title: 'Sesión de tatuaje', date: '2024-01-25T10:00:00Z', status: 'confirmed', created_at: '2024-01-11T16:00:00Z' }
          ]
        },
        subscriptionRes: {
          data: {
            plan: 'pro',
            status: 'active'
          }
        }
      };

      // Check authentication first
      console.log('Auth token available:', !!token);
      
      if (!token) {
        console.log('No authentication token found, using mock data');
        setStats(mockData.artistStatsRes.data);
        setProposals(mockData.proposalsRes.data || []);
        setAppointments(mockData.appointmentsRes.data || []);
        generateRecentActivity(mockData.proposalsRes.data || [], mockData.appointmentsRes.data || []);
        return;
      }
      
      // Try to load real data, but fallback to mock data
      const [
        artistStatsRes,
        proposalsRes,
        appointmentsRes,
        subscriptionRes
      ] = await Promise.all([
        statsService.getArtistStats().catch((error) => {
          console.log('Stats API error:', error.response?.status || error.message);
          if (error.response?.status === 401) {
            console.log('Authentication failed, using mock data');
            return mockData.artistStatsRes;
          }
          console.log('Stats API failed, using default stats');
          return { data: { profile_views: 0, total_likes: 0, monthly_earnings: 0, portfolio_count: 0 } };
        }),
        profileService.getMyProposals().catch((error) => {
          console.log('Proposals API error:', error.response?.status || error.message);
          if (!token) {
            console.log('Using mock proposals data - no auth token');
            return mockData.proposalsRes;
          }
          console.log('Proposals API failed but user is authenticated, returning empty array');
          return { data: [] };
        }),
        profileService.getAppointments().catch((error) => {
          console.log('Appointments API error:', error.response?.status || error.message);
          if (!token) {
            console.log('Using mock appointments data - no auth token');
            return mockData.appointmentsRes;
          }
          console.log('Appointments API failed but user is authenticated, returning empty array');
          return { data: [] };
        }),
        paymentService.getMySubscription().catch((error) => {
          console.log('Subscription API error:', error.response?.status || error.message);
          if (!token) {
            console.log('Using mock subscription data - no auth token');
            return mockData.subscriptionRes;
          }
          console.log('Subscription API failed but user is authenticated, using default');
          return { data: { plan: 'free', status: 'active' } };
        })
      ]);

      setStats({
        ...artistStatsRes.data,
        subscription: subscriptionRes.data
      });
      setProposals(Array.isArray(proposalsRes.data) ? proposalsRes.data : []);
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);

      // Generate recent activity from proposals and appointments
      const proposalsArray = Array.isArray(proposalsRes.data) ? proposalsRes.data : [];
      const appointmentsArray = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
      generateRecentActivity(proposalsArray, appointmentsArray);

    } catch (error) {
      console.error('Error loading artist data:', error);
      toast.error('Error al cargar los datos del artista');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (proposalsData, appointmentsData) => {
    const activities = [];
    
    // Ensure both parameters are arrays
    const safeProposals = Array.isArray(proposalsData) ? proposalsData : [];
    const safeAppointments = Array.isArray(appointmentsData) ? appointmentsData : [];
    
    // Add recent proposals
    safeProposals.slice(0, 3).forEach(proposal => {
      if (proposal && proposal.created_at) {
        activities.push({
          action: `Propuesta ${proposal.status === 'accepted' ? 'aceptada' : proposal.status === 'rejected' ? 'rechazada' : 'enviada'}`,
          time: getTimeAgo(proposal.created_at),
          type: 'proposal'
        });
      }
    });

    // Add recent appointments
    safeAppointments.slice(0, 2).forEach(appointment => {
      if (appointment && appointment.created_at) {
        activities.push({
          action: appointment.status === 'confirmed' ? 'Cita confirmada' : 'Cita programada',
          time: getTimeAgo(appointment.created_at),
          type: 'appointment'
        });
      }
    });

    // Sort activities by date (most recent first)
    activities.sort((a, b) => {
      // Since getTimeAgo returns relative time strings, we'll just keep the original order for now
      return 0;
    });
    
    setRecentActivity(activities.slice(0, 4));
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'hace menos de 1 hora';
    if (diffInHours < 24) return `hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} días`;
    return `hace ${Math.floor(diffInDays / 7)} semanas`;
  };

  const metrics = [
    {
      title: 'Visualizaciones del Perfil',
      value: stats.profile_views || 0,
      change: stats.profile_views_change || '+0%',
      positive: true,
      icon: FiEye,
      color: 'bg-blue-500'
    },
    {
      title: 'Propuestas Activas',
      value: (Array.isArray(proposals) ? proposals : []).filter(p => p && p.status === 'pending').length || 0,
      change: '+' + ((Array.isArray(proposals) ? proposals : []).length - (Array.isArray(proposals) ? proposals : []).filter(p => p && p.status === 'pending').length),
      positive: true,
      icon: FiUsers,
      color: 'bg-green-500'
    },
    {
      title: 'Me Gusta Totales',
      value: stats.total_likes || 0,
      change: stats.likes_change || '+0%',
      positive: true,
      icon: FiHeart,
      color: 'bg-purple-500'
    },
    {
      title: 'Ingresos del Mes',
      value: `$${stats.monthly_earnings || '0'}`,
      change: stats.earnings_change || '+0%',
      positive: true,
      icon: FiDollarSign,
      color: 'bg-yellow-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">Resumen de tu actividad como artista</p>
        </div>
        <button 
          onClick={loadArtistData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.color} bg-opacity-20 p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-white`} />
                </div>
                <span className={`text-sm font-medium flex items-center ${
                  metric.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.positive ? (
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-400 text-sm">{metric.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Rendimiento</h3>
            <select className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1 border border-gray-700">
              <option>Últimos 7 días</option>
              <option>Último mes</option>
              <option>Último año</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FiBarChart2 className="w-12 h-12 mb-2 mx-auto" />
              <p className="text-sm">Gráfico de rendimiento</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'proposal' ? 'bg-blue-500' : 
                  activity.type === 'appointment' ? 'bg-green-500' : 
                  'bg-accent-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Propuestas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total enviadas</span>
              <span className="text-white font-medium">{(Array.isArray(proposals) ? proposals : []).length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Aceptadas</span>
              <span className="text-white font-medium">{(Array.isArray(proposals) ? proposals : []).filter(p => p && p.status === 'accepted').length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pendientes</span>
              <span className="text-white font-medium">{(Array.isArray(proposals) ? proposals : []).filter(p => p && p.status === 'pending').length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tasa de éxito</span>
              <span className="text-white font-medium">
                {(Array.isArray(proposals) ? proposals : []).length ? Math.round(((Array.isArray(proposals) ? proposals : []).filter(p => p && p.status === 'accepted').length / (Array.isArray(proposals) ? proposals : []).length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Imágenes</span>
              <span className="text-white font-medium">{stats.portfolio_count || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Visualizaciones</span>
              <span className="text-white font-medium">{stats.portfolio_views || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Me gusta</span>
              <span className="text-white font-medium">{stats.total_likes || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Próximas Citas</h3>
          <div className="space-y-3">
            {(Array.isArray(appointments) ? appointments : []).filter(apt => apt && apt.date && new Date(apt.date) > new Date()).slice(0, 3).map((appointment, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <FiCalendar className="w-5 h-5 text-accent-500" />
                <div>
                  <p className="text-sm text-gray-300">{appointment.title || 'Cita programada'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(appointment.date).toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {(Array.isArray(appointments) ? appointments : []).filter(apt => apt && apt.date && new Date(apt.date) > new Date()).length === 0 && (
              <div className="text-center py-2">
                <p className="text-gray-500 text-sm">No hay citas próximas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistOverview;