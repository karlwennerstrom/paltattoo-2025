const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Initialize MercadoPago with access token
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

// Create instances
const preference = new Preference(client);
const payment = new Payment(client);

// MercadoPago configuration
const mercadoPagoConfig = {
  // Notification URL for webhooks
  notificationUrl: `${process.env.BACKEND_URL}/api/payments/webhooks/mercadopago`,
  
  // Success and failure URLs
  successUrl: `${process.env.FRONTEND_URL}/subscription/success`,
  failureUrl: `${process.env.FRONTEND_URL}/subscription/failure`,
  pendingUrl: `${process.env.FRONTEND_URL}/subscription/pending`,

  // Default payment methods
  excludedPaymentMethods: [],
  excludedPaymentTypes: [],
  installments: 12,

  // Auto return
  autoReturn: 'approved'
};

module.exports = {
  client,
  preference,
  payment,
  config: mercadoPagoConfig
};