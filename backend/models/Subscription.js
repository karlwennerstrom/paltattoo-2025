const promisePool = require('../config/database');

class Subscription {
  static async create(subscriptionData) {
    const { userId, planId, mercadoPagoSubscriptionId, status } = subscriptionData;
    
    const [result] = await promisePool.execute(
      `INSERT INTO subscriptions (user_id, plan_id, mercadopago_subscription_id, status, start_date)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, planId, mercadoPagoSubscriptionId, status]
    );
    
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await promisePool.execute(
      `SELECT s.*, sp.name as plan_name, sp.price, sp.billing_cycle, sp.features 
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.user_id = ? AND s.status IN ('active', 'pending')
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );
    
    return rows[0];
  }

  static async findByMercadoPagoId(mercadoPagoSubscriptionId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM subscriptions WHERE mercadopago_subscription_id = ?',
      [mercadoPagoSubscriptionId]
    );
    
    return rows[0];
  }

  static async updateStatus(subscriptionId, status, endDate = null) {
    const fields = ['status = ?'];
    const values = [status, subscriptionId];
    
    if (endDate) {
      fields.push('end_date = ?');
      values.splice(1, 0, endDate);
    }
    
    const [result] = await promisePool.execute(
      `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async findById(subscriptionId) {
    const [rows] = await promisePool.execute(
      `SELECT s.*, sp.name as plan_name, sp.price, sp.billing_cycle, sp.features,
              u.email as user_email, up.first_name, up.last_name
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE s.id = ?`,
      [subscriptionId]
    );
    
    return rows[0];
  }

  static async getActiveSubscriptionsByPlan(planId) {
    const [rows] = await promisePool.execute(
      `SELECT COUNT(*) as count 
       FROM subscriptions 
       WHERE plan_id = ? AND status = 'active'`,
      [planId]
    );
    
    return rows[0].count;
  }

  static async getUserSubscriptionHistory(userId) {
    const [rows] = await promisePool.execute(
      `SELECT s.*, sp.name as plan_name, sp.price, sp.billing_cycle
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );
    
    return rows;
  }

  static async cancel(subscriptionId) {
    return this.updateStatus(subscriptionId, 'cancelled', new Date());
  }

  static async reactivate(subscriptionId) {
    const [result] = await promisePool.execute(
      'UPDATE subscriptions SET status = ?, end_date = NULL WHERE id = ?',
      ['active', subscriptionId]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Subscription;