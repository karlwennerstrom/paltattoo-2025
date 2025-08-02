const axios = require('axios');

async function testProfile() {
  try {
    // Necesitas un token válido aquí
    const token = 'YOUR_AUTH_TOKEN_HERE';
    
    const response = await axios.get('https://paltattoo-backend.onrender.com/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Profile response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.subscription) {
      console.log('\nSubscription data found:');
      console.log('- Plan:', response.data.subscription.planName);
      console.log('- Status:', response.data.subscription.status);
      console.log('- Price:', response.data.subscription.price);
    } else {
      console.log('\nNo subscription data in profile response!');
    }
    
  } catch (error) {
    console.error('Profile error:', error.response?.data || error.message);
  }
}

// Instrucciones
console.log('Para probar, necesitas obtener un token de autenticación válido.');
console.log('1. Abre las herramientas de desarrollo del navegador');
console.log('2. Ve a la pestaña Application/Storage');
console.log('3. Busca localStorage -> authToken');
console.log('4. Copia el valor y reemplaza YOUR_AUTH_TOKEN_HERE en este archivo');
console.log('5. Ejecuta: node test-profile-subscription.js');