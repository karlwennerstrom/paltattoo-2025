import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { getTattooImageUrl, getProfileImageUrl } from '../../utils/imageHelpers';
import { proposalService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiCalendar, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const ProposalsTab = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingProposal, setViewingProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    loadProposals();
  }, [selectedStatus]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const response = await proposalService.getMyProposals(
        selectedStatus !== 'all' ? { status: selectedStatus } : {}
      );
      setProposals(response.data || []);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Error al cargar las propuestas');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development while backend is not ready
  const mockProposals = [
    {
      id: 1,
      client: {
        name: 'María González',
        avatar: null,
        rating: 4.8,
        completedTattoos: 3
      },
      title: 'Tatuaje de León Realista',
      description: 'Quiero un tatuaje realista de un león en el brazo derecho. Me gusta el estilo que manejas y creo que podrías hacer un trabajo increíble.',
      category: 'Realista',
      size: 'Grande',
      bodyPart: 'Brazo derecho',
      budget: 250000,
      deadline: '2024-02-15',
      referenceImages: ['/placeholder-tattoo-1.jpg', '/placeholder-tattoo-2.jpg'],
      status: 'pending',
      createdAt: '2024-01-20',
      priority: 'high',
      sessionDuration: '4-6 horas',
      isFlexibleDate: true,
      specialRequests: 'Prefiero sesiones matutinas si es posible'
    },
    {
      id: 2,
      client: {
        name: 'Carlos López',
        avatar: null,
        rating: 5.0,
        completedTattoos: 1
      },
      title: 'Retrato en Black & Grey',
      description: 'Me gustaría un retrato de mi madre en black & grey en el antebrazo.',
      category: 'Black & Grey',
      size: 'Mediano',
      bodyPart: 'Antebrazo',
      budget: 180000,
      deadline: '2024-02-20',
      referenceImages: ['/placeholder-tattoo-3.jpg'],
      status: 'in_progress',
      createdAt: '2024-01-18',
      priority: 'medium',
      sessionDuration: '3-4 horas',
      isFlexibleDate: false,
      specialRequests: ''
    },
    {
      id: 3,
      client: {
        name: 'Ana Martínez',
        avatar: null,
        rating: 4.5,
        completedTattoos: 0
      },
      title: 'Mandala Ornamental',
      description: 'Busco un diseño de mandala ornamental para la espalda alta.',
      category: 'Ornamental',
      size: 'Grande',
      bodyPart: 'Espalda alta',
      budget: 320000,
      deadline: '2024-03-01',
      referenceImages: ['/placeholder-tattoo-4.jpg'],
      status: 'accepted',
      createdAt: '2024-01-15',
      priority: 'low',
      sessionDuration: '5-7 horas',
      isFlexibleDate: true,
      specialRequests: 'Primera vez tatuándome, necesito mucha paciencia'
    },
    {
      id: 4,
      client: {
        name: 'Diego Rivera',
        avatar: null,
        rating: 4.2,
        completedTattoos: 2
      },
      title: 'Cover-up de Tatuaje Antiguo',
      description: 'Necesito cubrir un tatuaje antiguo en el hombro con algo más moderno.',
      category: 'Cover-up',
      size: 'Grande',
      bodyPart: 'Hombro',
      budget: 280000,
      deadline: '2024-02-10',
      referenceImages: [],
      status: 'declined',
      createdAt: '2024-01-12',
      priority: 'medium',
      sessionDuration: '4-5 horas',
      isFlexibleDate: false,
      specialRequests: 'El tatuaje actual es muy oscuro'
    }
  ];

  // Use mock data if no real data is available
  const displayProposals = proposals.length > 0 ? proposals : (loading ? [] : mockProposals);

  const statusOptions = [
    { value: 'all', label: 'Todas', count: displayProposals.length },
    { value: 'pending', label: 'Pendientes', count: displayProposals.filter(p => p.status === 'pending').length },
    { value: 'accepted', label: 'Aceptadas', count: displayProposals.filter(p => p.status === 'accepted').length },
    { value: 'rejected', label: 'Rechazadas', count: displayProposals.filter(p => p.status === 'rejected').length },
    { value: 'withdrawn', label: 'Retiradas', count: displayProposals.filter(p => p.status === 'withdrawn').length }
  ];

  const filteredProposals = selectedStatus === 'all' 
    ? displayProposals 
    : displayProposals.filter(p => p.status === selectedStatus);

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

  const handleDeleteProposal = async (proposalId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta propuesta?')) return;
    
    try {
      await proposalService.delete(proposalId);
      toast.success('Propuesta eliminada exitosamente');
      loadProposals();
    } catch (error) {
      toast.error('Error al eliminar la propuesta');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Mis Propuestas</h1>
          <p className="text-primary-400">Gestiona las solicitudes de trabajo de tus clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-primary-400">
            {filteredProposals.length} propuesta{filteredProposals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Status Filter Tabs */}
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
              <Card key={proposal.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getProfileImageUrl(proposal.client.avatar)}
                      alt={proposal.client.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-primary-100">{proposal.offer?.title || proposal.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-primary-400">
                        <span>{proposal.offer?.client?.name || proposal.client?.name || 'Cliente'}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <svg className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{proposal.client.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{proposal.client.completedTattoos} tatuajes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={twMerge('px-2 py-1 text-xs rounded-full text-white', priorityBadge.color)}>
                      {priorityBadge.text}
                    </span>
                    <span className={twMerge('px-3 py-1 text-sm rounded-full text-white', statusBadge.color)}>
                      {statusBadge.text}
                    </span>
                  </div>
                </div>

                <p className="text-primary-300 mb-4 line-clamp-2">{proposal.message || proposal.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-primary-500">Categoría</p>
                    <p className="text-sm text-primary-200">{proposal.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500">Tamaño</p>
                    <p className="text-sm text-primary-200">{proposal.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500">Ubicación</p>
                    <p className="text-sm text-primary-200">{proposal.bodyPart}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500">Precio Propuesto</p>
                    <p className="text-sm text-primary-200 font-medium">{formatCurrency(proposal.proposedPrice || proposal.budget)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-primary-700">
                  <div className="flex items-center space-x-4 text-xs text-primary-500">
                    <span>{timeAgo(proposal.createdAt)}</span>
                    {proposal.estimatedDuration && (
                      <>
                        <span>•</span>
                        <span>Duración: {proposal.estimatedDuration} días</span>
                      </>
                    )}
                    {proposal.referenceImages.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{proposal.referenceImages.length} imagen{proposal.referenceImages.length !== 1 ? 'es' : ''}</span>
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
                    
                    {proposal.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProposal(proposal)}
                        >
                          <FiEdit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(proposal.id, 'withdrawn')}
                          className="text-warning-400 hover:text-warning-300"
                        >
                          <FiXCircle size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProposal(proposal.id)}
                          className="text-error-400 hover:text-error-300"
                        >
                          <FiTrash2 size={16} />
                        </Button>
                      </>
                    )}
                    
                    {proposal.status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setEditingProposal(proposal)}
                      >
                        Gestionar
                      </Button>
                    )}
                    
                    {proposal.status === 'in_progress' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setEditingProposal(proposal)}
                      >
                        Continuar
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
                className="input-field w-full h-24"
                defaultValue={editingProposal.message}
                onChange={(e) => setEditingProposal({...editingProposal, message: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">Precio Propuesto</label>
                <Input
                  type="number"
                  value={editingProposal.proposedPrice}
                  onChange={(e) => setEditingProposal({...editingProposal, proposedPrice: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-1">Duración (días)</label>
                <Input
                  type="number"
                  value={editingProposal.estimatedDuration}
                  onChange={(e) => setEditingProposal({...editingProposal, estimatedDuration: e.target.value})}
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
                  proposedPrice: parseFloat(editingProposal.proposedPrice),
                  estimatedDuration: parseInt(editingProposal.estimatedDuration)
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
            {/* Client Info */}
            <div className="flex items-center space-x-4 p-4 bg-primary-800 rounded-lg">
              <img
                src={getProfileImageUrl(viewingProposal.client.avatar)}
                alt={viewingProposal.client.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-primary-100">{viewingProposal.client.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-primary-400">
                  <div className="flex items-center space-x-1">
                    <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{viewingProposal.client.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{viewingProposal.client.completedTattoos} tatuajes completados</span>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h4 className="text-lg font-semibold text-primary-100 mb-4">{viewingProposal.title}</h4>
              <p className="text-primary-300 mb-4">{viewingProposal.description}</p>
              
              <Grid cols={2} gap={4}>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Categoría</p>
                  <p className="text-primary-200">{viewingProposal.category}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Tamaño</p>
                  <p className="text-primary-200">{viewingProposal.size}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Parte del cuerpo</p>
                  <p className="text-primary-200">{viewingProposal.bodyPart}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Duración estimada</p>
                  <p className="text-primary-200">{viewingProposal.sessionDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Presupuesto</p>
                  <p className="text-primary-200 font-medium">{formatCurrency(viewingProposal.budget)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-500 mb-1">Fecha límite</p>
                  <p className="text-primary-200">{new Date(viewingProposal.deadline).toLocaleDateString('es-CL')}</p>
                </div>
              </Grid>
            </div>

            {/* Special Requests */}
            {viewingProposal.specialRequests && (
              <div>
                <h5 className="text-sm font-semibold text-primary-200 mb-2">Solicitudes especiales</h5>
                <p className="text-sm text-primary-400 p-3 bg-primary-800 rounded-lg">
                  {viewingProposal.specialRequests}
                </p>
              </div>
            )}

            {/* Reference Images */}
            {viewingProposal.referenceImages.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-primary-200 mb-3">Imágenes de referencia</h5>
                <div className="grid grid-cols-3 gap-3">
                  {viewingProposal.referenceImages.map((image, index) => (
                    <img
                      key={index}
                      src={getTattooImageUrl(image)}
                      alt={`Referencia ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-primary-700">
              <Button variant="ghost" onClick={() => setViewingProposal(null)}>
                Cerrar
              </Button>
              {viewingProposal.status === 'pending' && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleStatusChange(viewingProposal.id, 'declined');
                      setViewingProposal(null);
                    }}
                    className="text-error-400 hover:text-error-300"
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleStatusChange(viewingProposal.id, 'accepted');
                      setViewingProposal(null);
                    }}
                  >
                    Aceptar Propuesta
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProposalsTab;