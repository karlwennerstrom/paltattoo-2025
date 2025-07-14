import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiStar, FiUsers, FiTrendingUp, FiShield, FiCheckCircle, FiArrowRight, FiDollarSign, FiCalendar, FiBarChart, FiHeart } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const JoinArtistPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    city: '',
    portfolio: '',
    instagram: '',
    specialty: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const benefits = [
    {
      icon: FiUsers,
      title: 'Acceso a Miles de Clientes',
      description: 'Conecta con personas que buscan exactamente tu estilo de tatuaje'
    },
    {
      icon: FiTrendingUp,
      title: 'Aumenta tus Ingresos',
      description: 'Incrementa tu clientela y optimiza tu agenda con clientes verificados'
    },
    {
      icon: FiShield,
      title: 'Pagos Seguros',
      description: 'Recibe pagos protegidos con nuestro sistema de custodia'
    },
    {
      icon: FiBarChart,
      title: 'Herramientas de Gestión',
      description: 'Administra tu calendario, portfolio y métricas en una sola plataforma'
    },
    {
      icon: FiStar,
      title: 'Construye tu Reputación',
      description: 'Sistema de reseñas que te ayuda a destacar y ganar confianza'
    },
    {
      icon: FiHeart,
      title: 'Comunidad de Artistas',
      description: 'Conecta con otros tatuadores y comparte experiencias'
    }
  ];

  const features = [
    {
      title: 'Portfolio Profesional',
      description: 'Muestra tu mejor trabajo con galerías optimizadas'
    },
    {
      title: 'Gestión de Citas',
      description: 'Calendario inteligente para organizar tu agenda'
    },
    {
      title: 'Comunicación Directa',
      description: 'Chat integrado para hablar con clientes potenciales'
    },
    {
      title: 'Análisis de Rendimiento',
      description: 'Métricas detalladas de tu actividad y ganancias'
    },
    {
      title: 'Soporte Prioritario',
      description: 'Atención personalizada para resolver tus dudas'
    },
    {
      title: 'Marketing Integrado',
      description: 'Herramientas para promocionar tu trabajo'
    }
  ];

  const testimonials = [
    {
      name: 'Carlos Mendoza',
      role: 'Tatuador Tradicional',
      avatar: '/api/placeholder/60/60',
      review: 'En 6 meses aumenté mis ingresos en un 40%. La plataforma me conecta con clientes que realmente valoran mi trabajo.',
      rating: 5
    },
    {
      name: 'María González',
      role: 'Especialista en Realismo',
      avatar: '/api/placeholder/60/60',
      review: 'PalTattoo me ayudó a encontrar mi nicho. Ahora trabajo principalmente con clientes que buscan tatuajes realistas.',
      rating: 5
    },
    {
      name: 'Diego Ramírez',
      role: 'Tatuador Geométrico',
      avatar: '/api/placeholder/60/60',
      review: 'La herramienta de gestión es increíble. Puedo manejar mi agenda, portfolio y pagos desde un solo lugar.',
      rating: 5
    }
  ];

  const plans = [
    {
      name: 'Básico',
      price: '$29.990',
      period: '/mes',
      features: [
        'Hasta 10 propuestas por mes',
        'Portfolio con 20 imágenes',
        'Soporte por email',
        'Herramientas básicas de gestión'
      ],
      recommended: false
    },
    {
      name: 'Premium',
      price: '$49.990',
      period: '/mes',
      features: [
        'Propuestas ilimitadas',
        'Portfolio con 50 imágenes',
        'Soporte prioritario',
        'Análisis avanzado',
        'Promoción destacada',
        'Chat en vivo con clientes'
      ],
      recommended: true
    },
    {
      name: 'Pro',
      price: '$79.990',
      period: '/mes',
      features: [
        'Todo lo del Premium',
        'Portfolio ilimitado',
        'Gerente de cuenta dedicado',
        'Herramientas de marketing',
        'Integración con redes sociales',
        'Reseñas destacadas'
      ],
      recommended: false
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Información Básica',
      description: 'Cuéntanos sobre ti y tu experiencia'
    },
    {
      number: 2,
      title: 'Portfolio',
      description: 'Muestra tus mejores trabajos'
    },
    {
      number: 3,
      title: 'Verificación',
      description: 'Validamos tu información y portfolio'
    },
    {
      number: 4,
      title: '¡Listo!',
      description: 'Comienza a recibir solicitudes'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('¡Solicitud enviada! Te contactaremos pronto.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        experience: '',
        city: '',
        portfolio: '',
        instagram: '',
        specialty: ''
      });
    } catch (error) {
      toast.error('Error al enviar la solicitud. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-gradient-to-r from-accent-600 to-accent-700">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Únete como Tatuador
              </h1>
              <p className="text-xl text-accent-100 mb-8">
                Transforma tu pasión en un negocio próspero. Conecta con miles de clientes 
                que buscan exactamente tu estilo de tatuaje.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="secondary" 
                  size="lg"
                  href="#register"
                  className="bg-white text-accent-600 hover:bg-accent-50"
                >
                  Comenzar Ahora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  href="#benefits"
                  className="border-white text-white hover:bg-white hover:text-accent-600"
                >
                  Ver Beneficios
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/api/placeholder/500/400" 
                alt="Tatuador trabajando"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-600/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent-500 mb-2">1,000+</div>
              <div className="text-primary-300">Tatuadores Activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-500 mb-2">50K+</div>
              <div className="text-primary-300">Clientes Registrados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-500 mb-2">85%</div>
              <div className="text-primary-300">Aumento de Ingresos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-500 mb-2">4.9/5</div>
              <div className="text-primary-300">Satisfacción de Artistas</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Benefits Section */}
      <Section id="benefits" className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              ¿Por qué elegir PalTattoo?
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Descubre todos los beneficios que te ofrecemos para hacer crecer tu negocio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <benefit.icon className="h-12 w-12 text-accent-500" />
                </div>
                <h3 className="text-xl font-semibold text-primary-100 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-primary-300">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Herramientas que Potencian tu Negocio
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar y hacer crecer tu trabajo como tatuador
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-3">
                  <FiCheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <h3 className="text-lg font-semibold text-primary-100">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-primary-300 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Lo que dicen nuestros artistas
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Testimonios reales de tatuadores que han transformado su negocio con PalTattoo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-primary-100">{testimonial.name}</h4>
                    <p className="text-primary-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-primary-300 text-sm">"{testimonial.review}"</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Process Steps */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Proceso de Registro
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Únete a PalTattoo en 4 simples pasos
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{step.number}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <FiArrowRight className="absolute top-8 -right-4 h-6 w-6 text-accent-500 hidden md:block" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">{step.title}</h3>
                <p className="text-primary-300 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Pricing */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Planes y Precios
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu negocio. Sin contratos anuales.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 text-center relative ${
                  plan.recommended ? 'border-accent-500 bg-accent-500/5' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Recomendado
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-primary-100 mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-accent-500">{plan.price}</span>
                  <span className="text-primary-400">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <FiCheckCircle className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-primary-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.recommended ? 'primary' : 'outline'} 
                  className="w-full"
                  href="#register"
                >
                  Elegir Plan
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Registration Form */}
      <Section id="register" className="py-16 bg-primary-800">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary-100 mb-4">
                Solicita tu Registro
              </h2>
              <p className="text-primary-300">
                Completa el formulario y nos pondremos en contacto contigo
              </p>
            </div>
            
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre Completo"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Tu nombre completo"
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Teléfono"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+56 9 1234 5678"
                  />
                  <Input
                    label="Ciudad"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Santiago"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-200 mb-2">
                      Años de Experiencia
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="">Selecciona</option>
                      <option value="0-2">0-2 años</option>
                      <option value="3-5">3-5 años</option>
                      <option value="6-10">6-10 años</option>
                      <option value="10+">Más de 10 años</option>
                    </select>
                  </div>
                  <Input
                    label="Especialidad"
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                    placeholder="Realismo, Tradicional, etc."
                  />
                </div>
                
                <Input
                  label="Portfolio Online"
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://tu-portfolio.com"
                />
                
                <Input
                  label="Instagram (opcional)"
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@tu_usuario"
                />
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    'Enviar Solicitud'
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default JoinArtistPage;