import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userType: '',
    firstName: '',
    lastName: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    // Get token from URL if present (for OAuth flow)
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store the temporary token
      localStorage.setItem('authToken', token);
    }

    // If user already has a user type, redirect them
    if (user && user.userType) {
      if (user.userType === 'artist') {
        navigate('/artist/dashboard');
      } else {
        navigate('/feed');
      }
      return;
    }

    // Pre-fill any data we have from Google OAuth
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }
  }, [user, navigate, location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userType) {
      toast.error('Por favor selecciona el tipo de cuenta');
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      toast.error('Por favor completa tu nombre y apellido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.completeProfile({
        userType: formData.userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio
      });

      if (response.data) {
        // Store the new token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        // Update user context with new data
        updateUser(response.data.user);
        
        toast.success('¡Perfil completado exitosamente!');
        
        // Redirect based on user type
        if (formData.userType === 'artist') {
          navigate('/artist/dashboard');
        } else {
          navigate('/feed');
        }
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Error al completar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-primary-950 to-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <img 
            src="/paltattoo-icono.png" 
            alt="PalTattoo" 
            className="h-16 w-16 mx-auto mb-4 drop-shadow-neon"
          />
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Completa tu perfil
          </h2>
          <p className="mt-2 text-primary-300">
            Solo necesitamos algunos datos más para comenzar
          </p>
        </div>
        
        <div className="bg-black/60 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10 hover:border-accent-500/20 transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-3">
                ¿Qué tipo de cuenta quieres crear?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'userType', value: 'client' } })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.userType === 'client'
                      ? 'border-accent-500 bg-accent-500/20 text-white'
                      : 'border-white/20 bg-black/40 text-primary-300 hover:border-accent-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="font-medium">Cliente</div>
                  <div className="text-xs mt-1">Quiero tatuar</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'userType', value: 'artist' } })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.userType === 'artist'
                      ? 'border-accent-500 bg-accent-500/20 text-white'
                      : 'border-white/20 bg-black/40 text-primary-300 hover:border-accent-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">✏️</div>
                  <div className="font-medium">Tatuador</div>
                  <div className="text-xs mt-1">Soy artista</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-primary-200">
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                  placeholder="Tu nombre"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-primary-200">
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary-200">
                Teléfono (opcional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                placeholder="+56 9 1234 5678"
              />
            </div>

            {formData.userType === 'artist' && (
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-primary-200">
                  Acerca de ti (opcional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
                  placeholder="Cuéntanos sobre tu experiencia como tatuador..."
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !formData.userType}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-black bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed shadow-neon hover:shadow-neon-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Completando perfil...</span>
                  </div>
                ) : (
                  'Completar perfil'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;