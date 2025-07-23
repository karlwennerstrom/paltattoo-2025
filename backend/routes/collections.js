const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { authenticate, authorizeArtist } = require('../middleware/auth');

// Protected routes first - require authentication and artist role
router.get('/my', authenticate, authorizeArtist, collectionController.getMyCollections);
router.post('/', authenticate, authorizeArtist, collectionController.createCollection);
router.put('/reorder', authenticate, authorizeArtist, collectionController.reorderCollections);
router.put('/:collectionId', authenticate, authorizeArtist, collectionController.updateCollection);
router.delete('/:collectionId', authenticate, authorizeArtist, collectionController.deleteCollection);

// Collection image management
router.post('/:collectionId/images', authenticate, authorizeArtist, collectionController.addImageToCollection);
router.delete('/:collectionId/images/:imageId', authenticate, authorizeArtist, collectionController.removeImageFromCollection);
router.put('/:collectionId/images/reorder', authenticate, authorizeArtist, collectionController.reorderCollectionImages);

// Public routes (after specific routes to avoid conflicts)
router.get('/collection/:collectionId', collectionController.getCollectionById);
router.get('/:artistId', collectionController.getCollections);

module.exports = router;