const Collection = require('../models/Collection');
const Portfolio = require('../models/Portfolio');
const TattooArtist = require('../models/TattooArtist');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const createCollectionValidation = [
  body('name').notEmpty().isLength({ max: 255 }).withMessage('El nombre es requerido y no puede exceder 255 caracteres'),
  body('description').optional().isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres')
];

const updateCollectionValidation = [
  param('collectionId').isNumeric().withMessage('ID de colección inválido'),
  body('name').optional().isLength({ max: 255 }).withMessage('El nombre no puede exceder 255 caracteres'),
  body('description').optional().isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres')
];

const getCollections = async (req, res) => {
  try {
    const { artistId } = req.params;
    
    if (!artistId || isNaN(artistId)) {
      return res.status(400).json({ error: 'ID de artista inválido' });
    }
    
    const artist = await TattooArtist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ error: 'Artista no encontrado' });
    }
    
    const collections = await Collection.findByArtist(artistId, false);
    
    res.json({
      collections,
      artist: {
        id: artist.id,
        studioName: artist.studio_name,
        firstName: artist.first_name,
        lastName: artist.last_name
      }
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Error al obtener colecciones' });
  }
};

const getMyCollections = async (req, res) => {
  try {
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const collections = await Collection.findByArtist(artist.id, true);
    
    res.json({
      collections,
      artist: {
        id: artist.id,
        studioName: artist.studio_name,
        firstName: artist.first_name,
        lastName: artist.last_name
      }
    });
  } catch (error) {
    console.error('Get my collections error:', error);
    res.status(500).json({ error: 'Error al obtener mis colecciones' });
  }
};

const getCollectionById = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { limit } = req.query;
    
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    
    const images = await Collection.getImages(collectionId, limit);
    
    const imagesWithUrls = images.map(image => ({
      ...image,
      imageUrl: `/uploads/portfolio/${image.image_url}`,
      thumbnailUrl: image.thumbnail_url ? `/uploads/portfolio/${image.thumbnail_url}` : null
    }));
    
    res.json({
      collection: {
        ...collection,
        coverImageUrl: collection.cover_image_url ? `/uploads/portfolio/${collection.cover_image_url}` : null
      },
      images: imagesWithUrls
    });
  } catch (error) {
    console.error('Get collection by ID error:', error);
    res.status(500).json({ error: 'Error al obtener colección' });
  }
};

const createCollection = async (req, res) => {
  try {
    const artist = await TattooArtist.findByUserId(req.user.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const { name, description, coverImageId, isPublic, sortOrder } = req.body;
    
    // Check collection limits based on subscription plan
    const currentCount = await Collection.countByArtist(artist.id);
    const Subscription = require('../models/Subscription');
    const maxCollections = await Subscription.getCollectionLimit(artist.id);
    
    if (maxCollections !== -1 && currentCount >= maxCollections) {
      return res.status(400).json({ 
        error: `Has alcanzado el límite máximo de ${maxCollections} colecciones para tu plan actual. Actualiza tu suscripción para crear más colecciones.`,
        currentCount,
        maxCollections,
        needsUpgrade: true
      });
    }
    
    const collectionId = await Collection.create({
      artistId: artist.id,
      name,
      description,
      coverImageId: coverImageId ? parseInt(coverImageId) : null,
      isPublic: isPublic !== false,
      sortOrder: sortOrder || 0
    });
    
    const collection = await Collection.findById(collectionId);
    
    res.status(201).json({
      message: 'Colección creada exitosamente',
      data: {
        ...collection,
        coverImageUrl: collection.cover_image_url ? `/uploads/portfolio/${collection.cover_image_url}` : null
      }
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Error al crear colección' });
  }
};

const updateCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { name, description, cover_image_id, is_public, sort_order } = req.body;
    
    console.log('Update collection request:', {
      collectionId,
      body: req.body,
      extracted: { name, description, cover_image_id, is_public, sort_order }
    });
    
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    if (!artist || collection.artist_id !== artist.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta colección' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (cover_image_id !== undefined) updateData.coverImageId = cover_image_id;
    if (is_public !== undefined) updateData.isPublic = is_public;
    if (sort_order !== undefined) updateData.sortOrder = sort_order;
    
    const updated = await Collection.update(collectionId, updateData);
    
    if (!updated) {
      return res.status(400).json({ error: 'Error al actualizar colección' });
    }
    
    const updatedCollection = await Collection.findById(collectionId);
    
    res.json({
      message: 'Colección actualizada exitosamente',
      data: {
        ...updatedCollection,
        coverImageUrl: updatedCollection.cover_image_url ? `/uploads/portfolio/${updatedCollection.cover_image_url}` : null
      }
    });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Error al actualizar colección' });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    if (!artist || collection.artist_id !== artist.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta colección' });
    }
    
    const deleted = await Collection.delete(collectionId);
    
    if (!deleted) {
      return res.status(400).json({ error: 'Error al eliminar colección' });
    }
    
    res.json({
      message: 'Colección eliminada exitosamente'
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Error al eliminar colección' });
  }
};

const addImageToCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { imageId, sortOrder } = req.body;
    
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    if (!artist || collection.artist_id !== artist.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta colección' });
    }
    
    // Verify that the image belongs to the artist
    const portfolioItem = await Portfolio.findById(imageId);
    if (!portfolioItem || portfolioItem.artist_id !== artist.id) {
      return res.status(403).json({ error: 'La imagen no pertenece a tu portfolio' });
    }
    
    const added = await Collection.addImage(collectionId, imageId, sortOrder || 0);
    
    if (!added) {
      return res.status(400).json({ error: 'Error al agregar imagen a la colección' });
    }
    
    res.json({
      message: 'Imagen agregada a la colección exitosamente'
    });
  } catch (error) {
    console.error('Add image to collection error:', error);
    res.status(500).json({ error: 'Error al agregar imagen a la colección' });
  }
};

