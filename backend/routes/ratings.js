const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

// Validation rules
const createRatingValidation = [
  body('rated_id')
    .isInt({ min: 1 })
    .withMessage('ID del usuario calificado debe ser un número válido'),
  body('rated_type')
    .isIn(['client', 'artist'])
    .withMessage('Tipo de usuario debe ser client o artist'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entre 1 y 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El comentario no puede exceder 500 caracteres'),
  body('tattoo_request_id')
    .isInt({ min: 1 })
    .withMessage('ID de la solicitud debe ser un número válido'),
  body('proposal_id')
    .isInt({ min: 1 })
    .withMessage('ID de la propuesta debe ser un número válido')
];

const updateRatingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entre 1 y 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El comentario no puede exceder 500 caracteres')
];

// Routes

// Create a new rating
router.post('/', authenticate, createRatingValidation, ratingController.createRating);

// Get ratings for a specific user (public)
router.get('/user/:userId', ratingController.getUserRatings);

// Get ratings given by the authenticated user
router.get('/my-ratings', authenticate, ratingController.getRatingsGivenByUser);

// Update a rating
router.put('/:ratingId', authenticate, updateRatingValidation, ratingController.updateRating);

// Delete a rating
router.delete('/:ratingId', authenticate, ratingController.deleteRating);

// Check if user can rate a specific transaction
router.get('/can-rate', authenticate, ratingController.canUserRate);

// Get overall rating statistics
router.get('/stats', ratingController.getRatingStats);

module.exports = router;