const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorizeArtist } = require('../middleware/auth');

// Rutas públicas
router.get('/plans', paymentController.getPlans);

// Webhook de MercadoPago (sin autenticación)
router.post('/webhook', paymentController.webhook);

// Test webhook endpoint (for debugging)
router.get('/webhook/test', (req, res) => {
  const hasSecret = !!process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const secretPreview = process.env.MERCADOPAGO_WEBHOOK_SECRET ? 
    process.env.MERCADOPAGO_WEBHOOK_SECRET.substring(0, 8) + '...' : 
    'NOT_SET';
    
  res.json({ 
    status: 'ok', 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    webhookConfig: {
      hasSecret,
      secretPreview,
      signatureValidation: hasSecret && process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled'
    }
  });
});

// Manual payment processing endpoint (temporary for debugging)
router.post('/webhook/manual/:paymentId', authenticate, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin' && req.user.id !== 14) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const { paymentId } = req.params;
    console.log('Manual webhook processing for payment:', paymentId);
    
    // Simulate webhook data
    const simulatedBody = {
      type: 'payment',
      action: 'payment.created',
      data: { id: paymentId }
    };
    
    // Call the webhook handler directly
    await paymentController.webhook(
      { 
        body: simulatedBody, 
        headers: { 
          'user-agent': 'Manual-Processing',
          'x-request-id': 'manual-' + Date.now()
        }
      }, 
      res
    );
  } catch (error) {
    console.error('Manual webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas protegidas - requieren autenticación
router.use(authenticate);

// Obtener suscripción activa
router.get('/subscription/active', paymentController.getActiveSubscription);

// Obtener historial de suscripciones
router.get('/subscription/history', paymentController.getSubscriptionHistory);

// Obtener historial de pagos del usuario
router.get('/history', paymentController.getPaymentHistory);

// Obtener cambios de suscripción
router.get('/subscription/changes', paymentController.getSubscriptionChanges);

// Obtener preview de prorrateo para cambio de plan
router.get('/subscription/proration-preview', paymentController.getProrationPreview);

// Enviar email de cambio de suscripción
router.post('/subscription/send-change-email', paymentController.sendSubscriptionChangeEmail);

// Rutas para artistas solamente
router.post('/subscription', authorizeArtist, paymentController.createSubscription);
router.delete('/subscription/:subscriptionId', authorizeArtist, paymentController.cancelSubscription);
router.get('/subscription/:subscriptionId/payments', authorizeArtist, paymentController.getSubscriptionPaymentHistory);

// Utilidades para pagos
router.post('/card-token', paymentController.createCardToken);
router.post('/sync-plans', paymentController.syncPlans);

module.exports = router;