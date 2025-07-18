const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticate, authorizeArtist } = require('../middleware/auth');
const { uploadPortfolio, uploadMultiplePortfolio } = require('../config/multer');

// GET /api/portfolio/my - Get portfolio items for current artist (artist only)
router.get('/my', 
  authenticate, 
  authorizeArtist, 
  portfolioController.getMyPortfolioItems
);

// GET /api/portfolio/:artistId - Get portfolio items for an artist (public)
router.get('/:artistId', portfolioController.getPortfolioItems);

// POST /api/portfolio - Create a new portfolio item (artist only)
router.post('/', 
  authenticate, 
  authorizeArtist, 
  portfolioController.createPortfolioItem
);

// PUT /api/portfolio/:itemId - Update portfolio item (artist only)
router.put('/:itemId', 
  authenticate, 
  authorizeArtist, 
  portfolioController.updatePortfolioItem
);

// DELETE /api/portfolio/:itemId - Delete portfolio item (artist only)
router.delete('/:itemId', 
  authenticate, 
  authorizeArtist, 
  portfolioController.deletePortfolioItem
);

// POST /api/portfolio/upload - Upload media for portfolio (artist only)
router.post('/upload', 
  authenticate, 
  authorizeArtist, 
  uploadPortfolio.single('media'), 
  portfolioController.uploadPortfolioMedia
);

// POST /api/portfolio/upload-multiple - Upload multiple media files (artist only)
router.post('/upload-multiple', 
  authenticate, 
  authorizeArtist, 
  uploadMultiplePortfolio.array('media', 10), 
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Al menos un archivo es requerido' });
      }
      
      const results = [];
      const errors = [];
      
      for (const file of req.files) {
        try {
          // Create a mock request for each file
          const mockReq = {
            ...req,
            file: file,
            body: {
              ...req.body,
              title: req.body.title || file.originalname.split('.')[0],
              description: req.body.description || ''
            }
          };
          
          const mockRes = {
            status: () => mockRes,
            json: (data) => {
              if (data.error) {
                errors.push({
                  file: file.originalname,
                  error: data.error
                });
              } else {
                results.push({
                  file: file.originalname,
                  item: data.item
                });
              }
            }
          };
          
          await portfolioController.uploadPortfolioMedia(mockReq, mockRes);
        } catch (error) {
          errors.push({
            file: file.originalname,
            error: error.message
          });
        }
      }
      
      res.json({
        message: `Procesados ${req.files.length} archivos`,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ error: 'Error al subir archivos múltiples' });
    }
  }
);

// GET /api/portfolio/stats/my - Get portfolio statistics for current artist
router.get('/stats/my', 
  authenticate, 
  authorizeArtist, 
  portfolioController.getPortfolioStats
);

// POST /api/portfolio/:itemId/feature - Set/unset item as featured
router.post('/:itemId/feature', 
  authenticate, 
  authorizeArtist, 
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const { featured } = req.body;
      
      const portfolioItem = await require('../models/Portfolio').findById(itemId);
      
      if (!portfolioItem) {
        return res.status(404).json({ error: 'Item del portafolio no encontrado' });
      }
      
      const artist = await require('../models/TattooArtist').findByUserId(req.user.id);
      
      if (!artist || portfolioItem.artist_id !== artist.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este item' });
      }
      
      if (featured) {
        // Set as featured (remove featured status from other items)
        await require('../models/Portfolio').setFeatured(itemId, artist.id);
      } else {
        // Remove featured status
        await require('../models/Portfolio').update(itemId, { isFeatured: false });
      }
      
      const updatedItem = await require('../models/Portfolio').findById(itemId);
      
      res.json({
        message: featured ? 'Item marcado como destacado' : 'Item removido de destacados',
        item: updatedItem
      });
    } catch (error) {
      console.error('Feature portfolio item error:', error);
      res.status(500).json({ error: 'Error al cambiar estado destacado' });
    }
  }
);

// GET /api/portfolio/featured/:artistId - Get featured items for an artist
router.get('/featured/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    
    const featuredItem = await require('../models/Portfolio').getFeatured(artistId);
    
    if (!featuredItem) {
      return res.status(404).json({ error: 'No hay items destacados' });
    }
    
    const itemWithUrl = {
      ...featuredItem,
      imageUrl: `/uploads/portfolio/${featuredItem.image_url}`,
      thumbnailUrl: featuredItem.thumbnail_url ? `/uploads/portfolio/${featuredItem.thumbnail_url}` : null
    };
    
    res.json(itemWithUrl);
  } catch (error) {
    console.error('Get featured portfolio error:', error);
    res.status(500).json({ error: 'Error al obtener item destacado' });
  }
});

// GET /api/portfolio/category/:category - Get portfolio items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // This would need a new model method to get items by category across all artists
    // For now, return empty array
    res.json({
      category,
      items: [],
      total: 0
    });
  } catch (error) {
    console.error('Get portfolio by category error:', error);
    res.status(500).json({ error: 'Error al obtener items por categoría' });
  }
});

module.exports = router;