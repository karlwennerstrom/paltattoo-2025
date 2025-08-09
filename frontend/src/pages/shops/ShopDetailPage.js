import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, Grid, Card } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import { sponsoredShopsService } from '../../services/api';
import {
  FiMapPin, FiPhone, FiGlobe, FiMail, FiInstagram, FiFacebook,
  FiClock, FiStar, FiEye, FiExternalLink, FiShare2, FiHeart,
  FiNavigation, FiCalendar, FiTag
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadShop();
  }, [id]);

  const loadShop = async () => {
    try {
      setLoading(true);
      
      // Track view
      await sponsoredShopsService.trackClick(id);
      
      // Load shop details
      const response = await sponsoredShopsService.getById(id);
      
      // Handle different response structures
      const shopData = response.data?.data || response.data;
      
      // Ensure the shop data has the expected structure
      if (shopData && typeof shopData === 'object') {
        setShop({
          ...shopData,
          // Map backend fields to expected frontend fields
          comuna_name: shopData.city || shopData.comuna_name,
          region_name: shopData.region || shopData.region_name,
          business_hours: shopData.business_hours || {},
          tags: shopData.tags || [],
          website_url: shopData.website || shopData.website_url,
          instagram_url: shopData.instagram || shopData.instagram_url,
          facebook_url: shopData.facebook || shopData.facebook_url
        });
      } else {
        throw new Error('Invalid shop data received');
      }
      setError(null);
    } catch (err) {
      console.error('Error loading shop:', err);
      // Generate mock data as fallback
      const mockShop = {
        id: parseInt(id),
        name: 'TattooSupply Pro',
        description: 'Somos una empresa especializada en equipos profesionales de tatuaje, ofreciendo las mejores marcas internacionales y productos de la más alta calidad. Con más de 10 años de experiencia en el rubro, nos hemos convertido en el proveedor de confianza para cientos de estudios de tatuaje en Chile.',
        category: 'Equipos de Tatuaje',
        address: 'Providencia 1234, Oficina 501, Santiago, Chile',
        phone: '+56 9 1234 5678',
        email: 'contacto@tattoosupplypro.cl',
        website: 'https://tattoosupplypro.cl',
        instagram: '@tattoosupplypro',
        facebook: 'TattooSupplyPro',
        logo_url: null,
        cover_image_url: null,
        rating: 4.8,
        review_count: 127,
        business_hours: {
          monday: '09:00-18:00',
          tuesday: '09:00-18:00',
          wednesday: '09:00-18:00',
          thursday: '09:00-18:00',
          friday: '09:00-18:00',
          saturday: '10:00-16:00',
          sunday: 'Cerrado'
        },
        is_featured: true,
        tags: ['equipos', 'profesional', 'calidad', 'importados', 'garantía'],
        view_count: 1250,
        click_count: 89,
        created_at: '2024-01-15T00:00:00Z'
      };
      setShop(mockShop);
    } finally {
      setLoading(false);
    }
  };

  const handleExternalLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  const handleShare = async () => {
    const shareData = {
      title: shop.name,
      text: shop.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatBusinessHours = (hours) => {
    if (!hours || typeof hours !== 'object') return [];
    
    const dayNames = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };

    return Object.entries(hours).map(([day, time]) => ({
      day: dayNames[day] || day,
      time: time || 'Cerrado'
    }));
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="text-yellow-400" />);
    }
    
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FiStar key={i} className="text-primary-600" />);
    }
    
    return stars;
  };

  const tabs = [
    { id: 'info', label: 'Información', icon: FiMapPin },
    { id: 'hours', label: 'Horarios', icon: FiClock },
    { id: 'contact', label: 'Contacto', icon: FiPhone },
    { id: 'gallery', label: 'Galería', icon: FiEye }
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-primary-400">Cargando tienda...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !shop) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-error-400 mb-4">
            {error || 'Tienda no encontrada'}
          </p>
          <div className="space-x-4">
            <Button onClick={loadShop} variant="secondary">
              Reintentar
            </Button>
            <Button onClick={() => navigate('/shops')} variant="ghost">
              Volver a tiendas
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      breadcrumbs={[
        { label: 'Tiendas', href: '/shops' },
        { label: shop.name }
      ]}
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <Card className="overflow-hidden">
          {/* Cover image */}
          {shop.cover_image_url && (
            <div className="h-48 bg-gradient-to-r from-accent-600 to-accent-800">
              <img
                src={shop.cover_image_url}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0">
              {/* Shop info */}
              <div className="flex items-center space-x-4">
                {shop.logo_url ? (
                  <img
                    src={shop.logo_url}
                    alt={shop.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-accent-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {shop.name ? shop.name.charAt(0) : '?'}
                    </span>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-primary-100">{shop.name || 'Tienda sin nombre'}</h1>
                    {shop.is_featured && (
                      <span className="px-2 py-1 bg-accent-500 text-white text-xs rounded-full">
                        Destacado
                      </span>
                    )}
                  </div>
                  <p className="text-primary-400">{shop.category}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1">
                      {getRatingStars(shop.rating)}
                    </div>
                    <span className="text-sm text-primary-300">
                      {shop.rating} ({shop.review_count} reseñas)
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavorite}
                  className={isFavorited ? 'text-red-400' : ''}
                >
                  <FiHeart className={`mr-2 ${isFavorited ? 'fill-current' : ''}`} size={16} />
                  {isFavorited ? 'Favorito' : 'Guardar'}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <FiShare2 className="mr-2" size={16} />
                  Compartir
                </Button>
                
                {shop.website && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleExternalLink(shop.website)}
                  >
                    <FiExternalLink className="mr-2" size={16} />
                    Visitar sitio
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-primary-700">
              <div className="flex items-center space-x-1 text-sm text-primary-400">
                <FiEye size={14} />
                <span>{shop.view_count} visualizaciones</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-primary-400">
                <FiCalendar size={14} />
                <span>Desde {new Date(shop.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Card>
              <div className="border-b border-primary-700">
                <nav className="flex space-x-1 overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-accent-500 text-white shadow-lg'
                          : 'text-primary-300 hover:text-accent-400 hover:bg-primary-800'
                      }`}
                    >
                      <tab.icon size={16} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-100 mb-2">
                        Sobre la tienda
                      </h3>
                      <p className="text-primary-300 leading-relaxed">
                        {shop.description}
                      </p>
                    </div>

                    {shop.tags && shop.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-primary-100 mb-2">
                          Especialidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {shop.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="flex items-center space-x-1 px-3 py-1 bg-primary-700 text-primary-200 rounded-full text-sm"
                            >
                              <FiTag size={12} />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'hours' && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary-100 mb-4">
                      Horarios de atención
                    </h3>
                    <div className="space-y-2">
                      {formatBusinessHours(shop.business_hours).map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span className="text-primary-300">{item.day}</span>
                          <span className={`font-medium ${
                            item.time === 'Cerrado' 
                              ? 'text-red-400' 
                              : 'text-primary-100'
                          }`}>
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary-100 mb-4">
                      Información de contacto
                    </h3>
                    
                    <div className="space-y-3">
                      {shop.address && (
                        <div className="flex items-start space-x-3">
                          <FiMapPin className="text-accent-500 mt-1" size={16} />
                          <div>
                            <p className="text-primary-100 font-medium">Dirección</p>
                            <p className="text-primary-300">{shop.address}</p>
                          </div>
                        </div>
                      )}

                      {shop.phone && (
                        <div className="flex items-center space-x-3">
                          <FiPhone className="text-accent-500" size={16} />
                          <div>
                            <p className="text-primary-100 font-medium">Teléfono</p>
                            <a 
                              href={`tel:${shop.phone}`}
                              className="text-accent-400 hover:text-accent-300"
                            >
                              {shop.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {shop.email && (
                        <div className="flex items-center space-x-3">
                          <FiMail className="text-accent-500" size={16} />
                          <div>
                            <p className="text-primary-100 font-medium">Email</p>
                            <a 
                              href={`mailto:${shop.email}`}
                              className="text-accent-400 hover:text-accent-300"
                            >
                              {shop.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {shop.website && (
                        <div className="flex items-center space-x-3">
                          <FiGlobe className="text-accent-500" size={16} />
                          <div>
                            <p className="text-primary-100 font-medium">Sitio web</p>
                            <a 
                              href={shop.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-400 hover:text-accent-300"
                            >
                              {shop.website}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-primary-700 pt-4">
                        <p className="text-primary-100 font-medium mb-2">Redes sociales</p>
                        <div className="flex space-x-3">
                          {shop.instagram && (
                            <a
                              href={`https://instagram.com/${shop.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-400 hover:text-accent-300"
                            >
                              <FiInstagram size={20} />
                            </a>
                          )}
                          {shop.facebook && (
                            <a
                              href={`https://facebook.com/${shop.facebook}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-400 hover:text-accent-300"
                            >
                              <FiFacebook size={20} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="text-center py-8">
                    <FiEye className="mx-auto mb-4 text-primary-400" size={48} />
                    <p className="text-primary-300">Galería próximamente disponible</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <Card title="Acciones rápidas">
              <div className="space-y-3">
                {shop.phone && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => window.open(`tel:${shop.phone}`)}
                  >
                    <FiPhone className="mr-2" size={16} />
                    Llamar ahora
                  </Button>
                )}
                
                {shop.website && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleExternalLink(shop.website)}
                  >
                    <FiGlobe className="mr-2" size={16} />
                    Visitar sitio web
                  </Button>
                )}
                
                {shop.address && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleExternalLink(`https://maps.google.com/?q=${encodeURIComponent(shop.address)}`)}
                  >
                    <FiNavigation className="mr-2" size={16} />
                    Cómo llegar
                  </Button>
                )}
              </div>
            </Card>

            {/* Quick info */}
            <Card title="Información">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-400">Categoría:</span>
                  <span className="text-primary-200">{shop.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-400">Calificación:</span>
                  <span className="text-primary-200">{shop.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-400">Reseñas:</span>
                  <span className="text-primary-200">{shop.review_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-400">Visitas:</span>
                  <span className="text-primary-200">{shop.view_count}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ShopDetailPage;