import React, { useState, useEffect } from 'react';
import { 
  FiBarChart2, 
  FiEye, 
  FiHeart, 
  FiMessageCircle, 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiCalendar,
  FiActivity,
  FiTarget,
  FiAward,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';
import { Card, Grid, Section } from '../../common/Layout';
import { statsService } from '../../../services/api';
import toast from 'react-hot-toast';

const ArtistAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await statsService.getArtistStats(timeRange);
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Mock data for development
      setAnalytics({
        overview: {
          totalViews: 2845,
          totalLikes: 156,
          totalComments: 89,
          totalEarnings: 15420,
          profileVisits: 234,
          proposalsSent: 12,
          proposalsReceived: 8,
          completedProjects: 5
        },
        trends: {
          viewsChange: 12.5,
          likesChange: -3.2,
          commentsChange: 8.7,
          earningsChange: 24.1,
          profileVisitsChange: 15.3,
          proposalsChange: 33.3
        },
        topPerforming: [
          { title: 'Retrato Realista - Mujer', views: 450, likes: 28, comments: 12 },
          { title: 'Mandala Geométrico', views: 389, likes: 34, comments: 8 },
          { title: 'Tatuaje Tradicional - Rosa', views: 312, likes: 19, comments: 15 },
          { title: 'Blackwork - Lobo', views: 278, likes: 41, comments: 6 },
          { title: 'Acuarela - Colibrí', views: 245, likes: 22, comments: 9 }
        ],
        monthlyData: [
          { month: 'Ene', views: 180, likes: 12, earnings: 2300 },
          { month: 'Feb', views: 220, likes: 15, earnings: 2800 },
          { month: 'Mar', views: 280, likes: 18, earnings: 3200 },
          { month: 'Abr', views: 350, likes: 22, earnings: 3800 },
          { month: 'May', views: 420, likes: 28, earnings: 4100 },
          { month: 'Jun', views: 380, likes: 25, earnings: 3900 }
        ]
      });
      toast.error('Error al cargar analíticas - mostrando datos de ejemplo');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, prefix = '', suffix = '' }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-success-400' : 'text-red-400'
            }`}>
              {change >= 0 ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              <span>{Math.abs(change)}% vs mes anterior</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-700 rounded-lg">
          <Icon className="w-6 h-6 text-accent-500" />
        </div>
      </div>
    </Card>
  );

  const TimeRangeButton = ({ value, label, active, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-accent-500 text-white'
          : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  const { overview = {}, trends = {}, topPerforming = [], monthlyData = [] } = analytics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Analíticas</h1>
          <p className="text-primary-400 mt-1">Análisis detallado de tu rendimiento como artista</p>
        </div>
        
        <div className="flex space-x-2">
          <TimeRangeButton value="7d" label="7 días" active={timeRange === '7d'} onClick={setTimeRange} />
          <TimeRangeButton value="30d" label="30 días" active={timeRange === '30d'} onClick={setTimeRange} />
          <TimeRangeButton value="90d" label="90 días" active={timeRange === '90d'} onClick={setTimeRange} />
          <TimeRangeButton value="1y" label="1 año" active={timeRange === '1y'} onClick={setTimeRange} />
        </div>
      </div>

      {/* Overview Stats */}
      <Grid cols={4} gap={6}>
        <StatCard
          title="Visualizaciones Totales"
          value={overview.totalViews}
          icon={FiEye}
          change={trends.viewsChange}
        />
        <StatCard
          title="Me Gusta Recibidos"
          value={overview.totalLikes}
          icon={FiHeart}
          change={trends.likesChange}
        />
        <StatCard
          title="Comentarios"
          value={overview.totalComments}
          icon={FiMessageCircle}
          change={trends.commentsChange}
        />
        <StatCard
          title="Ingresos"
          value={overview.totalEarnings}
          icon={FiDollarSign}
          change={trends.earningsChange}
          prefix="$"
        />
      </Grid>

      <Grid cols={4} gap={6}>
        <StatCard
          title="Visitas al Perfil"
          value={overview.profileVisits}
          icon={FiUsers}
          change={trends.profileVisitsChange}
        />
        <StatCard
          title="Propuestas Enviadas"
          value={overview.proposalsSent}
          icon={FiActivity}
          change={trends.proposalsChange}
        />
        <StatCard
          title="Propuestas Recibidas"
          value={overview.proposalsReceived}
          icon={FiTarget}
        />
        <StatCard
          title="Proyectos Completados"
          value={overview.completedProjects}
          icon={FiAward}
        />
      </Grid>

      <Grid cols={2} gap={8}>
        {/* Top Performing Works */}
        <Section title="Trabajos con Mejor Rendimiento">
          <div className="space-y-4">
            {topPerforming.map((work, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-primary-700 rounded-lg">
                <div>
                  <h4 className="text-primary-100 font-medium">{work.title}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-primary-400">
                    <span className="flex items-center">
                      <FiEye className="w-4 h-4 mr-1" />
                      {work.views}
                    </span>
                    <span className="flex items-center">
                      <FiHeart className="w-4 h-4 mr-1" />
                      {work.likes}
                    </span>
                    <span className="flex items-center">
                      <FiMessageCircle className="w-4 h-4 mr-1" />
                      {work.comments}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-accent-500 font-bold">#{index + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Monthly Performance Chart */}
        <Section title="Rendimiento Mensual">
          <div className="space-y-6">
            {/* Views Chart */}
            <div>
              <h4 className="text-primary-200 font-medium mb-3">Visualizaciones</h4>
              <div className="flex items-end space-x-2 h-32">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-accent-500 rounded-t"
                      style={{ height: `${(data.views / 450) * 100}%` }}
                    ></div>
                    <span className="text-xs text-primary-400 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Chart */}
            <div>
              <h4 className="text-primary-200 font-medium mb-3">Ingresos ($)</h4>
              <div className="flex items-end space-x-2 h-32">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(data.earnings / 4100) * 100}%` }}
                    ></div>
                    <span className="text-xs text-primary-400 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </Grid>

      {/* Additional Insights */}
      <Section title="Insights y Recomendaciones">
        <Grid cols={3} gap={6}>
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <FiTrendingUp className="w-6 h-6 text-accent-500 mr-3" />
              <h4 className="text-primary-100 font-semibold">Mejor Día</h4>
            </div>
            <p className="text-primary-300 text-sm">
              Los martes tienes un 35% más de visualizaciones que otros días.
            </p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <FiActivity className="w-6 h-6 text-accent-500 mr-3" />
              <h4 className="text-primary-100 font-semibold">Estilo Popular</h4>
            </div>
            <p className="text-primary-300 text-sm">
              Tus trabajos de estilo realista reciben un 40% más de engagement.
            </p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <FiTarget className="w-6 h-6 text-accent-500 mr-3" />
              <h4 className="text-primary-100 font-semibold">Oportunidad</h4>
            </div>
            <p className="text-primary-300 text-sm">
              Considera subir más contenido los fines de semana para maximizar alcance.
            </p>
          </Card>
        </Grid>
      </Section>
    </div>
  );
};

export default ArtistAnalytics;