const db = require('../config/database');

async function activatePendingSubscriptions() {
  try {
    console.log('🔄 Activating pending subscriptions in development mode...');
    
    // Update all pending subscriptions to authorized (for development only)
    const [result] = await db.execute(
      `UPDATE user_subscriptions 
       SET status = 'authorized', 
           start_date = CURDATE(),
           end_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY),
           next_payment_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       WHERE status = 'pending'`
    );
    
    console.log(`✅ Activated ${result.affectedRows} pending subscriptions`);
    
    // Also update any subscriptions without proper dates
    const [dateResult] = await db.execute(
      `UPDATE user_subscriptions 
       SET start_date = IFNULL(start_date, CURDATE()),
           end_date = IFNULL(end_date, DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
           next_payment_date = IFNULL(next_payment_date, DATE_ADD(CURDATE(), INTERVAL 30 DAY))
       WHERE status = 'authorized' 
       AND (start_date IS NULL OR end_date IS NULL OR next_payment_date IS NULL)`
    );
    
    console.log(`✅ Fixed dates for ${dateResult.affectedRows} subscriptions`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error activating subscriptions:', error);
    process.exit(1);
  }
}

// Only run in development
if (process.env.NODE_ENV === 'production') {
  console.error('❌ This script should only be run in development mode!');
  process.exit(1);
}

activatePendingSubscriptions();