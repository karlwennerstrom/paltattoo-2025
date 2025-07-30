import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { getTattooImageUrl } from '../../utils/imageHelpers';

const PortfolioGallery = ({ images, artist, collections, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('collections'); // 'collections' or 'grid'
  const [expandedCollection, setExpandedCollection] = useState(null); // Track which collection is expanded

  // Process real portfolio images only - no mock data
  const processedImages = images?.length > 0 
    ? images.map((item, index) => {
        const imageUrl = getTattooImageUrl(item.image_url || item.imageUrl || item.url);
        return {
          id: item.id || index + 1,
          url: imageUrl,
          title: item.title || 'Sin título',
          description: item.description || '',
          category: item.category || 'Sin categoría',
          style: item.style_name || item.style || 'Sin estilo',
          size: item.size || 'No especificado',
          duration: item.duration || 'No especificado',
          bodyPart: item.bodyPart || 'No especificado',
          date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          isHealed: item.isHealed || false,
          isFeatured: item.is_featured || false
        };
      })
    : [];

  // Use collections from API if available, otherwise group by category
  const displayCollections = collections && Object.keys(collections).length > 0 
    ? collections 
    : processedImages.reduce((acc, img) => {
        const category = img.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(img);
        return acc;
      }, {});

  const displayImages = processedImages;
  const categories = ['all', ...Object.keys(displayCollections)];
  
  // Group images by category
  const imagesByCategory = categories.reduce((acc, category) => {
    acc[category] = displayImages.filter(img => img.category === category);
    return acc;
  }, {});

  const filteredImages = selectedCategory === 'all' 
    ? displayImages 
    : displayImages.filter(img => img.category === selectedCategory);

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const currentIndex = displayImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % displayImages.length;
    setSelectedImage(displayImages[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = displayImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
    setSelectedImage(displayImages[prevIndex]);
  };

  const toggleCollection = (collectionName) => {
    setExpandedCollection(expandedCollection === collectionName ? null : collectionName);
  };

  const showAllCollections = () => {
    setExpandedCollection(null);
  };

  return (
    <>
      <div className={className}>
        {/* Gallery Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-primary-100">
                Portfolio ({displayImages.length} trabajos)
              </h3>
              {expandedCollection && (
                <button
                  onClick={showAllCollections}
                  className="px-3 py-1 bg-primary-700 text-primary-300 hover:bg-primary-600 text-sm rounded-md transition-colors"
                >
                  ← Ver todas las colecciones
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm mt-1">
              <p className="text-primary-400">
                {expandedCollection 
                  ? `Viendo colección: ${expandedCollection}` 
                  : `${Object.keys(displayCollections).length} colecciones disponibles`
                }
              </p>
              {artist?.subscription && (
                <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded-full">
                  {artist.subscription.plan_name || artist.subscription.plan_type}
                </span>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('collections')}
              className={twMerge(
                'px-3 py-1 text-sm rounded-md transition-colors',
                viewMode === 'collections' 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
              )}
            >
              Por Colecciones
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={twMerge(
                'px-3 py-1 text-sm rounded-md transition-colors',
                viewMode === 'grid' 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
              )}
            >
              Cuadrícula
            </button>
          </div>
        </div>

        {/* Content Display */}
        {displayImages.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-primary-200 mb-2">Portafolio no disponible</h3>
              <p className="text-primary-400 text-sm mb-4">
                Este artista aún no ha agregado trabajos a su portafolio público, o bien no tiene trabajos activos para mostrar.
              </p>
              <p className="text-primary-500 text-xs">
                Los artistas pueden administrar qué trabajos se muestran públicamente desde su panel de control.
              </p>
            </div>
          </div>
        ) : viewMode === 'collections' ? (
          /* Collections View */
          <div className="space-y-8">
            {Object.entries(displayCollections)
              .filter(([category]) => !expandedCollection || category === expandedCollection)
              .map(([category, categoryImages], categoryIndex) => {
              if (!categoryImages || categoryImages.length === 0) return null;
              
              return (
                <div key={category} className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl p-6 shadow-lg">
                  {/* Collection Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-accent-600 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <button
                          onClick={() => toggleCollection(category)}
                          className="text-left hover:text-accent-400 transition-colors"
                        >
                          <h4 className="text-lg font-semibold text-primary-100">
                            {category}
                          </h4>
                          <p className="text-primary-400 text-sm">
                            {categoryImages.length} {categoryImages.length === 1 ? 'trabajo' : 'trabajos'}
                            {!expandedCollection && ' - Haz clic para ver solo esta colección'}
                          </p>
                        </button>
                      </div>
                    </div>
                    
                    {/* Collection number badge */}
                    <div className="flex items-center space-x-2">
                      {!expandedCollection && (
                        <button
                          onClick={() => toggleCollection(category)}
                          className="px-3 py-1 bg-accent-600 hover:bg-accent-700 text-white text-xs rounded-full transition-colors"
                        >
                          Ver solo esta
                        </button>
                      )}
                      <span className="text-xs text-primary-400 bg-primary-700 px-3 py-1 rounded-full">
                        Colección #{categoryIndex + 1}
                      </span>
                    </div>
                  </div>
                  
                  {/* Collection Images */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categoryImages.map((image, imageIndex) => (
                      <div
                        key={image.id}
                        className="group cursor-pointer relative overflow-hidden rounded-xl bg-primary-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        onClick={() => openImageModal(image)}
                      >
                        <div className="relative aspect-square w-full h-40 md:h-48 lg:h-56">
                          <img
                            src={image.url}
                            alt={image.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Portfolio image failed to load:', image.url);
                              e.target.src = '/placeholder-tattoo.jpg';
                            }}
                          />
                          
                          {/* Featured badge */}
                          {image.isFeatured && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                                Destacado
                              </span>
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-white transform translate-y-2 group-hover:translate-y-0">
                              <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <p className="text-xs font-medium">Ver detalles</p>
                            </div>
                          </div>

                          {/* Title overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-3">
                            <p className="text-white text-xs font-medium truncate">{image.title}</p>
                            {image.style && (
                              <p className="text-primary-300 text-xs mt-1">{image.style}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Subscription limit notice */}
            {artist?.subscription && artist.subscription.collection_limit !== -1 && (
              <div className="bg-primary-800 border border-accent-500/20 rounded-lg p-4 text-center">
                <p className="text-primary-300 text-sm">
                  <span className="text-accent-400 font-medium">Plan {artist.subscription.plan_name}:</span>
                  {' '}Mostrando {Object.keys(displayCollections).length} de máximo {artist.subscription.collection_limit} colecciones
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayImages.map((image) => (
              <div
                key={image.id}
                className="group cursor-pointer relative overflow-hidden rounded-lg bg-primary-700 transition-transform hover:scale-105"
                onClick={() => openImageModal(image)}
              >
                <div className="relative w-full h-40 md:h-48 lg:h-56">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Portfolio image failed to load:', image.url);
                      e.target.src = '/placeholder-tattoo.jpg';
                    }}
                  />
                  
                  {/* Category tag */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary-900/90 text-primary-200 text-xs px-2 py-1 rounded">
                      {image.category}
                    </span>
                  </div>
                  
                  {/* Featured badge */}
                  {image.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">★</span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-white">
                      <svg className="h-8 w-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-xs font-medium">Ver</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-white text-xs truncate">{image.title}</p>
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
                  onError={(e) => {
                    console.error('Modal image failed to load:', selectedImage.url);
                    e.target.src = '/placeholder-tattoo.jpg';
                  }}
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