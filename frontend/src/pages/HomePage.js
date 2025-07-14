import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { PageContainer } from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "María González",
      role: "Cliente",
      image: null,
      text: "Encontré al artista perfecto para mi primer tatuaje. La plataforma me ayudó a comparar propuestas y elegir el mejor precio."
    },
    {
      name: "Carlos Mendoza",
      role: "Tatuador",
      image: null,
      text: "Como artista, PalTattoo me ha permitido conectar con más clientes y hacer crecer mi negocio. Los pagos son seguros y rápidos."
    },
    {
      name: "Ana Ruiz",
      role: "Cliente",
      image: null,
      text: "El proceso fue súper fácil. Publiqué mi idea, recibí varias propuestas y ahora tengo el tatuaje de mis sueños."
    }
  ];

  const features = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Encuentra tu artista ideal",
      description: "Conecta con tatuadores especializados en tu estilo preferido en tu área."
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "Compara precios transparentes",
      description: "Recibe múltiples propuestas y elige la que mejor se adapte a tu presupuesto."
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Proceso seguro",
      description: "Perfiles verificados, reseñas reales y sistema de pagos protegido."
    }
  ];

  const artistBenefits = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Más clientes",
      description: "Accede a una red creciente de personas buscando tatuajes únicos."
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: "Haz crecer tu negocio",
      description: "Herramientas para gestionar citas, portfolio y facturación en un solo lugar."
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "Pagos garantizados",
      description: "Sistema de escrow que protege tanto a artistas como clientes."
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    if (user) {
      // Redirect based on user type
      if (user.user_type === 'artist') {
        navigate('/artist/dashboard');
      } else {
        navigate('/feed');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent-500/5 to-transparent rounded-full animate-spin-slow"></div>
        </div>

        {/* Content */}
        <PageContainer className="relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="mb-8">
              <img 
                src="/paltattoo-icono.png" 
                alt="PalTattoo" 
                className="h-20  mx-auto mb-4 drop-shadow-neon"
              />
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-white via-accent-400 to-white bg-clip-text text-transparent">
                PalTattoo
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Conecta con{' '}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                tatuadores <br></br>
              </span>{' '}
              crea{' '}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                arte único
              </span>
              <br />
              paga justo
            </h2>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-primary-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Encuentra tatuadores o conecta con clientes. Gratis, seguro y transparente.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                variant="primary"
                size="xl"
                onClick={handleGetStarted}
                className="w-full sm:w-auto text-lg px-12 py-4 shadow-neon-lg hover:shadow-neon-xl"
              >
                {user ? 'Ir al Dashboard' : 'Comenzar Ahora'}
                <svg className="ml-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              
              <Link to="/how-it-works">
                <Button
                  variant="ghost"
                  size="xl"
                  className="w-full sm:w-auto text-lg px-12 py-4 border border-white/20 hover:border-accent-500/50"
                >
                  Cómo Funciona
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { number: "500+", label: "Artistas Verificados" },
                { number: "2000+", label: "Tatuajes Realizados" },
                { number: "4.9/5", label: "Calificación Promedio" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-400 mb-2">{stat.number}</div>
                  <div className="text-primary-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* How It Works - For Clients */}
      <section className="py-12 bg-gradient-to-b from-black to-primary-950">
        <PageContainer>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Para{' '}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                Clientes
              </span>
            </h2>
            <p className="text-xl text-primary-300 max-w-2xl mx-auto">
              Encuentra el artista perfecto para tu próximo tatuaje en 3 simples pasos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {[
              {
                step: "01",
                title: "Publica tu idea",
                description: "Describe tu tatuaje ideal, sube referencias y establece tu presupuesto.",
                icon: (
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )
              },
              {
                step: "02",
                title: "Recibe propuestas",
                description: "Artistas especializados te enviarán propuestas personalizadas con precios y tiempos.",
                icon: (
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                )
              },
              {
                step: "03",
                title: "Elige y agenda",
                description: "Compara propuestas, elige tu favorita y agenda tu cita de forma segura.",
                icon: (
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-500/20 to-accent-600/10 rounded-full flex items-center justify-center border border-accent-500/30 group-hover:border-accent-500/60 transition-all duration-300">
                    <div className="text-accent-400 group-hover:text-accent-300 transition-colors">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-neon">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-accent-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-primary-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="shadow-neon">
                Publica tu Primera Idea
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* For Artists */}
      <section className="py-12 bg-gradient-to-b from-primary-950 to-black">
        <PageContainer>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Para{' '}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                Artistas
              </span>
            </h2>
            <p className="text-xl text-primary-300 max-w-2xl mx-auto">
              Haz crecer tu negocio conectando con más clientes y gestionando todo en un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {artistBenefits.map((benefit, index) => (
              <div key={index} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 hover:border-accent-500/30 transition-all duration-300 group">
                <div className="text-accent-400 mb-6 group-hover:text-accent-300 transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {benefit.title}
                </h3>
                <p className="text-primary-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/join-artist">
              <Button variant="outline" size="lg" className="shadow-neon">
                Únete como Artista
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-b from-black to-primary-950">
        <PageContainer>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Por qué elegir{' '}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                PalTattoo?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent-500/20 to-accent-600/10 rounded-full flex items-center justify-center border border-accent-500/30 group-hover:border-accent-500/60 transition-all duration-300">
                  <div className="text-accent-400 group-hover:text-accent-300 transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-accent-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-primary-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gradient-to-b from-primary-950 to-black">
        <PageContainer>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Lo que dicen nuestros{' '}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                usuarios
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 md:p-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-accent-500/20 to-accent-600/10 rounded-full flex items-center justify-center border border-accent-500/30">
                  <span className="text-2xl font-bold text-accent-400">
                    {testimonials[currentTestimonial].name[0]}
                  </span>
                </div>
                
                <blockquote className="text-xl md:text-2xl text-primary-200 mb-8 leading-relaxed italic">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div>
                  <div className="font-semibold text-white text-lg">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-accent-400">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial 
                      ? 'bg-accent-500' 
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-b from-black to-primary-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
        </div>

        <PageContainer className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para encontrar tu{' '}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                artista ideal?
              </span>
            </h2>
            
            <p className="text-xl text-primary-300 mb-12 leading-relaxed">
              Únete a la comunidad de tatuajes más grande de Chile. 
              Conecta, crea y vive el arte en tu piel.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                variant="primary"
                size="xl"
                onClick={handleGetStarted}
                className="w-full sm:w-auto text-lg px-12 py-4 shadow-neon-lg hover:shadow-neon-xl"
              >
                {user ? 'Ir al Dashboard' : 'Comenzar Gratis'}
              </Button>
              
              {!user && (
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="xl"
                    className="w-full sm:w-auto text-lg px-12 py-4 border border-white/20 hover:border-accent-500/50"
                  >
                    Ya tengo cuenta
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default HomePage;