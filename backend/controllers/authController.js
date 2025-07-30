const { body } = require('express-validator');
const User = require('../models/User');
const TattooArtist = require('../models/TattooArtist');
const Client = require('../models/Client');
const Collection = require('../models/Collection');
const { generateToken } = require('../config/jwt');
const { handleValidationErrors } = require('../middleware/validation');
const emailService = require('../services/emailService');

const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('userType').isIn(['client', 'artist']).withMessage('Tipo de usuario inválido'),
  body('firstName').notEmpty().withMessage('El nombre es requerido'),
  body('lastName').notEmpty().withMessage('El apellido es requerido')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

const register = async (req, res) => {
  try {
    const { email, password, userType, firstName, lastName, phone } = req.body;
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    
    const userId = await User.create({ email, password, userType });
    
    await User.updateProfile(userId, {
      firstName,
      lastName,
      phone: phone || null,
      bio: null,
      profileImage: null
    });
    
    if (userType === 'artist') {
      const existingArtist = await TattooArtist.findByUserId(userId);
      if (!existingArtist) {
        const artistData = await TattooArtist.create({ 
          userId,
          studioName: null,
          comunaId: null,
          address: null,
          yearsExperience: 0,
          minPrice: null,
          maxPrice: null,
          instagramUrl: null
        });
        
        // Create default collection for the new artist
        try {
          await Collection.createDefaultCollection(artistData.id);
        } catch (collectionError) {
          console.error('Error creating default collection:', collectionError);
          // Continue without failing the registration
        }
      }
    } else if (userType === 'client') {
      const existingClient = await Client.findByUserId(userId);
      if (!existingClient) {
        await Client.create({ 
          userId,
          comunaId: null,
          birthDate: null
        });
      }
    }
    
    const token = generateToken(userId, userType);
    const user = await User.getProfile(userId);
    
    // Send welcome email
    emailService.sendWelcome({
      email: user.email,
      firstName: user.first_name,
      type: user.user_type
    }).catch(err => console.error('Welcome email error:', err));
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        user_type: user.user_type, // Keep both for compatibility
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        profileImage: user.profile_image
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = generateToken(user.id, user.user_type);
    const profile = await User.getProfile(user.id);
    
    res.json({
      message: 'Login exitoso',
      user: {
        id: profile.id,
        email: profile.email,
        userType: profile.user_type,
        user_type: profile.user_type, // Keep both for compatibility
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        profileImage: profile.profile_image,
        subscription: profile.subscription_plan_name ? {
          planId: profile.subscription_plan_id,
          planName: profile.subscription_plan_name,
          status: profile.subscription_status,
          price: profile.subscription_plan_price
        } : {
          // Default to Basic plan if no subscription found
          planId: 'basic',
          planName: 'basico',
          status: 'active',
          price: 0
        }
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await User.getProfile(req.user.id);
    
    // Debug logs
    console.log('🔍 Profile Debug for user', req.user.id, ':', {
      subscription_plan_id: profile.subscription_plan_id,
      subscription_plan_name: profile.subscription_plan_name,
      subscription_status: profile.subscription_status,
      subscription_plan_price: profile.subscription_plan_price
    });
    
    res.json({
      user: {
        id: profile.id,
        email: profile.email,
        userType: profile.user_type,
        user_type: profile.user_type, // Keep both for compatibility
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        bio: profile.bio,
        profileImage: profile.profile_image,
        subscription: profile.subscription_plan_name ? {
          planId: profile.subscription_plan_id,
          planName: profile.subscription_plan_name,
          status: profile.subscription_status,
          price: profile.subscription_plan_price
        } : {
          // Default to Basic plan if no subscription found
          planId: 'basic',
          planName: 'basico',
          status: 'active',
          price: 0
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio } = req.body;
    const profileImage = req.file ? req.file.filename : undefined;
    
    const updated = await User.updateProfile(req.user.id, {
      firstName,
      lastName,
      phone,
      bio,
      profileImage
    });
    
    if (!updated) {
      return res.status(400).json({ error: 'Error al actualizar perfil' });
    }
    
    const profile = await User.getProfile(req.user.id);
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: profile.id,
        email: profile.email,
        userType: profile.user_type,
        user_type: profile.user_type, // Keep both for compatibility
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        bio: profile.bio,
        profileImage: profile.profile_image
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

const logout = async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from localStorage
    // Here we just return a success message
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

// Google OAuth handlers
const googleAuth = (req, res, next) => {
  const passport = require('passport');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

const googleCallback = (req, res, next) => {
  const passport = require('passport');
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }
    
    if (!user) {
      console.error('Google OAuth: No user returned');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    
    try {
      // Check if user needs to complete profile
      let isCompleted = await User.isProfileCompleted(user.id);
      
      // If profile is not marked as completed but user has a type, fix it
      if (!isCompleted && user.user_type) {
        console.log(`Profile completion issue detected for user ${user.id}, attempting to fix...`);
        await User.fixIncompleteProfiles();
        isCompleted = await User.isProfileCompleted(user.id);
      }
      
      if (!isCompleted) {
        // Generate temporary token for profile completion
        const tempToken = generateToken(user.id, 'incomplete');
        return res.redirect(`${process.env.FRONTEND_URL}/complete-profile?token=${tempToken}`);
      }
      
      // Generate JWT token for completed profile
      const token = generateToken(user.id, user.user_type);
      
      // Redirect to frontend with token
      return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth token generation error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_error`);
    }
  })(req, res, next);
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });
    }
    
    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    
    // Store token in database (you'll need to add this field to users table)
    await User.setPasswordResetToken(user.id, resetToken);
    
    // Send reset email
    try {
      await emailService.sendPasswordReset(user, resetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({ error: 'Error al enviar email de restablecimiento' });
    }
    
    res.json({ message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña son requeridos' });
    }
    
    const user = await User.findByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    
    // Update password
    await User.updatePassword(user.id, password);
    
    // Clear reset token
    await User.clearPasswordResetToken(user.id);
    
    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};

const completeProfile = async (req, res) => {
  try {
    const { userType, firstName, lastName, phone, bio } = req.body;
    
    if (!userType || !['client', 'artist'].includes(userType)) {
      return res.status(400).json({ error: 'Tipo de usuario inválido' });
    }
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }
    
    // Complete the profile
    const success = await User.completeGoogleProfile(req.user.id, {
      userType,
      firstName,
      lastName,
      phone,
      bio
    });
    
    if (!success) {
      return res.status(400).json({ error: 'Error al completar perfil' });
    }
    
    // Create artist or client specific record if it doesn't exist
    if (userType === 'artist') {
      const existingArtist = await TattooArtist.findByUserId(req.user.id);
      if (!existingArtist) {
        const artistData = await TattooArtist.create({ 
          userId: req.user.id,
          studioName: null,
          comunaId: null,
          address: null,
          yearsExperience: 0,
          minPrice: null,
          maxPrice: null,
          instagramUrl: null
        });
        
        // Create default collection for the new artist
        try {
          await Collection.createDefaultCollection(artistData.id);
        } catch (collectionError) {
          console.error('Error creating default collection:', collectionError);
          // Continue without failing the profile completion
        }
      }
    } else if (userType === 'client') {
      const existingClient = await Client.findByUserId(req.user.id);
      if (!existingClient) {
        await Client.create({ 
          userId: req.user.id,
          comunaId: null,
          birthDate: null
        });
      }
    }
    
    // Generate new token with correct user type
    const token = generateToken(req.user.id, userType);
    const profile = await User.getProfile(req.user.id);
    
    // Send welcome email
    emailService.sendWelcome({
      email: profile.email,
      firstName: profile.first_name,
      type: profile.user_type
    }).catch(err => console.error('Welcome email error:', err));
    
    res.json({
      message: 'Perfil completado exitosamente',
      user: {
        id: profile.id,
        email: profile.email,
        userType: profile.user_type,
        user_type: profile.user_type, // Keep both for compatibility
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        bio: profile.bio,
        profileImage: profile.profile_image
      },
      token
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Error al completar perfil' });
  }
};

module.exports = {
  register: [registerValidation, handleValidationErrors, register],
  login: [loginValidation, handleValidationErrors, login],
  logout,
  getProfile,
  updateProfile,
  googleAuth,
  googleCallback,
  completeProfile,
  forgotPassword,
  resetPassword
};