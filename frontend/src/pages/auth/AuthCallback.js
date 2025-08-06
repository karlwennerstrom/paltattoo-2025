import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get('error');

      if (error) {
        let errorMessage = 'Error al iniciar sesión con Google';
        
        switch (error) {
          case 'oauth_error':
            errorMessage = 'Error en la autenticación con Google';
            break;
          case 'oauth_failed':
            errorMessage = 'La autenticación con Google falló';
            break;
          case 'token_error':
            errorMessage = 'Error al procesar la autenticación';
            break;
          default:
            errorMessage = 'Error desconocido durante la autenticación';
        }
        
        toast.error(errorMessage);
        navigate('/login');
        return;
      }

      try {
        // The backend sets an httpOnly cookie, so we need to check auth status
        // using credentials instead of expecting a token in the URL
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/check`, {
          credentials: 'include', // Important: include cookies in the request
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.authenticated && data.user) {
            // Since we're using httpOnly cookies, we don't have a token to store
            // The cookie is already set by the backend
            // We'll use a placeholder token to indicate authenticated state
            const placeholderToken = 'google-oauth-cookie';
            localStorage.setItem('authToken', placeholderToken);
            
            // Update auth context with user data
            loginWithToken(data.user, placeholderToken);
            
            toast.success('¡Inicio de sesión exitoso!');
            
            // Redirect based on user type
            if (data.user.userType === 'artist' || data.user.user_type === 'artist') {
              navigate('/artist');
            } else if (data.user.userType === 'admin' || data.user.user_type === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/feed');
            }
          } else {
            throw new Error('No se pudo verificar la autenticación');
          }
        } else {
          throw new Error('Error al verificar la autenticación');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Error al procesar la autenticación');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-primary-100 mb-2">
          Procesando autenticación...
        </h2>
        <p className="text-primary-400">
          Por favor espera mientras completamos tu inicio de sesión
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;