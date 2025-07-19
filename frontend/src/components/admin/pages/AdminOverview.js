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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Resumen general de la plataforma</p>
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