import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiHeart, FiDroplet, FiSun, FiShield, FiClock, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import Button from '../components/common/Button';

const TattooAftercarePage = () => {
  const [activeDay, setActiveDay] = useState('1-3');

  const timelineSteps = [
    { id: '1-3', label: 'Días 1-3', title: 'Primeros Días' },
    { id: '4-14', label: 'Días 4-14', title: 'Proceso de Curación' },
    { id: '15-30', label: 'Días 15-30', title: 'Cicatrización' },
    { id: '30+', label: 'Día 30+', title: 'Cuidado Permanente' }
  ];

  const careInstructions = {
    '1-3': {
      title: 'Cuidado Inmediato (Días 1-3)',
      description: 'Los primeros días son críticos para una buena cicatrización',
      instructions: [
        'Mantén el vendaje inicial por 2-4 horas',
        'Lava suavemente con agua tibia y jabón antibacterial',
        'Seca con toques suaves usando una toalla limpia',
        'Aplica una capa fina de crema cicatrizante 2-3 veces al día',
        'Evita mojar el tatuaje por períodos largos',
        'No uses ropa que roce el tatuaje'
      ],
      warning: 'Es normal que haya algo de sangrado, hinchazón y enrojecimiento',
      products: ['Jabón antibacterial', 'Crema cicatrizante', 'Toallas limpias']
    },
    '4-14': {
      title: 'Proceso de Curación (Días 4-14)',
      description: 'Durante esta fase, el tatuaje comenzará a formar costras',
      instructions: [
        'Continúa lavando 2 veces al día',
        'Aplica crema hidratante sin fragancia',
        'NO rasques ni quites las costras',
        'Evita sumergir en agua (piscinas, bañeras)',
        'Usa ropa suelta que no roce el tatuaje',
        'Evita ejercicio intenso que cause sudoración excesiva'
      ],
      warning: 'Las costras pueden picar, pero NO las rasques',
      products: ['Crema hidratante sin fragancia', 'Ropa suelta']
    },
    '15-30': {
      title: 'Cicatrización (Días 15-30)',
      description: 'El tatuaje puede verse opaco mientras la piel se regenera',
      instructions: [
        'Mantén la piel hidratada diariamente',
        'Puedes retomar actividades normales gradualmente',
        'Evita aún la exposición solar directa',
        'Usa protector solar SPF 30+ si es necesario salir',
        'Observa cambios en color o textura',
        'Consulta a tu tatuador si tienes dudas'
      ],
      warning: 'La piel puede verse "lechosa" - esto es normal',
      products: ['Hidratante', 'Protector solar SPF 30+']
    },
    '30+': {
      title: 'Cuidado Permanente (Día 30+)',
      description: 'Cuidados para mantener tu tatuaje brillante por años',
      instructions: [
        'Hidrata la piel regularmente',
        'Usa protector solar SPF 30+ siempre',
        'Examina el tatuaje regularmente',
        'Mantén un estilo de vida saludable',
        'Programa retoques si es necesario',
        'Protege de rasguños y heridas'
      ],
      warning: 'El cuidado permanente preserva la calidad del tatuaje',
      products: ['Hidratante diario', 'Protector solar', 'Productos de calidad']
    }
  };

  const dosDonts = {
    dos: [
      'Lava tus manos antes de tocar el tatuaje',
      'Usa jabón antibacterial suave',
      'Seca con toques suaves',
      'Aplica crema en capas finas',
      'Usa ropa limpia y suelta',
      'Mantén el área hidratada',
      'Protege del sol',
      'Sigue las instrucciones del tatuador'
    ],
    donts: [
      'No rasques ni frotes el tatuaje',
      'No quites las costras',
      'No uses productos con fragancia',
      'No te bañes en piscinas o jacuzzis',
      'No hagas ejercicio intenso',
      'No expongas al sol directo',
      'No uses ropa ajustada',
      'No ignores señales de infección'
    ]
  };

  const products = [
    {
      name: 'Jabón Antibacterial',
      brand: 'Recomendado',
      price: '$2.990',
      description: 'Jabón suave sin fragancia para limpiar el tatuaje',
      rating: 4.8
    },
    {
      name: 'Crema Cicatrizante',
      brand: 'Tattoo Goo',
      price: '$8.990',
      description: 'Crema especializada para cicatrización de tatuajes',
      rating: 4.9
    },
    {
      name: 'Hidratante Sin Fragancia',
      brand: 'Aveeno',
      price: '$5.990',
      description: 'Loción hidratante para piel sensible',
      rating: 4.7
    },
    {
      name: 'Protector Solar SPF 50',
      brand: 'La Roche Posay',
      price: '$12.990',
      description: 'Protección solar específica para tatuajes',
      rating: 4.9
    }
  ];

  const warningSigns = [
    {
      sign: 'Enrojecimiento excesivo',
      description: 'Que se extiende más allá del tatuaje o empeora después de 3 días',
      severity: 'alto'
    },
    {
      sign: 'Hinchazón persistente',
      description: 'Que no disminuye después de 48 horas',
      severity: 'alto'
    },
    {
      sign: 'Fiebre',
      description: 'Temperatura corporal elevada',
      severity: 'alto'
    },
    {
      sign: 'Secreción con mal olor',
      description: 'Pus o fluido con olor desagradable',
      severity: 'alto'
    },
    {
      sign: 'Líneas rojas',
      description: 'Que se extienden desde el tatuaje',
      severity: 'alto'
    },
    {
      sign: 'Dolor intenso',
      description: 'Que empeora en lugar de mejorar',
      severity: 'medio'
    }
  ];

  const formatPrice = (price) => {
    return price;
  };

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <FiHeart className="h-16 w-16 text-accent-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Cuidado del Tatuaje
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Guía completa para cuidar tu tatuaje desde el primer día 
              hasta el cuidado permanente
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" href="#timeline">
                Ver Cronograma
              </Button>
              <Button variant="outline" size="lg" href="#products">
                Productos Recomendados
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Timeline Navigation */}
      <Section id="timeline" className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Cronograma de Cuidado
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Cada fase requiere cuidados específicos para una cicatrización óptima
            </p>
          </div>
          
          {/* Timeline Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {timelineSteps.map(step => (
              <button
                key={step.id}
                onClick={() => setActiveDay(step.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeDay === step.id
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                }`}
              >
                <FiClock className="mr-2 h-4 w-4" />
                {step.label}
              </button>
            ))}
          </div>

          {/* Timeline Content */}
          <Card className="p-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-primary-100 mb-4">
                {careInstructions[activeDay].title}
              </h3>
              <p className="text-primary-300 mb-6">
                {careInstructions[activeDay].description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-primary-100 mb-4">
                    Instrucciones:
                  </h4>
                  <ul className="space-y-3">
                    {careInstructions[activeDay].instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <FiCheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-primary-300">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-primary-100 mb-4">
                    Productos Necesarios:
                  </h4>
                  <ul className="space-y-2 mb-6">
                    {careInstructions[activeDay].products.map((product, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                        <span className="text-primary-300">{product}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiAlertTriangle className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="font-semibold text-primary-100">Nota Importante:</span>
                    </div>
                    <p className="text-primary-300 text-sm">
                      {careInstructions[activeDay].warning}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Do's and Don'ts */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Qué Hacer y Qué No Hacer
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Reglas esenciales para un cuidado exitoso
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Do's */}
            <Card className="p-6 bg-green-600/10 border-green-600/20">
              <div className="flex items-center mb-4">
                <FiCheckCircle className="h-8 w-8 text-green-400 mr-3" />
                <h3 className="text-xl font-semibold text-primary-100">
                  SÍ Haz Esto
                </h3>
              </div>
              <ul className="space-y-3">
                {dosDonts.dos.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheckCircle className="h-4 w-4 text-green-400 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-primary-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Don'ts */}
            <Card className="p-6 bg-red-600/10 border-red-600/20">
              <div className="flex items-center mb-4">
                <FiX className="h-8 w-8 text-red-400 mr-3" />
                <h3 className="text-xl font-semibold text-primary-100">
                  NO Hagas Esto
                </h3>
              </div>
              <ul className="space-y-3">
                {dosDonts.donts.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FiX className="h-4 w-4 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-primary-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Products */}
      <Section id="products" className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Productos Recomendados
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Productos probados y recomendados por tatuadores profesionales
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-primary-100 mb-2">
                  {product.name}
                </h3>
                <p className="text-primary-400 text-sm mb-2">
                  {product.brand}
                </p>
                <p className="text-primary-300 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-primary-600'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-primary-400 text-sm">({product.rating})</span>
                </div>
                <div className="text-accent-500 font-bold text-lg mb-4">
                  {formatPrice(product.price)}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Producto
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Warning Signs */}
      <Section className="py-16">
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
                Contacta a un médico inmediatamente si experimentas:
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {warningSigns.map((warning, index) => (
                <div key={index} className="flex items-start">
                  <div className={`w-3 h-3 rounded-full mt-2 mr-3 flex-shrink-0 ${
                    warning.severity === 'alto' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
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
          </Card>
        </Container>
      </Section>

      {/* Emergency Contact */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              ¿Necesitas Ayuda?
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Nuestro equipo está disponible para resolver tus dudas
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-4">
                    Consulta a tu Tatuador
                  </h3>
                  <p className="text-primary-300 mb-4">
                    Tu tatuador conoce mejor tu caso específico
                  </p>
                  <Button variant="outline" size="lg">
                    Contactar Tatuador
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-4">
                    Soporte PalTattoo
                  </h3>
                  <p className="text-primary-300 mb-4">
                    Estamos aquí para ayudarte 24/7
                  </p>
                  <Button variant="primary" size="lg" href="/support">
                    Contactar Soporte
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
              ¿Listo para tu próximo tatuaje?
            </h2>
            <p className="text-accent-100 mb-8 max-w-2xl mx-auto">
              Ahora que conoces todo sobre el cuidado, encuentra al tatuador perfecto para tu próxima obra de arte
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                href="/artists"
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                Encontrar Tatuador
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                href="/inspiration"
                className="border-white text-white hover:bg-white hover:text-accent-600"
              >
                Galería de Inspiración
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default TattooAftercarePage;