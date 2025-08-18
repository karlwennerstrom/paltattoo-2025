import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiCheck, FiX, FiStar, FiTrendingUp, FiShield, FiUsers, FiDollarSign, FiCalendar } from 'react-icons/fi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import MercadoPagoCheckout from '../components/payments/MercadoPagoCheckout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ArtistPricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Básico',
      price: 0,
      period: '',
      description: 'Plan gratuito para tatuadores que están comenzando',
      popular: false,
      features: [
        'Perfil básico',
        'Galería de hasta 10 imágenes',
        'Hasta 5 propuestas por mes',
        'Soporte por email'
      ],
      limitations: [
        'Sin acceso a calendario',
        'Sin estadísticas',
        'Sin promoción en búsquedas'
      ],
      cta: 'Comenzar Gratis'
    },
    {
      name: 'Premium',
      price: billingCycle === 'monthly' ? 3990 : 39900,
      originalPrice: billingCycle === 'monthly' ? null : 47880,
      period: billingCycle === 'monthly' ? '/mes' : '/año',
      description: 'Plan ideal para tatuadores profesionales',
      popular: true,
      features: [
        'Propuestas ilimitadas',
        'Perfil destacado',
        'Galería ilimitada',
        'Calendario de citas completo',
        'Estadísticas básicas',
        'Soporte prioritario',
        'Badge Premium'
      ],
      limitations: [
        'Sin múltiples calendarios',
        'Sin API access'
      ],
      cta: 'Obtener Premium'
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? 7990 : 79900,
      originalPrice: billingCycle === 'monthly' ? null : 95880,
      period: billingCycle === 'monthly' ? '/mes' : '/año',
      description: 'Plan avanzado para tatuadores establecidos',
      popular: false,
      features: [
        'Todo lo incluido en Premium',
        'Múltiples calendarios',
        'Estadísticas avanzadas',
        'Integración con redes sociales',
        'API access',
        'Soporte dedicado 24/7',
        'Badge Pro',
        'Promoción destacada en búsquedas'
      ],
      limitations: [],
      cta: 'Obtener Pro'
    }
  ];

  const additionalServices = [
    {
      name: 'Verificación Express',
      price: 49990,
      description: 'Acelera tu proceso de verificación a 24 horas',
      icon: FiShield
    },
    {
      name: 'Sesión de Fotos Profesional',
      price: 199990,
      description: 'Fotografía profesional para tu portfolio',
      icon: FiStar
    },
    {
      name: 'Capacitación Digital',
      price: 99990,
      description: 'Curso completo de marketing digital para tatuadores',
      icon: FiTrendingUp
    },
    {
      name: 'Consultoría Personalizada',
      price: 149990,
      description: 'Sesión 1:1 para optimizar tu perfil y estrategia',
      icon: FiUsers
    }
  ];

  const faqs = [
    {
      question: '¿Hay permanencia mínima?',
      answer: 'No, puedes cancelar tu suscripción en cualquier momento. Si cancelas, tu plan seguirá activo hasta el final del período pagado.'
    },
    {
      question: '¿Qué incluye la prueba gratuita?',
      answer: 'La prueba gratuita de 14 días incluye todas las características del plan Profesional sin restricciones ni cargos.'
    },
    {
      question: '¿Cómo funciona la comisión por transacción?',
      answer: 'Cobramos un porcentaje sobre cada pago que recibas a través de la plataforma. Esta comisión cubre los costos de procesamiento de pagos y mantenimiento del sistema.'
    },
    {
      question: '¿Puedo cambiar de plan después?',
      answer: 'Sí, puedes cambiar tu plan en cualquier momento desde tu panel de control. Los cambios se aplicarán en tu próximo ciclo de facturación.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Todos los pagos se procesan de forma segura a través de MercadoPago, aceptando múltiples formas de pago.'
    },
    {
      question: '¿Ofrecen descuentos para estudios?',
      answer: 'Sí, ofrecemos descuentos especiales para estudios con múltiples tatuadores. Contacta a nuestro equipo de ventas para más información.'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Planes y Precios
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Elige el plan que mejor se adapte a tus necesidades y comienza a hacer crecer tu negocio
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-primary-100' : 'text-primary-400'}`}>
                Mensual
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'annual' ? 'bg-accent-600' : 'bg-primary-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'annual' ? 'text-primary-100' : 'text-primary-400'}`}>
                Anual
              </span>
              {billingCycle === 'annual' && (
                <span className="bg-accent-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Ahorra 20%
                </span>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Pricing Cards */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 relative ${
                  plan.popular ? 'ring-2 ring-accent-500 bg-primary-750' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-accent-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary-100 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-primary-400 text-sm mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-4xl font-bold text-accent-500">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-primary-400">
                        {plan.period}
                      </span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-primary-500 line-through text-sm">
                        {formatPrice(plan.originalPrice)}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    size="lg"
                    className="w-full mb-6"
                    onClick={() => {
                      if (plan.name === 'Premium') {
                        window.location.href = '/contact';
                      } else if (user && user.role === 'artist') {
                        setSelectedPlan(plan);
                        setShowCheckout(true);
                      } else {
                        window.location.href = '/join-artist';
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary-100 text-sm uppercase tracking-wide">
                    Incluido:
                  </h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <FiCheck className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-primary-300 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-semibold text-primary-100 text-sm uppercase tracking-wide mt-4">
                        No incluye:
                      </h4>
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <div key={limitationIndex} className="flex items-center">
                          <FiX className="h-4 w-4 text-red-400 mr-3 flex-shrink-0" />
                          <span className="text-primary-400 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Additional Services */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Servicios Adicionales
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Mejora tu experiencia con nuestros servicios premium
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {additionalServices.map((service, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primary-100">
                        {service.name}
                      </h3>
                      <span className="text-accent-500 font-bold">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                    <p className="text-primary-300 text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Comparison Table */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Comparación Detallada
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Encuentra el plan perfecto para tu negocio
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-700">
                  <th className="text-left py-4 px-6 text-primary-100">Características</th>
                  <th className="text-center py-4 px-6 text-primary-100">Básico</th>
                  <th className="text-center py-4 px-6 text-primary-100">Profesional</th>
                  <th className="text-center py-4 px-6 text-primary-100">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Propuestas por mes', basic: '10', pro: 'Ilimitadas', premium: 'Ilimitadas' },
                  { feature: 'Imágenes en galería', basic: '50', pro: 'Ilimitadas', premium: 'Ilimitadas' },
                  { feature: 'Comisión por transacción', basic: '8%', pro: '5%', premium: '3%' },
                  { feature: 'Promoción en búsquedas', basic: '✗', pro: '✓', premium: '✓' },
                  { feature: 'Analytics detallados', basic: '✗', pro: '✓', premium: '✓' },
                  { feature: 'Soporte prioritario', basic: '✗', pro: '✓', premium: '✓' },
                  { feature: 'Verificación premium', basic: '✗', pro: '✗', premium: '✓' },
                  { feature: 'Gestor de cuenta', basic: '✗', pro: '✗', premium: '✓' }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-primary-700">
                    <td className="py-4 px-6 text-primary-300">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-primary-300">{row.basic}</td>
                    <td className="py-4 px-6 text-center text-primary-300">{row.pro}</td>
                    <td className="py-4 px-6 text-center text-primary-300">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Resolvemos tus dudas sobre precios y planes
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-primary-100 mb-3">
                  {faq.question}
                </h3>
                <p className="text-primary-300">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-accent-600 to-accent-700">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-accent-100 mb-8 max-w-2xl mx-auto">
              Prueba PalTattoo gratis por 14 días y descubre cómo puede transformar tu negocio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                href="/join-artist"
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                Probar Gratis 14 Días
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                href="/contact"
                className="border-white text-white hover:bg-white hover:text-accent-600"
              >
                Hablar con Ventas
              </Button>
            </div>
          </div>
        </Container>
      </Section>
      
      {/* MercadoPago Checkout Modal */}
      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title={`Suscribirse al Plan ${selectedPlan?.name}`}
        size="md"
      >
        {selectedPlan && (
          <MercadoPagoCheckout
            planId={selectedPlan.name.toLowerCase()}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            onSuccess={() => {
              setShowCheckout(false);
              navigate('/artist/subscription');
            }}
            onCancel={() => setShowCheckout(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ArtistPricingPage;