const User = require('../models/User');
const TattooArtist = require('../models/TattooArtist');
const Client = require('../models/Client');
const Portfolio = require('../models/Portfolio');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const promisePool = require('../config/database');
const emailService = require('../services/emailService');

const getProfile = async (req, res) => {
  try {
    const profile = await User.getProfile(req.user.id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    
    let additionalData = {};
    
    if (req.user.user_type === 'artist') {
      const artist = await TattooArtist.findByUserId(req.user.id);
      if (artist) {
        const [styles, portfolio] = await Promise.all([
          TattooArtist.getStyles(artist.id),
          Portfolio.findByArtist(artist.id, 5)
        ]);
        additionalData = {
          artistProfile: artist,
          styles,
          recentPortfolio: portfolio
        };
      }
    } else if (req.user.user_type === 'client') {
      const client = await Client.findByUserId(req.user.id);
      if (client) {
        const favorites = await Client.getFavorites(client.id);
        additionalData = {
          clientProfile: client,
          favorites: favorites.slice(0, 5)
        };
      }
    }
    
    res.json({
      user: {
        id: profile.id,
        email: profile.email,
        userType: profile.user_type,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        bio: profile.bio,
        profileImage: profile.profile_image,
        createdAt: profile.created_at
      },
      ...additionalData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      phone, 
      bio,
      // Artist specific fields
      instagram,
      region,
      comuna,
      street,
      studioName,
      studioAddress,
      experienceYears,
      specialties,
      acceptingWork
    } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }
    
    // Update basic user profile
    const updated = await User.updateProfile(req.user.id, {
      firstName,
      lastName,
      phone: phone || null,
      bio: bio || null
    });
    
    if (!updated) {
      return res.status(400).json({ error: 'Error al actualizar perfil' });
    }
    
    // If user is an artist, update artist-specific data
    if (req.user.user_type === 'artist') {
      const artist = await TattooArtist.findByUserId(req.user.id);
      if (artist) {
        // Update artist data - map fields to match database columns
        const artistUpdateData = {
          instagram_url: instagram || null,
          studio_name: studioName || null,
          address: studioAddress || null, // Using address field for studio address
          years_experience: experienceYears || null
        };
        
        // Handle location data separately if needed
        if (region && comuna) {
          // Get comuna_id from comuna name and region
          const [comunaRows] = await promisePool.execute(
            'SELECT id, region FROM comunas WHERE name = ? AND region = ?',
            [comuna, region]
          );
          if (comunaRows.length > 0) {
            artistUpdateData.comuna_id = comunaRows[0].id;
          }
        } else if (comuna && !region) {
          // If only comuna is provided, try to find it (less reliable)
          const [comunaRows] = await promisePool.execute(
            'SELECT id FROM comunas WHERE name = ?',
            [comuna]
          );
          if (comunaRows.length > 0) {
            artistUpdateData.comuna_id = comunaRows[0].id;
          }
        }
        
        await TattooArtist.update(artist.id, artistUpdateData);
        
        // Update specialties if provided
        if (specialties && Array.isArray(specialties)) {
          await TattooArtist.updateStyles(artist.id, specialties);
        }
      }
    }
    
    const profile = await User.getProfile(req.user.id);
    
    // Prepare updated fields list for email
    const updatedFields = [];
    if (firstName !== profile.first_name || lastName !== profile.last_name) {
      updatedFields.push('nombre completo');
    }
    if (phone && phone !== profile.phone) {
      updatedFields.push('teléfono');
    }
    if (bio && bio !== profile.bio) {
      updatedFields.push('biografía');
    }
    if (instagram || region || comuna || street || studioName || experienceYears || specialties) {
      if (req.user.user_type === 'artist') {
        if (instagram) updatedFields.push('Instagram');
        if (region && comuna) updatedFields.push('ubicación');
        if (street) updatedFields.push('dirección');
        if (studioName) updatedFields.push('nombre del estudio');
        if (experienceYears) updatedFields.push('años de experiencia');
        if (specialties && Array.isArray(specialties)) updatedFields.push('especialidades');
      }
    }
    
    // Send email notification about profile update
    try {
      if (updatedFields.length > 0) {
        await emailService.sendProfileUpdated({
          email: profile.email,
          firstName: profile.first_name,
          userType: profile.user_type
        }, updatedFields);
      }
    } catch (emailError) {
      console.error('Error sending profile update email:', emailError);
      // Don't fail the entire request if email fails
    }
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: profile.id,
        email: profile.email,
        userType: profile.user_type,
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

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es requerida' });
    }
    
    const originalPath = req.file.path;
    const filename = `profile-${req.user.id}-${Date.now()}.jpg`;
    const outputPath = path.join(req.file.destination, filename);
    
    await sharp(originalPath)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
    
    await fs.unlink(originalPath);
    
    const currentProfile = await User.getProfile(req.user.id);
    if (currentProfile.profile_image) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', currentProfile.profile_image);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.log('Old image not found or already deleted');
      }
    }
    
    const updated = await User.updateProfile(req.user.id, {
      firstName: currentProfile.first_name,
      lastName: currentProfile.last_name,
      phone: currentProfile.phone,
      bio: currentProfile.bio,
      profileImage: filename
    });
    
    if (!updated) {
      return res.status(400).json({ error: 'Error al actualizar imagen de perfil' });
    }
    
    res.json({
      message: 'Imagen de perfil actualizada exitosamente',
      profileImage: filename,
      imageUrl: `/uploads/profiles/${filename}`
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting failed upload:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Error al subir imagen de perfil' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    
    const profile = await User.getProfile(userId);
    
    if (!profile || !profile.is_active) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const publicProfile = {
      id: profile.id,
      userType: profile.user_type,
      firstName: profile.first_name,
      lastName: profile.last_name,
      bio: profile.bio,
      profileImage: profile.profile_image,
      memberSince: profile.created_at
    };
    
    if (profile.user_type === 'artist') {
      const artist = await TattooArtist.findByUserId(userId);
      if (artist) {
        const [styles, portfolio] = await Promise.all([
          TattooArtist.getStyles(artist.id),
          Portfolio.findByArtist(artist.id)
        ]);
        
        publicProfile.artistProfile = {
          studioName: artist.studio_name,
          comunaName: artist.comuna_name,
          region: artist.region,
          yearsExperience: artist.years_experience,
          minPrice: artist.min_price,
          maxPrice: artist.max_price,
          instagramUrl: artist.instagram_url,
          isVerified: artist.is_verified,
          rating: artist.rating,
          totalReviews: artist.total_reviews
        };
        publicProfile.styles = styles;
        publicProfile.portfolio = portfolio;
      }
    } else if (profile.user_type === 'client') {
      const client = await Client.findByUserId(userId);
      if (client) {
        publicProfile.clientProfile = {
          comunaName: client.comuna_name,
          region: client.region,
          memberSince: client.created_at
        };
      }
    }
    
    res.json(publicProfile);
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Error al obtener perfil público' });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const currentProfile = await User.getProfile(req.user.id);
    
    if (!currentProfile.profile_image) {
      return res.status(400).json({ error: 'No hay imagen de perfil para eliminar' });
    }
    
    const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', currentProfile.profile_image);
    
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.log('Image file not found or already deleted');
    }
    
    const updated = await User.updateProfile(req.user.id, {
      firstName: currentProfile.first_name,
      lastName: currentProfile.last_name,
      phone: currentProfile.phone,
      bio: currentProfile.bio,
      profileImage: null
    });
    
    if (!updated) {
      return res.status(400).json({ error: 'Error al eliminar imagen de perfil' });
    }
    
    res.json({
      message: 'Imagen de perfil eliminada exitosamente'
    });
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({ error: 'Error al eliminar imagen de perfil' });
  }
};

