import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiEye, 
  FiUsers, 
  FiMessageCircle, 
  FiCheck, 
  FiX,
  FiLoader
} from 'react-icons/fi';

const OfferStatusIndicator = ({ status, animated = true, size = 'md' }) => {
  const statusConfig = {
    draft: {
      icon: FiClock,
      label: 'Borrador',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30'
    },
    publishing: {
      icon: FiLoader,
      label: 'Publicando',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      animate: true
    },
    searching: {
      icon: FiUsers,
      label: 'Buscando tatuadores',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      pulse: true
    },
    active: {
      icon: FiEye,
      label: 'Tatuadores revisando',
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    receiving_proposals: {
      icon: FiMessageCircle,
      label: 'Recibiendo propuestas',
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/20',
      borderColor: 'border-accent-500/30'
    },
    completed: {
      icon: FiCheck,
      label: 'Completado',
      color: 'text-green-600',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-600/30'
    },
    cancelled: {
      icon: FiX,
      label: 'Cancelado',
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    expired: {
      icon: FiClock,
      label: 'Expirado',
      color: 'text-gray-600',
      bgColor: 'bg-gray-600/20',
      borderColor: 'border-gray-600/30'
    }
  };

  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  const containerClasses = `
    inline-flex items-center space-x-2 rounded-full border
    ${config.bgColor} ${config.borderColor}
    ${currentSize.container}
  `;

  const iconElement = (
    <Icon 
      className={`${currentSize.icon} ${config.color}`}
    />
  );

  const animatedIcon = config.animate ? (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      {iconElement}
    </motion.div>
  ) : config.pulse ? (
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {iconElement}
    </motion.div>
  ) : iconElement;

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      className={containerClasses}
    >
      {animated ? animatedIcon : iconElement}
      <span className={`font-medium ${config.color} ${currentSize.text}`}>
        {config.label}
      </span>
    </motion.div>
  );
};

export default OfferStatusIndicator;