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
      const token = searchParams.get('token');
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

      if (token) {
        try {
          // Save token to localStorage
          localStorage.setItem('authToken', token);
          
          // Fetch user info using the token
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            
            // Update auth context
            loginWithToken(userData.user, token);
            
            toast.success('¡Inicio de sesión exitoso!');
            
            // Redirect based on user type
            if (userData.user.userType === 'artist') {
              navigate('/artist');
            } else if (userData.user.userType === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/feed');
            }
          } else {
            throw new Error('Error al obtener información del usuario');
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          toast.error('Error al procesar la autenticación');
          navigate('/login');
        }
      } else {
        toast.error('No se recibió token de autenticación');
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