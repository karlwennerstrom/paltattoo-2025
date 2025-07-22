import React from 'react';
import { twMerge } from 'tailwind-merge';
import { FiAward, FiStar, FiZap } from 'react-icons/fi';

const SubscriptionBadge = ({ subscriptionType, size = 'sm', className = '' }) => {
  if (!subscriptionType || subscriptionType === 'free') {
    return null;
  }

  const getBadgeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'premium':
      case 'pro':
        return {
          icon: FiAward,
          text: 'PRO',
          className: 'bg-gradient-to-r from-purple-600 to-purple-800 text-white border-purple-400',
          iconClassName: 'text-purple-200'
        };
      case 'plus':
      case 'premium_plus':
        return {
          icon: FiStar,
          text: 'PLUS',
          className: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white border-blue-400',
          iconClassName: 'text-blue-200'
        };
      case 'elite':
      case 'premium_elite':
        return {
          icon: FiZap,
          text: 'ELITE',
          className: 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black border-yellow-400',
          iconClassName: 'text-yellow-800'
        };
      default:
        return {
          icon: FiStar,
          text: 'PRO',
          className: 'bg-gradient-to-r from-accent-600 to-accent-800 text-white border-accent-400',
          iconClassName: 'text-accent-200'
        };
    }
  };

  const config = getBadgeConfig(subscriptionType);
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    xs: 8,
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <div
      className={twMerge(
        'inline-flex items-center space-x-1 font-bold rounded-full border shadow-sm backdrop-blur-sm',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <Icon size={iconSizes[size]} className={config.iconClassName} />
      <span>{config.text}</span>
    </div>
  );
};

export default SubscriptionBadge;