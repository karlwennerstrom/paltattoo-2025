const mysql = require('mysql2/promise');

async function activateSubscription() {
  // Conexión a la base de datos
  const connection = await mysql.createConnection({
    host: 'metro.proxy.rlwy.net',
    port: 58495,
    user: 'root',
    password: 'zGJNQcdVXrMBYhybFIlWHRBsecadBorH',
    database: 'railway'
  });

  try {
    // Obtener la última suscripción pendiente del usuario 14
    const [subscriptions] = await connection.execute(
      `SELECT * FROM user_subscriptions 
       WHERE user_id = 14 AND status = 'pending' 
       ORDER BY created_at DESC LIMIT 1`
    );

    if (subscriptions.length === 0) {
      console.log('No hay suscripciones pendientes para el usuario 14');
      return;
    }

    const subscription = subscriptions[0];
    console.log('Suscripción encontrada:', {
      id: subscription.id,
      plan_id: subscription.plan_id,
      external_reference: subscription.external_reference
    });

    // Activar la suscripción
    await connection.execute(
      `UPDATE user_subscriptions 
       SET status = 'authorized', 
           start_date = CURDATE(), 
           next_payment_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY),
           updated_at = NOW()
       WHERE id = ?`,
      [subscription.id]
    );

    console.log('✅ Suscripción activada exitosamente');

    // Crear registro de pago
    await connection.execute(
      `INSERT INTO payment_history 
       (subscription_id, mercadopago_payment_id, amount, status, payment_type, 
        payment_method, status_detail, transaction_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        subscription.id,
        'MANUAL_' + Date.now(),
        3990, // Precio del plan Premium
        'approved',
        'subscription',
        'credit_card',
         'accredited',
        new Date()
      ]
    );

    console.log('✅ Registro de pago creado');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

activateSubscription();