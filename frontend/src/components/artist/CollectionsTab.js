import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { getTattooImageUrl } from '../../utils/imageHelpers';
import { portfolioService, collectionService } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiFolder, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiImage, 
  FiMove, 
  FiEyeOff, 
  FiEye,
  FiGrid,
  FiSettings,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';

const CollectionsTab = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [viewingCollection, setViewingCollection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageImagesModal, setShowManageImagesModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: true,
    coverImageId: null
  });

  useEffect(() => {
    loadCollections();
    loadPortfolioItems();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionService.getAll('my');
      const collectionsData = response.data?.collections || [];
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading collections:', error);
      // Check if API endpoint exists
      if (error.response?.status === 404 || error.response?.data?.error === "Endpoint no encontrado") {
        setApiAvailable(false);
        setCollections([]);
        toast.error('Las colecciones están en desarrollo - funcionalidad próximamente disponible');
      } else {
        // Fall back to mock data for other errors
        const mockCollections = [
          {
            id: 1,
            name: 'Retratos',
            description: 'Colección de mis mejores trabajos de retratos realistas',
            image_count: 8,
            is_public: true,
            cover_image_url: null,
            created_at: '2024-01-15'
          },
          {
            id: 2,
            name: 'Geométricos',
            description: 'Diseños geométricos y mandalas',
            image_count: 12,
            is_public: true,
            cover_image_url: null,
            created_at: '2024-01-10'
          }
        ];
        setCollections(mockCollections);
        toast.error('Error al cargar colecciones - mostrando datos de ejemplo');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioItems = async () => {
    try {
      const response = await portfolioService.getAll('my');
      const items = response.data?.items || [];
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio items:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (!apiAvailable) {
      toast.error('Las colecciones están en desarrollo - funcionalidad no disponible');
      return;
    }

    if (!newCollection.name.trim()) {
      toast.error('El nombre de la colección es obligatorio');
      return;
    }

    try {
      const response = await collectionService.create({
        name: newCollection.name,
        description: newCollection.description,
        is_public: newCollection.isPublic,
        cover_image_id: newCollection.coverImageId
      });

      const createdCollection = response.data;
      setCollections(prev => [...prev, createdCollection]);
      toast.success('Colección creada exitosamente');
      setShowCreateModal(false);
      setNewCollection({ name: '', description: '', isPublic: true, coverImageId: null });
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Error al crear colección');
    }
  };

  const handleUpdateCollection = async () => {
    if (!apiAvailable) {
      toast.error('Las colecciones están en desarrollo - funcionalidad no disponible');
      return;
    }
    
    try {
      const response = await collectionService.update(selectedCollection.id, {
        name: newCollection.name,
        description: newCollection.description,
        is_public: newCollection.isPublic,
        cover_image_id: newCollection.coverImageId
      });

      const updatedCollection = response.data;
      setCollections(prev => prev.map(c => 
        c.id === selectedCollection.id 
          ? updatedCollection
          : c
      ));
      
      toast.success('Colección actualizada exitosamente');
      setShowEditModal(false);
      setSelectedCollection(null);
      setNewCollection({ name: '', description: '', isPublic: true, coverImageId: null });
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Error al actualizar colección');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!apiAvailable) {
      toast.error('Las colecciones están en desarrollo - funcionalidad no disponible');
      return;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta colección? Las imágenes no se eliminarán, solo se removerán de la colección.')) {
      return;
    }

    try {
      await collectionService.delete(collectionId);
      setCollections(prev => prev.filter(c => c.id !== collectionId));
      toast.success('Colección eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Error al eliminar colección');
    }
  };

  const handleToggleVisibility = async (collectionId) => {
    try {
      const collection = collections.find(c => c.id === collectionId);
      const response = await collectionService.update(collectionId, {
        is_public: !collection.is_public
      });

      const updatedCollection = response.data;
      setCollections(prev => prev.map(c => 
        c.id === collectionId 
          ? updatedCollection
          : c
      ));
      
      toast.success(`Colección ${collection?.is_public ? 'ocultada' : 'publicada'} exitosamente`);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Error al cambiar visibilidad');
    }
  };

  const openEditModal = (collection) => {
    setSelectedCollection(collection);
    setNewCollection({
      name: collection.name,
      description: collection.description || '',
      isPublic: collection.is_public,
      coverImageId: collection.cover_image_id
    });
    setShowEditModal(true);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Mis Colecciones</h1>
          <p className="text-primary-400">Organiza tu portfolio en colecciones temáticas</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="ghost" onClick={loadCollections} disabled={loading}>
            <svg className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus className="h-5 w-5 mr-2" />
            Nueva Colección
          </Button>
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <Grid cols={3} gap={6}>
          {collections.map((collection) => (
            <Card key={collection.id} className="group overflow-hidden">
              {/* Collection Cover */}
              <div className="aspect-video bg-primary-800 relative overflow-hidden">
                {collection.cover_image_url ? (
                  <img
                    src={getTattooImageUrl(collection.cover_image_url)}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FiFolder className="h-12 w-12 text-primary-600" />
                  </div>
                )}
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewingCollection(collection)}
                      className="p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
                      title="Ver colección"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowManageImagesModal(collection)}
                      className="p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
                      title="Gestionar imágenes"
                    >
                      <FiGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(collection)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="Editar"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status badges */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {!collection.is_public && (
                    <div className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
                      Privada
                    </div>
                  )}
                </div>
              </div>

              {/* Collection Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-primary-100 mb-1">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-primary-400 mb-3 line-clamp-2">{collection.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-primary-500">
                    <FiImage className="h-4 w-4" />
                    <span>{collection.image_count} imagen{collection.image_count !== 1 ? 'es' : ''}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleVisibility(collection.id)}
                      className={twMerge(
                        'p-1.5 rounded transition-colors',
                        collection.is_public
                          ? 'text-primary-400 hover:text-primary-200'
                          : 'text-yellow-500 hover:text-yellow-400'
                      )}
                      title={collection.is_public ? 'Ocultar colección' : 'Hacer pública'}
                    >
                      {collection.is_public ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded transition-colors"
                      title="Eliminar colección"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      ) : (
        <div className="bg-primary-800 rounded-xl border border-primary-700 p-12">
          <div className="text-center">
            <FiFolder className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-300 mb-2">No tienes colecciones aún</h3>
            <p className="text-primary-500 mb-6">Organiza tu portfolio creando colecciones temáticas</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus className="w-4 h-4 mr-2" />
              Crear Primera Colección
            </Button>
          </div>
        </div>
      )}

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewCollection({ name: '', description: '', isPublic: true, coverImageId: null });
        }}
        title="Crear Nueva Colección"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la colección *"
            value={newCollection.name}
            onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Retratos, Geométricos, Tradicionales..."
          />

          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              Descripción
            </label>
            <textarea
              value={newCollection.description}
              onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el tipo de trabajos que incluirás en esta colección..."
              rows={3}
              className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newCollection.isPublic}
              onChange={(e) => setNewCollection(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
            />
            <span className="text-sm text-primary-300">Colección pública (visible para otros usuarios)</span>
          </label>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setNewCollection({ name: '', description: '', isPublic: true, coverImageId: null });
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateCollection}>
              Crear Colección
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Collection Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCollection(null);
          setNewCollection({ name: '', description: '', isPublic: true, coverImageId: null });
        }}
        title="Editar Colección"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la colección *"
            value={newCollection.name}
            onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Retratos, Geométricos, Tradicionales..."
          />

          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              Descripción
            </label>
            <textarea
              value={newCollection.description}
              onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el tipo de trabajos que incluirás en esta colección..."
              rows={3}
              className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newCollection.isPublic}
              onChange={(e) => setNewCollection(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
            />
            <span className="text-sm text-primary-300">Colección pública (visible para otros usuarios)</span>
          </label>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowEditModal(false);
                setSelectedCollection(null);
                setNewCollection({ name: '', description: '', isPublic: true, coverImageId: null });
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleUpdateCollection}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CollectionsTab;