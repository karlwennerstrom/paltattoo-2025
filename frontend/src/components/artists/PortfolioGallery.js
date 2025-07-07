import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { getTattooImageUrl } from '../../utils/imageHelpers';

const PortfolioGallery = ({ images, artist, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'masonry'

  // Mock data if no images provided
  const mockImages = images || Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    url: getTattooImageUrl(null, i),
    title: `Tatuaje ${i + 1}`,
    description: `Descripción del trabajo ${i + 1}`,
    category: ['Realista', 'Tradicional', 'Blackwork', 'Color'][i % 4],
    style: ['Realista', 'Tradicional', 'Neo-tradicional', 'Blackwork'][i % 4],
    size: ['Pequeño', 'Mediano', 'Grande'][i % 3],
    duration: `${Math.floor(Math.random() * 8) + 1} horas`,
    bodyPart: ['Brazo', 'Pierna', 'Espalda', 'Pecho'][i % 4],
    date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    likes: Math.floor(Math.random() * 100) + 10,
    isHealed: Math.random() > 0.5
  }));

  const categories = ['all', ...new Set(mockImages.map(img => img.category))];
  
  const filteredImages = selectedCategory === 'all' 
    ? mockImages 
    : mockImages.filter(img => img.category === selectedCategory);

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    setSelectedImage(filteredImages[prevIndex]);
  };

  return (
    <>
      <div className={className}>
        {/* Gallery Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-primary-100">
              Portfolio ({filteredImages.length} trabajos)
            </h3>
            <p className="text-primary-400 text-sm">
              Explora los trabajos realizados por {artist?.name || 'este artista'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
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
                onClick={() => setViewMode('masonry')}
                className={twMerge(
                  'p-2 rounded transition-colors',
                  viewMode === 'masonry' ? 'bg-accent-600 text-white' : 'bg-primary-700 text-primary-400 hover:text-primary-200'
                )}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={twMerge(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-accent-600 text-white'
                  : 'bg-primary-700 text-primary-300 hover:bg-primary-600 hover:text-primary-100'
              )}
            >
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-primary-400">No hay trabajos en esta categoría</p>
          </div>
        ) : (
          <div className={twMerge(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4'
          )}>
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={twMerge(
                  'group cursor-pointer relative overflow-hidden rounded-lg bg-primary-800 transition-transform hover:scale-105',
                  viewMode === 'masonry' && 'break-inside-avoid mb-4'
                )}
                onClick={() => openImageModal(image)}
              >
                <div className={twMerge(
                  'relative',
                  viewMode === 'grid' ? 'aspect-square' : ''
                )}>
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-white">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm font-medium">Ver detalles</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {image.isHealed && (
                      <span className="px-2 py-1 bg-success-600 text-white text-xs rounded">
                        Curado
                      </span>
                    )}
                    <span className="px-2 py-1 bg-primary-900 bg-opacity-75 text-white text-xs rounded">
                      {image.category}
                    </span>
                  </div>

                  {/* Likes */}
                  <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded">
                    <svg className="h-4 w-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white text-xs">{image.likes}</span>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-3">
                  <h4 className="text-sm font-medium text-primary-100 mb-1">{image.title}</h4>
                  <div className="flex items-center justify-between text-xs text-primary-400">
                    <span>{image.size}</span>
                    <span>{image.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      <Modal
        isOpen={selectedImage !== null}
        onClose={closeImageModal}
        size="full"
        className="bg-black bg-opacity-90"
      >
        {selectedImage && (
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image */}
              <div className="lg:col-span-2 relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
                
                {/* Navigation buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Details */}
              <div className="bg-primary-800 rounded-lg p-6 h-fit">
                <h3 className="text-xl font-semibold text-primary-100 mb-4">{selectedImage.title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-primary-200 mb-2">Descripción</h4>
                    <p className="text-primary-400 text-sm">{selectedImage.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-primary-200">Estilo</h4>
                      <p className="text-primary-400 text-sm">{selectedImage.style}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-primary-200">Tamaño</h4>
                      <p className="text-primary-400 text-sm">{selectedImage.size}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-primary-200">Duración</h4>
                      <p className="text-primary-400 text-sm">{selectedImage.duration}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-primary-200">Parte del cuerpo</h4>
                      <p className="text-primary-400 text-sm">{selectedImage.bodyPart}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-primary-200 mb-2">Fecha realización</h4>
                    <p className="text-primary-400 text-sm">
                      {new Date(selectedImage.date).toLocaleDateString('es-CL')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 pt-4 border-t border-primary-700">
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="text-primary-300 text-sm">{selectedImage.likes} likes</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button variant="primary" fullWidth>
                    Solicitar trabajo similar
                  </Button>
                  <Button variant="ghost" fullWidth>
                    Compartir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PortfolioGallery;