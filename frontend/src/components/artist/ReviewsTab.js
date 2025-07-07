import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import { getProfileImageUrl } from '../../utils/imageHelpers';

const ReviewsTab = () => {
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const reviews = [
    {
      id: 1,
      client: {
        name: 'María González',
        avatar: null,
        isVerified: true
      },
      rating: 5,
      title: 'Trabajo excepcional',
      comment: 'Carlos es un artista increíble. Mi tatuaje de león quedó mejor de lo que imaginé. Muy profesional, limpio y atento a todos los detalles. Definitivamente volvería para mi próximo tatuaje.',
      date: '2024-01-20',
      workTitle: 'Tatuaje de León Realista',
      helpful: 12,
      images: ['/placeholder-tattoo-1.jpg']
    },
    {
      id: 2,
      client: {
        name: 'Ana Martínez',
        avatar: null,
        isVerified: false
      },
      rating: 5,
      title: 'Experiencia perfecta',
      comment: 'Primera vez tatuándome y Carlos me hizo sentir muy cómoda. Explicó todo el proceso, fue muy paciente con mis preguntas y el resultado es hermoso.',
      date: '2024-01-18',
      workTitle: 'Mandala Ornamental',
      helpful: 8,
      images: []
    },
    {
      id: 3,
      client: {
        name: 'Diego Rivera',
        avatar: null,
        isVerified: true
      },
      rating: 4,
      title: 'Muy buen trabajo',
      comment: 'Excelente técnica y muy profesional. El tatuaje sanó perfecto y el estudio muy limpio. Solo le doy 4 estrellas porque la cita se retrasó un poco.',
      date: '2024-01-15',
      workTitle: 'Cover-up Hombro',
      helpful: 5,
      images: ['/placeholder-tattoo-2.jpg']
    },
    {
      id: 4,
      client: {
        name: 'Sofía López',
        avatar: null,
        isVerified: true
      },
      rating: 5,
      title: 'Recomendado 100%',
      comment: 'Carlos transformó mi idea en una obra de arte. Su atención al detalle es impresionante y su trato muy amable. El proceso de curación fue perfecto.',
      date: '2024-01-12',
      workTitle: 'Retrato Black & Grey',
      helpful: 15,
      images: ['/placeholder-tattoo-3.jpg', '/placeholder-tattoo-4.jpg']
    },
    {
      id: 5,
      client: {
        name: 'Carlos Mendoza',
        avatar: null,
        isVerified: false
      },
      rating: 4,
      title: 'Buena experiencia',
      comment: 'Buen trabajo en general. El tatuaje quedó bien y Carlos es profesional. El estudio está bien equipado y limpio.',
      date: '2024-01-10',
      workTitle: 'Tatuaje Geométrico',
      helpful: 3,
      images: []
    }
  ];

  const ratingOptions = [
    { value: 'all', label: 'Todas', count: reviews.length },
    { value: '5', label: '5 estrellas', count: reviews.filter(r => r.rating === 5).length },
    { value: '4', label: '4 estrellas', count: reviews.filter(r => r.rating === 4).length },
    { value: '3', label: '3 estrellas', count: reviews.filter(r => r.rating === 3).length },
    { value: '2', label: '2 estrellas', count: reviews.filter(r => r.rating === 2).length },
    { value: '1', label: '1 estrella', count: reviews.filter(r => r.rating === 1).length }
  ];

  const filteredReviews = selectedRating === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(selectedRating));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }));

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={twMerge(
          'h-4 w-4',
          i < rating ? 'text-yellow-400' : 'text-primary-600'
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const timeAgo = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 30) return `Hace ${days} días`;
    const months = Math.floor(days / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Mis Reseñas</h1>
          <p className="text-primary-400">Gestiona y responde a las reseñas de tus clientes</p>
        </div>
      </div>

      {/* Summary Stats */}
      <Grid cols={4} gap={6}>
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent-400 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {getRatingStars(Math.round(averageRating))}
          </div>
          <p className="text-sm text-primary-400">Calificación promedio</p>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-100 mb-2">
            {reviews.length}
          </div>
          <p className="text-sm text-primary-400">Total de reseñas</p>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-success-400 mb-2">
            {Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)}%
          </div>
          <p className="text-sm text-primary-400">Satisfacción</p>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-100 mb-2">
            {reviews.filter(r => r.images.length > 0).length}
          </div>
          <p className="text-sm text-primary-400">Con fotos</p>
        </Card>
      </Grid>

      {/* Rating Distribution */}
      <Card title="Distribución de Calificaciones">
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm text-primary-300">{rating}</span>
                <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1 bg-primary-700 rounded-full h-3">
                <div
                  className="bg-accent-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-primary-400 w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRating(option.value)}
              className={twMerge(
                'px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1',
                selectedRating === option.value
                  ? 'bg-accent-600 text-white'
                  : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
              )}
            >
              <span>{option.label}</span>
              <span className={twMerge(
                'px-1.5 py-0.5 text-xs rounded',
                selectedRating === option.value
                  ? 'bg-white bg-opacity-20'
                  : 'bg-primary-600'
              )}>
                {option.count}
              </span>
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-sm text-primary-100 focus:border-accent-500 focus:outline-none"
        >
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguas</option>
          <option value="highest">Mejor calificadas</option>
          <option value="lowest">Peor calificadas</option>
          <option value="helpful">Más útiles</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-primary-400">No hay reseñas con esta calificación</p>
          </Card>
        ) : (
          sortedReviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={getProfileImageUrl(review.client.avatar)}
                  alt={review.client.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-primary-100">{review.client.name}</h3>
                      {review.client.isVerified && (
                        <svg className="h-5 w-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-primary-500">{timeAgo(review.date)}</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {getRatingStars(review.rating)}
                    </div>
                    <span className="text-sm text-primary-400">para {review.workTitle}</span>
                  </div>

                  <h4 className="text-primary-100 font-medium mb-2">{review.title}</h4>
                  <p className="text-primary-300 mb-4">{review.comment}</p>

                  {/* Review Images */}
                  {review.images.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-200 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>Útil ({review.helpful})</span>
                      </button>
                      <button className="text-sm text-accent-400 hover:text-accent-300 transition-colors">
                        Responder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;