const axios = require('axios');

// Simular webhook de MercadoPago
async function testWebhook() {
  try {
    const webhookData = {
      type: 'payment',
      action: 'payment.created',
      data: {
        id: '120739472514'
      }
    };
    
    const response = await axios.post('https://paltattoo-backend.onrender.com/api/payments/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': 'test-' + Date.now(),
        'User-Agent': 'MercadoPago-Webhook-Test'
      }
    });
    
    console.log('Webhook response:', response.data);
  } catch (error) {
    console.error('Webhook error:', error.response?.data || error.message);
  }
}

testWebhook();