const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

const testAPI = async () => {
  try {
    console.log('🧪 Testing Profile Management API\n');
    
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerData = {
      email: `test${Date.now()}@test.com`,
      password: 'password123',
      userType: 'client',
      firstName: 'Test',
      lastName: 'User',
      phone: '+56987654321'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✓ Registration successful');
    console.log('User ID:', registerResponse.data.user.id);
    
    authToken = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    
    // Test 2: Get profile
    console.log('\n2. Testing get profile...');
    const profileResponse = await axios.get(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Profile retrieved successfully');
    console.log('Profile:', profileResponse.data.user);
    
    // Test 3: Update profile
    console.log('\n3. Testing update profile...');
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+56912345678',
      bio: 'This is my updated bio'
    };
    
    const updateResponse = await axios.put(`${API_BASE}/profile`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Profile updated successfully');
    console.log('Updated profile:', updateResponse.data.user);
    
    // Test 4: Get profile stats
    console.log('\n4. Testing get profile stats...');
    const statsResponse = await axios.get(`${API_BASE}/profile/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Profile stats retrieved successfully');
    console.log('Stats:', statsResponse.data);
    
    // Test 5: Get public profile
    console.log('\n5. Testing get public profile...');
    const publicProfileResponse = await axios.get(`${API_BASE}/profile/public/${userId}`);
    console.log('✓ Public profile retrieved successfully');
    console.log('Public profile:', publicProfileResponse.data);
    
    // Test 6: Test catalogs
    console.log('\n6. Testing catalogs...');
    const [bodyParts, styles, comunas, colorTypes] = await Promise.all([
      axios.get(`${API_BASE}/catalogs/body-parts`),
      axios.get(`${API_BASE}/catalogs/tattoo-styles`),
      axios.get(`${API_BASE}/catalogs/comunas`),
      axios.get(`${API_BASE}/catalogs/color-types`)
    ]);
    
    console.log('✓ Catalogs retrieved successfully');
    console.log(`- Body parts: ${bodyParts.data.length}`);
    console.log(`- Tattoo styles: ${styles.data.length}`);
    console.log(`- Regions: ${Object.keys(comunas.data).length}`);
    console.log(`- Color types: ${colorTypes.data.length}`);
    
    console.log('\n✅ All tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
  }
};

// Check if server is running
axios.get(`${API_BASE.replace('/api', '')}`)
  .then(() => {
    console.log('🚀 Server is running, starting tests...\n');
    testAPI();
  })
  .catch(() => {
    console.error('❌ Server is not running. Please start the server first with: npm start');
  });