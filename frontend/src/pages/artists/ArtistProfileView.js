import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import PublicArtistProfile from '../../components/artists/PublicArtistProfile';
import { artistService, portfolioService } from '../../services/api';

const ArtistProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArtist();
  }, [id]);

  const loadArtist = async () => {
    try {
      setLoading(true);
      
      // Try to load real artist data
      let artistData;
      try {
        const [artistResponse, portfolioResponse] = await Promise.all([
          artistService.getById(id),
          portfolioService.getAll(id)
        ]);
        
        const rawArtist = artistResponse.data;
        const portfolioImages = portfolioResponse.data || [];
        
        // Transform API data to match frontend expectations
        artistData = {
          id: rawArtist.id,
          name: `${rawArtist.first_name || ''} ${rawArtist.last_name || ''}`.trim(),
          profileImage: rawArtist.profile_image,
          location: `${rawArtist.comuna_name}, ${rawArtist.region}` || 'Sin ubicación',
          specialties: rawArtist.styles ? rawArtist.styles.map(style => style.name) : [],
          rating: parseFloat(rawArtist.rating) || 0,
          reviewsCount: rawArtist.total_reviews || 0,
          experienceYears: rawArtist.years_experience || 0,
          completedWorks: portfolioImages.length,
          priceRange: {
            min: Math.floor(parseFloat(rawArtist.min_price) / 1000) || 50,
            max: Math.floor(parseFloat(rawArtist.max_price) / 1000) || 200
          },
          bio: rawArtist.bio || 'Artista tatuador profesional',
          portfolioImages: portfolioImages,
          collections: rawArtist.collections || {},
          subscription: rawArtist.subscription || null,
          isOnline: true,
          verified: rawArtist.is_verified === 1,
          acceptingWork: true,
          isPromoted: false,
          isFavorited: false,
          isFollowing: false,
          email: rawArtist.email,
          phone: rawArtist.phone,
          instagram: rawArtist.instagram_url,
          studio: {
            name: rawArtist.studio_name || 'Estudio de Tatuajes',
            address: rawArtist.address || 'Dirección del estudio',
            hours: 'Lun-Vie: 10:00-19:00, Sáb: 10:00-16:00'
          },
          nextAvailableDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        };
      } catch (apiError) {
        console.error('Error loading artist data:', apiError.message);
        throw apiError; // Re-throw to be handled by outer catch
      }
      
      setArtist(artistData);
      setError(null);
    } catch (err) {
      setError('Error al cargar el perfil del artista');
      console.error('Error loading artist:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-primary-400">Cargando perfil del artista...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-error-400 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={loadArtist} variant="secondary">
              Reintentar
            </Button>
            <Button onClick={() => navigate('/artists')} variant="ghost">
              Volver a artistas
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!artist) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-primary-400 mb-4">Artista no encontrado</p>
          <Button onClick={() => navigate('/artists')} variant="secondary">
            Volver a artistas
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Artistas', href: '/artists' },
        { label: artist.name }
      ]}
      maxWidth="6xl"
    >
      <PublicArtistProfile artist={artist} />
    </PageContainer>
  );
};

export default ArtistProfileView;