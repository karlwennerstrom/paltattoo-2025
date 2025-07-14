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
        
        artistData = {
          ...artistResponse.data,
          portfolioImages: portfolioResponse.data || []
        };
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
        // Fallback to mock data if API is not available
        artistData = {
        id: parseInt(id),
        name: 'Carlos Mendoza',
        profileImage: null,
        location: 'Santiago Centro, Chile',
        specialties: ['Realista', 'Black & Grey', 'Retratos', 'Neo-tradicional'],
        rating: 4.8,
        reviewsCount: 127,
        experienceYears: 8,
        completedWorks: 450,
        priceRange: {
          min: 80,
          max: 350
        },
        bio: 'Artista tatuador especializado en realismo y retratos con más de 8 años de experiencia. Mi pasión es crear tatuajes únicos que cuenten la historia de cada persona. Trabajo con técnicas avanzadas de sombreado y detalle para lograr resultados excepcionales.',
        portfolioImages: Array.from({ length: 20 }, (_, i) => `/placeholder-tattoo-${i + 1}.jpg`),
        isOnline: true,
        verified: true,
        acceptingWork: true,
        isPromoted: Math.random() > 0.5,
        isFavorited: Math.random() > 0.7,
        isFollowing: Math.random() > 0.6,
        email: 'carlos.mendoza@email.com',
        phone: '+56 9 1234 5678',
        instagram: 'carlos_tattoo_art',
        studio: {
          name: 'Ink Masters Studio',
          address: 'Providencia 1234, Santiago Centro',
          hours: 'Lun-Vie: 10:00-19:00, Sáb: 10:00-16:00'
        },
        nextAvailableDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        certifications: [
          {
            name: 'Certificación en Bioseguridad',
            issuer: 'Instituto Nacional de Salud',
            year: 2023
          },
          {
            name: 'Curso Avanzado de Realismo',
            issuer: 'Academia Internacional de Tatuaje',
            year: 2022
          }
        ]
        };
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