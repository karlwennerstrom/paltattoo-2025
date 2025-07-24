const express = require('express');
const router = express.Router();
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const { authenticate } = require('../middleware/auth');

// Get all subscription plans (public)
router.get('/plans', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.getAll();
    res.json(plans);
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ error: 'Error al obtener planes de suscripción' });
  }
});

// Get user's current subscription
router.get('/my-subscription', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.getActiveByUserId(req.user.id);
    res.json(subscription);
  } catch (error) {
    console.error('Get my subscription error:', error);
    res.status(500).json({ error: 'Error al obtener suscripción' });
  }
});

// Subscribe to a plan
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID es requerido' });
    }
    
    // Check if user already has an active subscription
    const existingSubscription = await Subscription.getActiveByUserId(req.user.id);
    
    if (existingSubscription) {
      return res.status(409).json({ error: 'Ya tienes una suscripción activa' });
    }
    
    // Get plan details
    const plan = await Subscription.getPlanById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    
    // Create subscription (this would integrate with MercadoPago in production)
    const subscriptionId = await Subscription.create({
      userId: req.user.id,
      planId: planId,
      mercadopagoPreapprovalId: null, // Would be set by MercadoPago
      status: 'pending'
    });
    
    const subscriptions = await Subscription.getByUserId(req.user.id);
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    
    res.status(201).json({
      message: 'Suscripción creada exitosamente',
      subscription,
      // In production, return MercadoPago payment URL
      paymentUrl: `/payments/subscription/${subscriptionId}`
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Error al crear suscripción' });
  }
});

// Change subscription plan
router.put('/:subscriptionId/change-plan', authenticate, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID es requerido' });
    }
    
    // Verify subscription belongs to user
    const subscription = await Subscription.getById(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }
    
    if (subscription.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    // Get new plan details
    const newPlan = await Subscription.getPlanById(planId);
    
    if (!newPlan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    
    // Update subscription plan
    const success = await Subscription.changePlan(subscriptionId, planId);
    
    if (success) {
      // Get updated subscription
      const updatedSubscription = await Subscription.getById(subscriptionId);
      
      res.json({
        message: 'Plan actualizado exitosamente',
        subscription: updatedSubscription,
        // In production, return MercadoPago payment URL for upgrades
        paymentUrl: newPlan.price > subscription.price ? `/payments/subscription/${subscriptionId}/upgrade` : null
      });
    } else {
      res.status(500).json({ error: 'Error al cambiar plan' });
    }
  } catch (error) {
    console.error('Change plan error:', error);
    res.status(500).json({ error: 'Error al cambiar plan' });
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.getActiveByUserId(req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No tienes una suscripción activa' });
    }
    
    const success = await Subscription.cancel(subscription.id);
    
    if (success) {
      res.json({ message: 'Suscripción cancelada exitosamente' });
    } else {
      res.status(500).json({ error: 'Error al cancelar suscripción' });
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
});

// Renew subscription - simplified version
router.post('/renew', authenticate, async (req, res) => {
  try {
    const subscriptions = await Subscription.getByUserId(req.user.id);
    const latestSubscription = subscriptions[0]; // Most recent subscription
    
    if (!latestSubscription) {
      return res.status(404).json({ error: 'No tienes una suscripción' });
    }
    
    if (latestSubscription.status === 'authorized') {
      return res.status(409).json({ error: 'La suscripción ya está activa' });
    }
    
    // Simple renewal - just update status to pending for manual processing
    const success = await Subscription.updateStatus(latestSubscription.id, 'pending');
    
    if (success) {
      res.json({
        message: 'Solicitud de renovación procesada. Te contactaremos pronto.',
        subscription: latestSubscription
      });
    } else {
      res.status(500).json({ error: 'Error al procesar renovación' });
    }
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({ error: 'Error al renovar suscripción' });
  }
});

// Get subscription invoices - simplified version
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const subscriptions = await Subscription.getByUserId(req.user.id);
    
    // For now, return subscription history as "invoices"
    const invoices = subscriptions.map(sub => ({
      id: sub.id,
      date: sub.created_at,
      amount: sub.price,
      status: sub.status,
      plan_name: sub.plan_name,
      description: `Suscripción ${sub.plan_name}`
    }));
    
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Update payment method - placeholder for future implementation
router.put('/payment-method', authenticate, async (req, res) => {
  try {
    res.json({ 
      message: 'Funcionalidad en desarrollo. Contacta con soporte para cambiar el método de pago.' 
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ error: 'Error al actualizar método de pago' });
  }
});

module.exports = router;