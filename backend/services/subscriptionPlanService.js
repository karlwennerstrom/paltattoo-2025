const { preApprovalPlanClient, config } = require('../config/mercadopago');
const SubscriptionPlan = require('../models/SubscriptionPlan');

class SubscriptionPlanService {
  
  // Crear plan de suscripción en MercadoPago
  async createMercadoPagoPlan(planData) {
    try {
      const { name, description, price, currency = 'CLP' } = planData;
      
      const planRequest = {
        reason: name,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          repetitions: 12, // 12 meses
          billing_day_proportional: true,
          transaction_amount: parseFloat(price),
          currency_id: currency
        },
        payment_methods_allowed: {
          payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' }
          ],
          payment_methods: [
            { id: 'visa' },
            { id: 'master' },
            { id: 'amex' }
          ]
        },
        back_url: config.backUrls.success
      };

      console.log('Creating MercadoPago plan with data:', planRequest);
      const response = await preApprovalPlanClient.create({ body: planRequest });
      
      return {
        id: response.id,
        status: response.status,
        init_point: response.init_point
      };
    } catch (error) {
      console.error('Error creating MercadoPago plan:', error);
      throw error;
    }
  }

  // Obtener plan de MercadoPago
  async getMercadoPagoPlan(planId) {
    try {
      const response = await preApprovalPlanClient.get({ id: planId });
      return response;
    } catch (error) {
      console.error('Error getting MercadoPago plan:', error);
      throw error;
    }
  }

  // Actualizar plan de MercadoPago
  async updateMercadoPagoPlan(planId, updateData) {
    try {
      const response = await preApprovalPlanClient.update({ 
        id: planId, 
        body: updateData 
      });
      return response;
    } catch (error) {
      console.error('Error updating MercadoPago plan:', error);
      throw error;
    }
  }

  // Sincronizar planes locales con MercadoPago
  async syncPlansWithMercadoPago() {
    try {
      const localPlans = await SubscriptionPlan.getAll();
      
      for (const plan of localPlans) {
        if (!plan.mercadopago_plan_id) {
          console.log(`Creating MercadoPago plan for local plan ${plan.id}`);
          
          const mpPlan = await this.createMercadoPagoPlan({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: 'CLP'
          });
          
          // Actualizar plan local con ID de MercadoPago
          await SubscriptionPlan.updateMercadoPagoId(plan.id, mpPlan.id);
          
          console.log(`Plan ${plan.id} synced with MercadoPago ID: ${mpPlan.id}`);
        }
      }
      
      return { success: true, message: 'Plans synchronized successfully' };
    } catch (error) {
      console.error('Error syncing plans:', error);
      throw error;
    }
  }

  // Crear suscripción usando plan de MercadoPago
  async createSubscriptionWithPlan(subscriptionData) {
    try {
      const { planId, userEmail, cardToken, externalReference } = subscriptionData;
      
      // Obtener plan local
      const localPlan = await SubscriptionPlan.getById(planId);
      if (!localPlan) {
        throw new Error('Plan not found');
      }
      
      if (!localPlan.mercadopago_plan_id) {
        throw new Error('Plan not synchronized with MercadoPago');
      }
      
      const subscriptionRequest = {
        preapproval_plan_id: localPlan.mercadopago_plan_id,
        reason: `Suscripción ${localPlan.name} - PalTattoo`,
        external_reference: externalReference,
        payer_email: userEmail,
        back_url: config.backUrls.success,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          start_date: new Date().toISOString(),
          transaction_amount: parseFloat(localPlan.price),
          currency_id: 'CLP'
        },
        status: 'pending'
      };

      // Si hay token de tarjeta, agregarlo
      if (cardToken) {
        subscriptionRequest.card_token_id = cardToken;
        subscriptionRequest.status = 'authorized';
      }

      console.log('Creating MercadoPago subscription:', subscriptionRequest);
      const { preApprovalClient } = require('../config/mercadopago');
      const response = await preApprovalClient.create({ body: subscriptionRequest });
      
      return {
        id: response.id,
        status: response.status,
        init_point: response.init_point,
        external_reference: response.external_reference
      };
    } catch (error) {
      console.error('Error creating subscription with plan:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionPlanService();