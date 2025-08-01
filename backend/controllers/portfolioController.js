const Portfolio = require('../models/Portfolio');
const TattooArtist = require('../models/TattooArtist');
const Collection = require('../models/Collection');
const ImageProcessor = require('../utils/imageProcessor');
const VideoProcessor = require('../utils/videoProcessor');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const path = require('path');
const fs = require('fs').promises;
const { getRailwayUploadPath } = require('../utils/railwayStorage');

const createPortfolioValidation = [
  body('title').optional().isLength({ max: 255 }).withMessage('El título no puede exceder 255 caracteres'),
  body('description').optional().isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres'),
  body('styleId').optional().isInt().withMessage('ID de estilo inválido'),
  body('category').optional().isLength({ max: 50 }).withMessage('La categoría no puede exceder 50 caracteres')
];

const updatePortfolioValidation = [
  param('itemId').isInt().withMessage('ID de item inválido'),
  body('title').optional().isLength({ max: 255 }).withMessage('El título no puede exceder 255 caracteres'),
  body('description').optional().isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres'),
  body('styleId').optional().isInt().withMessage('ID de estilo inválido'),
  body('category').optional().isLength({ max: 50 }).withMessage('La categoría no puede exceder 50 caracteres')
];

const getPortfolioItems = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { category, mediaType, limit, offset } = req.query;
    
    if (!artistId || isNaN(artistId)) {
      return res.status(400).json({ error: 'ID de artista inválido' });
    }
    
    const artist = await TattooArtist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ error: 'Artista no encontrado' });
    }
    
    let portfolioItems = await Portfolio.findByArtist(artistId, limit);
    
    // Filter by category if specified
    if (category) {
      portfolioItems = portfolioItems.filter(item => item.category === category);
    }
    
    // Filter by media type if specified
    if (mediaType) {
      portfolioItems = portfolioItems.filter(item => item.media_type === mediaType);
    }
    
    // Apply offset if specified
    if (offset) {
      portfolioItems = portfolioItems.slice(parseInt(offset));
    }
    
    const itemsWithUrls = portfolioItems.map(item => ({
      ...item,
      imageUrl: `/uploads/portfolio/${item.image_url}`,
      thumbnailUrl: item.thumbnail_url ? `/uploads/portfolio/${item.thumbnail_url}` : null
    }));
    
    res.json({
      items: itemsWithUrls,
      total: portfolioItems.length,
      artist: {
        id: artist.id,
        studioName: artist.studio_name,
        firstName: artist.first_name,
        lastName: artist.last_name
      }
    });
  } catch (error) {
    console.error('Get portfolio items error:', error);
    res.status(500).json({ error: 'Error al obtener items del portafolio' });
  }
};

const getMyPortfolioItems = async (req, res) => {
  try {
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const { category, mediaType, limit, offset } = req.query;
    
    let portfolioItems = await Portfolio.findByArtist(artist.id, limit);
    
    // Filter by category if specified
    if (category) {
      portfolioItems = portfolioItems.filter(item => item.category === category);
    }
    
    // Filter by media type if specified
    if (mediaType) {
      portfolioItems = portfolioItems.filter(item => item.media_type === mediaType);
    }
    
    // Apply offset if specified
    if (offset) {
      portfolioItems = portfolioItems.slice(parseInt(offset));
    }
    
    const itemsWithUrls = portfolioItems.map(item => ({
      ...item,
      imageUrl: `/uploads/portfolio/${item.image_url}`,
      thumbnailUrl: item.thumbnail_url ? `/uploads/portfolio/${item.thumbnail_url}` : null
    }));
    
    res.json({
      items: itemsWithUrls,
      total: portfolioItems.length,
      artist: {
        id: artist.id,
        studioName: artist.studio_name,
        firstName: artist.first_name,
        lastName: artist.last_name
      }
    });
  } catch (error) {
    console.error('Get my portfolio items error:', error);
    res.status(500).json({ error: 'Error al obtener items del portafolio' });
  }
};

