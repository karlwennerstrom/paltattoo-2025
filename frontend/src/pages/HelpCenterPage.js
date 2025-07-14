import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiSearch, FiBook, FiUsers, FiCreditCard, FiCalendar, FiShield, FiHelpCircle, FiChevronRight, FiStar, FiMessageCircle } from 'react-icons/fi';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    {
      id: 'getting-started',
      name: 'Primeros Pasos',
      icon: FiBook,
      description: 'Aprende lo básico para usar PalTattoo',
      articles: 15,
      color: 'text-blue-400'
    },
    {
      id: 'for-clients',
      name: 'Para Clientes',
      icon: FiUsers,
      description: 'Guías para encontrar tu tatuaje perfecto',
      articles: 22,
      color: 'text-green-400'
    },
    {
      id: 'for-artists',
      name: 'Para Tatuadores',
      icon: FiStar,
      description: 'Recursos para artistas profesionales',
      articles: 18,
      color: 'text-purple-400'
    },
    {
      id: 'payments',
      name: 'Pagos y Facturación',
      icon: FiCreditCard,
      description: 'Todo sobre pagos, precios y facturación',
      articles: 12,
      color: 'text-yellow-400'
    },
    {
      id: 'bookings',
      name: 'Reservas y Citas',
      icon: FiCalendar,
      description: 'Gestiona tus citas y reservas',
      articles: 10,
      color: 'text-red-400'
    },
    {
      id: 'safety',
      name: 'Seguridad y Privacidad',
      icon: FiShield,
      description: 'Mantén tu cuenta y datos seguros',
      articles: 8,
      color: 'text-cyan-400'
    },
  ];

  const popularArticles = [
    {
      title: 'Cómo crear tu primera solicitud de tatuaje',
      description: 'Guía paso a paso para publicar tu idea de tatuaje y recibir propuestas',
      category: 'for-clients',
      readTime: '5 min',
      views: 3450,
      rating: 4.8,
      featured: true
    },
    {
      title: 'Cómo configurar tu perfil de tatuador',
      description: 'Optimiza tu perfil para atraer más clientes',
      category: 'for-artists',
      readTime: '7 min',
      views: 2890,
      rating: 4.9,
      featured: true
    },
    {
      title: 'Métodos de pago disponibles',
      description: 'Conoce todas las formas de pago que aceptamos',
      category: 'payments',
      readTime: '3 min',
      views: 2340,
      rating: 4.6,
      featured: true
    },
    {
      title: 'Cómo cancelar o reprogramar una cita',
      description: 'Pasos para modificar tus citas de manera correcta',
      category: 'bookings',
      readTime: '4 min',
      views: 1980,
      rating: 4.7,
      featured: false
    },
    {
      title: 'Medidas de seguridad en PalTattoo',
      description: 'Cómo protegemos tu información y transacciones',
      category: 'safety',
      readTime: '6 min',
      views: 1650,
      rating: 4.8,
      featured: false
    },
  ];

  const guides = [
    {
      title: 'Guía Completa para Clientes',
      description: 'Todo lo que necesitas saber para encontrar tu tatuaje perfecto',
      image: '/api/placeholder/400/200',
      sections: 12,
      duration: '45 min',
      level: 'Principiante'
    },
    {
      title: 'Manual del Tatuador Profesional',
      description: 'Maximiza tus oportunidades de negocio en PalTattoo',
      image: '/api/placeholder/400/200',
      sections: 15,
      duration: '60 min',
      level: 'Intermedio'
    },
    {
      title: 'Mejores Prácticas de Seguridad',
      description: 'Protege tu cuenta y mantén tu información segura',
      image: '/api/placeholder/400/200',
      sections: 8,
      duration: '30 min',
      level: 'Principiante'
    },
  ];

  const faqs = [
    {
      question: '¿Cómo funciona PalTattoo?',
      answer: 'PalTattoo es una plataforma que conecta clientes con tatuadores profesionales. Los clientes publican sus ideas de tatuaje, los artistas envían propuestas, y una vez acordados los términos, se agenda la cita.'
    },
    {
      question: '¿Cuánto cuesta usar PalTattoo?',
      answer: 'Para clientes, usar PalTattoo es completamente gratis. Los tatuadores pagan una suscripción mensual para acceder a todas las funcionalidades de la plataforma.'
    },
    {
      question: '¿Cómo verifican a los tatuadores?',
      answer: 'Todos los tatuadores pasan por un proceso de verificación que incluye validación de identidad, licencias profesionales, portfolio de trabajos y referencias.'
    },
    {
      question: '¿Puedo cancelar una cita?',
      answer: 'Sí, puedes cancelar una cita hasta 48 horas antes de la fecha programada. Las cancelaciones dentro de las 48 horas pueden estar sujetas a cargos.'
    },
    {
      question: '¿Qué pasa si no estoy satisfecho con el resultado?',
      answer: 'Ofrecemos un sistema de resolución de disputas. Si hay un problema con tu tatuaje, puedes reportarlo y nuestro equipo mediará para encontrar una solución.'
    },
  ];

  const filteredArticles = selectedCategory
    ? popularArticles.filter(article => article.category === selectedCategory)
    : popularArticles;

  const searchedArticles = searchQuery
    ? filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredArticles;

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Centro de Ayuda
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Encuentra respuestas, aprende a usar PalTattoo y descubre tips para sacar el máximo provecho de la plataforma.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar artículos, guías, preguntas frecuentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-primary-700 border border-primary-600 rounded-lg text-primary-100 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-lg"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Categories */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Categorías de Ayuda
            </h2>
            <p className="text-primary-300">
              Explora nuestras categorías para encontrar la información que necesitas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className={`p-6 cursor-pointer transition-all duration-300 hover:border-accent-500 ${
                  selectedCategory === category.id ? 'border-accent-500 bg-accent-500/5' : ''
                }`}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <category.icon className={`h-8 w-8 ${category.color}`} />
                  <span className="text-primary-400 text-sm">{category.articles} artículos</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-100 mb-2">
                  {category.name}
                </h3>
                <p className="text-primary-300 text-sm mb-4">{category.description}</p>
                <div className="flex items-center text-accent-400 text-sm">
                  <span>Explorar categoría</span>
                  <FiChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Popular Articles */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              {selectedCategory ? 'Artículos de la Categoría' : 'Artículos Populares'}
            </h2>
            <p className="text-primary-300">
              {selectedCategory ? 'Contenido específico para tu consulta' : 'Los artículos más útiles y visitados'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedArticles.map((article, index) => (
              <Card key={index} className="p-6 group hover:border-accent-500 transition-all duration-300">
                {article.featured && (
                  <div className="flex items-center mb-3">
                    <span className="bg-accent-600 text-white text-xs px-2 py-1 rounded-full">
                      Destacado
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-primary-100 mb-2 group-hover:text-accent-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-primary-300 text-sm mb-4 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center justify-between text-xs text-primary-400 mb-4">
                  <span>{article.readTime} lectura</span>
                  <span>{article.views} vistas</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-primary-300 text-sm">{article.rating}</span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-accent-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Guides */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Guías Detalladas
            </h2>
            <p className="text-primary-300">
              Tutoriales completos para dominar PalTattoo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <Card key={index} className="overflow-hidden group hover:border-accent-500 transition-all duration-300">
                <div className="relative">
                  <img 
                    src={guide.image} 
                    alt={guide.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-900/80 text-primary-100 text-xs px-2 py-1 rounded">
                      {guide.level}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-primary-100 mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-primary-300 text-sm mb-4">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-primary-400 mb-4">
                    <span>{guide.sections} secciones</span>
                    <span>{guide.duration}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Leer Guía
                  </Button>
                </div>
              </Card>
            ))}
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
            <p className="text-primary-300">
              Respuestas rápidas a las dudas más comunes
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start">
                  <FiHelpCircle className="h-5 w-5 text-accent-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary-100 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-primary-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-primary-300 mb-4">
              ¿No encontraste lo que buscabas?
            </p>
            <Link to="/faq" className="text-accent-400 hover:text-accent-300 font-medium">
              Ver todas las preguntas frecuentes →
            </Link>
          </div>
        </Container>
      </Section>

      {/* Contact Support */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <Card className="p-8 text-center">
            <FiMessageCircle className="h-12 w-12 text-accent-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-primary-100 mb-4">
              ¿Necesitas Más Ayuda?
            </h3>
            <p className="text-primary-300 mb-6 max-w-2xl mx-auto">
              Si no pudiste encontrar la respuesta que buscabas, nuestro equipo de soporte 
              está listo para ayudarte personalmente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" href="/support">
                Contactar Soporte
              </Button>
              <Button variant="outline" href="/contact">
                Enviar Mensaje
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default HelpCenterPage;