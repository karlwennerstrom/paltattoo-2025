import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user, isAdmin, isArtist, isClient } = useAuth();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Redirect logged users to their dashboards
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    } else if (isArtist) {
      navigate('/artist', { replace: true });
    } else if (isClient) {
      navigate('/client/dashboard', { replace: true });
    }
  }, [isAdmin, isArtist, isClient, navigate]);

  const testimonials = [
    {
      name: "María González",
      role: "Cliente",
      text: "Encontré al artista perfecto para mi primer tatuaje. La plataforma me ayudó a comparar propuestas y elegir el mejor precio."
    },
    {
      name: "Carlos Mendoza",
      role: "Tatuador",
      text: "Como artista, PalTattoo me ha permitido conectar con más clientes y hacer crecer mi negocio. Los pagos son seguros y rápidos."
    },
    {
      name: "Ana Ruiz",
      role: "Cliente",
      text: "El proceso fue súper fácil. Publiqué mi idea, recibí varias propuestas y ahora tengo el tatuaje de mis sueños."
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
      if (user.user_type === 'artist') {
        navigate('/artist');
      } else {
        navigate('/client/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Compact and Centered */}
      <section className="relative pt-20 pb-16 px-4">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-500/3 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo/Brand */}
            <div className="mb-6">
              <img 
                src="/paltattoo-icono.png" 
                alt="PalTattoo" 
                className="h-12 w-12 mx-auto mb-3 opacity-90"
              />
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                PalTattoo
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl md:text-3xl font-medium mb-4 text-primary-100">
              La plataforma que conecta artistas del tatuaje con clientes
            </h2>

            {/* Subtitle */}
            <p className="text-lg text-primary-400 mb-8 max-w-2xl mx-auto">
              Encuentra tu tatuador ideal o conecta con nuevos clientes. 
              Proceso transparente, pagos seguros.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                variant="primary"
                onClick={handleGetStarted}
                className="px-8 py-3 text-base"
              >
                {user ? 'Ir al Dashboard' : 'Comenzar Ahora'}
              </Button>
              
              <Link to="/how-it-works">
                <Button
                  variant="ghost"
                  className="px-8 py-3 text-base"
                >
                  Cómo Funciona
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-primary-400">500+ artistas verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-primary-400">2000+ tatuajes realizados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-primary-400">4.9/5 satisfacción</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Compact */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-primary-400 max-w-2xl mx-auto">
              Herramientas profesionales para artistas y clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* For Clients */}
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Busca artistas</h3>
              <p className="text-sm text-primary-400">
                Encuentra tatuadores especializados en tu estilo preferido
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Compara precios</h3>
              <p className="text-sm text-primary-400">
                Recibe propuestas transparentes y elige la mejor opción
              </p>
            </div>

            {/* For Artists */}
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Más clientes</h3>
              <p className="text-sm text-primary-400">
                Accede a una red creciente de personas buscando tatuajes
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Pagos seguros</h3>
              <p className="text-sm text-primary-400">
                Sistema de escrow que protege a ambas partes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* For Clients */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Para Clientes</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Publica tu idea</h4>
                    <p className="text-sm text-primary-400">
                      Describe tu tatuaje ideal y establece tu presupuesto
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Recibe propuestas</h4>
                    <p className="text-sm text-primary-400">
                      Artistas te envían propuestas con precios y diseños
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-400 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Elige y agenda</h4>
                    <p className="text-sm text-primary-400">
                      Selecciona tu favorita y coordina tu cita
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Publicar mi idea
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Artists */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Para Artistas</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Crea tu perfil</h4>
                    <p className="text-sm text-primary-400">
                      Muestra tu portfolio y especialidades
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Envía propuestas</h4>
                    <p className="text-sm text-primary-400">
                      Responde a solicitudes que coincidan con tu estilo
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-400 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Gestiona tu negocio</h4>
                    <p className="text-sm text-primary-400">
                      Agenda citas y recibe pagos de forma segura
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/join-artist">
                  <Button variant="outline" size="sm">
                    Unirme como artista
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Compact */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Lo que dicen nuestros usuarios
            </h2>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-400 font-bold">
                    {testimonials[currentTestimonial].name[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <blockquote className="text-primary-200 mb-4">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div className="text-sm">
                    <div className="font-medium">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-primary-400">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTestimonial 
                      ? 'bg-accent-500' 
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simple */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Listo para empezar?
          </h2>
          
          <p className="text-lg text-primary-400 mb-8 max-w-2xl mx-auto">
            Únete a la comunidad de tatuajes más grande de Chile
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              onClick={handleGetStarted}
              className="px-8 py-3"
            >
              {user ? 'Ir al Dashboard' : 'Comenzar Gratis'}
            </Button>
            
            {!user && (
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="px-8 py-3"
                >
                  Ya tengo cuenta
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;