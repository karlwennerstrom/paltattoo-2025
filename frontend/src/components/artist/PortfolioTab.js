import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { getTattooImageUrl } from '../../utils/imageHelpers';
import { portfolioService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiImage } from 'react-icons/fi';

const PortfolioTab = () => {
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newWork, setNewWork] = useState({
    title: '',
    description: '',
    category: '',
    style: '',
    size: '',
    duration: '',
    bodyPart: '',
    date: '',
    file: null,
    preview: null,
    client: '',
    price: '',
    featured: false
  });

  const categories = ['all', ...new Set(portfolioItems.map(item => item.category))];
  const styleOptions = [
    'Realista', 'Tradicional', 'Neo-tradicional', 'Blackwork',
    'Dotwork', 'Acuarela', 'Japonés', 'Tribal', 'Minimalista',
    'Geométrico', 'Biomecánico', 'New School', 'Old School',
    'Black & Grey', 'Color', 'Lettering', 'Ornamental'
  ];

  const sizeOptions = ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'];
  const bodyPartOptions = [
    'Brazo', 'Antebrazo', 'Pierna', 'Muslo', 'Espalda', 'Pecho',
    'Hombro', 'Costillas', 'Mano', 'Pie', 'Cuello', 'Cara'
  ];

  useEffect(() => {
    loadPortfolio();
  }, []);

  useEffect(() => {
    if (editingWork) {
      setNewWork({
        title: editingWork.title || '',
        description: editingWork.description || '',
        category: editingWork.category || '',
        style: editingWork.style || '',
        size: editingWork.size || '',
        duration: editingWork.duration || '',
        bodyPart: editingWork.bodyPart || '',
        date: editingWork.date || '',
        file: null,
        preview: null,
        client: editingWork.client || '',
        price: editingWork.price || '',
        featured: editingWork.featured || false
      });
    }
  }, [editingWork]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioService.getAll('my');
      // Transform API response to match component expectations
      const items = (response.data.items || []).map(item => ({
        id: item.id,
        title: item.title || 'Sin título',
        description: item.description || '',
        category: item.style_name || 'Sin categoría',
        style: item.style_name || 'Sin estilo',
        size: 'Mediano', // Default value since API doesn't have this
        duration: '2-4 horas', // Default value
        bodyPart: 'Brazo', // Default value
        date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '',
        image: item.imageUrl || item.image_url,
        likes: item.views || 0,
        isHealed: true, // Default value
        client: '', // Not available in API
        price: 0, // Not available in API
        featured: item.is_featured || false
      }));
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast.error('Error al cargar el portfolio');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const handleAddWork = async () => {
    // Validate form
    if (!newWork.title || !newWork.category) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    // If editing, call update function
    if (editingWork) {
      return handleUpdateWork();
    }

    // If adding new, require image
    if (!newWork.file) {
      toast.error('La imagen es obligatoria para nuevos trabajos');
      return;
    }

    try {
      const formData = {
        title: newWork.title,
        description: newWork.description,
        category: newWork.category,
        file: newWork.file,
        isFeatured: newWork.featured
      };

      await portfolioService.create(formData);
      toast.success('Trabajo agregado exitosamente');
      
      // Reset form and reload portfolio
      setNewWork({
        title: '',
        description: '',
        category: '',
        style: '',
        size: '',
        duration: '',
        bodyPart: '',
        date: '',
        file: null,
        preview: null,
        client: '',
        price: '',
        featured: false
      });
      setIsAddingWork(false);
      loadPortfolio();
    } catch (error) {
      console.error('Error adding work:', error);
      toast.error('Error al agregar el trabajo');
    }
  };

  const handleUpdateWork = async () => {
    try {
      const updateData = {
        title: newWork.title,
        description: newWork.description,
        category: newWork.category,
        isFeatured: newWork.featured
      };

      await portfolioService.update(editingWork.id, updateData);
      toast.success('Trabajo actualizado exitosamente');
      
      // Reset form and reload portfolio
      setNewWork({
        title: '',
        description: '',
        category: '',
        style: '',
        size: '',
        duration: '',
        bodyPart: '',
        date: '',
        file: null,
        preview: null,
        client: '',
        price: '',
        featured: false
      });
      setEditingWork(null);
      loadPortfolio();
    } catch (error) {
      console.error('Error updating work:', error);
      toast.error('Error al actualizar el trabajo');
    }
  };

  const handleDeleteWork = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este trabajo?')) {
      return;
    }

    try {
      await portfolioService.delete(id);
      toast.success('Trabajo eliminado exitosamente');
      loadPortfolio();
    } catch (error) {
      console.error('Error deleting work:', error);
      toast.error('Error al eliminar el trabajo');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await portfolioService.toggleFeatured(id);
      toast.success('Estado destacado actualizado');
      loadPortfolio();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Error al cambiar el estado destacado');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Store the actual file object for upload
      setNewWork(prev => ({
        ...prev,
        file: file
      }));
      
      // Create preview for display
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewWork(prev => ({
          ...prev,
          preview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Mi Portfolio</h1>
          <p className="text-primary-400">Gestiona tus trabajos y muestra tu arte</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="ghost" onClick={loadPortfolio} disabled={loading}>
            <svg className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </Button>
          <Button variant="primary" onClick={() => setIsAddingWork(true)}>
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Trabajo
          </Button>
        </div>
      </div>

      {/* Filters and View Options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-sm text-primary-100 focus:border-accent-500 focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas las categorías' : category}
              </option>
            ))}
          </select>
          <span className="text-sm text-primary-400">
            {filteredItems.length} trabajo{filteredItems.length !== 1 ? 's' : ''}
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
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={twMerge(
              'p-2 rounded transition-colors',
              viewMode === 'list' ? 'bg-accent-600 text-white' : 'bg-primary-700 text-primary-400 hover:text-primary-200'
            )}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Portfolio Items */}
      {filteredItems.length > 0 ? (
        viewMode === 'grid' ? (
          <Grid cols={3} gap={6}>
            {filteredItems.map((item) => (
              <div key={item.id} className="card group relative overflow-hidden">
                {/* Featured Badge */}
                {item.featured && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-accent-600 text-white text-xs font-medium rounded">
                    Destacado
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 z-10 transition-opacity">
                  <div className="flex space-x-1 bg-black bg-opacity-80 rounded-lg p-1 shadow-lg">
                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      className={twMerge(
                        'p-2 rounded transition-colors',
                        item.featured 
                          ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                          : 'bg-gray-600 text-white hover:bg-gray-500'
                      )}
                      title={item.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingWork(item)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Editar"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteWork(item.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="aspect-square bg-primary-800 overflow-hidden">
                  <img
                    src={getTattooImageUrl(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-primary-100 mb-1">{item.title}</h3>
                  <p className="text-sm text-primary-400 mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-primary-500 mb-3">
                    <span>{item.category}</span>
                    <span>{item.size}</span>
                    <span>{item.duration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <svg className="h-4 w-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-primary-300">{item.likes}</span>
                    </div>
                    {item.isHealed && (
                      <span className="px-2 py-1 bg-success-600 text-white text-xs rounded">
                        Curado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Grid>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={getTattooImageUrl(item.image)}
                    alt={item.title}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primary-100">{item.title}</h3>
                      <div className="flex items-center space-x-2">
                        {item.featured && (
                          <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded">
                            Destacado
                          </span>
                        )}
                        <span className="text-sm text-primary-400">
                          ${item.price?.toLocaleString('es-CL')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-primary-400 mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-primary-500">
                        <span>{item.category}</span>
                        <span>{item.size}</span>
                        <span>{item.bodyPart}</span>
                        <span>{item.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingWork(item)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteWork(item.id)}>
                          Eliminar
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
          <p className="text-primary-400 mb-4">No tienes trabajos en tu portfolio</p>
          <p className="text-sm text-primary-500 mb-6">
            Comienza agregando tus primeros trabajos para mostrar tu talento
          </p>
          <Button onClick={() => setIsAddingWork(true)}>
            Agregar Primer Trabajo
          </Button>
        </div>
      )}

      {/* Add/Edit Work Modal */}
      <Modal
        isOpen={isAddingWork || editingWork}
        onClose={() => {
          setIsAddingWork(false);
          setEditingWork(null);
        }}
        title={editingWork ? 'Editar Trabajo' : 'Agregar Nuevo Trabajo'}
        size="lg"
      >
        <div className="space-y-4">
          <Grid cols={2} gap={4}>
            <Input
              label="Título *"
              value={newWork.title}
              onChange={(e) => setNewWork(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: León Realista"
            />
            <select
              value={newWork.category}
              onChange={(e) => setNewWork(prev => ({ ...prev, category: e.target.value, style: e.target.value }))}
              className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none"
            >
              <option value="">Seleccionar categoría *</option>
              {styleOptions.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </Grid>

          <textarea
            value={newWork.description}
            onChange={(e) => setNewWork(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción del trabajo..."
            rows={3}
            className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
          />

          <Grid cols={3} gap={4}>
            <select
              value={newWork.size}
              onChange={(e) => setNewWork(prev => ({ ...prev, size: e.target.value }))}
              className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none"
            >
              <option value="">Tamaño</option>
              {sizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <select
              value={newWork.bodyPart}
              onChange={(e) => setNewWork(prev => ({ ...prev, bodyPart: e.target.value }))}
              className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none"
            >
              <option value="">Parte del cuerpo</option>
              {bodyPartOptions.map(part => (
                <option key={part} value={part}>{part}</option>
              ))}
            </select>
            <Input
              label="Duración"
              value={newWork.duration}
              onChange={(e) => setNewWork(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="Ej: 4 horas"
            />
          </Grid>

          <Grid cols={2} gap={4}>
            <Input
              label="Cliente"
              value={newWork.client}
              onChange={(e) => setNewWork(prev => ({ ...prev, client: e.target.value }))}
              placeholder="Nombre del cliente (opcional)"
            />
            <Input
              label="Precio (CLP)"
              type="number"
              value={newWork.price}
              onChange={(e) => setNewWork(prev => ({ ...prev, price: e.target.value }))}
              placeholder="180000"
            />
          </Grid>

          <Input
            label="Fecha"
            type="date"
            value={newWork.date}
            onChange={(e) => setNewWork(prev => ({ ...prev, date: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              Imagen del trabajo {!editingWork ? '*' : '(opcional)'}
            </label>
            
            {editingWork && (
              <div className="mb-3">
                <p className="text-sm text-primary-400 mb-2">Imagen actual:</p>
                <img
                  src={getTattooImageUrl(editingWork.image)}
                  alt="Imagen actual"
                  className="h-32 w-32 object-cover rounded-lg"
                />
              </div>
            )}
            
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
            {newWork.preview && (
              <div className="mt-2">
                <p className="text-sm text-primary-400 mb-1">Nueva imagen:</p>
                <img
                  src={newWork.preview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newWork.featured}
              onChange={(e) => setNewWork(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
            />
            <span className="text-sm text-primary-300">Marcar como trabajo destacado</span>
          </label>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddingWork(false);
                setEditingWork(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddWork}>
              {editingWork ? 'Guardar Cambios' : 'Agregar Trabajo'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PortfolioTab;