import React, { useState } from 'react';
import { PageContainer, Card, Grid } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import { getTattooImageUrl } from '../../utils/imageHelpers';

const MyRequestsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock requests data
  const requests = [
    {
      id: 1,
      title: 'Tatuaje de León Realista',
      description: 'Busco artista especializado en realismo para tatuar un león en el brazo',
      budget: 350000,
      style: 'Realista',
      size: 'Mediano',
      bodyPart: 'Brazo',
      status: 'active',
      proposalsCount: 8,
      createdAt: '2024-01-20T10:30:00Z',
      referenceImage: null
    },
    {
      id: 2,
      title: 'Mandala Ornamental Espalda',
      description: 'Diseño de mandala detallado para la espalda completa',
      budget: 800000,
      style: 'Ornamental',
      size: 'Grande',
      bodyPart: 'Espalda completa',
      status: 'in_progress',
      proposalsCount: 15,
      selectedArtist: 'Carlos Mendoza',
      createdAt: '2024-01-15T14:20:00Z',
      referenceImage: null
    },
    {
      id: 3,
      title: 'Frase Minimalista Muñeca',
      description: 'Frase inspiradora en tipografía elegante',
      budget: 120000,
      style: 'Minimalista',
      size: 'Pequeño',
      bodyPart: 'Muñeca',
      status: 'completed',
      proposalsCount: 12,
      selectedArtist: 'María Fernández',
      completedAt: '2024-01-10T16:00:00Z',
      createdAt: '2024-01-05T09:15:00Z',
      referenceImage: null
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'Todas', count: requests.length },
    { value: 'active', label: 'Activas', count: requests.filter(r => r.status === 'active').length },
    { value: 'in_progress', label: 'En Proceso', count: requests.filter(r => r.status === 'in_progress').length },
    { value: 'completed', label: 'Completadas', count: requests.filter(r => r.status === 'completed').length }
  ];

  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeFilter);

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

  const timeAgo = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 30) return `Hace ${days} días`;
    const months = Math.floor(days / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  };

  return (
    <PageContainer
      title="Mis Solicitudes"
      subtitle="Gestiona tus solicitudes de tatuajes"
      maxWidth="4xl"
      actions={
        <Button variant="primary" href="/offers/create">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Solicitud
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                activeFilter === filter.value
                  ? 'bg-accent-600 text-white'
                  : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`px-2 py-1 text-xs rounded ${
                activeFilter === filter.value
                  ? 'bg-white bg-opacity-20'
                  : 'bg-primary-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-primary-400 mb-4">No tienes solicitudes en esta categoría</p>
              <Button variant="primary" href="/offers/create">
                Crear Primera Solicitud
              </Button>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              
              return (
                <Card key={request.id} className="hover:bg-primary-750 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-primary-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getTattooImageUrl(request.referenceImage)}
                        alt={request.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-primary-100 mb-1">
                            {request.title}
                          </h3>
                          <p className="text-primary-300 text-sm line-clamp-2">
                            {request.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-3 py-1 text-sm rounded text-white ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
                          {request.style}
                        </span>
                        <span className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
                          {request.size}
                        </span>
                        <span className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
                          {request.bodyPart}
                        </span>
                      </div>

                      {/* Stats and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-accent-400 font-medium">{formatCurrency(request.budget)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="h-4 w-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-primary-400">{request.proposalsCount} propuestas</span>
                          </div>
                          <span className="text-primary-500">{timeAgo(request.createdAt)}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {request.status === 'active' && (
                            <>
                              <Button variant="ghost" size="sm" href={`/requests/${request.id}/proposals`}>
                                Ver Propuestas
                              </Button>
                              <Button variant="secondary" size="sm" href={`/requests/${request.id}/edit`}>
                                Editar
                              </Button>
                            </>
                          )}
                          {request.status === 'in_progress' && (
                            <>
                              <span className="text-sm text-primary-400">
                                Con {request.selectedArtist}
                              </span>
                              <Button variant="primary" size="sm" href={`/requests/${request.id}/progress`}>
                                Ver Progreso
                              </Button>
                            </>
                          )}
                          {request.status === 'completed' && (
                            <>
                              <span className="text-sm text-primary-400">
                                Por {request.selectedArtist}
                              </span>
                              <Button variant="ghost" size="sm" href={`/requests/${request.id}/review`}>
                                Ver Resultado
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        <Grid cols={3} gap={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-accent-400 mb-2">
              {requests.length}
            </div>
            <p className="text-sm text-primary-400">Total de solicitudes</p>
          </Card>

          <Card className="text-center">
            <div className="text-2xl font-bold text-success-400 mb-2">
              {requests.reduce((sum, r) => sum + r.proposalsCount, 0)}
            </div>
            <p className="text-sm text-primary-400">Propuestas recibidas</p>
          </Card>

          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-100 mb-2">
              {formatCurrency(requests.reduce((sum, r) => sum + r.budget, 0))}
            </div>
            <p className="text-sm text-primary-400">Presupuesto total</p>
          </Card>
        </Grid>
      </div>
    </PageContainer>
  );
};

export default MyRequestsPage;