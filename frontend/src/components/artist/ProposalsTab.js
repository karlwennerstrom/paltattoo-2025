import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { getTattooImageUrl, getProfileImageUrl } from '../../utils/imageHelpers';
import { proposalService, profileService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiCalendar, FiEdit2, FiTrash2, FiEye, FiArrowRight, FiStar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import RatingForm from '../ratings/RatingForm';
import { ratingService } from '../../services/api';

const ProposalsTab = () => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingProposal, setViewingProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [allProposals, setAllProposals] = useState([]); // Store all proposals for counting
  const [artistProfile, setArtistProfile] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(null); // Proposal ID for rating form

  useEffect(() => {
    loadProposals();
    loadArtistProfile();
    
    // Check if we need to highlight a specific proposal
    const highlightProposalId = sessionStorage.getItem('highlightProposalId');
    if (highlightProposalId) {
      sessionStorage.removeItem('highlightProposalId');
      // Optionally scroll to the proposal or highlight it
      setTimeout(() => {
        const proposalElement = document.getElementById(`proposal-${highlightProposalId}`);
        if (proposalElement) {
          proposalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          proposalElement.classList.add('ring-2', 'ring-accent-500');
          setTimeout(() => {
            proposalElement.classList.remove('ring-2', 'ring-accent-500');
          }, 3000);
        }
      }, 500);
    }
  }, [selectedStatus]);

  const loadArtistProfile = async () => {
    try {
      const response = await profileService.get();
      if (response.data) {
        setArtistProfile(response.data);
      }
    } catch (error) {
      console.error('Error loading artist profile:', error);
    }
  };

  const loadProposals = async () => {
    try {
      setLoading(true);
      
      // Always load all proposals first for counting
      const allResponse = await proposalService.getMyProposals({});
      if (allResponse.data && allResponse.data.proposals) {
        setAllProposals(allResponse.data.proposals);
        
        // Filter proposals based on selected status
        if (selectedStatus === 'all') {
          setProposals(allResponse.data.proposals);
        } else {
          const filtered = allResponse.data.proposals.filter(p => p.status === selectedStatus);
          setProposals(filtered);
        }
      } else {
        setAllProposals([]);
        setProposals([]);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Error al cargar propuestas');
      setProposals([]);
      setAllProposals([]);
    } finally {
      setLoading(false);
    }
  };


  const statusOptions = [
    { value: 'all', label: 'Todas', count: allProposals.length },
    { value: 'pending', label: 'Pendientes', count: allProposals.filter(p => p.status === 'pending').length },
    { value: 'accepted', label: 'Aceptadas', count: allProposals.filter(p => p.status === 'accepted').length },
    { value: 'rejected', label: 'Rechazadas', count: allProposals.filter(p => p.status === 'rejected').length },
    { value: 'withdrawn', label: 'Retiradas', count: allProposals.filter(p => p.status === 'withdrawn').length }
  ];

  // No need to filter again since we already filter in loadProposals
  const filteredProposals = proposals;

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-600', text: 'Pendiente' },
      accepted: { color: 'bg-green-600', text: 'Aceptada' },
      rejected: { color: 'bg-red-600', text: 'Rechazada' },
      withdrawn: { color: 'bg-gray-600', text: 'Retirada' }
    };
    return badges[status] || badges.pending;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { color: 'bg-red-500', text: 'Alta' },
      medium: { color: 'bg-yellow-500', text: 'Media' },
      low: { color: 'bg-green-500', text: 'Baja' }
    };
    return badges[priority] || badges.medium;
  };

  const handleStatusChange = async (proposalId, newStatus) => {
    try {
      await proposalService.updateStatus(proposalId, { status: newStatus });
      toast.success(
        newStatus === 'withdrawn' ? 'Propuesta retirada exitosamente' : 
        newStatus === 'accepted' ? 'Propuesta aceptada' : 
        'Estado actualizado'
      );
      loadProposals();
    } catch (error) {
      toast.error('Error al actualizar el estado de la propuesta');
    }
  };

  const handleUpdateProposal = async (proposalId, updates) => {
    try {
      await proposalService.update(proposalId, updates);
      toast.success('Propuesta actualizada exitosamente');
      setEditingProposal(null);
      loadProposals();
    } catch (error) {
      toast.error('Error al actualizar la propuesta');
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
    return `Hace ${days} días`;
  };

  // Calculate statistics
  const stats = {
    total: allProposals.length,
    pending: allProposals.filter(p => p.status === 'pending').length,
    accepted: allProposals.filter(p => p.status === 'accepted').length,
    rejected: allProposals.filter(p => p.status === 'rejected').length,
    acceptanceRate: allProposals.length > 0 
      ? Math.round((allProposals.filter(p => p.status === 'accepted').length / allProposals.length) * 100)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Mis Propuestas</h1>
          <p className="text-primary-400">
            Gestiona todas tus propuestas enviadas
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-primary-400">
            {filteredProposals.length} propuesta{filteredProposals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <Grid cols={4} gap={4}>
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-primary-100">{stats.total}</p>
          <p className="text-sm text-primary-400">Total Enviadas</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-sm text-primary-400">Esperando Respuesta</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-green-400">{stats.accepted}</p>
          <p className="text-sm text-primary-400">Aceptadas</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-accent-400">{stats.acceptanceRate}%</p>
          <p className="text-sm text-primary-400">Tasa de Éxito</p>
        </Card>
      </Grid>

      {/* Info Box */}
      <Card className="p-4 bg-primary-800 border-primary-700">
        <div className="flex items-start space-x-3">
          <svg className="h-5 w-5 text-accent-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-primary-300">
            <p className="font-medium text-primary-100 mb-1">Sistema de Propuestas</p>
            <p>Aquí puedes ver todas las propuestas que has enviado a ofertas públicas de clientes. Los clientes pueden aceptar, rechazar o dejar pendientes tus propuestas.</p>
          </div>
        </div>
      </Card>

      {/* Status Filter Tabs */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={twMerge(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2',
                selectedStatus === option.value
                  ? 'bg-accent-600 text-white'
                  : 'bg-primary-700 text-primary-300 hover:bg-primary-600 hover:text-primary-100'
              )}
            >
              <span>{option.label}</span>
              <span className={twMerge(
                'px-2 py-1 text-xs rounded-full',
                selectedStatus === option.value
                  ? 'bg-white bg-opacity-20'
                  : 'bg-primary-600'
              )}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-primary-400 mb-4">
                No hay propuestas {selectedStatus !== 'all' ? statusOptions.find(o => o.value === selectedStatus)?.label.toLowerCase() : ''}
              </p>
            </Card>
          ) : (
            filteredProposals.map((proposal) => {
              const statusBadge = getStatusBadge(proposal.status);
              const priorityBadge = getPriorityBadge(proposal.priority);
              
              return (
                <Card key={proposal.id} id={`proposal-${proposal.id}`} className="p-6 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Artist to Client flow visualization */}
                      <div className="flex items-center space-x-3">
                        {/* Artist Avatar */}
                        <div className="relative">
                          <img
                            src={getProfileImageUrl(
                              artistProfile?.profile?.profile_image || 
                              artistProfile?.profileImage || 
                              user?.profileImage || 
                              user?.avatar ||
                              null
                            )}
                            alt={
                              artistProfile?.profile?.first_name || 
                              artistProfile?.first_name ||
                              user?.first_name || 
                              user?.name || 
                              'Tu perfil'
                            }
                            className="h-12 w-12 rounded-full object-cover border-2 border-accent-500"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-accent-500 text-white text-xs px-1 rounded">Tú</span>
                        </div>
                        
                        {/* Arrow indicator */}
                        <FiArrowRight className="text-primary-400" size={20} />
                        
                        {/* Client Avatar */}
                        <img
                          src={getProfileImageUrl(proposal.client?.avatar || null)}
                          alt={proposal.client?.name || 'Cliente'}
                          className="h-12 w-12 rounded-full object-cover border-2 border-primary-600"
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-primary-100">{proposal.offer_title || proposal.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-primary-400">
                          <span>Para: {proposal.status === 'accepted' && proposal.client_first_name ? `${proposal.client_first_name} ${proposal.client_last_name}` : 'Cliente'}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <svg className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{proposal.client?.rating || '5.0'}</span>
                          </div>
                          <span>•</span>
                          <span>{proposal.client?.completedTattoos || '0'} tatuajes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {proposal.priority && (
                        <span className={twMerge('px-2 py-1 text-xs rounded-full text-white', priorityBadge.color)}>
                          {priorityBadge.text}
                        </span>
                      )}
                      <span className={twMerge('px-3 py-1 text-sm rounded-full text-white flex items-center space-x-1', statusBadge.color)}>
                        {proposal.status === 'accepted' && <FiCheckCircle size={14} />}
                        {proposal.status === 'rejected' && <FiXCircle size={14} />}
                        {proposal.status === 'pending' && <FiClock size={14} />}
                        <span>{statusBadge.text}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-primary-300 mb-4 line-clamp-2">{proposal.message || proposal.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-primary-500">Estilo</p>
                      <p className="text-sm text-primary-200">{proposal.style_name || proposal.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-500">Presupuesto del cliente</p>
                      <p className="text-sm text-primary-200">
                        {proposal.budget_min && proposal.budget_max 
                          ? `${formatCurrency(proposal.budget_min)}-${formatCurrency(proposal.budget_max)}` 
                          : formatCurrency(proposal.budget || 0)
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-500">Ubicación del tatuaje</p>
                      <p className="text-sm text-primary-200">{proposal.body_part_name || proposal.bodyPart}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-500">Precio que has propuesto</p>
                      <p className="text-sm text-primary-200 font-medium">
                        {formatCurrency(proposal.proposed_price || proposal.proposedPrice || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary-700">
                    <div className="flex items-center space-x-4 text-xs text-primary-500">
                      <span>{timeAgo(proposal.created_at || proposal.createdAt)}</span>
                      {(proposal.estimated_duration || proposal.estimatedDuration) && (
                        <>
                          <span>•</span>
                          <span>Duración: {proposal.estimated_duration || proposal.estimatedDuration} días</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingProposal(proposal)}
                      >
                        Ver Detalles
                      </Button>
                      
                      {proposal.status === 'accepted' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRatingForm(proposal)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <FiStar size={16} />
                        </Button>
                      )}
                      
                      {proposal.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProposal(proposal)}
                        >
                          <FiEdit2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Edit Proposal Modal */}
      <Modal
        isOpen={editingProposal !== null}
        onClose={() => setEditingProposal(null)}
        title="Editar Propuesta"
        size="md"
      >
        {editingProposal && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Mensaje</label>
              <textarea
                className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none h-24"
                defaultValue={editingProposal.message}
                onChange={(e) => setEditingProposal({...editingProposal, message: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">Precio que has propuesto</label>
                <Input
                  type="number"
                  value={editingProposal.proposed_price || editingProposal.proposedPrice || ''}
                  onChange={(e) => setEditingProposal({...editingProposal, proposed_price: e.target.value, proposedPrice: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">Duración estimada (días)</label>
                <Input
                  type="number"
                  value={editingProposal.estimated_duration || editingProposal.estimatedDuration || ''}
                  onChange={(e) => setEditingProposal({...editingProposal, estimated_duration: e.target.value, estimatedDuration: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="ghost" onClick={() => setEditingProposal(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleUpdateProposal(editingProposal.id, {
                  message: editingProposal.message,
                  proposedPrice: parseFloat(editingProposal.proposed_price || editingProposal.proposedPrice),
                  estimatedDuration: parseInt(editingProposal.estimated_duration || editingProposal.estimatedDuration)
                })}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Proposal Detail Modal */}
      <Modal
        isOpen={viewingProposal !== null}
        onClose={() => setViewingProposal(null)}
        title="Detalles de la Propuesta"
        size="lg"
      >
        {viewingProposal && (
          <div className="space-y-6">
            {/* Artist to Client Flow in Modal */}
            <div className="flex items-center justify-center p-4 bg-primary-800 rounded-lg">
              <div className="flex items-center space-x-4">
                {/* Artist */}
                <div className="text-center">
                  <div className="relative mb-2">
                    <img
                      src={getProfileImageUrl(
                        artistProfile?.profile?.profile_image || 
                        artistProfile?.profileImage || 
                        user?.profileImage || 
                        user?.avatar ||
                        null
                      )}
                      alt={
                        artistProfile?.profile?.first_name || 
                        artistProfile?.first_name ||
                        user?.first_name || 
                        user?.name || 
                        'Tu perfil'
                      }
                      className="h-16 w-16 rounded-full object-cover border-2 border-accent-500"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-accent-500 text-white text-xs px-1 rounded">Tú</span>
                  </div>
                  <p className="text-sm text-primary-300">Tu propuesta</p>
                </div>
                
                {/* Arrow */}
                <div className="flex flex-col items-center space-y-1">
                  <FiArrowRight className="text-accent-400" size={24} />
                  <span className="text-xs text-primary-400">enviada a</span>
                </div>
                
                {/* Client */}
                <div className="text-center">
                  <img
                    src={getProfileImageUrl(viewingProposal.client?.avatar || null)}
                    alt={viewingProposal.client?.name || 'Cliente'}
                    className="h-16 w-16 rounded-full object-cover border-2 border-primary-600 mb-2"
                  />
                  <h3 className="text-lg font-semibold text-primary-100">
                    {viewingProposal.status === 'accepted' && viewingProposal.client_first_name ? `${viewingProposal.client_first_name} ${viewingProposal.client_last_name}` : 'Cliente'}
                  </h3>
                  <div className="flex items-center justify-center space-x-2 text-sm text-primary-400">
                    <div className="flex items-center space-x-1">
                      <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{viewingProposal.client?.rating || '5.0'}</span>
                    </div>
                    <span>•</span>
                    <span>{viewingProposal.client?.completedTattoos || '0'} tatuajes</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-primary-100 mb-4">
                {viewingProposal.offer_title || viewingProposal.title}
              </h4>
              <p className="text-primary-300 mb-4">
                {viewingProposal.offer_description || viewingProposal.description}
              </p>
            </div>

            {/* Contact Information Section */}
            {viewingProposal.status === 'accepted' ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Propuesta Aceptada - Información de Contacto
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-primary-500 mb-1">Nombre del cliente</p>
                    <p className="text-sm text-primary-100">
                      {viewingProposal.client_first_name} {viewingProposal.client_last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500 mb-1">Email</p>
                    <p className="text-sm text-primary-100">
                      {viewingProposal.client_email || 'No proporcionado'}
                    </p>
                  </div>
                  {viewingProposal.client_phone && (
                    <div>
                      <p className="text-xs text-primary-500 mb-1">Teléfono</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-primary-100">
                          {viewingProposal.client_phone}
                        </p>
                        <a
                          href={`https://wa.me/${viewingProposal.client_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.232.007.332.012c.106.005.249-.04.389.298.143.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289-.087.101-.183.226-.262.304-.087.087-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/>
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-green-300 mt-3">
                  Puedes contactar al cliente para coordinar los detalles del tatuaje.
                </p>
              </div>
            ) : viewingProposal.status === 'pending' ? (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center">
                  <FiClock className="mr-2" />
                  Propuesta Pendiente
                </h5>
                <p className="text-sm text-primary-300">
                  Los datos de contacto del cliente estarán disponibles una vez que acepte tu propuesta.
                </p>
              </div>
            ) : viewingProposal.status === 'rejected' ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h5 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
                  <FiXCircle className="mr-2" />
                  Propuesta Rechazada
                </h5>
                <p className="text-sm text-primary-300">
                  El cliente ha seleccionado otra propuesta para este proyecto.
                </p>
              </div>
            ) : null}

            <div className="flex justify-end space-x-3 pt-4 border-t border-primary-700">
              <Button variant="ghost" onClick={() => setViewingProposal(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rating Form Modal */}
      <Modal
        isOpen={showRatingForm !== null}
        onClose={() => setShowRatingForm(null)}
        title="Calificar Cliente"
        size="md"
      >
        {showRatingForm && (
          <RatingForm
            ratedUser={{
              id: showRatingForm.client_id,
              first_name: showRatingForm.client_first_name,
              last_name: showRatingForm.client_last_name,
              profile_image: showRatingForm.client_profile_image,
              type: 'client'
            }}
            tattooRequestId={showRatingForm.tattoo_request_id}
            proposalId={showRatingForm.id}
            onRatingSubmitted={(rating) => {
              toast.success('Calificación enviada exitosamente');
              setShowRatingForm(null);
              // Optionally refresh proposals
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProposalsTab;