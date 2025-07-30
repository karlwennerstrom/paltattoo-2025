const express = require('express');
const router = express.Router();
const TattooArtist = require('../models/TattooArtist');
const Portfolio = require('../models/Portfolio');
const Subscription = require('../models/Subscription');
const { authenticate, authorizeArtist, optionalAuth } = require('../middleware/auth');
const { uploadPortfolio } = require('../config/multer');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const filters = {
      comunaId: req.query.comuna,
      styleId: req.query.style,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      isVerified: req.query.verified === 'true',
      limit: req.query.limit || 20,
      offset: req.query.offset || 0
    };
    
    const artists = await TattooArtist.search(filters);
    
    // Temporarily skip portfolio loading to fix the endpoint
    const artistsWithPortfolio = artists.map(artist => ({
      ...artist,
      portfolio: [] // TODO: Fix portfolio loading
    }));
    
    res.json(artistsWithPortfolio);
  } catch (error) {
    console.error('Search artists error:', error);
    res.status(500).json({ error: 'Error al buscar tatuadores' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const artist = await TattooArtist.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Tatuador no encontrado' });
    }
    
    const [styles, portfolio] = await Promise.all([
      TattooArtist.getStyles(artist.id),
      Portfolio.findByArtist(artist.id)
    ]);
    
    // Try to get subscription, but don't fail if it doesn't work
    let activeSubscription = null;
    try {
      activeSubscription = await Subscription.getActiveByUserId(artist.user_id);
    } catch (error) {
      console.warn('Could not fetch subscription for user:', artist.user_id, error.message);
    }
    
    // Get portfolio limit based on subscription
    let portfolioLimit = 10; // Default for free/basic
    let collectionLimit = 3; // Default for free/basic
    
    if (activeSubscription) {
      try {
        const plan = await Subscription.getPlanById(activeSubscription.plan_id);
        portfolioLimit = plan?.max_portfolio_images || 10;
        collectionLimit = await Subscription.getCollectionLimit(artist.user_id);
      } catch (error) {
        console.warn('Could not fetch subscription plan details:', error.message);
      }
    }
    
    // Limit portfolio based on subscription plan
    const limitedPortfolio = portfolioLimit === -1 
      ? portfolio 
      : portfolio.slice(0, portfolioLimit);
    
    // Group portfolio by category for collections
    const collections = limitedPortfolio.reduce((acc, item) => {
      const category = item.category || 'Sin categoría';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    
    // Limit collections based on subscription
    const collectionKeys = Object.keys(collections);
    const limitedCollections = {};
    const maxCollections = collectionLimit === -1 ? collectionKeys.length : collectionLimit;
    
    for (let i = 0; i < Math.min(collectionKeys.length, maxCollections); i++) {
      const key = collectionKeys[i];
      limitedCollections[key] = collections[key];
    }
    
    res.json({
      ...artist,
      styles,
      portfolio: limitedPortfolio,
      collections: limitedCollections,
      subscription: activeSubscription ? {
        plan_type: activeSubscription.plan_type,
        plan_name: activeSubscription.plan_name,
        portfolio_limit: portfolioLimit,
        collection_limit: collectionLimit,
        features: activeSubscription.features
      } : null
    });
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ error: 'Error al obtener tatuador' });
  }
});

router.put('/profile', authenticate, authorizeArtist, async (req, res) => {
  try {
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const {
      studioName, comunaId, address, yearsExperience,
      minPrice, maxPrice, instagramUrl, styleIds, primaryStyleId
    } = req.body;
    
    const updated = await TattooArtist.update(artist.id, {
      studioName,
      comunaId,
      address,
      yearsExperience,
      minPrice,
      maxPrice,
      instagramUrl
    });
    
    if (!updated) {
      return res.status(400).json({ error: 'Error al actualizar perfil' });
    }
    
    if (styleIds && Array.isArray(styleIds)) {
      await TattooArtist.updateStyles(artist.id, styleIds, primaryStyleId);
    }
    
    const updatedArtist = await TattooArtist.findById(artist.id);
    const styles = await TattooArtist.getStyles(artist.id);
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      artist: {
        ...updatedArtist,
        styles
      }
    });
  } catch (error) {
    console.error('Update artist profile error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

router.post('/portfolio', authenticate, authorizeArtist, uploadPortfolio.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es requerida' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const { title, description, styleId, isFeatured } = req.body;
    
    const portfolioId = await Portfolio.create({
      artistId: artist.id,
      imageUrl: req.file.filename,
      title,
      description,
      styleId: styleId ? parseInt(styleId) : null,
      isFeatured: isFeatured === 'true'
    });
    
    const portfolioItem = await Portfolio.findById(portfolioId);
    
    res.status(201).json({
      message: 'Imagen agregada al portafolio',
      portfolio: portfolioItem
    });
  } catch (error) {
    console.error('Add portfolio error:', error);
    res.status(500).json({ error: 'Error al agregar imagen al portafolio' });
  }
});

router.get('/portfolio/:artistId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findByArtist(req.params.artistId);
    res.json(portfolio);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Error al obtener portafolio' });
  }
});

module.exports = router;