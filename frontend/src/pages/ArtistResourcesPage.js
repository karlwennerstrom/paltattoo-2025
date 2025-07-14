import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiBook, FiVideo, FiDownload, FiUsers, FiTrendingUp, FiCamera, FiDollarSign, FiShield, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import Button from '../components/common/Button';

const ArtistResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: FiBook },
    { id: 'business', name: 'Negocio', icon: FiDollarSign },
    { id: 'marketing', name: 'Marketing', icon: FiTrendingUp },
    { id: 'legal', name: 'Legal', icon: FiShield },
    { id: 'technical', name: 'Técnico', icon: FiCamera },
    { id: 'community', name: 'Comunidad', icon: FiUsers }
  ];

  const resources = [
    {
      title: 'Guía Completa de Pricing para Tatuadores',
      description: 'Aprende a establecer precios competitivos y justos para tu trabajo',
      type: 'PDF',
      category: 'business',
      icon: FiDollarSign,
      downloadUrl: '#',
      featured: true
    },
    {
      title: 'Curso: Fotografía de Tatuajes',
      description: 'Técnicas profesionales para fotografiar tu trabajo',
      type: 'Video',
      category: 'technical',
      icon: FiCamera,
      downloadUrl: '#',
      featured: true
    },
    {
      title: 'Templates de Contratos',
      description: 'Modelos de contratos adaptados a la legislación chilena',
      type: 'DOC',
      category: 'legal',
      icon: FiShield,
      downloadUrl: '#',
      featured: false
    },
    {
      title: 'Estrategias de Marketing Digital',
      description: 'Cómo promocionar tu trabajo en redes sociales',
      type: 'PDF',
      category: 'marketing',
      icon: FiTrendingUp,
      downloadUrl: '#',
      featured: true
    },
    {
      title: 'Gestión de Clientes Difíciles',
      description: 'Técnicas de comunicación y resolución de conflictos',
      type: 'Video',
      category: 'business',
      icon: FiMessageSquare,
      downloadUrl: '#',
      featured: false
    },
    {
      title: 'Calendario de Tendencias 2024',
      description: 'Estilos y tendencias que serán populares este año',
      type: 'PDF',
      category: 'marketing',
      icon: FiCalendar,
      downloadUrl: '#',
      featured: false
    }
  ];

  const webinars = [
    {
      title: 'Cómo Triplicar tus Ingresos en 6 Meses',
      date: '2024-02-15',
      time: '19:00',
      presenter: 'Carlos Mendoza',
      description: 'Estrategias probadas para hacer crecer tu negocio de tatuajes',
      registered: false
    },
    {
      title: 'Nuevas Tendencias en Tatuajes 2024',
      date: '2024-02-22',
      time: '18:00',
      presenter: 'María González',
      description: 'Descubre los estilos que dominarán este año',
      registered: true
    },
    {
      title: 'Aspectos Legales del Tatuaje en Chile',
      date: '2024-03-01',
      time: '20:00',
      presenter: 'Dr. Roberto Silva',
      description: 'Todo lo que necesitas saber sobre regulaciones y normativas',
      registered: false
    }
  ];

  const tools = [
    {
      name: 'Calculadora de Precios',
      description: 'Herramienta para calcular precios basados en tiempo y materiales',
      icon: FiDollarSign,
      url: '#'
    },
    {
      name: 'Editor de Contratos',
      description: 'Genera contratos personalizados para tus clientes',
      icon: FiShield,
      url: '#'
    },
    {
      name: 'Planificador de Contenido',
      description: 'Organiza tu contenido para redes sociales',
      icon: FiCalendar,
      url: '#'
    },
    {
      name: 'Biblioteca de Stencils',
      description: 'Acceso a miles de plantillas y diseños',
      icon: FiBook,
      url: '#'
    }
  ];

  const communityResources = [
    {
      title: 'Foro de Tatuadores',
      description: 'Conecta con otros profesionales, comparte experiencias y resuelve dudas',
      members: '2,500+',
      activity: 'Muy activo',
      url: '#'
    },
    {
      title: 'Grupo de WhatsApp',
      description: 'Chat en tiempo real con la comunidad PalTattoo',
      members: '500+',
      activity: 'Activo',
      url: '#'
    },
    {
      title: 'Eventos Presenciales',
      description: 'Workshops, convenciones y meetups en todo Chile',
      members: 'Varía',
      activity: 'Mensual',
      url: '#'
    }
  ];

  const filteredResources = activeCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === activeCategory);

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Recursos para Tatuadores
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Todo lo que necesitas para hacer crecer tu negocio: guías, herramientas, 
              cursos y una comunidad de profesionales
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" href="#resources">
                Explorar Recursos
              </Button>
              <Button variant="outline" size="lg" href="#community">
                Únete a la Comunidad
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Featured Resources */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Recursos Destacados
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Los recursos más populares y útiles para tatuadores
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.filter(resource => resource.featured).map((resource, index) => (
              <Card key={index} className="p-6 hover:bg-primary-700 transition-colors">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center mr-4">
                    <resource.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="bg-accent-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {resource.type}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {resource.title}
                </h3>
                <p className="text-primary-300 text-sm mb-4">
                  {resource.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  href={resource.downloadUrl}
                  className="w-full"
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* All Resources */}
      <Section id="resources" className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Todos los Recursos
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Filtra por categoría para encontrar exactamente lo que necesitas
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                }`}
              >
                <category.icon className="mr-2 h-4 w-4" />
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <resource.icon className="h-8 w-8 text-accent-500" />
                  <span className="bg-primary-700 text-primary-300 px-2 py-1 rounded-full text-xs font-medium">
                    {resource.type}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {resource.title}
                </h3>
                <p className="text-primary-300 text-sm mb-4">
                  {resource.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  href={resource.downloadUrl}
                  className="w-full"
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Webinars */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Próximos Webinars
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Capacitaciones en vivo con expertos de la industria
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <FiVideo className="h-8 w-8 text-accent-500" />
                  <span className="bg-accent-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {webinar.registered ? 'Registrado' : 'Disponible'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {webinar.title}
                </h3>
                <p className="text-primary-300 text-sm mb-4">
                  {webinar.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-primary-400">
                    <FiCalendar className="mr-2 h-4 w-4" />
                    {new Date(webinar.date).toLocaleDateString('es-CL')} - {webinar.time}
                  </div>
                  <div className="flex items-center text-sm text-primary-400">
                    <FiUsers className="mr-2 h-4 w-4" />
                    {webinar.presenter}
                  </div>
                </div>
                <Button 
                  variant={webinar.registered ? "secondary" : "primary"}
                  size="sm"
                  className="w-full"
                  disabled={webinar.registered}
                >
                  {webinar.registered ? 'Ya Registrado' : 'Registrarse'}
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Tools */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Herramientas Gratuitas
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Herramientas online para facilitar tu trabajo diario
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Card key={index} className="p-6 text-center hover:bg-primary-700 transition-colors">
                <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {tool.name}
                </h3>
                <p className="text-primary-300 text-sm mb-4">
                  {tool.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  href={tool.url}
                  className="w-full"
                >
                  Usar Herramienta
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Community */}
      <Section id="community" className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Comunidad PalTattoo
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Conecta con otros tatuadores, comparte experiencias y aprende juntos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {communityResources.map((community, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <FiUsers className="h-8 w-8 text-accent-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary-100">
                      {community.title}
                    </h3>
                  </div>
                </div>
                <p className="text-primary-300 text-sm mb-4">
                  {community.description}
                </p>
                <div className="flex items-center justify-between text-sm text-primary-400 mb-4">
                  <span>{community.members} miembros</span>
                  <span>{community.activity}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  href={community.url}
                  className="w-full"
                >
                  Únirse
                </Button>
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
              ¿Quieres acceso a recursos premium?
            </h2>
            <p className="text-accent-100 mb-8 max-w-2xl mx-auto">
              Únete a PalTattoo y obtén acceso a todos nuestros recursos, 
              herramientas y la comunidad más grande de tatuadores
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                href="/join-artist"
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                Únete a PalTattoo
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                href="/artist/pricing"
                className="border-white text-white hover:bg-white hover:text-accent-600"
              >
                Ver Planes
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default ArtistResourcesPage;