import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const GoogleButton = ({ onClick, disabled = false, text = 'Continuar con Google' }) => {
  const handleClick = () => {
    if (disabled) return;
    
    // Redirect to Google OAuth
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-center px-4 py-2 
        border border-primary-600 rounded-lg 
        bg-primary-800 hover:bg-primary-700 
        text-primary-100 font-medium 
        transition-all duration-200 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
      `}
    >
      <FcGoogle className="w-5 h-5 mr-3" />
      {text}
    </button>
  );
};

export default GoogleButton;