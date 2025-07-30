import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import { FiBell, FiX, FiEye, FiHeart, FiMessageCircle } from 'react-icons/fi';

// Generate unique ID for notifications
let notificationCounter = 0;
const generateUniqueId = () => {
  notificationCounter += 1;
  return `notification-${Date.now()}-${notificationCounter}`;
};

const RealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const { on, off } = useSocket();

  useEffect(() => {
    // Listen for various real-time events
    const handleOfferActivity = (activity) => {
      const notification = {
        id: generateUniqueId(),
        type: activity.type,
        message: activity.message,
        timestamp: new Date(),
        icon: getIconByType(activity.type)
      };
      
      addNotification(notification);
    };

    const handleNewProposal = (data) => {
      const notification = {
        id: generateUniqueId(),
        type: 'new_proposal',
        message: '¡Nueva propuesta recibida!',
        timestamp: new Date(),
        icon: FiMessageCircle
      };
      
      addNotification(notification);
    };

    const handleArtistsOnline = (data) => {
      if (data.count > 0) {
        const notification = {
          id: generateUniqueId(),
          type: 'artists_online',
          message: `${data.count} tatuadores están en línea ahora`,
          timestamp: new Date(),
          icon: FiBell
        };
        
        addNotification(notification);
      }
    };

    // Subscribe to socket events
    on('offer_activity', handleOfferActivity);
    on('new_proposal', handleNewProposal);
    on('artists_online_count', handleArtistsOnline);

    return () => {
      off('offer_activity', handleOfferActivity);
      off('new_proposal', handleNewProposal);
      off('artists_online_count', handleArtistsOnline);
    };
  }, [on, off]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    setIsVisible(true);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'artist_viewing':
        return FiEye;
      case 'artist_interested':
        return FiHeart;
      case 'new_proposal':
        return FiMessageCircle;
      default:
        return FiBell;
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'artist_viewing':
        return 'text-blue-500';
      case 'artist_interested':
        return 'text-red-500';
      case 'new_proposal':
        return 'text-green-500';
      default:
        return 'text-accent-500';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className="mb-3 bg-primary-800 border border-primary-700 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: notification.type === 'artist_viewing' ? [0, 10, -10, 0] : 0
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`flex-shrink-0 p-2 rounded-full bg-primary-700 ${getColorByType(notification.type)}`}
                  >
                    <Icon size={16} />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-100">
                      {notification.message}
                    </p>
                    <p className="text-xs text-primary-400 mt-1">
                      Justo ahora
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="flex-shrink-0 text-primary-500 hover:text-primary-300 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
              
              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-1 bg-accent-500"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default RealtimeNotifications;