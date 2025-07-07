import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { getTattooImageUrl } from '../../utils/imageHelpers';

const PortfolioTab = () => {
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: 1,
      title: 'León Realista',
      description: 'Tatuaje realista de león en el brazo, trabajo de 6 horas',
      category: 'Realista',
      style: 'Realista',
      size: 'Grande',
      duration: '6 horas',
      bodyPart: 'Brazo',
      date: '2024-01-15',
      image: '/placeholder-tattoo-1.jpg',
      likes: 45,
      isHealed: true,
      client: 'María González',
      price: 280000,
      featured: true
    },
    {
      id: 2,
      title: 'Retrato en Black & Grey',
      description: 'Retrato realista en escala de grises',
      category: 'Black & Grey',
      style: 'Black & Grey',
      size: 'Mediano',
      duration: '4 horas',
      bodyPart: 'Antebrazo',
      date: '2024-01-10',
      image: '/placeholder-tattoo-2.jpg',
      likes: 32,
      isHealed: false,
      client: 'Carlos López',
      price: 180000,
      featured: false
    }
    // Add more mock items...
  ]);

  const [newWork, setNewWork] = useState({
    title: '',
    description: '',
    category: '',
    style: '',
    size: '',
    duration: '',
    bodyPart: '',
    date: '',
    image: null,
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

  const filteredItems = selectedCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const handleAddWork = async () => {
    // Validate form
    if (!newWork.title || !newWork.category || !newWork.image) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const workData = {
      ...newWork,
      id: Date.now(),
      likes: 0,
      isHealed: false
    };

    setPortfolioItems(prev => [workData, ...prev]);
    setNewWork({
      title: '',
      description: '',
      category: '',
      style: '',
      size: '',
      duration: '',
      bodyPart: '',
      date: '',
      image: null,
      client: '',
      price: '',
      featured: false
    });
    setIsAddingWork(false);
  };

  const handleDeleteWork = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este trabajo?')) {
      setPortfolioItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleToggleFeatured = (id) => {
    setPortfolioItems(prev => prev.map(item => 
      item.id === id ? { ...item, featured: !item.featured } : item
    ));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewWork(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Mi Portfolio</h1>
          <p className="text-primary-400">Gestiona tus trabajos y muestra tu arte</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddingWork(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Trabajo
        </Button>
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
      {viewMode === 'grid' ? (
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
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleToggleFeatured(item.id)}
                    className={twMerge(
                      'p-2 rounded-full transition-colors',
                      item.featured 
                        ? 'bg-accent-600 text-white'
                        : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
                    )}
                    title={item.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingWork(item)}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                    title="Editar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteWork(item.id)}
                    className="p-2 bg-error-600 text-white rounded-full hover:bg-error-700 transition-colors"
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
              Imagen del trabajo *
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
            {newWork.image && (
              <img
                src={newWork.image}
                alt="Preview"
                className="mt-2 h-32 w-32 object-cover rounded-lg"
              />
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