import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiLock,
  FiUnlock,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMail,
  FiCalendar,
  FiCreditCard
} from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search })
      };

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data.users);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ type: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'suspendido'} exitosamente`);
      fetchUsers();
    } catch (error) {
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data.data);
      setShowUserModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles del usuario');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserTypeBadge = (type) => {
    const typeMap = {
      artist: { bg: 'bg-purple-900', text: 'text-purple-300', label: '🎨 Artista' },
      client: { bg: 'bg-blue-900', text: 'text-blue-300', label: '👤 Cliente' },
      admin: { bg: 'bg-red-900', text: 'text-red-300', label: '👑 Admin' }
    };
    
    const typeInfo = typeMap[type] || typeMap.client;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.bg} ${typeInfo.text}`}>
        {typeInfo.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { bg: 'bg-green-900', text: 'text-green-300', label: 'Activo' },
      suspended: { bg: 'bg-red-900', text: 'text-red-300', label: 'Suspendido' },
      pending: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Pendiente' }
    };
    
    const statusInfo = statusMap[status] || statusMap.active;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-400">
          {pagination.total} usuarios registrados
        </p>
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

          {/* Filtro por tipo */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Todos los tipos</option>
            <option value="client">Clientes</option>
            <option value="artist">Artistas</option>
          </select>

          {/* Limpiar filtros */}
          {(filters.type || filters.search) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Usuario</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Tipo</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Estado</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Suscripción</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Registro</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Pagos</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                          <FiUser className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.first_name || 'Sin nombre'}
                          </p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getUserTypeBadge(user.user_type)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(user.status || 'active')}
                    </td>
                    <td className="py-4 px-6">
                      {user.subscription_id ? (
                        <div>
                          <p className="text-purple-400 font-medium">{user.plan_name}</p>
                          <p className="text-gray-400 text-sm">
                            {user.subscription_status === 'authorized' ? 'Activa' : 'Inactiva'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500">Sin suscripción</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-green-400 font-medium">
                        {user.total_payments || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewUserDetails(user.id)}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.status || 'active')}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'suspended'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                          title={user.status === 'suspended' ? 'Activar' : 'Suspender'}
                        >
                          {user.status === 'suspended' ? <FiUnlock /> : <FiLock />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    No se encontraron usuarios
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

      {/* Modal de detalles del usuario */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Detalles del Usuario</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                  <FiUser className="text-3xl text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {selectedUser.user.first_name} {selectedUser.user.last_name}
                  </h3>
                  <p className="text-gray-400">{selectedUser.user.email}</p>
                  {getUserTypeBadge(selectedUser.user.user_type)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">ID</p>
                  <p className="text-white">{selectedUser.user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estado</p>
                  <p className="text-white">{getStatusBadge(selectedUser.user.status || 'active')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fecha de registro</p>
                  <p className="text-white">{formatDate(selectedUser.user.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Último acceso</p>
                  <p className="text-white">{formatDate(selectedUser.user.last_login)}</p>
                </div>
              </div>

              {selectedUser.subscription && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-2">Información de Suscripción</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Plan</p>
                      <p className="text-white">{selectedUser.subscription.plan_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Estado</p>
                      <p className="text-white">{selectedUser.subscription.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Precio</p>
                      <p className="text-white">${selectedUser.subscription.price}/mes</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Próximo pago</p>
                      <p className="text-white">{formatDate(selectedUser.subscription.next_billing_date)}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.paymentHistory && selectedUser.paymentHistory.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-2">Historial de Pagos</h4>
                  <div className="space-y-2">
                    {selectedUser.paymentHistory.slice(0, 5).map((payment, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700">
                        <div>
                          <p className="text-white">${payment.amount}</p>
                          <p className="text-gray-400 text-sm">{formatDate(payment.transaction_date)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'approved'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {payment.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;