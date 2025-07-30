import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('SocketProvider effect triggered - isAuthenticated:', isAuthenticated, 'user:', user?.email);
    
    if (isAuthenticated && user) {
      const token = localStorage.getItem('authToken');
      if (token && !socketService.isConnected()) {
        console.log('Connecting socket for authenticated user:', user.email);
        socketService.connect(token);
      }
    } else {
      console.log('Disconnecting socket - not authenticated or no user');
      socketService.disconnect();
    }

    return () => {
      // Don't disconnect on cleanup unless component is unmounting
      console.log('SocketProvider cleanup');
    };
  }, [isAuthenticated, user?.id]); // Use user.id instead of user object to avoid unnecessary re-renders

  const value = {
    socket: socketService,
    joinOfferRoom: (offerId) => socketService.joinOfferRoom(offerId),
    leaveOfferRoom: (offerId) => socketService.leaveOfferRoom(offerId),
    notifyArtistViewing: (offerId) => socketService.notifyArtistViewing(offerId),
    expressInterest: (offerId) => socketService.expressInterest(offerId),
    on: (event, callback) => socketService.on(event, callback),
    off: (event, callback) => socketService.off(event, callback),
    isConnected: () => socketService.isConnected()
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};