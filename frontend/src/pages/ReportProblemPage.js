import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiAlertTriangle, FiUser, FiMessageSquare, FiFlag, FiShield, FiMail, FiPhone, FiClock } from 'react-icons/fi';
import Button from '../components/common/Button';

const ReportProblemPage = () => {
  const [formData, setFormData] = useState({
    reportType: '',
    description: '',
    userReported: '',
    evidence: '',
    contactEmail: '',
    urgent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    { value: 'inappropriate-behavior', label: 'Comportamiento Inapropiado', icon: FiUser },
    { value: 'fraud', label: 'Fraude o Estafa', icon: FiShield },
    { value: 'fake-profile', label: 'Perfil Falso', icon: FiFlag },
    { value: 'quality-issues', label: 'Problemas de Calidad', icon: FiAlertTriangle },
    { value: 'payment-issues', label: 'Problemas de Pago', icon: FiMail },
    { value: 'harassment', label: 'Acoso o Intimidación', icon: FiMessageSquare },
    { value: 'other', label: 'Otro', icon: FiAlertTriangle }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setFormData({
      reportType: '',
      description: '',
      userReported: '',
      evidence: '',
      contactEmail: '',
      urgent: false
    });
    
    setIsSubmitting(false);
    alert('Reporte enviado correctamente. Te contactaremos pronto.');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <FiFlag className="h-16 w-16 text-accent-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Reportar Problema
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Ayúdanos a mantener PalTattoo seguro para todos. 
              Reporta cualquier problema o comportamiento inapropiado.
            </p>
          </div>
        </Container>
      </Section>

      {/* Report Types */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Tipos de Reporte
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Selecciona el tipo de problema que quieres reportar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.slice(0, 6).map((type, index) => (
              <Card key={index} className="p-6 text-center hover:bg-primary-700 transition-colors">
                <div className="flex justify-center mb-4">
                  <type.icon className="h-8 w-8 text-accent-500" />
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {type.label}
                </h3>
                <p className="text-primary-400 text-sm">
                  {type.value === 'inappropriate-behavior' && 'Usuarios que no respetan las normas de conducta'}
                  {type.value === 'fraud' && 'Actividades fraudulentas o intentos de estafa'}
                  {type.value === 'fake-profile' && 'Perfiles falsos o información incorrecta'}
                  {type.value === 'quality-issues' && 'Problemas con la calidad del trabajo'}
                  {type.value === 'payment-issues' && 'Problemas con pagos o cobros'}
                  {type.value === 'harassment' && 'Acoso, intimidación o amenazas'}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Report Form */}
      <Section className="py-16">
        <Container>
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-primary-100 mb-6 text-center">
                Formulario de Reporte
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type */}
                <div>
                  <label className="block text-primary-100 font-medium mb-2">
                    Tipo de Problema *
                  </label>
                  <select
                    name="reportType"
                    value={formData.reportType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-primary-700 text-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="">Selecciona un tipo</option>
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* User Reported */}
                <div>
                  <label className="block text-primary-100 font-medium mb-2">
                    Usuario Reportado (opcional)
                  </label>
                  <input
                    type="text"
                    name="userReported"
                    value={formData.userReported}
                    onChange={handleChange}
                    placeholder="Nombre de usuario o email"
                    className="w-full px-4 py-2 bg-primary-700 text-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-primary-100 font-medium mb-2">
                    Descripción del Problema *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Describe detalladamente lo que ocurrió, cuándo y dónde. Incluye toda la información relevante."
                    className="w-full px-4 py-2 bg-primary-700 text-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-primary-100 font-medium mb-2">
                    Evidencia (opcional)
                  </label>
                  <textarea
                    name="evidence"
                    value={formData.evidence}
                    onChange={handleChange}
                    rows="3"
                    placeholder="URLs, capturas de pantalla, conversaciones, etc."
                    className="w-full px-4 py-2 bg-primary-700 text-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-primary-100 font-medium mb-2">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2 bg-primary-700 text-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>

                {/* Urgent */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleChange}
                    className="mr-3 h-4 w-4 text-accent-600 focus:ring-accent-500 border-primary-600 rounded"
                  />
                  <label className="text-primary-100">
                    Esto es urgente (requiere atención inmediata)
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                </Button>
              </form>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Process Info */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              ¿Qué pasa después?
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Te explicamos nuestro proceso de revisión
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                Recepción
              </h3>
              <p className="text-primary-300">
                Recibimos tu reporte y lo clasificamos según urgencia y tipo
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                Investigación
              </h3>
              <p className="text-primary-300">
                Nuestro equipo especializado investiga el caso detalladamente
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFlag className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                Resolución
              </h3>
              <p className="text-primary-300">
                Tomamos medidas apropiadas y te informamos sobre el resultado
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Emergency Contact */}
      <Section className="py-16">
        <Container>
          <Card className="p-8 bg-red-600/10 border-red-600/20">
            <div className="text-center">
              <FiAlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-primary-100 mb-4">
                ¿Emergencia?
              </h3>
              <p className="text-primary-300 mb-6">
                Si estás en peligro inmediato, contacta a las autoridades locales o usa nuestros canales de emergencia
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:133"
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FiPhone className="mr-2" />
                  Carabineros: 133
                </a>
                <a 
                  href="mailto:emergencia@paltattoo.com"
                  className="bg-primary-700 text-primary-100 px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center"
                >
                  <FiMail className="mr-2" />
                  Emergencia PalTattoo
                </a>
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default ReportProblemPage;