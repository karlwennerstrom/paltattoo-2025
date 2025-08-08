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

      try {
        console.log('🔗 Making auth check request to backend...');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        console.log('🌐 API URL:', apiUrl);
        
        // First attempt: try to get auth status using cookies
        let response = await fetch(`${apiUrl}/auth/check`, {
          credentials: 'include', // Important: include cookies in the request
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        // If auth check fails with 401, try to get a fresh token via callback endpoint
        if (!response.ok && response.status === 401) {
          console.log('🔄 Auth check failed, trying to get fresh token...');
          response = await fetch(`${apiUrl}/auth/google/verify`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('📡 Verify response status:', response.status);
        }
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Auth check response:', data);
          
          if (data.authenticated && data.user) {
            console.log('🎉 User authenticated successfully:', data.user);
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
            console.error('❌ Authentication failed:', { authenticated: data.authenticated, hasUser: !!data.user });
            throw new Error('No se pudo verificar la autenticación');
          }
        } else {
          console.error('❌ Auth check request failed:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          throw new Error('Error al verificar la autenticación');
        }
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