import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { getTattooImageUrl, getProfileImageUrl } from '../../utils/imageHelpers';
import { offerService, proposalService, catalogsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiMapPin, FiClock, FiDollarSign, FiUser, FiStar, FiFilter, FiRefreshCcw } from 'react-icons/fi';

const PublicOffersTab = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [proposalStatus, setProposalStatus] = useState({}); // Track proposal status for each offer
  const [filters, setFilters] = useState({
    style: '',
    bodyPart: '',
    colorType: '',
    minBudget: '',
    maxBudget: '',
    comuna: ''
  });
  const [proposalData, setProposalData] = useState({
    message: '',
    proposedPrice: '',
    estimatedDuration: ''
  });

  // Catalog data for filters
  const [styles, setStyles] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [colorTypes, setColorTypes] = useState([]);

  useEffect(() => {
    loadOffers();
    loadCatalogs();
  }, []);

  useEffect(() => {
    loadOffers();
  }, [filters]);

  const loadCatalogs = async () => {
    try {
      const [stylesRes, bodyPartsRes, colorTypesRes] = await Promise.all([
        catalogsAPI.getStyles(),
        catalogsAPI.getBodyParts(),
        catalogsAPI.getColorTypes()
      ]);
      
      setStyles(stylesRes.data || []);
      setBodyParts(bodyPartsRes.data || []);
      setColorTypes(colorTypesRes.data || []);
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      
      // Prepare filters for API
      const apiFilters = {};
      if (filters.style) apiFilters.style = filters.style;
      if (filters.bodyPart) apiFilters.bodyPart = filters.bodyPart;
      if (filters.colorType) apiFilters.colorType = filters.colorType;
      if (filters.minBudget) apiFilters.minBudget = filters.minBudget;
      if (filters.maxBudget) apiFilters.maxBudget = filters.maxBudget;
      if (filters.comuna) apiFilters.comuna = filters.comuna;
      
      const response = await offerService.getAll(apiFilters);
      const offersData = response.data || [];
      setOffers(offersData);
      
      // Check proposal status for each offer
      await checkProposalStatusForOffers(offersData);
    } catch (error) {
      console.error('Error loading offers:', error);
      toast.error('Error al cargar ofertas');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const checkProposalStatusForOffers = async (offersData) => {
    try {
      const statusChecks = offersData.map(async (offer) => {
        try {
          const response = await proposalService.checkExisting(offer.id);
          return {
            offerId: offer.id,
            hasProposal: response.data.hasProposal,
            proposal: response.data.proposal
          };
        } catch (error) {
          console.error(`Error checking proposal for offer ${offer.id}:`, error);
          return {
            offerId: offer.id,
            hasProposal: false,
            proposal: null
          };
        }
      });

      const results = await Promise.all(statusChecks);
      const statusMap = {};
      results.forEach(result => {
        statusMap[result.offerId] = {
          hasProposal: result.hasProposal,
          proposal: result.proposal
        };
      });
      
      setProposalStatus(statusMap);
    } catch (error) {
      console.error('Error checking proposal status:', error);
    }
  };

  const handleCreateProposal = async () => {
    if (!proposalData.message || !proposalData.proposedPrice) {
      toast.error('Mensaje y precio propuesto son obligatorios');
      return;
    }

    try {
      await proposalService.create(showProposalModal.id, {
        message: proposalData.message,
        proposedPrice: parseFloat(proposalData.proposedPrice),
        estimatedDuration: proposalData.estimatedDuration ? parseInt(proposalData.estimatedDuration) : null
      });

      toast.success('Propuesta enviada exitosamente');
      setShowProposalModal(null);
      setProposalData({ message: '', proposedPrice: '', estimatedDuration: '' });
      
      // Update proposal status for this specific offer
      const offerId = showProposalModal.id;
      setProposalStatus(prev => ({
        ...prev,
        [offerId]: {
          hasProposal: true,
          proposal: { id: 'new' } // We don't have the full proposal data yet
        }
      }));
      
      // Refresh offers to update proposal count
      loadOffers();
    } catch (error) {
      console.error('Error creating proposal:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al enviar propuesta');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const timeAgo = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    return `Hace ${Math.floor(days / 30)} meses`;
  };

  const clearFilters = () => {
    setFilters({
      style: '',
      bodyPart: '',
      colorType: '',
      minBudget: '',
      maxBudget: '',
      comuna: ''
    });
  };

  const handleViewSentProposal = (offerId) => {
    // Find the proposal for this offer
    const proposalInfo = proposalStatus[offerId];
    if (proposalInfo?.proposal) {
      // Emit event to parent component to switch to proposals tab
      window.dispatchEvent(new CustomEvent('navigateToProposals', { 
        detail: { proposalId: proposalInfo.proposal.id } 
      }));
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Ofertas Públicas</h1>
          <p className="text-primary-400">Encuentra proyectos de tatuajes y envía tus propuestas</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className={twMerge(
              'flex items-center space-x-2',
              hasActiveFilters && 'text-accent-400'
            )}
          >
            <FiFilter size={16} />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-1 bg-accent-600 text-white text-xs rounded-full">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </Button>
          <Button variant="ghost" onClick={loadOffers} disabled={loading}>
            <FiRefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="ml-2">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-100">Filtros de búsqueda</h3>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Limpiar filtros
              </Button>
            )}
          </div>
          
          <Grid cols={3} gap={4}>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">Estilo</label>
              <select
                value={filters.style}
                onChange={(e) => setFilters(prev => ({ ...prev, style: e.target.value }))}
                className="input-field w-full"
              >
                <option value="">Todos los estilos</option>
                {styles.map(style => (
                  <option key={style.id} value={style.id}>{style.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">Parte del cuerpo</label>
              <select
                value={filters.bodyPart}
                onChange={(e) => setFilters(prev => ({ ...prev, bodyPart: e.target.value }))}
                className="input-field w-full"
              >
                <option value="">Todas las partes</option>
                {bodyParts.map(part => (
                  <option key={part.id} value={part.id}>{part.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">Tipo de color</label>
              <select
                value={filters.colorType}
                onChange={(e) => setFilters(prev => ({ ...prev, colorType: e.target.value }))}
                className="input-field w-full"
              >
                <option value="">Todos los colores</option>
                {colorTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">Presupuesto mínimo</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minBudget}
                onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">Presupuesto máximo</label>
              <Input
                type="number"
                placeholder="Sin límite"
                value={filters.maxBudget}
                onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
              />
            </div>
          </Grid>
        </Card>
      )}

      {/* Offers List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-primary-400">
              {offers.length} oferta{offers.length !== 1 ? 's' : ''} disponible{offers.length !== 1 ? 's' : ''}
            </p>
          </div>

          {offers.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-primary-400 mb-4">No hay ofertas disponibles</p>
              <p className="text-sm text-primary-500">
                Prueba ajustando los filtros o vuelve más tarde
              </p>
            </Card>
          ) : (
            offers.map((offer) => (
              <Card key={offer.id} className="p-6 hover:border-accent-500/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getProfileImageUrl(offer.client_avatar)}
                      alt={`${offer.client_first_name} ${offer.client_last_name}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-primary-100">{offer.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-primary-400">
                        <FiUser size={14} />
                        <span>{offer.client_first_name} {offer.client_last_name}</span>
                        {offer.comuna_name && (
                          <>
                            <span>•</span>
                            <FiMapPin size={14} />
                            <span>{offer.comuna_name}, {offer.region}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent-400">
                      {offer.budget_min && offer.budget_max 
                        ? `${formatCurrency(offer.budget_min)}-${formatCurrency(offer.budget_max)}`
                        : 'Por negociar'
                      }
                    </p>
                    <p className="text-xs text-primary-500">
                      {offer.proposal_count || 0} propuesta{(offer.proposal_count || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <p className="text-primary-300 mb-4 line-clamp-3">{offer.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-primary-500 mb-1">Estilo</p>
                    <p className="text-sm text-primary-200">{offer.style_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500 mb-1">Ubicación</p>
                    <p className="text-sm text-primary-200">{offer.body_part_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500 mb-1">Color</p>
                    <p className="text-sm text-primary-200">{offer.color_type_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500 mb-1">Tamaño</p>
                    <p className="text-sm text-primary-200">{offer.size_description || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-primary-700">
                  <div className="flex items-center space-x-4 text-xs text-primary-500">
                    <div className="flex items-center space-x-1">
                      <FiClock size={12} />
                      <span>{timeAgo(offer.created_at)}</span>
                    </div>
                    {offer.deadline && (
                      <div className="flex items-center space-x-1">
                        <FiClock size={12} />
                        <span>Hasta: {new Date(offer.deadline).toLocaleDateString('es-CL')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOffer(offer)}
                    >
                      Ver Detalles
                    </Button>
                    {proposalStatus[offer.id]?.hasProposal ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-accent-400 font-medium">
                          Propuesta ya enviada
                        </span>
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleViewSentProposal(offer.id)}
                        >
                          Ver Propuesta Enviada
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowProposalModal(offer)}
                      >
                        Enviar Propuesta
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Offer Detail Modal */}
      <Modal
        isOpen={selectedOffer !== null}
        onClose={() => setSelectedOffer(null)}
        title="Detalles de la Oferta"
        size="lg"
      >
        {selectedOffer && (
          <div className="space-y-6">
            {/* Client Info */}
            <div className="flex items-center space-x-4 p-4 bg-primary-800 rounded-lg">
              <img
                src={getProfileImageUrl(selectedOffer.client_avatar)}
                alt={`${selectedOffer.client_first_name} ${selectedOffer.client_last_name}`}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-primary-100">
                  {selectedOffer.client_first_name} {selectedOffer.client_last_name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-primary-400">
                  {selectedOffer.comuna_name && (
                    <div className="flex items-center space-x-1">
                      <FiMapPin size={14} />
                      <span>{selectedOffer.comuna_name}, {selectedOffer.region}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h4 className="text-lg font-semibold text-primary-100 mb-2">{selectedOffer.title}</h4>
              <p className="text-primary-300 mb-4">{selectedOffer.description}</p>
              
              <Grid cols={2} gap={4}>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Estilo</p>
                  <p className="text-primary-200">{selectedOffer.style_name}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Parte del cuerpo</p>
                  <p className="text-primary-200">{selectedOffer.body_part_name}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Tipo de color</p>
                  <p className="text-primary-200">{selectedOffer.color_type_name}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Presupuesto</p>
                  <p className="text-primary-200 font-medium">
                    {selectedOffer.budget_min && selectedOffer.budget_max 
                      ? `${formatCurrency(selectedOffer.budget_min)} - ${formatCurrency(selectedOffer.budget_max)}`
                      : 'Por negociar'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Tamaño</p>
                  <p className="text-primary-200">{selectedOffer.size_description || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Fecha límite</p>
                  <p className="text-primary-200">
                    {selectedOffer.deadline 
                      ? new Date(selectedOffer.deadline).toLocaleDateString('es-CL')
                      : 'Flexible'
                    }
                  </p>
                </div>
              </Grid>
            </div>

            {/* Reference Images */}
            {selectedOffer.references && selectedOffer.references.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-primary-200 mb-3">Imágenes de referencia</h5>
                <div className="grid grid-cols-3 gap-3">
                  {selectedOffer.references.map((ref, index) => (
                    <div key={ref.id || index} className="relative">
                      <img
                        src={getTattooImageUrl(ref.image_url)}
                        alt={ref.description || `Referencia ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {ref.description && (
                        <p className="text-xs text-primary-400 mt-1">{ref.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competition Info */}
            <div className="p-4 bg-primary-800 rounded-lg">
              <h5 className="text-sm font-semibold text-primary-200 mb-2">Información de competencia</h5>
              <p className="text-sm text-primary-400">
                Esta oferta ha recibido <span className="font-medium text-accent-400">{selectedOffer.proposal_count || 0}</span> propuesta{(selectedOffer.proposal_count || 0) !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-primary-700">
              <Button variant="ghost" onClick={() => setSelectedOffer(null)}>
                Cerrar
              </Button>
              {proposalStatus[selectedOffer.id]?.hasProposal ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-accent-400 font-medium">
                    Propuesta ya enviada
                  </span>
                  <Button
                    variant="accent"
                    onClick={() => {
                      setSelectedOffer(null);
                      handleViewSentProposal(selectedOffer.id);
                    }}
                  >
                    Ver Propuesta Enviada
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedOffer(null);
                    setShowProposalModal(selectedOffer);
                  }}
                >
                  Enviar Propuesta
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Proposal Modal */}
      <Modal
        isOpen={showProposalModal !== null}
        onClose={() => {
          setShowProposalModal(null);
          setProposalData({ message: '', proposedPrice: '', estimatedDuration: '' });
        }}
        title="Enviar Propuesta"
        size="md"
      >
        {showProposalModal && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-800 rounded-lg">
              <h4 className="font-semibold text-primary-100">{showProposalModal.title}</h4>
              <p className="text-sm text-primary-400">
                Por {showProposalModal.client_first_name} {showProposalModal.client_last_name}
              </p>
              <p className="text-sm text-accent-400 font-medium">
                Presupuesto: {showProposalModal.budget_min && showProposalModal.budget_max 
                  ? `${formatCurrency(showProposalModal.budget_min)}-${formatCurrency(showProposalModal.budget_max)}`
                  : 'Por negociar'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Mensaje de propuesta *
              </label>
              <textarea
                value={proposalData.message}
                onChange={(e) => setProposalData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Presenta tu propuesta, experiencia y por qué eres el mejor para este proyecto..."
                rows={4}
                className="input-field w-full"
              />
            </div>

            <Grid cols={2} gap={4}>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Precio propuesto (CLP) *
                </label>
                <Input
                  type="number"
                  value={proposalData.proposedPrice}
                  onChange={(e) => setProposalData(prev => ({ ...prev, proposedPrice: e.target.value }))}
                  placeholder="180000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Tiempo estimado (días)
                </label>
                <Input
                  type="number"
                  value={proposalData.estimatedDuration}
                  onChange={(e) => setProposalData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  placeholder="7"
                />
              </div>
            </Grid>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowProposalModal(null);
                  setProposalData({ message: '', proposedPrice: '', estimatedDuration: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateProposal}
                disabled={!proposalData.message || !proposalData.proposedPrice}
              >
                Enviar Propuesta
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PublicOffersTab;