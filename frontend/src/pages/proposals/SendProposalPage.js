import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, Card, Grid } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getTattooImageUrl, getProfileImageUrl } from '../../utils/imageHelpers';

const SendProposalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [proposal, setProposal] = useState({
    message: '',
    estimatedPrice: '',
    estimatedDuration: '',
    sessionCount: '1',
    startDate: '',
    portfolioImages: [],
    notes: ''
  });

  // Mock offer data
  useEffect(() => {
    const loadOffer = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockOffer = {
        id: parseInt(id),
        title: 'Diseño de dragón japonés',
        description: 'Busco artista especializado para realizar este diseño. Tengo referencias y estoy abierto a sugerencias creativas.',
        budget: 350000,
        style: 'Japonés',
        size: 'Mediano',
        bodyPart: 'Brazo',
        referenceImage: null,
        user: {
          id: 1,
          name: 'María González',
          location: 'Santiago, Chile',
          avatar: null,
        },
        createdAt: '2024-01-20T10:30:00Z'
      };
      
      setOffer(mockOffer);
      setLoading(false);
    };

    loadOffer();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!proposal.message || !proposal.estimatedPrice) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success and redirect
      alert('¡Propuesta enviada exitosamente!');
      navigate('/proposals');
    } catch (error) {
      alert('Error al enviar la propuesta. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
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
          <p className="text-error-400">Oferta no encontrada</p>
          <Button variant="secondary" onClick={() => navigate('/feed')} className="mt-4">
            Volver al Feed
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Enviar Propuesta"
      subtitle="Presenta tu mejor propuesta para este proyecto"
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Offer Details */}
        <div className="lg:col-span-1">
          <Card title="Detalles de la Solicitud">
            <div className="space-y-4">
              {/* Offer Image */}
              <div className="aspect-square bg-primary-800 rounded-lg overflow-hidden">
                <img
                  src={getTattooImageUrl(offer.referenceImage)}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Offer Info */}
              <div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">{offer.title}</h3>
                <p className="text-primary-300 text-sm mb-4">{offer.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary-400">Presupuesto:</span>
                    <span className="text-accent-400 font-medium">{formatCurrency(offer.budget)}</span>
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
                </div>
              </div>

              {/* Client Info */}
              <div className="pt-4 border-t border-primary-700">
                <h4 className="text-sm font-medium text-primary-200 mb-3">Cliente</h4>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
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
                    <p className="text-primary-100 font-medium">{offer.user.name}</p>
                    <p className="text-primary-400 text-xs">{offer.user.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Proposal Form */}
        <div className="lg:col-span-2">
          <Card title="Tu Propuesta">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Mensaje para el cliente *
                </label>
                <textarea
                  value={proposal.message}
                  onChange={(e) => setProposal(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Presenta tu experiencia, enfoque para este proyecto y por qué eres la mejor opción..."
                  rows={5}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
                  required
                />
              </div>

              {/* Price and Duration */}
              <Grid cols={2} gap={4}>
                <Input
                  label="Precio estimado (CLP) *"
                  type="number"
                  value={proposal.estimatedPrice}
                  onChange={(e) => setProposal(prev => ({ ...prev, estimatedPrice: e.target.value }))}
                  placeholder="250000"
                  required
                />
                <Input
                  label="Duración estimada"
                  value={proposal.estimatedDuration}
                  onChange={(e) => setProposal(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  placeholder="3-4 horas"
                />
              </Grid>

              {/* Sessions and Start Date */}
              <Grid cols={2} gap={4}>
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Número de sesiones
                  </label>
                  <select
                    value={proposal.sessionCount}
                    onChange={(e) => setProposal(prev => ({ ...prev, sessionCount: e.target.value }))}
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none"
                  >
                    <option value="1">1 sesión</option>
                    <option value="2">2 sesiones</option>
                    <option value="3">3 sesiones</option>
                    <option value="4">4+ sesiones</option>
                  </select>
                </div>
                <Input
                  label="Fecha más temprana disponible"
                  type="date"
                  value={proposal.startDate}
                  onChange={(e) => setProposal(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </Grid>

              {/* Portfolio Images */}
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Trabajos de referencia de tu portfolio
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-primary-800 rounded-lg border-2 border-dashed border-primary-600 flex items-center justify-center hover:border-primary-500 transition-colors cursor-pointer">
                      <div className="text-center">
                        <svg className="h-8 w-8 text-primary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-xs text-primary-500">Agregar imagen</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-primary-500 mt-2">
                  Selecciona trabajos similares de tu portfolio que demuestren tu experiencia
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={proposal.notes}
                  onChange={(e) => setProposal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Información adicional, condiciones especiales, etc."
                  rows={3}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-primary-700">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/feed')}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={submitting}
                  className="min-w-[140px]"
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    'Enviar Propuesta'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default SendProposalPage;