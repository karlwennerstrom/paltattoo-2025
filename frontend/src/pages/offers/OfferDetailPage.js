import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageContainer, Card, Grid } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import { getTattooImageUrl, getProfileImageUrl } from '../../utils/imageHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { offerService, proposalService } from '../../services/api';
import toast from 'react-hot-toast';

const OfferDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isArtist } = useAuth();
  const [offer, setOffer] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // Load offer data from API
  useEffect(() => {
    const loadOffer = async () => {
      try {
        setLoading(true);
        const response = await offerService.getById(id);
        const result = { success: true, data: response.data };
        
        if (result.success) {
          const offerData = result.data;
          
          // Transform API data to match component expectations
          const transformedOffer = {
            id: offerData.id,
            title: offerData.title,
            description: offerData.description,
            budget: offerData.budget_max || offerData.budget_min,
            budgetMin: offerData.budget_min,
            budgetMax: offerData.budget_max,
            style: offerData.style_name,
            size: offerData.size_approximate,
            bodyPart: offerData.body_part_name,
            status: offerData.status,
            references: offerData.references || [],
            user: {
              id: offerData.client_user_id,
              name: `${offerData.client_first_name || ''} ${offerData.client_last_name || ''}`.trim(),
              location: offerData.comuna_name ? `${offerData.comuna_name}, ${offerData.region}` : 'Chile',
              avatar: null,
              rating: null,
              reviewsCount: 0
            },
            createdAt: offerData.created_at,
            deadline: offerData.deadline,
            proposalsCount: offerData.proposal_count || 0,
            viewsCount: 0,
            tags: []
          };

          // Transform proposals data
          const transformedProposals = (offerData.proposals || []).map(proposal => ({
            id: proposal.id,
            artist: {
              id: proposal.artist_id,
              name: `${proposal.first_name || ''} ${proposal.last_name || ''}`.trim() || 'Tatuador',
              location: proposal.comuna_name || 'Chile',
              avatar: proposal.profile_image,
              rating: proposal.rating || 0,
              reviewsCount: 0,
              specialties: []
            },
            message: proposal.message,
            estimatedPrice: proposal.proposed_price,
            estimatedDuration: proposal.estimated_duration,
            sessionCount: 1,
            portfolioImages: [],
            createdAt: proposal.created_at,
            status: proposal.status
          }));
          
          setOffer(transformedOffer);
          setProposals(transformedProposals);
        } else {
          toast.error(result.error);
          navigate('/feed');
        }
      } catch (error) {
        console.error('Error loading offer:', error);
        toast.error('Error al cargar la oferta');
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOffer();
    }
  }, [id, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
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

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Here you would make an API call to toggle favorite
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer.title,
        text: offer.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleSendProposal = () => {
    navigate(`/proposals/send/${offer.id}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
        </div>
      </PageContainer>
    );
  }

  if (!offer) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-error-400 text-lg mb-4">Oferta no encontrada</p>
          <Button variant="secondary" onClick={() => navigate('/feed')}>
            Volver al Feed
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="6xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-primary-400">
          <Link to="/feed" className="hover:text-accent-400 transition-colors">
            Feed
          </Link>
          <span>•</span>
          <span className="text-primary-200">Detalles de la solicitud</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Offer Details */}
          <Card>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {offer.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-primary-400">
                    <span>{timeAgo(offer.createdAt)}</span>
                    <span>•</span>
                    <span>{offer.viewsCount} visualizaciones</span>
                    <span>•</span>
                    <span>{offer.proposalsCount} propuestas</span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-lg border transition-all ${
                      isFavorited 
                        ? 'border-accent-500 text-accent-500 bg-accent-500/10' 
                        : 'border-white/20 text-white/60 hover:border-accent-500/50 hover:text-accent-500'
                    }`}
                    aria-label="Favorito"
                  >
                    <svg className="h-5 w-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg border border-white/20 text-white/60 hover:border-accent-500/50 hover:text-accent-500 transition-all"
                    aria-label="Compartir"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0l-5.464 0m5.464 0l.553.554a.9.9 0 011.273 0l.554-.554m-7.29 0l-.554.554a.9.9 0 01-1.273 0l-.554-.554m7.29 0a9 9 0 10-5.464 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Reference Image */}
              {offer.referenceImage && (
                <div className="aspect-video bg-primary-800 rounded-lg overflow-hidden">
                  <img
                    src={getTattooImageUrl(offer.referenceImage)}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Descripción</h3>
                <p className="text-primary-300 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              {/* Tags */}
              {offer.tags && offer.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {offer.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary-700 text-primary-300 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Proposals Section */}
          <Card>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  Propuestas ({proposals.length})
                </h2>
                {isArtist && (
                  <Button variant="primary" onClick={handleSendProposal}>
                    Enviar Propuesta
                  </Button>
                )}
              </div>

              {proposals.length > 0 ? (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border border-primary-600 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        {/* Artist Avatar */}
                        <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {proposal.artist.avatar ? (
                            <img 
                              src={getProfileImageUrl(proposal.artist.avatar)} 
                              alt={proposal.artist.name} 
                              className="h-full w-full rounded-full object-cover" 
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary-200">
                              {proposal.artist.name?.[0] || '?'}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Artist Info */}
                          <div className="flex items-center space-x-2 mb-2">
                            <Link 
                              to={`/artists/${proposal.artist.id}`}
                              className="font-medium text-white hover:text-accent-400 transition-colors"
                            >
                              {proposal.artist.name}
                            </Link>
                            <span className="text-primary-400">•</span>
                            <span className="text-sm text-primary-400">{proposal.artist.location}</span>
                            <span className="text-primary-400">•</span>
                            <div className="flex items-center">
                              <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm text-primary-300">
                                {proposal.artist.rating} ({proposal.artist.reviewsCount})
                              </span>
                            </div>
                          </div>

                          {/* Specialties */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {proposal.artist.specialties.map((specialty, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-accent-500/20 text-accent-400 text-xs rounded"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>

                          {/* Proposal Details */}
                          <p className="text-primary-300 mb-3">{proposal.message}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-primary-400">Precio:</span>
                              <p className="font-medium text-accent-400">{formatCurrency(proposal.estimatedPrice)}</p>
                            </div>
                            <div>
                              <span className="text-primary-400">Duración:</span>
                              <p className="font-medium text-primary-200">{proposal.estimatedDuration}</p>
                            </div>
                            <div>
                              <span className="text-primary-400">Sesiones:</span>
                              <p className="font-medium text-primary-200">{proposal.sessionCount}</p>
                            </div>
                            <div>
                              <span className="text-primary-400">Enviada:</span>
                              <p className="font-medium text-primary-200">{timeAgo(proposal.createdAt)}</p>
                            </div>
                          </div>

                          {/* Actions for client */}
                          {user && user.id === offer.user.id && (
                            <div className="flex space-x-3 mt-4 pt-3 border-t border-primary-600">
                              <Button variant="primary" size="sm">
                                Aceptar Propuesta
                              </Button>
                              <Button variant="secondary" size="sm">
                                Ver Perfil
                              </Button>
                              <Button variant="ghost" size="sm">
                                Mensaje
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-primary-400 mb-4">Aún no hay propuestas para esta solicitud</p>
                  {isArtist && (
                    <Button variant="primary" onClick={handleSendProposal}>
                      Ser el primero en proponer
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Offer Summary */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Resumen</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-400">Presupuesto:</span>
                  <span className="text-accent-400 font-medium">
                    {offer.budgetMin && offer.budgetMax && offer.budgetMin !== offer.budgetMax 
                      ? `${formatCurrency(offer.budgetMin)} - ${formatCurrency(offer.budgetMax)}`
                      : formatCurrency(offer.budget || offer.budgetMax || offer.budgetMin)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-400">Estilo:</span>
                  <span className="text-primary-200">{offer.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-400">Tamaño:</span>
                  <span className="text-primary-200">{offer.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-400">Ubicación:</span>
                  <span className="text-primary-200">{offer.bodyPart}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-400">Estado:</span>
                  <span className="text-success-400 capitalize">{offer.status}</span>
                </div>
                {offer.deadline && (
                  <div className="flex justify-between">
                    <span className="text-primary-400">Fecha límite:</span>
                    <span className="text-primary-200">
                      {new Date(offer.deadline).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                )}
              </div>

              {isArtist && (
                <div className="pt-4 border-t border-primary-600">
                  <Button variant="primary" fullWidth onClick={handleSendProposal}>
                    Enviar Propuesta
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Client Info */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Cliente</h3>
              
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                  {offer.user.avatar ? (
                    <img 
                      src={getProfileImageUrl(offer.user.avatar)} 
                      alt={offer.user.name} 
                      className="h-full w-full rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-sm font-medium text-primary-200">
                      {offer.user.name?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <Link 
                    to={`/users/${offer.user.id}`}
                    className="font-medium text-white hover:text-accent-400 transition-colors"
                  >
                    {offer.user.name}
                  </Link>
                  <p className="text-sm text-primary-400">{offer.user.location}</p>
                  {offer.user.rating && (
                    <div className="flex items-center mt-1">
                      <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-primary-300">
                        {offer.user.rating} ({offer.user.reviewsCount} reseñas)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Similar Offers */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Ofertas similares</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Link 
                    key={i}
                    to={`/offers/${i}`}
                    className="block p-3 rounded-lg border border-primary-600 hover:border-accent-500/50 transition-colors"
                  >
                    <h4 className="text-sm font-medium text-white mb-1">
                      Diseño tradicional japonés
                    </h4>
                    <p className="text-xs text-primary-400 mb-2">
                      Estilo: Japonés • Brazo
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-accent-400">
                        {formatCurrency(250000)}
                      </span>
                      <span className="text-xs text-primary-500">
                        {3} propuestas
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default OfferDetailPage;