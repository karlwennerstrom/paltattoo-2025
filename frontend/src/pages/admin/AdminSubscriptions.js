import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiEye, 
  FiX,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import api from '../../services/api';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [filters, pagination.page]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.plan && { plan: filters.plan }),
        ...(filters.search && { search: filters.search })
      };

      const response = await api.get('/admin/subscriptions', { params });
      setSubscriptions(response.data.data.subscriptions);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Error al cargar las suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: '', plan: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      authorized: { bg: 'bg-green-900', text: 'text-green-300', label: 'Activa' },
      pending: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Pendiente' },
      cancelled: { bg: 'bg-red-900', text: 'text-red-300', label: 'Cancelada' },
      paused: { bg: 'bg-gray-900', text: 'text-gray-300', label: 'Pausada' }
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando suscripciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header info */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400">
              {pagination.total} suscripciones totales
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Búsqueda */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email o nombre..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Todos los estados</option>
            <option value="authorized">Activa</option>
            <option value="pending">Pendiente</option>
            <option value="cancelled">Cancelada</option>
            <option value="paused">Pausada</option>
          </select>

          {/* Filtro por plan */}
          <select
            value={filters.plan}
            onChange={(e) => handleFilterChange('plan', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Todos los planes</option>
            <option value="1">Básico</option>
            <option value="2">Premium</option>
            <option value="3">Pro</option>
          </select>

          {/* Limpiar filtros */}
          {(filters.status || filters.plan || filters.search) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center transition-colors"
            >
              <FiX className="mr-2" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de suscripciones */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Usuario</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Plan</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Estado</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Precio</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Creada</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Último Pago</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length > 0 ? (
                subscriptions.map((subscription, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium">
                          {subscription.first_name && subscription.last_name 
                            ? `${subscription.first_name} ${subscription.last_name}`
                            : subscription.first_name || 'Sin nombre'
                          }
                        </p>
                        <p className="text-gray-400 text-sm">{subscription.email}</p>
                        <p className="text-gray-500 text-xs">
                          {subscription.user_type === 'artist' ? '🎨 Artista' : '👤 Cliente'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium">{subscription.plan_name}</p>
                        <p className="text-gray-400 text-sm">{subscription.plan_type}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(subscription.status)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-purple-400 font-medium">
                        {formatCurrency(subscription.price)}
                      </p>
                      <p className="text-gray-400 text-sm">mensual</p>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {formatDate(subscription.created_at)}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {subscription.last_payment_date ? (
                        <div>
                          <p>{formatDate(subscription.last_payment_date)}</p>
                          <p className="text-xs text-gray-500">
                            {subscription.payment_count} pagos
                          </p>
                        </div>
                      ) : (
                        'Sin pagos'
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        to={`/admin/subscriptions/${subscription.id}`}
                        className="inline-flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                      >
                        <FiEye className="mr-1" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-2"></div>
                        Cargando...
                      </div>
                    ) : (
                      'No se encontraron suscripciones'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-750 px-6 py-4 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded-lg ${
                  pagination.page === 1 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-gray-400 hover:bg-gray-600'
                }`}
              >
                <FiChevronLeft />
              </button>
              
              {/* Números de página */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded-lg ${
                      pageNum === pagination.page
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 rounded-lg ${
                  pagination.page === pagination.totalPages 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-gray-400 hover:bg-gray-600'
                }`}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;