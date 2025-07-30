const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
// const Redis = require('ioredis');

class SocketService {
  constructor() {
    this.io = null;
    // this.redis = new Redis({
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: process.env.REDIS_PORT || 6379,
    // });
    this.connectedUsers = new Map();
    this.artistsOnline = new Set();
    this.offerViews = new Map(); // In-memory storage instead of Redis
    this.offerInterests = new Map(); // In-memory storage instead of Redis
  }

  initialize(server) {
    console.log('Initializing Socket.io server...');
    this.io = socketIO(server, {
      cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true
      },
      allowEIO3: true,
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        console.log('Socket auth attempt with token:', token ? 'Present' : 'Missing');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userType = decoded.userType;
        
        // Also fetch user from DB to get correct user_type
        const User = require('../models/User');
        const user = await User.findById(decoded.userId);
        if (user) {
          socket.userType = user.user_type;
        }
        
        console.log(`Socket authenticated - User ID: ${socket.userId}, Type: ${socket.userType}`);
        next();
      } catch (err) {
        console.error('Socket auth error:', err.message);
        next(new Error('Authentication error: ' + err.message));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`🟢 User connected: ${socket.userId} (Type: ${socket.userType})`);
      this.handleConnection(socket);
    });
    
    this.io.on('connect_error', (error) => {
      console.log('❌ Socket connection error:', error);
    });
  }

  handleConnection(socket) {
    // Store user connection
    this.connectedUsers.set(socket.userId, socket.id);
    console.log(`User ${socket.userId} connected, userType: ${socket.userType}`);
    
    if (socket.userType === 'artist') {
      this.artistsOnline.add(socket.userId);
      console.log(`Artist ${socket.userId} added to online list. Total online: ${this.artistsOnline.size}`);
      this.broadcastArtistsOnlineCount();
    }

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Socket event handlers
    socket.on('join_offer_room', (offerId) => {
      socket.join(`offer_${offerId}`);
      this.trackOfferView(offerId, socket.userId);
    });

    socket.on('leave_offer_room', (offerId) => {
      socket.leave(`offer_${offerId}`);
    });

    socket.on('artist_viewing_offer', (offerId) => {
      this.notifyOfferOwner(offerId, {
        type: 'artist_viewing',
        artistId: socket.userId,
        message: 'Un tatuador está revisando tu solicitud'
      });
    });

    socket.on('artist_interested', async (data) => {
      const { offerId } = data;
      await this.recordArtistInterest(offerId, socket.userId);
      this.notifyOfferOwner(offerId, {
        type: 'artist_interested',
        artistId: socket.userId,
        message: 'Un tatuador está interesado en tu solicitud'
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      this.connectedUsers.delete(socket.userId);
      
      if (socket.userType === 'artist') {
        this.artistsOnline.delete(socket.userId);
        this.broadcastArtistsOnlineCount();
      }
    });
  }

  // Emit offer creation with animation
  emitOfferCreated(offer) {
    this.io.emit('new_offer_available', {
      offer,
      timestamp: new Date()
    });
  }

  // Notify specific user
  notifyUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Notify offer owner about activity
  notifyOfferOwner(offerId, notification) {
    this.io.to(`offer_${offerId}`).emit('offer_activity', notification);
  }

  // Track offer views
  async trackOfferView(offerId, userId) {
    const key = `offer_views:${offerId}`;
    if (!this.offerViews.has(key)) {
      this.offerViews.set(key, new Set());
    }
    this.offerViews.get(key).add(userId);
    const viewCount = this.offerViews.get(key).size;
    
    this.io.to(`offer_${offerId}`).emit('offer_stats_update', {
      views: viewCount,
      timestamp: new Date()
    });
  }

  // Record artist interest
  async recordArtistInterest(offerId, artistId) {
    const key = `offer_interest:${offerId}`;
    if (!this.offerInterests.has(key)) {
      this.offerInterests.set(key, new Set());
    }
    this.offerInterests.get(key).add(artistId);
    const interestCount = this.offerInterests.get(key).size;
    
    this.io.to(`offer_${offerId}`).emit('offer_stats_update', {
      interested: interestCount,
      timestamp: new Date()
    });
  }

  // Broadcast online artists count
  broadcastArtistsOnlineCount() {
    const count = this.artistsOnline.size;
    console.log(`📢 Broadcasting artists online count: ${count}`);
    this.io.emit('artists_online_count', {
      count: count,
      timestamp: new Date()
    });
  }

  // Update offer status with animation
  updateOfferStatus(offerId, status, metadata = {}) {
    this.io.to(`offer_${offerId}`).emit('offer_status_change', {
      offerId,
      status,
      metadata,
      timestamp: new Date()
    });
  }

  // New proposal notification
  notifyNewProposal(offerId, proposal) {
    this.io.to(`offer_${offerId}`).emit('new_proposal', {
      proposal,
      timestamp: new Date()
    });
  }

  getIO() {
    return this.io;
  }
}

module.exports = new SocketService();