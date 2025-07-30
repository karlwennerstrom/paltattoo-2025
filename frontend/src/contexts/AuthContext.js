import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth...');
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await authService.getProfile();
          // Extract user data from response
          const userData = response.data.user || response.data;
          
          
          setUser(userData);
          // Update localStorage with correct user data
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.login({ email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('¡Bienvenido!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.register(userData);
      const { token, user: newUser } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      toast.success('¡Cuenta creada exitosamente!');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      toast.success('Sesión cerrada');
    }
  };

  const updateUser = (userData) => {
    const updatedUser = {
      ...user,
      ...userData
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const loginWithToken = (userData, token) => {
    // Direct login method for OAuth callbacks
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setError(null);
    return { success: true, user: userData };
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      setLoading(true);

      await authService.forgotPassword(email);
      toast.success('Te hemos enviado un email con instrucciones para restablecer tu contraseña');
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Error al enviar email';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      setLoading(true);

      await authService.resetPassword(token, newPassword);
      toast.success('Tu contraseña ha sido restablecida exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Error al restablecer contraseña';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(profileData);
      const updatedUser = response.data.user || response.data;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Perfil actualizado exitosamente');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await authService.getProfile();
        const userData = response.data.user || response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithToken,
    register,
    logout,
    updateUser,
    updateProfile,
    forgotPassword,
    resetPassword,
    refreshUserData,
    getAuthHeader,
    isAuthenticated: !!user,
    isArtist: user?.userType === 'artist' || user?.user_type === 'artist',
    isClient: user?.userType === 'client' || user?.user_type === 'client',
    isAdmin: user?.userType === 'admin' || user?.user_type === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};