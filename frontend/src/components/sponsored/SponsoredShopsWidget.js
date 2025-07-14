import React, { useState, useEffect } from 'react';
import { Card } from '../common/Layout';
import { FiStar, FiMapPin, FiPhone, FiGlobe, FiInstagram, FiExternalLink, FiShoppingBag } from 'react-icons/fi';
import { sponsoredShopsService } from '../../services/api';
import toast from 'react-hot-toast';

const SponsoredShopsWidget = ({ limit = 3 }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedShops();
  }, [limit]);

  const loadFeaturedShops = async () => {
    try {
      setLoading(true);
      const response = await sponsoredShopsService.getFeatured(limit);
      setShops(response.data);
    } catch (error) {
      console.error('Error loading featured shops:', error);
      toast.error('Error al cargar las tiendas destacadas');
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = async (shop) => {
    try {
      await sponsoredShopsService.trackClick(shop.id);
      if (shop.website) {
        window.open(shop.website, '_blank');
      }
    } catch (error) {
      console.error('Error tracking shop click:', error);
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <FiShoppingBag className="text-accent-500" size={18} />
          <h3 className="text-sm font-semibold text-primary-100">Tiendas Destacadas</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-primary-600 rounded mb-2"></div>
              <div className="h-3 bg-primary-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (shops.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FiShoppingBag className="text-accent-500" size={18} />
        <h3 className="text-sm font-semibold text-primary-100">Tiendas Destacadas</h3>
      </div>
      
      <div className="space-y-4">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="group cursor-pointer p-3 rounded-lg bg-primary-700 hover:bg-primary-600 transition-all duration-200"
            onClick={() => handleShopClick(shop)}
          >
            <div className="flex items-start space-x-3">
              {shop.logo_url && (
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-primary-100 truncate group-hover:text-accent-400 transition-colors">
                    {shop.name}
                  </h4>
                  <FiExternalLink className="text-primary-400 group-hover:text-accent-400 transition-colors" size={12} />
                </div>
                
                <p className="text-xs text-primary-400 mt-1 line-clamp-2">
                  {shop.description}
                </p>
                
                <div className="flex items-center space-x-3 mt-2">
                  {shop.avg_rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <FiStar className="text-yellow-400 fill-current" size={12} />
                      <span className="text-xs text-primary-300">
                        {shop.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="text-primary-400" size={12} />
                    <span className="text-xs text-primary-400">
                      {shop.city}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  {shop.phone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${shop.phone}`, '_self');
                      }}
                      className="text-primary-400 hover:text-accent-400 transition-colors"
                    >
                      <FiPhone size={12} />
                    </button>
                  )}
                  
                  {shop.website && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShopClick(shop);
                      }}
                      className="text-primary-400 hover:text-accent-400 transition-colors"
                    >
                      <FiGlobe size={12} />
                    </button>
                  )}
                  
                  {shop.instagram && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://instagram.com/${shop.instagram.replace('@', '')}`, '_blank');
                      }}
                      className="text-primary-400 hover:text-accent-400 transition-colors"
                    >
                      <FiInstagram size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-primary-600">
        <button
          onClick={() => {
            // Navigate to full shops page
            window.location.href = '/shops';
          }}
          className="w-full text-xs text-accent-400 hover:text-accent-300 transition-colors text-center"
        >
          Ver todas las tiendas →
        </button>
      </div>
    </Card>
  );
};

export default SponsoredShopsWidget;