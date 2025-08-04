import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiCheck,
  FiX
} from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminShops = () => {
  const [shops, setShops] = useState([]);
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
  const [selectedShop, setSelectedShop] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shopToDelete, setShopToDelete] = useState(null);

  useEffect(() => {
    fetchShops();
  }, [filters, pagination.page]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      };

      const response = await api.get('/admin/shops', { params });
      setShops(response.data.data.shops);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
      
      // Mostrar mensaje si no hay tiendas
      if (response.data.data.shops.length === 0 && !filters.search && !filters.status) {
        setError('La funcionalidad de tiendas no está implementada en esta versión');
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      setError('La funcionalidad de tiendas no está disponible actualmente');
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

  const viewShopDetails = async (shopId) => {
    try {
      const response = await api.get(`/admin/shops/${shopId}`);
      setSelectedShop(response.data.data);
      setShowShopModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles de la tienda');
    }
  };

  const handleToggleShopStatus = async (shopId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/admin/shops/${shopId}/status`, { status: newStatus });
      toast.success(`Tienda ${newStatus === 'active' ? 'activada' : 'desactivada'} exitosamente`);
      fetchShops();
    } catch (error) {
      toast.error('Error al cambiar el estado de la tienda');
    }
  };

  const handleToggleVerification = async (shopId, currentVerified) => {
    try {
      await api.patch(`/admin/shops/${shopId}/verify`, { verified: !currentVerified });
      toast.success(`Tienda ${!currentVerified ? 'verificada' : 'desverificada'} exitosamente`);
      fetchShops();
      if (showShopModal && selectedShop?.shop.id === shopId) {
        viewShopDetails(shopId);
      }
    } catch (error) {
      toast.error('Error al cambiar la verificación de la tienda');
    }
  };

  const confirmDeleteShop = (shop) => {
    setShopToDelete(shop);
    setShowDeleteModal(true);
  };

  const handleDeleteShop = async () => {
    try {
      await api.delete(`/admin/shops/${shopToDelete.id}`);
      toast.success('Tienda eliminada exitosamente');
      setShowDeleteModal(false);
      setShopToDelete(null);
      fetchShops();
    } catch (error) {
      toast.error('Error al eliminar la tienda');
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

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { bg: 'bg-green-900', text: 'text-green-300', label: 'Activa' },
      inactive: { bg: 'bg-red-900', text: 'text-red-300', label: 'Inactiva' },
      suspended: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Suspendida' }
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

  if (loading && shops.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando tiendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Gestión de Tiendas</h1>
        <p className="text-gray-400">
          {pagination.total} tiendas de tatuajes
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
                placeholder="Buscar por nombre o dirección..."
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
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
            <option value="verified">Verificadas</option>
            <option value="not_verified">No verificadas</option>
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

      {/* Tabla de tiendas */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Tienda</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Propietario</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Estado</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Verificación</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Ubicación</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Artistas</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Creada</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shops.length > 0 ? (
                shops.map((shop, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {shop.logo_url ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL}${shop.logo_url}`}
                            alt={shop.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <span className="text-gray-400 text-sm">
                              {shop.name ? shop.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{shop.name}</p>
                          <p className="text-gray-400 text-sm line-clamp-1">{shop.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-white">{shop.owner_name || 'Sin nombre'}</p>
                        <p className="text-gray-400 text-sm">{shop.owner_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(shop.status)}
                    </td>
                    <td className="py-4 px-6">
                      {shop.is_verified ? (
                        <span className="flex items-center text-green-400">
                          <FiCheck className="mr-1" /> Verificada
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <FiX className="mr-1" /> No verificada
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      <div className="flex items-center">
                        <FiMapPin className="mr-1 text-sm" />
                        {shop.city || 'Sin ubicación'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-purple-400 font-medium">
                        {shop.artist_count || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {formatDate(shop.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewShopDetails(shop.id)}
                          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleToggleShopStatus(shop.id, shop.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            shop.status === 'active'
                              ? 'bg-orange-600 hover:bg-orange-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title={shop.status === 'active' ? 'Desactivar' : 'Activar'}
                        >
                          {shop.status === 'active' ? <FiX /> : <FiCheck />}
                        </button>
                        <button
                          onClick={() => confirmDeleteShop(shop)}
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
                    No se encontraron tiendas
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

      {/* Modal de detalles de la tienda */}
      {showShopModal && selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Detalles de la Tienda</h2>
            
            <div className="space-y-6">
              {/* Información básica */}
              <div className="flex items-start space-x-4">
                {selectedShop.shop.logo_url ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}${selectedShop.shop.logo_url}`}
                    alt={selectedShop.shop.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">
                      {selectedShop.shop.name ? selectedShop.shop.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">{selectedShop.shop.name}</h3>
                  <p className="text-gray-400 mb-2">{selectedShop.shop.description}</p>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(selectedShop.shop.status)}
                    {selectedShop.shop.is_verified ? (
                      <span className="flex items-center text-green-400">
                        <FiCheck className="mr-1" /> Verificada
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleVerification(selectedShop.shop.id, false)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                      >
                        Verificar Tienda
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">ID</p>
                  <p className="text-white">{selectedShop.shop.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Dirección</p>
                  <p className="text-white">{selectedShop.shop.address || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Ciudad</p>
                  <p className="text-white">{selectedShop.shop.city || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Teléfono</p>
                  <p className="text-white">{selectedShop.shop.phone || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{selectedShop.shop.email || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Sitio web</p>
                  <p className="text-white">
                    {selectedShop.shop.website ? (
                      <a href={selectedShop.shop.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                        {selectedShop.shop.website}
                      </a>
                    ) : (
                      'No especificado'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Instagram</p>
                  <p className="text-white">
                    {selectedShop.shop.instagram ? (
                      <a href={`https://instagram.com/${selectedShop.shop.instagram}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                        @{selectedShop.shop.instagram}
                      </a>
                    ) : (
                      'No especificado'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fecha de creación</p>
                  <p className="text-white">{formatDate(selectedShop.shop.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Última actualización</p>
                  <p className="text-white">{formatDate(selectedShop.shop.updated_at)}</p>
                </div>
              </div>

              {/* Información del propietario */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-medium text-white mb-2">Información del Propietario</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nombre</p>
                    <p className="text-white">{selectedShop.owner.first_name} {selectedShop.owner.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{selectedShop.owner.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID de usuario</p>
                    <p className="text-white">{selectedShop.owner.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Registro</p>
                    <p className="text-white">{formatDate(selectedShop.owner.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Artistas asociados */}
              {selectedShop.artists && selectedShop.artists.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-2">
                    Artistas Asociados ({selectedShop.artists.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedShop.artists.map((artist, idx) => (
                      <div key={idx} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{artist.name}</p>
                            <p className="text-gray-400 text-sm">{artist.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Experiencia: {artist.experience_years} años</p>
                            <p className="text-gray-400 text-sm">Desde: {formatDate(artist.joined_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imágenes de la tienda */}
              {selectedShop.shop.cover_image_url && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-2">Imagen de Portada</h4>
                  <img
                    src={`${process.env.REACT_APP_API_URL}${selectedShop.shop.cover_image_url}`}
                    alt="Portada"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {selectedShop.shop.is_verified && (
                <button
                  onClick={() => handleToggleVerification(selectedShop.shop.id, true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                >
                  Quitar Verificación
                </button>
              )}
              <button
                onClick={() => {
                  setShowShopModal(false);
                  setSelectedShop(null);
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
      {showDeleteModal && shopToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar la tienda "{shopToDelete.name}"? 
              Esta acción eliminará todos los datos asociados y no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setShopToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteShop}
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

export default AdminShops;