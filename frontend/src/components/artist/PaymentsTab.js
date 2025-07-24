import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import PlanChangeModal from '../common/PlanChangeModal';
import { paymentService, subscriptionsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPlanName } from '../../utils/subscriptionHelpers';
import toast from 'react-hot-toast';
import { FiDownload, FiCalendar, FiCreditCard, FiCheck, FiX, FiClock, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const PaymentsTab = () => {
  const { user } = useAuth();
  const userPlanName = getUserPlanName(user);
  
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cardholderName: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    rut: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  
  // Plan change modal states
  const [planChangeModal, setPlanChangeModal] = useState({
    isOpen: false,
    targetPlan: null,
    loading: false
  });

  useEffect(() => {
    loadSubscriptionData();
    loadUserBillingInfo();
  }, [user]); // Add user as dependency

  const loadUserBillingInfo = async () => {
    try {
      // Load user profile info for billing
      if (user) {
        setBillingInfo({
          fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Nombre Usuario',
          email: user.email || '',
          rut: user.rut || '',
          address: user.address || '',
          city: user.city || user.comuna || '',
          postalCode: user.postal_code || ''
        });
      }
    } catch (error) {
      console.error('Error loading user billing info:', error);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load current subscription
      const [subscriptionRes, plansRes, historyRes, subHistoryRes] = await Promise.all([
        paymentService.getMySubscription().catch(() => subscriptionsAPI.getMySubscription()),
        subscriptionsAPI.getPlans(),
        paymentService.getPaymentHistoryByUser().catch(() => ({ data: [] })),
        paymentService.getSubscriptionHistory().catch(() => ({ data: [] }))
      ]);
      
      if (subscriptionRes.data) {
        // Handle nested data structure from API
        const subscriptionData = subscriptionRes.data.data || subscriptionRes.data;
        
        // Ensure features is an array
        const processedSubscription = {
          ...subscriptionData,
          features: Array.isArray(subscriptionData.features) 
            ? subscriptionData.features 
            : defaultSubscription.features
        };
        
        setCurrentSubscription(processedSubscription);
      } else {
        // If no subscription data, use default based on user context
        setCurrentSubscription({
          ...defaultSubscription,
          plan_name: userPlanName.toLowerCase()
        });
      }
      
      if (plansRes.data) {
        const apiPlans = plansRes.data.data || plansRes.data;
        
        // Always include basic plan if not present
        const hasBasicPlan = apiPlans.some(plan => 
          plan.id === 'basic' || 
          plan.plan_type === 'basic' || 
          plan.name?.toLowerCase().includes('básico')
        );
        
        if (!hasBasicPlan) {
          setPlans([defaultPlans[0], ...apiPlans]); // Add basic plan from defaultPlans
        } else {
          setPlans(apiPlans);
        }
      } else {
        setPlans(defaultPlans);
      }
      
      if (historyRes.data && Array.isArray(historyRes.data)) {
        setPaymentHistory(historyRes.data);
      } else {
        setPaymentHistory([]);
      }

      if (subHistoryRes.data && Array.isArray(subHistoryRes.data)) {
        setSubscriptionHistory(subHistoryRes.data);
      } else {
        setSubscriptionHistory([]);
      }
      
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Use default data if API fails, but adapt to user's actual plan
      const fallbackSubscription = {
        ...defaultSubscription,
        plan_name: userPlanName.toLowerCase(),
        features: Array.isArray(defaultSubscription.features) 
          ? defaultSubscription.features 
          : []
      };
      
      setCurrentSubscription(fallbackSubscription);
      setPlans(Array.isArray(defaultPlans) ? defaultPlans : []);
      setPaymentHistory(Array.isArray(defaultPaymentHistory) ? defaultPaymentHistory : []);
      setSubscriptionHistory(Array.isArray(defaultSubscriptionHistory) ? defaultSubscriptionHistory : []);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  // Default data for when API is not available
  const defaultSubscription = {
    plan_id: 'basic',
    plan: 'Básico',
    plan_name: 'basico',
    status: 'active',
    price: 0,
    amount: 0,
    currency: 'CLP',
    nextBilling: null,
    startDate: '2024-01-20',
    features: [
      'Perfil básico',
      'Galería de hasta 10 imágenes',
      'Hasta 5 propuestas por mes',
      'Soporte por email'
    ]
  };

  const defaultPaymentMethods = [
    {
      id: 1,
      type: 'credit_card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      cardholderName: 'Carlos Mendoza'
    },
    {
      id: 2,
      type: 'credit_card',
      brand: 'Mastercard',
      last4: '8888',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
      cardholderName: 'Carlos Mendoza'
    }
  ];

  const defaultPaymentHistory = [
    {
      id: 1,
      date: '2024-01-20',
      amount: 29990,
      currency: 'CLP',
      description: 'Suscripción Premium - Enero 2024',
      status: 'paid',
      method: 'Visa •••• 4242',
      invoiceUrl: '#'
    },
    {
      id: 2,
      date: '2023-12-20',
      amount: 29990,
      currency: 'CLP',
      description: 'Suscripción Premium - Diciembre 2023',
      status: 'paid',
      method: 'Visa •••• 4242',
      invoiceUrl: '#'
    },
    {
      id: 3,
      date: '2023-11-20',
      amount: 29990,
      currency: 'CLP',
      description: 'Suscripción Premium - Noviembre 2023',
      status: 'paid',
      method: 'Visa •••• 4242',
      invoiceUrl: '#'
    },
    {
      id: 4,
      date: '2023-10-20',
      amount: 19990,
      currency: 'CLP',
      description: 'Suscripción Básica - Octubre 2023',
      status: 'paid',
      method: 'Mastercard •••• 8888',
      invoiceUrl: '#'
    }
  ];

  const defaultSubscriptionHistory = [
    {
      id: 1,
      date: '2024-01-20',
      fromPlan: 'Básico',
      toPlan: 'Premium',
      action: 'upgrade',
      reason: 'Actualización manual'
    },
    {
      id: 2,
      date: '2023-10-15',
      fromPlan: 'Gratuito',
      toPlan: 'Básico',
      action: 'subscribe',
      reason: 'Primera suscripción'
    }
  ];

  const defaultPlans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 0,
      currency: 'CLP',
      period: 'mes',
      features: [
        'Perfil básico',
        'Galería de hasta 10 imágenes',
        'Hasta 5 propuestas por mes',
        'Soporte por email'
      ],
      limitations: [
        'Sin acceso a calendario',
        'Sin estadísticas',
        'Sin badge verificado'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 3990,
      currency: 'CLP',
      period: 'mes',
      features: [
        'Propuestas ilimitadas',
        'Perfil destacado',
        'Galería ilimitada',
        'Calendario de citas completo',
        'Estadísticas básicas',
        'Soporte prioritario',
        'Badge Premium'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 7990,
      currency: 'CLP',
      period: 'mes',
      features: [
        'Todo lo incluido en Premium',
        'Múltiples calendarios',
        'Estadísticas avanzadas',
        'Integración con redes sociales',
        'API access',
        'Soporte dedicado 24/7',
        'Badge Pro',
        'Promoción destacada en búsquedas'
      ]
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

  const getPaymentStatusBadge = (status) => {
    const badges = {
      paid: { color: 'bg-green-600', text: 'Pagado' },
      pending: { color: 'bg-yellow-600', text: 'Pendiente' },
      failed: { color: 'bg-red-600', text: 'Fallido' },
      refunded: { color: 'bg-gray-600', text: 'Reembolsado' }
    };
    return badges[status] || badges.pending;
  };

  const getCardIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
            MC
          </div>
        );
      default:
        return (
          <div className="w-8 h-5 bg-gray-600 rounded text-white text-xs flex items-center justify-center">
            •••
          </div>
        );
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const response = await paymentService.downloadInvoice(paymentId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Factura descargada exitosamente');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Error al descargar la factura');
    }
  };

  const handleAddPaymentMethod = async () => {
    // Validate form
    if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryDate || !newPaymentMethod.cardholderName) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsAddingPaymentMethod(false);
    setNewPaymentMethod({
      type: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cardholderName: '',
      cvv: ''
    });
  };

  const handleSetDefaultPaymentMethod = (methodId) => {
    // Simulate API call
  };

  const handleRemovePaymentMethod = (methodId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
    }
  };

  const handlePlanChange = (planId) => {
    const targetPlan = plans.find(p => p.id === planId) || defaultPlans.find(p => p.id === planId);
    if (!targetPlan) {
      toast.error('Plan no encontrado');
      return;
    }

    setPlanChangeModal({
      isOpen: true,
      targetPlan,
      loading: false
    });
  };

  const handlePlanChangeConfirm = async () => {
    const { targetPlan } = planChangeModal;
    
    setPlanChangeModal(prev => ({ ...prev, loading: true }));
    
    try {
      // For plan changes (not new subscriptions), we need different API call
      let response;
      if (currentSubscription && currentSubscription.id) {
        // Change existing subscription
        response = await subscriptionsAPI.changePlan(currentSubscription.id, targetPlan.id);
      } else {
        // New subscription
        response = await subscriptionsAPI.subscribe(targetPlan.id);
      }
      
      // Send confirmation email for subscription change
      try {
        await paymentService.sendSubscriptionChangeEmail({
          oldPlan: currentSubscription?.plan_name || currentSubscription?.plan || 'Básico',
          newPlan: targetPlan?.name,
          effectiveDate: new Date().toISOString()
        });
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // Don't block the subscription change if email fails
      }

      toast.success('Plan actualizado exitosamente. Se ha enviado un correo de confirmación.');
      await loadSubscriptionData();
      
      // Add to subscription history
      const historyEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        fromPlan: currentSubscription?.plan_name || currentSubscription?.plan || 'Básico',
        toPlan: targetPlan?.name,
        action: targetPlan.price > (currentSubscription?.price || 0) ? 'upgrade' : 'downgrade',
        reason: 'Cambio manual del usuario'
      };
      setSubscriptionHistory(prev => [historyEntry, ...prev]);
      
      // Close modal
      setPlanChangeModal({
        isOpen: false,
        targetPlan: null,
        loading: false
      });
      
    } catch (error) {
      console.error('Error changing subscription:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar el plan';
      toast.error(errorMessage);
      
      setPlanChangeModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePlanChangeCancel = () => {
    setPlanChangeModal({
      isOpen: false,
      targetPlan: null,
      loading: false
    });
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar tu suscripción? Perderás el acceso a todas las funciones premium.')) {
      try {
        await subscriptionsAPI.cancelSubscription();
        toast.success('Suscripción cancelada exitosamente');
        await loadSubscriptionData();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        toast.error('Error al cancelar la suscripción');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Suscripción y Pagos</h1>
          <p className="text-primary-400">Gestiona tu suscripción y métodos de pago</p>
        </div>
      </div>

      {/* Current Subscription */}
      <Card title="Suscripción Actual">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
          </div>
        ) : currentSubscription ? (
          <>
            <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-semibold text-primary-100">{currentSubscription.plan_name || currentSubscription.plan || 'Plan Actual'}</h3>
              <span className={twMerge(
                'px-3 py-1 text-sm rounded-full text-white',
                getStatusBadge(currentSubscription.status).color
              )}>
                {getStatusBadge(currentSubscription.status).text}
              </span>
            </div>
            <p className="text-2xl font-bold text-accent-400 mb-1">
              {(currentSubscription.price || currentSubscription.amount || 0) === 0 
                ? 'Plan Básico (gratis)' 
                : `${formatCurrency(currentSubscription.price || currentSubscription.amount || 0)}/mes`
              }
            </p>
            <p className="text-sm text-primary-400">
              {(currentSubscription.price || currentSubscription.amount || 0) === 0 
                ? 'Plan gratuito - Sin cargos automáticos' 
                : `Próximo pago: ${new Date(currentSubscription.next_billing_date || currentSubscription.nextBilling || Date.now()).toLocaleDateString('es-CL')}`
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              Cambiar Plan
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelSubscription} className="text-error-400 hover:text-error-300">
              Cancelar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-primary-200 mb-2">Funciones incluidas</h4>
            <ul className="space-y-1">
              {(() => {
                // Ensure features is always an array
                const features = currentSubscription?.features || defaultSubscription.features || [];
                const featuresArray = Array.isArray(features) ? features : [];
                
                
                return featuresArray.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-primary-300">
                    <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ));
              })()}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary-200 mb-2">Información de facturación</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-400">Inicio de suscripción:</span>
                <span className="text-primary-200">{new Date(currentSubscription.created_at || currentSubscription.startDate || Date.now()).toLocaleDateString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-400">Método de pago:</span>
                <span className="text-primary-200">
                  {(currentSubscription.price || currentSubscription.amount || 0) === 0 
                    ? 'No requerido' 
                    : 'Visa •••• 4242'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-400">Próximo cargo:</span>
                <span className="text-primary-200">
                  {(currentSubscription.price || currentSubscription.amount || 0) === 0 
                    ? 'Gratis' 
                    : formatCurrency(currentSubscription.price || currentSubscription.amount || 0)
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="text-center py-8">
            <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-primary-400 mb-4">No tienes una suscripción activa</p>
            <Button variant="primary">Seleccionar un Plan</Button>
          </div>
        )}
      </Card>

      {/* Available Plans */}
      <Card title="Planes Disponibles">
        <Grid cols={3} gap={6}>
          {(Array.isArray(plans) && plans.length > 0 ? plans : defaultPlans).map((plan) => {
            // Debug current subscription structure
            
            // Robust plan detection using multiple sources
            let isCurrentPlan = false;
            
            // First try to use user context plan info (most reliable)
            const contextPlanName = userPlanName.toLowerCase();
            
            // Strict plan matching - prioritize exact matches
            if (plan.id === contextPlanName) {
              isCurrentPlan = true;
            }
            else if (plan.name?.toLowerCase() === contextPlanName) {
              isCurrentPlan = true;
            }
            // Special handling for basic plan (free)
            else if (contextPlanName === 'basic' && 
                     (plan.id === 'basic' || 
                      plan.name?.toLowerCase() === 'básico' ||
                      (plan.price === 0 && plan.name?.toLowerCase().includes('básico')))) {
              isCurrentPlan = true;
            }
            else {
              // Fallback to subscription data
              if (currentSubscription) {
                const currentPlanId = currentSubscription.plan_id;
                const currentPlanName = (currentSubscription.plan_name || currentSubscription.plan || '').toLowerCase();
                const currentPrice = currentSubscription.price || currentSubscription.amount || 0;
                
                
                // Check by direct ID match first
                if (plan.id === currentPlanId) {
                  isCurrentPlan = true;
                }
                // Check by plan name
                else if (plan.name?.toLowerCase() === currentPlanName) {
                  isCurrentPlan = true;
                }
                // Special case: Basic/Free plan (price = 0)
                else if ((plan.id === 'basic' || plan.name?.toLowerCase() === 'básico') && 
                         (currentPrice === 0 && (currentPlanName === 'basico' || currentPlanName === 'básico' || currentPlanName === ''))) {
                  isCurrentPlan = true;
                }
              }
            }
            
            return (
              <div
                key={plan.id}
                className={twMerge(
                  'relative p-6 rounded-lg border-2 transition-all',
                  isCurrentPlan 
                    ? 'border-accent-500 bg-accent-600 bg-opacity-10'
                    : 'border-primary-600 bg-primary-800 hover:border-primary-500',
                  plan.popular && 'ring-2 ring-accent-500'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-accent-600 text-white text-xs font-medium rounded-full">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-primary-100 mb-2">{plan.name}</h3>
                  <div className="text-2xl font-bold text-primary-100 mb-1">
                    {plan.price === 0 ? 'Gratis' : formatCurrency(plan.price)}
                  </div>
                  {plan.price > 0 && (
                    <p className="text-sm text-primary-400">por {plan.period}</p>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <svg className="h-4 w-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-primary-300">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, index) => (
                    <li key={`limitation-${index}`} className="flex items-center space-x-2 text-sm">
                      <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-primary-500">{limitation}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrentPlan && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handlePlanChange(plan.id)}
                  >
                    Cambiar a este Plan
                  </Button>
                )}
                {isCurrentPlan && (
                  <div className="w-full text-center">
                    <span className="inline-flex items-center px-4 py-2 rounded-md bg-accent-600 text-white text-sm font-medium">
                      Plan Actual
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </Grid>
      </Card>

      <Grid cols={2} gap={6}>
        {/* Payment Methods */}
        <Card title="Métodos de Pago">
          <div className="space-y-4">
            {(Array.isArray(paymentMethods) && paymentMethods.length > 0 ? paymentMethods : defaultPaymentMethods).map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getCardIcon(method.brand)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-primary-100">
                        {method.brand} •••• {method.last4}
                      </span>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-primary-400">
                      Vence {method.expiryMonth}/{method.expiryYear} • {method.cardholderName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefaultPaymentMethod(method.id)}
                    >
                      Hacer Principal
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    className="text-error-400 hover:text-error-300"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setIsAddingPaymentMethod(true)}
              className="border-2 border-dashed border-primary-600 hover:border-primary-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Método de Pago
            </Button>
          </div>
        </Card>

        {/* Billing Information */}
        <Card title="Información de Facturación">
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              value={billingInfo.fullName}
              onChange={(e) => setBillingInfo({...billingInfo, fullName: e.target.value})}
              disabled={!isEditingBilling}
            />
            <Input
              label="Email de facturación"
              value={billingInfo.email}
              onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
              disabled={!isEditingBilling}
            />
            <Input
              label="RUT"
              value={billingInfo.rut}
              onChange={(e) => setBillingInfo({...billingInfo, rut: e.target.value})}
              placeholder="12.345.678-9"
              disabled={!isEditingBilling}
            />
            <Input
              label="Dirección"
              value={billingInfo.address}
              onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
              placeholder="Dirección de facturación"
              disabled={!isEditingBilling}
            />
            <Grid cols={2} gap={4}>
              <Input
                label="Ciudad"
                value={billingInfo.city}
                onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                placeholder="Ciudad"
                disabled={!isEditingBilling}
              />
              <Input
                label="Código Postal"
                value={billingInfo.postalCode}
                onChange={(e) => setBillingInfo({...billingInfo, postalCode: e.target.value})}
                placeholder="Código postal"
                disabled={!isEditingBilling}
              />
            </Grid>
            
            <div className="flex space-x-3">
              {!isEditingBilling ? (
                <Button variant="secondary" fullWidth onClick={() => setIsEditingBilling(true)}>
                  Editar Información
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    fullWidth 
                    onClick={() => {
                      setIsEditingBilling(false);
                      loadUserBillingInfo(); // Reset to original values
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={() => {
                      setIsEditingBilling(false);
                      // TODO: Save billing info to backend
                      toast.success('Información de facturación actualizada');
                    }}
                  >
                    Guardar Cambios
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </Grid>

      {/* Payment History */}
      <Card title="Historial de Pagos">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-700">
                <th className="text-left py-3 text-sm font-medium text-primary-300">Fecha</th>
                <th className="text-left py-3 text-sm font-medium text-primary-300">Descripción</th>
                <th className="text-left py-3 text-sm font-medium text-primary-300">Método</th>
                <th className="text-left py-3 text-sm font-medium text-primary-300">Estado</th>
                <th className="text-right py-3 text-sm font-medium text-primary-300">Monto</th>
                <th className="text-right py-3 text-sm font-medium text-primary-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(paymentHistory) && paymentHistory.length > 0 ? paymentHistory : defaultPaymentHistory).map((payment) => {
                const statusBadge = getPaymentStatusBadge(payment.status || 'paid');
                return (
                  <tr key={payment.id} className="border-b border-primary-800">
                    <td className="py-3 text-sm text-primary-300">
                      {new Date(payment.date).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 text-sm text-primary-200">
                      {payment.description}
                    </td>
                    <td className="py-3 text-sm text-primary-300">
                      {payment.method}
                    </td>
                    <td className="py-3">
                      <span className={twMerge(
                        'px-2 py-1 text-xs rounded text-white',
                        statusBadge.color
                      )}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-primary-200 text-right font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(payment.id)}
                      >
                        <FiDownload className="h-4 w-4 mr-1" />
                        Descargar PDF
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Subscription History */}
      <Card title="Historial de Cambios de Suscripción">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-700">
                <th className="text-left py-3 text-sm font-semibold text-primary-200">Fecha</th>
                <th className="text-left py-3 text-sm font-semibold text-primary-200">Cambio</th>
                <th className="text-left py-3 text-sm font-semibold text-primary-200">Razón</th>
                <th className="text-left py-3 text-sm font-semibold text-primary-200">Estado</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(subscriptionHistory) && subscriptionHistory.map((change, index) => {
                return (
                  <tr key={change.id || index} className="border-b border-primary-800">
                    <td className="py-3 text-sm text-primary-300">
                      {new Date(change.date).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 text-sm text-primary-200">
                      <div className="flex items-center space-x-2">
                        {change.action === 'upgrade' && <FiTrendingUp className="w-4 h-4 text-green-400" />}
                        {change.action === 'downgrade' && <FiTrendingDown className="w-4 h-4 text-orange-400" />}
                        {change.action === 'subscribe' && <FiCheck className="w-4 h-4 text-blue-400" />}
                        {change.action === 'cancel' && <FiX className="w-4 h-4 text-red-400" />}
                        <span>
                          {change.fromPlan} → {change.toPlan}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-primary-300">{change.reason}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completado
                      </span>
                    </td>
                  </tr>
                );
              })}
              {subscriptionHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-primary-400">
                    No hay cambios de suscripción registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={isAddingPaymentMethod}
        onClose={() => setIsAddingPaymentMethod(false)}
        title="Agregar Método de Pago"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Número de tarjeta"
            value={newPaymentMethod.cardNumber}
            onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
          
          <Grid cols={2} gap={4}>
            <Input
              label="Fecha de vencimiento"
              value={newPaymentMethod.expiryDate}
              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryDate: e.target.value }))}
              placeholder="MM/AA"
              maxLength={5}
            />
            <Input
              label="CVV"
              value={newPaymentMethod.cvv}
              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
              placeholder="123"
              maxLength={4}
            />
          </Grid>

          <Input
            label="Nombre del titular"
            value={newPaymentMethod.cardholderName}
            onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
            placeholder="Nombre como aparece en la tarjeta"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsAddingPaymentMethod(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddPaymentMethod}>
              Agregar Tarjeta
            </Button>
          </div>
        </div>
      </Modal>

      {/* Plan Change Modal */}
      <PlanChangeModal
        isOpen={planChangeModal.isOpen}
        onClose={handlePlanChangeCancel}
        currentPlan={currentSubscription ? {
          id: currentSubscription.id,
          name: currentSubscription.plan_name || currentSubscription.plan || 'basic',
          price: currentSubscription.price || 0,
          features: currentSubscription.features || {}
        } : { id: 'basic', name: 'basic', price: 0, features: {} }}
        targetPlan={planChangeModal.targetPlan}
        onConfirm={handlePlanChangeConfirm}
        loading={planChangeModal.loading}
      />
    </div>
  );
};

export default PaymentsTab;