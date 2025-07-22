const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorizeArtist } = require('../middleware/auth');

// Rutas públicas
router.get('/plans', paymentController.getPlans);

// Webhook de MercadoPago (sin autenticación)
router.post('/webhook', paymentController.webhook);

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Obtener suscripción activa
router.get('/subscription/active', paymentController.getActiveSubscription);

// Obtener historial de suscripciones
router.get('/subscription/history', paymentController.getSubscriptionHistory);

// Obtener historial de pagos del usuario
router.get('/payments/history', paymentController.getPaymentHistory);

// Obtener cambios de suscripción
router.get('/subscription/changes', paymentController.getSubscriptionChanges);

// Rutas para artistas solamente
router.post('/subscription', authorizeArtist, paymentController.createSubscription);
router.delete('/subscription/:subscriptionId', authorizeArtist, paymentController.cancelSubscription);
router.get('/subscription/:subscriptionId/payments', authorizeArtist, paymentController.getPaymentHistory);

// Utilidades para pagos
router.post('/card-token', paymentController.createCardToken);
router.post('/sync-plans', paymentController.syncPlans);

module.exports = router;