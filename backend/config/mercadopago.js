const { MercadoPagoConfig, PreApproval, PreApprovalPlan } = require('mercadopago');

// Configuración de MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc' // Para evitar duplicados
  }
});

// Cliente para planes de suscripción
const preApprovalPlanClient = new PreApprovalPlan(client);

// Cliente para suscripciones
const preApprovalClient = new PreApproval(client);

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
  backUrls: {
    success: getValidUrl(`${process.env.FRONTEND_URL}/subscription/success`),
    failure: getValidUrl(`${process.env.FRONTEND_URL}/subscription/failure`),
    pending: getValidUrl(`${process.env.FRONTEND_URL}/subscription/pending`)
  },
  autoReturn: 'approved',
  statementDescriptor: 'PALTATTOO',
  externalReference: 'paltattoo_subscription'
};

module.exports = {
  client,
  preApprovalClient,
  preApprovalPlanClient,
  config
};