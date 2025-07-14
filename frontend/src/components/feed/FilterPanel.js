import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../common/Button';
import Input from '../common/Input';
import { catalogService } from '../../services/api';

const FilterPanel = ({ filters, onFilterChange, className = '' }) => {
  const [localFilters, setLocalFilters] = useState(filters || {
    priceRange: [0, 1000000],
    styles: [],
    sizes: [],
    bodyParts: [],
    location: '',
    sortBy: 'recent',
  });

  // State for data from backend
  const [tattooStyles, setTattooStyles] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcoded fallback data
  const fallbackStyles = [
    'Realista', 'Tradicional', 'Neo-tradicional', 'Blackwork', 
    'Dotwork', 'Acuarela', 'Japonés', 'Tribal', 'Minimalista',
    'Geométrico', 'Biomecánico', 'New School'
  ];

  const sizes = [
    'Pequeño (2-5cm)', 'Mediano (5-15cm)', 'Grande (15-30cm)', 'Extra Grande (30cm+)'
  ];

  const fallbackBodyParts = [
    'Brazo', 'Antebrazo', 'Pierna', 'Espalda', 'Pecho', 
    'Hombro', 'Muñeca', 'Tobillo', 'Cuello', 'Mano'
  ];

  // Fetch catalog data from backend
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tattoo styles
        const stylesResponse = await catalogService.getStyles();
        const stylesNames = stylesResponse.data.map(style => style.name).sort();
        setTattooStyles(stylesNames);

        // Fetch body parts
        const bodyPartsResponse = await catalogService.getBodyParts();
        const bodyPartsNames = bodyPartsResponse.data.map(part => part.name).sort();
        setBodyParts(bodyPartsNames);

      } catch (err) {
        console.error('Error fetching catalog data:', err);
        setError(err.message);
        // Use fallback data
        setTattooStyles(fallbackStyles);
        setBodyParts(fallbackBodyParts);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleStyleToggle = (style) => {
    const newStyles = localFilters.styles.includes(style)
      ? localFilters.styles.filter(s => s !== style)
      : [...localFilters.styles, style];
    handleFilterChange('styles', newStyles);
  };

  const handleSizeToggle = (size) => {
    const newSizes = localFilters.sizes.includes(size)
      ? localFilters.sizes.filter(s => s !== size)
      : [...localFilters.sizes, size];
    handleFilterChange('sizes', newSizes);
  };

  const handleBodyPartToggle = (part) => {
    const newParts = localFilters.bodyParts.includes(part)
      ? localFilters.bodyParts.filter(p => p !== part)
      : [...localFilters.bodyParts, part];
    handleFilterChange('bodyParts', newParts);
  };

  const clearFilters = () => {
    const defaultFilters = {
      priceRange: [0, 1000000],
      styles: [],
      sizes: [],
      bodyParts: [],
      location: '',
      sortBy: 'recent',
    };
    setLocalFilters(defaultFilters);
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={twMerge('space-y-6', className)}>
      {/* Connection Status */}
      {!loading && !error && (
        <div className="bg-green-900 bg-opacity-50 border border-green-600 rounded-lg p-3">
          <div className="flex items-center text-green-300">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Conectado al backend</span>
          </div>
        </div>
      )}

      {/* Sort options */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Ordenar por</h3>
        <select
          value={localFilters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-sm text-primary-100 focus:border-accent-500 focus:outline-none"
        >
          <option value="recent">Más recientes</option>
          <option value="price_low">Precio: menor a mayor</option>
          <option value="price_high">Precio: mayor a menor</option>
          <option value="popular">Más populares</option>
          <option value="urgent">Urgentes primero</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Rango de precio</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-primary-400">Mínimo</label>
            <Input
              type="number"
              value={localFilters.priceRange[0]}
              onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, localFilters.priceRange[1]])}
              placeholder="0"
              size="sm"
            />
          </div>
          <div>
            <label className="text-xs text-primary-400">Máximo</label>
            <Input
              type="number"
              value={localFilters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [localFilters.priceRange[0], parseInt(e.target.value) || 1000000])}
              placeholder="1000000"
              size="sm"
            />
          </div>
          <div className="text-xs text-primary-400 text-center">
            {formatPrice(localFilters.priceRange[0])} - {formatPrice(localFilters.priceRange[1])}
          </div>
        </div>
      </div>

      {/* Styles */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">
          Estilos 
          {loading && <span className="text-xs text-primary-400 ml-2">(cargando...)</span>}
          {!loading && !error && <span className="text-xs text-green-400 ml-2">({tattooStyles.length})</span>}
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tattooStyles.map((style) => (
              <label key={style} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.styles.includes(style)}
                  onChange={() => handleStyleToggle(style)}
                  className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
                />
                <span className="text-sm text-primary-300">{style}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Tamaño</h3>
        <div className="space-y-2">
          {sizes.map((size) => (
            <label key={size} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.sizes.includes(size)}
                onChange={() => handleSizeToggle(size)}
                className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
              />
              <span className="text-sm text-primary-300">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Body parts */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">
          Parte del cuerpo
          {loading && <span className="text-xs text-primary-400 ml-2">(cargando...)</span>}
          {!loading && !error && <span className="text-xs text-green-400 ml-2">({bodyParts.length})</span>}
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bodyParts.map((part) => (
              <label key={part} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.bodyParts.includes(part)}
                  onChange={() => handleBodyPartToggle(part)}
                  className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
                />
                <span className="text-sm text-primary-300">{part}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Ubicación</h3>
        <Input
          type="text"
          value={localFilters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          placeholder="Ciudad o comuna"
          size="sm"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>

      {/* Clear filters button */}
      <Button
        variant="ghost"
        size="sm"
        fullWidth
        onClick={clearFilters}
        className="text-primary-400 hover:text-primary-200"
      >
        Limpiar filtros
      </Button>
    </div>
  );
};

export default FilterPanel;