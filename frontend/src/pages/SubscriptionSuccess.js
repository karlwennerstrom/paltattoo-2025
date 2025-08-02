import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import Button from '../components/common/Button';
import { Card } from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    const refreshUserSubscription = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsRefreshing(true);
        console.log('Refreshing user data after successful payment...');
        
        // Polling mechanism to check subscription activation
        let attempts = 0;
        const maxAttempts = 10; // Maximum 10 attempts (20 seconds)
        const pollInterval = 2000; // 2 seconds between attempts
        
        const pollForSubscription = async () => {
          attempts++;
          console.log(`Polling attempt ${attempts}/${maxAttempts} for subscription activation...`);
          
          try {
            const updatedUser = await refreshUserData();
            
            // Check if we have subscription data or if user data includes subscription info
            const hasActiveSubscription = updatedUser?.subscription?.status === 'authorized' || 
                                        updatedUser?.subscription?.planName ||
                                        updatedUser?.plan_name || 
                                        updatedUser?.currentPlan;
            
            if (hasActiveSubscription) {
              console.log('Subscription found in user data:', hasActiveSubscription);
              toast.success('¡Tu suscripción ha sido activada!');
              return true; // Subscription found and activated
            }
            
            // If no subscription found and we haven't reached max attempts, try again
            if (attempts < maxAttempts) {
              console.log('Subscription not yet active, retrying in 2 seconds...');
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              return await pollForSubscription();
            } else {
              console.log('Max polling attempts reached. Subscription may still be processing.');
              toast.success('¡Pago procesado! Tu suscripción se activará en unos momentos.');
              return false;
            }
            
          } catch (pollError) {
            console.error(`Polling attempt ${attempts} failed:`, pollError);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              return await pollForSubscription();
            }
            throw pollError;
          }
        };
        
        await pollForSubscription();
        
      } catch (error) {
        console.error('Error refreshing user data:', error);
        // Still show success since payment was processed
        toast.success('¡Pago procesado! Tu suscripción se activará en unos momentos.');
      } finally {
        setIsRefreshing(false);
      }
    };
    
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
    
    // Refresh user data if this is a real payment (not development mode)
    if (isDev !== 'true' && isAuthenticated) {
      refreshUserSubscription();
    } else if (isDev === 'true') {
      console.log('Development mode: Subscription already created and activated');
      toast.success('¡Tu suscripción ha sido activada! (Modo desarrollo)');
    }
  }, [searchParams, isAuthenticated, refreshUserData]);

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
          
          {isRefreshing ? (
            <div className="flex flex-col items-center mb-8">
              <FiLoader className="w-8 h-8 text-accent-500 animate-spin mb-4" />
              <p className="text-primary-300">
                Activando tu suscripción...
              </p>
            </div>
          ) : (
            <p className="text-primary-300 mb-8">
              Tu suscripción ha sido activada exitosamente. Ya puedes disfrutar de todos los beneficios de tu plan.
            </p>
          )}
          
          <div className="space-y-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={isRefreshing}
                  onClick={() => navigate('/artist/subscription')}
                >
                  {isRefreshing ? 'Actualizando...' : 'Ver Mi Suscripción'}
                </Button>
                
                <Button
                  variant="ghost"
                  fullWidth
                  disabled={isRefreshing}
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