import React, { useState } from 'react';
import { PageContainer, Card, Grid } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import { getProfileImageUrl } from '../../utils/imageHelpers';

const MyAppointmentsPage = () => {
  const [viewMode, setViewMode] = useState('upcoming');

  // Mock appointments data
  const appointments = [
    {
      id: 1,
      title: 'Sesión 1 - León Realista',
      artist: {
        name: 'Carlos Mendoza',
        avatar: null,
        studio: 'Ink Masters Studio',
        location: 'Providencia, Santiago'
      },
      date: '2024-01-25',
      startTime: '15:00',
      endTime: '18:00',
      duration: '3 horas',
      status: 'confirmed',
      type: 'session',
      price: 280000,
      notes: 'Primera sesión del tatuaje de león. Traer referencias adicionales.',
      requestId: 1
    },
    {
      id: 2,
      title: 'Consulta Inicial - Mandala',
      artist: {
        name: 'María Fernández',
        avatar: null,
        studio: 'Arte Corporal',
        location: 'Las Condes, Santiago'
      },
      date: '2024-01-28',
      startTime: '10:00',
      endTime: '11:00',
      duration: '1 hora',
      status: 'pending',
      type: 'consultation',
      price: 0,
      notes: 'Consulta para discutir diseño del mandala en la espalda.',
      requestId: 2
    },
    {
      id: 3,
      title: 'Sesión Final - Frase Minimalista',
      artist: {
        name: 'Sofía Vargas',
        avatar: null,
        studio: 'Minimal Ink',
        location: 'Ñuñoa, Santiago'
      },
      date: '2024-01-15',
      startTime: '14:00',
      endTime: '15:30',
      duration: '1.5 horas',
      status: 'completed',
      type: 'session',
      price: 120000,
      notes: 'Sesión completada exitosamente.',
      requestId: 3,
      completedAt: '2024-01-15T15:30:00Z'
    }
  ];

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'completed'
  );
  
  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < new Date() || apt.status === 'completed'
  );

  const currentAppointments = viewMode === 'upcoming' ? upcomingAppointments : pastAppointments;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { color: 'bg-green-600', text: 'Confirmada' },
      pending: { color: 'bg-yellow-600', text: 'Pendiente' },
      cancelled: { color: 'bg-red-600', text: 'Cancelada' },
      completed: { color: 'bg-blue-600', text: 'Completada' }
    };
    return badges[status] || badges.pending;
  };

  const getTypeIcon = (type) => {
    if (type === 'consultation') {
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3 3" />
      </svg>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2024-01-01 ${timeString}`).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageContainer
      title="Mis Citas"
      subtitle="Gestiona tus citas con tatuadores"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-primary-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'upcoming'
                  ? 'bg-accent-600 text-white'
                  : 'text-primary-300 hover:text-primary-100'
              }`}
            >
              Próximas ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setViewMode('past')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'past'
                  ? 'bg-accent-600 text-white'
                  : 'text-primary-300 hover:text-primary-100'
              }`}
            >
              Pasadas ({pastAppointments.length})
            </button>
          </div>

          {viewMode === 'upcoming' && upcomingAppointments.length > 0 && (
            <Button variant="secondary" size="sm">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Exportar Calendario
            </Button>
          )}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {currentAppointments.length === 0 ? (
            <Card className="text-center py-12">
              <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-primary-400 mb-4">
                {viewMode === 'upcoming' ? 'No tienes citas próximas' : 'No tienes citas pasadas'}
              </p>
              {viewMode === 'upcoming' && (
                <Button variant="primary" href="/feed">
                  Buscar Artistas
                </Button>
              )}
            </Card>
          ) : (
            currentAppointments.map((appointment) => {
              const statusBadge = getStatusBadge(appointment.status);
              
              return (
                <Card key={appointment.id} className="hover:bg-primary-750 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Date Column */}
                    <div className="text-center flex-shrink-0">
                      <div className="w-16 h-16 bg-accent-600 rounded-lg flex flex-col items-center justify-center text-white">
                        <div className="text-xs font-medium">
                          {new Date(appointment.date).toLocaleDateString('es-CL', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(appointment.date).getDate()}
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            {getTypeIcon(appointment.type)}
                            <h3 className="text-lg font-semibold text-primary-100">
                              {appointment.title}
                            </h3>
                          </div>
                          <p className="text-primary-400 text-sm">
                            {formatDate(appointment.date)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded text-white ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </div>

                      {/* Artist Info */}
                      <div className="flex items-center space-x-3 mb-3 p-3 bg-primary-800 rounded-lg">
                        <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                          {appointment.artist.avatar ? (
                            <img 
                              src={getProfileImageUrl(appointment.artist.avatar)} 
                              alt={appointment.artist.name} 
                              className="h-full w-full rounded-full object-cover" 
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary-200">
                              {appointment.artist.name?.[0] || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-primary-100">{appointment.artist.name}</p>
                          <p className="text-primary-400 text-sm">{appointment.artist.studio}</p>
                          <p className="text-primary-500 text-xs">{appointment.artist.location}</p>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-primary-400">Hora:</span>
                          <p className="text-primary-200 font-medium">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </p>
                        </div>
                        <div>
                          <span className="text-primary-400">Duración:</span>
                          <p className="text-primary-200 font-medium">{appointment.duration}</p>
                        </div>
                        <div>
                          <span className="text-primary-400">Tipo:</span>
                          <p className="text-primary-200 font-medium">
                            {appointment.type === 'consultation' ? 'Consulta' : 'Sesión'}
                          </p>
                        </div>
                        <div>
                          <span className="text-primary-400">Precio:</span>
                          <p className="text-accent-400 font-medium">
                            {appointment.price > 0 ? formatCurrency(appointment.price) : 'Gratis'}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="mb-4">
                          <p className="text-primary-300 text-sm bg-primary-800 p-3 rounded-lg">
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-primary-500">
                          Solicitud #{appointment.requestId}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'confirmed' && viewMode === 'upcoming' && (
                            <>
                              <Button variant="ghost" size="sm">
                                Reagendar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-error-400 hover:text-error-300">
                                Cancelar
                              </Button>
                              <Button variant="primary" size="sm">
                                Ver Detalles
                              </Button>
                            </>
                          )}
                          
                          {appointment.status === 'pending' && (
                            <>
                              <Button variant="secondary" size="sm">
                                Confirmar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-error-400 hover:text-error-300">
                                Rechazar
                              </Button>
                            </>
                          )}
                          
                          {appointment.status === 'completed' && (
                            <>
                              <Button variant="ghost" size="sm">
                                Ver Resultado
                              </Button>
                              <Button variant="secondary" size="sm">
                                Dejar Reseña
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
        <Grid cols={4} gap={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-accent-400 mb-2">
              {upcomingAppointments.length}
            </div>
            <p className="text-sm text-primary-400">Próximas citas</p>
          </Card>

          <Card className="text-center">
            <div className="text-2xl font-bold text-success-400 mb-2">
              {pastAppointments.filter(a => a.status === 'completed').length}
            </div>
            <p className="text-sm text-primary-400">Completadas</p>
          </Card>

          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-100 mb-2">
              {formatCurrency(appointments.reduce((sum, a) => sum + a.price, 0))}
            </div>
            <p className="text-sm text-primary-400">Total invertido</p>
          </Card>

          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {new Set(appointments.map(a => a.artist.name)).size}
            </div>
            <p className="text-sm text-primary-400">Artistas diferentes</p>
          </Card>
        </Grid>
      </div>
    </PageContainer>
  );
};

export default MyAppointmentsPage;