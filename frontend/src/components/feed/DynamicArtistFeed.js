import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../contexts/SocketContext';
import { offerService, proposalService, catalogService } from '../../services/api';
import { FiRefreshCw, FiHeart, FiEye, FiClock, FiTrendingUp, FiSend, FiDollarSign, FiFilter } from 'react-icons/fi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { getTattooImageUrl, getReferenceImageUrl } from '../../utils/imageHelpers';
import toast from 'react-hot-toast';

const DynamicArtistFeed = () => {
  const [newOffersCount, setNewOffersCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [proposalFilter, setProposalFilter] = useState('all'); // 'all', 'sent', 'pending'
  const [regionFilter, setRegionFilter] = useState('');
  const [comunaFilter, setComunaFilter] = useState('');
  const [proposalModal, setProposalModal] = useState({
    isOpen: false,
    offer: null,
    loading: false
  });
  const [proposalForm, setProposalForm] = useState({
    message: '',
    estimatedPrice: '',
    estimatedDays: '',
    notes: ''
  });
  const { on, off, notifyArtistViewing } = useSocket();
  const queryClient = useQueryClient();

  // Fetch offers with React Query
  const { data: rawOffers = [], isLoading, refetch } = useQuery({
    queryKey: ['artist-offers', sortBy, regionFilter, comunaFilter],
    queryFn: async () => {
      const filters = {
        status: 'active',
        limit: 50,
        sortBy: sortBy
      };
      
      if (regionFilter) filters.region = regionFilter;
      if (comunaFilter) filters.comuna = comunaFilter;
      
      const response = await offerService.getOffers(filters);
      // Backend returns offers directly, not wrapped in { data: { offers: [...] } }
      return response.data || [];
    },
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refetch every 30 seconds
    staleTime: 15000
  });

  // Fetch regions and comunas
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response = await catalogService.getRegions();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: comunas = [] } = useQuery({
    queryKey: ['comunas', regionFilter],
    queryFn: async () => {
      if (!regionFilter) return [];
      const response = await catalogService.getComunas(regionFilter);
      return response.data || [];
    },
    enabled: !!regionFilter,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Check existing proposals for all offers at once
  const [proposalStatus, setProposalStatus] = useState({});
  
  const checkExistingProposals = React.useCallback(async (offers) => {
    if (!offers?.length) return;
    
    console.log('🔍 Checking proposals for offers:', offers.map(o => ({ id: o.id, title: o.title })));
    console.log('🎯 Current user context: artist checking for existing proposals');
    
    try {
      // Check if there's a batch endpoint available
      const offerIds = offers.map(offer => offer.id);
      const response = await proposalService.checkExistingBatch?.(offerIds);
      
      if (response?.data) {
        console.log('📊 Batch response:', response.data);
        // Transform batch response to include proposal data
        const status = {};
        Object.entries(response.data).forEach(([offerId, proposalData]) => {
          status[offerId] = {
            hasProposal: proposalData.hasProposal || false,
            proposal: proposalData.proposal || null
          };
          console.log(`✅ Batch - Offer ${offerId}: proposal exists = ${status[offerId].hasProposal}`, proposalData);
        });
        console.log('📊 Transformed batch status:', status);
        setProposalStatus(status);
      } else {
        console.log('📝 Using individual checks for', offerIds.length, 'offers');
        // Fallback to individual checks
        const status = {};
        await Promise.all(
          offers.map(async (offer) => {
            try {
              const result = await proposalService.checkExisting(offer.id);
              // Backend returns hasProposal and proposal data
              status[offer.id] = {
                hasProposal: result.data?.hasProposal || false,
                proposal: result.data?.proposal || null
              };
              console.log(`✅ Offer ${offer.id} (${offer.title}): proposal exists = ${status[offer.id].hasProposal}`, result.data);
            } catch (error) {
              console.error('❌ Error checking proposal for offer', offer.id, error);
              status[offer.id] = { hasProposal: false, proposal: null };
            }
          })
        );
        console.log('📊 Final proposal status:', status);
        setProposalStatus(status);
      }
    } catch (error) {
      console.error('❌ Error checking existing proposals:', error);
    }
  }, []);

  React.useEffect(() => {
    if (rawOffers.length > 0) {
      checkExistingProposals(rawOffers);
    }
  }, [rawOffers, checkExistingProposals]);

  // Filter and sort offers based on selected criteria
  const offers = React.useMemo(() => {
    if (!rawOffers.length) return [];
    
    // First apply proposal filter
    let filtered = [...rawOffers];
    if (proposalFilter === 'sent') {
      filtered = filtered.filter(offer => proposalStatus[offer.id]?.hasProposal);
    } else if (proposalFilter === 'pending') {
      filtered = filtered.filter(offer => !proposalStatus[offer.id]?.hasProposal);
    }
    
    // Then apply sorting
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'budget_high':
        return filtered.sort((a, b) => (b.budget_max || 0) - (a.budget_max || 0));
      case 'budget_low':
        return filtered.sort((a, b) => (a.budget_min || 0) - (b.budget_min || 0));
      case 'urgent':
        return filtered.sort((a, b) => {
          const aUrgent = a.is_urgent || a.priority === 'high';
          const bUrgent = b.is_urgent || b.priority === 'high';
          return bUrgent - aUrgent;
        });
      case 'region':
        return filtered.sort((a, b) => {
          const aRegion = a.region_name || '';
          const bRegion = b.region_name || '';
          return aRegion.localeCompare(bRegion);
        });
      case 'comuna':
        return filtered.sort((a, b) => {
          const aComuna = a.comuna_name || '';
          const bComuna = b.comuna_name || '';
          return aComuna.localeCompare(bComuna);
        });
      default:
        return filtered;
    }
  }, [rawOffers, sortBy, proposalFilter, proposalStatus]);

  // Calculate proposal statistics
  const proposalStats = React.useMemo(() => {
    const total = rawOffers.length;
    const sent = rawOffers.filter(offer => proposalStatus[offer.id]?.hasProposal).length;
    const pending = total - sent;
    return { total, sent, pending };
  }, [rawOffers, proposalStatus]);

  useEffect(() => {
    // Listen for new offers in real-time
    const handleNewOffer = (data) => {
      setNewOffersCount(prev => prev + 1);
      toast('Nueva solicitud disponible', {
        icon: '🎨',
        duration: 4000,
        onClick: () => {
          handleRefreshClick();
        }
      });
    };

    on('new_offer_available', handleNewOffer);

    return () => {
      off('new_offer_available', handleNewOffer);
    };
  }, [on, off]);

  const handleRefreshClick = () => {
    setNewOffersCount(0);
    refetch();
    toast.success('Feed actualizado');
  };

  const handleOpenProposalModal = async (offer, e) => {
    e.stopPropagation();
    
    // Check if artist already has a proposal for this offer
    if (proposalStatus[offer.id]?.hasProposal) {
      toast.error('Ya has enviado una propuesta para esta oferta');
      return;
    }
    
    setProposalModal({
      isOpen: true,
      offer: offer,
      loading: false
    });
    
    // Reset form
    setProposalForm({
      message: '',
      estimatedPrice: '',
      estimatedDays: '',
      notes: ''
    });
  };

  const handleSubmitProposal = async () => {
    if (!proposalForm.message.trim() || !proposalForm.estimatedPrice || !proposalForm.estimatedDays) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setProposalModal(prev => ({ ...prev, loading: true }));

    try {
      await proposalService.create(proposalModal.offer.id, {
        message: proposalForm.message,
        proposedPrice: parseFloat(proposalForm.estimatedPrice),
        estimatedDuration: parseInt(proposalForm.estimatedDays),
        notes: proposalForm.notes
      });

      toast.success('Propuesta enviada exitosamente');
      setProposalModal({ isOpen: false, offer: null, loading: false });
      
      // Update proposal status locally
      setProposalStatus(prev => ({
        ...prev,
        [proposalModal.offer.id]: { hasProposal: true, proposal: { created_at: new Date().toISOString() } }
      }));
      
      // Trigger navigation to proposals tab
      const event = new CustomEvent('switchTab', { detail: { tab: 'proposals' } });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error(error.response?.data?.message || 'Error al enviar propuesta');
    } finally {
      setProposalModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOfferView = (offerId) => {
    notifyArtistViewing(offerId);
  };

  const OfferCard = ({ offer, index }) => {
    const [viewCount, setViewCount] = useState(offer.views || 0);
    const proposalData = proposalStatus[offer.id] || { hasProposal: false, proposal: null };
    const hasProposal = proposalData.hasProposal;
    const proposal = proposalData.proposal;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -2 }}
        className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
          hasProposal 
            ? 'bg-primary-800 border border-emerald-500/70 hover:border-emerald-400' 
            : 'bg-primary-800 border border-primary-700 hover:border-accent-500/50'
        }`}
        onClick={() => handleOfferView(offer.id)}
      >
        {/* Status indicator */}
        <div className="relative">
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Activo</span>
            </motion.div>
          </div>

          {/* Time indicator and proposal status */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
            {hasProposal && (
              <div className="bg-emerald-600/90 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="flex items-center space-x-1 text-xs text-white font-medium">
                  <FiSend size={10} />
                  <span>{getProposalDate(proposal) || 'Enviada'}</span>
                </div>
              </div>
            )}
            <div className="bg-primary-900/80 backdrop-blur-sm rounded-full px-3 py-1">
              <div className="flex items-center space-x-1 text-xs text-primary-300">
                <FiClock size={12} />
                <span>{getTimeAgo(offer.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Reference image or placeholder */}
          <div className="h-48 bg-primary-700 relative overflow-hidden">
            {(() => {
              console.log('🖼️ Offer references debug:', {
                offerId: offer.id,
                title: offer.title,
                reference_images: offer.reference_images,
                references: offer.references,
                hasReferenceImages: offer.reference_images?.length > 0,
                hasReferences: offer.references?.length > 0
              });
              
              if (offer.reference_images?.length > 0 || offer.references?.length > 0) {
                const imageUrl = offer.reference_images?.[0] || offer.references?.[0]?.image_url || offer.references?.[0]?.filename;
                const fullUrl = getReferenceImageUrl(imageUrl);
                console.log('🔗 Image URL:', { imageUrl, fullUrl });
                
                return (
                  <img
                    src={fullUrl}
                    alt="Referencia"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Failed to load image:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', fullUrl);
                    }}
                  />
                );
              }
              return null;
            })()}
            
            {/* Fallback placeholder - always present but hidden by image */}
            <div 
              className="w-full h-full flex items-center justify-center absolute inset-0"
              style={{ display: (offer.reference_images?.length > 0 || offer.references?.length > 0) ? 'none' : 'flex' }}
            >
              <div className="text-center">
                <FiTrendingUp className="w-12 h-12 text-primary-500 mx-auto mb-2" />
                <p className="text-sm text-primary-400">Sin imagen de referencia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-primary-100 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {offer.title}
            </h3>
            <div className="ml-4 text-right">
              <div className="text-lg font-bold text-accent-400">
                ${(offer.budget_min || 0).toLocaleString()} - ${(offer.budget_max || 0).toLocaleString()}
              </div>
              <div className="text-xs text-primary-500">CLP</div>
            </div>
          </div>

          <p className="text-primary-300 text-sm mb-4 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {offer.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {offer.style_name && (
              <span className="px-2 py-1 bg-accent-500/20 text-accent-400 text-xs rounded-full">
                {offer.style_name}
              </span>
            )}
            {offer.body_part_name && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {offer.body_part_name}
              </span>
            )}
            {offer.size_description && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {offer.size_description}
              </span>
            )}
            {offer.region_name && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                📍 {offer.comuna_name ? `${offer.comuna_name}, ${offer.region_name}` : offer.region_name}
              </span>
            )}
          </div>

          {/* Stats and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-primary-400">
              <div className="flex items-center space-x-1">
                <FiEye size={14} />
                <span>{viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiHeart size={14} />
                <span>{offer.interested_count || 0}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleOpenProposalModal(offer, e)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
                hasProposal
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-not-allowed border border-emerald-500'
                  : 'bg-accent-500 hover:bg-accent-600 text-white'
              }`}
              disabled={hasProposal}
            >
              <FiSend size={14} />
              <span>{hasProposal ? 'Propuesta Enviada' : 'Enviar Propuesta'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getProposalDate = (proposal) => {
    if (!proposal?.created_at) return '';
    const date = new Date(proposal.created_at);
    return date.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-primary-800 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh controls and filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-100">
            Nuevas Solicitudes ({offers.length})
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoRefresh" className="text-sm text-primary-300">
                Auto-actualizar
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefreshClick}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiRefreshCw size={16} />
              </motion.div>
              <span>Actualizar</span>
              {newOffersCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px]"
                >
                  {newOffersCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="space-y-4">
          {/* First row - Proposal and Sort filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-primary-400" size={16} />
                <label className="text-sm text-primary-300">Mostrar:</label>
                <select
                  value={proposalFilter}
                  onChange={(e) => setProposalFilter(e.target.value)}
                  className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-1 text-primary-100 text-sm focus:border-accent-500 focus:outline-none"
                >
                  <option value="all">Todas las solicitudes</option>
                  <option value="pending">Sin propuesta</option>
                  <option value="sent">Con propuesta enviada</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-primary-300">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-1 text-primary-100 text-sm focus:border-accent-500 focus:outline-none"
                >
                  <option value="recent">Más recientes</option>
                  <option value="budget_high">Presupuesto mayor</option>
                  <option value="budget_low">Presupuesto menor</option>
                  <option value="urgent">Urgentes</option>
                  <option value="region">Por región</option>
                  <option value="comuna">Por comuna</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-primary-400">
                Mostrando {offers.length} de {rawOffers.length} solicitud{offers.length !== 1 ? 'es' : ''}
                {proposalFilter !== 'all' && (
                  <span className="ml-1 text-accent-400">
                    ({proposalFilter === 'sent' ? 'con propuesta' : 'sin propuesta'})
                  </span>
                )}
              </div>
              
              {proposalStats.total > 0 && (
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-primary-300">Enviadas: {proposalStats.sent}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                    <span className="text-primary-300">Pendientes: {proposalStats.pending}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Second row - Location filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-primary-300">Región:</label>
              <select
                value={regionFilter}
                onChange={(e) => {
                  setRegionFilter(e.target.value);
                  setComunaFilter(''); // Reset comuna when region changes
                }}
                className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-1 text-primary-100 text-sm focus:border-accent-500 focus:outline-none"
              >
                <option value="">Todas las regiones</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-primary-300">Comuna:</label>
              <select
                value={comunaFilter}
                onChange={(e) => setComunaFilter(e.target.value)}
                disabled={!regionFilter}
                className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-1 text-primary-100 text-sm focus:border-accent-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">Todas las comunas</option>
                {comunas.map(comuna => (
                  <option key={comuna.id} value={comuna.id}>{comuna.name}</option>
                ))}
              </select>
            </div>
            
            {(regionFilter || comunaFilter) && (
              <button
                onClick={() => {
                  setRegionFilter('');
                  setComunaFilter('');
                }}
                className="text-xs text-accent-400 hover:text-accent-300 underline"
              >
                Limpiar filtros de ubicación
              </button>
            )}
          </div>
        </div>
      </div>

      {/* New offers banner */}
      <AnimatePresence>
        {newOffersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg p-4 cursor-pointer"
            onClick={handleRefreshClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-white rounded-full"
                />
                <span className="text-white font-medium">
                  {newOffersCount} nueva{newOffersCount !== 1 ? 's' : ''} solicitud{newOffersCount !== 1 ? 'es' : ''} disponible{newOffersCount !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-white/80 text-sm">Click para actualizar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offers grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} index={index} />
          ))}
        </div>
      </AnimatePresence>

      {offers.length === 0 && (
        <div className="text-center py-12">
          <FiTrendingUp className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-200 mb-2">
            No hay solicitudes disponibles
          </h3>
          <p className="text-primary-400">
            Las nuevas solicitudes aparecerán aquí automáticamente
          </p>
        </div>
      )}

      {/* Proposal Modal */}
      <Modal
        isOpen={proposalModal.isOpen}
        onClose={() => setProposalModal({ isOpen: false, offer: null, loading: false })}
        title="Enviar Propuesta"
        size="lg"
      >
        {proposalModal.offer && (
          <div className="space-y-6">
            {/* Offer Summary */}
            <div className="p-4 bg-primary-800 rounded-lg">
              <h3 className="font-semibold text-primary-100 mb-2">{proposalModal.offer.title}</h3>
              <p className="text-sm text-primary-300 mb-2">{proposalModal.offer.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-accent-400 font-medium">
                  ${(proposalModal.offer.budget_min || 0).toLocaleString()} - ${(proposalModal.offer.budget_max || 0).toLocaleString()} CLP
                </span>
                <div className="flex space-x-2">
                  {proposalModal.offer.style_name && (
                    <span className="px-2 py-1 bg-accent-500/20 text-accent-400 text-xs rounded">
                      {proposalModal.offer.style_name}
                    </span>
                  )}
                  {proposalModal.offer.body_part_name && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {proposalModal.offer.body_part_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Proposal Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Mensaje de propuesta *
                </label>
                <textarea
                  value={proposalForm.message}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Explica tu propuesta, experiencia relevante, enfoque creativo..."
                  rows={4}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Precio estimado (CLP) *
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" size={16} />
                    <input
                      type="number"
                      value={proposalForm.estimatedPrice}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, estimatedPrice: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-primary-700 border border-primary-600 rounded-lg pl-10 pr-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Días estimados *
                  </label>
                  <input
                    type="number"
                    value={proposalForm.estimatedDays}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, estimatedDays: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={proposalForm.notes}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detalles adicionales, términos, condiciones..."
                  rows={2}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setProposalModal({ isOpen: false, offer: null, loading: false })}
                disabled={proposalModal.loading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitProposal}
                disabled={proposalModal.loading}
                className="flex items-center space-x-2"
              >
                {proposalModal.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <FiSend size={16} />
                    <span>Enviar Propuesta</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DynamicArtistFeed;