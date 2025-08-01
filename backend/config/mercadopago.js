const { MercadoPagoConfig, Preference, Payment, PreApproval, PreApprovalPlan } = require('mercadopago');

// Configuración de MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-2420278478851432-010220-f91dd4f673b51cc5c8cf80e03b2becd8-183050733',
  options: {
    timeout: 5000
  }
});

// Cliente para preferencias de pago (pagos únicos)
const preference = new Preference(client);

// Cliente para pagos
const payment = new Payment(client);

// Cliente para suscripciones (preaprobaciones)
const preApprovalClient = new PreApproval(client);

// Cliente para planes de suscripción
const preApprovalPlanClient = new PreApprovalPlan(client);

// Función para obtener URL válida para MercadoPago
const getValidUrl = (url) => {
  // En desarrollo, usar URLs de prueba que redirigen correctamente
  if (url && url.includes('localhost')) {
    // Usar httpbin que permite redirecciones con parámetros
    const baseUrl = 'https://httpbin.org/redirect-to';
    const encodedUrl = encodeURIComponent(url);
    return `${baseUrl}?url=${encodedUrl}`;
  }
  return url;
};

// Configuración de la aplicación
const config = {
  appId: process.env.MERCADOPAGO_APP_ID || '5698143216134280',
  userId: process.env.MERCADOPAGO_USER_ID || '183050733',
  notificationUrl: process.env.BACKEND_URL?.includes('localhost') 
    ? 'https://webhook.site/#!/unique-id' // URL de prueba para webhooks
    : `${process.env.BACKEND_URL}/api/payments/webhook`,
  // URLs para suscripciones (preaprobaciones)
  backUrls: {
    success: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/subscription/success`,
    failure: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/subscription/failure`,
    pending: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/subscription/pending`
  },
  // URLs para pagos únicos (preferencias)
  successUrl: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/artist?payment=success`,
  failureUrl: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/artist?payment=failure`,
  pendingUrl: `${process.env.FRONTEND_URL || 'https://paltattoo-2025.vercel.app'}/artist?payment=pending`,
  autoReturn: 'approved',
  statementDescriptor: 'PALTATTOO',
  externalReference: 'paltattoo_subscription',
  excludedPaymentMethods: [],
  excludedPaymentTypes: [],
  installments: 1 // Solo pagos en una cuota
};

module.exports = {
  client,
  preference,
  payment,
  preApprovalClient,
  preApprovalPlanClient,
  config
};