import React from 'react';
import { twMerge } from 'tailwind-merge';

const UserTypeSelector = ({ value, onChange, error }) => {
  const userTypes = [
    {
      value: 'client',
      title: 'Cliente',
      description: 'Busco un tatuador para mi próximo tatuaje',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      features: [
        'Busca tatuadores por estilo',
        'Solicita cotizaciones',
        'Agenda citas',
        'Guarda tus favoritos',
      ],
    },
    {
      value: 'artist',
      title: 'Tatuador',
      description: 'Soy un tatuador profesional que busca clientes',
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      features: [
        'Crea tu portafolio',
        'Recibe solicitudes',
        'Gestiona tus citas',
        'Crece tu negocio',
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {userTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={twMerge(
              'relative rounded-lg border-2 p-6 text-left transition-all hover:shadow-lg',
              value === type.value
                ? 'border-accent-500 bg-accent-50/5 ring-2 ring-accent-500 ring-offset-2 ring-offset-primary-900'
                : 'border-primary-600 hover:border-primary-500'
            )}
          >
            {/* Selection indicator */}
            {value === type.value && (
              <div className="absolute top-4 right-4">
                <div className="h-6 w-6 rounded-full bg-accent-500 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* Icon */}
            <div className={twMerge(
              'mb-4',
              value === type.value ? 'text-accent-500' : 'text-primary-400'
            )}>
              {type.icon}
            </div>

            {/* Title and description */}
            <h3 className="text-lg font-semibold text-primary-100 mb-2">
              {type.title}
            </h3>
            <p className="text-sm text-primary-400 mb-4">
              {type.description}
            </p>

            {/* Features */}
            <ul className="space-y-2">
              {type.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className={twMerge(
                      'h-4 w-4 mr-2 mt-0.5 flex-shrink-0',
                      value === type.value ? 'text-accent-500' : 'text-primary-500'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-primary-300">{feature}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-error-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
};

export default UserTypeSelector;