const axios = require('axios');

const baseURL = 'http://localhost:5000/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJ1c2VyVHlwZSI6ImFydGlzdCIsImlhdCI6MTc1MjgwNjY1OCwiZXhwIjoxNzUzNDExNDU4fQ.Hc0N3ms8PfcAuhCqhzNq6e3pHDCyhBfdmA3LiNlhJe0';

const api = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function testEndpoints() {
  console.log('Testing Artist Dashboard Endpoints...\n');

  const endpoints = [
    { name: 'Portfolio My', method: 'get', url: '/portfolio/my' },
    { name: 'Proposals My', method: 'get', url: '/proposals/my' },
    { name: 'Calendar Appointments', method: 'get', url: '/calendar/appointments' },
    { name: 'Stats Artist', method: 'get', url: '/stats/artist' },
    { name: 'Auth Profile', method: 'get', url: '/auth/profile' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await api[endpoint.method](endpoint.url);
      console.log(`✅ ${endpoint.name}: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.response?.status || 'FAIL'} - ${error.response?.data?.error || error.message}`);
    }
  }
}

testEndpoints();