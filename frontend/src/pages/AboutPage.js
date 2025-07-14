import React from 'react';
import { Container, Section, Card, Stack } from '../components/common/Layout';
import { FiUsers, FiStar, FiShield, FiHeart, FiTarget, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const stats = [
    { icon: FiUsers, value: '1,000+', label: 'Tatuadores Registrados' },
    { icon: FiStar, value: '50,000+', label: 'Tatuajes Realizados' },
    { icon: FiShield, value: '99.9%', label: 'Satisfacción del Cliente' },
    { icon: FiHeart, value: '100,000+', label: 'Usuarios Activos' },
  ];

  const team = [
    {
      name: 'Carlos Mendoza',
      role: 'CEO & Fundador',
      bio: 'Ex-tatuador con 15 años de experiencia, apasionado por conectar artistas con clientes.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'María González',
      role: 'Directora de Arte',
      bio: 'Diseñadora gráfica especializada en arte corporal y experiencia de usuario.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Diego Ramírez',
      role: 'CTO',
      bio: 'Ingeniero en sistemas con experiencia en plataformas de marketplace.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Ana Herrera',
      role: 'Directora de Operaciones',
      bio: 'Experta en gestión de comunidades y relaciones con artistas.',
      image: '/api/placeholder/150/150'
    },
  ];

  const values = [
    {
      icon: FiTarget,
      title: 'Misión',
      description: 'Conectar a personas que buscan tatuajes únicos con artistas talentosos, creando una comunidad segura y confiable donde el arte corporal florece.'
    },
    {
      icon: FiEye,
      title: 'Visión',
      description: 'Ser la plataforma líder en América Latina para el arte del tatuaje, transformando la forma en que las personas descubren y se conectan con artistas.'
    },
    {
      icon: FiHeart,
      title: 'Valores',
      description: 'Calidad, seguridad, respeto, creatividad y comunidad son los pilares que guían cada decisión que tomamos en PalTattoo.'
    },
  ];

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Acerca de PalTattoo
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Somos la plataforma que conecta a personas apasionadas por el arte del tatuaje 
              con los mejores artistas profesionales de Chile y América Latina.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-accent-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-700 transition-colors"
              >
                Únete a Nosotros
              </Link>
              <Link
                to="/artists"
                className="bg-primary-700 text-primary-100 px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Conoce a Nuestros Artistas
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-accent-500" />
                </div>
                <div className="text-3xl font-bold text-primary-100 mb-2">{stat.value}</div>
                <div className="text-primary-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Mission, Vision, Values */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Nuestra Propuesta
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Conoce lo que nos motiva y hacia dónde nos dirigimos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <value.icon className="h-12 w-12 text-accent-500" />
                </div>
                <h3 className="text-xl font-semibold text-primary-100 mb-4">{value.title}</h3>
                <p className="text-primary-300 leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Our Story */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary-100 mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-primary-300">
                <p>
                  PalTattoo nació en 2023 de la pasión por el arte del tatuaje y la necesidad 
                  de crear un espacio seguro donde artistas y clientes pudieran conectar de manera eficiente.
                </p>
                <p>
                  Fundada por tatuadores y entusiastas del arte corporal, nuestra plataforma 
                  entiende las necesidades reales tanto de artistas como de clientes.
                </p>
                <p>
                  Hemos crecido hasta convertirnos en la comunidad más grande de arte del tatuaje 
                  en Chile, con presencia en múltiples países de América Latina.
                </p>
                <p>
                  Nuestro compromiso es seguir innovando para hacer que el proceso de encontrar 
                  y crear arte corporal sea más accesible, seguro y satisfactorio para todos.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/api/placeholder/500/400"
                alt="Nuestra historia"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-600/20 to-primary-600/20 rounded-lg"></div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <Section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Conoce a las personas apasionadas que hacen posible PalTattoo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-primary-100 mb-2">{member.name}</h3>
                <p className="text-accent-400 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-primary-400 text-sm">{member.bio}</p>
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
              ¿Listo para Comenzar?
            </h2>
            <p className="text-accent-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de personas que ya encontraron su tatuaje perfecto en PalTattoo
            </p>
            <Link
              to="/register"
              className="bg-white text-accent-600 px-8 py-3 rounded-lg font-semibold hover:bg-accent-50 transition-colors"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default AboutPage;