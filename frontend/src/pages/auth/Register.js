import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleButton from '../../components/auth/GoogleButton';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'client',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear email error when user types
    if (name === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setEmailError('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      if (result.success) {
        toast.success('¡Cuenta creada exitosamente!');
        // Redirect based on user type
        if (result.user.userType === 'artist') {
          navigate('/artist/dashboard');
        } else {
          navigate('/feed');
        }
      } else {
        // Check if it's a duplicate email error
        if (result.error && result.error.toLowerCase().includes('email') && result.error.toLowerCase().includes('registrado')) {
          setEmailError('Este email ya está registrado. ¿Quieres iniciar sesión?');
          toast.error('Este email ya está registrado');
        } else {
          setError(result.error || 'Error al registrarse');
          toast.error(result.error || 'Error al registrarse');
        }
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      toast.error('Error de conexión. Intenta nuevamente.');
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
            Crear cuenta
          </h2>
          <p className="mt-2 text-primary-300">
            Únete a la comunidad de tatuajes más grande
          </p>
        </div>
        
        <div className="bg-black/60 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10 hover:border-accent-500/20 transition-all duration-300">
          {/* Google OAuth Button */}
          <div className="mb-6">
            <GoogleButton text="Registrarse con Google" />
          </div>
          
          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/60 text-primary-300">O regístrate con email</span>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-primary-200">
                Tipo de cuenta
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
              >
                <option value="client">Cliente</option>
                <option value="artist">Tatuador</option>
              </select>
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
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-lg bg-black/40 backdrop-blur-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  emailError 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-white/20 focus:ring-accent-500 focus:border-accent-500'
                }`}
              />
              {emailError && (
                <div className="mt-2">
                  <p className="text-sm text-red-400">{emailError}</p>
                  <Link 
                    to="/login" 
                    className="text-sm text-accent-500 hover:text-accent-400 underline"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              )}
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
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-200">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-200">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-black bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed shadow-neon hover:shadow-neon-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Registrando...</span>
                  </div>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-primary-300 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-accent-500 hover:text-accent-400 font-medium underline transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;