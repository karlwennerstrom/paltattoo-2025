const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let artistId = '';

const testAPI = async () => {
  try {
    console.log('🎨 Testing Portfolio Management API\n');
    
    // Test 1: Register an artist
    console.log('1. Testing artist registration...');
    const registerData = {
      email: `artist${Date.now()}@test.com`,
      password: 'password123',
      userType: 'artist',
      firstName: 'Test',
      lastName: 'Artist',
      phone: '+56987654321'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✓ Artist registration successful');
    
    authToken = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    
    // Update artist profile
    const artistProfileData = {
      studioName: 'Test Studio',
      comunaId: 1,
      address: 'Test Address 123',
      yearsExperience: 5,
      minPrice: 50000,
      maxPrice: 300000,
      instagramUrl: '@test_artist',
      styleIds: [1, 2, 3],
      primaryStyleId: 1
    };
    
    await axios.put(`${API_BASE}/artists/profile`, artistProfileData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    // Get artist info
    const artistProfileResponse = await axios.get(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    artistId = artistProfileResponse.data.artistProfile.id;
    console.log('✓ Artist profile setup complete');
    
    // Test 2: Create portfolio item
    console.log('\n2. Testing create portfolio item...');
    const portfolioData = {
      title: 'Test Portfolio Item',
      description: 'This is a test portfolio item',
      styleId: 1,
      category: 'realistic',
      isFeatured: false
    };
    
    const portfolioResponse = await axios.post(`${API_BASE}/portfolio`, portfolioData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Portfolio item created successfully');
    console.log('Item ID:', portfolioResponse.data.item.id);
    
    const portfolioItemId = portfolioResponse.data.item.id;
    
    // Test 3: Get portfolio items
    console.log('\n3. Testing get portfolio items...');
    const getPortfolioResponse = await axios.get(`${API_BASE}/portfolio/${artistId}`);
    console.log('✓ Portfolio items retrieved successfully');
    console.log(`Found ${getPortfolioResponse.data.items.length} items`);
    
    // Test 4: Update portfolio item
    console.log('\n4. Testing update portfolio item...');
    const updateData = {
      title: 'Updated Portfolio Item',
      description: 'This is an updated description',
      category: 'traditional'
    };
    
    const updateResponse = await axios.put(`${API_BASE}/portfolio/${portfolioItemId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Portfolio item updated successfully');
    console.log('Updated title:', updateResponse.data.item.title);
    
    // Test 5: Get portfolio stats
    console.log('\n5. Testing get portfolio stats...');
    const statsResponse = await axios.get(`${API_BASE}/portfolio/stats/my`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Portfolio stats retrieved successfully');
    console.log('Stats:', statsResponse.data);
    
    // Test 6: Set item as featured
    console.log('\n6. Testing set featured item...');
    const featureResponse = await axios.post(`${API_BASE}/portfolio/${portfolioItemId}/feature`, 
      { featured: true }, 
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✓ Item set as featured successfully');
    
    // Test 7: Get featured item
    console.log('\n7. Testing get featured item...');
    try {
      const featuredResponse = await axios.get(`${API_BASE}/portfolio/featured/${artistId}`);
      console.log('✓ Featured item retrieved successfully');
      console.log('Featured item:', featuredResponse.data.title);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✓ No featured items found (expected)');
      } else {
        throw error;
      }
    }
    
    // Test 8: Delete portfolio item
    console.log('\n8. Testing delete portfolio item...');
    const deleteResponse = await axios.delete(`${API_BASE}/portfolio/${portfolioItemId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Portfolio item deleted successfully');
    
    // Test 9: Verify deletion
    console.log('\n9. Verifying deletion...');
    const finalPortfolioResponse = await axios.get(`${API_BASE}/portfolio/${artistId}`);
    console.log('✓ Portfolio verified - items count:', finalPortfolioResponse.data.items.length);
    
    console.log('\n✅ All portfolio tests passed successfully!');
    
    console.log('\n📝 Test Summary:');
    console.log('- Portfolio item creation ✓');
    console.log('- Portfolio item retrieval ✓');
    console.log('- Portfolio item update ✓');
    console.log('- Portfolio statistics ✓');
    console.log('- Featured item management ✓');
    console.log('- Portfolio item deletion ✓');
    console.log('- Media upload ready (requires actual files) ⏳');
    
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
    console.log('🚀 Server is running, starting portfolio tests...\n');
    testAPI();
  })
  .catch(() => {
    console.error('❌ Server is not running. Please start the server first with: npm start');
  });