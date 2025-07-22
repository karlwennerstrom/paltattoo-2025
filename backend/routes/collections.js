const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { authenticate, authorizeArtist } = require('../middleware/auth');

// Public routes
router.get('/:artistId', collectionController.getCollections);
router.get('/collection/:collectionId', collectionController.getCollectionById);

// Protected routes - require authentication and artist role
router.use(authenticate);
router.use(authorizeArtist);

// Artist collection management
router.get('/my', collectionController.getMyCollections);
router.post('/', collectionController.createCollection);
router.put('/:collectionId', collectionController.updateCollection);
router.delete('/:collectionId', collectionController.deleteCollection);

// Collection image management
router.post('/:collectionId/images', collectionController.addImageToCollection);
router.delete('/:collectionId/images/:imageId', collectionController.removeImageFromCollection);
router.put('/:collectionId/images/reorder', collectionController.reorderCollectionImages);

// Collection reordering
router.put('/reorder', collectionController.reorderCollections);

module.exports = router;