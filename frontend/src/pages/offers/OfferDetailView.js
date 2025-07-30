import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, Card, Grid } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import { offerService } from '../../services/api';
import { getTattooImageUrl, getProfileImageUrl } from '../../utils/imageHelpers';
import toast from 'react-hot-toast';

const OfferDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOfferDetails();
  }, [id]);

  const loadOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await offerService.getById(id);
      setOffer(response.data);
      
      // Load proposals
      if (response.data.proposals) {
        setProposals(response.data.proposals);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading offer details:', err);
      setError('Error al cargar los detalles de la oferta');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-blue-600', text: 'Activa' },
      in_progress: { color: 'bg-yellow-600', text: 'En Proceso' },
      completed: { color: 'bg-green-600', text: 'Completada' },
      cancelled: { color: 'bg-red-600', text: 'Cancelada' }
    };
    return badges[status] || badges.active;
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await offerService.acceptProposal(id, proposalId);
      toast.success('Propuesta aceptada exitosamente');
      loadOfferDetails(); // Reload to get updated status
    } catch (err) {
      console.error('Error accepting proposal:', err);
      toast.error('Error al aceptar la propuesta');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await offerService.rejectProposal(id, proposalId);
      toast.success('Propuesta rechazada');
      loadOfferDetails(); // Reload to get updated status
    } catch (err) {
      console.error('Error rejecting proposal:', err);
      toast.error('Error al rechazar la propuesta');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-primary-400">Cargando detalles de la oferta...</p>
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
            <Button onClick={loadOfferDetails} variant="secondary">
              Reintentar
            </Button>
            <Button onClick={() => navigate('/my-requests')} variant="ghost">
              Volver a mis solicitudes
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!offer) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-primary-400 mb-4">Oferta no encontrada</p>
          <Button onClick={() => navigate('/my-requests')} variant="secondary">
            Volver a mis solicitudes
          </Button>
        </div>
      </PageContainer>
    );
  }

  const statusBadge = getStatusBadge(offer.status);

  return (
    <PageContainer
      title={offer.title}
      subtitle="Detalles de la oferta y propuestas recibidas"
      breadcrumbs={[
        { label: 'Mis Solicitudes', href: '/my-requests' },
        { label: offer.title }
      ]}
      maxWidth="6xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offer Details */}
        <div className="lg:col-span-1">
          <Card title="Detalles de la Solicitud">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-primary-400">Estado:</span>
                <span className={`px-3 py-1 text-sm rounded text-white ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
              </div>
              
              <div>
                <span className="text-primary-400 block mb-1">Descripción:</span>
                <p className="text-primary-200">{offer.description}</p>
              </div>
              
              <div>
                <span className="text-primary-400 block mb-1">Presupuesto:</span>
                <p className="text-primary-200">
                  {formatCurrency(offer.budget_min)} - {formatCurrency(offer.budget_max)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-primary-400 block">Estilo:</span>
                  <span className="text-primary-200">{offer.style_name}</span>
                </div>
                <div>
                  <span className="text-primary-400 block">Tamaño:</span>
                  <span className="text-primary-200">{offer.size_description}</span>
                </div>
                <div>
                  <span className="text-primary-400 block">Parte del cuerpo:</span>
                  <span className="text-primary-200">{offer.body_part_name}</span>
                </div>
                <div>
                  <span className="text-primary-400 block">Color:</span>
                  <span className="text-primary-200">{offer.color_type_name}</span>
                </div>
              </div>
              
              {offer.deadline && (
                <div>
                  <span className="text-primary-400 block mb-1">Fecha límite:</span>
                  <p className="text-primary-200">
                    {new Date(offer.deadline).toLocaleDateString('es-CL')}
                  </p>
                </div>
              )}
              
              {offer.references && offer.references.length > 0 && (
                <div>
                  <span className="text-primary-400 block mb-2">Referencias:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {offer.references.map((ref, index) => (
                      <img
                        key={index}
                        src={getTattooImageUrl(ref.image_url)}
                        alt={`Referencia ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Proposals */}
        <div className="lg:col-span-2">
          <Card title={`Propuestas Recibidas (${proposals.length})`}>
            {proposals.length === 0 ? (
              <div className="text-center py-12">
                <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2z" />
                </svg>
                <p className="text-primary-400 mb-4">Aún no has recibido propuestas</p>
                <p className="text-primary-500 text-sm">Las propuestas aparecerán aquí cuando los tatuadores respondan a tu solicitud</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <Card key={proposal.id} className="hover:bg-primary-750 transition-colors">
                    <div className="flex items-start space-x-4">
                      <img
                        src={getProfileImageUrl(proposal.profile_image)}
                        alt={proposal.first_name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-primary-100">
                              {proposal.first_name} {proposal.last_name}
                            </h4>
                            <p className="text-primary-400 text-sm">{proposal.studio_name}</p>
                            {proposal.rating && (
                              <div className="flex items-center space-x-1 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(proposal.rating) ? 'text-yellow-400' : 'text-primary-600'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs text-primary-400">({proposal.rating})</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-accent-400">
                              {formatCurrency(proposal.proposed_price)}
                            </p>
                            {proposal.estimated_duration && (
                              <p className="text-sm text-primary-400">
                                {proposal.estimated_duration} sesiones
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-primary-300 mb-4">{proposal.message}</p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-primary-500">
                            Enviada hace {Math.floor((new Date() - new Date(proposal.created_at)) / (1000 * 60 * 60 * 24))} días
                          </p>
                          
                          {offer.status === 'active' && (
                            <div className="flex space-x-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleRejectProposal(proposal.id)}
                              >
                                Rechazar
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAcceptProposal(proposal.id)}
                              >
                                Aceptar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default OfferDetailView;