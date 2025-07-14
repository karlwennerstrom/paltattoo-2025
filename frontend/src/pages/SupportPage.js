import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiMessageCircle, FiMail, FiPhone, FiBook, FiSearch, FiArrowRight, FiHelpCircle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Link } from 'react-router-dom';

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const supportOptions = [
    {
      icon: FiMessageCircle,
      title: 'Chat en Vivo',
      description: 'Habla directamente con nuestro equipo de soporte',
      action: 'Iniciar Chat',
      available: true,
      href: '#chat'
    },
    {
      icon: FiMail,
      title: 'Soporte por Email',
      description: 'Envía tu consulta y te responderemos en 24 horas',
      action: 'Enviar Email',
      available: true,
      href: '/contact'
    },
    {
      icon: FiPhone,
      title: 'Soporte Telefónico',
      description: 'Llámanos de Lunes a Viernes 9:00 - 18:00',
      action: 'Llamar Ahora',
      available: true,
      href: 'tel:+56912345678'
    },
    {
      icon: FiBook,
      title: 'Centro de Ayuda',
      description: 'Encuentra respuestas en nuestra base de conocimientos',
      action: 'Explorar Guías',
      available: true,
      href: '/help'
    },
  ];

  const categories = [
    { id: 'all', name: 'Todas las Categorías', count: 45 },
    { id: 'account', name: 'Cuenta y Perfil', count: 12 },
    { id: 'payments', name: 'Pagos y Facturación', count: 8 },
    { id: 'artists', name: 'Para Tatuadores', count: 15 },
    { id: 'bookings', name: 'Reservas y Citas', count: 10 },
  ];

  const popularArticles = [
    {
      title: '¿Cómo crear mi primera solicitud de tatuaje?',
      description: 'Aprende paso a paso cómo publicar tu idea de tatuaje',
      category: 'account',
      views: 2840,
      helpful: 95
    },
    {
      title: 'Métodos de pago disponibles',
      description: 'Conoce todas las formas de pago que aceptamos',
      category: 'payments',
      views: 1920,
      helpful: 88
    },
    {
      title: 'Cómo unirse como tatuador profesional',
      description: 'Guía completa para artistas que quieren ser parte de PalTattoo',
      category: 'artists',
      views: 3650,
      helpful: 92
    },
    {
      title: 'Política de cancelación de citas',
      description: 'Todo lo que necesitas saber sobre cancelaciones',
      category: 'bookings',
      views: 1450,
      helpful: 85
    },
    {
      title: 'Cómo cambiar mi información de perfil',
      description: 'Actualiza tu información personal y preferencias',
      category: 'account',
      views: 1230,
      helpful: 90
    },
    {
      title: 'Problemas con pagos y reembolsos',
      description: 'Soluciona problemas relacionados con transacciones',
      category: 'payments',
      views: 980,
      helpful: 78
    },
  ];

  const statusTypes = [
    { id: 'operational', name: 'Operacional', color: 'text-green-400', icon: FiCheckCircle },
    { id: 'maintenance', name: 'Mantenimiento', color: 'text-yellow-400', icon: FiAlertCircle },
    { id: 'issue', name: 'Problema Reportado', color: 'text-red-400', icon: FiAlertCircle },
  ];

  const systemStatus = [
    { service: 'Sitio Web Principal', status: 'operational', uptime: '99.9%' },
    { service: 'API de Pagos', status: 'operational', uptime: '99.8%' },
    { service: 'Notificaciones', status: 'maintenance', uptime: '98.5%' },
    { service: 'Subida de Imágenes', status: 'operational', uptime: '99.7%' },
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? popularArticles 
    : popularArticles.filter(article => article.category === selectedCategory);

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
              Centro de Soporte
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Estamos aquí para ayudarte. Encuentra respuestas rápidas o contáctanos directamente.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar en el centro de ayuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-primary-700 border border-primary-600 rounded-lg text-primary-100 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Support Options */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              ¿Cómo Podemos Ayudarte?
            </h2>
            <p className="text-primary-300">
              Elige la opción que mejor se adapte a tu necesidad
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, index) => (
              <Card key={index} className="p-6 text-center group hover:border-accent-500 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <option.icon className="h-12 w-12 text-accent-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">{option.title}</h3>
                <p className="text-primary-300 text-sm mb-4">{option.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  href={option.href}
                  className="w-full"
                >
                  {option.action}
                </Button>
                {option.available && (
                  <div className="flex items-center justify-center mt-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-green-400 text-xs">Disponible</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Knowledge Base */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Artículos Más Populares
            </h2>
            <p className="text-primary-300">
              Encuentra respuestas a las preguntas más frecuentes
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
          
          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedArticles.map((article, index) => (
              <Card key={index} className="p-6 group hover:border-accent-500 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <FiHelpCircle className="text-accent-500 h-5 w-5 mt-1" />
                  <span className="text-primary-400 text-xs">{article.views} vistas</span>
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2 group-hover:text-accent-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-primary-300 text-sm mb-4">{article.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-400 text-xs">
                    <FiCheckCircle className="h-3 w-3 mr-1" />
                    {article.helpful}% útil
                  </div>
                  <FiArrowRight className="text-accent-500 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
          
          {searchedArticles.length === 0 && (
            <div className="text-center py-12">
              <FiSearch className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                No se encontraron artículos
              </h3>
              <p className="text-primary-400 mb-4">
                Intenta con otros términos de búsqueda o contacta con soporte
              </p>
              <Button variant="outline" href="/contact">
                Contactar Soporte
              </Button>
            </div>
          )}
        </Container>
      </Section>

      {/* System Status */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Estado del Sistema
            </h2>
            <p className="text-primary-300">
              Monitoreo en tiempo real de nuestros servicios
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {systemStatus.map((service, index) => {
                const statusType = statusTypes.find(s => s.id === service.status);
                const StatusIcon = statusType.icon;
                
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${statusType.color}`} />
                        <span className="text-primary-100 font-medium">{service.service}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm ${statusType.color}`}>{statusType.name}</span>
                        <span className="text-primary-400 text-sm">{service.uptime} uptime</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-primary-400 text-sm mb-4">
                Última actualización: {new Date().toLocaleString('es-CL')}
              </p>
              <Button variant="outline" href="/status">
                Ver Historial Completo
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Emergency Contact */}
      <Section className="py-16">
        <Container>
          <Card className="p-8 text-center bg-gradient-to-r from-red-600/10 to-red-700/10 border-red-600/20">
            <FiAlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-100 mb-2">
              ¿Problema Urgente?
            </h3>
            <p className="text-primary-300 mb-6">
              Si experimentas un problema crítico que afecta tu uso de la plataforma, 
              contáctanos inmediatamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" href="tel:+56912345678">
                <FiPhone className="mr-2" />
                Llamar Ahora
              </Button>
              <Button variant="outline" href="/contact">
                <FiMail className="mr-2" />
                Email Urgente
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default SupportPage;