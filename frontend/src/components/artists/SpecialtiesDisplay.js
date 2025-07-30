import React from 'react';
import { twMerge } from 'tailwind-merge';

const SpecialtiesDisplay = ({ specialties, className = '' }) => {
  // Only show real specialties, no fallback data
  const displaySpecialties = specialties || [];

  // Style descriptions and color mappings
  const styleInfo = {
    'Realista': {
      color: 'bg-purple-600',
      description: 'Tatuajes con alto nivel de detalle y realismo fotográfico',
      icon: '🎨'
    },
    'Tradicional': {
      color: 'bg-red-600',
      description: 'Estilo clásico americano con líneas gruesas y colores sólidos',
      icon: '⚡'
    },
    'Neo-tradicional': {
      color: 'bg-pink-600',
      description: 'Evolución del tradicional con más detalles y paleta ampliada',
      icon: '🌹'
    },
    'Blackwork': {
      color: 'bg-gray-700',
      description: 'Trabajo exclusivo en tinta negra, patrones y sólidos',
      icon: '⚫'
    },
    'Dotwork': {
      color: 'bg-gray-600',
      description: 'Técnica de puntillismo para crear sombras y texturas',
      icon: '•'
    },
    'Acuarela': {
      color: 'bg-blue-500',
      description: 'Estilo que imita las pinturas de acuarela con colores fluidos',
      icon: '💧'
    },
    'Japonés': {
      color: 'bg-red-700',
      description: 'Motivos tradicionales japoneses con significado cultural',
      icon: '🐉'
    },
    'Tribal': {
      color: 'bg-orange-700',
      description: 'Patrones geométricos inspirados en culturas ancestrales',
      icon: '🔥'
    },
    'Minimalista': {
      color: 'bg-teal-600',
      description: 'Diseños simples y limpios con líneas finas',
      icon: '✏️'
    },
    'Geométrico': {
      color: 'bg-indigo-600',
      description: 'Formas geométricas precisas y patrones matemáticos',
      icon: '📐'
    },
    'Biomecánico': {
      color: 'bg-green-700',
      description: 'Fusión de elementos orgánicos y mecánicos',
      icon: '⚙️'
    },
    'New School': {
      color: 'bg-yellow-600',
      description: 'Estilo caricaturesco con colores vibrantes',
      icon: '🎭'
    },
    'Old School': {
      color: 'bg-orange-600',
      description: 'Tatuajes tradicionales marineros y vintage',
      icon: '⚓'
    },
    'Black & Grey': {
      color: 'bg-gray-800',
      description: 'Trabajo en escala de grises con sombreados suaves',
      icon: '🌑'
    },
    'Color': {
      color: 'bg-rainbow',
      description: 'Especialización en trabajos a todo color',
      icon: '🌈'
    },
    'Lettering': {
      color: 'bg-purple-700',
      description: 'Tipografías y caligrafía personalizada',
      icon: '✍️'
    },
    'Ornamental': {
      color: 'bg-amber-600',
      description: 'Patrones decorativos y mandalas',
      icon: '🌸'
    },
    'Retratos': {
      color: 'bg-brown-600',
      description: 'Especialización en rostros y retratos realistas',
      icon: '👤'
    }
  };

  const getStyleInfo = (style) => {
    return styleInfo[style] || {
      color: 'bg-primary-600',
      description: 'Estilo de tatuaje personalizado',
      icon: '✨'
    };
  };

  return (
    <div className={twMerge('space-y-4', className)}>
      {/* Specialty Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {displaySpecialties.map((specialty, index) => {
          const info = getStyleInfo(specialty);
          return (
            <span
              key={index}
              className={twMerge(
                'px-3 py-1 rounded-full text-white text-sm font-medium',
                info.color
              )}
            >
              <span className="mr-1">{info.icon}</span>
              {specialty}
            </span>
          );
        })}
      </div>

      {/* Detailed Specialty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displaySpecialties.slice(0, 4).map((specialty, index) => {
          const info = getStyleInfo(specialty);
          return (
            <div
              key={index}
              className="bg-primary-800 rounded-lg p-4 hover:bg-primary-700 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={twMerge(
                  'w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl',
                  info.color
                )}>
                  {info.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-primary-100 font-medium mb-1">{specialty}</h4>
                  <p className="text-primary-400 text-sm">{info.description}</p>
                  
                  {/* Experience level for this specialty */}
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={twMerge(
                            'h-3 w-3',
                            star <= 4 ? 'text-yellow-400' : 'text-primary-600'
                          )}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-primary-500">Experto</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      {displaySpecialties.length > 4 && (
        <div className="text-center pt-2">
          <p className="text-sm text-primary-400">
            +{displaySpecialties.length - 4} especialidades más
          </p>
        </div>
      )}

    </div>
  );
};

export default SpecialtiesDisplay;