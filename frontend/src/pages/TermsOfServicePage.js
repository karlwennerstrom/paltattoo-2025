import React from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiFileText, FiShield, FiUsers, FiAlertCircle } from 'react-icons/fi';

const TermsOfServicePage = () => {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('es-CL');

  const sections = [
    {
      title: '1. Aceptación de los Términos',
      content: `
        Al acceder y utilizar la plataforma PalTattoo ("la Plataforma"), usted acepta estar sujeto a estos Términos de Servicio ("Términos"). Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
        
        Estos términos constituyen un acuerdo legal entre usted y PalTattoo SpA ("PalTattoo", "nosotros", "nos" o "nuestro"). Al registrarse en nuestra plataforma, confirma que ha leído, entendido y acepta estar sujeto a estos términos.
      `
    },
    {
      title: '2. Descripción del Servicio',
      content: `
        PalTattoo es una plataforma digital que conecta clientes que buscan servicios de tatuaje con tatuadores profesionales verificados. Nuestros servicios incluyen:
        
        • Creación de perfiles para clientes y tatuadores
        • Sistema de matching entre clientes y artistas
        • Herramientas de comunicación integradas
        • Procesamiento de pagos seguros
        • Sistema de reseñas y calificaciones
        • Gestión de citas y calendario
        
        PalTattoo actúa como intermediario y no realiza servicios de tatuaje directamente.
      `
    },
    {
      title: '3. Registro de Usuarios',
      content: `
        Para utilizar ciertos servicios de la Plataforma, debe registrarse y crear una cuenta. Al registrarse, usted se compromete a:
        
        • Proporcionar información precisa, actual y completa
        • Mantener la seguridad de sus credenciales de acceso
        • Notificar inmediatamente cualquier uso no autorizado de su cuenta
        • Ser responsable de todas las actividades que ocurran bajo su cuenta
        
        Nos reservamos el derecho de suspender o terminar cuentas que proporcionen información falsa o violen estos términos.
      `
    },
    {
      title: '4. Obligaciones de los Usuarios',
      content: `
        **Para todos los usuarios:**
        • Cumplir con todas las leyes y regulaciones aplicables
        • No utilizar la plataforma para actividades ilegales o no autorizadas
        • Mantener la confidencialidad de la información personal de otros usuarios
        • No publicar contenido ofensivo, discriminatorio o inapropiado
        
        **Para clientes:**
        • Proporcionar descripciones precisas de los servicios solicitados
        • Respetar los términos acordados con los tatuadores
        • Realizar pagos de manera oportuna según lo acordado
        
        **Para tatuadores:**
        • Mantener certificaciones y licencias profesionales vigentes
        • Proporcionar servicios de calidad profesional
        • Cumplir con todas las normativas sanitarias aplicables
        • Mantener actualizado su portfolio con trabajos reales
      `
    },
    {
      title: '5. Proceso de Verificación',
      content: `
        PalTattoo implementa un proceso de verificación para tatuadores que incluye:
        
        • Verificación de identidad
        • Validación de certificaciones profesionales
        • Revisión de portfolio y experiencia
        • Verificación de cumplimiento de normas sanitarias
        
        Los tatuadores deben mantener actualizados sus documentos de verificación. PalTattoo se reserva el derecho de re-verificar cuentas en cualquier momento.
      `
    },
    {
      title: '6. Pagos y Tarifas',
      content: `
        **Tarifas para clientes:**
        El uso de la plataforma es gratuito para clientes. Los clientes pagan directamente a los tatuadores por los servicios prestados.
        
        **Tarifas para tatuadores:**
        Los tatuadores pagan una tarifa de suscripción mensual para acceder a los servicios de la plataforma. Las tarifas actuales se encuentran en nuestra página de precios.
        
        **Procesamiento de pagos:**
        • Utilizamos procesadores de pago terceros seguros
        • Los pagos se procesan en la moneda local (CLP)
        • Mantenemos ciertos pagos en custodia hasta la finalización del servicio
        
        **Reembolsos:**
        Los reembolsos se evalúan caso por caso según nuestra política de reembolsos.
      `
    },
    {
      title: '7. Política de Cancelación',
      content: `
        **Cancelación por parte del cliente:**
        • Cancelación con más de 48 horas: Sin penalización
        • Cancelación con 24-48 horas: Puede aplicar cargo del 25%
        • Cancelación con menos de 24 horas: Puede aplicar cargo del 50%
        
        **Cancelación por parte del tatuador:**
        • Debe notificar con al menos 48 horas de anticipación
        • Debe ofrecer fechas alternativas cuando sea posible
        • Cancelaciones injustificadas pueden resultar en penalizaciones
        
        **Casos de emergencia:**
        Las cancelaciones por emergencias médicas o situaciones imprevistas se evalúan individualmente.
      `
    },
    {
      title: '8. Propiedad Intelectual',
      content: `
        **Contenido de PalTattoo:**
        Todos los derechos de propiedad intelectual de la plataforma, incluyendo pero no limitado a software, diseño, texto, gráficos y marcas comerciales, pertenecen a PalTattoo.
        
        **Contenido del usuario:**
        Los usuarios conservan los derechos sobre el contenido que publican, pero otorgan a PalTattoo una licencia para usar, mostrar y promocionar dicho contenido en la plataforma.
        
        **Respeto a la propiedad intelectual:**
        Los usuarios no deben publicar contenido que infrinja derechos de autor, marcas comerciales u otros derechos de propiedad intelectual.
      `
    },
    {
      title: '9. Privacidad y Protección de Datos',
      content: `
        La recopilación, uso y protección de datos personales se rige por nuestra Política de Privacidad, que forma parte integral de estos términos.
        
        Nos comprometemos a:
        • Proteger la información personal de los usuarios
        • Cumplir con las leyes de protección de datos aplicables
        • Usar la información solo para los propósitos declarados
        • Implementar medidas de seguridad apropiadas
        
        Para más detalles, consulte nuestra Política de Privacidad.
      `
    },
    {
      title: '10. Responsabilidades y Limitaciones',
      content: `
        **Responsabilidades de PalTattoo:**
        • Mantener la plataforma funcionando de manera razonable
        • Proteger la información personal según nuestra política de privacidad
        • Facilitar la comunicación entre usuarios
        • Proporcionar soporte técnico básico
        
        **Limitaciones:**
        • No somos responsables por la calidad de los servicios de tatuaje
        • No garantizamos la disponibilidad continua de la plataforma
        • No somos responsables por disputas entre usuarios
        • Los usuarios utilizan la plataforma bajo su propio riesgo
        
        **Exclusión de garantías:**
        La plataforma se proporciona "tal como está" sin garantías de ningún tipo.
      `
    },
    {
      title: '11. Resolución de Disputas',
      content: `
        **Proceso de mediación:**
        En caso de disputas entre usuarios, PalTattoo puede ofrecer servicios de mediación para ayudar a resolver el conflicto.
        
        **Disputas con PalTattoo:**
        Las disputas con PalTattoo se resolverán mediante:
        1. Contacto directo con nuestro equipo de soporte
        2. Mediación voluntaria si es apropiado
        3. Arbitraje según las leyes chilenas
        
        **Jurisdicción:**
        Estos términos se rigen por las leyes de Chile, y cualquier disputa legal se resolverá en los tribunales competentes de Santiago.
      `
    },
    {
      title: '12. Terminación del Servicio',
      content: `
        **Terminación por parte del usuario:**
        Los usuarios pueden terminar su cuenta en cualquier momento contactando a soporte o usando las opciones de la plataforma.
        
        **Terminación por parte de PalTattoo:**
        Podemos suspender o terminar cuentas que:
        • Violen estos términos de servicio
        • Proporcionen información falsa o fraudulenta
        • Participen en actividades ilegales
        • Pongan en riesgo la seguridad de otros usuarios
        
        **Efectos de la terminación:**
        • Los datos personales se eliminarán según nuestra política de privacidad
        • Las obligaciones financieras pendientes permanecen vigentes
        • Ciertos datos pueden conservarse por requisitos legales
      `
    },
    {
      title: '13. Modificaciones a los Términos',
      content: `
        PalTattoo se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones:
        
        • Se notificarán a los usuarios con al menos 30 días de anticipación
        • Se publicarán en la plataforma con la fecha de actualización
        • Entrarán en vigor después del período de notificación
        
        El uso continuado de la plataforma después de las modificaciones constituye aceptación de los nuevos términos.
      `
    },
    {
      title: '14. Contacto',
      content: `
        Para preguntas sobre estos términos de servicio, puede contactarnos:
        
        • Email: legal@paltattoo.com
        • Teléfono: +56 9 1234 5678
        • Dirección: Av. Providencia 1234, Santiago, Chile
        
        Nuestro equipo legal responderá a las consultas dentro de 5 días hábiles.
      `
    }
  ];

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <FiFileText className="h-16 w-16 text-accent-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Términos de Servicio
            </h1>
            <p className="text-xl text-primary-300 mb-4">
              Términos y condiciones de uso de la plataforma PalTattoo
            </p>
            <p className="text-primary-400">
              Última actualización: {lastUpdated}
            </p>
          </div>
        </Container>
      </Section>

      {/* Important Notice */}
      <Section className="py-8 bg-primary-800">
        <Container>
          <Card className="p-6 bg-yellow-600/10 border-yellow-600/20">
            <div className="flex items-start">
              <FiAlertCircle className="h-6 w-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  Importante
                </h3>
                <p className="text-primary-300 text-sm">
                  Estos términos constituyen un acuerdo legal entre usted y PalTattoo. 
                  Al usar nuestra plataforma, acepta estar sujeto a estos términos. 
                  Si no está de acuerdo, no debe utilizar nuestros servicios.
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Terms Content */}
      <Section className="py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <Card key={index} className="p-8">
                  <h2 className="text-2xl font-bold text-primary-100 mb-6">
                    {section.title}
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    {section.content.split('\n').map((paragraph, pIndex) => {
                      if (paragraph.trim() === '') return null;
                      
                      // Handle bold text
                      if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                        return (
                          <h3 key={pIndex} className="text-lg font-semibold text-primary-100 mt-6 mb-3">
                            {paragraph.replace(/\*\*/g, '')}
                          </h3>
                        );
                      }
                      
                      // Handle bullet points
                      if (paragraph.trim().startsWith('•')) {
                        return (
                          <li key={pIndex} className="text-primary-300 mb-2 ml-4">
                            {paragraph.replace('•', '').trim()}
                          </li>
                        );
                      }
                      
                      // Handle numbered lists
                      if (paragraph.trim().match(/^\d+\./)) {
                        return (
                          <li key={pIndex} className="text-primary-300 mb-2 ml-4">
                            {paragraph.trim()}
                          </li>
                        );
                      }
                      
                      // Regular paragraphs
                      return (
                        <p key={pIndex} className="text-primary-300 mb-4 leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Quick Links */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary-100 mb-4">
              Documentos Relacionados
            </h2>
            <p className="text-primary-300">
              Consulta también estos documentos importantes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <FiShield className="h-8 w-8 text-accent-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-100 mb-2">
                Política de Privacidad
              </h3>
              <p className="text-primary-300 text-sm mb-4">
                Cómo recopilamos, usamos y protegemos tu información
              </p>
              <a href="/privacy" className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                Leer Política →
              </a>
            </Card>
            
            <Card className="p-6 text-center">
              <FiUsers className="h-8 w-8 text-accent-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-100 mb-2">
                Código de Conducta
              </h3>
              <p className="text-primary-300 text-sm mb-4">
                Normas de comportamiento en nuestra comunidad
              </p>
              <a href="/conduct" className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                Ver Código →
              </a>
            </Card>
            
            <Card className="p-6 text-center">
              <FiAlertCircle className="h-8 w-8 text-accent-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-100 mb-2">
                Reportar Problema
              </h3>
              <p className="text-primary-300 text-sm mb-4">
                Informa violaciones a nuestros términos
              </p>
              <a href="/report" className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                Reportar →
              </a>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Contact Section */}
      <Section className="py-16">
        <Container>
          <Card className="p-8 text-center">
            <h3 className="text-2xl font-bold text-primary-100 mb-4">
              ¿Tienes preguntas sobre estos términos?
            </h3>
            <p className="text-primary-300 mb-6">
              Nuestro equipo legal está disponible para aclarar cualquier duda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:legal@paltattoo.com"
                className="bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-700 transition-colors"
              >
                Contactar Equipo Legal
              </a>
              <a 
                href="/contact"
                className="bg-primary-700 text-primary-100 px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Soporte General
              </a>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default TermsOfServicePage;