import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '../common/Button';
import Input from '../common/Input';

const ArtistFilters = ({ filters, onFilterChange, className = '' }) => {
  const [localFilters, setLocalFilters] = useState(filters || {
    location: '',
    specialties: [],
    experienceLevel: '',
    priceRange: [0, 500000],
    rating: 0,
    availability: '',
    sortBy: 'rating',
  });

  const tattooStyles = [
    'Realista', 'Tradicional', 'Neo-tradicional', 'Blackwork',
    'Dotwork', 'Acuarela', 'Japonés', 'Tribal', 'Minimalista',
    'Geométrico', 'Biomecánico', 'New School', 'Old School',
    'Black & Grey', 'Color', 'Lettering', 'Ornamental'
  ];

  const experienceLevels = [
    { value: 'junior', label: 'Junior (1-3 años)' },
    { value: 'mid', label: 'Intermedio (3-7 años)' },
    { value: 'senior', label: 'Senior (7-15 años)' },
    { value: 'master', label: 'Master (15+ años)' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSpecialtyToggle = (specialty) => {
    const newSpecialties = localFilters.specialties.includes(specialty)
      ? localFilters.specialties.filter(s => s !== specialty)
      : [...localFilters.specialties, specialty];
    handleFilterChange('specialties', newSpecialties);
  };

  const clearFilters = () => {
    const defaultFilters = {
      location: '',
      specialties: [],
      experienceLevel: '',
      priceRange: [0, 500000],
      rating: 0,
      availability: '',
      sortBy: 'rating',
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
      {/* Sort options */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Ordenar por</h3>
        <select
          value={localFilters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-sm text-primary-100 focus:border-accent-500 focus:outline-none"
        >
          <option value="rating">Mejor valorados</option>
          <option value="experience">Más experiencia</option>
          <option value="price_low">Precio: menor a mayor</option>
          <option value="price_high">Precio: mayor a menor</option>
          <option value="recent">Más recientes</option>
          <option value="popular">Más populares</option>
        </select>
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

      {/* Specialties */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Especialidades</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tattooStyles.map((style) => (
            <label key={style} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.specialties.includes(style)}
                onChange={() => handleSpecialtyToggle(style)}
                className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
              />
              <span className="text-sm text-primary-300">{style}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Nivel de experiencia</h3>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label key={level.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={localFilters.experienceLevel === level.value}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 focus:ring-accent-500"
              />
              <span className="text-sm text-primary-300">{level.label}</span>
            </label>
          ))}
        </div>
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
              onChange={(e) => handleFilterChange('priceRange', [localFilters.priceRange[0], parseInt(e.target.value) || 500000])}
              placeholder="500000"
              size="sm"
            />
          </div>
          <div className="text-xs text-primary-400 text-center">
            {formatPrice(localFilters.priceRange[0])} - {formatPrice(localFilters.priceRange[1])}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Calificación mínima</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={localFilters.rating === rating}
                onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 focus:ring-accent-500"
              />
              <div className="flex items-center space-x-1">
                {Array.from({ length: rating }, (_, i) => (
                  <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-primary-300 ml-1">y más</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-semibold text-primary-100 mb-3">Disponibilidad</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="availability"
              value="available"
              checked={localFilters.availability === 'available'}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 focus:ring-accent-500"
            />
            <span className="text-sm text-primary-300">Disponible ahora</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="availability"
              value="soon"
              checked={localFilters.availability === 'soon'}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 focus:ring-accent-500"
            />
            <span className="text-sm text-primary-300">Disponible pronto</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="availability"
              value=""
              checked={localFilters.availability === ''}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 focus:ring-accent-500"
            />
            <span className="text-sm text-primary-300">Todos</span>
          </label>
        </div>
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

export default ArtistFilters;