const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { uploadProfile } = require('../config/multer');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const updateProfileValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('phone')
    .optional()
    .matches(/^\+56\s?9\s?[0-9]{4}\s?[0-9]{4}$|^\+569[0-9]{8}$/)
    .withMessage('El teléfono debe tener formato chileno (+56 9 XXXX XXXX)'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La biografía no puede exceder 500 caracteres')
];

// GET /api/profile - Get current user profile
router.get('/', authenticate, profileController.getProfile);

// PUT /api/profile - Update profile information
router.put('/', 
  authenticate, 
  updateProfileValidation, 
  handleValidationErrors, 
  profileController.updateProfile
);

// POST /api/profile/upload-image - Upload profile image
router.post('/upload-image', 
  authenticate, 
  uploadProfile.single('profileImage'), 
  profileController.uploadProfileImage
);

// DELETE /api/profile/image - Delete profile image
router.delete('/image', 
  authenticate, 
  profileController.deleteProfileImage
);

// GET /api/profile/stats - Get profile statistics
router.get('/stats', 
  authenticate, 
  profileController.getProfileStats
);

// GET /api/profile/public/:userId - Get public profile
router.get('/public/:userId', profileController.getPublicProfile);

module.exports = router;