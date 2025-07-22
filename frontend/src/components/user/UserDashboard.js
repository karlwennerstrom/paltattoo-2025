import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiUser, FiCreditCard, FiHeart, FiMessageCircle, FiSettings, FiMenu, FiX, FiEdit2, FiSave, FiCamera, FiMail, FiPhone, FiMapPin, FiCalendar, FiEye } from 'react-icons/fi';
import { profileService, paymentService, authService } from '../../services/api';
import toast from 'react-hot-toast';
import SubscriptionBadge from '../common/SubscriptionBadge';
import Input from '../common/Input';
import Button from '../common/Button';
import { getProfileImageUrl } from '../../utils/imageHelpers';
import SubscriptionTab from './SubscriptionTab';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [profileRes, subscriptionRes] = await Promise.all([
        profileService.get().catch(() => ({ data: null })),
        paymentService.getActiveSubscription().catch(() => ({ data: null }))
      ]);
      
      setProfile(profileRes.data);
      setSubscription(subscriptionRes.data);
      setEditedProfile(profileRes.data || {});
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: FiUser },
    { id: 'subscription', label: 'Suscripción', icon: FiCreditCard },
    { id: 'favorites', label: 'Favoritos', icon: FiHeart },
    { id: 'messages', label: 'Mensajes', icon: FiMessageCircle },
    { id: 'settings', label: 'Configuración', icon: FiSettings },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewAvatar(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Upload avatar if changed
      if (avatarFile) {
        await profileService.uploadAvatar(avatarFile);
        toast.success('Avatar actualizado exitosamente');
      }

      // Update profile data
      await profileService.update(editedProfile);
      toast.success('Perfil actualizado exitosamente');
      
      setProfile(editedProfile);
      setIsEditing(false);
      setAvatarFile(null);
      setPreviewAvatar(null);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
    setAvatarFile(null);
    setPreviewAvatar(null);
  };

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

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
          <p className="text-gray-400">Gestiona tu información personal</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={handleCancelEdit}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveProfile}>
                <FiSave className="mr-2" size={16} />
                Guardar
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              <FiEdit2 className="mr-2" size={16} />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-background-card rounded-xl p-6 border border-border">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={previewAvatar || getProfileImageUrl(profile?.avatar)}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-accent-500"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-accent-500 text-white p-2 rounded-full cursor-pointer hover:bg-accent-600 transition-colors">
                    <FiCamera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-1">
                {profile?.first_name} {profile?.last_name}
              </h3>
              
              <div className="flex items-center justify-center space-x-2 mb-3">
                <SubscriptionBadge 
                  subscriptionType={subscription?.plan?.plan_type} 
                  size="sm" 
                />
              </div>
              
              <p className="text-gray-400 text-sm">
                Miembro desde {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-background-card rounded-xl p-6 border border-border">
            <h4 className="text-lg font-semibold text-white mb-6">Información Personal</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                {isEditing ? (
                  <Input
                    value={editedProfile.first_name || ''}
                    onChange={(e) => setEditedProfile(prev => ({...prev, first_name: e.target.value}))}
                    placeholder="Tu nombre"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-background-primary rounded-lg">
                    <FiUser className="text-gray-400" size={16} />
                    <span className="text-white">{profile?.first_name || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido
                </label>
                {isEditing ? (
                  <Input
                    value={editedProfile.last_name || ''}
                    onChange={(e) => setEditedProfile(prev => ({...prev, last_name: e.target.value}))}
                    placeholder="Tu apellido"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-background-primary rounded-lg">
                    <FiUser className="text-gray-400" size={16} />
                    <span className="text-white">{profile?.last_name || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="flex items-center space-x-2 p-3 bg-background-primary rounded-lg">
                  <FiMail className="text-gray-400" size={16} />
                  <span className="text-white">{profile?.email || 'No especificado'}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar desde aquí</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                {isEditing ? (
                  <Input
                    value={editedProfile.phone || ''}
                    onChange={(e) => setEditedProfile(prev => ({...prev, phone: e.target.value}))}
                    placeholder="+56 9 1234 5678"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-background-primary rounded-lg">
                    <FiPhone className="text-gray-400" size={16} />
                    <span className="text-white">{profile?.phone || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ciudad
                </label>
                {isEditing ? (
                  <Input
                    value={editedProfile.city || ''}
                    onChange={(e) => setEditedProfile(prev => ({...prev, city: e.target.value}))}
                    placeholder="Tu ciudad"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-background-primary rounded-lg">
                    <FiMapPin className="text-gray-400" size={16} />
                    <span className="text-white">{profile?.city || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de nacimiento
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedProfile.birth_date || ''}
                    onChange={(e) => setEditedProfile(prev => ({...prev, birth_date: e.target.value}))}
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-background-primary rounded-lg">
                    <FiCalendar className="text-gray-400" size={16} />
                    <span className="text-white">
                      {profile?.birth_date 
                        ? new Date(profile.birth_date).toLocaleDateString('es-CL')
                        : 'No especificado'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biografía
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile(prev => ({...prev, bio: e.target.value}))}
                  placeholder="Cuéntanos un poco sobre ti..."
                  rows={4}
                  className="w-full bg-background-primary border border-border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-accent-500 focus:outline-none"
                />
              ) : (
                <div className="p-3 bg-background-primary rounded-lg">
                  <p className="text-white whitespace-pre-wrap">
                    {profile?.bio || 'No has añadido una biografía aún.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

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
            <img
              src={getProfileImageUrl(profile?.avatar)}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-white">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <div className="flex items-center space-x-2">
                <SubscriptionBadge 
                  subscriptionType={subscription?.plan?.plan_type} 
                  size="xs" 
                />
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

        <nav className="p-6 space-y-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={setActiveTab}
              isMobile={true}
            />
          ))}
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
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'subscription' && <SubscriptionTab />}
            {activeTab === 'favorites' && (
              <div className="text-center py-12">
                <FiHeart className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-300">Sección de favoritos en desarrollo</p>
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <FiMessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-300">Sección de mensajes en desarrollo</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <FiSettings className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-300">Configuración en desarrollo</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;