const getProfileStats = async (req, res) => {
  try {
    const stats = {
      profileCompleteness: 0,
      totalFields: 6,
      completedFields: 0
    };
    
    const profile = await User.getProfile(req.user.id);
    
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.phone,
      profile.bio,
      profile.profile_image
    ];
    
    stats.completedFields = fields.filter(field => field && field.trim() !== '').length + 1; // +1 for email
    stats.profileCompleteness = Math.round((stats.completedFields / stats.totalFields) * 100);
    
    let additionalStats = {};
    
    if (req.user.user_type === 'artist') {
      const artist = await TattooArtist.findByUserId(req.user.id);
      if (artist) {
        const [portfolioCount, stylesCount] = await Promise.all([
          Portfolio.countByArtist(artist.id),
          TattooArtist.getStyles(artist.id).then(styles => styles.length)
        ]);
        
        additionalStats = {
          portfolioImages: portfolioCount,
          specialtyStyles: stylesCount,
          isVerified: artist.is_verified,
          rating: artist.rating,
          totalReviews: artist.total_reviews
        };
      }
    } else if (req.user.user_type === 'client') {
      const client = await Client.findByUserId(req.user.id);
      if (client) {
        const [offersCount, favoritesCount] = await Promise.all([
          Client.getOffers(client.id).then(offers => offers.length),
          Client.getFavorites(client.id).then(favorites => favorites.length)
        ]);
        
        additionalStats = {
          totalOffers: offersCount,
          favoriteArtists: favoritesCount
        };
      }
    }
    
    res.json({
      ...stats,
      ...additionalStats
    });
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del perfil' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getPublicProfile,
  deleteProfileImage,
  getProfileStats
};