import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiUser
} from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, [filters, pagination.page]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      };

      const response = await api.get('/admin/offers', { params });
      setOffers(response.data.data.offers);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Error al cargar ofertas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const viewOfferDetails = async (offerId) => {
    try {
      const response = await api.get(`/admin/offers/${offerId}`);
      setSelectedOffer(response.data.data);
      setShowOfferModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles de la oferta');
    }
  };

  const confirmDeleteOffer = (offer) => {
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const handleDeleteOffer = async () => {
    try {
      await api.delete(`/admin/offers/${offerToDelete.id}`);
      toast.success('Oferta eliminada exitosamente');
      setShowDeleteModal(false);
      setOfferToDelete(null);
      fetchOffers();
    } catch (error) {
      toast.error('Error al eliminar la oferta');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
      open: { bg: 'bg-green-900', text: 'text-green-300', label: 'Abierta' },
      in_progress: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'En Progreso' },
      completed: { bg: 'bg-blue-900', text: 'text-blue-300', label: 'Completada' },
      cancelled: { bg: 'bg-red-900', text: 'text-red-300', label: 'Cancelada' }
    };
    
    const statusInfo = statusMap[status] || statusMap.open;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading && offers.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Gestión de Ofertas</h1>
        <p className="text-gray-400">
          {pagination.total} ofertas de tatuajes
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
                placeholder="Buscar por título o descripción..."
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
            <option value="open">Abiertas</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>

          {/* Limpiar filtros */}
          {(filters.status || filters.search) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de ofertas */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Oferta</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Cliente</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Estado</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Presupuesto</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Ubicación</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Propuestas</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Fecha</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {offers.length > 0 ? (
                offers.map((offer, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white font-medium line-clamp-1">{offer.title}</p>
                        <p className="text-gray-400 text-sm line-clamp-1">{offer.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white">{offer.user_name || 'Sin nombre'}</p>
                        <p className="text-gray-400 text-sm">{offer.user_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-purple-400 font-medium">
                          {formatCurrency(offer.budget_min)} - {formatCurrency(offer.budget_max)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      <div className="flex items-center">
                        <FiMapPin className="mr-1 text-sm" />
                        {offer.body_part}, {offer.style}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-purple-400 font-medium">
                        {offer.proposal_count || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {formatDate(offer.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewOfferDetails(offer.id)}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => confirmDeleteOffer(offer)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    No se encontraron ofertas
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

      {/* Modal de detalles de la oferta */}
      {showOfferModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Detalles de la Oferta</h2>
            
            <div className="space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-medium text-white mb-2">{selectedOffer.offer.title}</h3>
                <p className="text-gray-400">{selectedOffer.offer.description}</p>
                <div className="mt-2">{getStatusBadge(selectedOffer.offer.status)}</div>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">ID</p>
                  <p className="text-white">{selectedOffer.offer.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Presupuesto</p>
                  <p className="text-white">
                    {formatCurrency(selectedOffer.offer.budget_min)} - {formatCurrency(selectedOffer.offer.budget_max)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Parte del cuerpo</p>
                  <p className="text-white">{selectedOffer.offer.body_part || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estilo</p>
                  <p className="text-white">{selectedOffer.offer.style || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tipo de color</p>
                  <p className="text-white">{selectedOffer.offer.color_type || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Descripción del tamaño</p>
                  <p className="text-white">{selectedOffer.offer.size_description || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fecha de creación</p>
                  <p className="text-white">{formatDate(selectedOffer.offer.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fecha límite</p>
                  <p className="text-white">{formatDate(selectedOffer.offer.deadline)}</p>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-medium text-white mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nombre</p>
                    <p className="text-white">{selectedOffer.user.first_name} {selectedOffer.user.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{selectedOffer.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tipo de usuario</p>
                    <p className="text-white">{selectedOffer.user.user_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Registro</p>
                    <p className="text-white">{formatDate(selectedOffer.user.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Imágenes de referencia */}
              {selectedOffer.referenceImages && selectedOffer.referenceImages.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-2">Imágenes de Referencia</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedOffer.referenceImages.map((image, idx) => (
                      <img
                        key={idx}
                        src={`${process.env.REACT_APP_API_URL}${image.image_url}`}
                        alt={`Referencia ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Propuestas */}
              {selectedOffer.proposals && selectedOffer.proposals.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-2">
                    Propuestas ({selectedOffer.proposals.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedOffer.proposals.map((proposal, idx) => (
                      <div key={idx} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{proposal.artist_name}</p>
                            <p className="text-gray-400 text-sm">{proposal.message}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-purple-400 font-medium">{formatCurrency(proposal.price)}</p>
                            <p className="text-gray-400 text-sm">{formatDate(proposal.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setSelectedOffer(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && offerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar la oferta "{offerToDelete.title}"? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setOfferToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteOffer}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffers;