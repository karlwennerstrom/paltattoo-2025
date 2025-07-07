import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { PageContainer, Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import PortfolioGallery from './PortfolioGallery';
import ContactInfo from './ContactInfo';
import SpecialtiesDisplay from './SpecialtiesDisplay';
import { getProfileImageUrl } from '../../utils/imageHelpers';

const PublicArtistProfile = ({ artist, className = '' }) => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isFollowing, setIsFollowing] = useState(artist?.isFollowing || false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // In production: make API call to follow/unfollow artist
  };

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', count: artist?.portfolioImages?.length || 12 },
    { id: 'about', label: 'Sobre mí', count: null },
    { id: 'reviews', label: 'Reseñas', count: artist?.reviewsCount || 0 },
    { id: 'contact', label: 'Contacto', count: null },
  ];

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Fill remaining stars with empty ones
    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <svg key={i} className="h-4 w-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return (
          <PortfolioGallery
            images={artist?.portfolioImages}
            artist={artist}
          />
        );
      
      case 'about':
        return (
          <div className="space-y-6">
            <Card title="Biografía">
              <p className="text-primary-300 leading-relaxed">
                {artist?.bio || 'Artista tatuador especializado en diversos estilos con amplia experiencia en el mundo del tatuaje.'}
              </p>
            </Card>

            <Card title="Especialidades">
              <SpecialtiesDisplay specialties={artist?.specialties} />
            </Card>

            <Card title="Experiencia">
              <Grid cols={2} gap={4}>
                <div className="text-center p-4 bg-primary-800 rounded-lg">
                  <p className="text-2xl font-bold text-accent-400">{artist?.experienceYears || 5}+</p>
                  <p className="text-sm text-primary-400">Años de experiencia</p>
                </div>
                <div className="text-center p-4 bg-primary-800 rounded-lg">
                  <p className="text-2xl font-bold text-accent-400">{artist?.completedWorks || 200}+</p>
                  <p className="text-sm text-primary-400">Trabajos completados</p>
                </div>
              </Grid>
            </Card>

            {artist?.certifications && (
              <Card title="Certificaciones">
                <div className="space-y-3">
                  {artist.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-primary-800 rounded-lg">
                      <svg className="h-6 w-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <div>
                        <p className="text-primary-100 font-medium">{cert.name}</p>
                        <p className="text-primary-400 text-sm">{cert.issuer} - {cert.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-4">
            <Card>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  {getRatingStars(artist?.rating || 5)}
                </div>
                <p className="text-2xl font-bold text-primary-100">{artist?.rating || 5.0}</p>
                <p className="text-primary-400">{artist?.reviewsCount || 0} reseñas</p>
              </div>

              {/* Mock reviews */}
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="border-b border-primary-700 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-200">
                          {`U${i + 1}`}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-primary-100">Usuario {i + 1}</p>
                          <div className="flex items-center space-x-1">
                            {getRatingStars(5 - i * 0.2)}
                          </div>
                        </div>
                        <p className="text-primary-300 text-sm">
                          Excelente trabajo, muy profesional y atento a los detalles. 
                          El resultado superó mis expectativas.
                        </p>
                        <p className="text-primary-500 text-xs mt-2">
                          Hace {i + 1} mes{i > 0 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'contact':
        return <ContactInfo artist={artist} />;

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-primary-800 to-primary-700 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={getProfileImageUrl(artist?.profileImage)}
              alt={artist?.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-primary-600"
            />
            {artist?.isOnline && (
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-success-500 border-2 border-primary-700 rounded-full"></div>
            )}
            {artist?.verified && (
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-accent-500 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary-100 mb-1">{artist?.name}</h1>
                <p className="text-primary-400 mb-2">{artist?.location}</p>
                <div className="flex items-center space-x-1 mb-3">
                  {getRatingStars(artist?.rating || 5)}
                  <span className="text-sm text-primary-400 ml-1">
                    ({artist?.reviewsCount || 0} reseñas)
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-primary-400">
                  <span>{artist?.experienceYears || 5}+ años exp.</span>
                  <span>•</span>
                  <span>{artist?.completedWorks || 200}+ trabajos</span>
                  <span>•</span>
                  <span className={twMerge(
                    'px-2 py-1 rounded text-xs',
                    artist?.acceptingWork 
                      ? 'bg-success-600 text-white' 
                      : 'bg-error-600 text-white'
                  )}>
                    {artist?.acceptingWork ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Button
                  variant={isFollowing ? "secondary" : "ghost"}
                  size="sm"
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
                <Button variant="ghost" size="sm">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0l-5.464 0m5.464 0l.553.554a.9.9 0 011.273 0l.554-.554m-7.29 0l-.554.554a.9.9 0 01-1.273 0l-.554-.554m7.29 0a9 9 0 10-5.464 0" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="absolute top-4 right-4 flex flex-col space-y-1">
          {artist?.isPromoted && (
            <span className="px-2 py-1 bg-accent-600 text-white text-xs font-medium rounded">
              Destacado
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-primary-700 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={twMerge(
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-accent-500 text-accent-400'
                  : 'border-transparent text-primary-400 hover:text-primary-200 hover:border-primary-600'
              )}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 text-xs bg-primary-700 text-primary-300 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PublicArtistProfile;