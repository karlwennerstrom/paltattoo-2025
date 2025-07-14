import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white border-t border-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold">PalTattoo</span>
              </div>
              <p className="text-primary-300 mb-4 max-w-md">
                La plataforma líder que conecta clientes con los mejores tatuadores profesionales. 
                Encuentra tu artista ideal y crea tu próxima obra de arte.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-primary-400 hover:text-accent-400 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-primary-400 hover:text-accent-400 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.328-1.295C4.198 14.553 3.5 13.026 3.5 11.313c0-1.714.698-3.24 1.621-4.38.88-.805 2.031-1.295 3.328-1.295 1.297 0 2.448.49 3.328 1.295.924 1.14 1.621 2.666 1.621 4.38 0 1.713-.697 3.24-1.621 4.38-.88.805-2.031 1.295-3.328 1.295zm7.598 0c-1.297 0-2.448-.49-3.328-1.295-.924-1.14-1.621-2.667-1.621-4.38 0-1.714.697-3.24 1.621-4.38.88-.805 2.031-1.295 3.328-1.295s2.448.49 3.328 1.295c.924 1.14 1.621 2.666 1.621 4.38 0 1.713-.697 3.24-1.621 4.38-.88.805-2.031 1.295-3.328 1.295z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-primary-400 hover:text-accent-400 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-primary-400 hover:text-accent-400 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/artists" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Tatuadores
                  </Link>
                </li>
                <li>
                  <Link to="/feed" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Feed
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Preguntas Frecuentes
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Términos de Servicio
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/report" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                    Reportar Problema
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* For Artists Section */}
          <div className="mt-8 pt-8 border-t border-primary-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Para Tatuadores</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/artist/register" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                      Únete como Tatuador
                    </Link>
                  </li>
                  <li>
                    <Link to="/artist/benefits" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                      Beneficios para Artistas
                    </Link>
                  </li>
                  <li>
                    <Link to="/artist/pricing" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                      Planes y Precios
                    </Link>
                  </li>
                  <li>
                    <Link to="/artist/resources" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                      Recursos para Artistas
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Para Clientes</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/how-it-works" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                      Cómo Funciona
                    </Link>
                  </li>
                  <li>
                    <Link to="/safety" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                      Seguridad y Calidad
                    </Link>
                  </li>
                  <li>
                    <Link to="/aftercare" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                      Cuidado del Tatuaje
                    </Link>
                  </li>
                  <li>
                    <Link to="/inspiration" className="text-primary-300 hover:text-accent-400 transition-colors duration-200">
                      Galería de Inspiración
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-8 pt-8 border-t border-primary-700">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold mb-4">Suscríbete a nuestro boletín</h3>
              <p className="text-primary-300 mb-4">
                Recibe las últimas noticias, ofertas especiales y contenido exclusivo.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-4 py-2 bg-primary-700 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent-600 text-white rounded-r-lg hover:bg-accent-700 transition-colors duration-200"
                >
                  Suscribirse
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-primary-400 text-sm">
              © 2024 PalTattoo. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-primary-400 hover:text-white text-sm transition-colors duration-200">
                Términos
              </Link>
              <Link to="/privacy" className="text-primary-400 hover:text-white text-sm transition-colors duration-200">
                Privacidad
              </Link>
              <Link to="/cookies" className="text-primary-400 hover:text-white text-sm transition-colors duration-200">
                Cookies
              </Link>
              <Link to="/sitemap" className="text-primary-400 hover:text-white text-sm transition-colors duration-200">
                Mapa del Sitio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;