import React, { useState } from 'react';
import { PageContainer, Card, Grid } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import UpgradePrompt from '../../components/common/UpgradePrompt';
import { useAuth } from '../../contexts/AuthContext';
import { getUserFeatures } from '../../utils/subscriptionHelpers';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const userFeatures = getUserFeatures(user);
  const [timeRange, setTimeRange] = useState('30');
  
  // Mock analytics data
  const stats = {
    profileViews: 1247,
    proposalsSent: 23,
    proposalsAccepted: 8,
    totalRevenue: 1890000,
    avgPrice: 236250,
    completedWorks: 12,
    clientRetention: 75,
    rating: 4.8
  };

  const recentActivity = [
    { date: '2024-01-20', type: 'proposal_accepted', client: 'María González', value: 280000 },
    { date: '2024-01-19', type: 'work_completed', client: 'Carlos López', value: 150000 },
    { date: '2024-01-18', type: 'profile_view', count: 15 },
    { date: '2024-01-17', type: 'proposal_sent', client: 'Ana Martínez', value: 320000 },
    { date: '2024-01-16', type: 'work_completed', client: 'Diego Silva', value: 450000 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'proposal_accepted':
        return (
          <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'work_completed':
        return (
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'proposal_sent':
        return (
          <div className="h-8 w-8 bg-accent-600 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        );
      case 'profile_view':
        return (
          <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'proposal_accepted':
        return `${activity.client} aceptó tu propuesta`;
      case 'work_completed':
        return `Trabajo completado para ${activity.client}`;
      case 'proposal_sent':
        return `Propuesta enviada a ${activity.client}`;
      case 'profile_view':
        return `${activity.count} visualizaciones de perfil`;
      default:
        return 'Actividad';
    }
  };

  // Check if user has analytics access
  if (!userFeatures.analytics) {
    return (
      <PageContainer
        title="Estadísticas y Análisis"
        subtitle="Analiza tu rendimiento y crecimiento"
        maxWidth="full"
      >
        <UpgradePrompt 
          title="Actualiza tu plan para acceder a esta funcionalidad"
          description="Las estadísticas y análisis están disponibles solo para usuarios con plan Premium o superior"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Estadísticas y Análisis"
      subtitle="Analiza tu rendimiento y crecimiento"
      maxWidth="full"
      actions={
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-sm text-primary-100 focus:border-accent-500 focus:outline-none"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 3 meses</option>
            <option value="365">Último año</option>
          </select>
          <Button variant="secondary" size="sm">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Key Metrics */}
        <Grid cols={4} gap={6}>
          <Card className="text-center">
            <div className="text-3xl font-bold text-accent-400 mb-2">
              {stats.profileViews.toLocaleString()}
            </div>
            <p className="text-sm text-primary-400">Visualizaciones de perfil</p>
            <div className="mt-2 flex items-center justify-center text-xs text-green-400">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              +23% vs mes anterior
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-3xl font-bold text-primary-100 mb-2">
              {stats.proposalsSent}
            </div>
            <p className="text-sm text-primary-400">Propuestas enviadas</p>
            <div className="mt-2 text-xs text-primary-500">
              {Math.round((stats.proposalsAccepted / stats.proposalsSent) * 100)}% aceptadas
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-3xl font-bold text-success-400 mb-2">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-sm text-primary-400">Ingresos totales</p>
            <div className="mt-2 flex items-center justify-center text-xs text-green-400">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              +15% vs mes anterior
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {stats.rating}
            </div>
            <p className="text-sm text-primary-400">Calificación promedio</p>
            <div className="mt-2 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(stats.rating) ? 'text-yellow-400' : 'text-primary-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </Card>
        </Grid>

        {/* Charts Row */}
        <Grid cols={2} gap={6}>
          {/* Revenue Chart */}
          <Card title="Evolución de Ingresos">
            <div className="h-64 flex items-center justify-center bg-primary-800 rounded-lg">
              <div className="text-center">
                <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-primary-400">Gráfico de ingresos</p>
                <p className="text-primary-500 text-sm mt-1">Funcionalidad en desarrollo</p>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card title="Métricas de Rendimiento">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-primary-300">Precio promedio</span>
                <span className="text-primary-100 font-medium">{formatCurrency(stats.avgPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-300">Trabajos completados</span>
                <span className="text-primary-100 font-medium">{stats.completedWorks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-300">Retención de clientes</span>
                <span className="text-primary-100 font-medium">{stats.clientRetention}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-300">Tasa de conversión</span>
                <span className="text-primary-100 font-medium">
                  {Math.round((stats.proposalsAccepted / stats.proposalsSent) * 100)}%
                </span>
              </div>
            </div>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Card title="Actividad Reciente">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-primary-800 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-primary-200 text-sm">{getActivityDescription(activity)}</p>
                  <p className="text-primary-500 text-xs">{formatDate(activity.date)}</p>
                </div>
                {activity.value && (
                  <div className="text-right">
                    <p className="text-accent-400 font-medium">{formatCurrency(activity.value)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Insights */}
        <Grid cols={3} gap={6}>
          <Card title="Top Trabajos" className="text-center">
            <div className="space-y-3">
              <div className="p-3 bg-primary-800 rounded-lg">
                <p className="text-primary-200 font-medium">Realismo</p>
                <p className="text-accent-400 text-sm">45% de tus trabajos</p>
              </div>
              <div className="p-3 bg-primary-800 rounded-lg">
                <p className="text-primary-200 font-medium">Black & Grey</p>
                <p className="text-accent-400 text-sm">30% de tus trabajos</p>
              </div>
              <div className="p-3 bg-primary-800 rounded-lg">
                <p className="text-primary-200 font-medium">Neo-tradicional</p>
                <p className="text-accent-400 text-sm">25% de tus trabajos</p>
              </div>
            </div>
          </Card>

          <Card title="Clientes Frecuentes" className="text-center">
            <div className="space-y-3">
              {['María González', 'Carlos López', 'Ana Martínez'].map((client, index) => (
                <div key={index} className="p-3 bg-primary-800 rounded-lg">
                  <p className="text-primary-200 font-medium">{client}</p>
                  <p className="text-primary-500 text-sm">{3 - index} trabajos</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recomendaciones" className="text-center">
            <div className="space-y-3">
              <div className="p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                <p className="text-blue-400 text-sm">Sube más trabajos realistas</p>
              </div>
              <div className="p-3 bg-green-600/20 border border-green-600/30 rounded-lg">
                <p className="text-green-400 text-sm">Mejora tiempo de respuesta</p>
              </div>
              <div className="p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                <p className="text-yellow-400 text-sm">Considera subir precios</p>
              </div>
            </div>
          </Card>
        </Grid>
      </div>
    </PageContainer>
  );
};

export default AnalyticsPage;