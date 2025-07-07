import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, useApp } from '../../context';
import { Button, Input, Card } from '../../components/common';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { showSuccess, showError } = useApp();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    // Validate token format
    if (!token || token.length < 20) {
      setIsTokenValid(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, formData.password);
      showSuccess('Tu contraseña ha sido restablecida exitosamente');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña';
      if (errorMessage.includes('token') || errorMessage.includes('expired')) {
        setIsTokenValid(false);
      }
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-error-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-primary-100">
              Enlace Inválido
            </h2>
            <p className="mt-2 text-primary-400">
              El enlace de recuperación es inválido o ha expirado
            </p>
          </div>

          <Card className="p-8">
            <div className="text-center space-y-4">
              <p className="text-primary-300">
                Los enlaces de recuperación de contraseña son válidos por 1 hora.
                Si tu enlace ha expirado, puedes solicitar uno nuevo.
              </p>
              
              <div className="pt-4 space-y-3">
                <Link to="/forgot-password">
                  <Button variant="primary" fullWidth>
                    Solicitar nuevo enlace
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="outline" fullWidth>
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-accent-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">TC</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-100">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-primary-400">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password field */}
            <Input
              label="Nueva contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              placeholder="••••••••"
              helperText="Mínimo 6 caracteres"
              required
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {/* Confirm password field */}
            <Input
              label="Confirmar contraseña"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              placeholder="••••••••"
              required
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            {/* Password strength indicators */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary-300">
                Tu contraseña debe contener:
              </p>
              <ul className="text-sm space-y-1">
                <li className={`flex items-center ${formData.password.length >= 6 ? 'text-success-500' : 'text-primary-400'}`}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={formData.password.length >= 6 ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                  Al menos 6 caracteres
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-success-500' : 'text-primary-400'}`}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={/[A-Z]/.test(formData.password) ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                  Una letra mayúscula (recomendado)
                </li>
                <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-success-500' : 'text-primary-400'}`}>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={/[0-9]/.test(formData.password) ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                  </svg>
                  Un número (recomendado)
                </li>
              </ul>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              size="lg"
            >
              Restablecer Contraseña
            </Button>

            {/* Back to login link */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-accent-400 hover:text-accent-300 transition-colors font-medium"
              >
                ← Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;