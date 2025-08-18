import React, { useState, useEffect } from 'react';
import { Card } from '../common/Layout';
import StarRating from '../common/StarRating';
import { ratingService } from '../../services/api';
import { getProfileImageUrl } from '../../utils/imageHelpers';
import { FiUser, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

const RatingDisplay = ({ userId, showStats = true, maxVisible = 5, className = '' }) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRatings();
  }, [userId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ratingService.getUserRatings(userId, {
        page: 1,
        limit: showAll ? 100 : maxVisible,
        includeComment: true
      });
      
      if (response.data?.success) {
        setRatings(response.data.data.ratings || []);
        setStats(response.data.data.stats || null);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      setError('Error al cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className={twMerge('p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-primary-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-primary-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={twMerge('p-6 text-center', className)}>
        <p className="text-red-400">{error}</p>
      </Card>
    );
  }

  const displayedRatings = showAll ? ratings : ratings.slice(0, maxVisible);
  const hasMore = ratings.length > maxVisible;

  return (
    <div className={twMerge('space-y-6', className)}>
      {/* Rating Statistics */}
      {showStats && stats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary-100 mb-4">
            Calificaciones
          </h3>
          
          <div className="flex items-center space-x-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-100">
                {parseFloat(stats.avg_rating || 0).toFixed(1)}
              </div>
              <StarRating rating={parseFloat(stats.avg_rating || 0)} size="md" />
              <div className="text-sm text-primary-400 mt-1">
                {stats.total_ratings} calificación{stats.total_ratings !== 1 ? 'es' : ''}
              </div>
            </div>
            
            {/* Rating breakdown */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats[`${['one', 'two', 'three', 'four', 'five'][star - 1]}_star`] || 0;
                const percentage = stats.total_ratings > 0 ? (count / stats.total_ratings) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center space-x-2 text-sm">
                    <span className="w-2 text-primary-300">{star}</span>
                    <div className="flex-1 bg-primary-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-primary-400 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Individual Ratings */}
      {ratings.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primary-100">
              Comentarios de clientes
            </h4>
            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center space-x-1 text-accent-400 hover:text-accent-300 transition-colors text-sm"
              >
                <span>{showAll ? 'Ver menos' : `Ver todos (${ratings.length})`}</span>
                {showAll ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {displayedRatings.map((rating) => (
              <div key={rating.id} className="border-b border-primary-700 last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start space-x-3">
                  <img
                    src={getProfileImageUrl(rating.rater_profile_image)}
                    alt={`${rating.rater_first_name} ${rating.rater_last_name}`}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-avatar.jpg';
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-primary-100">
                          {rating.rater_first_name} {rating.rater_last_name}
                        </h5>
                        <div className="flex items-center space-x-2">
                          <StarRating rating={rating.rating} size="sm" />
                          <span className="text-xs text-primary-500">
                            {formatDate(rating.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {rating.comment && (
                      <p className="text-primary-300 text-sm leading-relaxed">
                        {rating.comment}
                      </p>
                    )}
                    
                    {rating.tattoo_request_title && (
                      <div className="mt-2 text-xs text-primary-500">
                        Proyecto: {rating.tattoo_request_title}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <FiUser className="w-12 h-12 text-primary-600 mx-auto mb-3" />
          <p className="text-primary-400">Aún no hay calificaciones</p>
          <p className="text-primary-500 text-sm mt-1">
            Las calificaciones aparecerán aquí después de completar trabajos
          </p>
        </Card>
      )}
    </div>
  );
};

export default RatingDisplay;