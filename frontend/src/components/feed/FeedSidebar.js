import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Layout';
import FilterPanel from './FilterPanel';
import SponsoredShop from './SponsoredShop';

const FeedSidebar = ({ filters, onFilterChange, sponsoredShops = [], className = '' }) => {
  // Mock sponsored shops for demo
  const demoShops = sponsoredShops.length > 0 ? sponsoredShops : [
    {
      id: 1,
      name: 'Ink Masters Studio',
      location: 'Providencia, Santiago',
      logo: null,
      verified: true,
      artistsCount: 12,
      rating: 4.9,
      yearsActive: 8,
      specialties: ['Realismo', 'Black & Grey', 'Retratos', 'Neo-tradicional'],
      promo: '20% desc. primera sesión',
    },
    {
      id: 2,
      name: 'Sacred Art Tattoo',
      location: 'Las Condes, Santiago',
      logo: null,
      verified: true,
      artistsCount: 8,
      rating: 4.8,
      yearsActive: 5,
      specialties: ['Japonés', 'Oriental', 'Geométrico'],
      promo: 'Consulta gratis',
    },
    {
      id: 3,
      name: 'Electric Needle',
      location: 'Ñuñoa, Santiago',
      logo: null,
      verified: false,
      artistsCount: 6,
      rating: 4.7,
      yearsActive: 3,
      specialties: ['Minimalista', 'Linework', 'Dotwork'],
      promo: null,
    },
  ];

  return (
    <div className={twMerge('space-y-6', className)}>
      {/* Filters section */}
      <Card title="Filtros" className="sticky top-20">
        <FilterPanel
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </Card>

      {/* Sponsored shops section */}
      {demoShops.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-primary-100 mb-4">
            Estudios Destacados
          </h3>
          <div className="space-y-4">
            {demoShops.map((shop) => (
              <SponsoredShop key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      )}

      {/* Additional CTAs */}
      <Card className="text-center">
        <h4 className="text-sm font-semibold text-primary-100 mb-2">
          ¿Eres artista tatuador?
        </h4>
        <p className="text-xs text-primary-400 mb-4">
          Únete a nuestra comunidad y conecta con miles de clientes
        </p>
        <a
          href="/register?type=artist"
          className="inline-block w-full px-4 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 transition-colors"
        >
          Registrarse como Artista
        </a>
      </Card>

      {/* Newsletter */}
      <Card className="bg-gradient-to-br from-accent-600 to-accent-700">
        <h4 className="text-sm font-semibold text-white mb-2">
          Newsletter
        </h4>
        <p className="text-xs text-white text-opacity-90 mb-4">
          Recibe las mejores ofertas y novedades del mundo del tatuaje
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="tu@email.com"
            className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-sm text-white placeholder-white placeholder-opacity-70 focus:bg-opacity-30 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-white text-accent-600 text-sm font-medium rounded hover:bg-opacity-90 transition-all"
          >
            Suscribirse
          </button>
        </form>
      </Card>
    </div>
  );
};

export default FeedSidebar;