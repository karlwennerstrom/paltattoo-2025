import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleButton from '../../components/auth/GoogleButton';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('¡Bienvenido de vuelta!');
        // Redirect based on user type
        if (result.user.userType === 'artist') {
          navigate('/artist');
        } else {
          navigate('/feed');
        }
      } else {
        const errorMessage = result.error || 'Error al iniciar sesión';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Error de conexión. Intenta nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage);
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
            Iniciar sesión
          </h2>
          <p className="mt-2 text-primary-300">
            Bienvenido de vuelta
          </p>
        </div>
        
        <div className="bg-black/60 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10 hover:border-accent-500/20 transition-all duration-300">
          {/* Google OAuth Button */}
          <div className="mb-6">
            <GoogleButton />
          </div>
          
          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/60 text-primary-300">O continúa con email</span>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
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
                autoComplete="current-password"
                value={formData.password}
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
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-primary-300 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-accent-500 hover:text-accent-400 font-medium underline transition-colors">
                Regístrate
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link to="/forgot-password" className="text-primary-400 hover:text-accent-400 text-sm transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;