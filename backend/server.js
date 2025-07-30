const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const http = require('http');
const socketService = require('./services/socketService');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');

// Test database connection on startup
testConnection();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'TattooConnect API is running',
    version: '1.0.0',
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

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Socket.io
socketService.initialize(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}`);
  console.log(`Socket.io server initialized`);
});