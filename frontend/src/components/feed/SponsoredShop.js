import React from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const SponsoredShop = ({ shop, className = '' }) => {
  return (
    <div className={twMerge('card p-4 hover:shadow-tattoo-md transition-shadow', className)}>
      <Link to={`/shops/${shop.id}`} className="block">
        {/* Shop header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <img
              src={shop.logo || '/placeholder-shop.jpg'}
              alt={shop.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            {shop.verified && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-accent-500 rounded-full flex items-center justify-center">
                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-primary-100">{shop.name}</h4>
            <p className="text-xs text-primary-400">{shop.location}</p>
          </div>
        </div>

        {/* Shop stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <p className="text-lg font-semibold text-accent-400">{shop.artistsCount || 0}</p>
            <p className="text-xs text-primary-500">Artistas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-accent-400">{shop.rating || '5.0'}</p>
            <p className="text-xs text-primary-500">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-accent-400">{shop.yearsActive || '5+'}</p>
            <p className="text-xs text-primary-500">Años</p>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {shop.specialties?.slice(0, 3).map((specialty, index) => (
            <span key={index} className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded">
              {specialty}
            </span>
          ))}
          {shop.specialties?.length > 3 && (
            <span className="px-2 py-1 text-primary-400 text-xs">
              +{shop.specialties.length - 3} más
            </span>
          )}
        </div>

        {/* Promo */}
        {shop.promo && (
          <div className="p-2 bg-accent-600 bg-opacity-10 border border-accent-600 border-opacity-20 rounded text-center">
            <p className="text-xs text-accent-400 font-medium">{shop.promo}</p>
          </div>
        )}

        {/* Sponsored badge */}
        <div className="mt-3 flex items-center justify-center space-x-1 text-xs text-primary-500">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>Patrocinado</span>
        </div>
      </Link>
    </div>
  );
};

export default SponsoredShop;