const removeImageFromCollection = async (req, res) => {
  try {
    const { collectionId, imageId } = req.params;
    
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    if (!artist || collection.artist_id !== artist.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta colección' });
    }
    
    const removed = await Collection.removeImage(collectionId, imageId);
    
    if (!removed) {
      return res.status(400).json({ error: 'Error al remover imagen de la colección' });
    }
    
    res.json({
      message: 'Imagen removida de la colección exitosamente'
    });
  } catch (error) {
    console.error('Remove image from collection error:', error);
    res.status(500).json({ error: 'Error al remover imagen de la colección' });
  }
};

const reorderCollections = async (req, res) => {
  try {
    const { collectionOrders } = req.body;
    
    if (!Array.isArray(collectionOrders)) {
      return res.status(400).json({ error: 'Formato de orden inválido' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    if (!artist) {
      return res.status(404).json({ error: 'Perfil de tatuador no encontrado' });
    }
    
    const reordered = await Collection.reorderCollections(artist.id, collectionOrders);
    
    if (!reordered) {
      return res.status(400).json({ error: 'Error al reordenar colecciones' });
    }
    
    res.json({
      message: 'Colecciones reordenadas exitosamente'
    });
  } catch (error) {
    console.error('Reorder collections error:', error);
    res.status(500).json({ error: 'Error al reordenar colecciones' });
  }
};

const reorderCollectionImages = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { imageOrders } = req.body;
    
    if (!Array.isArray(imageOrders)) {
      return res.status(400).json({ error: 'Formato de orden inválido' });
    }
    
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Colección no encontrada' });
    }
    
    const artist = await TattooArtist.findByUserId(req.user.id);
    if (!artist || collection.artist_id !== artist.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta colección' });
    }
    
    const reordered = await Collection.updateImageOrder(collectionId, imageOrders);
    
    if (!reordered) {
      return res.status(400).json({ error: 'Error al reordenar imágenes' });
    }
    
    res.json({
      message: 'Imágenes reordenadas exitosamente'
    });
  } catch (error) {
    console.error('Reorder collection images error:', error);
    res.status(500).json({ error: 'Error al reordenar imágenes de la colección' });
  }
};

module.exports = {
  getCollections,
  getMyCollections,
  getCollectionById,
  createCollection: [createCollectionValidation, handleValidationErrors, createCollection],
  updateCollection: [updateCollectionValidation, handleValidationErrors, updateCollection],
  deleteCollection,
  addImageToCollection,
  removeImageFromCollection,
  reorderCollections,
  reorderCollectionImages
};