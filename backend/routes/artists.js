const express = require('express');
const router = express.Router();
const TattooArtist = require('../models/TattooArtist');
const Portfolio = require('../models/Portfolio');
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
    
    res.json({
      ...artist,
      styles,
      portfolio
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