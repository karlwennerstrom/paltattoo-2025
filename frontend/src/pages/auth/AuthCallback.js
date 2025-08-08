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
      console.log('🔄 AuthCallback: Starting OAuth callback process');
      console.log('📋 Current URL:', window.location.href);
      console.log('🔍 Search params:', [...searchParams.entries()]);
      
      const error = searchParams.get('error');
      const authData = searchParams.get('auth');

      if (error) {
        console.error('❌ OAuth error detected:', error);
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

      // Check if we have auth data in URL
      if (authData) {
        try {
          console.log('🔑 Auth data received from URL');
          const decodedData = JSON.parse(decodeURIComponent(authData));
          console.log('✅ Decoded auth data:', decodedData);
          
          if (decodedData.token && decodedData.user) {
            // Store the token
            localStorage.setItem('authToken', decodedData.token);
            
            // Update auth context with user data
            loginWithToken(decodedData.user, decodedData.token);
            
            toast.success('¡Inicio de sesión exitoso!');
            
            // Clear the URL to remove sensitive data
            window.history.replaceState({}, document.title, '/auth/callback');
            
            // Redirect based on user type
            if (decodedData.user.userType === 'artist') {
              navigate('/artist');
            } else if (decodedData.user.userType === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/feed');
            }
            return;
          }
        } catch (parseError) {
          console.error('💥 Error parsing auth data:', parseError);
          toast.error('Error al procesar la autenticación');
          navigate('/login');
          return;
        }
      }
      
      // If no auth data in URL, show error
      console.error('❌ No auth data received');
      toast.error('No se recibió token de autenticación');
      navigate('/login');
      } catch (error) {
        console.error('💥 Auth callback error:', error);
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