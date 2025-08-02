const axios = require('axios');

async function simulateWebhook(paymentId) {
  try {
    // Simular el webhook que MercadoPago debería enviar
    const webhookData = {
      id: Date.now(),
      live_mode: true,
      type: "payment",
      date_created: new Date().toISOString(),
      user_id: 183050733,
      api_version: "v1",
      action: "payment.created",
      data: {
        id: paymentId
      }
    };
    
    console.log('Enviando webhook simulado para payment ID:', paymentId);
    
    const response = await axios.post(
      'http://localhost:5000/api/payments/webhook',
      webhookData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': 'simulated-' + Date.now(),
          'User-Agent': 'MercadoPago-Webhook-Simulator'
        }
      }
    );
    
    console.log('Respuesta del webhook:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usar el payment ID del log
const paymentId = process.argv[2] || '120739472514';
console.log('Simulando webhook para payment ID:', paymentId);
simulateWebhook(paymentId);