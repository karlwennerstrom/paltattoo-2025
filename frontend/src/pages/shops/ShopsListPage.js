import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, Grid, Card } from '../../components/common/Layout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { sponsoredShopsService } from '../../services/api';
import { FiSearch, FiMapPin, FiPhone, FiGlobe, FiStar, FiEye, FiClock, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShopsListPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
    loadShops();
  }, []);

  useEffect(() => {
    setPage(1);
    loadShops();
  }, [searchQuery, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await sponsoredShopsService.getCategories();
      // The API returns categories in response.data.data
      const categoriesData = response.data?.data || response.data || [];
      
      // If categories come as objects with id and name, extract the names
      if (Array.isArray(categoriesData)) {
        const categoryNames = categoriesData.map(cat => 
          typeof cat === 'string' ? cat : (cat.name || cat.id)
        );
        setCategories(categoryNames);
      } else {
        // Fallback to default categories if not an array
        throw new Error('Invalid categories format');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Use fallback categories
      setCategories([
        'Cuidado Post-Tatuaje',
        'Equipos',
        'Suministros',
        'Ropa',
        'Piercing',
        'Joyería',
        'Estudio',
        'Otros'
      ]);
    }
  };

  const loadShops = async (pageNum = 1) => {
    try {
      setLoading(true);
      const filters = {
        page: pageNum,
        limit: 12,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory })
      };

      const response = await sponsoredShopsService.getAll(filters);
      
      // Handle different response structures - API returns { success, data, pagination }
      const shopsData = response.data?.data || [];
      const total = response.data?.pagination?.total || shopsData.length;
      
      // Ensure shopsData is an array
      if (Array.isArray(shopsData)) {
        setShops(shopsData);
        setTotalPages(Math.ceil(total / 12));
      } else {
        console.error('Invalid shops data format:', shopsData);
        setShops([]);
        setTotalPages(0);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar las tiendas');
      console.error('Error loading shops:', err);
      // Only generate mock data if there's no data at all
      if (shops.length === 0) {
        generateMockShops();
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockShops = () => {
    const mockShops = [
      {
        id: 1,
        name: 'TattooSupply Pro',
        description: 'Equipos profesionales de tatuaje, tintas de alta calidad y accesorios para artistas.',
        category: 'Equipos de Tatuaje',
        address: 'Providencia 1234, Santiago',
        phone: '+56 9 1234 5678',
        website: 'https://tattoosupplypro.cl',
        logo_url: null,
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
        tags: ['equipos', 'profesional', 'calidad'],
        view_count: 1250,
        click_count: 89
      },
      {
        id: 2,
        name: 'Ink Masters Chile',
        description: 'Las mejores tintas importadas para tatuajes. Colores vibrantes y seguros.',
        category: 'Tintas y Colores',
        address: 'Las Condes 567, Santiago',
        phone: '+56 9 8765 4321',
        website: 'https://inkmasters.cl',
        logo_url: null,
        rating: 4.6,
        review_count: 89,
        business_hours: {
          monday: '10:00-19:00',
          tuesday: '10:00-19:00',
          wednesday: '10:00-19:00',
          thursday: '10:00-19:00',
          friday: '10:00-19:00',
          saturday: '10:00-17:00',
          sunday: 'Cerrado'
        },
        is_featured: false,
        tags: ['tintas', 'colores', 'importadas'],
        view_count: 980,
        click_count: 67
      }
    ];
    setShops(mockShops);
    setTotalPages(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadShops(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShopClick = async (shopId) => {
    try {
      await sponsoredShopsService.trackClick(shopId);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const formatBusinessHours = (hours) => {
    if (!hours || typeof hours !== 'object') return 'Horarios no disponibles';
    
    const today = new Date().toLocaleDateString('en', { weekday: 'short' }).toLowerCase();
    const days = {
      mon: 'monday',
      tue: 'tuesday', 
      wed: 'wednesday',
      thu: 'thursday',
      fri: 'friday',
      sat: 'saturday',
      sun: 'sunday'
    };
    
    const todayHours = hours[days[today]];
    return todayHours === 'Cerrado' ? 'Cerrado hoy' : `Hoy: ${todayHours || 'No disponible'}`;
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

  if (loading && shops.length === 0) {
    return (
      <PageContainer title="Tiendas Patrocinadoras">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-primary-400">Cargando tiendas...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error && shops.length === 0) {
    return (
      <PageContainer title="Tiendas Patrocinadoras">
        <div className="text-center py-12">
          <p className="text-error-400 mb-4">{error}</p>
          <Button onClick={() => loadShops()} variant="secondary">
            Reintentar
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Tiendas Patrocinadoras"
      subtitle="Descubre los mejores proveedores de equipos y suministros para tatuajes"
      maxWidth="full"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar tiendas, productos, categorías..."
                icon={<FiSearch className="h-5 w-5" />}
              />
            </div>

            {/* Filter toggle (mobile) */}
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <FiFilter className="mr-2" size={16} />
              Filtros
            </Button>

            {/* Results info */}
            <div className="text-sm text-primary-400">
              {Array.isArray(shops) ? shops.length : 0} tienda{(Array.isArray(shops) ? shops.length : 0) !== 1 ? 's' : ''} encontrada{(Array.isArray(shops) ? shops.length : 0) !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Category filters */}
          <div className={`mt-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-accent-500 text-white'
                    : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                }`}
              >
                Todas las categorías
              </button>
              {Array.isArray(categories) && categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-accent-500 text-white'
                      : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Shops Grid */}
        {!Array.isArray(shops) || shops.length === 0 ? (
          <Card className="text-center py-12">
            <FiSearch className="mx-auto mb-4 text-primary-400" size={48} />
            <p className="text-primary-300 mb-2">No se encontraron tiendas</p>
            <p className="text-primary-400">Intenta ajustar los filtros de búsqueda</p>
          </Card>
        ) : (
          <Grid cols={3} gap={6}>
            {shops.map((shop) => (
              <Card key={shop.id} className="hover:shadow-xl transition-all duration-300">
                <Link
                  to={`/shops/${shop.id}`}
                  onClick={() => handleShopClick(shop.id)}
                  className="block"
                >
                  {/* Shop header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt={shop.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-accent-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {shop.name ? shop.name.charAt(0) : '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-primary-100">{shop.name || 'Tienda sin nombre'}</h3>
                        <p className="text-sm text-primary-400">{shop.category}</p>
                      </div>
                    </div>
                    {shop.is_featured && (
                      <span className="px-2 py-1 bg-accent-500 text-white text-xs rounded-full">
                        Destacado
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-primary-300 text-sm mb-4 line-clamp-2">
                    {shop.description}
                  </p>

                  {/* Rating and stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center space-x-1">
                        {getRatingStars(shop.rating)}
                      </div>
                      <span className="text-sm text-primary-400 ml-2">
                        ({shop.review_count} reseñas)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-primary-500">
                      <div className="flex items-center space-x-1">
                        <FiEye size={12} />
                        <span>{shop.view_count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-2 text-sm text-primary-400">
                    {shop.address && (
                      <div className="flex items-center space-x-2">
                        <FiMapPin size={14} />
                        <span>{shop.address}</span>
                      </div>
                    )}
                    {shop.phone && (
                      <div className="flex items-center space-x-2">
                        <FiPhone size={14} />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                    {shop.business_hours && (
                      <div className="flex items-center space-x-2">
                        <FiClock size={14} />
                        <span>{formatBusinessHours(shop.business_hours)}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {shop.tags && shop.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {shop.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </Card>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ShopsListPage;