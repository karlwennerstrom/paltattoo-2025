import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { PageLayout, Section, Grid, Card, Stack } from '../common/Layout';
import { FiUser, FiImage, FiMail, FiCalendar, FiCreditCard, FiBarChart2, FiEye, FiHeart, FiMessageCircle, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiX, FiSettings, FiCamera, FiMapPin, FiPhone, FiGlobe, FiInstagram, FiTwitter, FiFacebook, FiStar, FiMenu, FiFolder } from 'react-icons/fi';
import { artistService, paymentService, profileService, statsService } from '../../services/api';
import toast from 'react-hot-toast';
import ProposalsTab from './ProposalsTab';
import PublicOffersTab from './PublicOffersTab';
import PortfolioTab from './PortfolioTab';
import ProfileTab from './ProfileTab';
import CalendarTab from './CalendarTabNew';
import PaymentsTab from './PaymentsTab';
import ArtistAnalytics from './pages/ArtistAnalytics';
import SubscriptionBadge from '../common/SubscriptionBadge';

const ArtistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
    
    // Listen for tab switch events from child components
    const handleSwitchTab = (event) => {
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
      }
    };

    // Listen for proposals navigation events
    const handleNavigateToProposals = (event) => {
      setActiveTab('proposals');
      // Optionally, pass the proposal ID to highlight it
      if (event.detail?.proposalId) {
        // Store proposal ID for highlighting in proposals tab
        sessionStorage.setItem('highlightProposalId', event.detail.proposalId);
      }
    };
    
    window.addEventListener('switchTab', handleSwitchTab);
    window.addEventListener('navigateToProposals', handleNavigateToProposals);
    
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab);
      window.removeEventListener('navigateToProposals', handleNavigateToProposals);
    };
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
    { id: 'offers', label: 'Ofertas Públicas', icon: FiEye },
    { id: 'proposals', label: 'Mis Propuestas', icon: FiMail },
    { id: 'calendar', label: 'Calendario', icon: FiCalendar },
    { id: 'payments', label: 'Pagos', icon: FiCreditCard },
    { id: 'analytics', label: 'Análisis', icon: FiTrendingUp },
  ];

  const TabButton = ({ tab, active, onClick, isMobile = false }) => (
    <button
      onClick={() => {
        onClick(tab.id);
        if (isMobile) setSidebarOpen(false);
      }}
      className={twMerge(
        'flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-left',
        active
          ? 'bg-accent-500 text-white shadow-lg'
          : 'text-primary-300 hover:text-accent-400 hover:bg-primary-800'
      )}
    >
      <tab.icon size={18} />
      <span className="font-medium">{tab.label}</span>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      <Grid cols={3} className="mb-6">
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
      </Grid>

      <Grid cols={2}>
        <Section title="Próxima Cita">
          <div className="space-y-4">
            {stats.nextAppointment ? (
              <div className="p-4 bg-primary-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary-100">{stats.nextAppointment.title}</h4>
                  <span className="px-2 py-1 rounded text-xs bg-accent-500 text-white">
                    {stats.nextAppointment.status === 'confirmed' ? 'Confirmada' : 'Programada'}
                  </span>
                </div>
                <p className="text-sm text-primary-400 mb-1">
                  📅 {new Date(stats.nextAppointment.appointment_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
                <p className="text-sm text-primary-400 mb-1">
                  ⏰ {stats.nextAppointment.start_time} - {stats.nextAppointment.end_time}
                </p>
                <p className="text-sm text-primary-400 mb-3">
                  👤 {stats.nextAppointment.client_name}
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('calendar')}
                    className="flex-1 px-3 py-2 bg-accent-600 text-white text-xs rounded hover:bg-accent-700 transition-colors"
                  >
                    Ver Detalles
                  </button>
                  <button 
                    onClick={() => setActiveTab('calendar')}
                    className="px-3 py-2 bg-primary-600 text-primary-100 text-xs rounded hover:bg-primary-500 transition-colors"
                  >
                    Ver Todas
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-primary-700 rounded-lg text-center">
                <FiCalendar className="mx-auto mb-2 text-primary-400" size={24} />
                <p className="text-primary-300 mb-3">No tienes citas próximas</p>
                <button 
                  onClick={() => setActiveTab('calendar')}
                  className="px-4 py-2 bg-accent-600 text-white text-sm rounded hover:bg-accent-700 transition-colors"
                >
                  Programar Cita
                </button>
              </div>
            )}
          </div>
        </Section>
        <Section title="Actividad Reciente">
          <div className="space-y-4">
            {(() => {
              const activities = [];
              
              // Profile updates
              if (profile?.user?.updatedAt) {
                activities.push({
                  icon: FiUser,
                  description: 'Perfil actualizado',
                  date: new Date(profile.user.updatedAt).toLocaleDateString('es-ES'),
                  type: 'profile'
                });
              }
              
              // Portfolio updates
              if (stats.recentPortfolioUpdate) {
                activities.push({
                  icon: FiImage,
                  description: 'Portfolio actualizado',
                  date: stats.recentPortfolioUpdate,
                  type: 'portfolio'
                });
              }
              
              // Recent appointments
              if (stats.recentAppointments > 0) {
                activities.push({
                  icon: FiCalendar,
                  description: `${stats.recentAppointments} nueva${stats.recentAppointments > 1 ? 's' : ''} cita${stats.recentAppointments > 1 ? 's' : ''} programada${stats.recentAppointments > 1 ? 's' : ''}`,
                  date: 'Esta semana',
                  type: 'appointment'
                });
              }
              
              // Recent proposals
              if (stats.recentProposals > 0) {
                activities.push({
                  icon: FiMessageCircle,
                  description: `${stats.recentProposals} nueva${stats.recentProposals > 1 ? 's' : ''} propuesta${stats.recentProposals > 1 ? 's' : ''} enviada${stats.recentProposals > 1 ? 's' : ''}`,
                  date: 'Esta semana',
                  type: 'proposal'
                });
              }
              
              // Subscription updates
              if (subscription?.status === 'active' && subscription?.updatedAt) {
                activities.push({
                  icon: FiCreditCard,
                  description: 'Suscripción activada',
                  date: new Date(subscription.updatedAt).toLocaleDateString('es-ES'),
                  type: 'subscription'
                });
              }
              
              // Sort by priority and limit to 5
              const sortedActivities = activities.slice(0, 5);
              
              return sortedActivities.length > 0 ? sortedActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-primary-700 rounded-lg">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                    <activity.icon className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-primary-100">{activity.description}</p>
                    <p className="text-xs text-primary-400">{activity.date}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                  <FiSettings className="mx-auto mb-2 text-primary-400" size={24} />
                  <p className="text-primary-400">No hay actividad reciente</p>
                  <p className="text-xs text-primary-500 mt-1">
                    Actualiza tu perfil o portfolio para ver actividad
                  </p>
                </div>
              );
            })()}
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




  // Loading state is now handled within the main return

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={twMerge(
        'fixed inset-y-0 left-0 z-50 w-72 bg-background-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <FiUser className="text-white" size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-white">{profile?.name || 'Artista'}</h2>
              <div className="flex items-center space-x-2">
                <SubscriptionBadge subscriptionType={subscription?.plan?.plan_type} size="xs" />
                {subscription?.status === 'active' && (
                  <span className="text-xs text-success-400">Activo</span>
                )}
              </div>
            </div>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex flex-col h-full">
          <div className="p-6 space-y-2 flex-1">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={setActiveTab}
                isMobile={true}
              />
            ))}
          </div>
          
          {/* Logout Button at Bottom */}
          <div className="p-6 border-t border-primary-700">
            <button 
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }
              }}
            >
              <FiX size={18} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-background-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-400">
                {activeTab === 'overview' && 'Resumen de tu actividad y estadísticas'}
                {activeTab === 'profile' && 'Gestiona tu información personal'}
                {activeTab === 'portfolio' && 'Gestiona tu portfolio en colecciones organizadas'}
                {activeTab === 'offers' && 'Encuentra nuevos proyectos'}
                {activeTab === 'proposals' && 'Gestiona tus propuestas'}
                {activeTab === 'calendar' && 'Administra tus citas y horarios'}
                {activeTab === 'payments' && 'Suscripción y facturación'}
                {activeTab === 'analytics' && 'Estadísticas y análisis'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn-secondary hidden sm:flex">
              <FiSettings className="mr-2" size={16} />
              Configuración
            </button>
            <button className="btn-secondary sm:hidden">
              <FiSettings size={16} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'portfolio' && <PortfolioTab />}
              {activeTab === 'offers' && <PublicOffersTab />}
              {activeTab === 'proposals' && <ProposalsTab />}
              {activeTab === 'calendar' && <CalendarTab />}
              {activeTab === 'payments' && <PaymentsTab />}
              {activeTab === 'analytics' && <ArtistAnalytics />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ArtistDashboard;