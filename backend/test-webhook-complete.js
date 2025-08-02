const axios = require('axios');
const crypto = require('crypto');

async function testWebhookWithSignature() {
  const BASE_URL = 'https://paltattoo-backend.onrender.com';
  
  try {
    // 1. Test webhook accessibility
    console.log('1. Testing webhook accessibility...');
    const testResponse = await axios.get(`${BASE_URL}/api/payments/webhook/test`);
    console.log('✅ Webhook test response:', testResponse.data);
    
    // 2. Test webhook with signature (simulated)
    console.log('\n2. Testing webhook with simulated signature...');
    
    const webhookSecret = 'ecb1a476c629bde840e17424a9137c0bd575e01b86f2527ae5f0bec72ef50800';
    const paymentId = '120739472514';
    const requestId = 'test-' + Date.now();
    const ts = Math.floor(Date.now() / 1000);
    
    // Create webhook payload
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
    
    // Generate signature
    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(manifest);
    const signature = hmac.digest('hex');
    
    console.log('Signature manifest:', manifest);
    console.log('Generated signature:', signature);
    
    // Send webhook with signature
    const webhookResponse = await axios.post(
      `${BASE_URL}/api/payments/webhook`,
      webhookData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
          'X-Signature': `ts=${ts},v1=${signature}`,
          'User-Agent': 'MercadoPago-Webhook-Test'
        }
      }
    );
    
    console.log('✅ Webhook response:', webhookResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

console.log('Testing MercadoPago webhook with signature validation...\n');
testWebhookWithSignature();