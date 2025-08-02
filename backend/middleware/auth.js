const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Por favor autentícate' });
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      throw new Error();
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Por favor autentícate' });
  }
};

const authorizeArtist = async (req, res, next) => {
  if (req.user.user_type !== 'artist') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para tatuadores.' });
  }
  next();
};

const authorizeClient = async (req, res, next) => {
  if (req.user.user_type !== 'client') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para clientes.' });
  }
  next();
};

const authorizeAdmin = async (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo para administradores.' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
        req.token = token;
      }
    }
  } catch (error) {
    // Continue without authentication
  }
  
  next();
};

module.exports = {
  authenticate,
  authorizeArtist,
  authorizeClient,
  authorizeAdmin,
  requireAdmin: authorizeAdmin, // Alias for admin routes
  optionalAuth
};