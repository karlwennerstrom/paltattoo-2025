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
        name: 'Básico',
        description: 'Plan básico para tatuadores que están comenzando',
        price: 9990,
        billingCycle: 'monthly',
        features: [
          'Hasta 5 propuestas por mes',
          'Perfil básico',
          'Galería de hasta 10 imágenes',
          'Soporte por email'
        ],
        isActive: true
      },
      {
        name: 'Profesional',
        description: 'Plan ideal para tatuadores establecidos',
        price: 19990,
        billingCycle: 'monthly',
        features: [
          'Propuestas ilimitadas',
          'Perfil destacado',
          'Galería ilimitada',
          'Calendario de citas',
          'Estadísticas avanzadas',
          'Soporte prioritario'
        ],
        isActive: true
      },
      {
        name: 'Estudio',
        description: 'Plan para estudios de tatuajes con múltiples artistas',
        price: 49990,
        billingCycle: 'monthly',
        features: [
          'Múltiples perfiles de artistas',
          'Gestión de equipo',
          'Calendario compartido',
          'Reportes detallados',
          'Integración con redes sociales',
          'Soporte dedicado',
          'API access'
        ],
        isActive: true
      }
    ];
  }
}

module.exports = SubscriptionPlan;