import React from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiShield, FiLock, FiEye, FiFileText, FiAlertCircle, FiMail } from 'react-icons/fi';

const PrivacyPolicyPage = () => {
  const lastUpdated = new Date('2024-01-15').toLocaleDateString('es-CL');

  const sections = [
    {
      title: '1. Información que Recopilamos',
      content: `
        **Información que nos proporcionas directamente:**
        • Datos de registro: nombre, email, teléfono, dirección
        • Información de perfil: biografía, preferencias, foto de perfil
        • Contenido que publicas: descripciones de tatuajes, imágenes, reseñas
        • Comunicaciones: mensajes, consultas de soporte
        • Información de pago: datos de tarjetas y transacciones (procesados por terceros)
        
        **Información que recopilamos automáticamente:**
        • Datos de uso: páginas visitadas, tiempo de navegación, clics
        • Información del dispositivo: tipo de dispositivo, sistema operativo, navegador
        • Datos de ubicación: ubicación aproximada basada en IP
        • Cookies y tecnologías similares
        
        **Información de terceros:**
        • Datos de redes sociales (si conectas tu cuenta)
        • Información de procesadores de pago
        • Datos de servicios de verificación
      `
    },
    {
      title: '2. Cómo Utilizamos tu Información',
      content: `
        **Servicios principales:**
        • Crear y gestionar tu cuenta
        • Facilitar la comunicación entre usuarios
        • Procesar pagos y transacciones
        • Proporcionar soporte al cliente
        • Verificar identidad de tatuadores
        
        **Mejora del servicio:**
        • Personalizar tu experiencia
        • Mejorar nuestros algoritmos de matching
        • Desarrollar nuevas funcionalidades
        • Realizar análisis de uso y rendimiento
        
        **Comunicación:**
        • Enviar notificaciones importantes
        • Comunicar actualizaciones del servicio
        • Responder a tus consultas
        • Enviar promociones (solo con tu consentimiento)
        
        **Seguridad y cumplimiento:**
        • Prevenir fraude y actividades ilegales
        • Cumplir con obligaciones legales
        • Proteger la seguridad de la plataforma
        • Resolver disputas
      `
    },
    {
      title: '3. Compartir tu Información',
      content: `
        **No vendemos tu información personal.** Solo compartimos tu información en las siguientes circunstancias:
        
        **Con otros usuarios:**
        • Información de perfil público
        • Comunicaciones directas autorizadas
        • Reseñas y calificaciones
        
        **Con proveedores de servicios:**
        • Procesadores de pago (MercadoPago, Stripe)
        • Servicios de hosting y almacenamiento
        • Herramientas de análisis y marketing
        • Servicios de soporte al cliente
        
        **Por requisitos legales:**
        • Cumplimiento de órdenes judiciales
        • Investigaciones de fraude
        • Protección de derechos y seguridad
        • Cumplimiento de regulaciones aplicables
        
        **Transferencias corporativas:**
        • Fusiones, adquisiciones o venta de activos
        • Reestructuración empresarial
        • Siempre con protección de datos
      `
    },
    {
      title: '4. Seguridad de la Información',
      content: `
        **Medidas técnicas:**
        • Encriptación SSL/TLS para todas las comunicaciones
        • Encriptación de datos sensibles en bases de datos
        • Firewalls y sistemas de detección de intrusos
        • Monitoreo continuo de seguridad
        • Copias de seguridad regulares
        
        **Medidas organizacionales:**
        • Acceso limitado a datos personales
        • Capacitación en seguridad para empleados
        • Políticas estrictas de manejo de datos
        • Revisiones regulares de seguridad
        • Procedimientos de respuesta a incidentes
        
        **Protección de cuentas:**
        • Contraseñas seguras obligatorias
        • Autenticación de dos factores disponible
        • Detección de actividad sospechosa
        • Notificaciones de seguridad automáticas
        
        **Importante:** Ningún sistema es 100% seguro. Trabajamos constantemente para mejorar nuestras medidas de seguridad.
      `
    },
    {
      title: '5. Retención de Datos',
      content: `
        **Datos de cuenta activa:**
        • Mantenemos tus datos mientras tu cuenta esté activa
        • Necesarios para proporcionar nuestros servicios
        • Actualizados según tus preferencias
        
        **Después de la eliminación de cuenta:**
        • Datos personales eliminados dentro de 30 días
        • Algunos datos pueden conservarse por requisitos legales
        • Datos anonimizados pueden mantenerse para análisis
        
        **Períodos específicos:**
        • Datos de transacciones: 7 años (requisito legal)
        • Comunicaciones de soporte: 3 años
        • Registros de seguridad: 2 años
        • Datos de marketing: hasta que retires el consentimiento
        
        **Eliminación automática:**
        • Cuentas inactivas por más de 3 años
        • Datos temporales (tokens, sesiones) según expire
        • Registros de actividad después de período determinado
      `
    },
    {
      title: '6. Tus Derechos',
      content: `
        **Derecho de acceso:**
        • Solicitar información sobre datos que tenemos
        • Obtener copia de tus datos personales
        • Conocer cómo procesamos tu información
        
        **Derecho de rectificación:**
        • Corregir datos inexactos o incompletos
        • Actualizar información desactualizada
        • Modificar preferencias de privacidad
        
        **Derecho de eliminación:**
        • Solicitar eliminación de tus datos
        • "Derecho al olvido" bajo ciertas circunstancias
        • Eliminación de cuenta completa
        
        **Derecho de portabilidad:**
        • Obtener tus datos en formato estructurado
        • Transferir datos a otro servicio
        • Facilitar cambio de plataforma
        
        **Derecho de oposición:**
        • Oponerte a ciertos tipos de procesamiento
        • Retirar consentimiento para marketing
        • Limitar uso de tus datos
        
        **Cómo ejercer tus derechos:**
        Contacta a privacy@paltattoo.com o usa las opciones en tu cuenta.
      `
    },
    {
      title: '7. Cookies y Tecnologías Similares',
      content: `
        **Tipos de cookies que usamos:**
        
        **Cookies esenciales:**
        • Autenticación de usuario
        • Preferencias de idioma
        • Configuración de seguridad
        • Funcionamiento básico del sitio
        
        **Cookies de rendimiento:**
        • Análisis de uso del sitio
        • Métricas de rendimiento
        • Optimización de la experiencia
        • Detección de errores
        
        **Cookies de funcionalidad:**
        • Recordar preferencias
        • Personalización de contenido
        • Configuración de privacidad
        • Historial de navegación
        
        **Cookies de marketing:**
        • Publicidad personalizada (solo con consentimiento)
        • Seguimiento de conversiones
        • Análisis de campañas
        • Remarketing
        
        **Control de cookies:**
        Puedes gestionar cookies en la configuración de tu navegador o en nuestro panel de preferencias.
      `
    },
    {
      title: '8. Menores de Edad',
      content: `
        **Restricción de edad:**
        • Nuestros servicios están destinados a mayores de 18 años
        • No recopilamos intencionalmente datos de menores
        • Verificamos edad durante el registro
        
        **Si eres menor de 18 años:**
        • No debes usar nuestros servicios
        • No proporciones información personal
        • Consulta con tus padres antes de usar internet
        
        **Si descubrimos datos de menores:**
        • Eliminaremos la información inmediatamente
        • Suspenderemos la cuenta
        • Notificaremos a los padres si es posible
        
        **Padres y tutores:**
        Si crees que tu hijo menor de edad ha proporcionado información personal, contacta inmediatamente a privacy@paltattoo.com.
      `
    },
    {
      title: '9. Transferencias Internacionales',
      content: `
        **Ubicación de datos:**
        • Principales servidores ubicados en Chile
        • Algunos servicios pueden usar proveedores internacionales
        • Datos siempre protegidos con medidas adecuadas
        
        **Protecciones para transferencias:**
        • Acuerdos de transferencia de datos
        • Certificaciones de privacidad
        • Cláusulas contractuales estándar
        • Evaluación de nivel de protección
        
        **Proveedores internacionales:**
        • Amazon Web Services (hosting)
        • Google Analytics (análisis)
        • Stripe (procesamiento de pagos)
        • Todos con adecuadas protecciones de datos
        
        **Tus derechos:**
        • Derecho a conocer ubicación de tus datos
        • Derecho a oponerte a transferencias
        • Derecho a protecciones adicionales
      `
    },
    {
      title: '10. Actualizaciones de Política',
      content: `
        **Modificaciones:**
        • Podemos actualizar esta política ocasionalmente
        • Cambios significativos notificados con 30 días de anticipación
        • Cambios menores actualizados en el sitio
        
        **Notificación de cambios:**
        • Email a usuarios registrados
        • Notificación en la plataforma
        • Actualización de fecha en esta página
        
        **Revisión regular:**
        • Revisamos esta política anualmente
        • Adaptamos a cambios legales
        • Mejoramos claridad y transparencia
        
        **Historial de versiones:**
        • Mantenemos registro de cambios principales
        • Disponible bajo solicitud
        • Transparencia en evolución de políticas
      `
    },
    {
      title: '11. Contacto',
      content: `
        **Oficial de Privacidad:**
        • Email: privacy@paltattoo.com
        • Teléfono: +56 9 1234 5678
        • Dirección: Av. Providencia 1234, Santiago, Chile
        
        **Soporte General:**
        • Email: soporte@paltattoo.com
        • Chat en vivo disponible en la plataforma
        • Formulario de contacto en el sitio web
        
        **Tiempos de respuesta:**
        • Consultas de privacidad: 5 días hábiles
        • Solicitudes de datos: 30 días
        • Emergencias de seguridad: 24 horas
        
        **Autoridad de Control:**
        Si no estás satisfecho con nuestras respuestas, puedes contactar a la autoridad de protección de datos de Chile.
      `
    }
  ];

  const dataTypes = [
    { icon: FiFileText, type: 'Información de Perfil', desc: 'Nombre, email, foto, biografía' },
    { icon: FiLock, type: 'Datos de Autenticación', desc: 'Contraseñas, tokens, sesiones' },
    { icon: FiEye, type: 'Comportamiento de Uso', desc: 'Páginas visitadas, clics, tiempo' },
    { icon: FiMail, type: 'Comunicaciones', desc: 'Mensajes, emails, notificaciones' },
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
              Política de Privacidad
            </h1>
            <p className="text-xl text-primary-300 mb-4">
              Cómo recopilamos, usamos y protegemos tu información personal
            </p>
            <p className="text-primary-400">
              Última actualización: {lastUpdated}
            </p>
          </div>
        </Container>
      </Section>

      {/* Privacy Overview */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Resumen de Privacidad
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Tu privacidad es fundamental para nosotros. Aquí te explicamos los puntos clave.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataTypes.map((item, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <item.icon className="h-8 w-8 text-accent-500" />
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {item.type}
                </h3>
                <p className="text-primary-300 text-sm">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Key Principles */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Nuestros Principios
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Los valores que guían nuestro manejo de datos personales
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                Transparencia
              </h3>
              <p className="text-primary-300">
                Te explicamos claramente qué datos recopilamos y cómo los usamos
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                Seguridad
              </h3>
              <p className="text-primary-300">
                Implementamos las mejores prácticas para proteger tu información
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiEye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary-100 mb-2">
                Control
              </h3>
              <p className="text-primary-300">
                Tienes control sobre tus datos y puedes modificarlos o eliminarlos
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Important Notice */}
      <Section className="py-8 bg-primary-800">
        <Container>
          <Card className="p-6 bg-blue-600/10 border-blue-600/20">
            <div className="flex items-start">
              <FiAlertCircle className="h-6 w-6 text-blue-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  Información Importante
                </h3>
                <p className="text-primary-300 text-sm">
                  Esta política describe cómo PalTattoo recopila, usa y protege tu información personal. 
                  Al usar nuestros servicios, aceptas las prácticas descritas en esta política. 
                  Si no estás de acuerdo, por favor no uses nuestros servicios.
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Policy Content */}
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

      {/* Quick Actions */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary-100 mb-4">
              Gestiona tu Privacidad
            </h2>
            <p className="text-primary-300">
              Herramientas para controlar tu información personal
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <FiEye className="h-8 w-8 text-accent-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-100 mb-2">
                Ver mis Datos
              </h3>
              <p className="text-primary-300 text-sm mb-4">
                Solicita una copia de toda la información que tenemos sobre ti
              </p>
              <a href="mailto:privacy@paltattoo.com?subject=Solicitud de Datos" className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                Solicitar Datos →
              </a>
            </Card>
            
            <Card className="p-6 text-center">
              <FiFileText className="h-8 w-8 text-accent-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-100 mb-2">
                Corregir Información
              </h3>
              <p className="text-primary-300 text-sm mb-4">
                Actualiza o corrige información inexacta en tu perfil
              </p>
              <a href="/profile" className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                Ir a Perfil →
              </a>
            </Card>
            
            <Card className="p-6 text-center">
              <FiShield className="h-8 w-8 text-accent-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-100 mb-2">
                Eliminar Cuenta
              </h3>
              <p className="text-primary-300 text-sm mb-4">
                Elimina permanentemente tu cuenta y todos los datos asociados
              </p>
              <a href="/settings" className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                Configuración →
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
              ¿Tienes preguntas sobre privacidad?
            </h3>
            <p className="text-primary-300 mb-6">
              Nuestro equipo de privacidad está aquí para ayudarte
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:privacy@paltattoo.com"
                className="bg-accent-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-700 transition-colors"
              >
                Contactar Privacidad
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

export default PrivacyPolicyPage;