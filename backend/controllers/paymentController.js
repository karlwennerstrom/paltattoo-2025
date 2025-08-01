const { preApprovalClient, preApprovalPlanClient, config } = require('../config/mercadopago');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const subscriptionPlanService = require('../services/subscriptionPlanService');
const emailService = require('../services/emailService');
const subscriptionNotificationService = require('../services/subscriptionNotificationService');
const ProrationService = require('../services/prorationService');
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
        
        const now = new Date();
        let prorationDetails = null;
        let immediateCharge = 0;
        let nextPaymentDate;
        
        // Calculate proration if changing plans
        if (activeSubscription && activeSubscription.plan_id !== planId) {
          console.log('Calculating proration for plan change...');
          
          // Get current plan details
          const currentPlan = await SubscriptionPlan.findById(activeSubscription.plan_id);
          
          // Calculate billing period
          const billingPeriod = ProrationService.getCurrentBillingPeriod(activeSubscription);
          
          // Calculate proration
          prorationDetails = ProrationService.calculateProration(
            currentPlan,
            plan,
            now,
            billingPeriod.start,
            billingPeriod.end
          );
          
          immediateCharge = prorationDetails.proration.immediateCharge;
          nextPaymentDate = prorationDetails.proration.nextBillingDate;
          
          console.log('Proration calculated:', {
            immediateCharge,
            description: prorationDetails.summary.description
          });
        } else {
          // New subscription - next payment in 1 month
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          nextPaymentDate = nextMonth.toISOString().split('T')[0];
        }
        
        // Create subscription in development mode with authorized status
        const subscriptionId = await Subscription.create({
          userId,
          planId,
          mercadopagoPreapprovalId: `dev_preapproval_${Date.now()}`,
          status: 'authorized', // Set as authorized in development
          startDate: now.toISOString().split('T')[0],
          nextPaymentDate: nextPaymentDate
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
            message: activeSubscription ? 'Plan cambiado exitosamente' : 'Suscripción creada exitosamente',
            proration: prorationDetails ? {
              immediateCharge,
              isUpgrade: prorationDetails.proration.isUpgrade,
              isDowngrade: prorationDetails.proration.isDowngrade,
              description: prorationDetails.summary.description,
              details: prorationDetails
            } : null
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
        console.log('Created MercadoPago plan:', mpPlan.id);
      }

      // Create preapproval using the plan
      const externalReference = `user_${userId}_plan_${planId}_${Date.now()}`;
      
      // Try creating preapproval without card_token_id first
      const preApprovalData = {
        reason: `Suscripción ${plan.name} - PalTattoo`,
        external_reference: externalReference,
        payer_email: req.user.email,
        back_urls: config.backUrls,
        status: "authorized", // Required according to MercadoPago docs
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          start_date: new Date().toISOString(),
          transaction_amount: parseFloat(plan.price),
          currency_id: 'CLP'
        }
      };

      // Only add preapproval_plan_id if we have it
      if (plan.mercadopago_plan_id) {
        preApprovalData.preapproval_plan_id = plan.mercadopago_plan_id;
      }

      console.log('Creating MercadoPago preapproval with data:', preApprovalData);
      
      // First, create subscription in database to get ID
      const subscriptionId = await Subscription.create({
        userId,
        planId,
        mercadopagoPreapprovalId: 'temp_' + Date.now(), // Temporary value, will be updated with preference ID
        status: 'pending', // Will be activated when payment is completed
        externalReference: externalReference,
        payerEmail: req.user.email
      });

      // Since MercadoPago PreApprovals require card_token_id, we'll use Preferences instead
      // This creates a payment preference that the user can complete, then we manually manage the subscription
      console.log('Creating MercadoPago preference (not preapproval) due to card_token_id requirement');
      
      const { preference } = require('../config/mercadopago');
      
      const preferenceData = {
        items: [{
          id: `plan_${plan.id}`,
          title: `Suscripción ${plan.name} - PalTattoo`,
          description: `Plan ${plan.name} mensual para artistas`,
          category_id: 'services',
          quantity: 1,
          currency_id: 'CLP',
          unit_price: parseFloat(plan.price)
        }],
        payer: {
          name: req.user.first_name || '',
          surname: req.user.last_name || '',
          email: req.user.email
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/subscription/success?subscription_id=${subscriptionId}`,
          failure: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/subscription/failure`,
          pending: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/subscription/pending`
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1
        },
        notification_url: config.notificationUrl,
        statement_descriptor: 'PALTATTOO',
        external_reference: externalReference
      };

      let paymentPreference;
      try {
        paymentPreference = await preference.create({ body: preferenceData });
        console.log('MercadoPago preference created successfully:', paymentPreference.id);
        
        // Update subscription with preference ID and external reference using existing column
        await Subscription.updateStatus(subscriptionId, 'pending', {
          mercadopagoPreapprovalId: paymentPreference.id
        });
        
        // Also create a mapping for the external reference to find the subscription later
        const connection = await require('../config/database').getConnection();
        try {
          await connection.execute(
            'UPDATE user_subscriptions SET external_reference = ? WHERE id = ?',
            [externalReference, subscriptionId]
          );
        } catch (updateError) {
          console.log('Could not update external reference (column may not exist):', updateError.message);
        } finally {
          connection.release();
        }
        
      } catch (prefError) {
        console.error('MercadoPago preference creation failed:', prefError);
        throw new Error(`Error creating payment preference: ${prefError.message}`);
      }

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
          initPoint: paymentPreference.init_point,
          preferenceId: paymentPreference.id,
          status: 'pending',
          planChange: !!activeSubscription,
          message: activeSubscription ? 'Plan cambiado exitosamente' : 'Suscripción creada exitosamente',
          // Note: Using payment preference instead of preapproval due to card_token_id requirement
          isSubscription: true,
          paymentType: 'preference'
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More specific error handling
      if (error.message && error.message.includes('MercadoPago')) {
        res.status(500).json({ 
          error: 'Error de configuración con MercadoPago',
          details: error.message 
        });
      } else if (error.message && error.message.includes('database')) {
        res.status(500).json({ 
          error: 'Error de base de datos',
          details: 'Error al guardar la suscripción' 
        });
      } else {
        res.status(500).json({ 
          error: 'Error al crear la suscripción',
          details: error.message 
        });
      }
    }
  },

  // Webhook de MercadoPago
  webhook: async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { type, data, action } = req.body;
      const headers = req.headers;
      
      console.log('=== MercadoPago Webhook Received ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Headers:', {
        'user-agent': headers['user-agent'],
        'x-request-id': headers['x-request-id'],
        'x-signature': headers['x-signature']
      });
      console.log('Body:', { type, action, data });
      console.log('Full request body:', JSON.stringify(req.body, null, 2));

      // Validate required fields
      if (!type || !data?.id) {
        console.error('Invalid webhook payload: missing type or data.id');
        return res.status(200).send('OK'); // Still return 200 to avoid retries
      }

      // Handle different notification types
      let processed = false;
      
      if (type === 'payment' && data?.id) {
        console.log('Processing payment notification for ID:', data.id);
        await paymentController.handlePaymentNotification(data.id);
        processed = true;
      } else if (type === 'preapproval' && data?.id) {
        console.log('Processing preapproval notification for ID:', data.id);
        await paymentController.handlePreapprovalNotification(data.id);
        processed = true;
      } else if (type === 'authorized_payment' && data?.id) {
        console.log('Processing authorized payment notification for ID:', data.id);
        await paymentController.handleAuthorizedPaymentNotification(data.id);
        processed = true;
      } else {
        console.log('Unhandled webhook type:', type);
      }

      const processingTime = Date.now() - startTime;
      console.log(`Webhook processed in ${processingTime}ms, processed: ${processed}`);
      console.log('=== End Webhook Processing ===\n');

      // Always respond 200 so MercadoPago doesn't retry
      res.status(200).json({ 
        status: 'received', 
        processed,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('=== Webhook Error ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error(`Processing time: ${processingTime}ms`);
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      console.error('=== End Webhook Error ===\n');
      
      // Still respond 200 to avoid retries from MercadoPago
      res.status(200).json({ 
        status: 'error', 
        error: error.message,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Handle payment notifications
  handlePaymentNotification: async (paymentId) => {
    try {
      const { payment } = require('../config/mercadopago');
      const paymentInfo = await payment.get({ id: paymentId });
      
      console.log('Processing payment notification:', {
        id: paymentInfo.id,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
        transaction_amount: paymentInfo.transaction_amount,
        payment_method_id: paymentInfo.payment_method_id
      });

      if (!paymentInfo.external_reference) {
        console.error('Payment notification missing external_reference');
        return;
      }

      // Extract info from external_reference format: user_{userId}_plan_{planId}_{timestamp}
      const refParts = paymentInfo.external_reference.split('_');
      console.log('External reference parts:', refParts);
      
      if (refParts.length >= 5 && refParts[0] === 'user' && refParts[2] === 'plan') {
        const userId = parseInt(refParts[1]);
        const planId = parseInt(refParts[3]);
        
        console.log('Extracted from external reference:', { userId, planId });

        if (isNaN(userId) || isNaN(planId)) {
          console.error('Invalid userId or planId from external reference:', { userId, planId });
          return;
        }

        // Try multiple methods to find the subscription
        let subscription = null;
        
        // Method 1: Find by external reference in mercadopago_preapproval_id field
        subscription = await Subscription.getByPreapprovalId(paymentInfo.external_reference);
        
        if (!subscription && paymentInfo.preference_id) {
          // Method 2: Find by preference ID
          console.log('Trying to find subscription by preference ID:', paymentInfo.preference_id);
          subscription = await Subscription.getByPreapprovalId(paymentInfo.preference_id);
        }
        
        if (!subscription) {
          // Method 3: Find by user and plan with pending status
          console.log('Trying to find pending subscription by user and plan:', { userId, planId });
          const db = require('../config/database');
          const [rows] = await db.execute(
            `SELECT s.*, p.name as plan_name, p.price, u.email as user_email 
             FROM user_subscriptions s 
             JOIN subscription_plans p ON s.plan_id = p.id 
             JOIN users u ON s.user_id = u.id 
             WHERE s.user_id = ? AND s.plan_id = ? AND s.status = 'pending' 
             ORDER BY s.created_at DESC LIMIT 1`,
            [userId, planId]
          );
          subscription = rows[0];
        }
        
        if (!subscription) {
          console.error('Subscription not found with any method. External reference:', paymentInfo.external_reference, 'Preference ID:', paymentInfo.preference_id);
          return;
        }

        await paymentController.processPaymentApproval(paymentInfo, subscription, userId, planId);
      } else {
        console.error('Invalid external_reference format:', paymentInfo.external_reference);
      }
    } catch (error) {
      console.error('Error processing payment notification:', error);
    }
  },

  // Process payment approval
  processPaymentApproval: async (paymentInfo, subscription, userId, planId) => {
    try {
      if (paymentInfo.status === 'approved') {
        console.log('Processing approved payment for subscription:', subscription.id);
        
        // Activate subscription
        await Subscription.updateStatus(subscription.id, 'authorized', {
          startDate: new Date().toISOString().split('T')[0],
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
        console.log('Subscription activated:', subscription.id);
        
        // Record payment
        await Subscription.createPaymentRecord({
          subscriptionId: subscription.id,
          mercadopagoPaymentId: paymentInfo.id,
          amount: paymentInfo.transaction_amount,
          status: 'approved',
          paymentType: 'subscription',
          paymentMethod: paymentInfo.payment_method_id,
          statusDetail: paymentInfo.status_detail,
          transactionDate: new Date()
        });
        
        console.log('Payment recorded for subscription:', subscription.id);

        // Send email notification
        try {
          const user = await User.findById(userId);
          const plan = await SubscriptionPlan.findById(planId);
          
          if (user && plan) {
            await emailService.sendPaymentReceived(user.email, {
              userName: user.first_name || user.email,
              planName: plan.name,
              amount: paymentInfo.transaction_amount,
              paymentDate: new Date()
            });
            
            await emailService.sendSubscriptionActivated(user.email, {
              userName: user.first_name || user.email,
              planName: plan.name,
              isChange: false
            });
            
            console.log('Emails sent for subscription activation');
          }
        } catch (emailError) {
          console.error('Error sending payment emails:', emailError);
        }
      } else {
        console.log('Payment not approved, status:', paymentInfo.status);
      }
    } catch (error) {
      console.error('Error processing payment approval:', error);
    }
  },

  // Handle preapproval notifications
  handlePreapprovalNotification: async (preapprovalId) => {
    try {
      const { preApprovalClient } = require('../config/mercadopago');
      const preApproval = await preApprovalClient.get({ id: preapprovalId });
      
      console.log('Processing preapproval notification:', {
        id: preApproval.id,
        status: preApproval.status,
        external_reference: preApproval.external_reference
      });

      // Find subscription by preapproval ID
      const subscription = await Subscription.getByPreapprovalId(preapprovalId);
      
      if (subscription) {
        // Update subscription status based on preapproval status
        const statusMap = {
          'authorized': 'authorized',
          'paused': 'paused',
          'cancelled': 'cancelled',
          'pending': 'pending'
        };

        const newStatus = statusMap[preApproval.status] || 'pending';
        
        await Subscription.updateStatus(subscription.id, newStatus, {
          startDate: preApproval.date_created ? new Date(preApproval.date_created).toISOString().split('T')[0] : null,
          nextPaymentDate: preApproval.next_payment_date ? new Date(preApproval.next_payment_date).toISOString().split('T')[0] : null
        });

        // Send activation email if authorized
        if (newStatus === 'authorized') {
          try {
            const user = await User.findById(subscription.user_id);
            const plan = await SubscriptionPlan.findById(subscription.plan_id);
            
            await emailService.sendSubscriptionActivated(user.email, {
              userName: user.first_name || user.email,
              planName: plan.name
            });
          } catch (emailError) {
            console.error('Error sending activation email:', emailError);
          }
        }
      }
    } catch (error) {
      console.error('Error processing preapproval notification:', error);
    }
  },

  // Handle authorized payment notifications (recurring payments)
  handleAuthorizedPaymentNotification: async (paymentId) => {
    try {
      // This handles recurring payments from authorized subscriptions
      await paymentController.handlePaymentNotification(paymentId);
    } catch (error) {
      console.error('Error processing authorized payment notification:', error);
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
  },

  // DEPRECATED: This method should not be used for subscriptions
  // Use createSubscription instead which handles PreApproval flow correctly

  // Send subscription change email notification
  sendSubscriptionChangeEmail: async (req, res) => {
    try {
      const { oldPlan, newPlan, effectiveDate } = req.body;
      const userId = req.user.id;

      if (!oldPlan || !newPlan) {
        return res.status(400).json({ 
          success: false, 
          error: 'Old plan and new plan are required' 
        });
      }

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      const profile = await User.getProfile(userId);
      
      // Send subscription change email
      try {
        await emailService.sendSubscriptionChanged(user.email, {
          userName: profile.first_name || user.email,
          oldPlanName: oldPlan,
          newPlanName: newPlan,
          effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date()
        });

        res.json({
          success: true,
          message: 'Subscription change email sent successfully'
        });
      } catch (emailError) {
        console.error('Error sending subscription change email:', emailError);
        res.status(500).json({ 
          success: false, 
          error: 'Error sending email notification' 
        });
      }
    } catch (error) {
      console.error('Error in sendSubscriptionChangeEmail:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error processing email notification' 
      });
    }
  },

  // Get proration preview for plan change
  getProrationPreview: async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.query;

    if (!planId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Plan ID is required' 
      });
    }

    // Get current active subscription
    const activeSubscription = await Subscription.getActiveByUserId(userId);
    if (!activeSubscription) {
      // If no active subscription, return empty proration (new subscription)
      return res.json({ 
        success: true, 
        proration: null,
        message: 'No active subscription - will create new subscription' 
      });
    }

    // Get target plan
    const targetPlan = await SubscriptionPlan.findById(planId);
    if (!targetPlan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Target plan not found' 
      });
    }

    // Get current plan
    const currentPlan = await SubscriptionPlan.findById(activeSubscription.plan_id);
    if (!currentPlan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Current plan not found' 
      });
    }

    // Calculate billing period
    const billingPeriod = ProrationService.getCurrentBillingPeriod(activeSubscription);

    // Calculate proration
    const prorationDetails = ProrationService.calculateProration(
      currentPlan,
      targetPlan,
      new Date(),
      billingPeriod.start,
      billingPeriod.end
    );

    res.json({
      success: true,
      data: {
        proration: {
          immediateCharge: prorationDetails.proration.immediateCharge,
          isUpgrade: prorationDetails.proration.isUpgrade,
          isDowngrade: prorationDetails.proration.isDowngrade,
          description: prorationDetails.summary.description,
          details: prorationDetails
        }
      }
    });

  } catch (error) {
    console.error('Error getting proration preview:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al calcular el prorrateo' 
    });
  }
}

};

module.exports = paymentController;

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