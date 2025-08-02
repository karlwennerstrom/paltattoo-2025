import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiCalendar,
  FiCreditCard,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPayments: 0,
    averageAmount: 0
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.search && { search: filters.search })
      };

      const response = await api.get('/admin/payments', { params });
      setPayments(response.data.data.payments);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: '', dateFrom: '', dateTo: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const viewPaymentDetails = async (paymentId) => {
    try {
      const response = await api.get(`/admin/payments/${paymentId}`);
      setSelectedPayment(response.data.data);
      setShowPaymentModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles del pago');
    }
  };

  const handleRefundPayment = async (paymentId) => {
    if (!window.confirm('¿Estás seguro de que deseas reembolsar este pago?')) {
      return;
    }

    try {
      await api.post(`/admin/payments/${paymentId}/refund`);
      toast.success('Pago reembolsado exitosamente');
      fetchPayments();
      if (showPaymentModal) {
        setShowPaymentModal(false);
        setSelectedPayment(null);
      }
    } catch (error) {
      toast.error('Error al reembolsar el pago');
    }
  };

  const exportPayments = async () => {
    try {
      const params = {
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.search && { search: filters.search })
      };

      const response = await api.get('/admin/payments/export', { 
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pagos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar el reporte');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { bg: 'bg-green-900', text: 'text-green-300', label: 'Aprobado' },
      pending: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Pendiente' },
      rejected: { bg: 'bg-red-900', text: 'text-red-300', label: 'Rechazado' },
      refunded: { bg: 'bg-blue-900', text: 'text-blue-300', label: 'Reembolsado' }
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

  if (loading && payments.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Gestión de Pagos</h1>
        <p className="text-gray-400">
          {pagination.total} pagos registrados
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Recaudado</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
            <FiDollarSign className="text-3xl text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total de Pagos</p>
              <p className="text-2xl font-bold text-purple-400">{summary.totalPayments}</p>
            </div>
            <FiCreditCard className="text-3xl text-purple-400" />
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Promedio por Pago</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(summary.averageAmount)}
              </p>
            </div>
            <FiCalendar className="text-3xl text-blue-400" />
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
                placeholder="Buscar por email o ID de transacción..."
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
            <option value="approved">Aprobados</option>
            <option value="pending">Pendientes</option>
            <option value="rejected">Rechazados</option>
            <option value="refunded">Reembolsados</option>
          </select>

          {/* Filtro por fechas */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            placeholder="Desde"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            placeholder="Hasta"
          />

          {/* Limpiar filtros */}
          {(filters.status || filters.search || filters.dateFrom || filters.dateTo) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          )}

          {/* Exportar */}
          <button
            onClick={exportPayments}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center transition-colors"
          >
            <FiDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabla de pagos */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">ID Transacción</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Usuario</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Plan</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Monto</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Estado</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Método</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Fecha</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-white font-mono text-sm">
                        {payment.mercadopago_payment_id || payment.transaction_id}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white">{payment.user_name || 'Sin nombre'}</p>
                        <p className="text-gray-400 text-sm">{payment.user_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-purple-400">{payment.plan_name}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-green-400 font-medium">
                        {formatCurrency(payment.amount)}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {payment.payment_method || 'MercadoPago'}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {formatDate(payment.transaction_date)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewPaymentDetails(payment.id)}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <FiEye />
                        </button>
                        {payment.status === 'approved' && !payment.refunded_at && (
                          <button
                            onClick={() => handleRefundPayment(payment.id)}
                            className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                            title="Reembolsar"
                          >
                            <FiRefreshCw />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    No se encontraron pagos
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

      {/* Modal de detalles del pago */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Detalles del Pago</h2>
            
            <div className="space-y-4">
              {/* Información del pago */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">ID de Transacción</p>
                  <p className="text-white font-mono">
                    {selectedPayment.payment.mercadopago_payment_id || selectedPayment.payment.transaction_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID de Pago Interno</p>
                  <p className="text-white">{selectedPayment.payment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Monto</p>
                  <p className="text-green-400 text-xl font-bold">
                    {formatCurrency(selectedPayment.payment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estado</p>
                  <div className="mt-1">{getStatusBadge(selectedPayment.payment.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Método de Pago</p>
                  <p className="text-white">{selectedPayment.payment.payment_method || 'MercadoPago'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fecha de Transacción</p>
                  <p className="text-white">{formatDate(selectedPayment.payment.transaction_date)}</p>
                </div>
              </div>

              {/* Información del usuario */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-medium text-white mb-2">Información del Usuario</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nombre</p>
                    <p className="text-white">
                      {selectedPayment.user.first_name} {selectedPayment.user.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{selectedPayment.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID de Usuario</p>
                    <p className="text-white">{selectedPayment.user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tipo de Usuario</p>
                    <p className="text-white capitalize">{selectedPayment.user.user_type}</p>
                  </div>
                </div>
              </div>

              {/* Información de la suscripción */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-medium text-white mb-2">Información de la Suscripción</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Plan</p>
                    <p className="text-white">{selectedPayment.subscription.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tipo de Plan</p>
                    <p className="text-white">{selectedPayment.subscription.plan_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Estado de Suscripción</p>
                    <p className="text-white">{selectedPayment.subscription.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID de Suscripción</p>
                    <p className="text-white">{selectedPayment.subscription.id}</p>
                  </div>
                </div>
              </div>

              {/* Información de MercadoPago */}
              {selectedPayment.mercadopagoInfo && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-2">Información de MercadoPago</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">ID de Pago</p>
                      <p className="text-white">{selectedPayment.mercadopagoInfo.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Estado en MP</p>
                      <p className="text-white">{selectedPayment.mercadopagoInfo.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Tipo de Operación</p>
                      <p className="text-white">{selectedPayment.mercadopagoInfo.operation_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Descripción</p>
                      <p className="text-white">{selectedPayment.mercadopagoInfo.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de reembolso */}
              {selectedPayment.payment.refunded_at && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-2">Información de Reembolso</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Fecha de Reembolso</p>
                      <p className="text-white">{formatDate(selectedPayment.payment.refunded_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Monto Reembolsado</p>
                      <p className="text-red-400">{formatCurrency(selectedPayment.payment.refund_amount)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {selectedPayment.payment.status === 'approved' && !selectedPayment.payment.refunded_at && (
                <button
                  onClick={() => handleRefundPayment(selectedPayment.payment.id)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                >
                  Reembolsar Pago
                </button>
              )}
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
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

export default AdminPayments;