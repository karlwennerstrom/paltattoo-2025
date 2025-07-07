import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';

const OverviewTab = () => {
  const metrics = [
    {
      title: 'Propuestas Activas',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Trabajos Completados',
      value: '127',
      change: '+5',
      changeType: 'positive',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Calificación Promedio',
      value: '4.8',
      change: '+0.1',
      changeType: 'positive',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      title: 'Ingresos del Mes',
      value: '$1.2M',
      change: '+12%',
      changeType: 'positive',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];

  const recentActivity = [
    {
      type: 'proposal',
      title: 'Nueva propuesta recibida',
      description: 'Tatuaje realista en el brazo - $180.000',
      time: 'Hace 2 horas',
      status: 'new'
    },
    {
      type: 'completion',
      title: 'Trabajo completado',
      description: 'Tatuaje de león en la espalda - María González',
      time: 'Hace 1 día',
      status: 'completed'
    },
    {
      type: 'review',
      title: 'Nueva reseña recibida',
      description: '⭐⭐⭐⭐⭐ "Excelente trabajo, muy profesional"',
      time: 'Hace 2 días',
      status: 'positive'
    },
    {
      type: 'appointment',
      title: 'Cita programada',
      description: 'Consulta inicial - Diego Rivera - Mañana 14:00',
      time: 'Hace 3 días',
      status: 'scheduled'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      client: 'Ana Martínez',
      type: 'Sesión de tatuaje',
      date: 'Hoy',
      time: '15:00',
      duration: '3 horas',
      status: 'confirmed'
    },
    {
      id: 2,
      client: 'Carlos López',
      type: 'Consulta inicial',
      date: 'Mañana',
      time: '10:30',
      duration: '30 min',
      status: 'confirmed'
    },
    {
      id: 3,
      client: 'Sofía Rivera',
      type: 'Sesión de tatuaje',
      date: 'Viernes',
      time: '16:00',
      duration: '2 horas',
      status: 'pending'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'proposal':
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'completion':
        return (
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'review':
        return (
          <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
      case 'appointment':
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta, Carlos!</h1>
        <p className="opacity-90">
          Tienes 3 nuevas propuestas esperando tu respuesta y 2 citas confirmadas para hoy.
        </p>
      </div>

      {/* Metrics Grid */}
      <Grid cols={4} gap={6}>
        {metrics.map((metric, index) => (
          <Card key={index} className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-accent-100 text-accent-600 p-3 rounded-full">
                {metric.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-primary-100 mb-1">{metric.value}</h3>
            <p className="text-sm text-primary-400 mb-2">{metric.title}</p>
            <div className={twMerge(
              'inline-flex items-center text-xs px-2 py-1 rounded-full',
              metric.changeType === 'positive' 
                ? 'bg-success-100 text-success-700' 
                : 'bg-error-100 text-error-700'
            )}>
              <span>{metric.change} esta semana</span>
            </div>
          </Card>
        ))}
      </Grid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="Actividad Reciente">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-primary-800 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-primary-100">{activity.title}</h4>
                  <p className="text-sm text-primary-400 mt-1">{activity.description}</p>
                  <p className="text-xs text-primary-500 mt-2">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="ghost" size="sm" fullWidth>
              Ver toda la actividad
            </Button>
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card title="Próximas Citas">
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-3 bg-primary-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-primary-100">{appointment.client}</h4>
                  <span className={twMerge(
                    'px-2 py-1 text-xs rounded-full',
                    appointment.status === 'confirmed' 
                      ? 'bg-success-600 text-white'
                      : 'bg-yellow-600 text-white'
                  )}>
                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>
                <p className="text-sm text-primary-400 mb-1">{appointment.type}</p>
                <div className="flex items-center justify-between text-xs text-primary-500">
                  <span>{appointment.date} • {appointment.time}</span>
                  <span>{appointment.duration}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="ghost" size="sm" fullWidth>
              Ver calendario completo
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-100 mb-2">Nuevo Trabajo</h3>
          <p className="text-sm text-primary-400 mb-4">Agrega un nuevo trabajo a tu portfolio</p>
          <Button variant="primary" size="sm" fullWidth>
            Agregar Trabajo
          </Button>
        </Card>

        <Card className="text-center">
          <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-100 mb-2">Programar Cita</h3>
          <p className="text-sm text-primary-400 mb-4">Agenda una nueva cita con un cliente</p>
          <Button variant="secondary" size="sm" fullWidth>
            Nueva Cita
          </Button>
        </Card>

        <Card className="text-center">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-100 mb-2">Ver Estadísticas</h3>
          <p className="text-sm text-primary-400 mb-4">Analiza tu rendimiento y métricas</p>
          <Button variant="ghost" size="sm" fullWidth>
            Ver Reportes
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;