const createPortfolioItem = async (req, res) => {
  try {
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const { title, description, styleId, category, isFeatured } = req.body;
    
    // Check portfolio limits based on subscription plan
    const currentCount = await Portfolio.countByArtist(artist.id);
    const Subscription = require('../models/Subscription');
    const maxItems = await Subscription.getPortfolioLimit(artist.id);
    
    if (maxItems !== -1 && currentCount >= maxItems) {
      return res.status(400).json({ 
        error: `Has alcanzado el límite máximo de ${maxItems} items en tu portafolio para tu plan actual. Actualiza tu suscripción para añadir más items.`,
        currentCount,
        maxItems,
        needsUpgrade: true
      });
    }
    
    const portfolioId = await Portfolio.create({
      artistId: artist.id,
      imageUrl: null, // Will be set when media is uploaded
      title,
      description,
      styleId: styleId ? parseInt(styleId) : null,
      category,
      isFeatured: isFeatured === 'true'
    });
    
    const portfolioItem = await Portfolio.findById(portfolioId);
    
    res.status(201).json({
      message: 'Item de portafolio creado exitosamente',
      item: portfolioItem
    });
  } catch (error) {
    console.error('Create portfolio item error:', error);
    res.status(500).json({ error: 'Error al crear item del portafolio' });
  }
};

const updatePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { title, description, styleId, category, isFeatured } = req.body;
    
    const portfolioItem = await Portfolio.findById(itemId);
    
    if (!portfolioItem) {
      return res.status(404).json({ error: 'Item del portafolio no encontrado' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist || portfolioItem.artist_id !== artist.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este item' });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (styleId !== undefined) updateData.styleId = styleId;
    if (category !== undefined) updateData.category = category;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true';
    
    const updated = await Portfolio.update(itemId, updateData);
    
    if (!updated) {
      return res.status(400).json({ error: 'Error al actualizar item del portafolio' });
    }
    
    const updatedItem = await Portfolio.findById(itemId);
    
    res.json({
      message: 'Item del portafolio actualizado exitosamente',
      item: {
        ...updatedItem,
        imageUrl: `/uploads/portfolio/${updatedItem.image_url}`,
        thumbnailUrl: updatedItem.thumbnail_url ? `/uploads/portfolio/${updatedItem.thumbnail_url}` : null
      }
    });
  } catch (error) {
    console.error('Update portfolio item error:', error);
    res.status(500).json({ error: 'Error al actualizar item del portafolio' });
  }
};

const deletePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const portfolioItem = await Portfolio.findById(itemId);
    
    if (!portfolioItem) {
      return res.status(404).json({ error: 'Item del portafolio no encontrado' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist || portfolioItem.artist_id !== artist.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este item' });
    }
    
    // Delete files from storage
    const uploadsPath = path.join(getRailwayUploadPath(), 'portfolio');
    
    try {
      if (portfolioItem.image_url) {
        await fs.unlink(path.join(uploadsPath, portfolioItem.image_url));
      }
      if (portfolioItem.thumbnail_url) {
        await fs.unlink(path.join(uploadsPath, portfolioItem.thumbnail_url));
      }
    } catch (fileError) {
      console.log('File deletion failed or files not found');
    }
    
    const deleted = await Portfolio.delete(itemId);
    
    if (!deleted) {
      return res.status(400).json({ error: 'Error al eliminar item del portafolio' });
    }
    
    res.json({
      message: 'Item del portafolio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    res.status(500).json({ error: 'Error al eliminar item del portafolio' });
  }
};

const uploadPortfolioMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'El archivo multimedia es requerido' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const { itemId, title, description, styleId, category, isFeatured, collectionId } = req.body;
    
    const uploadsPath = path.join(getRailwayUploadPath(), 'portfolio');
    const isVideo = req.file.mimetype.startsWith('video/');
    
    let mediaData = {
      mediaType: isVideo ? 'video' : 'image',
      fileSize: req.file.size
    };
    
    try {
      if (isVideo) {
        // Process video
        const videoResult = await VideoProcessor.processPortfolioVideo(
          req.file.path,
          uploadsPath,
          artist.id
        );
        
        mediaData = {
          ...mediaData,
          filename: videoResult.filename,
          thumbnailFilename: videoResult.thumbnailFilename,
          duration: videoResult.duration
        };
      } else {
        // Process image
        const imageResult = await ImageProcessor.processPortfolioImage(
          req.file.path,
          uploadsPath,
          artist.id
        );
        
        mediaData = {
          ...mediaData,
          filename: imageResult.filename,
          thumbnailFilename: imageResult.thumbnailFilename
        };
      }
      
      let portfolioId;
      
      if (itemId) {
        // Update existing item
        const portfolioItem = await Portfolio.findById(itemId);
        
        if (!portfolioItem || portfolioItem.artist_id !== artist.id) {
          throw new Error('Item del portafolio no encontrado o sin permisos');
        }
        
        // Delete old files
        if (portfolioItem.image_url) {
          await fs.unlink(path.join(uploadsPath, portfolioItem.image_url)).catch(() => {});
        }
        if (portfolioItem.thumbnail_url) {
          await fs.unlink(path.join(uploadsPath, portfolioItem.thumbnail_url)).catch(() => {});
        }
        
        await Portfolio.update(itemId, {
          imageUrl: mediaData.filename,
          thumbnailUrl: mediaData.thumbnailFilename,
          mediaType: mediaData.mediaType,
          duration: mediaData.duration,
          fileSize: mediaData.fileSize
        });
        
        portfolioId = itemId;
      } else {
        // Create new item
        portfolioId = await Portfolio.create({
          artistId: artist.id,
          imageUrl: mediaData.filename,
          title,
          description,
          styleId: styleId ? parseInt(styleId) : null,
          category,
          isFeatured: isFeatured === 'true',
          mediaType: mediaData.mediaType,
          thumbnailUrl: mediaData.thumbnailFilename,
          duration: mediaData.duration,
          fileSize: mediaData.fileSize
        });

        // Add to specified collection or default collection
        try {
          let targetCollection = null;
          
          if (collectionId) {
            // Use the specified collection if provided
            const collections = await Collection.findByArtist(artist.id, true);
            targetCollection = collections.find(c => c.id === parseInt(collectionId));
          }
          
          if (!targetCollection) {
            // Fallback to default collection if no collection specified or collection not found
            const defaultCollections = await Collection.findByArtist(artist.id, true);
            targetCollection = defaultCollections.find(c => c.sort_order === 0) || defaultCollections[0];
          }
          
          if (targetCollection) {
            await Collection.addImage(targetCollection.id, portfolioId, 0);
          }
        } catch (collectionError) {
          console.error('Error adding image to collection:', collectionError);
          // Continue without failing the upload
        }
      }
      
      const portfolioItem = await Portfolio.findById(portfolioId);
      
      res.status(itemId ? 200 : 201).json({
        message: `Archivo ${itemId ? 'actualizado' : 'subido'} exitosamente`,
        item: {
          ...portfolioItem,
          imageUrl: `/uploads/portfolio/${portfolioItem.image_url}`,
          thumbnailUrl: portfolioItem.thumbnail_url ? `/uploads/portfolio/${portfolioItem.thumbnail_url}` : null
        }
      });
      
    } catch (processingError) {
      console.error('Media processing error:', processingError);
      res.status(400).json({ error: processingError.message });
    }
  } catch (error) {
    console.error('Upload portfolio media error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting failed upload:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Error al subir archivo multimedia' });
  }
};

const getPortfolioStats = async (req, res) => {
  try {
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const portfolioItems = await Portfolio.findByArtist(artist.id);
    
    const stats = {
      totalItems: portfolioItems.length,
      images: portfolioItems.filter(item => item.media_type === 'image').length,
      videos: portfolioItems.filter(item => item.media_type === 'video').length,
      featured: portfolioItems.filter(item => item.is_featured).length,
      categories: [...new Set(portfolioItems.map(item => item.category).filter(Boolean))],
      maxItems: 50,
      remainingSlots: 50 - portfolioItems.length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get portfolio stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del portafolio' });
  }
};

module.exports = {
  getPortfolioItems,
  getMyPortfolioItems,
  createPortfolioItem: [createPortfolioValidation, handleValidationErrors, createPortfolioItem],
  updatePortfolioItem: [updatePortfolioValidation, handleValidationErrors, updatePortfolioItem],
  deletePortfolioItem,
  uploadPortfolioMedia,
  getPortfolioStats
};