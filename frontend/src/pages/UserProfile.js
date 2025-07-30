import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, Card } from '../components/common/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { FiEdit3, FiCamera, FiMapPin, FiMail, FiPhone, FiUser, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Mi Perfil' }
      ]}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 p-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user?.profile_image || "/placeholder-avatar.jpg"}
                alt={user?.first_name || 'Usuario'}
                className="h-24 w-24 rounded-full object-cover border-4 border-primary-600"
                onError={(e) => {
                  e.target.src = "/placeholder-avatar.jpg";
                }}
              />
              <button className="absolute bottom-0 right-0 h-8 w-8 bg-accent-600 rounded-full flex items-center justify-center hover:bg-accent-700 transition-colors">
                <FiCamera className="h-4 w-4 text-white" />
              </button>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-success-500 border-2 border-primary-700 rounded-full"></div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-primary-100">
                    {user?.first_name} {user?.last_name}
                  </h1>
                  <p className="text-primary-400">{user?.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-primary-400">
                    <span className="flex items-center space-x-1">
                      <FiUser className="h-4 w-4" />
                      <span>Cliente</span>
                    </span>
                    {user?.phone && (
                      <span className="flex items-center space-x-1">
                        <FiPhone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        <FiX className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        <FiSave className="h-4 w-4 mr-1" />
                        {loading ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <FiEdit3 className="h-4 w-4 mr-1" />
                      Editar perfil
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card title="Información Personal">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Nombre
                  </label>
                  {isEditing ? (
                    <Input
                      value={profileData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <p className="text-primary-300 bg-primary-800 p-3 rounded-lg">
                      {profileData.first_name || 'No especificado'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Apellido
                  </label>
                  {isEditing ? (
                    <Input
                      value={profileData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Tu apellido"
                    />
                  ) : (
                    <p className="text-primary-300 bg-primary-800 p-3 rounded-lg">
                      {profileData.last_name || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@email.com"
                  />
                ) : (
                  <p className="text-primary-300 bg-primary-800 p-3 rounded-lg flex items-center">
                    <FiMail className="h-4 w-4 mr-2" />
                    {profileData.email || 'No especificado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Teléfono
                </label>
                {isEditing ? (
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                ) : (
                  <p className="text-primary-300 bg-primary-800 p-3 rounded-lg flex items-center">
                    <FiPhone className="h-4 w-4 mr-2" />
                    {profileData.phone || 'No especificado'}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card title="Información Adicional">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Ubicación
                </label>
                {isEditing ? (
                  <Input
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Santiago, Chile"
                  />
                ) : (
                  <p className="text-primary-300 bg-primary-800 p-3 rounded-lg flex items-center">
                    <FiMapPin className="h-4 w-4 mr-2" />
                    {profileData.location || 'No especificado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Acerca de mí
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Cuéntanos sobre tus gustos de tatuajes, estilos preferidos, etc."
                    rows={4}
                    className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-primary-100 placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="text-primary-300 bg-primary-800 p-3 rounded-lg min-h-[100px]">
                    {profileData.bio || 'No hay información adicional'}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Account Statistics */}
        <Card title="Estadísticas de la Cuenta">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary-800 rounded-lg">
              <p className="text-2xl font-bold text-accent-400">0</p>
              <p className="text-sm text-primary-400">Solicitudes enviadas</p>
            </div>
            <div className="text-center p-4 bg-primary-800 rounded-lg">
              <p className="text-2xl font-bold text-accent-400">0</p>
              <p className="text-sm text-primary-400">Artistas favoritos</p>
            </div>
            <div className="text-center p-4 bg-primary-800 rounded-lg">
              <p className="text-2xl font-bold text-accent-400">0</p>
              <p className="text-sm text-primary-400">Tatuajes completados</p>
            </div>
          </div>
        </Card>

        {/* Back to Dashboard */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default UserProfile;