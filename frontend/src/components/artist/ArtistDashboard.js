import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { PageLayout, Section, Grid, Card, Stack } from '../common/Layout';
import { FiUser, FiImage, FiMail, FiCalendar, FiCreditCard, FiBarChart2, FiEye, FiHeart, FiMessageCircle, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiX, FiSettings, FiCamera, FiMapPin, FiPhone, FiGlobe, FiInstagram, FiTwitter, FiFacebook, FiStar } from 'react-icons/fi';
import { artistService, paymentService, profileService, statsService } from '../../services/api';
import toast from 'react-hot-toast';
import ProposalsTab from './ProposalsTab';
import CalendarTab from './CalendarTabNew';

const ArtistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsRes, subscriptionRes, profileRes, plansRes] = await Promise.all([
        statsService.getArtistStats().catch(() => ({ data: {} })),
        paymentService.getMySubscription().catch(() => ({ data: null })),
        profileService.get().catch(() => ({ data: {} })),
        paymentService.getPlans().catch(() => ({ data: [] }))
      ]);
      
      setStats(statsRes.data);
      setSubscription(subscriptionRes.data);
      setProfile(profileRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FiBarChart2 },
    { id: 'profile', label: 'Perfil', icon: FiUser },
    { id: 'portfolio', label: 'Portfolio', icon: FiImage },
    { id: 'proposals', label: 'Propuestas', icon: FiMail },
    { id: 'calendar', label: 'Calendario', icon: FiCalendar },
    { id: 'payments', label: 'Pagos', icon: FiCreditCard },
    { id: 'analytics', label: 'Análisis', icon: FiTrendingUp },
  ];

  const TabButton = ({ tab, active, onClick }) => (
    <button
      onClick={() => onClick(tab.id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-accent-500 text-white shadow-lg'
          : 'text-primary-300 hover:text-accent-400 hover:bg-primary-800'
      }`}
    >
      <tab.icon size={16} />
      <span className="text-sm font-medium">{tab.label}</span>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      <Grid cols={4} className="mb-6">
        <Card className="text-center">
          <FiEye className="mx-auto mb-2 text-accent-500" size={24} />
          <p className="text-2xl font-bold text-primary-100">{stats.totalViews || 0}</p>
          <p className="text-sm text-primary-400">Visualizaciones</p>
        </Card>
        <Card className="text-center">
          <FiHeart className="mx-auto mb-2 text-accent-500" size={24} />
          <p className="text-2xl font-bold text-primary-100">{stats.totalLikes || 0}</p>
          <p className="text-sm text-primary-400">Me Gusta</p>
        </Card>
        <Card className="text-center">
          <FiMessageCircle className="mx-auto mb-2 text-accent-500" size={24} />
          <p className="text-2xl font-bold text-primary-100">{stats.totalProposals || 0}</p>
          <p className="text-sm text-primary-400">Propuestas</p>
        </Card>
        <Card className="text-center">
          <FiDollarSign className="mx-auto mb-2 text-accent-500" size={24} />
          <p className="text-2xl font-bold text-primary-100">${stats.totalEarnings || 0}</p>
          <p className="text-sm text-primary-400">Ingresos</p>
        </Card>
      </Grid>

      <Grid cols={2}>
        <Section title="Actividad Reciente">
          <div className="space-y-4">
            {stats.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-primary-700 rounded-lg">
                <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-sm text-primary-100">{activity.description}</p>
                  <p className="text-xs text-primary-400">{activity.date}</p>
                </div>
              </div>
            )) || <p className="text-primary-400">No hay actividad reciente</p>}
          </div>
        </Section>

        <Section title="Estado de Suscripción">
          <div className="space-y-4">
            {subscription ? (
              <div className="p-4 bg-primary-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-primary-100 font-medium">{subscription.plan?.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    subscription.status === 'active' 
                      ? 'bg-success-500 text-white' 
                      : 'bg-warning-500 text-white'
                  }`}>
                    {subscription.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-sm text-primary-400">
                  Próximo pago: {subscription.nextPayment ? new Date(subscription.nextPayment).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-primary-400">
                  ${subscription.plan?.price || 0}/mes
                </p>
              </div>
            ) : (
              <div className="p-4 bg-primary-700 rounded-lg">
                <p className="text-primary-100 mb-2">Sin suscripción activa</p>
                <button className="btn-primary text-sm">
                  Ver Planes
                </button>
              </div>
            )}
          </div>
        </Section>
      </Grid>
    </div>
  );

  const ProfileTab = () => (
    <div className="space-y-6">
      <Section title="Información Personal">
        <Grid cols={2}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                className="input-field"
                defaultValue={profile?.name || ''}
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                defaultValue={profile?.email || ''}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                className="input-field"
                defaultValue={profile?.phone || ''}
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                className="input-field"
                defaultValue={profile?.city || ''}
                placeholder="Santiago"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Dirección de Estudio
              </label>
              <input
                type="text"
                className="input-field"
                defaultValue={profile?.studioAddress || ''}
                placeholder="Dirección del estudio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Sitio Web
              </label>
              <input
                type="url"
                className="input-field"
                defaultValue={profile?.website || ''}
                placeholder="https://tuwebsite.com"
              />
            </div>
          </div>
        </Grid>
      </Section>

      <Section title="Biografía y Especialidades">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">
              Biografía
            </label>
            <textarea
              className="input-field h-24"
              defaultValue={profile?.bio || ''}
              placeholder="Cuéntanos sobre ti, tu experiencia y estilo..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">
              Especialidades
            </label>
            <input
              type="text"
              className="input-field"
              defaultValue={profile?.specialties?.join(', ') || ''}
              placeholder="Realismo, Tradicional, Geométrico..."
            />
          </div>
        </div>
      </Section>

      <div className="flex justify-end space-x-3">
        <button className="btn-secondary">
          Cancelar
        </button>
        <button className="btn-primary">
          Guardar Cambios
        </button>
      </div>
    </div>
  );

  const PortfolioTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary-100">Mi Portfolio</h2>
        <button className="btn-primary">
          <FiCamera className="mr-2" size={16} />
          Agregar Trabajo
        </button>
      </div>
      
      <Grid cols={3}>
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} padding="none" className="group cursor-pointer hover:shadow-2xl transition-all duration-300">
            <div className="relative">
              <img
                src={`https://picsum.photos/300/300?random=${i}`}
                alt={`Portfolio ${i + 1}`}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <FiEye className="mx-auto mb-2 text-white" size={24} />
                  <p className="text-white text-sm">Ver Detalles</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-primary-100 mb-1">Trabajo {i + 1}</h3>
              <p className="text-sm text-primary-400">Realismo • Hace 2 días</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <FiEye size={14} className="text-primary-400" />
                  <span className="text-xs text-primary-400">120</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiHeart size={14} className="text-accent-500" />
                  <span className="text-xs text-primary-400">24</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </Grid>
    </div>
  );

  const PaymentsTab = () => (
    <div className="space-y-6">
      <Grid cols={2}>
        <Section title="Suscripción Actual">
          {subscription ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-primary-100">
                    {subscription.plan?.name || 'Plan Básico'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    subscription.status === 'active' 
                      ? 'bg-success-500 text-white' 
                      : 'bg-warning-500 text-white'
                  }`}>
                    {subscription.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-primary-300 mb-2">{subscription.plan?.description || 'Plan básico'}</p>
                <p className="text-2xl font-bold text-accent-500 mb-2">
                  ${subscription.plan?.price || 0}/mes
                </p>
                <p className="text-sm text-primary-400">
                  Próximo pago: {subscription.nextPayment ? new Date(subscription.nextPayment).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="btn-secondary flex-1">
                  Cambiar Plan
                </button>
                <button className="btn-outline flex-1">
                  Cancelar Suscripción
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCreditCard className="mx-auto mb-4 text-primary-400" size={48} />
              <p className="text-primary-300 mb-4">No tienes una suscripción activa</p>
              <button className="btn-primary">
                Ver Planes Disponibles
              </button>
            </div>
          )}
        </Section>

        <Section title="Planes Disponibles">
          <div className="space-y-3">
            {plans.length > 0 ? plans.map((plan) => (
              <div key={plan.id} className="p-4 bg-primary-700 rounded-lg border-2 border-transparent hover:border-accent-500 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary-100">{plan.name}</h4>
                  <span className="text-lg font-bold text-accent-500">${plan.price}/mes</span>
                </div>
                <p className="text-sm text-primary-400 mb-3">{plan.description}</p>
                <ul className="space-y-1 mb-3">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-primary-300">
                      <FiCheckCircle className="mr-2 text-success-500" size={14} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-lg text-sm transition-all duration-200 ${
                  subscription?.plan?.id === plan.id
                    ? 'bg-primary-600 text-primary-400 cursor-not-allowed'
                    : 'bg-accent-500 text-white hover:bg-accent-600'
                }`}>
                  {subscription?.plan?.id === plan.id ? 'Plan Actual' : 'Seleccionar Plan'}
                </button>
              </div>
            )) : (
              <p className="text-primary-400">No hay planes disponibles</p>
            )}
          </div>
        </Section>
      </Grid>
    </div>
  );

  if (loading) {
    return (
      <PageLayout title="Dashboard del Artista">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Dashboard del Artista"
      subtitle="Gestiona tu perfil, portfolio y propuestas"
      actions={
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <FiSettings className="mr-2" size={16} />
            Configuración
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-primary-600">
          <nav className="flex space-x-1 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'portfolio' && <PortfolioTab />}
          {activeTab === 'proposals' && <ProposalsTab />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <FiBarChart2 className="mx-auto mb-4 text-primary-400" size={48} />
              <p className="text-primary-300">Análisis en desarrollo</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ArtistDashboard;