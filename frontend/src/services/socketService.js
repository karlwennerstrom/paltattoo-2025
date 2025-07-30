import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connecting = false;
  }

  connect(authToken) {
    if (this.socket?.connected) {
      console.log('Socket already connected, skipping...');
      return;
    }
    
    if (this.connecting) {
      console.log('Socket connection already in progress, skipping...');
      return;
    }
    
    if (this.socket && !this.socket.connected) {
      console.log('Disconnecting existing socket before reconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connecting = true;
    
    console.log('Connecting socket with token:', authToken ? 'Token present' : 'No token');

    // Remove /api from the URL if present for socket connection
    let socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    if (socketUrl.endsWith('/api')) {
      socketUrl = socketUrl.slice(0, -4);
    }
    console.log('Attempting to connect to socket at:', socketUrl);
    
    this.socket = io(socketUrl, {
      auth: {
        token: authToken
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      forceNew: true,
      transports: ['websocket', 'polling'],
      upgrade: true,
      autoConnect: true
    });

    this.setupBaseListeners();
  }

  setupBaseListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected with ID:', this.socket?.id || 'undefined');
      console.log('Socket transport:', this.socket?.io?.engine?.transport?.name);
      this.connecting = false; // Reset connecting flag
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.connecting = false; // Reset connecting flag on error
      
      // Handle specific error types
      if (error.message.includes('xhr poll error')) {
        console.log('Polling error detected, this is usually temporary');
        // Don't show toast for polling errors as they're often temporary
      } else if (error.message.includes('Authentication')) {
        console.log('Authentication error, token may be invalid');
        // Don't show toast for auth errors to avoid spam
      } else {
        toast.error('Error de conexión en tiempo real');
      }
    });
    
    this.socket.on('reconnect', (attempt) => {
      console.log('Socket reconnected after', attempt, 'attempts');
      toast.success('Conexión en tiempo real restaurada');
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Socket failed to reconnect');
      toast.error('No se pudo restaurar la conexión en tiempo real');
    });

    this.socket.on('notification', (data) => {
      // Show toast notification
      if (data.type === 'info') {
        toast(data.message, { icon: '🔔' });
      } else if (data.type === 'success') {
        toast.success(data.message);
      } else if (data.type === 'error') {
        toast.error(data.message);
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Join offer room for real-time updates
  joinOfferRoom(offerId) {
    if (this.socket) {
      this.socket.emit('join_offer_room', offerId);
    }
  }

  // Leave offer room
  leaveOfferRoom(offerId) {
    if (this.socket) {
      this.socket.emit('leave_offer_room', offerId);
    }
  }

  // Notify that artist is viewing offer
  notifyArtistViewing(offerId) {
    if (this.socket) {
      this.socket.emit('artist_viewing_offer', offerId);
    }
  }

  // Express quick interest
  expressInterest(offerId) {
    if (this.socket) {
      this.socket.emit('artist_interested', { offerId });
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Track listeners for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from tracked listeners
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    }
  }

  // Clean up all listeners for an event
  removeAllListeners(event) {
    if (this.socket && this.listeners.has(event)) {
      const eventListeners = this.listeners.get(event);
      eventListeners.forEach(callback => {
        this.socket.off(event, callback);
      });
      this.listeners.delete(event);
    }
  }

  disconnect() {
    if (this.socket) {
      // Clean up all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
      
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();