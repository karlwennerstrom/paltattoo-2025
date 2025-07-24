const { preApprovalClient, preApprovalPlanClient, config } = require('../config/mercadopago');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const subscriptionPlanService = require('../services/subscriptionPlanService');
const emailService = require('../services/emailService');
const subscriptionNotificationService = require('../services/subscriptionNotificationService');
const User = require('../models/User');

const paymentController = {
  // Obtener planes de suscripción
  getPlans: async (req, res) => {
    try {
      const plans = await Subscription.getPlans();
      res.json({ success: true, data: plans });
    } catch (error) {
      console.error('Error getting plans:', error);
      res.status(500).json({ error: 'Error al obtener los planes' });
    }
  },

  // Crear suscripción
  createSubscription: async (req, res) => {
    try {
      console.log('Create subscription request body:', req.body);
      console.log('User:', req.user);
      
      const { planId, cardToken } = req.body;
      const userId = req.user.id;

      // Validar planId
      if (!planId) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: [{ message: 'Plan ID es requerido' }]
        });
      }

      // Verificar si ya tiene una suscripción activa
      const activeSubscription = await Subscription.getActiveByUserId(userId);
      if (activeSubscription && activeSubscription.plan_id == planId) {
        return res.status(400).json({ 
          error: 'Ya tienes este plan de suscripción activo' 
        });
      }

      // Obtener información del plan
      console.log('Looking for plan with ID:', planId);
      const plan = await SubscriptionPlan.getById(planId);
      console.log('Found plan:', plan);
      
      if (!plan) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: [{ message: 'Plan ID inválido' }]
        });
      }

      // Handle existing subscription if changing plans
      if (activeSubscription) {
        const currentPlan = await SubscriptionPlan.getById(activeSubscription.plan_id);
        const priceDifference = parseFloat(plan.price) - parseFloat(currentPlan.price);
        
        console.log(`Plan change: ${currentPlan.name} (${currentPlan.price}) -> ${plan.name} (${plan.price})`);
        console.log(`Price difference: ${priceDifference}`);
        
        if (priceDifference > 0) {
          // Upgrading to more expensive plan - charge difference immediately
          console.log('Upgrading plan - will charge prorated amount');
        } else if (priceDifference < 0) {
          // Downgrading to cheaper plan - schedule change for next billing cycle
          console.log('Downgrading plan - will apply at end of current billing period');
          
          // For downgrades, we'll implement this later by scheduling the change
          // For now, proceed with immediate change
        }
        
        // Cancel existing subscription in MercadoPago
        if (activeSubscription.mercadopago_preapproval_id) {
          try {
            await preApprovalClient.update({
              id: activeSubscription.mercadopago_preapproval_id,
              body: { status: 'cancelled' }
            });
            
            // Update subscription in database
            await Subscription.cancel(activeSubscription.id);
            console.log('Previous subscription cancelled');
          } catch (mpError) {
            console.error('Error cancelling previous subscription in MercadoPago:', mpError);
            // Continue anyway - we'll create the new subscription
          }
        }
      }

      // Check if we should use development mode for localhost
      const isDevelopmentMode = process.env.FRONTEND_URL?.includes('localhost') || 
                                process.env.BACKEND_URL?.includes('localhost') ||
                                process.env.MERCADOPAGO_DEVELOPMENT_MODE === 'true';
      
      if (isDevelopmentMode) {
        console.log('Running in development mode - MercadoPago requires HTTPS URLs');
        
        // Create subscription in development mode with authorized status
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const subscriptionId = await Subscription.create({
          userId,
          planId,
          mercadopagoPreapprovalId: `dev_preapproval_${Date.now()}`,
          status: 'authorized', // Set as authorized in development
          externalReference: `dev_user_${userId}_plan_${planId}_${Date.now()}`,
          payerEmail: req.user.email,
          startDate: now.toISOString().split('T')[0],
          nextPaymentDate: nextMonth.toISOString().split('T')[0]
        });

        // Send success email (skip in development if using test emails)
        try {
          const emailType = activeSubscription ? 'plan changed' : 'subscription created';
          
          await emailService.sendSubscriptionCreated(req.user.email, {
            userName: req.user.first_name || req.user.email,
            planName: plan.name,
            amount: plan.price,
            isChange: !!activeSubscription
          });
          
          await emailService.sendSubscriptionActivated(req.user.email, {
            userName: req.user.first_name || req.user.email,
            planName: plan.name,
            isChange: !!activeSubscription
          });
          
          console.log(`Email sent for ${emailType}`);
        } catch (emailError) {
          console.log('Email sending skipped in development:', emailError.message);
        }

        // Simulate MercadoPago flow with redirect
        return res.json({
          success: true,
          data: {
            subscriptionId,
            initPoint: `${process.env.FRONTEND_URL}/subscription/success?subscription_id=${subscriptionId}&dev=true`,
            preApprovalId: `dev_preapproval_${Date.now()}`,
            developmentMode: true,
            status: 'authorized',
            planChange: !!activeSubscription,
            message: activeSubscription ? 'Plan cambiado exitosamente' : 'Suscripción creada exitosamente'
          }
        });
      }

      // Production mode - ensure plan is synchronized with MercadoPago
      if (!plan.mercadopago_plan_id) {
        console.log('Plan not synchronized with MercadoPago, creating plan...');
        
        const mpPlan = await subscriptionPlanService.createMercadoPagoPlan({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: 'CLP'
        });
        
        await SubscriptionPlan.updateMercadoPagoId(planId, mpPlan.id);
        plan.mercadopago_plan_id = mpPlan.id;
      }

      // Create preapproval using the plan
      const externalReference = `user_${userId}_plan_${planId}_${Date.now()}`;
      
      const preApprovalData = {
        preapproval_plan_id: plan.mercadopago_plan_id,
        reason: `Suscripción ${plan.name} - PalTattoo`,
        external_reference: externalReference,
        payer_email: req.user.email,
        back_url: config.backUrls.success,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          start_date: new Date().toISOString(),
          transaction_amount: parseFloat(plan.price),
          currency_id: 'CLP'
        },
        status: cardToken ? 'authorized' : 'pending'
      };

      // Add card token if provided
      if (cardToken) {
        preApprovalData.card_token_id = cardToken;
      }

      console.log('Creating MercadoPago preapproval with data:', preApprovalData);
      const preApproval = await preApprovalClient.create({ body: preApprovalData });

      // Guardar suscripción en la base de datos
      const subscriptionId = await Subscription.create({
        userId,
        planId,
        mercadopagoPreapprovalId: preApproval.id,
        status: preApproval.status || 'pending',
        externalReference: externalReference,
        payerEmail: req.user.email
      });

      // Enviar email de confirmación
      await emailService.sendSubscriptionCreated(req.user.email, {
        userName: req.user.first_name || req.user.email,
        planName: plan.name,
        amount: plan.price,
        isChange: !!activeSubscription
      });
      
      // Crear registro de cambio de suscripción y enviar notificación
      try {
        const user = await User.findById(userId);
        const changeType = activeSubscription ? 'upgrade' : 'new';
        
        await Subscription.createSubscriptionChange({
          userId,
          oldPlanId: activeSubscription ? activeSubscription.plan_id : null,
          newPlanId: planId,
          changeType,
          changeReason: 'Manual subscription change',
          effectiveDate: new Date(),
          oldEndDate: activeSubscription ? activeSubscription.end_date : null,
          newEndDate: null // Will be set when payment is processed
        });
        
        await subscriptionNotificationService.sendSubscriptionChangeNotification(user, {
          changeType,
          oldPlan: activeSubscription ? { name: activeSubscription.plan_name } : null,
          newPlan: plan,
          effectiveDate: new Date()
        });
      } catch (notificationError) {
        console.error('Error sending subscription notification:', notificationError);
        // Don't fail the main process if notification fails
      }

      res.json({
        success: true,
        data: {
          subscriptionId,
          initPoint: preApproval.init_point,
          preApprovalId: preApproval.id,
          status: preApproval.status,
          planChange: !!activeSubscription,
          message: activeSubscription ? 'Plan cambiado exitosamente' : 'Suscripción creada exitosamente'
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Error al crear la suscripción' });
    }
  },

  // Webhook de MercadoPago
  webhook: async (req, res) => {
    try {
      const { type, data } = req.body;

      console.log('Webhook received:', { type, data });

      switch (type) {
        case 'preapproval':
          await handlePreapprovalNotification(data.id);
          break;
        
        case 'authorized_payment':
          await handlePaymentNotification(data.id);
          break;

        default:
          console.log('Unhandled webhook type:', type);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Error processing webhook' });
    }
  },

  // Obtener suscripción activa del usuario
  getActiveSubscription: async (req, res) => {
    try {
      const subscription = await Subscription.getActiveByUserId(req.user.id);
      
      if (!subscription) {
        return res.json({ success: true, data: null });
      }

      // Parsear features safely
      try {
        subscription.features = JSON.parse(subscription.features || '{}');
      } catch (parseError) {
        console.log('Invalid features JSON, setting to empty object:', subscription.features);
        subscription.features = {};
      }

      res.json({ success: true, data: subscription });
    } catch (error) {
      console.error('Error getting active subscription:', error);
      res.status(500).json({ error: 'Error al obtener la suscripción' });
    }
  },

  // Obtener historial de suscripciones
  getSubscriptionHistory: async (req, res) => {
    try {
      const subscriptions = await Subscription.getByUserId(req.user.id);
      
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      console.error('Error getting subscription history:', error);
      res.status(500).json({ error: 'Error al obtener el historial' });
    }
  },

  // Obtener historial de pagos del usuario
  getPaymentHistory: async (req, res) => {
    try {
      const paymentHistory = await Subscription.getPaymentHistoryByUser(req.user.id);
      
      res.json({ success: true, data: paymentHistory });
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({ error: 'Error al obtener el historial de pagos' });
    }
  },

  // Obtener cambios de suscripción
  getSubscriptionChanges: async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const changes = await Subscription.getSubscriptionChanges(req.user.id, parseInt(limit));
      
      res.json({ success: true, data: changes });
    } catch (error) {
      console.error('Error getting subscription changes:', error);
      res.status(500).json({ error: 'Error al obtener el historial de cambios' });
    }
  },

  // Cancelar suscripción
  cancelSubscription: async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { reason } = req.body;
      
      const subscription = await Subscription.getByPreapprovalId(subscriptionId);
      if (!subscription || subscription.user_id !== req.user.id) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }
      
      // Cancel subscription
      await Subscription.cancel(subscription.id);
      
      // Create subscription change record
      await Subscription.createSubscriptionChange({
        userId: req.user.id,
        oldPlanId: subscription.plan_id,
        newPlanId: null,
        changeType: 'cancel',
        changeReason: reason || 'User cancellation',
        effectiveDate: new Date(),
        oldEndDate: subscription.end_date,
        newEndDate: new Date()
      });
      
      // Send cancellation notification
      try {
        const user = await User.findById(req.user.id);
        await subscriptionNotificationService.sendSubscriptionChangeNotification(user, {
          changeType: 'cancel',
          oldPlan: { name: subscription.plan_name },
          newPlan: null,
          effectiveDate: new Date()
        });
      } catch (notificationError) {
        console.error('Error sending cancellation notification:', notificationError);
      }
      
      res.json({ success: true, message: 'Suscripción cancelada exitosamente' });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: 'Error al cancelar la suscripción' });
    }
  },

  // Obtener historial de pagos para una suscripción específica
  getSubscriptionPaymentHistory: async (req, res) => {
    try {
      const { subscriptionId } = req.params;

      // Verificar que la suscripción pertenece al usuario
      const subscriptions = await Subscription.getByUserId(req.user.id);
      const subscription = subscriptions.find(s => s.id === parseInt(subscriptionId));

      if (!subscription) {
        return res.status(404).json({ error: 'Suscripción no encontrada' });
      }

      const payments = await Subscription.getPaymentHistory(subscriptionId);
      
      res.json({ success: true, data: payments });
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({ error: 'Error al obtener el historial de pagos' });
    }
  },

  // Obtener suscripción activa del usuario
  getActiveSubscription: async (req, res) => {
    try {
      const subscription = await Subscription.getActiveByUserId(req.user.id);
      res.json({ success: true, data: subscription });
    } catch (error) {
      console.error('Error getting active subscription:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la suscripción activa' });
    }
  },

  // Obtener historial de suscripciones del usuario
  getSubscriptionHistory: async (req, res) => {
    try {
      const subscriptions = await Subscription.getByUserId(req.user.id);
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      console.error('Error getting subscription history:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el historial de suscripciones' });
    }
  },

  // Obtener historial de pagos del usuario
  getPaymentHistory: async (req, res) => {
    try {
      const payments = await Subscription.getPaymentHistoryByUser(req.user.id);
      res.json({ success: true, data: payments });
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el historial de pagos' });
    }
  },

  // Obtener cambios de suscripción del usuario
  getSubscriptionChanges: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const changes = await Subscription.getSubscriptionChanges(req.user.id, limit);
      res.json({ success: true, data: changes });
    } catch (error) {
      console.error('Error getting subscription changes:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los cambios de suscripción' });
    }
  },

  // Sincronizar planes con MercadoPago
  syncPlans: async (req, res) => {
    try {
      await subscriptionPlanService.syncPlansWithMercadoPago();
      res.json({ success: true, message: 'Planes sincronizados exitosamente' });
    } catch (error) {
      console.error('Error syncing plans:', error);
      res.status(500).json({ error: 'Error al sincronizar planes' });
    }
  },

  // Crear token de tarjeta (para usar en frontend)
  createCardToken: async (req, res) => {
    try {
      const { cardData } = req.body;
      
      // En un entorno real, usarías el SDK de MercadoPago para crear el token
      // Aquí solo devolvemos un token simulado para desarrollo
      if (process.env.MERCADOPAGO_DEVELOPMENT_MODE === 'true') {
        res.json({
          success: true,
          data: {
            token: `dev_card_token_${Date.now()}`,
            card_last_four: cardData.number ? cardData.number.slice(-4) : '1234'
          }
        });
      } else {
        res.status(501).json({ error: 'Card tokenization not implemented yet' });
      }
    } catch (error) {
      console.error('Error creating card token:', error);
      res.status(500).json({ error: 'Error al procesar tarjeta' });
    }
  }
};

