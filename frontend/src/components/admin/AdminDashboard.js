import React, { useState, useEffect } from 'react';
import { PageLayout, Section, Grid, Card, Stack } from '../common/Layout';
import { FiUsers, FiImage, FiMail, FiShoppingBag, FiBarChart2, FiSettings, FiAlertCircle, FiTrendingUp, FiDollarSign, FiCalendar, FiEye, FiFlag, FiDatabase, FiActivity } from 'react-icons/fi';
import { statsService, sponsoredShopsService, paymentService } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, shopsStatsRes, paymentStatsRes] = await Promise.all([
        statsService.getGeneral().catch(() => ({ data: {} })),
        sponsoredShopsService.getStats().catch(() => ({ data: {} })),
        paymentService.getPaymentStats().catch(() => ({ data: {} }))
      ]);
      
      setStats({
        ...statsRes.data,
        shops: shopsStatsRes.data,
        payments: paymentStatsRes.data
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Error al cargar los datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FiBarChart2 },
    { id: 'users', label: 'Usuarios', icon: FiUsers },
    { id: 'content', label: 'Contenido', icon: FiImage },
    { id: 'shops', label: 'Tiendas', icon: FiShoppingBag },
    { id: 'payments', label: 'Pagos', icon: FiDollarSign },
    { id: 'reports', label: 'Reportes', icon: FiFlag },
    { id: 'system', label: 'Sistema', icon: FiSettings },
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

  const MetricCard = ({ title, value, icon: Icon, color = 'text-accent-500', trend, subtitle }) => (
    <Card className="text-center p-6">
      <Icon className={`mx-auto mb-3 ${color}`} size={32} />
      <h3 className="text-2xl font-bold text-primary-100">{value}</h3>
      <p className="text-sm text-primary-400 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-primary-500 mt-1">{subtitle}</p>}
      {trend && (
        <div className={`flex items-center justify-center mt-2 text-xs ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
          <FiTrendingUp className="mr-1" size={12} />
          {trend.value}
        </div>
      )}
    </Card>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      <Grid cols={4}>
        <MetricCard
          title="Total Usuarios"
          value={stats.totalUsers || 0}
          icon={FiUsers}
          subtitle="Clientes y Artistas"
          trend={{ positive: true, value: '+12% este mes' }}
        />
        <MetricCard
          title="Ofertas Activas"
          value={stats.activeOffers || 0}
          icon={FiMail}
          color="text-blue-500"
          subtitle="Publicadas este mes"
        />
        <MetricCard
          title="Tiendas Activas"
          value={stats.shops?.active_shops || 0}
          icon={FiShoppingBag}
          color="text-green-500"
          subtitle="Patrocinadoras"
        />
        <MetricCard
          title="Ingresos del Mes"
          value={`$${stats.payments?.monthly_revenue || 0}`}
          icon={FiDollarSign}
          color="text-purple-500"
          subtitle="Suscripciones"
        />
      </Grid>

      <Grid cols={3}>
        <MetricCard
          title="Propuestas Enviadas"
          value={stats.totalProposals || 0}
          icon={FiMail}
          color="text-orange-500"
          subtitle="Este mes"
        />
        <MetricCard
          title="Citas Programadas"
          value={stats.totalAppointments || 0}
          icon={FiCalendar}
          color="text-teal-500"
          subtitle="Próximas"
        />
        <MetricCard
          title="Visualizaciones"
          value={stats.totalViews || 0}
          icon={FiEye}
          color="text-indigo-500"
          subtitle="Total de la plataforma"
        />
      </Grid>

      <Grid cols={2}>
        <Section title="Actividad Reciente">
          <div className="space-y-3">
            {[
              { user: 'Juan Pérez', action: 'Se registró como artista', time: 'Hace 5 min' },
              { user: 'María González', action: 'Creó una nueva oferta', time: 'Hace 15 min' },
              { user: 'Carlos Rodríguez', action: 'Aceptó una propuesta', time: 'Hace 1 hora' },
              { user: 'Ana López', action: 'Subió trabajo al portfolio', time: 'Hace 2 horas' },
              { user: 'TattooSupply Pro', action: 'Renovó suscripción destacada', time: 'Hace 3 horas' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-primary-700 rounded-lg">
                <div>
                  <p className="text-sm text-primary-100">{activity.user}</p>
                  <p className="text-xs text-primary-400">{activity.action}</p>
                </div>
                <span className="text-xs text-primary-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Alertas del Sistema">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <FiAlertCircle className="text-yellow-500 mt-0.5" size={16} />
              <div>
                <p className="text-sm text-primary-100">Disco casi lleno</p>
                <p className="text-xs text-primary-400">El servidor está usando el 85% del espacio</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <FiActivity className="text-blue-500 mt-0.5" size={16} />
              <div>
                <p className="text-sm text-primary-100">Pico de tráfico</p>
                <p className="text-xs text-primary-400">300% más visitantes que el promedio</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <FiDatabase className="text-green-500 mt-0.5" size={16} />
              <div>
                <p className="text-sm text-primary-100">Backup completado</p>
                <p className="text-xs text-primary-400">Respaldo automático realizado exitosamente</p>
              </div>
            </div>
          </div>
        </Section>
      </Grid>
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary-100">Gestión de Usuarios</h2>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            Exportar Usuarios
          </button>
          <button className="btn-primary">
            Crear Usuario
          </button>
        </div>
      </div>

      <Grid cols={3}>
        <MetricCard
          title="Total Usuarios"
          value={stats.totalUsers || 0}
          icon={FiUsers}
        />
        <MetricCard
          title="Artistas"
          value={stats.totalArtists || 0}
          icon={FiUsers}
          color="text-blue-500"
        />
        <MetricCard
          title="Clientes"
          value={stats.totalClients || 0}
          icon={FiUsers}
          color="text-green-500"
        />
      </Grid>

      <Section title="Usuarios Recientes">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-primary-400 uppercase tracking-wider">
                <th className="py-2">Usuario</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Registro</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: 'Juan Pérez', type: 'Artista', date: '2024-01-15', status: 'Activo' },
                { name: 'María González', type: 'Cliente', date: '2024-01-14', status: 'Activo' },
                { name: 'Carlos Rodríguez', type: 'Artista', date: '2024-01-13', status: 'Pendiente' },
                { name: 'Ana López', type: 'Cliente', date: '2024-01-12', status: 'Activo' },
              ].map((user, index) => (
                <tr key={index} className="border-t border-primary-600">
                  <td className="py-3 text-primary-100">{user.name}</td>
                  <td className="py-3 text-primary-300">{user.type}</td>
                  <td className="py-3 text-primary-400">{user.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'Activo' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">Ver</button>
                      <button className="text-accent-400 hover:text-accent-300">Editar</button>
                      <button className="text-red-400 hover:text-red-300">Desactivar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );

  const SystemTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary-100">Configuración del Sistema</h2>
        <button className="btn-primary">
          Guardar Configuración
        </button>
      </div>

      <Grid cols={2}>
        <Section title="Configuración General">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Nombre de la Plataforma
              </label>
              <input
                type="text"
                className="input-field"
                defaultValue="TattooConnect"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Email de Contacto
              </label>
              <input
                type="email"
                className="input-field"
                defaultValue="contacto@tattooconnect.cl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Máximo de Imágenes por Portfolio
              </label>
              <input
                type="number"
                className="input-field"
                defaultValue="20"
              />
            </div>
          </div>
        </Section>

        <Section title="Límites y Restricciones">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Tamaño máximo de archivo (MB)
              </label>
              <input
                type="number"
                className="input-field"
                defaultValue="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Ofertas activas por usuario
              </label>
              <input
                type="number"
                className="input-field"
                defaultValue="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">
                Propuestas por oferta
              </label>
              <input
                type="number"
                className="input-field"
                defaultValue="50"
              />
            </div>
          </div>
        </Section>
      </Grid>

      <Section title="Mantenimiento">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-secondary p-4 text-left">
            <FiDatabase className="mb-2" size={20} />
            <div>
              <h4 className="font-medium">Backup Base de Datos</h4>
              <p className="text-xs text-primary-400">Último: Hace 2 horas</p>
            </div>
          </button>
          <button className="btn-secondary p-4 text-left">
            <FiSettings className="mb-2" size={20} />
            <div>
              <h4 className="font-medium">Limpiar Cache</h4>
              <p className="text-xs text-primary-400">Optimizar rendimiento</p>
            </div>
          </button>
          <button className="btn-outline p-4 text-left">
            <FiActivity className="mb-2" size={20} />
            <div>
              <h4 className="font-medium">Modo Mantenimiento</h4>
              <p className="text-xs text-primary-400">Actualmente desactivado</p>
            </div>
          </button>
        </div>
      </Section>
    </div>
  );

  if (loading) {
    return (
      <PageLayout title="Panel de Administración">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Panel de Administración"
      subtitle="Gestiona todos los aspectos de la plataforma"
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
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'content' && (
            <div className="text-center py-12">
              <FiImage className="mx-auto mb-4 text-primary-400" size={48} />
              <p className="text-primary-300">Gestión de contenido en desarrollo</p>
            </div>
          )}
          {activeTab === 'shops' && (
            <div className="text-center py-12">
              <FiShoppingBag className="mx-auto mb-4 text-primary-400" size={48} />
              <p className="text-primary-300">Gestión de tiendas en desarrollo</p>
            </div>
          )}
          {activeTab === 'payments' && (
            <div className="text-center py-12">
              <FiDollarSign className="mx-auto mb-4 text-primary-400" size={48} />
              <p className="text-primary-300">Gestión de pagos en desarrollo</p>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <FiFlag className="mx-auto mb-4 text-primary-400" size={48} />
              <p className="text-primary-300">Sistema de reportes en desarrollo</p>
            </div>
          )}
          {activeTab === 'system' && <SystemTab />}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;