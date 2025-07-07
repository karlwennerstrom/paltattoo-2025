import React, { useState } from 'react';
import { PageContainer, Card, Grid } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import { getProfileImageUrl, getTattooImageUrl } from '../../utils/imageHelpers';

const FavoritesPage = () => {
  const [activeTab, setActiveTab] = useState('artists');

  // Mock favorites data
  const favoriteArtists = [
    {
      id: 1,
      name: 'Carlos Mendoza',
      avatar: null,
      specialties: ['Realismo', 'Black & Grey', 'Retratos'],
      location: 'Providencia, Santiago',
      rating: 4.9,
      reviewsCount: 127,
      priceRange: '200k - 800k',
      isAvailable: true,
      addedAt: '2024-01-20T10:30:00Z'
    },
    {
      id: 2,
      name: 'María Fernández',
      avatar: null,
      specialties: ['Florales', 'Acuarela', 'Delicados'],
      location: 'Las Condes, Santiago',
      rating: 4.8,
      reviewsCount: 89,
      priceRange: '150k - 600k',
      isAvailable: false,
      addedAt: '2024-01-18T14:20:00Z'
    },
    {
      id: 3,
      name: 'Diego Silva',
      avatar: null,
      specialties: ['Japonés', 'Neo-japonés', 'Oriental'],
      location: 'Ñuñoa, Santiago',
      rating: 4.7,
      reviewsCount: 156,
      priceRange: '300k - 1M',
      isAvailable: true,
      addedAt: '2024-01-15T09:15:00Z'
    }
  ];

  const favoriteWorks = [
    {
      id: 1,
      title: 'León Realista',
      artistName: 'Carlos Mendoza',
      style: 'Realismo',
      bodyPart: 'Brazo',
      image: null,
      addedAt: '2024-01-22T16:45:00Z'
    },
    {
      id: 2,
      title: 'Mandala Ornamental',
      artistName: 'María Fernández',
      style: 'Ornamental',
      bodyPart: 'Espalda',
      image: null,
      addedAt: '2024-01-20T11:30:00Z'
    },
    {
      id: 3,
      title: 'Dragón Japonés',
      artistName: 'Diego Silva',
      style: 'Japonés',
      bodyPart: 'Manga completa',
      image: null,
      addedAt: '2024-01-19T14:20:00Z'
    },
    {
      id: 4,
      title: 'Rosa Acuarela',
      artistName: 'María Fernández',
      style: 'Acuarela',
      bodyPart: 'Antebrazo',
      image: null,
      addedAt: '2024-01-17T13:10:00Z'
    }
  ];

  const tabs = [
    { id: 'artists', label: 'Artistas', count: favoriteArtists.length },
    { id: 'works', label: 'Trabajos', count: favoriteWorks.length }
  ];

  const timeAgo = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 30) return `Hace ${days} días`;
    const months = Math.floor(days / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  };

  const handleRemoveFavorite = (type, id) => {
    if (window.confirm('¿Estás seguro de que quieres quitar este elemento de favoritos?')) {
      // Here you would call API to remove favorite
      console.log(`Removing ${type} ${id} from favorites`);
    }
  };

  return (
    <PageContainer
      title="Mis Favoritos"
      subtitle="Artistas y trabajos que te han inspirado"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-primary-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-accent-600 text-white'
                  : 'text-primary-300 hover:text-primary-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-1 text-xs rounded ${
                activeTab === tab.id
                  ? 'bg-white bg-opacity-20'
                  : 'bg-primary-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className="space-y-4">
            {favoriteArtists.length === 0 ? (
              <Card className="text-center py-12">
                <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-primary-400 mb-4">No tienes artistas favoritos</p>
                <Button variant="primary" href="/artists">
                  Explorar Artistas
                </Button>
              </Card>
            ) : (
              favoriteArtists.map((artist) => (
                <Card key={artist.id} className="hover:bg-primary-750 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {artist.avatar ? (
                        <img 
                          src={getProfileImageUrl(artist.avatar)} 
                          alt={artist.name} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-lg font-medium text-primary-200">
                          {artist.name?.[0] || '?'}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-primary-100 mb-1">
                            {artist.name}
                          </h3>
                          <p className="text-primary-400 text-sm mb-2">{artist.location}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(artist.rating) ? 'text-yellow-400' : 'text-primary-600'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-primary-400">
                                {artist.rating} ({artist.reviewsCount} reseñas)
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            artist.isAvailable ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <span className={`text-sm ${
                            artist.isAvailable ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {artist.isAvailable ? 'Disponible' : 'Ocupado'}
                          </span>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {artist.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-primary-400">Rango de precios: </span>
                          <span className="text-accent-400 font-medium">{artist.priceRange}</span>
                          <span className="text-primary-500 ml-4">
                            Agregado {timeAgo(artist.addedAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" href={`/artists/${artist.id}`}>
                            Ver Perfil
                          </Button>
                          <Button variant="secondary" size="sm">
                            Contactar
                          </Button>
                          <button
                            onClick={() => handleRemoveFavorite('artist', artist.id)}
                            className="p-2 text-primary-500 hover:text-error-400 transition-colors"
                            title="Quitar de favoritos"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Works Tab */}
        {activeTab === 'works' && (
          <div>
            {favoriteWorks.length === 0 ? (
              <Card className="text-center py-12">
                <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-primary-400 mb-4">No tienes trabajos favoritos</p>
                <Button variant="primary" href="/feed">
                  Explorar Trabajos
                </Button>
              </Card>
            ) : (
              <Grid cols={2} gap={6}>
                {favoriteWorks.map((work) => (
                  <Card key={work.id} className="hover:bg-primary-750 transition-colors">
                    <div className="aspect-square bg-primary-800 rounded-lg overflow-hidden mb-4">
                      <img
                        src={getTattooImageUrl(work.image)}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-primary-100 mb-1">
                          {work.title}
                        </h3>
                        <p className="text-primary-400 text-sm">
                          Por {work.artistName}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
                          {work.style}
                        </span>
                        <span className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
                          {work.bodyPart}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-primary-500 text-sm">
                          {timeAgo(work.addedAt)}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Ver Original
                          </Button>
                          <button
                            onClick={() => handleRemoveFavorite('work', work.id)}
                            className="p-2 text-primary-500 hover:text-error-400 transition-colors"
                            title="Quitar de favoritos"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </Grid>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <Grid cols={3} gap={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-accent-400 mb-2">
              {favoriteArtists.length}
            </div>
            <p className="text-sm text-primary-400">Artistas favoritos</p>
          </Card>

          <Card className="text-center">
            <div className="text-2xl font-bold text-success-400 mb-2">
              {favoriteWorks.length}
            </div>
            <p className="text-sm text-primary-400">Trabajos guardados</p>
          </Card>

          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-100 mb-2">
              {new Set(favoriteWorks.map(w => w.artistName)).size}
            </div>
            <p className="text-sm text-primary-400">Artistas únicos</p>
          </Card>
        </Grid>
      </div>
    </PageContainer>
  );
};

export default FavoritesPage;