// Función auxiliar para manejar notificaciones de preaprobación
async function handlePreapprovalNotification(preapprovalId) {
  try {
    // Obtener información de la preaprobación desde MercadoPago
    const preApproval = await preApprovalClient.get({ id: preapprovalId });
    
    // Buscar la suscripción en la base de datos
    const subscription = await Subscription.getByPreapprovalId(preapprovalId);
    
    if (!subscription) {
      console.error('Subscription not found for preapproval:', preapprovalId);
      return;
    }

    // Actualizar estado según el estado en MercadoPago
    const statusMap = {
      'authorized': 'authorized',
      'paused': 'paused',
      'cancelled': 'cancelled',
      'pending': 'pending'
    };

    const newStatus = statusMap[preApproval.status] || 'pending';
    
    const updateData = {
      startDate: preApproval.date_created ? new Date(preApproval.date_created).toISOString().split('T')[0] : null,
      nextPaymentDate: preApproval.next_payment_date ? new Date(preApproval.next_payment_date).toISOString().split('T')[0] : null
    };

    await Subscription.updateStatus(subscription.id, newStatus, updateData);

    // Enviar email según el estado
    if (newStatus === 'authorized') {
      await emailService.sendSubscriptionActivated(subscription.user_email, {
        userName: subscription.user_email.split('@')[0],
        planName: subscription.plan_name
      });
    }
  } catch (error) {
    console.error('Error handling preapproval notification:', error);
  }
}

// Función auxiliar para manejar notificaciones de pago
async function handlePaymentNotification(paymentId) {
  try {
    // Aquí se procesarían las notificaciones de pagos recurrentes
    console.log('Payment notification received:', paymentId);
    // Implementar lógica de registro de pagos
  } catch (error) {
    console.error('Error handling payment notification:', error);
  }
}

module.exports = paymentController;