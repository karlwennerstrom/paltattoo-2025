import React from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiUser, FiSearch, FiMessageSquare, FiCalendar, FiStar, FiShield, FiHeart, FiCheckCircle } from 'react-icons/fi';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
  const clientSteps = [
    {
      step: 1,
      icon: FiUser,
      title: 'Crea tu Perfil',
      description: 'Regístrate gratis y completa tu perfil con tus preferencias',
      details: ['Registro gratuito en 2 minutos', 'Personaliza tus preferencias', 'Sube fotos de referencia']
    },
    {
      step: 2,
      icon: FiSearch,
      title: 'Publica tu Idea',
      description: 'Describe tu tatuaje ideal y recibe propuestas de artistas',
      details: ['Describe tu idea con detalle', 'Especifica estilo y tamaño', 'Define tu presupuesto']
    },
    {
      step: 3,
      icon: FiMessageSquare,
      title: 'Elige tu Artista',
      description: 'Revisa propuestas, compara precios y elige al tatuador perfecto',
      details: ['Recibe múltiples propuestas', 'Compara portfolios y precios', 'Chatea con los artistas']
    },
    {
      step: 4,
      icon: FiCalendar,
      title: 'Agenda tu Cita',
      description: 'Coordina fecha, hora y lugar con el artista seleccionado',
      details: ['Agenda en tiempo real', 'Confirmación automática', 'Recordatorios incluidos']
    },
    {
      step: 5,
      icon: FiStar,
      title: 'Disfruta tu Tatuaje',
      description: '¡Luce tu nuevo tatuaje y comparte tu experiencia!',
      details: ['Seguimiento post-cita', 'Consejos de cuidado', 'Sistema de reseñas']
    }
  ];

  const artistSteps = [
    {
      step: 1,
      icon: FiUser,
      title: 'Registro Profesional',
      description: 'Crea tu perfil profesional y sube tu portfolio',
      details: ['Proceso de verificación', 'Portfolio profesional', 'Certificaciones validadas']
    },
    {
      step: 2,
      icon: FiSearch,
      title: 'Encuentra Clientes',
      description: 'Explora solicitudes que coincidan con tu estilo',
      details: ['Filtros por estilo y ubicación', 'Notificaciones en tiempo real', 'Algoritmo de matching']
    },
    {
      step: 3,
      icon: FiMessageSquare,
      title: 'Envía Propuestas',
      description: 'Responde a solicitudes con propuestas personalizadas',
      details: ['Propuestas detalladas', 'Presupuesto transparente', 'Galería de trabajos similares']
    },
    {
      step: 4,
      icon: FiCalendar,
      title: 'Gestiona tu Agenda',
      description: 'Organiza tus citas y maximiza tu tiempo',
      details: ['Calendario integrado', 'Gestión de disponibilidad', 'Recordatorios automáticos']
    },
    {
      step: 5,
      icon: FiStar,
      title: 'Haz Crecer tu Negocio',
      description: 'Construye tu reputación y aumenta tus ingresos',
      details: ['Sistema de reseñas', 'Métricas de rendimiento', 'Herramientas de marketing']
    }
  ];

  const features = [
    {
      icon: FiShield,
      title: 'Seguridad Garantizada',
      description: 'Todos los tatuadores están verificados y los pagos son seguros',
      benefits: ['Verificación de identidad', 'Pagos protegidos', 'Seguro de calidad']
    },
    {
      icon: FiHeart,
      title: 'Matching Inteligente',
      description: 'Conectamos clientes con artistas según estilo y preferencias',
      benefits: ['Algoritmo de compatibilidad', 'Filtros avanzados', 'Recomendaciones personalizadas']
    },
    {
      icon: FiCheckCircle,
      title: 'Calidad Asegurada',
      description: 'Solo trabajamos con tatuadores profesionales certificados',
      benefits: ['Portfolio verificado', 'Experiencia comprobada', 'Reseñas reales']
    }
  ];

  const [activeTab, setActiveTab] = React.useState('client');

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              ¿Cómo Funciona PalTattoo?
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Descubre lo simple que es conectar con tatuadores profesionales 
              o encontrar tu próximo cliente ideal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" href="/register">
                Comenzar Ahora
              </Button>
              <Button variant="outline" size="lg" href="#process">
                Ver el Proceso
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Tab Navigation */}
      <Section id="process" className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Proceso Simple y Eficiente
            </h2>
            <p className="text-primary-300 mb-8">
              Elige tu perfil para ver cómo funciona PalTattoo para ti
            </p>
            
            <div className="flex justify-center space-x-4 mb-12">
              <button
                onClick={() => setActiveTab('client')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'client'
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                }`}
              >
                Soy Cliente
              </button>
              <button
                onClick={() => setActiveTab('artist')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'artist'
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                }`}
              >
                Soy Tatuador
              </button>
            </div>
          </div>

          {/* Client Process */}
          {activeTab === 'client' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary-100 mb-2">
                  Para Clientes
                </h3>
                <p className="text-primary-300">
                  Encuentra tu tatuaje perfecto en 5 simples pasos
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clientSteps.map((step, index) => (
                  <Card key={index} className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="bg-accent-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-primary-100 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-primary-300 mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-primary-400">
                          <FiCheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Artist Process */}
          {activeTab === 'artist' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary-100 mb-2">
                  Para Tatuadores
                </h3>
                <p className="text-primary-300">
                  Haz crecer tu negocio y conecta con más clientes
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artistSteps.map((step, index) => (
                  <Card key={index} className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="bg-accent-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-primary-100 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-primary-300 mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-primary-400">
                          <FiCheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* Key Features */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              ¿Por qué elegir PalTattoo?
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Ofrecemos la plataforma más segura y eficiente para conectar 
              clientes con tatuadores profesionales
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-accent-500" />
                </div>
                <h3 className="text-xl font-semibold text-primary-100 mb-4">
                  {feature.title}
                </h3>
                <p className="text-primary-300 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-primary-400">
                      <FiCheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Video Demo Section */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Ve PalTattoo en Acción
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Mira cómo nuestros usuarios han encontrado su tatuaje perfecto
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-primary-700 rounded-lg overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary-100 mb-2">
                    Demo de la Plataforma
                  </h3>
                  <p className="text-primary-400">
                    Video demo próximamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Respuestas a las dudas más comunes sobre PalTattoo
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary-100 mb-3">
                ¿Es gratis para clientes?
              </h3>
              <p className="text-primary-300 text-sm">
                Sí, para los clientes PalTattoo es completamente gratuito. 
                Solo pagas directamente al tatuador por su trabajo.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary-100 mb-3">
                ¿Cómo verifican a los tatuadores?
              </h3>
              <p className="text-primary-300 text-sm">
                Todos pasan por un proceso de verificación riguroso que incluye 
                validación de identidad, portfolio y certificaciones.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary-100 mb-3">
                ¿Puedo cancelar una cita?
              </h3>
              <p className="text-primary-300 text-sm">
                Sí, puedes cancelar hasta 48 horas antes de la cita. 
                Revisa nuestra política de cancelación para más detalles.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary-100 mb-3">
                ¿Qué pasa si no estoy satisfecho?
              </h3>
              <p className="text-primary-300 text-sm">
                Tenemos un sistema de resolución de disputas y garantía 
                de satisfacción para asegurar tu experiencia.
              </p>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/faq" 
              className="text-accent-400 hover:text-accent-300 font-medium"
            >
              Ver todas las preguntas frecuentes →
            </Link>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-accent-600 to-accent-700">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para Comenzar?
            </h2>
            <p className="text-accent-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de personas que ya han encontrado su tatuaje perfecto 
              o han hecho crecer su negocio con PalTattoo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                href="/register"
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                Registrarse como Cliente
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                href="/join-artist"
                className="border-white text-white hover:bg-white hover:text-accent-600"
              >
                Únete como Tatuador
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default HowItWorksPage;