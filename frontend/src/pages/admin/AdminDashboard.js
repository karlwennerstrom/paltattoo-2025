import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiUsers, 
  FiDollarSign, 
  FiCreditCard, 
  FiTrendingUp,
  FiCalendar,
  FiActivity,
  FiPieChart,
  FiTag
} from 'react-icons/fi';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { stats, planStats, recentActivity, recentPayments } = dashboardData;

  return (
    <div className="p-6">
      {/* Header info */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-300">
              Bienvenido, {user?.first_name}
            </h2>
          </div>
          <div className="text-sm text-gray-400">
            Última actualización: {new Date().toLocaleString('es-CL')}
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Usuarios</p>
              <p className="text-3xl font-bold text-white">{stats.total_users}</p>
              <div className="flex text-sm text-gray-400 mt-1">
                <span className="text-blue-400">{stats.total_artists} artistas</span>
                <span className="mx-2">•</span>
                <span className="text-green-400">{stats.total_clients} clientes</span>
              </div>
            </div>
            <FiUsers className="text-3xl text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Suscripciones Activas</p>
              <p className="text-3xl font-bold text-green-400">{stats.active_subscriptions}</p>
              <p className="text-sm text-gray-400 mt-1">
                de {stats.total_subscriptions} totales
              </p>
            </div>
            <FiCreditCard className="text-3xl text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Ingresos Mensuales</p>
              <p className="text-3xl font-bold text-purple-400">
                {formatCurrency(stats.monthly_revenue)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Estimado mensual
              </p>
            </div>
            <FiDollarSign className="text-3xl text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tasa de Conversión</p>
              <p className="text-3xl font-bold text-yellow-400">
                {stats.total_users > 0 ? 
                  Math.round((stats.active_subscriptions / stats.total_users) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Usuarios con suscripción
              </p>
            </div>
            <FiTrendingUp className="text-3xl text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Estadísticas por plan */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiPieChart className="mr-2 text-purple-400" />
            Suscripciones por Plan
          </h3>
          <div className="space-y-4">
            {planStats.map((plan, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">{plan.plan_name}</span>
                    <span className="text-gray-400">{plan.active_count} activas</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.max((plan.active_count / (stats.active_subscriptions || 1)) * 100, 5)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>{formatCurrency(plan.price)}/mes</span>
                    <span>{formatCurrency(plan.plan_revenue)} total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiActivity className="mr-2 text-green-400" />
            Actividad Reciente (30 días)
          </h3>
          <div className="h-64 overflow-y-auto">
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <div>
                      <p className="text-white text-sm">{formatDate(activity.date)}</p>
                      <p className="text-gray-400 text-xs">
                        {activity.new_subscriptions} nuevas suscripciones
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">
                        {formatCurrency(activity.daily_revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* Pagos recientes */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiCalendar className="mr-2 text-blue-400" />
          Pagos Recientes (7 días)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Usuario</th>
                <th className="text-left py-3 px-4 text-gray-400">Plan</th>
                <th className="text-left py-3 px-4 text-gray-400">Monto</th>
                <th className="text-left py-3 px-4 text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 text-gray-400">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length > 0 ? (
                recentPayments.map((payment, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white">{payment.first_name || 'Sin nombre'}</p>
                        <p className="text-gray-400 text-xs">{payment.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">{payment.plan_name}</td>
                    <td className="py-3 px-4 text-green-400 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'approved' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {payment.status === 'approved' ? 'Aprobado' : payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {formatDate(payment.transaction_date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    No hay pagos recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enlaces de navegación */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link 
          to="/admin/subscriptions" 
          className="block bg-purple-600 hover:bg-purple-700 p-6 rounded-lg text-center transition-colors"
        >
          <FiCreditCard className="text-3xl mx-auto mb-2" />
          <h4 className="text-lg font-semibold">Gestionar Suscripciones</h4>
          <p className="text-purple-200 text-sm mt-1">Ver y administrar todas las suscripciones</p>
        </Link>
        
        <Link 
          to="/admin/users" 
          className="block bg-blue-600 hover:bg-blue-700 p-6 rounded-lg text-center transition-colors"
        >
          <FiUsers className="text-3xl mx-auto mb-2" />
          <h4 className="text-lg font-semibold">Gestionar Usuarios</h4>
          <p className="text-blue-200 text-sm mt-1">Ver y administrar usuarios registrados</p>
        </Link>
        
        <Link 
          to="/admin/offers" 
          className="block bg-orange-600 hover:bg-orange-700 p-6 rounded-lg text-center transition-colors"
        >
          <FiTag className="text-3xl mx-auto mb-2" />
          <h4 className="text-lg font-semibold">Gestionar Ofertas</h4>
          <p className="text-orange-200 text-sm mt-1">Ver y administrar ofertas de tatuajes</p>
        </Link>
        
        <Link 
          to="/admin/payments" 
          className="block bg-green-600 hover:bg-green-700 p-6 rounded-lg text-center transition-colors"
        >
          <FiDollarSign className="text-3xl mx-auto mb-2" />
          <h4 className="text-lg font-semibold">Gestionar Pagos</h4>
          <p className="text-green-200 text-sm mt-1">Ver y administrar todos los pagos</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;