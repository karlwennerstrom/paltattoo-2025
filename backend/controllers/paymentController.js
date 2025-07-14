const paymentService = require('../services/paymentService');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const TattooArtist = require('../models/TattooArtist');

const paymentController = {
  // Get all subscription plans
  async getPlans(req, res) {
    try {
      const plans = await SubscriptionPlan.getAll();
      
      res.json({
        plans: plans.map(plan => ({
          ...plan,
          features: typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : plan.features || [],
          formattedPrice: paymentService.formatCurrency(plan.price)
        }))
      });
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({ error: 'Error al obtener planes' });
    }
  },

  // Get user's current subscription
  async getMySubscription(req, res) {
    try {
      const subscription = await Subscription.findByUserId(req.user.id);
      
      if (!subscription) {
        return res.json({ subscription: null });
      }

      res.json({
        subscription: {
          ...subscription,
          features: JSON.parse(subscription.features || '[]'),
          formattedPrice: paymentService.formatCurrency(subscription.price)
        }
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ error: 'Error al obtener suscripción' });
    }
  },

  // Create subscription payment preference
  async createSubscription(req, res) {
    try {
      const { planId } = req.body;
      
      // Verify user is an artist
      const artist = await TattooArtist.findByUserId(req.user.id);
      if (!artist) {
        return res.status(403).json({ error: 'Solo los tatuadores pueden suscribirse' });
      }

      // Verify plan exists
      const plan = await SubscriptionPlan.findById(planId);
      if (!plan) {
        return res.status(404).json({ error: 'Plan no encontrado' });
      }

      const preference = await paymentService.createSubscriptionPreference(req.user.id, planId);
      
      res.json({
        message: 'Preferencia de pago creada exitosamente',
        preference
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({ error: error.message || 'Error al crear suscripción' });
    }
  },

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const subscription = await Subscription.findByUserId(req.user.id);
      
      if (!subscription) {
        return res.status(404).json({ error: 'No tienes una suscripción activa' });
      }

      if (subscription.status !== 'active') {
        return res.status(400).json({ error: 'La suscripción no está activa' });
      }

      await paymentService.cancelSubscription(subscription.id);
      
      res.json({ message: 'Suscripción cancelada exitosamente' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Error al cancelar suscripción' });
    }
  },

  // Get payment history
  async getPaymentHistory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const payments = await Payment.getUserPayments(req.user.id, parseInt(limit), offset);
      
      res.json({
        payments: payments.map(payment => ({
          ...payment,
          formattedAmount: paymentService.formatCurrency(payment.amount, payment.currency)
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: payments.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({ error: 'Error al obtener historial de pagos' });
    }
  },

  // Get payment details
  async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      // Verify payment belongs to user
      if (payment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para ver este pago' });
      }

      // Get refunds if any
      const refunds = await Payment.getRefunds(paymentId);

      res.json({
        payment: {
          ...payment,
          formattedAmount: paymentService.formatCurrency(payment.amount, payment.currency)
        },
        refunds: refunds.map(refund => ({
          ...refund,
          formattedAmount: paymentService.formatCurrency(refund.amount, payment.currency)
        }))
      });
    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({ error: 'Error al obtener detalles del pago' });
    }
  },

  // Webhook handler for MercadoPago notifications
  async handleWebhook(req, res) {
    try {
      console.log('MercadoPago webhook received:', req.body);
      
      const result = await paymentService.processWebhookNotification(req.body);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  },

  // Admin endpoints
  async getPaymentStats(req, res) {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ error: 'Solo administradores pueden acceder' });
      }

      const { startDate, endDate } = req.query;
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = endDate || new Date();

      const stats = await Payment.getPaymentStats(start, end);
      const monthlyRevenue = await Payment.getMonthlyRevenue(new Date().getFullYear());

      res.json({
        stats: {
          ...stats,
          formattedRevenue: paymentService.formatCurrency(stats.total_revenue),
          successRate: stats.total_payments > 0 ? 
            ((stats.successful_payments / stats.total_payments) * 100).toFixed(2) : 0
        },
        monthlyRevenue: monthlyRevenue.map(month => ({
          ...month,
          formattedRevenue: paymentService.formatCurrency(month.revenue)
        }))
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  // Create refund (admin only)
  async createRefund(req, res) {
    try {
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ error: 'Solo administradores pueden crear reembolsos' });
      }

      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      if (payment.status !== 'approved') {
        return res.status(400).json({ error: 'Solo se pueden reembolsar pagos aprobados' });
      }

      const refund = await paymentService.createRefund(
        payment.mercadopago_payment_id, 
        amount || payment.amount, 
        reason
      );

      res.json({
        message: 'Reembolso creado exitosamente',
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status
        }
      });
    } catch (error) {
      console.error('Create refund error:', error);
      res.status(500).json({ error: 'Error al crear reembolso' });
    }
  },

  // Retry failed payment
  async retryPayment(req, res) {
    try {
      const { paymentId } = req.params;
      
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      if (payment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para reintentar este pago' });
      }

      if (payment.status === 'approved') {
        return res.status(400).json({ error: 'El pago ya fue aprobado' });
      }

      // Create new preference for retry
      const preference = await paymentService.createPaymentPreference(
        req.user.id,
        payment.amount,
        `Reintento de pago - ${payment.plan_name || 'Servicio'}`,
        `retry_${payment.id}_${Date.now()}`
      );

      res.json({
        message: 'Nueva preferencia de pago creada',
        preference
      });
    } catch (error) {
      console.error('Retry payment error:', error);
      res.status(500).json({ error: 'Error al reintentar pago' });
    }
  }
};

module.exports = paymentController;