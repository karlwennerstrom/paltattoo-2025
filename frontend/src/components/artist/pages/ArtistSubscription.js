import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiCheck, FiStar, FiTrendingUp, FiGift, FiArrowUp, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../../common/Layout';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { subscriptionsAPI, paymentService } from '../../../services/api';
import toast from 'react-hot-toast';
import MercadoPagoCheckout from '../../payments/MercadoPagoCheckout';

const ArtistSubscription = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  useEffect(() => {
    loadSubscriptionData();
  }, []);
  
  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subscriptionRes, plansRes] = await Promise.all([
        subscriptionsAPI.getMySubscription(),
        subscriptionsAPI.getPlans()
      ]);
      
      if (subscriptionRes.data) {
        setCurrentSubscription(subscriptionRes.data);
      }
      
      if (plansRes.data) {
        setPlans(plansRes.data);
      } else {
        setPlans(defaultPlans);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setPlans(defaultPlans);
    } finally {
      setLoading(false);
    }
  };
  
  const defaultPlans = [
    {
      id: 1,
      plan_type: 'basic',
      name: 'Básico',
      price: 9990,
      currency: 'CLP',
      period: 'mes',
      description: 'Perfecto para tatuadores que están comenzando',
      features: [
        'Hasta 10 imágenes en portafolio',
        'Hasta 5 solicitudes activas',
        'Perfil básico',
        'Soporte por email'
      ],
      limitations: [
        'Sin badge verificado',
        'Sin herramientas promocionales'
      ],
      color: 'blue'
    },
    {
      id: 2,
      plan_type: 'premium',
      name: 'Premium',
      price: 19990,
      currency: 'CLP',
      period: 'mes',
      description: 'Para tatuadores establecidos que buscan crecer',
      features: [
        'Hasta 50 imágenes en portafolio',
        'Solicitudes ilimitadas',
        'Perfil destacado',
        'Soporte prioritario',
        'Estadísticas avanzadas'
      ],
      limitations: [],
      popular: true,
      color: 'green'
    },
    {
      id: 3,
      plan_type: 'pro',
      name: 'Profesional',
      price: 39990,
      currency: 'CLP',
      period: 'mes',
      description: 'Para estudios y tatuadores de alto volumen',
      features: [
        'Imágenes ilimitadas en portafolio',
        'Solicitudes ilimitadas',
        'Perfil premium destacado',
        'Soporte telefónico 24/7',
        'Analíticas completas',
        'Gestión de múltiples artistas',
        'API de integración'
      ],
      limitations: [],
      color: 'purple'
    }
  ];
  
  const formatCurrency = (amount, currency = 'CLP') => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-600', text: 'Activa' },
      cancelled: { color: 'bg-red-600', text: 'Cancelada' },
      past_due: { color: 'bg-yellow-600', text: 'Vencida' },
      paused: { color: 'bg-gray-600', text: 'Pausada' }
    };
    return badges[status] || badges.active;
  };
  
  const handlePlanChange = async (planId) => {
    try {
      await subscriptionsAPI.subscribe(planId);
      toast.success('Plan cambiado exitosamente');
      setShowPlanChange(false);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Error al cambiar de plan');
    }
  };
  
  const handleCancelSubscription = async () => {
    try {
      await subscriptionsAPI.cancelSubscription();
      toast.success('Suscripción cancelada exitosamente');
      setShowCancelModal(false);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Error al cancelar la suscripción');
    }
  };
  
  const getCurrentPlan = () => {
    if (!currentSubscription) return null;
    return plans.find(plan => plan.id === currentSubscription.plan_id) || 
           defaultPlans.find(plan => plan.id === currentSubscription.plan_id);
  };
  
  const currentPlan = getCurrentPlan();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-100">Suscripción y Pagos</h2>
        <p className="text-primary-400 mt-1">Gestiona tu plan de suscripción y métodos de pago</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
        </div>
      ) : (
        <>
          {/* Current Subscription */}
          {currentSubscription && currentPlan ? (
            <Card title="Suscripción Actual">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-primary-100">{currentPlan.name}</h3>
                    <span className={twMerge(
                      'px-3 py-1 text-sm rounded-full text-white',
                      getStatusBadge(currentSubscription.status).color
                    )}>
                      {getStatusBadge(currentSubscription.status).text}
                    </span>
                    {currentPlan.popular && (
                      <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded-full">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-accent-400 mb-1">
                    {formatCurrency(currentPlan.price)}/mes
                  </p>
                  <p className="text-sm text-primary-400">
                    Próximo pago: {new Date(currentSubscription.next_billing_date || Date.now()).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowPlanChange(true)}>
                    <FiArrowUp className="h-4 w-4 mr-1" />
                    Cambiar Plan
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowCancelModal(true)}
                    className="text-error-400 hover:text-error-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-primary-200 mb-3">Funciones incluidas</h4>
                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-primary-300">
                        <FiCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-primary-200 mb-3">Información de facturación</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-400">Inicio de suscripción:</span>
                      <span className="text-primary-200">{new Date(currentSubscription.created_at || Date.now()).toLocaleDateString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-400">Próximo cargo:</span>
                      <span className="text-primary-200">{formatCurrency(currentPlan.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-400">Método de pago:</span>
                      <span className="text-primary-200">MercadoPago</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Sin Suscripción Activa">
              <div className="text-center py-8">
                <FiCreditCard className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary-200 mb-2">No tienes una suscripción activa</h3>
                <p className="text-primary-400 mb-6">Selecciona un plan para comenzar a usar todas las funciones</p>
                <Button variant="primary" onClick={() => setShowPlanChange(true)}>
                  <FiStar className="h-4 w-4 mr-2" />
                  Seleccionar Plan
                </Button>
              </div>
            </Card>
          )}
          
          {/* Quick Stats */}
          <Grid cols={3} gap={6}>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-400">Propuestas este mes</p>
                  <p className="text-2xl font-bold text-primary-100">12</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiTrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-400">Ingresos este mes</p>
                  <p className="text-2xl font-bold text-primary-100">{formatCurrency(450000)}</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <FiDollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-400">Citas completadas</p>
                  <p className="text-2xl font-bold text-primary-100">8</p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <FiCalendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </Grid>
          
          {/* Benefits Section */}
          <Card title="Beneficios de ser Premium">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiStar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-100">Badge Verificado</h4>
                    <p className="text-sm text-primary-400">Aumenta tu credibilidad con el badge de verificación</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiTrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-100">Promociones Especiales</h4>
                    <p className="text-sm text-primary-400">Aparece destacado en las búsquedas</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiGift className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-100">Menor Comisión</h4>
                    <p className="text-sm text-primary-400">Paga menos comisiones por cada transacción</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-100">Soporte Prioritario</h4>
                    <p className="text-sm text-primary-400">Recibe ayuda más rápida cuando la necesites</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
      
      {/* Plan Change Modal */}
      <Modal
        isOpen={showPlanChange}
        onClose={() => setShowPlanChange(false)}
        title="Cambiar Plan"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-primary-400">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
          
          <div className="space-y-4">
            {plans.map((plan) => {
              const isCurrentPlan = currentSubscription && plan.id === currentSubscription.plan_id;
              return (
                <div
                  key={plan.id}
                  className={twMerge(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    isCurrentPlan 
                      ? 'border-accent-500 bg-accent-600 bg-opacity-10'
                      : selectedPlan?.id === plan.id
                      ? 'border-accent-500 bg-primary-700'
                      : 'border-primary-600 bg-primary-800 hover:border-primary-500'
                  )}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-primary-100">{plan.name}</h4>
                        {plan.popular && (
                          <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded-full">
                            Recomendado
                          </span>
                        )}
                        {isCurrentPlan && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                            Plan Actual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-primary-400">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent-400">{formatCurrency(plan.price)}</p>
                      <p className="text-sm text-primary-400">por mes</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setShowPlanChange(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (selectedPlan && (!currentSubscription || selectedPlan.id !== currentSubscription.plan_id)) {
                  setShowPlanChange(false);
                  setShowCheckout(true);
                }
              }}
              disabled={!selectedPlan || (currentSubscription && selectedPlan?.id === currentSubscription.plan_id)}
            >
              {currentSubscription ? 'Cambiar Plan' : 'Suscribirse'}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Cancel Subscription Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Suscripción"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-primary-300">
            ¿Estás seguro de que quieres cancelar tu suscripción? Perderás el acceso a todas las funciones premium.
          </p>
          
          <div className="bg-primary-800 p-4 rounded-lg">
            <h4 className="font-medium text-primary-100 mb-2">Lo que perderás:</h4>
            <ul className="space-y-1 text-sm text-primary-400">
              <li>• Badge verificado</li>
              <li>• Propuestas ilimitadas</li>
              <li>• Herramientas promocionales</li>
              <li>• Soporte prioritario</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
              Mantener Suscripción
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancelar Suscripción
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* MercadoPago Checkout Modal */}
      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title={`Suscribirse al Plan ${selectedPlan?.name}`}
        size="md"
      >
        {selectedPlan && (
          <MercadoPagoCheckout
            planId={selectedPlan.id}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            onSuccess={async () => {
              setShowCheckout(false);
              await loadSubscriptionData();
              toast.success('¡Suscripción activada exitosamente!');
            }}
            onCancel={() => setShowCheckout(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ArtistSubscription;