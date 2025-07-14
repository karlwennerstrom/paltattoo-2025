const { promisePool } = require('../config/database');
const SubscriptionPlan = require('../models/SubscriptionPlan');

async function seedSubscriptionPlans() {
  try {
    console.log('Seeding subscription plans...');

    // First, check if plans already exist
    const existingPlans = await SubscriptionPlan.getAll();
    if (existingPlans.length > 0) {
      console.log('Subscription plans already exist, skipping seed.');
      return;
    }

    // Create the subscription_plans table if it doesn't exist
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
        features JSON,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create subscriptions table if it doesn't exist
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        mercadopago_subscription_id VARCHAR(100),
        status ENUM('pending', 'active', 'cancelled', 'payment_failed') DEFAULT 'pending',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
        INDEX idx_user_subscription (user_id, status),
        INDEX idx_mercadopago_subscription (mercadopago_subscription_id)
      )
    `);

    // Create payments table if it doesn't exist
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        subscription_id INT NULL,
        mercadopago_payment_id VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'CLP',
        status ENUM('pending', 'approved', 'rejected', 'cancelled', 'refunded') DEFAULT 'pending',
        payment_method VARCHAR(50),
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
        UNIQUE KEY unique_mercadopago_payment (mercadopago_payment_id),
        INDEX idx_user_payments (user_id),
        INDEX idx_payment_status (status),
        INDEX idx_processed_date (processed_at)
      )
    `);

    // Create payment_refunds table if it doesn't exist
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS payment_refunds (
        id INT PRIMARY KEY AUTO_INCREMENT,
        payment_id INT NOT NULL,
        mercadopago_refund_id VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
        UNIQUE KEY unique_mercadopago_refund (mercadopago_refund_id),
        INDEX idx_payment_refunds (payment_id)
      )
    `);

    // Get default plans and insert them
    const defaultPlans = SubscriptionPlan.getDefaultPlans();
    
    for (const plan of defaultPlans) {
      await SubscriptionPlan.create(plan);
      console.log(`Created plan: ${plan.name}`);
    }

    console.log('Subscription plans seeded successfully!');
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedSubscriptionPlans()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

module.exports = seedSubscriptionPlans;