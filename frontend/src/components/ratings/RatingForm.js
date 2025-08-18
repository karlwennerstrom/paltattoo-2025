import React, { useState, useEffect } from 'react';
import { Card } from '../common/Layout';
import Button from '../common/Button';
import StarRating from '../common/StarRating';
import { ratingService } from '../../services/api';
import { getProfileImageUrl } from '../../utils/imageHelpers';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiSend, FiCheck } from 'react-icons/fi';

const RatingForm = ({ 
  ratedUser, 
  tattooRequestId, 
  proposalId, 
  onRatingSubmitted = null,
  className = ''
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canRate, setCanRate] = useState(null);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    checkRatingPermission();
  }, [ratedUser?.id, tattooRequestId, proposalId]);

  const checkRatingPermission = async () => {
    if (!ratedUser?.id || !tattooRequestId || !proposalId) {
      setCheckingPermission(false);
      return;
    }

    try {
      setCheckingPermission(true);
      const response = await ratingService.canRate(
        ratedUser.id, 
        tattooRequestId, 
        proposalId
      );
      
      if (response.data?.success) {
        setCanRate(response.data.data);
      } else {
        setCanRate({ canRate: false, reason: 'Error al verificar permisos' });
      }
    } catch (error) {
      console.error('Error checking rating permission:', error);
      setCanRate({ canRate: false, reason: 'Error al verificar permisos' });
    } finally {
      setCheckingPermission(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    if (!canRate?.canRate) {
      toast.error(canRate?.reason || 'No puedes calificar en este momento');
      return;
    }

    try {
      setLoading(true);
      
      const ratingData = {
        rated_id: ratedUser.id,
        rated_type: ratedUser.type || (ratedUser.id ? 'artist' : 'client'),
        rating,
        comment: comment.trim(),
        tattoo_request_id: tattooRequestId,
        proposal_id: proposalId
      };

      const response = await ratingService.create(ratingData);
      
      if (response.data?.success) {
        setSubmitted(true);
        toast.success('¡Calificación enviada exitosamente!');
        
        if (onRatingSubmitted) {
          onRatingSubmitted(response.data.data);
        }
        
        // Reset form
        setRating(0);
        setComment('');
      } else {
        toast.error(response.data?.message || 'Error al enviar calificación');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMessage = error.response?.data?.message || 'Error al enviar calificación';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingPermission) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-primary-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-primary-700 rounded mb-4"></div>
          <div className="h-20 bg-primary-700 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!canRate?.canRate) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <p className="text-primary-400 mb-2">No se puede calificar</p>
          <p className="text-primary-500 text-sm">{canRate?.reason}</p>
        </div>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-primary-100 mb-2">
            ¡Calificación enviada!
          </h3>
          <p className="text-primary-400">
            Gracias por tu feedback. Esto ayuda a mejorar la comunidad de PalTattoo.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary-100 mb-2">
          Calificar experiencia
        </h3>
        
        {ratedUser && (
          <div className="flex items-center space-x-3 mb-4 p-3 bg-primary-800 rounded-lg">
            <img
              src={getProfileImageUrl(ratedUser.profile_image || ratedUser.avatar)}
              alt={`${ratedUser.first_name || ratedUser.name} ${ratedUser.last_name || ''}`}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-avatar.jpg';
              }}
            />
            <div>
              <h4 className="font-medium text-primary-100">
                {ratedUser.first_name || ratedUser.name} {ratedUser.last_name || ''}
              </h4>
              <p className="text-primary-400 text-sm">
                {ratedUser.type === 'artist' ? 'Tatuador' : 'Cliente'}
              </p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Calificación *
          </label>
          <div className="flex items-center space-x-3">
            <StarRating
              rating={rating}
              interactive={true}
              onChange={setRating}
              size="lg"
            />
            {rating > 0 && (
              <span className="text-sm text-primary-300">
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia trabajando con esta persona..."
            className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-xs text-primary-500 mt-1">
            {comment.length}/500
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={rating === 0 || loading}
            loading={loading}
          >
            <FiSend className="w-4 h-4 mr-2" />
            Enviar calificación
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RatingForm;