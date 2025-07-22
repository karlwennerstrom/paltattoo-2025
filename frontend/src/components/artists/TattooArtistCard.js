import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Button from '../common/Button';
import SubscriptionBadge from '../common/SubscriptionBadge';
import { getProfileImageUrl, getTattooImageUrl } from '../../utils/imageHelpers';

const TattooArtistCard = ({ artist, onFavorite, onContact, className = '' }) => {
  const [isFavorited, setIsFavorited] = useState(artist.isFavorited || false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (onFavorite) {
      onFavorite(artist.id, !isFavorited);
    }
  };

  const handleContact = () => {
    if (onContact) {
      onContact(artist);
    }
  };

  const getLocationDisplay = (location) => {
    if (typeof location === 'string') return location;
    if (location?.city && location?.country) {
      return `${location.city}, ${location.country}`;
    }
    return location?.city || location?.country || 'Sin ubicación';
  };

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

  return (
    <div className={twMerge('card hover:shadow-tattoo-lg transition-all duration-300', className)}>
      {/* Header with avatar and favorite */}
      <div className="relative p-4 pb-0">
        <div className="flex items-start justify-between">
          <Link to={`/artists/${artist.id}`} className="flex items-center space-x-3 flex-1">
            <div className="relative">
              {!imageLoaded && (
                <div className="h-16 w-16 bg-primary-700 rounded-full animate-pulse"></div>
              )}
              <img
                src={getProfileImageUrl(artist.profileImage)}
                alt={artist.name}
                className={twMerge(
                  'h-16 w-16 rounded-full object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
                )}
                onLoad={() => setImageLoaded(true)}
              />
              {artist.isOnline && (
                <div className="absolute bottom-0 right-0 h-4 w-4 bg-success-500 border-2 border-primary-800 rounded-full"></div>
              )}
              {artist.verified && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-accent-500 rounded-full flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-primary-100 hover:text-accent-400 transition-colors">
                  {artist.name}
                </h3>
                <SubscriptionBadge 
                  subscriptionType={artist.subscriptionType || artist.subscription?.plan_type} 
                  size="xs" 
                />
              </div>
              <p className="text-sm text-primary-400">{getLocationDisplay(artist.location)}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getRatingStars(artist.rating || 5)}
                <span className="text-xs text-primary-400 ml-1">
                  ({artist.reviewsCount || 0} reseñas)
                </span>
              </div>
            </div>
          </Link>
          
          <button
            onClick={handleFavorite}
            className={twMerge(
              'p-2 rounded-full hover:bg-primary-700 transition-colors',
              isFavorited && 'text-accent-500'
            )}
            aria-label="Favorito"
          >
            <svg className="h-5 w-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Portfolio preview */}
      {artist.portfolioImages && artist.portfolioImages.length > 0 && (
        <div className="px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            {artist.portfolioImages.slice(0, 3).map((image, index) => (
              <Link key={index} to={`/artists/${artist.id}`} className="block">
                <img
                  src={getTattooImageUrl(image)}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                />
              </Link>
            ))}
          </div>
          {artist.portfolioImages.length > 3 && (
            <Link to={`/artists/${artist.id}`} className="block text-center mt-2">
              <span className="text-xs text-accent-400 hover:text-accent-300">
                +{artist.portfolioImages.length - 3} más trabajos
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Specialties */}
      <div className="px-4 py-2">
        <div className="flex flex-wrap gap-1">
          {artist.specialties?.slice(0, 3).map((specialty, index) => (
            <span key={index} className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
              {specialty}
            </span>
          ))}
          {artist.specialties?.length > 3 && (
            <span className="px-2 py-1 text-primary-400 text-xs">
              +{artist.specialties.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-t border-primary-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-semibold text-accent-400">{artist.experienceYears || 0}</p>
            <p className="text-xs text-primary-500">Años exp.</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-accent-400">{artist.completedWorks || 0}</p>
            <p className="text-xs text-primary-500">Trabajos</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-accent-400">
              ${artist.priceRange?.min || 0}k+
            </p>
            <p className="text-xs text-primary-500">Desde</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 space-y-2">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleContact}
        >
          Contactar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          href={`/artists/${artist.id}`}
        >
          Ver Perfil
        </Button>
      </div>

      {/* Status badges */}
      <div className="absolute top-4 left-4 flex flex-col space-y-1">
        {artist.acceptingWork && (
          <span className="px-2 py-1 bg-success-600 text-white text-xs font-medium rounded">
            Disponible
          </span>
        )}
        {artist.isPromoted && (
          <span className="px-2 py-1 bg-accent-600 text-white text-xs font-medium rounded">
            Destacado
          </span>
        )}
      </div>
    </div>
  );
};

export default TattooArtistCard;