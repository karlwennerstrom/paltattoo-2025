const db = require('../config/database');

class Subscription {
  // Obtener todos los planes disponibles
  static async getPlans() {
    const [rows] = await db.execute(
      'SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price ASC'
    );
    return rows;
  }

  // Obtener un plan por ID
  static async getPlanById(planId) {
    const [rows] = await db.execute(
      'SELECT * FROM subscription_plans WHERE id = ? AND is_active = TRUE',
      [planId]
    );
    return rows[0];
  }

  // Obtener un plan por tipo
  static async getPlanByType(planType) {
    const [rows] = await db.execute(
      'SELECT * FROM subscription_plans WHERE plan_type = ? AND is_active = TRUE',
      [planType]
    );
    return rows[0];
  }

  // Crear una nueva suscripción
  static async create(subscriptionData) {
    const {
      userId,
      planId,
      mercadopagoPreapprovalId,
      status = 'pending',
      startDate,
      endDate,
      nextPaymentDate
    } = subscriptionData;

    const [result] = await db.execute(
      `INSERT INTO user_subscriptions 
       (user_id, plan_id, mercadopago_preapproval_id, status, start_date, end_date, 
        next_payment_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        planId, 
        mercadopagoPreapprovalId || null, 
        status, 
        startDate || null, 
        endDate || null, 
        nextPaymentDate || null
      ]
    );

    return result.insertId;
  }

  // Obtener suscripción activa de un usuario
  static async getActiveByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT s.*, p.name as plan_name, p.plan_type, p.price, p.features, p.max_portfolio_images 
       FROM user_subscriptions s 
       JOIN subscription_plans p ON s.plan_id = p.id 
       WHERE s.user_id = ? AND s.status = 'authorized' 
       AND (s.end_date IS NULL OR s.end_date >= CURDATE())
       ORDER BY s.created_at DESC LIMIT 1`,
      [userId]
    );
    return rows[0];
  }

  // Obtener todas las suscripciones de un usuario
  static async getByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT s.*, p.name as plan_name, p.price 
       FROM user_subscriptions s 
       JOIN subscription_plans p ON s.plan_id = p.id 
       WHERE s.user_id = ? 
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Obtener suscripción por ID de preaprobación de MercadoPago
  static async getByPreapprovalId(preapprovalId) {
    const [rows] = await db.execute(
      `SELECT s.*, p.name as plan_name, p.price, u.email as user_email 
       FROM user_subscriptions s 
       JOIN subscription_plans p ON s.plan_id = p.id 
       JOIN users u ON s.user_id = u.id 
       WHERE s.mercadopago_preapproval_id = ?`,
      [preapprovalId]
    );
    return rows[0];
  }

  // Actualizar estado de suscripción
  static async updateStatus(subscriptionId, status, additionalData = {}) {
    const updates = ['status = ?'];
    const values = [status];

    if (additionalData.startDate) {
      updates.push('start_date = ?');
      values.push(additionalData.startDate);
    }

    if (additionalData.endDate) {
      updates.push('end_date = ?');
      values.push(additionalData.endDate);
    }

    if (additionalData.nextPaymentDate) {
      updates.push('next_payment_date = ?');
      values.push(additionalData.nextPaymentDate);
    }

    values.push(subscriptionId);

    const [result] = await db.execute(
      `UPDATE user_subscriptions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Cancelar suscripción
  static async cancel(subscriptionId) {
    return await this.updateStatus(subscriptionId, 'cancelled', {
      endDate: new Date().toISOString().split('T')[0]
    });
  }
  
  // Actualizar preference ID de MercadoPago
  static async updatePreferenceId(subscriptionId, preferenceId) {
    const [result] = await db.execute(
      'UPDATE user_subscriptions SET mercadopago_preference_id = ? WHERE id = ?',
      [preferenceId, subscriptionId]
    );
    return result.affectedRows > 0;
  }
  
  // Crear registro de pago
  static async createPaymentRecord(paymentData) {
    const { subscriptionId, mercadoPagoPaymentId, amount, status, paymentDate } = paymentData;
    
    const [result] = await db.execute(
      `INSERT INTO subscription_payments 
       (subscription_id, mercadopago_payment_id, amount, status, payment_date, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [subscriptionId, mercadoPagoPaymentId, amount, status, paymentDate]
    );
    
    return result.insertId;
  }

  // Verificar si un usuario puede usar una característica según su plan
  static async checkFeatureAccess(userId, featureName) {
    const subscription = await this.getActiveByUserId(userId);
    
    if (!subscription) {
      return false;
    }

    const features = JSON.parse(subscription.features || '{}');
    return features[featureName] === true || features[featureName] === -1; // -1 significa ilimitado
  }

  // Obtener límite de una característica
  static async getFeatureLimit(userId, featureName) {
    const subscription = await this.getActiveByUserId(userId);
    
    if (!subscription) {
      return 0;
    }

    const features = JSON.parse(subscription.features || '{}');
    return features[featureName] || 0;
  }

  // Get collection limits based on subscription plan
  static async getCollectionLimit(userId) {
    const subscription = await this.getActiveByUserId(userId);
    
    if (!subscription) {
      return 3; // Basic/free plan limit
    }

    const planType = subscription.plan_type?.toLowerCase();
    
    switch (planType) {
      case 'basic':
      case 'basico':
        return 3;
      case 'premium':
        return 20;
      case 'pro':
        return -1; // Unlimited
      default:
        return 3;
    }
  }

  // Get portfolio item limits based on subscription plan
  static async getPortfolioLimit(userId) {
    const subscription = await this.getActiveByUserId(userId);
    
    if (!subscription) {
      return 10; // Basic/free plan limit
    }

    const planType = subscription.plan_type?.toLowerCase();
    
    switch (planType) {
      case 'basic':
      case 'basico':
        return 10;
      case 'premium':
      case 'pro':
        return -1; // Unlimited
      default:
        return 10;
    }
  }

  // Crear registro de pago
  static async createPaymentRecord(paymentData) {
    const {
      subscriptionId,
      mercadopagoPaymentId,
      amount,
      status,
      paymentType,
      paymentMethod,
      statusDetail,
      transactionDate
    } = paymentData;

    const [result] = await db.execute(
      `INSERT INTO payment_history 
       (subscription_id, mercadopago_payment_id, amount, status, payment_type, 
        payment_method, status_detail, transaction_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [subscriptionId, mercadopagoPaymentId, amount, status, paymentType, 
       paymentMethod, statusDetail, transactionDate]
    );

    return result.insertId;
  }

  // Obtener historial de pagos
  static async getPaymentHistory(subscriptionId) {
    const [rows] = await db.execute(
      `SELECT * FROM payment_history 
       WHERE subscription_id = ? 
       ORDER BY transaction_date DESC`,
      [subscriptionId]
    );
    return rows;
  }

  // Obtener historial de pagos por usuario
  static async getPaymentHistoryByUser(userId) {
    const [rows] = await db.execute(
      `SELECT ph.*, s.plan_id, sp.name as plan_name, sp.plan_type
       FROM payment_history ph
       JOIN user_subscriptions s ON ph.subscription_id = s.id
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.user_id = ? 
       ORDER BY ph.transaction_date DESC`,
      [userId]
    );
    return rows;
  }

  // Crear registro de cambio de suscripción
  static async createSubscriptionChange(changeData) {
    const {
      userId,
      oldPlanId,
      newPlanId,
      changeType, // 'upgrade', 'downgrade', 'cancel', 'reactivate'
      changeReason,
      effectiveDate,
      oldEndDate,
      newEndDate
    } = changeData;

    const [result] = await db.execute(
      `INSERT INTO subscription_changes 
       (user_id, old_plan_id, new_plan_id, change_type, change_reason, 
        effective_date, old_end_date, new_end_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, oldPlanId, newPlanId, changeType, changeReason, 
       effectiveDate, oldEndDate, newEndDate]
    );

    return result.insertId;
  }

  // Obtener historial de cambios de suscripción
  static async getSubscriptionChanges(userId, limit = 50) {
    try {
      // Ensure parameters are properly typed
      const userIdInt = parseInt(userId);
      const limitInt = parseInt(limit);
      
      if (isNaN(userIdInt) || isNaN(limitInt) || limitInt <= 0) {
        console.error('Invalid parameters for getSubscriptionChanges:', { userId, limit });
        return [];
      }

      // Use string interpolation for LIMIT to avoid mysql2 parameter issues
      const [rows] = await db.execute(
        `SELECT sc.*, 
                op.name as old_plan_name, op.plan_type as old_plan_type,
                np.name as new_plan_name, np.plan_type as new_plan_type
         FROM subscription_changes sc
         LEFT JOIN subscription_plans op ON sc.old_plan_id = op.id
         LEFT JOIN subscription_plans np ON sc.new_plan_id = np.id
         WHERE sc.user_id = ?
         ORDER BY sc.created_at DESC
         LIMIT ${limitInt}`,
        [userIdInt]
      );
      return rows;
    } catch (error) {
      console.error('Error in getSubscriptionChanges:', error);
      // If table doesn't exist, return empty array for now
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('subscription_changes table does not exist, returning empty array');
        return [];
      }
      // Return empty array for any error to prevent UI breaking
      return [];
    }
  }

  // Obtener analíticas de suscripciones (para admin)
  static async getSubscriptionAnalytics(startDate = null, endDate = null) {
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE s.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [stats] = await db.execute(
      `SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN s.status = 'authorized' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
        COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as pending_subscriptions,
        sp.name as plan_name,
        sp.plan_type,
        AVG(sp.price) as avg_plan_price,
        SUM(sp.price) as total_revenue
       FROM user_subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       ${dateFilter}
       GROUP BY sp.id, sp.name, sp.plan_type`,
      params
    );

    const [changes] = await db.execute(
      `SELECT 
        change_type,
        COUNT(*) as change_count,
        DATE(created_at) as change_date
       FROM subscription_changes
       ${dateFilter ? 'WHERE created_at BETWEEN ? AND ?' : ''}
       GROUP BY change_type, DATE(created_at)
       ORDER BY change_date DESC`,
      dateFilter ? params : []
    );

    return { subscriptionStats: stats, changeStats: changes };
  }

  // Obtener suscripción por ID
  static async getById(subscriptionId) {
    const [rows] = await db.execute(
      `SELECT s.*, p.name as plan_name, p.price, p.features 
       FROM user_subscriptions s 
       JOIN subscription_plans p ON s.plan_id = p.id 
       WHERE s.id = ?`,
      [subscriptionId]
    );
    return rows[0];
  }

  // Cambiar plan de suscripción
  static async changePlan(subscriptionId, newPlanId) {
    const [result] = await db.execute(
      'UPDATE user_subscriptions SET plan_id = ? WHERE id = ?',
      [newPlanId, subscriptionId]
    );
    return result.affectedRows > 0;
  }

  // Actualizar suscripción con registro de cambio
  static async updateSubscriptionWithChange(userId, oldSubscription, newPlanId, changeType, changeReason = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Obtener información del nuevo plan
      const [newPlanRows] = await connection.execute(
        'SELECT * FROM subscription_plans WHERE id = ?',
        [newPlanId]
      );
      const newPlan = newPlanRows[0];
      
      if (!newPlan) {
        throw new Error('Plan no encontrado');
      }
      
      // Crear registro de cambio
      await connection.execute(
        `INSERT INTO subscription_changes 
         (user_id, old_plan_id, new_plan_id, change_type, change_reason, 
          effective_date, old_end_date, new_end_date, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())`,
        [userId, oldSubscription ? oldSubscription.plan_id : null, newPlanId, 
         changeType, changeReason, oldSubscription ? oldSubscription.end_date : null]
      );
      
      // Cancelar suscripción anterior si existe
      if (oldSubscription) {
        await connection.execute(
          'UPDATE user_subscriptions SET status = "cancelled", end_date = NOW() WHERE id = ?',
          [oldSubscription.id]
        );
      }
      
      // Crear nueva suscripción
      const [result] = await connection.execute(
        `INSERT INTO user_subscriptions 
         (user_id, plan_id, status, start_date, end_date, next_payment_date) 
         VALUES (?, ?, 'pending', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY))`,
        [userId, newPlanId]
      );
      
      await connection.commit();
      return result.insertId;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Subscription;