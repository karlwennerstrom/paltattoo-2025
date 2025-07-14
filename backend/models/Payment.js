const promisePool = require('../config/database');

class Payment {
  static async create(paymentData) {
    const { 
      userId, 
      subscriptionId, 
      mercadoPagoPaymentId, 
      amount, 
      currency, 
      status, 
      paymentMethod 
    } = paymentData;
    
    const [result] = await promisePool.execute(
      `INSERT INTO payments (user_id, subscription_id, mercadopago_payment_id, amount, currency, status, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, subscriptionId, mercadoPagoPaymentId, amount, currency, status, paymentMethod]
    );
    
    return result.insertId;
  }

  static async findById(paymentId) {
    const [rows] = await promisePool.execute(
      `SELECT p.*, s.plan_id, sp.name as plan_name,
              u.email as user_email, up.first_name, up.last_name
       FROM payments p
       LEFT JOIN subscriptions s ON p.subscription_id = s.id
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       JOIN users u ON p.user_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE p.id = ?`,
      [paymentId]
    );
    
    return rows[0];
  }

  static async findByMercadoPagoId(mercadoPagoPaymentId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM payments WHERE mercadopago_payment_id = ?',
      [mercadoPagoPaymentId]
    );
    
    return rows[0];
  }

  static async updateStatus(paymentId, status, processedAt = null) {
    const fields = ['status = ?'];
    const values = [status, paymentId];
    
    if (processedAt) {
      fields.push('processed_at = ?');
      values.splice(1, 0, processedAt);
    }
    
    const [result] = await promisePool.execute(
      `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async getUserPayments(userId, limit = 10, offset = 0) {
    const limitValue = parseInt(limit);
    const offsetValue = parseInt(offset);
    const [rows] = await promisePool.execute(
      `SELECT p.*, s.plan_id, sp.name as plan_name
       FROM payments p
       LEFT JOIN subscriptions s ON p.subscription_id = s.id
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ${limitValue} OFFSET ${offsetValue}`,
      [userId]
    );
    
    return rows;
  }

  static async getPaymentStats(startDate, endDate) {
    const [rows] = await promisePool.execute(
      `SELECT 
         COUNT(*) as total_payments,
         SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_revenue,
         COUNT(CASE WHEN status = 'approved' THEN 1 END) as successful_payments,
         COUNT(CASE WHEN status = 'rejected' THEN 1 END) as failed_payments
       FROM payments 
       WHERE created_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    
    return rows[0];
  }

  static async getMonthlyRevenue(year) {
    const [rows] = await promisePool.execute(
      `SELECT 
         MONTH(created_at) as month,
         SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as revenue,
         COUNT(CASE WHEN status = 'approved' THEN 1 END) as payments
       FROM payments 
       WHERE YEAR(created_at) = ? AND status = 'approved'
       GROUP BY MONTH(created_at)
       ORDER BY month`,
      [year]
    );
    
    return rows;
  }

  static async createRefund(paymentId, refundData) {
    const { mercadoPagoRefundId, amount, reason } = refundData;
    
    const [result] = await promisePool.execute(
      `INSERT INTO payment_refunds (payment_id, mercadopago_refund_id, amount, reason, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [paymentId, mercadoPagoRefundId, amount, reason]
    );
    
    return result.insertId;
  }

  static async updateRefundStatus(refundId, status) {
    const [result] = await promisePool.execute(
      'UPDATE payment_refunds SET status = ?, processed_at = NOW() WHERE id = ?',
      [status, refundId]
    );
    
    return result.affectedRows > 0;
  }

  static async getRefunds(paymentId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM payment_refunds WHERE payment_id = ? ORDER BY created_at DESC',
      [paymentId]
    );
    
    return rows;
  }
}

module.exports = Payment;