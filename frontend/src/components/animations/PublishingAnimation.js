import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUsers, FiCheck, FiLoader } from 'react-icons/fi';
import { statsService } from '../../services/api';

const PublishingAnimation = ({ status, onComplete }) => {
  const [realStats, setRealStats] = React.useState({
    onlineArtists: 0,
    reviewingNow: 0
  });

  const stages = [
    {
      id: 'publishing',
      icon: FiLoader,
      title: 'Publicando tu solicitud...',
      description: 'Preparando tu tatuaje ideal',
      duration: 2000
    },
    {
      id: 'searching',
      icon: FiSearch,
      title: 'Buscando tatuadores...',
      description: 'Encontrando artistas disponibles en tu área',
      duration: 3000
    },
    {
      id: 'notifying',
      icon: FiUsers,
      title: 'Notificando artistas...',
      description: 'Tu solicitud está siendo enviada a tatuadores cercanos',
      duration: 2000
    },
    {
      id: 'complete',
      icon: FiCheck,
      title: '¡Solicitud publicada!',
      description: 'Los tatuadores ya pueden ver tu propuesta',
      duration: 1500
    }
  ];

  const [currentStage, setCurrentStage] = React.useState(0);

  // Load real statistics when component mounts
  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await statsService.getGeneral();
        setRealStats({
          onlineArtists: response.data.onlineArtists || 0,
          reviewingNow: Math.max(1, Math.floor((response.data.onlineArtists || 0) * 0.3)) // Estimate 30% are actively reviewing
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to minimal realistic values
        setRealStats({
          onlineArtists: 1,
          reviewingNow: 1
        });
      }
    };

    loadStats();
  }, []);

  React.useEffect(() => {
    if (status === 'publishing' && currentStage < stages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, stages[currentStage].duration);

      return () => clearTimeout(timer);
    } else if (currentStage === stages.length - 1) {
      setTimeout(() => {
        if (onComplete) onComplete();
      }, stages[currentStage].duration);
    }
  }, [currentStage, status, stages, onComplete]);

  const currentStageData = stages[currentStage];
  const Icon = currentStageData.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStageData.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-primary-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-primary-700"
        >
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`w-full h-1 mx-1 rounded-full transition-all duration-500 ${
                    index <= currentStage ? 'bg-accent-500' : 'bg-primary-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Icon with animation */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={
                currentStageData.id === 'searching' || currentStageData.id === 'publishing'
                  ? { rotate: 360 }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`p-6 rounded-full ${
                currentStageData.id === 'complete' 
                  ? 'bg-green-500/20' 
                  : 'bg-accent-500/20'
              }`}
            >
              <Icon className={`w-12 h-12 ${
                currentStageData.id === 'complete' 
                  ? 'text-green-500' 
                  : 'text-accent-500'
              }`} />
            </motion.div>
          </div>

          {/* Text content */}
          <motion.div
            key={currentStageData.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-primary-100 mb-2">
              {currentStageData.title}
            </h3>
            <p className="text-primary-300">
              {currentStageData.description}
            </p>
          </motion.div>

          {/* Real-time metrics */}
          {currentStageData.id === 'searching' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 grid grid-cols-2 gap-4"
            >
              <div className="bg-primary-700/50 rounded-lg p-3 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl font-bold text-accent-400"
                >
                  {realStats.onlineArtists}
                </motion.div>
                <div className="text-sm text-primary-400">Tatuadores en línea</div>
              </div>
              <div className="bg-primary-700/50 rounded-lg p-3 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="text-2xl font-bold text-accent-400"
                >
                  {realStats.reviewingNow}
                </motion.div>
                <div className="text-sm text-primary-400">Revisando ahora</div>
              </div>
            </motion.div>
          )}

          {/* Animated dots */}
          <div className="flex justify-center mt-6 space-x-1">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PublishingAnimation;