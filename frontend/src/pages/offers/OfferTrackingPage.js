import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../contexts/SocketContext';
import { FiEye, FiHeart, FiMessageCircle, FiClock, FiUsers, FiActivity } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import OfferStatusIndicator from '../../components/common/OfferStatusIndicator';
import OfferProgressTracker from '../../components/common/OfferProgressTracker';

const OfferTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinOfferRoom, leaveOfferRoom, on, off } = useSocket();
  const queryClient = useQueryClient();
  
  const [stats, setStats] = useState({
    views: 0,
    interested: 0,
    proposals: 0,
    artistsOnline: 0
  });
  
  const [activities, setActivities] = useState([]);
  const [offerStatus, setOfferStatus] = useState('searching');

  // Fetch offer details
  const { data: offer, isLoading } = useQuery({
    queryKey: ['offer', id],
    queryFn: async () => {
      const response = await api.get(`/offers/${id}`);
      return response.data.data;
    }
  });

  // Fetch proposals
  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      const response = await api.get(`/offers/${id}/proposals`);
      return response.data.data || [];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  useEffect(() => {
    // Join offer room for real-time updates
    joinOfferRoom(id);

    // Socket event listeners
    const handleStatsUpdate = (data) => {
      setStats(prev => ({
        ...prev,
        ...data
      }));
    };

    const handleOfferActivity = (activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 10)); // Keep last 10 activities
      
      // Show toast notification
      toast(activity.message, {
        icon: activity.type === 'artist_viewing' ? '👀' : '💚',
        duration: 4000
      });
    };

    const handleNewProposal = (data) => {
      toast.success('¡Nueva propuesta recibida!', {
        icon: '🎨',
        duration: 5000
      });
      // Refetch proposals
      queryClient.invalidateQueries(['proposals', id]);
    };

    const handleStatusChange = (data) => {
      setOfferStatus(data.status);
    };

    const handleArtistsOnline = (data) => {
      setStats(prev => ({
        ...prev,
        artistsOnline: data.count
      }));
    };

    // Subscribe to socket events
    on('offer_stats_update', handleStatsUpdate);
    on('offer_activity', handleOfferActivity);
    on('new_proposal', handleNewProposal);
    on('offer_status_change', handleStatusChange);
    on('artists_online_count', handleArtistsOnline);

    // Cleanup
    return () => {
      leaveOfferRoom(id);
      off('offer_stats_update', handleStatsUpdate);
      off('offer_activity', handleOfferActivity);
      off('new_proposal', handleNewProposal);
      off('offer_status_change', handleStatusChange);
      off('artists_online_count', handleArtistsOnline);
    };
  }, [id, joinOfferRoom, leaveOfferRoom, on, off]);

  // Simulate initial activity (remove in production with real data)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        views: Math.floor(Math.random() * 10) + 5,
        interested: Math.floor(Math.random() * 3) + 1,
        proposals: proposals.length,
        artistsOnline: Math.floor(Math.random() * 20) + 10
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [proposals.length]);

  const statusConfig = {
    searching: {
      title: 'Buscando tatuadores',
      icon: FiUsers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    reviewing: {
      title: 'Tatuadores revisando',
      icon: FiEye,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20'
    },
    receiving_proposals: {
      title: 'Recibiendo propuestas',
      icon: FiMessageCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20'
    }
  };

  const currentStatus = statusConfig[offerStatus] || statusConfig.searching;
  const StatusIcon = currentStatus.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-primary-800 rounded-2xl p-6 mb-6 border border-primary-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-primary-100">
              Seguimiento de tu solicitud
            </h1>
            <OfferStatusIndicator status={offerStatus} size="lg" />
          </div>
          
          <h2 className="text-lg text-primary-200 mb-4">{offer?.title}</h2>
          <p className="text-primary-400 mb-6">{offer?.description}</p>
          
          {/* Progress Tracker */}
          <OfferProgressTracker currentStatus={offerStatus} />
        </div>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-800 rounded-xl p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between mb-2">
              <FiEye className="w-6 h-6 text-blue-500" />
              <motion.span
                key={stats.views}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary-100"
              >
                {stats.views}
              </motion.span>
            </div>
            <p className="text-sm text-primary-400">Vistas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary-800 rounded-xl p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between mb-2">
              <FiHeart className="w-6 h-6 text-red-500" />
              <motion.span
                key={stats.interested}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary-100"
              >
                {stats.interested}
              </motion.span>
            </div>
            <p className="text-sm text-primary-400">Interesados</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary-800 rounded-xl p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between mb-2">
              <FiMessageCircle className="w-6 h-6 text-green-500" />
              <motion.span
                key={stats.proposals}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary-100"
              >
                {stats.proposals}
              </motion.span>
            </div>
            <p className="text-sm text-primary-400">Propuestas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary-800 rounded-xl p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between mb-2">
              <FiActivity className="w-6 h-6 text-accent-500" />
              <div className="flex items-center space-x-1">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <span className="text-2xl font-bold text-primary-100">
                  {stats.artistsOnline}
                </span>
              </div>
            </div>
            <p className="text-sm text-primary-400">Artistas en línea</p>
          </motion.div>
        </div>

        {/* Status Progress */}
        <div className="bg-primary-800 rounded-xl p-6 mb-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-primary-100 mb-4">
            Estado actual: {currentStatus.title}
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-primary-400">Publicando</span>
                <span className="text-sm text-primary-400">Buscando</span>
                <span className="text-sm text-primary-400">Revisando</span>
                <span className="text-sm text-primary-400">Propuestas</span>
              </div>
              <div className="relative h-2 bg-primary-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: offerStatus === 'searching' ? '33%' : 
                           offerStatus === 'reviewing' ? '66%' : '100%' 
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute h-full bg-gradient-to-r from-accent-500 to-accent-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-primary-100 mb-4 flex items-center">
            <FiActivity className="w-5 h-5 mr-2" />
            Actividad en tiempo real
          </h3>
          
          <AnimatePresence>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <motion.div
                    key={`${activity.type}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center space-x-3 p-3 bg-primary-700/50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <FiClock className="w-4 h-4 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-primary-200">{activity.message}</p>
                      <p className="text-xs text-primary-500">Justo ahora</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-primary-400">
                  Las actividades aparecerán aquí en tiempo real
                </p>
                <div className="flex justify-center mt-4 space-x-1">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                      className="w-2 h-2 bg-accent-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(`/offers/${id}`)}
            className="btn-primary"
          >
            Ver propuestas ({proposals.length})
          </button>
          <button
            onClick={() => navigate('/my-requests')}
            className="btn-secondary"
          >
            Volver a mis solicitudes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferTrackingPage;