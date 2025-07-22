import React, { useState, useEffect } from 'react';
import { statsService, sponsoredShopsService, paymentService } from '../../../services/api';
import { 
  FiUsers, 
  FiTag, 
  FiShoppingBag, 
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, shopsStatsRes, paymentStatsRes] = await Promise.all([
        statsService.getGeneral().catch(() => ({ data: {} })),
        sponsoredShopsService.getStats().catch(() => ({ data: {} })),
        paymentService.getPaymentStats().catch(() => ({ data: {} }))
      ]);
      
      setStats({
        ...statsRes.data,
        shops: shopsStatsRes.data,
        payments: paymentStatsRes.data
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Error al cargar los datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers || 0,
      change: '+12%',
      positive: true,
      icon: FiUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Ofertas Activas',
      value: stats.totalOffers || 0,
      change: '+8%',
      positive: true,
      icon: FiTag,
      color: 'bg-green-500'
    },
    {
      title: 'Tiendas',
      value: stats.shops?.total || 0,
      change: '+5%',
      positive: true,
      icon: FiShoppingBag,
      color: 'bg-purple-500'
    },
    {
      title: 'Ingresos Mensuales',
      value: `$${stats.payments?.monthlyRevenue || '0'}`,
      change: '+23%',
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
    <div className="space-y-8">
      {/* Integration-style Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Integraciones</h1>
          <p className="text-gray-400 mt-2">Gestiona las conexiones y servicios de tu plataforma</p>
        </div>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors">
          Sugerir una integración
        </button>
      </div>
      
      {/* Featured Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Destacadas</h2>
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <button className="text-blue-400 hover:text-blue-300">Destacadas</button>
            <button className="text-gray-400 hover:text-gray-300">Monitor</button>
            <button className="text-gray-400 hover:text-gray-300">Develop</button>
            <button className="text-gray-400 hover:text-gray-300">Deploy</button>
            <button className="text-gray-400 hover:text-gray-300">Query</button>
            <button className="text-gray-400 hover:text-gray-300">Replicate</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* GitHub Integration Card */}
          <div className="bg-gray-900/50 hover:bg-gray-900/80 border border-gray-800 rounded-xl p-6 transition-all duration-200 group cursor-pointer">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">GitHub</h3>
                <p className="text-gray-400 text-sm">Control de versiones</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Conecta tu repositorio de GitHub con la base de datos en cada PR.
            </p>
            <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors group-hover:bg-gray-700">
              Agregar
            </button>
          </div>

          {/* Netlify Integration Card */}
          <div className="bg-gray-900/50 hover:bg-gray-900/80 border border-gray-800 rounded-xl p-6 transition-all duration-200 group cursor-pointer">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Netlify</h3>
                <p className="text-gray-400 text-sm">Deploy automático</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Accede a tu proyecto Neon desde <span className="text-teal-400">Netlify Functions</span>.
            </p>
            <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors group-hover:bg-gray-700">
              Leer
            </button>
          </div>

          {/* Vercel Integration Card */}
          <div className="bg-gray-900/50 hover:bg-gray-900/80 border border-gray-800 rounded-xl p-6 transition-all duration-200 group cursor-pointer">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l10 20H2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Vercel</h3>
                <p className="text-gray-400 text-sm">Edge deployment</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Crea un branch de base de datos para cada despliegue de <span className="text-blue-400">Vercel</span>.
            </p>
            <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors group-hover:bg-gray-700">
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Monitor Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Monitor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Datadog Monitoring */}
          <div className="bg-gray-900/50 hover:bg-gray-900/80 border border-gray-800 rounded-xl p-6 transition-all duration-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <FiBarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Analytics</h3>
                <p className="text-gray-400 text-sm">Sistema de métricas</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Envía métricas y eventos desde PalTattoo a nuestro sistema de Analytics.
            </p>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors">
              Actualizar plan para agregar
            </button>
          </div>

          {/* OpenTelemetry */}
          <div className="bg-gray-900/50 hover:bg-gray-900/80 border border-gray-800 rounded-xl p-6 transition-all duration-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">OpenTelemetry</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400 text-sm">Monitoreo avanzado</p>
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">BETA</span>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Envía métricas y eventos desde PalTattoo a cualquier backend compatible con OpenTelemetry
            </p>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors">
              Actualizar plan para agregar
            </button>
          </div>
        </div>
      </div>

      {/* Develop Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Develop</h2>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiUsers className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Activar Windows</h3>
            <p className="text-gray-400 text-sm mb-6">Ve a Configuración para activar Windows.</p>
          </div>
        </div>
      </div>

      {/* Original Metrics Grid - Hidden by default */}
      <div className="hidden">
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
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Ingresos</h3>
            <select className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1 border border-gray-700">
              <option>Últimos 7 días</option>
              <option>Último mes</option>
              <option>Último año</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <FiBarChart2 className="w-12 h-12 mb-2" />
            <p className="text-sm">Gráfico de ingresos</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {[
              { user: 'María G.', action: 'creó una nueva oferta', time: 'hace 5 min' },
              { user: 'Carlos M.', action: 'se registró como artista', time: 'hace 12 min' },
              { user: 'Ana R.', action: 'completó un pago', time: 'hace 1 hora' },
              { user: 'Luis P.', action: 'actualizó su portafolio', time: 'hace 2 horas' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Estadísticas de Usuarios</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Artistas</span>
              <span className="text-white font-medium">{stats.totalArtists || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Clientes</span>
              <span className="text-white font-medium">{stats.totalClients || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Activos hoy</span>
              <span className="text-white font-medium">{stats.activeToday || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ofertas y Propuestas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Ofertas abiertas</span>
              <span className="text-white font-medium">{stats.openOffers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Propuestas enviadas</span>
              <span className="text-white font-medium">{stats.totalProposals || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tasa de conversión</span>
              <span className="text-white font-medium">24%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sistema</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Estado</span>
              <span className="text-green-400 font-medium">Operativo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white font-medium">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Versión</span>
              <span className="text-white font-medium">2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;