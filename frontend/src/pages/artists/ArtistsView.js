import React, { useState, useEffect } from 'react';
import { PageContainer, Grid, Card } from '../../components/common/Layout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import TattooArtistCard from '../../components/artists/TattooArtistCard';
import ArtistFilters from '../../components/artists/ArtistFilters';
import Pagination from '../../components/common/Pagination';
import { artistService } from '../../services/api';

const ArtistsView = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationMode, setPaginationMode] = useState('traditional'); // 'traditional' | 'loadMore'
  const [filters, setFilters] = useState({
    location: '',
    specialties: [],
    experienceLevel: '',
    priceRange: [0, 500000],
    rating: 0,
    availability: '',
    sortBy: 'rating',
  });

  // Mock data for demo
  const generateMockArtists = (pageNum, limit = 12) => {
    const names = [
      'Carlos Mendoza', 'María González', 'Diego Rivera', 'Ana Martínez',
      'Pablo Herrera', 'Sofía Vargas', 'Andrés Silva', 'Camila Torres',
      'Rodrigo López', 'Valentina Rojas', 'Matías Soto', 'Isidora Cruz'
    ];
    
    const specialties = [
      ['Realista', 'Black & Grey', 'Retratos'],
      ['Tradicional', 'Neo-tradicional', 'Color'],
      ['Japonés', 'Oriental', 'Dragones'],
      ['Blackwork', 'Dotwork', 'Geométrico'],
      ['Minimalista', 'Linework', 'Delicado'],
      ['Biomecánico', 'Sci-fi', 'Futurista'],
      ['Acuarela', 'Color', 'Abstracto'],
      ['Lettering', 'Caligrafía', 'Tipografía'],
      ['Old School', 'Tradicional', 'Vintage'],
      ['New School', 'Cartoon', 'Colorido'],
      ['Ornamental', 'Mandala', 'Decorativo'],
      ['Tribal', 'Étnico', 'Cultural']
    ];

    const locations = [
      'Santiago Centro', 'Providencia', 'Las Condes', 'Ñuñoa',
      'San Miguel', 'Maipú', 'La Reina', 'Vitacura',
      'Valparaíso', 'Viña del Mar', 'Concepción', 'Temuco'
    ];

    return Array.from({ length: limit }, (_, i) => {
      const index = ((pageNum - 1) * limit) + i;
      const nameIndex = index % names.length;
      
      return {
        id: index + 1,
        name: names[nameIndex],
        profileImage: null,
        location: locations[Math.floor(Math.random() * locations.length)],
        specialties: specialties[nameIndex] || specialties[0],
        rating: parseFloat((4 + Math.random()).toFixed(1)),
        reviewsCount: Math.floor(Math.random() * 200) + 10,
        experienceYears: Math.floor(Math.random() * 15) + 1,
        completedWorks: Math.floor(Math.random() * 500) + 50,
        priceRange: {
          min: Math.floor(Math.random() * 100) + 50,
          max: Math.floor(Math.random() * 300) + 200
        },
        portfolioImages: [
          '/placeholder-tattoo1.jpg',
          '/placeholder-tattoo2.jpg',
          '/placeholder-tattoo3.jpg',
          '/placeholder-tattoo4.jpg'
        ],
        isOnline: Math.random() > 0.7,
        verified: Math.random() > 0.5,
        acceptingWork: Math.random() > 0.3,
        isPromoted: Math.random() > 0.8,
        isFavorited: Math.random() > 0.8,
        bio: `Artista especializado en ${specialties[nameIndex]?.[0] || 'tatuajes'} con más de ${Math.floor(Math.random() * 15) + 1} años de experiencia.`
      };
    });
  };

  const loadArtists = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);

      let artistData;
      let totalPagesCount = 5;

      try {
        // Try to load real artist data from API
        const response = await artistService.getAll({
          page: pageNum,
          limit: 12,
          search: searchQuery,
          ...filters
        });
        
        artistData = response.data?.artists || response.data || [];
        totalPagesCount = response.data?.totalPages || Math.ceil((response.data?.total || 60) / 12);
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        artistData = generateMockArtists(pageNum);
        totalPagesCount = 5;
      }
      
      if (append) {
        setArtists(prev => [...prev, ...artistData]);
      } else {
        setArtists(artistData);
      }
      
      setTotalPages(totalPagesCount);
      setError(null);
    } catch (err) {
      setError('Error al cargar los artistas');
      console.error('Error loading artists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadArtists(1);
  }, [filters, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadArtists(nextPage, true);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage !== page && newPage >= 1 && newPage <= totalPages && !loading) {
      setPage(newPage);
      loadArtists(newPage, false);
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFavorite = async (artistId, isFavorited) => {
    // Update local state
    setArtists(prev => prev.map(artist => 
      artist.id === artistId ? { ...artist, isFavorited } : artist
    ));
    
    // In production, make API call to save favorite
    try {
      // await api.post(`/artists/${artistId}/favorite`, { isFavorited });
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const handleContact = (artist) => {
    // Navigate to contact form or open modal
    console.log('Contact artist:', artist.name);
    // In production: navigate to contact form or open contact modal
  };

  return (
    <PageContainer
      title="Tatuadores"
      subtitle="Encuentra el artista perfecto para tu próximo tatuaje"
      maxWidth="full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with filters */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Search */}
            <Card title="Buscar">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar por nombre, especialidad..."
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </Card>

            {/* Filters */}
            <Card title="Filtros" className="sticky top-20">
              <ArtistFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </Card>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-primary-400">
                {loading && artists.length === 0 ? 'Cargando...' : 
                 paginationMode === 'loadMore' ? `${artists.length} artistas cargados` :
                 `${artists.length} artistas (página ${page} de ${totalPages})`}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Pagination mode selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-primary-400">Navegación:</span>
                <select
                  value={paginationMode}
                  onChange={(e) => {
                    setPaginationMode(e.target.value);
                    if (e.target.value === 'traditional' && page > 1) {
                      // Reset to page 1 when switching to traditional pagination
                      setPage(1);
                      loadArtists(1, false);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-primary-700 border border-primary-600 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="traditional">Por páginas</option>
                  <option value="loadMore">Cargar más</option>
                </select>
              </div>

              {/* View mode toggles */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-primary-400">Vista:</span>
                <Button variant="ghost" size="sm" className="p-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {loading && artists.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
                <p className="text-primary-400">Cargando artistas...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error-400 mb-4">{error}</p>
              <Button onClick={() => loadArtists(1)} variant="secondary">
                Reintentar
              </Button>
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-12">
              <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-primary-400 mb-4">No se encontraron artistas que coincidan con tu búsqueda</p>
              <Button onClick={() => {
                setSearchQuery('');
                setFilters({
                  location: '',
                  specialties: [],
                  experienceLevel: '',
                  priceRange: [0, 500000],
                  rating: 0,
                  availability: '',
                  sortBy: 'rating',
                });
              }} variant="secondary">
                Limpiar búsqueda y filtros
              </Button>
            </div>
          ) : (
            <>
              <Grid cols={3} gap={6}>
                {artists.map((artist) => (
                  <TattooArtistCard
                    key={artist.id}
                    artist={artist}
                    onFavorite={handleFavorite}
                    onContact={handleContact}
                  />
                ))}
              </Grid>

              {/* Pagination */}
              <div className="mt-8">
                {paginationMode === 'traditional' ? (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    loading={loading}
                    className="justify-center"
                  />
                ) : (
                  <>
                    {page < totalPages && (
                      <div className="flex justify-center">
                        <Button
                          onClick={handleLoadMore}
                          variant="secondary"
                          loading={loading}
                          className="min-w-40"
                        >
                          Cargar más artistas
                        </Button>
                      </div>
                    )}
                    {page >= totalPages && artists.length > 0 && (
                      <div className="text-center py-4">
                        <p className="text-primary-400">No hay más artistas para mostrar</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ArtistsView;