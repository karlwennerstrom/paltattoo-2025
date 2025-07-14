const express = require('express');
const router = express.Router();
const SponsoredShopController = require('../controllers/sponsoredShopController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const shopLogoDir = path.join(__dirname, '../uploads/shops/logos');
const shopCoverDir = path.join(__dirname, '../uploads/shops/covers');

[shopLogoDir, shopCoverDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration for shop images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.route.path.includes('logo')) {
      cb(null, shopLogoDir);
    } else if (req.route.path.includes('cover')) {
      cb(null, shopCoverDir);
    } else {
      cb(null, path.join(__dirname, '../uploads/shops'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `shop-${req.params.id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Validation middleware
const validateShop = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ max: 255 })
    .withMessage('El nombre no puede exceder 255 caracteres'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ max: 255 })
    .withMessage('La dirección no puede exceder 255 caracteres'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida')
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede exceder 100 caracteres'),
  body('region')
    .trim()
    .notEmpty()
    .withMessage('La región es requerida')
    .isLength({ max: 100 })
    .withMessage('La región no puede exceder 100 caracteres'),
  body('phone')
    .optional()
    .isMobilePhone('es-CL')
    .withMessage('Número de teléfono inválido'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido'),
  body('website')
    .optional()
    .isURL()
    .withMessage('URL del sitio web inválida'),
  body('instagram')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Instagram no puede exceder 100 caracteres'),
  body('facebook')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Facebook no puede exceder 255 caracteres'),
  body('category')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isIn(['aftercare', 'equipment', 'supplies', 'apparel', 'piercing', 'jewelry', 'studio', 'other'])
    .withMessage('Categoría inválida'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),
  body('business_hours')
    .optional()
    .isObject()
    .withMessage('Los horarios deben ser un objeto'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un boolean'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured debe ser un boolean'),
  body('featured_until')
    .optional()
    .isISO8601()
    .withMessage('featured_until debe ser una fecha válida')
];

const validateShopUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ max: 255 })
    .withMessage('El nombre no puede exceder 255 caracteres'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía')
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La dirección no puede estar vacía')
    .isLength({ max: 255 })
    .withMessage('La dirección no puede exceder 255 caracteres'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La ciudad no puede estar vacía')
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede exceder 100 caracteres'),
  body('region')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La región no puede estar vacía')
    .isLength({ max: 100 })
    .withMessage('La región no puede exceder 100 caracteres'),
  body('phone')
    .optional()
    .isMobilePhone('es-CL')
    .withMessage('Número de teléfono inválido'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido'),
  body('website')
    .optional()
    .isURL()
    .withMessage('URL del sitio web inválida'),
  body('instagram')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Instagram no puede exceder 100 caracteres'),
  body('facebook')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Facebook no puede exceder 255 caracteres'),
  body('category')
    .optional()
    .isIn(['aftercare', 'equipment', 'supplies', 'apparel', 'piercing', 'jewelry', 'studio', 'other'])
    .withMessage('Categoría inválida'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),
  body('business_hours')
    .optional()
    .isObject()
    .withMessage('Los horarios deben ser un objeto'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un boolean'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured debe ser un boolean'),
  body('featured_until')
    .optional()
    .isISO8601()
    .withMessage('featured_until debe ser una fecha válida')
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID válido requerido')
];

// Public routes (no authentication required)
router.get('/', SponsoredShopController.getAllShops);
router.get('/featured', SponsoredShopController.getFeaturedShops);
router.get('/categories', SponsoredShopController.getCategories);
router.get('/category/:category', SponsoredShopController.getShopsByCategory);
router.get('/:id', validateId, SponsoredShopController.getShopById);
router.post('/:id/click', validateId, SponsoredShopController.trackClick);

// Protected routes (admin only)
router.use(authenticate);

router.post('/', validateShop, SponsoredShopController.createShop);
router.put('/:id', validateId, validateShopUpdate, SponsoredShopController.updateShop);
router.delete('/:id', validateId, SponsoredShopController.deleteShop);

// File upload routes
router.post('/:id/logo', 
  validateId, 
  upload.single('logo'), 
  SponsoredShopController.uploadLogo
);
router.post('/:id/cover', 
  validateId, 
  upload.single('cover'), 
  SponsoredShopController.uploadCoverImage
);

// Statistics route
router.get('/admin/stats', SponsoredShopController.getShopStats);

module.exports = router;