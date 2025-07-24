import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { FiLock, FiArrowRight } from 'react-icons/fi';

const UpgradePrompt = ({ 
  title = "Actualiza tu plan para acceder a esta funcionalidad",
  description = "Esta función requiere un plan premium o superior",
  size = "md",
  showIcon = true 
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // First navigate to artist dashboard, then switch to payments tab
    navigate('/artist');
    
    // Dispatch custom event to switch to payments tab
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('switchTab', {
        detail: { tab: 'payments' }
      }));
    }, 100);
  };

  return (
    <div className="bg-primary-800 border border-primary-600 rounded-lg p-6 text-center">
      {showIcon && (
        <div className="mb-4">
          <div className="mx-auto w-12 h-12 bg-accent-600 bg-opacity-20 rounded-full flex items-center justify-center">
            <FiLock className="w-6 h-6 text-accent-400" />
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-primary-100 mb-2">
        {title}
      </h3>
      
      <p className="text-primary-400 mb-6 text-sm">
        {description}
      </p>
      
      <Button 
        variant="primary" 
        onClick={handleUpgrade}
        className="bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400"
      >
        Actualiza tu plan
        <FiArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
};

export default UpgradePrompt;