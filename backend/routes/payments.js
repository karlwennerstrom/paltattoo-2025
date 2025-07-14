const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorizeArtist, authorizeAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validation middleware
const createSubscriptionValidation = [
  body('planId').isInt({ min: 1 }).withMessage('Plan ID inválido'),
  handleValidationErrors
];

const refundValidation = [
  body('amount').optional().isFloat({ min: 1 }).withMessage('Monto inválido'),
  body('reason').notEmpty().withMessage('Razón del reembolso es requerida'),
  handleValidationErrors
];

// Public routes
router.get('/plans', paymentController.getPlans);

// Webhook endpoint (no authentication required)
router.post('/webhooks/mercadopago', paymentController.handleWebhook);

// Protected routes - require authentication
router.use(authenticate);

// Subscription management
router.get('/subscription', paymentController.getMySubscription);
router.post('/subscription', authorizeArtist, createSubscriptionValidation, paymentController.createSubscription);
router.delete('/subscription', authorizeArtist, paymentController.cancelSubscription);

// Payment history
router.get('/history', paymentController.getPaymentHistory);
router.get('/payment/:paymentId', paymentController.getPaymentDetails);
router.post('/payment/:paymentId/retry', paymentController.retryPayment);

// Admin routes
router.get('/stats', authorizeAdmin, paymentController.getPaymentStats);
router.post('/payment/:paymentId/refund', authorizeAdmin, refundValidation, paymentController.createRefund);

module.exports = router;