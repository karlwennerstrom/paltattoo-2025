import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/common/Layout';
import { Button } from '../../components/common';
import { subscriptionsAPI } from '../../services/api';

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch available plans
      const plansData = await subscriptionsAPI.getPlans();
      setPlans(plansData.plans || []);
      
      // Try to fetch current subscription status (requires auth)
      try {
        const statusData = await subscriptionsAPI.getStatus();
        setCurrentSubscription(statusData.subscription);
      } catch (statusError) {
        // User might not be authenticated, that's ok for now
        console.log('No current subscription or not authenticated');
      }
      
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
      console.error('Subscription page error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    try {
      console.log('Plan selected:', planId);
      // TODO: Implement subscription creation
      alert('Funcionalidad de suscripción en desarrollo');
    } catch (err) {
      console.error('Error selecting plan:', err);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Suscripción y Pagos" subtitle="Cargando..." maxWidth="full">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Suscripción y Pagos" subtitle="Error al cargar" maxWidth="full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchData} className="mt-2">
            Reintentar
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Suscripción y Pagos"
      subtitle="Gestiona tu plan y métodos de pago"
      maxWidth="full"
    >
      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Suscripción Actual</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{currentSubscription.name}</p>
              <p className="text-sm text-gray-600">{currentSubscription.description}</p>
              <p className="text-sm text-gray-500">
                Estado: <span className="font-medium">{currentSubscription.status}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">
                {currentSubscription.formattedPrice}
              </p>
              <p className="text-sm text-gray-500">mensual</p>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg p-6 border-2 ${
              plan.plan_type === 'premium' 
                ? 'border-primary-500 relative' 
                : 'border-gray-200'
            }`}
          >
            {plan.plan_type === 'premium' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Recomendado
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.formattedPrice}</span>
                <span className="text-gray-600 ml-2">/mes</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              variant={plan.plan_type === 'premium' ? 'primary' : 'outline'}
              size="lg"
              fullWidth
              onClick={() => handleSelectPlan(plan.id)}
              disabled={currentSubscription?.plan_id === plan.id}
            >
              {currentSubscription?.plan_id === plan.id 
                ? 'Plan Actual' 
                : `Seleccionar ${plan.name}`
              }
            </Button>
          </div>
        ))}
      </div>

      {/* Connection Status */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800 font-medium">
            Conectado al backend - {plans.length} planes disponibles
          </span>
        </div>
      </div>
    </PageContainer>
  );
};

export default SubscriptionPage;