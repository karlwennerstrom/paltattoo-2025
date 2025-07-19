import React, { useState, useEffect } from 'react';
import { 
  FiImage, 
  FiUpload, 
  FiTrash2, 
  FiEdit, 
  FiPlus, 
  FiRefreshCw,
  FiEye,
  FiHeart,
  FiStar,
  FiX
} from 'react-icons/fi';
import { portfolioService, fileService } from '../../../services/api';
import toast from 'react-hot-toast';

const ArtistPortfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    tags: '',
    file: null
  });

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, using mock data');
      }
      
      // Mock portfolio data
      const mockPortfolio = [
        {
          id: 1,
          title: 'Tatuaje Realism',
          description: 'Retrato realista en blanco y negro',
          image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRhdHVhamUgMTwvdGV4dD48L3N2Zz4=',
          views: 245,
          likes: 28,
          is_featured: true,
          created_at: '2024-01-10T12:00:00Z'
        },
        {
          id: 2,
          title: 'Mandala Geométrico',
          description: 'Diseño mandala con patrones geométricos',
          image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRhdHVhamUgMjwvdGV4dD48L3N2Zz4=',
          views: 189,
          likes: 15,
          is_featured: false,
          created_at: '2024-01-08T10:30:00Z'
        },
        {
          id: 3,
          title: 'Rosa Traditional',
          description: 'Rosa estilo tradicional americano',
          image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRhdHVhamUgMzwvdGV4dD48L3N2Zz4=',
          views: 156,
          likes: 22,
          is_featured: false,
          created_at: '2024-01-05T15:45:00Z'
        }
      ];

      const response = await portfolioService.getAll().catch((error) => {
        console.log('Portfolio API error:', error.response?.status || error.message);
        // Only use mock data if not authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('Using mock portfolio data - no auth token');
          return { data: mockPortfolio };
        }
        // If authenticated but API failed, return empty array
        console.log('API failed but user is authenticated, returning empty portfolio');
        return { data: [] };
      });
      
      setPortfolioItems(response.data || []);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast.error('Error al cargar el portafolio');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('El archivo no puede superar los 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }
      setNewItem({ ...newItem, file });
    }
  };

  const handleUpload = async () => {
    if (!newItem.file || !newItem.title.trim()) {
      toast.error('El título y la imagen son obligatorios');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Debes estar autenticado para subir imágenes');
      return;
    }

    try {
      setUploading(true);
      
      // Create portfolio item
      const portfolioData = {
        title: newItem.title,
        description: newItem.description,
        tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        file: newItem.file
      };

      await portfolioService.create(portfolioData);
      
      toast.success('Imagen añadida al portafolio');
      setShowUploadModal(false);
      setNewItem({ title: '', description: '', tags: '', file: null });
      loadPortfolio();

    } catch (error) {
      console.error('Error uploading to portfolio:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Debes estar autenticado para eliminar imágenes');
      return;
    }

    try {
      await portfolioService.delete(itemId);
      toast.success('Imagen eliminada del portafolio');
      loadPortfolio();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  const toggleFeatured = async (itemId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Debes estar autenticado para destacar imágenes');
      return;
    }

    try {
      await portfolioService.toggleFeatured(itemId);
      toast.success('Estado de destacado actualizado');
      loadPortfolio();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Error al cambiar el estado de destacado');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Portafolio</h2>
          <p className="text-gray-400 mt-1">Gestiona tu portafolio de trabajos ({portfolioItems.length} imágenes)</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadPortfolio}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Añadir Imagen</span>
          </button>
        </div>
      </div>

      {/* Portfolio Grid */}
      {portfolioItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolioItems.map((item) => (
            <div key={item.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group">
              <div className="relative aspect-square">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleFeatured(item.id)}
                      className={`p-2 rounded-full transition-colors ${
                        item.is_featured 
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                      title={item.is_featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      <FiStar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Eliminar imagen"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.is_featured && (
                  <div className="absolute top-2 right-2">
                    <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium mb-1 truncate">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <FiEye className="w-3 h-3" />
                      <span>{item.views || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiHeart className="w-3 h-3" />
                      <span>{item.likes || 0}</span>
                    </div>
                  </div>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12">
          <div className="text-center">
            <FiImage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No hay imágenes en tu portafolio</h3>
            <p className="text-gray-500 mb-6">Añade tu primera imagen para mostrar tu trabajo</p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Añadir Primera Imagen</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Añadir Nueva Imagen</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-500"
                  placeholder="Título del trabajo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-500"
                  rows="3"
                  placeholder="Descripción del trabajo (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={newItem.tags}
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-500"
                  placeholder="realism, blackwork, etc. (separados por comas)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagen *
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="portfolio-upload"
                  />
                  <label htmlFor="portfolio-upload" className="cursor-pointer">
                    <FiUpload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      {newItem.file ? newItem.file.name : 'Haz clic para seleccionar una imagen'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">JPG, PNG, GIF hasta 5MB</p>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !newItem.file || !newItem.title.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading && <FiRefreshCw className="w-4 h-4 animate-spin" />}
                <span>{uploading ? 'Subiendo...' : 'Añadir Imagen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistPortfolio;