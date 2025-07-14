import React, { useState } from 'react';
import { Container, Section, Card, Stack } from '../components/common/Layout';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMessageSquare } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email',
      value: 'contacto@paltattoo.com',
      description: 'Respuesta en 24 horas'
    },
    {
      icon: FiPhone,
      title: 'Teléfono',
      value: '+56 9 1234 5678',
      description: 'Lunes a Viernes 9:00 - 18:00'
    },
    {
      icon: FiMapPin,
      title: 'Dirección',
      value: 'Av. Providencia 1234, Santiago',
      description: 'Región Metropolitana, Chile'
    },
    {
      icon: FiClock,
      title: 'Horario de Atención',
      value: 'Lun - Vie: 9:00 - 18:00',
      description: 'Sáb: 10:00 - 14:00'
    },
  ];

  const faqs = [
    {
      question: '¿Cómo funciona PalTattoo?',
      answer: 'PalTattoo conecta clientes con tatuadores profesionales. Los clientes publican sus ideas de tatuaje y los artistas envían propuestas con presupuestos.'
    },
    {
      question: '¿Es seguro usar la plataforma?',
      answer: 'Sí, verificamos todos los tatuadores, ofrecemos pagos seguros y tenemos un sistema de reseñas para garantizar la calidad.'
    },
    {
      question: '¿Cuánto cuesta usar PalTattoo?',
      answer: 'Para clientes es gratis. Los tatuadores pagan una suscripción mensual para acceder a todas las funcionalidades.'
    },
    {
      question: '¿Puedo cancelar una cita?',
      answer: 'Sí, puedes cancelar hasta 48 horas antes de la cita. Revisa nuestra política de cancelación para más detalles.'
    },
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
      // Simular envío de formulario
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('¡Mensaje enviado exitosamente! Te responderemos pronto.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contactType: 'general'
      });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Contacto
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para apoyarte. 
              Contáctanos y te responderemos lo antes posible.
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact Info */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <info.icon className="h-12 w-12 text-accent-500" />
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">{info.title}</h3>
                <p className="text-primary-100 font-medium mb-1">{info.value}</p>
                <p className="text-primary-400 text-sm">{info.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Contact Form */}
      <Section className="py-16">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-primary-100 mb-6">
                Envíanos un Mensaje
              </h2>
              <p className="text-primary-300 mb-8">
                Completa el formulario y nos pondremos en contacto contigo lo antes posible.
              </p>
              
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
                    label="Teléfono (opcional)"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+56 9 1234 5678"
                  />
                  <div>
                    <label className="block text-sm font-medium text-primary-200 mb-2">
                      Tipo de Consulta
                    </label>
                    <select
                      name="contactType"
                      value={formData.contactType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-primary-700 border border-primary-600 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="general">Consulta General</option>
                      <option value="support">Soporte Técnico</option>
                      <option value="artist">Soy Tatuador</option>
                      <option value="business">Oportunidad de Negocio</option>
                      <option value="press">Prensa</option>
                    </select>
                  </div>
                </div>
                
                <Input
                  label="Asunto"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Asunto de tu mensaje"
                />
                
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    placeholder="Escribe tu mensaje aquí..."
                    className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-primary-100 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  />
                </div>
                
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
                    <>
                      <FiSend className="mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-primary-100 mb-6">
                Preguntas Frecuentes
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-lg font-semibold text-primary-100 mb-3 flex items-center">
                      <FiMessageSquare className="mr-2 text-accent-500" />
                      {faq.question}
                    </h3>
                    <p className="text-primary-300 leading-relaxed">{faq.answer}</p>
                  </Card>
                ))}
              </div>
              
              <Card className="p-6 mt-6 bg-gradient-to-r from-accent-600/10 to-accent-700/10 border-accent-600/20">
                <h3 className="text-lg font-semibold text-primary-100 mb-3">
                  ¿No encontraste lo que buscabas?
                </h3>
                <p className="text-primary-300 mb-4">
                  Visita nuestro centro de ayuda completo para más información y recursos.
                </p>
                <Button variant="outline" href="/help">
                  Ir al Centro de Ayuda
                </Button>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Map Section */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Nuestra Ubicación
            </h2>
            <p className="text-primary-300">
              Visítanos en nuestra oficina principal en Santiago
            </p>
          </div>
          
          <div className="bg-primary-700 rounded-lg p-4 h-96 flex items-center justify-center">
            <div className="text-center">
              <FiMapPin className="h-16 w-16 text-accent-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                Mapa Interactivo
              </h3>
              <p className="text-primary-300">
                Av. Providencia 1234, Santiago, Chile
              </p>
              <p className="text-primary-400 text-sm mt-2">
                (El mapa se integrará próximamente)
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default ContactPage;