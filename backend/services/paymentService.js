const { preference, payment, config } = require('../config/mercadopago');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');

class PaymentService {
  // Create a subscription preference for MercadoPago
  async createSubscriptionPreference(userId, planId) {
    try {
      const [user, plan] = await Promise.all([
        User.findById(userId),
        SubscriptionPlan.findById(planId)
      ]);

      if (!user || !plan) {
        throw new Error('Usuario o plan no encontrado');
      }

      const preferenceData = {
        items: [
          {
            id: `plan_${plan.id}`,
            title: `Suscripción ${plan.name} - TattooConnect`,
            description: plan.description,
            quantity: 1,
            unit_price: plan.price,
            currency_id: 'CLP'
          }
        ],
        payer: {
          name: user.first_name,
          surname: user.last_name,
          email: user.email
        },
        payment_methods: {
          excluded_payment_methods: config.excludedPaymentMethods,
          excluded_payment_types: config.excludedPaymentTypes,
          installments: config.installments
        },
        back_urls: {
          success: config.successUrl,
          failure: config.failureUrl,
          pending: config.pendingUrl
        },
        auto_return: config.autoReturn,
        notification_url: config.notificationUrl,
        external_reference: `${userId}_${planId}_${Date.now()}`,
        metadata: {
          user_id: userId,
          plan_id: planId,
          subscription_type: plan.billing_cycle
        }
      };

      const response = await preference.create({ body: preferenceData });
      
      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point
      };
    } catch (error) {
      console.error('Error creating subscription preference:', error);
      throw new Error('Error al crear preferencia de pago');
    }
  }

  // Create a one-time payment preference
  async createPaymentPreference(userId, amount, description, externalReference) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const preferenceData = {
        items: [
          {
            id: externalReference,
            title: description,
            quantity: 1,
            unit_price: amount,
            currency_id: 'CLP'
          }
        ],
        payer: {
          name: user.first_name,
          surname: user.last_name,
          email: user.email
        },
        payment_methods: {
          installments: config.installments
        },
        back_urls: {
          success: `${config.successUrl}?payment=success`,
          failure: `${config.failureUrl}?payment=failure`,
          pending: `${config.pendingUrl}?payment=pending`
        },
        auto_return: config.autoReturn,
        notification_url: config.notificationUrl,
        external_reference: externalReference,
        metadata: {
          user_id: userId,
          payment_type: 'one_time'
        }
      };

      const response = await preference.create({ body: preferenceData });
      
      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point
      };
    } catch (error) {
      console.error('Error creating payment preference:', error);
      throw new Error('Error al crear preferencia de pago');
    }
  }

  // Process webhook notification from MercadoPago
  async processWebhookNotification(notificationData) {
    try {
      const { type, data } = notificationData;

      if (type === 'payment') {
        return await this.processPaymentNotification(data.id);
      }
      
      // Handle other notification types as needed
      console.log('Unhandled notification type:', type);
      return { success: true, message: 'Notification acknowledged' };
    } catch (error) {
      console.error('Error processing webhook notification:', error);
      throw error;
    }
  }

  // Process payment notification
  async processPaymentNotification(paymentId) {
    try {
      // Get payment information from MercadoPago
      const paymentInfo = await payment.get({ id: paymentId });
      
      if (!paymentInfo) {
        throw new Error('Pago no encontrado en MercadoPago');
      }

      // Check if payment already exists in our database
      let existingPayment = await Payment.findByMercadoPagoId(paymentId);
      
      const metadata = paymentInfo.metadata || {};
      const externalReference = paymentInfo.external_reference;
      
      // Extract user and plan info from external reference or metadata
      const userId = metadata.user_id || this.extractUserIdFromReference(externalReference);
      const planId = metadata.plan_id || this.extractPlanIdFromReference(externalReference);

      if (!existingPayment && userId) {
        // Create new payment record
        const paymentData = {
          userId: userId,
          subscriptionId: null, // Will be set if it's a subscription
          mercadoPagoPaymentId: paymentId,
          amount: paymentInfo.transaction_amount,
          currency: paymentInfo.currency_id,
          status: paymentInfo.status,
          paymentMethod: paymentInfo.payment_type_id
        };

        const newPaymentId = await Payment.create(paymentData);
        existingPayment = await Payment.findById(newPaymentId);
      } else if (existingPayment) {
        // Update existing payment status
        await Payment.updateStatus(
          existingPayment.id, 
          paymentInfo.status, 
          paymentInfo.status === 'approved' ? new Date() : null
        );
      }

      // Handle subscription creation/update if this is a subscription payment
      if (paymentInfo.status === 'approved' && planId && userId) {
        await this.handleSubscriptionActivation(userId, planId, paymentId);
      }

      // Handle failed payments
      if (paymentInfo.status === 'rejected' && existingPayment?.subscription_id) {
        await this.handleFailedSubscriptionPayment(existingPayment.subscription_id);
      }

      return { 
        success: true, 
        status: paymentInfo.status,
        paymentId: existingPayment?.id 
      };
    } catch (error) {
      console.error('Error processing payment notification:', error);
      throw error;
    }
  }

  // Handle subscription activation
  async handleSubscriptionActivation(userId, planId, mercadoPagoPaymentId) {
    try {
      // Check if user already has an active subscription
      const existingSubscription = await Subscription.findByUserId(userId);
      
      if (existingSubscription && existingSubscription.status === 'authorized') {
        // Cancel previous subscription
        await Subscription.cancel(existingSubscription.id);
      }

      // Create new subscription
      const subscriptionData = {
        userId: userId,
        planId: planId,
        mercadoPagoSubscriptionId: mercadoPagoPaymentId,
        status: 'active'
      };

      const subscriptionId = await Subscription.create(subscriptionData);
      
      // Update payment with subscription ID
      const paymentRecord = await Payment.findByMercadoPagoId(mercadoPagoPaymentId);
      if (paymentRecord) {
        await Payment.updateStatus(paymentRecord.id, 'approved', new Date());
        // You might want to add a method to update subscription_id in Payment model
      }

      return subscriptionId;
    } catch (error) {
      console.error('Error handling subscription activation:', error);
      throw error;
    }
  }

  // Handle failed subscription payment
  async handleFailedSubscriptionPayment(subscriptionId) {
    try {
      // You might want to implement a grace period or retry logic here
      // For now, we'll just log the failed payment
      console.log(`Failed payment for subscription ${subscriptionId}`);
      
      // Optionally, mark subscription as payment_failed status
      // await Subscription.updateStatus(subscriptionId, 'payment_failed');
      
      return true;
    } catch (error) {
      console.error('Error handling failed subscription payment:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      
      if (!subscription) {
        throw new Error('Suscripción no encontrada');
      }

      // Update subscription status in our database
      await Subscription.cancel(subscriptionId);
      
      // If you implement recurring payments through MercadoPago subscriptions,
      // you would also need to cancel it on their side here
      
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const paymentInfo = await payment.get({ id: paymentId });
      return paymentInfo.status;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Create refund
  async createRefund(paymentId, amount, reason) {
    try {
      const refundData = {
        amount: amount
      };

      const response = await payment.refund({ id: paymentId, body: refundData });
      
      // Store refund in database
      const paymentRecord = await Payment.findByMercadoPagoId(paymentId);
      if (paymentRecord) {
        await Payment.createRefund(paymentRecord.id, {
          mercadoPagoRefundId: response.id,
          amount: amount,
          reason: reason
        });
      }

      return response;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  // Utility methods
  extractUserIdFromReference(externalReference) {
    if (!externalReference) return null;
    const parts = externalReference.split('_');
    return parts[0] ? parseInt(parts[0]) : null;
  }

  extractPlanIdFromReference(externalReference) {
    if (!externalReference) return null;
    const parts = externalReference.split('_');
    return parts[1] ? parseInt(parts[1]) : null;
  }

  // Format currency for display
  formatCurrency(amount, currency = 'CLP') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}

module.exports = new PaymentService();