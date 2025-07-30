import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUpload, 
  FiSearch, 
  FiEye, 
  FiMessageCircle, 
  FiCheck 
} from 'react-icons/fi';

const OfferProgressTracker = ({ currentStatus, showLabels = true, variant = 'horizontal' }) => {
  const steps = [
    {
      id: 'publishing',
      icon: FiUpload,
      label: 'Publicando',
      description: 'Subiendo tu solicitud'
    },
    {
      id: 'searching',
      icon: FiSearch,
      label: 'Buscando',
      description: 'Encontrando tatuadores'
    },
    {
      id: 'active',
      icon: FiEye,
      label: 'Revisando',
      description: 'Tatuadores viendo tu solicitud'
    },
    {
      id: 'receiving_proposals',
      icon: FiMessageCircle,
      label: 'Propuestas',
      description: 'Recibiendo ofertas'
    },
    {
      id: 'completed',
      icon: FiCheck,
      label: 'Completado',
      description: 'Proceso finalizado'
    }
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.id === currentStatus);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  const StepIcon = ({ step, index, status }) => {
    const Icon = step.icon;
    
    const getIconClasses = () => {
      switch (status) {
        case 'completed':
          return 'text-green-500 bg-green-500/20';
        case 'active':
          return 'text-accent-500 bg-accent-500/20';
        default:
          return 'text-primary-500 bg-primary-500/20';
      }
    };

    const iconElement = (
      <div className={`
        p-3 rounded-full border-2 transition-all duration-300
        ${status === 'completed' ? 'border-green-500' : 
          status === 'active' ? 'border-accent-500' : 
          'border-primary-600'}
        ${getIconClasses()}
      `}>
        <Icon className="w-5 h-5" />
      </div>
    );

    if (status === 'active') {
      return (
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 0 0 rgba(var(--accent-500), 0.4)',
              '0 0 0 10px rgba(var(--accent-500), 0)',
              '0 0 0 0 rgba(var(--accent-500), 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {iconElement}
        </motion.div>
      );
    }

    if (status === 'completed') {
      return (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {iconElement}
        </motion.div>
      );
    }

    return iconElement;
  };

  const ProgressLine = ({ index, isCompleted, isActive }) => {
    if (variant === 'vertical') {
      return (
        <div className="flex justify-center">
          <div className="w-px h-12 bg-primary-600 relative">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: isCompleted || isActive ? '100%' : '0%' }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`absolute w-full ${
                isCompleted ? 'bg-green-500' : 'bg-accent-500'
              }`}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 px-4">
        <div className="h-px bg-primary-600 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: isCompleted || isActive ? '100%' : '0%' }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={`absolute h-full ${
              isCompleted ? 'bg-green-500' : 'bg-accent-500'
            }`}
          />
        </div>
      </div>
    );
  };

  if (variant === 'vertical') {
    return (
      <div className="space-y-2">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div key={step.id}>
              <div className="flex items-center space-x-4">
                <StepIcon step={step} index={index} status={status} />
                {showLabels && (
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      status === 'completed' ? 'text-green-500' :
                      status === 'active' ? 'text-accent-500' :
                      'text-primary-400'
                    }`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-primary-500">
                      {step.description}
                    </p>
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <ProgressLine 
                  index={index}
                  isCompleted={status === 'completed'}
                  isActive={status === 'active'}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <StepIcon step={step} index={index} status={status} />
              {showLabels && (
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    status === 'completed' ? 'text-green-500' :
                    status === 'active' ? 'text-accent-500' :
                    'text-primary-400'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-primary-500 mt-1">
                    {step.description}
                  </p>
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <ProgressLine 
                index={index}
                isCompleted={getStepStatus(index + 1) === 'completed'}
                isActive={getStepStatus(index + 1) === 'active'}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OfferProgressTracker;