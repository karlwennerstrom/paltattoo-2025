import React from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiShield, FiCheckCircle, FiAlertTriangle, FiHeart, FiEye, FiUsers, FiStar, FiClock, FiFileText } from 'react-icons/fi';
import Button from '../components/common/Button';

const SafetyQualityPage = () => {
  const safetyStandards = [
    {
      icon: FiShield,
      title: 'Verificación de Tatuadores',
      description: 'Proceso riguroso de verificación profesional',
      details: [
        'Validación de identidad y documentos',
        'Verificación de certificaciones sanitarias',
        'Revisión de portfolio y experiencia',
        'Evaluación de instalaciones y equipos',
        'Verificación de seguros profesionales'
      ]
    },
    {
      icon: FiCheckCircle,
      title: 'Estándares de Higiene',
      description: 'Cumplimiento estricto de normas sanitarias',
      details: [
        'Uso obligatorio de material desechable',
        'Esterilización de equipos según normas',
        'Manejo adecuado de residuos biológicos',
        'Desinfección completa del área de trabajo',
        'Protocolos de limpieza documentados'
      ]
    },
    {
      icon: FiHeart,
      title: 'Salud del Cliente',
      description: 'Cuidado integral antes, durante y después',
      details: [
        'Evaluación de condiciones de salud',
        'Pruebas de alergia cuando sea necesario',
        'Uso de tintas certificadas y seguras',
        'Seguimiento post-procedimiento',
        'Instrucciones detalladas de cuidado'
      ]
    },
    {
      icon: FiEye,
      title: 'Supervisión Continua',
      description: 'Monitoreo constante de calidad',
      details: [
        'Inspecciones regulares sorpresa',
        'Sistema de reportes de incidentes',
        'Auditorías de calidad trimestrales',
        'Evaluaciones de clientes',
        'Mejora continua de procesos'
      ]
    }
  ];

  const qualityMetrics = [
    {
      metric: '99.8%',
      label: 'Satisfacción del Cliente',
      icon: FiStar,
      description: 'Basado en más de 50,000 reseñas'
    },
    {
      metric: '100%',
      label: 'Tatuadores Verificados',
      icon: FiShield,
      description: 'Todos pasan nuestro proceso de verificación'
    },
    {
      metric: '0.02%',
      label: 'Tasa de Incidentes',
      icon: FiAlertTriangle,
      description: 'Menos de 1 incidente por cada 5,000 tatuajes'
    },
    {
      metric: '2.5hrs',
      label: 'Tiempo de Respuesta',
      icon: FiClock,
      description: 'Tiempo promedio de resolución de problemas'
    }
  ];

  const certifications = [
    {
      name: 'ISO 13485',
      description: 'Sistemas de gestión de calidad para dispositivos médicos',
      status: 'Certificado'
    },
    {
      name: 'Registro ISP',
      description: 'Instituto de Salud Pública de Chile',
      status: 'Registrado'
    },
    {
      name: 'SEREMI de Salud',
      description: 'Autorización sanitaria regional',
      status: 'Autorizado'
    },
    {
      name: 'Seguros Profesionales',
      description: 'Cobertura de responsabilidad civil',
      status: 'Vigente'
    }
  ];

  const healthGuidelines = [
    {
      title: 'Antes del Tatuaje',
      items: [
        'Estar en buen estado de salud general',
        'No consumir alcohol 24 horas antes',
        'Dormir bien la noche anterior',
        'Comer una comida completa antes de la sesión',
        'Informar sobre medicamentos o alergias'
      ]
    },
    {
      title: 'Durante el Procedimiento',
      items: [
        'Comunicar cualquier molestia inmediatamente',
        'Mantenerse hidratado',
        'Seguir las instrucciones del tatuador',
        'Respetar los descansos recomendados',
        'No dudar en hacer preguntas'
      ]
    },
    {
      title: 'Después del Tatuaje',
      items: [
        'Seguir las instrucciones de cuidado',
        'Mantener el área limpia y seca',
        'Evitar exposición solar directa',
        'No sumergir en agua por tiempo prolongado',
        'Contactar si hay signos de infección'
      ]
    }
  ];

  const warningSigns = [
    {
      sign: 'Enrojecimiento excesivo',
      description: 'Más allá del área tatuada o que empeora después de 2-3 días'
    },
    {
      sign: 'Hinchazón persistente',
      description: 'Que no disminuye después de 48 horas'
    },
    {
      sign: 'Fiebre',
      description: 'Temperatura corporal elevada después del procedimiento'
    },
    {
      sign: 'Secreción con mal olor',
      description: 'Cualquier descarga que tenga olor desagradable'
    },
    {
      sign: 'Líneas rojas',
      description: 'Que se extienden desde el tatuaje hacia otras partes del cuerpo'
    }
  ];

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <FiShield className="h-16 w-16 text-accent-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Seguridad y Calidad
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Tu seguridad es nuestra prioridad. Conoce nuestros estándares de calidad 
              y los protocolos que garantizan una experiencia segura
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" href="#standards">
                Ver Estándares
              </Button>
              <Button variant="outline" size="lg" href="#guidelines">
                Guías de Salud
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Quality Metrics */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Nuestros Números Hablan
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Métricas que demuestran nuestro compromiso con la calidad
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {qualityMetrics.map((metric, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <metric.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-accent-500 mb-2">
                  {metric.metric}
                </div>
                <div className="text-lg font-semibold text-primary-100 mb-2">
                  {metric.label}
                </div>
                <p className="text-primary-400 text-sm">
                  {metric.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Safety Standards */}
      <Section id="standards" className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Estándares de Seguridad
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Protocolos rigurosos que garantizan la máxima seguridad
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {safetyStandards.map((standard, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center mr-4">
                    <standard.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-100">
                      {standard.title}
                    </h3>
                    <p className="text-primary-400 text-sm">
                      {standard.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {standard.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-primary-300">
                      <FiCheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Certifications */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Certificaciones y Autorizaciones
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Cumplimos con todas las normativas nacionales e internacionales
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="p-6 text-center">
                <FiFileText className="h-12 w-12 text-accent-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {cert.name}
                </h3>
                <p className="text-primary-300 text-sm mb-3">
                  {cert.description}
                </p>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {cert.status}
                </span>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Health Guidelines */}
      <Section id="guidelines" className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Guías de Salud
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Recomendaciones para una experiencia segura y saludable
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {healthGuidelines.map((guideline, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold text-primary-100 mb-4">
                  {guideline.title}
                </h3>
                <ul className="space-y-3">
                  {guideline.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-primary-300">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Warning Signs */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Señales de Alerta
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Síntomas que requieren atención médica inmediata
            </p>
          </div>
          
          <Card className="p-8 bg-red-600/10 border-red-600/20">
            <div className="flex items-center mb-6">
              <FiAlertTriangle className="h-8 w-8 text-red-400 mr-3" />
              <h3 className="text-xl font-semibold text-primary-100">
                Busca atención médica si experimentas:
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {warningSigns.map((warning, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-3 h-3 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-primary-100 mb-1">
                      {warning.sign}
                    </h4>
                    <p className="text-primary-300 text-sm">
                      {warning.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-primary-700 rounded-lg">
              <p className="text-primary-300 text-sm">
                <strong>Importante:</strong> Ante cualquier duda sobre tu salud después de un tatuaje, 
                contacta inmediatamente a tu tatuador o busca atención médica profesional.
              </p>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Emergency Contact */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Contacto de Emergencia
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Estamos disponibles 24/7 para cualquier emergencia relacionada con nuestros servicios
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-4">
                    Línea de Emergencia
                  </h3>
                  <p className="text-primary-300 mb-4">
                    Para emergencias médicas relacionadas con tatuajes
                  </p>
                  <Button variant="primary" size="lg" href="tel:+56912345678">
                    +56 9 1234 5678
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-4">
                    Email de Emergencia
                  </h3>
                  <p className="text-primary-300 mb-4">
                    Respuesta garantizada en menos de 2 horas
                  </p>
                  <Button variant="outline" size="lg" href="mailto:emergencia@paltattoo.com">
                    emergencia@paltattoo.com
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-accent-600 to-accent-700">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Tu Seguridad es Nuestra Prioridad
            </h2>
            <p className="text-accent-100 mb-8 max-w-2xl mx-auto">
              Con PalTattoo, puedes estar seguro de que recibirás el mejor cuidado 
              y la máxima seguridad en cada procedimiento
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                href="/register"
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                Encontrar Tatuador
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                href="/contact"
                className="border-white text-white hover:bg-white hover:text-accent-600"
              >
                Contactar Soporte
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default SafetyQualityPage;