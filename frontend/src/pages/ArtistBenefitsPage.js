import React from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiUsers, FiDollarSign, FiTrendingUp, FiShield, FiStar, FiCalendar, FiCamera, FiTarget } from 'react-icons/fi';
import Button from '../components/common/Button';

const ArtistBenefitsPage = () => {
  const primaryBenefits = [
    {
      icon: FiUsers,
      title: 'Acceso a Más Clientes',
      description: 'Conecta con miles de clientes potenciales cada mes',
      features: [
        'Base de datos de clientes en crecimiento',
        'Matching inteligente basado en tu estilo',
        'Notificaciones de nuevas oportunidades'
      ]
    },
    {
      icon: FiDollarSign,
      title: 'Aumenta tus Ingresos',
      description: 'Optimiza tu tiempo y maximiza tus ganancias',
      features: [
        'Gestión eficiente de tu agenda',
        'Precios competitivos y transparentes',
        'Múltiples fuentes de ingreso'
      ]
    },
    {
      icon: FiTrendingUp,
      title: 'Crecimiento Profesional',
      description: 'Desarrolla tu carrera con herramientas profesionales',
      features: [
        'Analytics detallados de tu rendimiento',
        'Feedback constructivo de clientes',
        'Oportunidades de capacitación'
      ]
    },
    {
      icon: FiShield,
      title: 'Protección Profesional',
      description: 'Trabaja con seguridad y respaldo legal',
      features: [
        'Verificación de identidad de clientes',
        'Contratos digitales seguros',
        'Soporte legal básico incluido'
      ]
    }
  ];

  const businessTools = [
    {
      icon: FiCalendar,
      title: 'Gestión de Agenda',
      description: 'Organiza tu tiempo de manera eficiente',
      details: 'Calendario integrado con confirmaciones automáticas, recordatorios y gestión de disponibilidad'
    },
    {
      icon: FiCamera,
      title: 'Portfolio Profesional',
      description: 'Muestra tu trabajo de la mejor manera',
      details: 'Galería optimizada, categorización por estilos y herramientas de edición básicas'
    },
    {
      icon: FiTarget,
      title: 'Marketing Dirigido',
      description: 'Llega a tu audiencia ideal',
      details: 'Promoción en base a ubicación, especialización y historial de trabajos'
    },
    {
      icon: FiStar,
      title: 'Sistema de Reputación',
      description: 'Construye tu reputación online',
      details: 'Reseñas verificadas, sistema de calificaciones y certificaciones de calidad'
    }
  ];

  const testimonials = [
    {
      name: 'Carlos Mendoza',
      role: 'Tatuador Profesional',
      location: 'Santiago',
      quote: 'Desde que me uní a PalTattoo, mis ingresos han aumentado un 40%. La plataforma me conecta con clientes que realmente valoran mi trabajo.',
      rating: 5
    },
    {
      name: 'María González',
      role: 'Artista Especializada',
      location: 'Valparaíso',
      quote: 'Lo que más me gusta es poder enfocarme en mi arte mientras PalTattoo maneja la parte administrativa. Es una herramienta indispensable.',
      rating: 5
    },
    {
      name: 'Roberto Silva',
      role: 'Tatuador Independiente',
      location: 'Concepción',
      quote: 'La verificación de clientes y el sistema de pagos seguros me dan mucha tranquilidad. Puedo trabajar sin preocuparme por estafas.',
      rating: 5
    }
  ];

  const stats = [
    { number: '2,500+', label: 'Tatuadores Registrados' },
    { number: '50,000+', label: 'Clientes Activos' },
    { number: '85%', label: 'Aumento Promedio de Ingresos' },
    { number: '4.8/5', label: 'Satisfacción de Artistas' }
  ];

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-gradient-to-r from-accent-600 to-accent-700">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Beneficios para Tatuadores
            </h1>
            <p className="text-xl text-accent-100 mb-8">
              Únete a la comunidad de tatuadores más grande de Chile y 
              transforma tu carrera profesional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                href="/join-artist"
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                Únete Ahora
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                href="/artist/pricing"
                className="border-white text-white hover:bg-white hover:text-accent-600"
              >
                Ver Precios
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-accent-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Primary Benefits */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              ¿Por qué elegir PalTattoo?
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Descubre todos los beneficios que ofrecemos a nuestros tatuadores
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {primaryBenefits.map((benefit, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-100 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-primary-300 mb-4">
                      {benefit.description}
                    </p>
                    <ul className="space-y-2">
                      {benefit.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-primary-400">
                          <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Business Tools */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Herramientas Profesionales
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tu negocio de tatuajes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {businessTools.map((tool, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <tool.icon className="h-8 w-8 text-accent-500 mr-3" />
                  <h3 className="text-xl font-semibold text-primary-100">
                    {tool.title}
                  </h3>
                </div>
                <p className="text-primary-300 mb-3">
                  {tool.description}
                </p>
                <p className="text-sm text-primary-400">
                  {tool.details}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Success Stories */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Historias de Éxito
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Conoce las experiencias de tatuadores que han transformado su carrera
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-primary-300 mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-primary-700 pt-4">
                  <div className="font-semibold text-primary-100">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-primary-400">
                    {testimonial.role} • {testimonial.location}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Process Overview */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Proceso Simple de Registro
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Comienza a generar ingresos en pocos pasos
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Registro', desc: 'Completa tu perfil profesional' },
              { step: 2, title: 'Verificación', desc: 'Validamos tu identidad y certificaciones' },
              { step: 3, title: 'Portfolio', desc: 'Sube tus mejores trabajos' },
              { step: 4, title: '¡Listo!', desc: 'Comienza a recibir clientes' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-primary-400 text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-accent-600 to-accent-700">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para hacer crecer tu negocio?
            </h2>
            <p className="text-accent-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de tatuadores que ya están aumentando sus ingresos 
              y construyendo su reputación profesional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                href="/join-artist"
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                Comenzar Ahora
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
    </div>
  );
};

export default ArtistBenefitsPage;