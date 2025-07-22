const promisePool = require('../config/database');

class SubscriptionPlan {
  static async getAll() {
    const [rows] = await promisePool.execute(
      'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price ASC'
    );
    
    return rows;
  }

  static async findById(planId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM subscription_plans WHERE id = ? AND is_active = true',
      [planId]
    );
    
    return rows[0];
  }

  static async create(planData) {
    const { name, description, price, billingCycle, features, isActive } = planData;
    
    const [result] = await promisePool.execute(
      `INSERT INTO subscription_plans (name, description, price, billing_cycle, features, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, billingCycle, JSON.stringify(features), isActive]
    );
    
    return result.insertId;
  }

  static async update(planId, planData) {
    const { name, description, price, billingCycle, features, isActive } = planData;
    
    const [result] = await promisePool.execute(
      `UPDATE subscription_plans 
       SET name = ?, description = ?, price = ?, billing_cycle = ?, features = ?, is_active = ?
       WHERE id = ?`,
      [name, description, price, billingCycle, JSON.stringify(features), isActive, planId]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(planId) {
    // Soft delete - mark as inactive
    const [result] = await promisePool.execute(
      'UPDATE subscription_plans SET is_active = false WHERE id = ?',
      [planId]
    );
    
    return result.affectedRows > 0;
  }

  static async getById(planId) {
    return this.findById(planId);
  }

  static async updateMercadoPagoId(planId, mercadoPagoId) {
    const [result] = await promisePool.execute(
      'UPDATE subscription_plans SET mercadopago_plan_id = ? WHERE id = ?',
      [mercadoPagoId, planId]
    );
    
    return result.affectedRows > 0;
  }

  static async getPopularPlans() {
    const [rows] = await promisePool.execute(
      `SELECT sp.*, COUNT(s.id) as subscriber_count
       FROM subscription_plans sp
       LEFT JOIN subscriptions s ON sp.id = s.plan_id AND s.status = 'active'
       WHERE sp.is_active = true
       GROUP BY sp.id
       ORDER BY subscriber_count DESC, sp.price ASC`
    );
    
    return rows;
  }

  static async getPlanStats(planId) {
    const [rows] = await promisePool.execute(
      `SELECT 
         COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
         COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
         COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as pending_subscriptions,
         SUM(CASE WHEN p.status = 'approved' THEN p.amount ELSE 0 END) as total_revenue
       FROM subscription_plans sp
       LEFT JOIN subscriptions s ON sp.id = s.plan_id
       LEFT JOIN payments p ON s.id = p.subscription_id
       WHERE sp.id = ?`,
      [planId]
    );
    
    return rows[0];
  }

  // Default plans for seeding
  static getDefaultPlans() {
    return [
      {
        name: 'basico',
        description: 'Plan gratuito para tatuadores que están comenzando',
        price: 0,
        billingCycle: 'monthly',
        features: [
          'Perfil básico',
          'Galería de hasta 10 imágenes',
          'Hasta 5 propuestas por mes',
          'Sin acceso a calendario',
          'Soporte por email'
        ],
        isActive: true
      },
      {
        name: 'premium',
        description: 'Plan ideal para tatuadores profesionales',
        price: 3990,
        billingCycle: 'monthly',
        features: [
          'Propuestas ilimitadas',
          'Perfil destacado',
          'Galería ilimitada',
          'Calendario de citas completo',
          'Estadísticas básicas',
          'Soporte prioritario',
          'Badge Premium'
        ],
        isActive: true
      },
      {
        name: 'pro',
        description: 'Plan avanzado para tatuadores establecidos',
        price: 7990,
        billingCycle: 'monthly',
        features: [
          'Todo lo incluido en Premium',
          'Múltiples calendarios',
          'Estadísticas avanzadas',
          'Integración con redes sociales',
          'API access',
          'Soporte dedicado 24/7',
          'Badge Pro',
          'Promoción destacada en búsquedas'
        ],
        isActive: true
      }
    ];
  }
}

module.exports = SubscriptionPlan;