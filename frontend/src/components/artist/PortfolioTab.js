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
  FiImage, 
  FiFolder, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiArrowLeft,
  FiGrid,
  FiList,
  FiStar,
  FiEye,
  FiEyeOff 
} from 'react-icons/fi';

const PortfolioTab = () => {
  // View states
  const [currentView, setCurrentView] = useState('collections'); // 'collections' | 'collection-detail'
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Data states
  const [collections, setCollections] = useState([]);
  const [collectionImages, setCollectionImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  
  // Form states
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    category: '',
    file: null,
    preview: null,
    featured: false
  });

  const styleOptions = [
    'Realista', 'Tradicional', 'Neo-tradicional', 'Blackwork',
    'Dotwork', 'Acuarela', 'Japonés', 'Tribal', 'Minimalista',
    'Geométrico', 'Biomecánico', 'New School', 'Old School',
    'Black & Grey', 'Color', 'Lettering', 'Ornamental'
  ];

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadCollectionImages(selectedCollection.id);
    }
  }, [selectedCollection]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionService.getAll('my');
      const collectionsData = response.data?.collections || [];
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error('Error al cargar colecciones');
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionImages = async (collectionId) => {
    try {
      setLoading(true);
      const response = await collectionService.getById(collectionId);
      const images = response.data?.images || [];
      setCollectionImages(images);
    } catch (error) {
      console.error('Error loading collection images:', error);
      toast.error('Error al cargar imágenes de la colección');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      toast.error('El nombre de la colección es obligatorio');
      return;
    }

    try {
      const response = await collectionService.create({
        name: newCollection.name,
        description: newCollection.description,
        isPublic: newCollection.isPublic
      });

      const newCollectionData = response.data.data || response.data.collection;
      console.log('New collection response:', response.data);
      
      if (newCollectionData && newCollectionData.id) {
        setCollections(prev => [...prev, newCollectionData]);
      } else {
        console.error('Invalid collection data received:', newCollectionData);
        // Reload collections to ensure consistency
        loadCollections();
      }
      toast.success('Colección creada exitosamente');
      setShowCreateCollectionModal(false);
      setNewCollection({ name: '', description: '', isPublic: true });
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Error al crear colección');
    }
  };

  const handleUpdateCollection = async () => {
    if (!newCollection.name.trim()) {
      toast.error('El nombre de la colección es obligatorio');
      return;
    }

    try {
      const updateData = {
        name: newCollection.name,
        description: newCollection.description,
        isPublic: newCollection.isPublic
      };
      
      console.log('Updating collection with data:', updateData);
      console.log('Collection ID:', selectedCollection.id);
      
      const response = await collectionService.update(selectedCollection.id, updateData);
      
      const updatedCollectionData = response.data.data || response.data.collection;
      console.log('Update collection response:', response.data);

      setCollections(prev => prev.map(c => 
        c.id === selectedCollection.id ? updatedCollectionData : c
      ));
      
      setSelectedCollection(updatedCollectionData);
      toast.success('Colección actualizada exitosamente');
      setShowEditCollectionModal(false);
      setNewCollection({ name: '', description: '', isPublic: true });
    } catch (error) {
      console.error('Error updating collection:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(detail => detail.message).join(', ');
        toast.error(`Error al actualizar colección: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.error || 'Error al actualizar colección');
      }
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    const collection = collections.find(c => c.id === collectionId);
    
    if (collection && (collection.sort_order === 0 || collection.name === 'Mi Portfolio')) {
      toast.error('No se puede eliminar la colección por defecto');
      return;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta colección? Las imágenes se moverán a tu colección principal.')) {
      return;
    }

    try {
      await collectionService.delete(collectionId);
      setCollections(prev => prev.filter(c => c.id !== collectionId));
      
      if (selectedCollection?.id === collectionId) {
        setCurrentView('collections');
        setSelectedCollection(null);
      }
      
      toast.success('Colección eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar colección');
    }
  };

  const handleAddImage = async () => {
    if (!newImage.file) {
      toast.error('La imagen es obligatoria');
      return;
    }

    try {
      const formData = {
        title: newImage.title || 'Sin título',
        description: newImage.description,
        category: newImage.category,
        file: newImage.file,
        isFeatured: newImage.featured
      };

      await portfolioService.create(formData);
      toast.success('Imagen agregada exitosamente');
      
      // Reload collection images to show the new one
      if (selectedCollection) {
        loadCollectionImages(selectedCollection.id);
      }
      
      setShowAddImageModal(false);
      setNewImage({
        title: '',
        description: '',
        category: '',
        file: null,
        preview: null,
        featured: false
      });
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error('Error al agregar imagen');
    }
  };

  const handleEditImage = async () => {
    if (!editingImage) return;

    try {
      const updateData = {
        title: newImage.title || 'Sin título',
        description: newImage.description,
        category: newImage.category,
        isFeatured: newImage.featured
      };

      await portfolioService.update(editingImage.id, updateData);
      toast.success('Imagen actualizada exitosamente');
      
      // Reload collection images
      if (selectedCollection) {
        loadCollectionImages(selectedCollection.id);
      }
      
      setShowEditImageModal(false);
      setEditingImage(null);
      setNewImage({
        title: '',
        description: '',
        category: '',
        file: null,
        preview: null,
        featured: false
      });
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Error al actualizar imagen');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewImage(prev => ({ ...prev, file: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImage(prev => ({ ...prev, preview: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop functionality
  const [draggedImageId, setDraggedImageId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);

  const handleDragStart = (e, imageId, index = null) => {
    e.dataTransfer.setData('text/plain', imageId.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedImageId(imageId);
    if (index !== null) {
      setDraggedImageIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedImageId(null);
    setDropTargetId(null);
    setDraggedImageIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, collectionId) => {
    e.preventDefault();
    setDropTargetId(collectionId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTargetId(null);
    }
  };

  const handleDrop = async (e, targetCollectionId, targetIndex = null) => {
    e.preventDefault();
    const imageId = e.dataTransfer.getData('text/plain');
    
    setDropTargetId(null);
    setDraggedImageId(null);
    setDropTargetIndex(null);
    setDraggedImageIndex(null);
    
    if (!imageId || !targetCollectionId) return;
    
    try {
      // If we're reordering within the same collection and have valid indices
      if (targetCollectionId === selectedCollection?.id && 
          draggedImageIndex !== null && 
          targetIndex !== null && 
          draggedImageIndex !== targetIndex) {
        
        // Create new order array
        const newImages = [...collectionImages];
        const draggedImage = newImages[draggedImageIndex];
        
        // Remove dragged image from its current position
        newImages.splice(draggedImageIndex, 1);
        
        // Insert at new position
        newImages.splice(targetIndex, 0, draggedImage);
        
        // Create the order array for the API
        const imageOrders = newImages.map((img, index) => ({
          imageId: img.id,
          sortOrder: index
        }));
        
        // Update the order in the API
        await collectionService.reorderImages(selectedCollection.id, imageOrders);
        
        // Update local state immediately for responsiveness
        setCollectionImages(newImages);
        toast.success('Orden de imágenes actualizado');
        
      } else {
        // Moving to a different collection
        await collectionService.addImage(targetCollectionId, parseInt(imageId));
        toast.success('Imagen agregada a la colección');
        
        // Reload current collection if we're in collection detail view
        if (selectedCollection && currentView === 'collection-detail') {
          loadCollectionImages(selectedCollection.id);
        }
        
        // Reload collections to update image counts
        loadCollections();
      }
    } catch (error) {
      console.error('Error moving/reordering image:', error);
      if (error.response?.status === 409) {
        toast.error('La imagen ya está en esa colección');
      } else {
        toast.error('Error al mover/reordenar la imagen');
      }
      
      // Reload collection images on error to restore correct state
      if (selectedCollection) {
        loadCollectionImages(selectedCollection.id);
      }
    }
  };

  const openEditCollectionModal = (collection) => {
    console.log('Opening edit modal for collection:', collection);
    setSelectedCollection(collection);
    setNewCollection({
      name: collection.name,
      description: collection.description || '',
      isPublic: Boolean(collection.is_public)
    });
    console.log('Setting newCollection state:', {
      name: collection.name,
      description: collection.description || '',
      isPublic: Boolean(collection.is_public)
    });
    setShowEditCollectionModal(true);
  };

  const openEditImageModal = (image) => {
    setEditingImage(image);
    setNewImage({
      title: image.title || '',
      description: image.description || '',
      category: image.style_name || '',
      file: null,
      preview: null,
      featured: image.is_featured || false
    });
    setShowEditImageModal(true);
  };

  const enterCollectionView = (collection) => {
    setSelectedCollection(collection);
    setCurrentView('collection-detail');
  };

  const backToCollections = () => {
    setCurrentView('collections');
    setSelectedCollection(null);
  };

  if (loading && collections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  // Collections overview view
  if (currentView === 'collections') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-primary-100">Mi Portfolio</h1>
            <p className="text-primary-400">Organiza tu trabajo en colecciones temáticas</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={loadCollections} disabled={loading}>
              <svg className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </Button>
            <Button variant="primary" onClick={() => setShowCreateCollectionModal(true)}>
              <FiPlus className="h-5 w-5 mr-2" />
              Nueva Colección
            </Button>
          </div>
        </div>

        {/* Drag & Drop Hint */}
        {draggedImageId && (
          <div className="bg-accent-500/20 border border-accent-500 rounded-lg p-4 mb-6">
            <p className="text-accent-100 text-sm flex items-center">
              <FiFolder className="h-4 w-4 mr-2" />
              {currentView === 'collection-detail' 
                ? 'Arrastra la imagen para cambiar su posición' 
                : 'Arrastra la imagen a cualquier colección para agregarla'}
            </p>
          </div>
        )}

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <Grid cols={3} gap={6}>
            {collections.filter(collection => collection && collection.id).map((collection) => (
              <Card 
                key={collection.id} 
                className={twMerge(
                  "group overflow-hidden transition-all duration-200",
                  dropTargetId === collection.id && draggedImageId ? "ring-2 ring-accent-500 bg-accent-500/10" : ""
                )}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, collection.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, collection.id)}
              >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          enterCollectionView(collection);
                        }}
                        className="p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
                        title="Ver colección"
                      >
                        <FiFolder className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCollectionModal(collection);
                        }}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Editar colección"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      {!(collection.sort_order === 0 || collection.name === 'Mi Portfolio') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id);
                          }}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          title="Eliminar colección"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {!collection.is_public && (
                      <div className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
                        Privada
                      </div>
                    )}
                    {(collection.sort_order === 0 || collection.name === 'Mi Portfolio') && (
                      <div className="px-2 py-1 bg-accent-600 text-white text-xs rounded">
                        Principal
                      </div>
                    )}
                  </div>
                </div>

                {/* Collection Info */}
                <div 
                  className="p-4 cursor-pointer hover:bg-primary-700/50 transition-colors"
                  onClick={() => enterCollectionView(collection)}
                >
                  <h3 className="text-lg font-semibold text-primary-100 mb-1">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-sm text-primary-400 mb-3 line-clamp-2">{collection.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-primary-500">
                      <FiImage className="h-4 w-4" />
                      <span>{collection.image_count || 0} imagen{(collection.image_count || 0) !== 1 ? 'es' : ''}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {collection.is_public ? (
                        <FiEye className="w-4 h-4 text-primary-400" title="Colección pública" />
                      ) : (
                        <FiEyeOff className="w-4 h-4 text-yellow-500" title="Colección privada" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        ) : (
          <div className="text-center py-12">
            <FiFolder className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <p className="text-primary-400 mb-4">No tienes colecciones aún</p>
            <p className="text-sm text-primary-500 mb-6">
              Crea tu primera colección para organizar tu portfolio
            </p>
            <Button onClick={() => setShowCreateCollectionModal(true)}>
              <FiPlus className="h-5 w-5 mr-2" />
              Crear Primera Colección
            </Button>
          </div>
        )}

        {/* Create Collection Modal */}
        <Modal
          isOpen={showCreateCollectionModal}
          onClose={() => {
            setShowCreateCollectionModal(false);
            setNewCollection({ name: '', description: '', isPublic: true });
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
                  setShowCreateCollectionModal(false);
                  setNewCollection({ name: '', description: '', isPublic: true });
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

      </div>
    );
  }

  // Individual collection view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={backToCollections}>
            <FiArrowLeft className="h-5 w-5 mr-2" />
            Volver a Colecciones
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary-100 flex items-center space-x-2">
              <span>{selectedCollection?.name}</span>
              {(selectedCollection?.sort_order === 0 || selectedCollection?.name === 'Mi Portfolio') && (
                <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded">Principal</span>
              )}
            </h1>
            <p className="text-primary-400">
              {selectedCollection?.description || 'Sin descripción'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="ghost" onClick={() => loadCollectionImages(selectedCollection.id)} disabled={loading}>
            <svg className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
          <Button variant="secondary" onClick={() => openEditCollectionModal(selectedCollection)}>
            <FiEdit2 className="h-5 w-5 mr-2" />
            Editar Colección
          </Button>
          <Button variant="primary" onClick={() => setShowAddImageModal(true)}>
            <FiPlus className="h-5 w-5 mr-2" />
            Agregar Imagen
          </Button>
        </div>
      </div>

      {/* Drag & Drop Hint */}
      {draggedImageId && (
        <div className="bg-accent-500/20 border border-accent-500 rounded-lg p-4 mb-6">
          <p className="text-accent-100 text-sm flex items-center">
            <FiFolder className="h-4 w-4 mr-2" />
            Arrastra la imagen para cambiar su posición en la colección
          </p>
        </div>
      )}

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-primary-400">
            {collectionImages.length} imagen{collectionImages.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-primary-400">Vista:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={twMerge(
              'p-2 rounded transition-colors',
              viewMode === 'grid' ? 'bg-accent-600 text-white' : 'bg-primary-700 text-primary-400 hover:text-primary-200'
            )}
          >
            <FiGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={twMerge(
              'p-2 rounded transition-colors',
              viewMode === 'list' ? 'bg-accent-600 text-white' : 'bg-primary-700 text-primary-400 hover:text-primary-200'
            )}
          >
            <FiList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Collection Images */}
      {collectionImages.length > 0 ? (
        viewMode === 'grid' ? (
          <Grid cols={3} gap={6}>
            {collectionImages.map((image, index) => (
              <div 
                key={image.id} 
                className={twMerge(
                  "card group relative overflow-hidden cursor-move transition-all duration-200",
                  draggedImageId === image.id ? "opacity-50 scale-95" : "",
                  dropTargetIndex === index ? "ring-2 ring-accent-500" : ""
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, image.id, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTargetIndex(index);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDropTargetIndex(null);
                  }
                }}
                onDrop={(e) => handleDrop(e, selectedCollection.id, index)}
              >
                {/* Featured Badge */}
                {image.is_featured && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-accent-600 text-white text-xs font-medium rounded">
                    Destacado
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 z-10 transition-opacity">
                  <div className="flex space-x-1 bg-black bg-opacity-80 rounded-lg p-1 shadow-lg">
                    <button
                      onClick={() => openEditImageModal(image)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Editar"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="aspect-square bg-primary-800 overflow-hidden">
                  <img
                    src={getTattooImageUrl(image.imageUrl || image.image_url)}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src, 'Image object:', image);
                      e.target.src = '/placeholder-tattoo.jpg';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-primary-100 mb-1">{image.title || 'Sin título'}</h3>
                  <p className="text-sm text-primary-400 mb-3 line-clamp-2">{image.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-primary-500 mb-3">
                    <span>{image.style_name || 'Sin estilo'}</span>
                    {image.is_featured && (
                      <FiStar className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Grid>
        ) : (
          /* List View */
          <div className="space-y-4">
            {collectionImages.map((image, index) => (
              <Card 
                key={image.id} 
                className={twMerge(
                  "p-4 cursor-move transition-all duration-200",
                  draggedImageId === image.id ? "opacity-50 scale-95" : "",
                  dropTargetIndex === index ? "ring-2 ring-accent-500" : ""
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, image.id, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTargetIndex(index);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDropTargetIndex(null);
                  }
                }}
                onDrop={(e) => handleDrop(e, selectedCollection.id, index)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={getTattooImageUrl(image.imageUrl || image.image_url)}
                    alt={image.title}
                    className="h-20 w-20 rounded-lg object-cover"
                    onError={(e) => {
                      console.error('List view image failed to load:', e.target.src);
                      e.target.src = '/placeholder-tattoo.jpg';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primary-100">{image.title || 'Sin título'}</h3>
                      <div className="flex items-center space-x-2">
                        {image.is_featured && (
                          <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-primary-400 mb-2">{image.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-primary-500">
                        <span>{image.style_name || 'Sin estilo'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditImageModal(image)}>
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <FiImage className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <p className="text-primary-400 mb-4">Esta colección no tiene imágenes aún</p>
          <p className="text-sm text-primary-500 mb-6">
            Agrega tus primeras imágenes para mostrar tu trabajo
          </p>
          <Button onClick={() => setShowAddImageModal(true)}>
            <FiPlus className="h-5 w-5 mr-2" />
            Agregar Primera Imagen
          </Button>
        </div>
      )}

      {/* Add Image Modal */}
      <Modal
        isOpen={showAddImageModal}
        onClose={() => {
          setShowAddImageModal(false);
          setNewImage({
            title: '',
            description: '',
            category: '',
            file: null,
            preview: null,
            featured: false
          });
        }}
        title="Agregar Nueva Imagen"
        size="lg"
      >
        <div className="space-y-4">
          <Grid cols={2} gap={4}>
            <Input
              label="Título"
              value={newImage.title}
              onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: León Realista"
            />
            <select
              value={newImage.category}
              onChange={(e) => setNewImage(prev => ({ ...prev, category: e.target.value }))}
              className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none"
            >
              <option value="">Seleccionar estilo</option>
              {styleOptions.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </Grid>

          <textarea
            value={newImage.description}
            onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción del trabajo..."
            rows={3}
            className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
          />

          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              Imagen *
            </label>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-primary-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-accent-600 file:text-white
                hover:file:bg-accent-700"
            />
            {newImage.preview && (
              <div className="mt-2">
                <img
                  src={newImage.preview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newImage.featured}
              onChange={(e) => setNewImage(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
            />
            <span className="text-sm text-primary-300">Marcar como imagen destacada</span>
          </label>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddImageModal(false);
                setNewImage({
                  title: '',
                  description: '',
                  category: '',
                  file: null,
                  preview: null,
                  featured: false
                });
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddImage}>
              Agregar Imagen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Image Modal */}
      <Modal
        isOpen={showEditImageModal}
        onClose={() => {
          setShowEditImageModal(false);
          setEditingImage(null);
          setNewImage({
            title: '',
            description: '',
            category: '',
            file: null,
            preview: null,
            featured: false
          });
        }}
        title="Editar Información de Imagen"
        size="lg"
      >
        <div className="space-y-4">
          <Grid cols={2} gap={4}>
            <Input
              label="Título"
              value={newImage.title}
              onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: León Realista"
            />
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Estilo
              </label>
              <select
                value={newImage.category}
                onChange={(e) => setNewImage(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none"
              >
                <option value="">Seleccionar estilo</option>
                {styleOptions.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </Grid>

          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              Descripción
            </label>
            <textarea
              value={newImage.description}
              onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del trabajo..."
              rows={3}
              className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newImage.featured}
              onChange={(e) => setNewImage(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
            />
            <span className="text-sm text-primary-300">Marcar como imagen destacada</span>
          </label>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowEditImageModal(false);
                setEditingImage(null);
                setNewImage({
                  title: '',
                  description: '',
                  category: '',
                  file: null,
                  preview: null,
                  featured: false
                });
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleEditImage}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Collection Modal */}
      {console.log('Edit Collection Modal - showEditCollectionModal:', showEditCollectionModal)}
      <Modal
        isOpen={showEditCollectionModal}
        onClose={() => {
          setShowEditCollectionModal(false);
          setNewCollection({ name: '', description: '', isPublic: true });
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
                setShowEditCollectionModal(false);
                setNewCollection({ name: '', description: '', isPublic: true });
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

export default PortfolioTab;