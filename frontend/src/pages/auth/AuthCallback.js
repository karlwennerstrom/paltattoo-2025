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
      console.log('📋 Full URL object:', {
        href: window.location.href,
        search: window.location.search,
        hash: window.location.hash,
        pathname: window.location.pathname,
        origin: window.location.origin
      });
      
      const error = searchParams.get('error');
      const authKey = searchParams.get('key');
      
      console.log('📦 Extracted values:', {
        error: error,
        authKey: authKey ? `Present (${authKey.length} chars)` : 'Not present',
        hasKey: !!authKey
      });

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

      // Check if we have an auth key
      if (authKey) {
        try {
          console.log('🔑 Auth key received, fetching auth data...');
          
          // Debug environment variables
          console.log('🔧 Environment check:', {
            apiUrl: process.env.REACT_APP_API_URL,
            nodeEnv: process.env.NODE_ENV,
            currentOrigin: window.location.origin
          });
          
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          const verifyUrl = `${apiUrl}/auth/google/verify?key=${authKey}`;
          console.log('🔗 Attempting to fetch:', verifyUrl);
          
          const response = await fetch(verifyUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Include cookies in the request
          });
          
          console.log('📡 Verify response status:', response.status);
          console.log('📡 Response headers:', response.headers);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Auth data retrieved:', data);
            
            if (data.authenticated && data.token && data.user) {
              // Store the token
              localStorage.setItem('authToken', data.token);
              
              // Update auth context with user data
              loginWithToken(data.user, data.token);
              
              toast.success('¡Inicio de sesión exitoso!');
              
              // Clear the URL to remove the key
              window.history.replaceState({}, document.title, '/auth/callback');
              
              // Redirect based on user type
              if (data.user.userType === 'artist') {
                navigate('/artist');
              } else if (data.user.userType === 'admin') {
                navigate('/admin/dashboard');
              } else if (data.user.needsCompletion) {
                navigate('/complete-profile');
              } else {
                navigate('/feed');
              }
              return;
            }
          } else {
            const errorData = await response.json();
            console.error('❌ Verify failed:', errorData);
            throw new Error(errorData.error || 'Error al verificar autenticación');
          }
        } catch (error) {
          console.error('💥 Error fetching auth data:', error);
          toast.error(error.message || 'Error al procesar la autenticación');
          navigate('/login');
          return;
        }
      }
      
      // If no auth key in URL, show error
      console.error('❌ No auth key received');
      console.error('❌ URL analysis:', {
        fullURL: window.location.href,
        search: window.location.search,
        searchParams: Object.fromEntries(searchParams.entries()),
        keyParam: searchParams.get('key'),
        errorParam: searchParams.get('error')
      });
      toast.error('No se recibió clave de autenticación');
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