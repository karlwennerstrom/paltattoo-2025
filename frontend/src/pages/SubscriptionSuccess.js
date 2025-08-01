import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import Button from '../components/common/Button';
import { Card } from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    // Log success parameters for debugging
    const collectionId = searchParams.get('collection_id');
    const collectionStatus = searchParams.get('collection_status');
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');
    const paymentType = searchParams.get('payment_type');
    const isDev = searchParams.get('dev');
    const subscriptionId = searchParams.get('subscription_id');
    
    console.log('Payment success params:', {
      collectionId,
      collectionStatus,
      paymentId,
      status,
      externalReference,
      paymentType,
      isDev,
      subscriptionId
    });
    
    // In development mode, we already have the subscription created
    if (isDev === 'true') {
      console.log('Development mode: Subscription already created and activated');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-primary-100 mb-4">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-primary-300 mb-8">
            Tu suscripción ha sido activada exitosamente. Ya puedes disfrutar de todos los beneficios de tu plan.
          </p>
          
          <div className="space-y-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/artist/subscription')}
                >
                  Ver Mi Suscripción
                </Button>
                
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => navigate('/artist')}
                >
                  Ir al Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
                
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  Volver al Inicio
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;