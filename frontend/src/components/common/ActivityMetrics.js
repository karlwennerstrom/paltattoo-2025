import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import { 
  FiActivity, 
  FiUsers, 
  FiEye, 
  FiHeart, 
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';

const ActivityMetrics = ({ offerId = null, variant = 'dashboard' }) => {
  const [metrics, setMetrics] = useState({
    artistsOnline: 0,
    totalViews: 0,
    recentViews: 0,
    interestedArtists: 0,
    activeOffers: 0,
    lastActivity: null
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const { on, off } = useSocket();

  useEffect(() => {
    // Listen for real-time metrics updates
    const handleArtistsOnline = (data) => {
      setMetrics(prev => ({
        ...prev,
        artistsOnline: data.count
      }));
    };

    const handleOfferStats = (data) => {
      if (!offerId || data.offerId === offerId) {
        setMetrics(prev => ({
          ...prev,
          totalViews: data.views || prev.totalViews,
          interestedArtists: data.interested || prev.interestedArtists,
          lastActivity: new Date()
        }));
      }
    };

    const handleOfferActivity = (activity) => {
      if (!offerId || activity.offerId === offerId) {
        setRecentActivity(prev => [
          {
            ...activity,
            timestamp: new Date(),
            id: Date.now()
          },
          ...prev.slice(0, 4) // Keep last 5 activities
        ]);
        
        setMetrics(prev => ({
          ...prev,
          lastActivity: new Date()
        }));
      }
    };

    // Subscribe to socket events
    on('artists_online_count', handleArtistsOnline);
    on('offer_stats_update', handleOfferStats);
    on('offer_activity', handleOfferActivity);

    // Simulate some initial data (remove in production)
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        artistsOnline: Math.floor(Math.random() * 25) + 10,
        totalViews: Math.floor(Math.random() * 50) + 20,
        recentViews: Math.floor(Math.random() * 10) + 3,
        interestedArtists: Math.floor(Math.random() * 8) + 2,
        activeOffers: Math.floor(Math.random() * 15) + 8
      }));
    }, 1000);

    return () => {
      off('artists_online_count', handleArtistsOnline);
      off('offer_stats_update', handleOfferStats);
      off('offer_activity', handleOfferActivity);
    };
  }, [offerId, on, off]);

  const MetricCard = ({ icon: Icon, value, label, color = 'accent', trend = null, animated = true }) => {
    return (
      <motion.div
        initial={animated ? { opacity: 0, y: 20 } : {}}
        animate={animated ? { opacity: 1, y: 0 } : {}}
        className="bg-primary-800 rounded-lg p-4 border border-primary-700"
      >
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-5 h-5 ${
            color === 'accent' ? 'text-accent-500' :
            color === 'green' ? 'text-green-500' :
            color === 'blue' ? 'text-blue-500' :
            color === 'red' ? 'text-red-500' :
            'text-accent-500'
          }`} />
          {trend && (
            <div className={`text-xs px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        
        <div className="flex items-baseline space-x-2">
          <motion.span
            key={value}
            initial={animated ? { scale: 1.2 } : {}}
            animate={animated ? { scale: 1 } : {}}
            className="text-2xl font-bold text-primary-100"
          >
            {value}
          </motion.span>
          {color === 'green' && label === 'Artistas en línea' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          )}
        </div>
        
        <p className="text-sm text-primary-400 mt-1">{label}</p>
      </motion.div>
    );
  };

  const getTimeSince = (date) => {
    if (!date) return 'Sin actividad';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h`;
    return `Hace ${Math.floor(minutes / 1440)}d`;
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          <span className="text-primary-300">{metrics.artistsOnline} artistas en línea</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <FiEye className="w-4 h-4 text-blue-500" />
          <span className="text-primary-300">{metrics.totalViews} vistas</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <FiHeart className="w-4 h-4 text-red-500" />
          <span className="text-primary-300">{metrics.interestedArtists} interesados</span>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-primary-100 flex items-center">
          <FiActivity className="w-4 h-4 mr-2" />
          Actividad en Vivo
        </h3>
        
        <div className="space-y-3">
          <MetricCard
            icon={FiUsers}
            value={metrics.artistsOnline}
            label="Artistas en línea"
            color="green"
            animated={false}
          />
          
          <MetricCard
            icon={FiEye}
            value={metrics.totalViews}
            label="Vistas totales"
            color="blue"
            animated={false}
          />
          
          <MetricCard
            icon={FiHeart}
            value={metrics.interestedArtists}
            label="Artistas interesados"
            color="red"
            animated={false}
          />
        </div>
        
        {recentActivity.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-primary-200 mb-3">
              Actividad Reciente
            </h4>
            <div className="space-y-2">
              <AnimatePresence>
                {recentActivity.slice(0, 3).map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center space-x-2 text-xs text-primary-400"
                  >
                    <FiClock className="w-3 h-3" />
                    <span>{activity.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard variant (default)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary-100 flex items-center">
          <FiTrendingUp className="w-5 h-5 mr-2" />
          Métricas en Tiempo Real
        </h2>
        
        {metrics.lastActivity && (
          <div className="text-sm text-primary-400">
            Última actividad: {getTimeSince(metrics.lastActivity)}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={FiUsers}
          value={metrics.artistsOnline}
          label="Artistas en línea"
          color="green"
          trend={5}
        />
        
        <MetricCard
          icon={FiEye}
          value={metrics.totalViews}
          label="Vistas totales"
          color="blue"
          trend={12}
        />
        
        <MetricCard
          icon={FiHeart}
          value={metrics.interestedArtists}
          label="Artistas interesados"
          color="red"
          trend={8}
        />
        
        <MetricCard
          icon={FiActivity}
          value={metrics.activeOffers}
          label="Ofertas activas"
          color="accent"
          trend={-3}
        />
      </div>
      
      {recentActivity.length > 0 && (
        <div className="bg-primary-800 rounded-lg p-6 border border-primary-700">
          <h3 className="font-semibold text-primary-100 mb-4 flex items-center">
            <FiActivity className="w-4 h-4 mr-2" />
            Actividad Reciente
          </h3>
          
          <div className="space-y-3">
            <AnimatePresence>
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between p-3 bg-primary-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                    <span className="text-sm text-primary-200">{activity.message}</span>
                  </div>
                  <span className="text-xs text-primary-500">
                    {getTimeSince(activity.timestamp)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityMetrics;