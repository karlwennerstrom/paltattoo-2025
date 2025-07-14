import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiSearch, FiChevronDown, FiChevronUp, FiHelpCircle, FiUsers, FiCreditCard, FiShield, FiCalendar, FiStar } from 'react-icons/fi';
import Button from '../components/common/Button';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = [
    { id: 'all', name: 'Todas', icon: FiHelpCircle },
    { id: 'general', name: 'General', icon: FiHelpCircle },
    { id: 'clients', name: 'Clientes', icon: FiUsers },
    { id: 'artists', name: 'Tatuadores', icon: FiStar },
    { id: 'payments', name: 'Pagos', icon: FiCreditCard },
    { id: 'bookings', name: 'Citas', icon: FiCalendar },
    { id: 'safety', name: 'Seguridad', icon: FiShield },
  ];

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: '¿Qué es PalTattoo?',
      answer: 'PalTattoo es una plataforma digital que conecta personas que buscan tatuajes con tatuadores profesionales verificados. Los clientes pueden publicar sus ideas de tatuaje, recibir propuestas de artistas y coordinar citas de manera segura.',
      popular: true
    },
    {
      id: 2,
      category: 'general',
      question: '¿Cómo funciona PalTattoo?',
      answer: 'El proceso es simple: 1) Los clientes crean una solicitud describiendo su idea de tatuaje, 2) Los tatuadores verificados envían propuestas con presupuestos, 3) El cliente elige la propuesta que más le guste, 4) Se coordina la cita y se realiza el tatuaje.',
      popular: true
    },
    {
      id: 3,
      category: 'general',
      question: '¿En qué países está disponible PalTattoo?',
      answer: 'Actualmente PalTattoo está disponible en Chile, con planes de expansión a otros países de América Latina durante 2024. Mantente atento a nuestras redes sociales para conocer las novedades.',
      popular: false
    },
    {
      id: 4,
      category: 'clients',
      question: '¿Cuánto cuesta usar PalTattoo como cliente?',
      answer: 'Para los clientes, usar PalTattoo es completamente gratuito. No cobramos comisiones por las transacciones ni tarifas de membresía. Solo pagas directamente al tatuador por su trabajo.',
      popular: true
    },
    {
      id: 5,
      category: 'clients',
      question: '¿Cómo creo mi primera solicitud de tatuaje?',
      answer: 'Después de registrarte, ve a "Crear Oferta" y completa el formulario con detalles sobre tu idea: descripción, estilo, tamaño, ubicación en el cuerpo, presupuesto estimado y cualquier referencia visual. Mientras más detalles proporciones, mejores propuestas recibirás.',
      popular: true
    },
    {
      id: 6,
      category: 'clients',
      question: '¿Qué debo incluir en mi solicitud para obtener mejores propuestas?',
      answer: 'Incluye una descripción detallada, imágenes de referencia, estilo preferido, tamaño aproximado, ubicación en el cuerpo, presupuesto estimado y cualquier preferencia específica sobre colores o técnicas. También menciona si tienes alguna alergia o condición médica relevante.',
      popular: false
    },
    {
      id: 7,
      category: 'clients',
      question: '¿Cuánto tiempo demora recibir propuestas?',
      answer: 'Normalmente recibes las primeras propuestas dentro de las primeras 24 horas. El tiempo puede variar según la complejidad de tu solicitud y la disponibilidad de los tatuadores en tu área.',
      popular: false
    },
    {
      id: 8,
      category: 'clients',
      question: '¿Puedo negociar el precio con el tatuador?',
      answer: 'Sí, puedes comunicarte directamente con el tatuador a través de nuestra plataforma para discutir detalles y ajustar el precio si es necesario. Recomendamos ser respetuoso y considerar la experiencia y calidad del trabajo del artista.',
      popular: false
    },
    {
      id: 9,
      category: 'artists',
      question: '¿Cómo puedo registrarme como tatuador?',
      answer: 'Visita nuestra página "Únete como Tatuador" y completa el proceso de registro. Necesitarás proporcionar tu portfolio, certificaciones profesionales, identificación y referencias. Todo el proceso de verificación toma entre 3-5 días hábiles.',
      popular: true
    },
    {
      id: 10,
      category: 'artists',
      question: '¿Cuánto cuesta la suscripción para tatuadores?',
      answer: 'Ofrecemos diferentes planes de suscripción: Básico ($29.990/mes), Premium ($49.990/mes) y Pro ($79.990/mes). Cada plan incluye diferentes beneficios como mayor visibilidad, herramientas de marketing y soporte prioritario.',
      popular: true
    },
    {
      id: 11,
      category: 'artists',
      question: '¿Qué documentos necesito para verificar mi cuenta?',
      answer: 'Necesitas: cédula de identidad, certificado de estudios o curso de tatuaje, portfolio con al menos 20 trabajos, referencias de clientes anteriores y licencia sanitaria (si aplica en tu localidad).',
      popular: false
    },
    {
      id: 12,
      category: 'artists',
      question: '¿Cómo optimizo mi perfil para recibir más clientes?',
      answer: 'Mantén tu portfolio actualizado con trabajos recientes y de alta calidad, completa toda la información de tu perfil, responde rápidamente a las consultas, mantén precios competitivos y collect reseñas positivas de tus clientes.',
      popular: false
    },
    {
      id: 13,
      category: 'payments',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias, y pagos a través de MercadoPago. También permitimos pagos en efectivo acordados directamente con el tatuador.',
      popular: true
    },
    {
      id: 14,
      category: 'payments',
      question: '¿Cuándo se procesa el pago?',
      answer: 'El pago se procesa una vez que confirmas la cita con el tatuador. Mantenemos el dinero en custodia hasta que el trabajo esté completado y ambas partes estén satisfechas, luego liberamos el pago al artista.',
      popular: true
    },
    {
      id: 15,
      category: 'payments',
      question: '¿Puedo obtener un reembolso?',
      answer: 'Los reembolsos se evalúan caso por caso. Si hay un problema con el servicio o el tatuador no cumple con lo acordado, nuestro equipo de soporte mediará para encontrar una solución justa, que puede incluir reembolso parcial o total.',
      popular: false
    },
    {
      id: 16,
      category: 'bookings',
      question: '¿Puedo cancelar o reprogramar una cita?',
      answer: 'Sí, puedes cancelar o reprogramar una cita hasta 48 horas antes de la fecha acordada sin penalización. Las cancelaciones con menos de 48 horas de anticipación pueden estar sujetas a cargos según la política del tatuador.',
      popular: true
    },
    {
      id: 17,
      category: 'bookings',
      question: '¿Qué pasa si el tatuador no se presenta a la cita?',
      answer: 'Si el tatuador no se presenta sin previo aviso, recibirás un reembolso completo y el incidente será reportado en su perfil. Nuestro equipo de soporte se pondrá en contacto contigo para asistirte en encontrar un reemplazo.',
      popular: false
    },
    {
      id: 18,
      category: 'bookings',
      question: '¿Puedo llevar acompañante a mi cita?',
      answer: 'Esto depende de la política del tatuador y las regulaciones del estudio. Te recomendamos consultar directamente con el artista al momento de coordinar la cita. La mayoría permite un acompañante, pero es mejor confirmarlo previamente.',
      popular: false
    },
    {
      id: 19,
      category: 'safety',
      question: '¿Cómo verifican a los tatuadores?',
      answer: 'Todos los tatuadores pasan por un riguroso proceso de verificación que incluye: validación de identidad, revisión de certificaciones profesionales, evaluación de portfolio, verificación de referencias y cumplimiento de estándares de higiene y seguridad.',
      popular: true
    },
    {
      id: 20,
      category: 'safety',
      question: '¿Qué medidas de seguridad tienen para proteger mis datos?',
      answer: 'Utilizamos encriptación SSL de 256 bits, almacenamiento seguro en la nube, autenticación de dos factores opcional, y cumplimos con las mejores prácticas de seguridad de datos. Nunca compartimos tu información personal con terceros sin tu consentimiento.',
      popular: true
    },
    {
      id: 21,
      category: 'safety',
      question: '¿Qué hago si tengo un problema con un tatuador?',
      answer: 'Si tienes algún problema, contacta inmediatamente a nuestro equipo de soporte a través del chat en vivo o email. Investigaremos el caso y tomaremos las medidas necesarias, que pueden incluir mediación, reembolso o suspensión del tatuador.',
      popular: false
    },
    {
      id: 22,
      category: 'safety',
      question: '¿Verifican las condiciones sanitarias de los estudios?',
      answer: 'Sí, como parte del proceso de verificación, los tatuadores deben proporcionar evidencia de que cumplen con todos los estándares sanitarios locales, incluyendo licencias de funcionamiento y certificados de higiene cuando apliquen.',
      popular: false
    },
  ];

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularFaqs = faqs.filter(faq => faq.popular);

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Preguntas Frecuentes
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Encuentra respuestas rápidas a las preguntas más comunes sobre PalTattoo
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar en preguntas frecuentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-primary-700 border border-primary-600 rounded-lg text-primary-100 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-lg"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Popular FAQs */}
      {selectedCategory === 'all' && searchQuery === '' && (
        <Section className="py-16 bg-primary-800">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary-100 mb-4">
                Preguntas Más Populares
              </h2>
              <p className="text-primary-300">
                Las consultas más frecuentes de nuestra comunidad
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {popularFaqs.map((faq) => (
                <Card key={faq.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-primary-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="bg-accent-600 text-white text-xs px-2 py-1 rounded-full mr-3">
                        Popular
                      </span>
                      <h3 className="text-lg font-semibold text-primary-100">
                        {faq.question}
                      </h3>
                    </div>
                    {expandedItems.has(faq.id) ? (
                      <FiChevronUp className="h-5 w-5 text-primary-400" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 text-primary-400" />
                    )}
                  </button>
                  {expandedItems.has(faq.id) && (
                    <div className="px-6 pb-6 border-t border-primary-600">
                      <p className="text-primary-300 leading-relaxed pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Category Filter */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Buscar por Categoría
            </h2>
            <p className="text-primary-300">
              Filtra las preguntas según tu área de interés
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
          
          {/* FAQ List */}
          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <FiHelpCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary-100 mb-2">
                  No se encontraron preguntas
                </h3>
                <p className="text-primary-400 mb-4">
                  No hay preguntas que coincidan con tu búsqueda
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <Card key={faq.id} className="overflow-hidden">
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-primary-700 transition-colors"
                    >
                      <div className="flex items-center">
                        <FiHelpCircle className="h-5 w-5 text-accent-500 mr-3 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-primary-100">
                          {faq.question}
                        </h3>
                      </div>
                      {expandedItems.has(faq.id) ? (
                        <FiChevronUp className="h-5 w-5 text-primary-400 flex-shrink-0" />
                      ) : (
                        <FiChevronDown className="h-5 w-5 text-primary-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedItems.has(faq.id) && (
                      <div className="px-6 pb-6 border-t border-primary-600">
                        <p className="text-primary-300 leading-relaxed pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* Contact Support */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <Card className="p-8 text-center">
            <FiHelpCircle className="h-12 w-12 text-accent-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-primary-100 mb-4">
              ¿No encontraste tu respuesta?
            </h3>
            <p className="text-primary-300 mb-6 max-w-2xl mx-auto">
              Nuestro equipo de soporte está listo para ayudarte con cualquier pregunta 
              que no haya sido respondida en esta sección.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" href="/support">
                Contactar Soporte
              </Button>
              <Button variant="outline" href="/help">
                Centro de Ayuda
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default FAQPage;