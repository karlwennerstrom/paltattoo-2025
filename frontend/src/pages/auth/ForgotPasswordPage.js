import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useApp } from '../../context';
import { Button, Input, Card } from '../../components/common';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const { showSuccess, showError } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email) {
      return 'El email es requerido';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'El email no es válido';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail();
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      showSuccess('Te hemos enviado un email con instrucciones para restablecer tu contraseña');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al enviar el email';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-accent-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">TC</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-100">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-primary-400">
            Te enviaremos instrucciones para restablecer tu contraseña
          </p>
        </div>

        {/* Form */}
        <Card className="p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <Input
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                error={error}
                placeholder="tu@email.com"
                required
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                size="lg"
              >
                Enviar Instrucciones
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
          ) : (
            <div className="text-center space-y-4">
              {/* Success icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
                <svg className="h-6 w-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-primary-100">
                Email enviado
              </h3>
              
              <p className="text-primary-400">
                Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
                <span className="font-medium text-primary-200">{email}</span>
              </p>
              
              <p className="text-sm text-primary-400">
                Si no recibes el email en unos minutos, revisa tu carpeta de spam
              </p>
              
              <div className="pt-4">
                <Link
                  to="/login"
                  className="text-accent-400 hover:text-accent-300 transition-colors font-medium"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Help text */}
        <div className="text-center">
          <p className="text-sm text-primary-400">
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:support@tattooconnect.com"
              className="text-accent-400 hover:text-accent-300 transition-colors"
            >
              Contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;