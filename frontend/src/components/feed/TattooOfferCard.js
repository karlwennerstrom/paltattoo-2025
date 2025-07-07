import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Button from '../common/Button';
import { getTattooImageUrl, getProfileImageUrl } from '../../utils/imageHelpers';
import { useAuth } from '../../context';

const TattooOfferCard = ({ offer, onFavorite, onShare, onSendProposal, className = '' }) => {
  const { isArtist } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(offer.isFavorited || false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (onFavorite) {
      onFavorite(offer.id, !isFavorited);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(offer);
    } else {
      // Default share functionality
      if (navigator.share) {
        navigator.share({
          title: offer.title,
          text: offer.description,
          url: window.location.origin + `/offers/${offer.id}`,
        });
      }
    }
  };

  const handleSendProposal = () => {
    if (onSendProposal) {
      onSendProposal(offer);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      día: 86400,
      hora: 3600,
      minuto: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `hace ${interval} ${unit}${interval > 1 ? 's' : ''}`;
      }
    }
    return 'hace un momento';
  };

  return (
    <div className={twMerge('card hover:shadow-tattoo-lg transition-all duration-300', className)}>
      {/* Image section */}
      <div className="relative aspect-square bg-primary-800 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
          </div>
        )}
        <img
          src={getTattooImageUrl(offer.referenceImage)}
          alt={offer.title}
          className={twMerge(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Status badge */}
        {offer.status === 'urgent' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-error-600 text-white text-xs font-medium rounded">
            Urgente
          </div>
        )}
        
        {/* Price badge */}
        <div className="absolute top-2 right-2 px-3 py-1 bg-black bg-opacity-75 text-white text-sm font-medium rounded">
          {formatPrice(offer.budget)}
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button
            onClick={handleFavorite}
            className={twMerge(
              'p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all',
              isFavorited && 'text-accent-500'
            )}
            aria-label="Favorito"
          >
            <svg className="h-5 w-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-all"
            aria-label="Compartir"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0l-5.464 0m5.464 0l.553.554a.9.9 0 011.273 0l.554-.554m-7.29 0l-.554.554a.9.9 0 01-1.273 0l-.554-.554m7.29 0a9 9 0 10-5.464 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content section */}
      <div className="p-4">
        {/* Title and time */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-primary-100 flex-1 mr-2">
            <Link to={`/offers/${offer.id}`} className="hover:text-accent-400 transition-colors">
              {offer.title}
            </Link>
          </h3>
          <span className="text-xs text-primary-500 whitespace-nowrap">
            {timeAgo(offer.createdAt)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-primary-300 mb-3 line-clamp-2">
          {offer.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {offer.style && (
            <span className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
              {offer.style}
            </span>
          )}
          {offer.size && (
            <span className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
              {offer.size}
            </span>
          )}
          {offer.bodyPart && (
            <span className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
              {offer.bodyPart}
            </span>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center justify-between">
          <Link to={`/users/${offer.user.id}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              {offer.user.avatar ? (
                <img src={getProfileImageUrl(offer.user.avatar)} alt={offer.user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-primary-200">
                  {offer.user.name?.[0] || '?'}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-primary-200">{offer.user.name}</p>
              <p className="text-xs text-primary-400">{offer.user.location}</p>
            </div>
          </Link>

          {/* Proposals count */}
          <div className="text-right">
            <p className="text-sm font-medium text-accent-400">{offer.proposalsCount || 0}</p>
            <p className="text-xs text-primary-400">propuestas</p>
          </div>
        </div>

        {/* Action button for artists */}
        {isArtist() && (
          <div className="mt-4 pt-3 border-t border-primary-700">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleSendProposal}
              className="text-sm"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Enviar Propuesta
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TattooOfferCard;