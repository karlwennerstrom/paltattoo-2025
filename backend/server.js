const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const http = require('http');
const socketService = require('./services/socketService');
const ensureDirectories = require('./utils/ensureDirectories');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const server = http.createServer(app);

ensureDirectories();

// Trust proxy - required when behind a reverse proxy (Railway, Heroku, etc.)
// This allows Express to correctly identify client IPs from X-Forwarded-* headers
// Use specific configuration instead of 'true' for security
if (process.env.NODE_ENV === 'production') {
  // In production, trust the first proxy (Railway, Vercel, etc.)
  app.set('trust proxy', 1);
} else {
  // In development, don't trust any proxies
  app.set('trust proxy', false);
}

// Security middleware - Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://sdk.mercadopago.com", "https://www.mercadopago.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.mercadopago.com", "wss:", "ws:"],
      frameSrc: ["'self'", "https://www.mercadopago.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some external resources
  frameguard: { action: 'deny' }, // Explicit X-Frame-Options header
}));

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Demasiados intentos de autenticación, por favor intenta de nuevo más tarde.',
  skipSuccessfulRequests: true,
});

// Configure CORS for development and production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL] 
  : ["http://localhost:3000", "http://127.0.0.1:3000", "https://paltattoo-2025.vercel.app"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Cookie parser middleware
app.use(cookieParser());

// Webhook endpoint needs raw body for signature validation
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Other routes use JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads from Railway Volume or local path
const { getRailwayUploadPath } = require('./utils/railwayStorage');
const uploadsPath = getRailwayUploadPath();
app.use('/uploads', express.static(uploadsPath));

// Session configuration for Passport
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET not set in environment variables!');
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'paltattoo_session', // Change default session name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require('./routes/auth');
const catalogRoutes = require('./routes/catalogs');
const artistRoutes = require('./routes/artists');
const offerRoutes = require('./routes/offers');
const profileRoutes = require('./routes/profile');
const portfolioRoutes = require('./routes/portfolio');
const proposalRoutes = require('./routes/proposals');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const calendarRoutes = require('./routes/calendar');
const sponsoredShopsRoutes = require('./routes/sponsoredShops');
const statsRoutes = require('./routes/stats');
const subscriptionRoutes = require('./routes/subscriptions');
const collectionRoutes = require('./routes/collections');
const interestRoutes = require('./routes/interest');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'TattooConnect API is running',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      catalogs: '/api/catalogs',
      artists: '/api/artists',
      offers: '/api/offers',
      profile: '/api/profile',
      portfolio: '/api/portfolio',
      proposals: '/api/proposals',
      notifications: '/api/notifications',
      payments: '/api/payments',
      calendar: '/api/calendar',
      sponsoredShops: '/api/sponsored-shops',
      collections: '/api/collections'
    }
  });
});

// Health check endpoint for Railway
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { testConnection } = require('./config/database');
    const dbHealthy = await testConnection();
    
    const healthStatus = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    if (dbHealthy) {
      res.status(200).json(healthStatus);
    } else {
      res.status(503).json(healthStatus);
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/sponsored-shops', sponsoredShopsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/interest', interestRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Socket.io
socketService.initialize(server);

// Test database connection before starting server
const { testConnection } = require('./config/database');

// Check required environment variables
function checkRequiredEnvVars() {
  const required = [
    'SESSION_SECRET',
    'JWT_SECRET',
    'DB_HOST',
    'DB_USER', 
    'DB_PASSWORD',
    'DB_NAME'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please set these variables before starting the server.');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

async function startServer() {
  try {
    console.log('🔍 Checking environment variables...');
    checkRequiredEnvVars();
    
    console.log('🔗 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📋 API documentation available at http://localhost:${PORT}`);
      console.log(`🔌 Socket.io server initialized`);
      console.log(`📁 Uploads directory: ${uploadsPath}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 Trust proxy: ${app.get('trust proxy')}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated gracefully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();