// Test backend connectivity
export const testBackendConnection = async () => {
  console.log('=== Testing Backend Connection ===');
  
  // Test 1: Simple fetch to root
  try {
    console.log('Test 1: Fetching backend root...');
    const response = await fetch('http://localhost:5000/', {
      method: 'GET',
      mode: 'cors',
    });
    const data = await response.json();
    console.log('✓ Backend root response:', data);
  } catch (error) {
    console.error('✗ Backend root error:', error);
  }
  
  // Test 2: API root
  try {
    console.log('\nTest 2: Fetching API root...');
    const response = await fetch('http://localhost:5000/api', {
      method: 'GET',
      mode: 'cors',
    });
    const text = await response.text();
    console.log('✓ API root response:', text);
  } catch (error) {
    console.error('✗ API root error:', error);
  }
  
  // Test 3: Comunas endpoint
  try {
    console.log('\nTest 3: Fetching comunas...');
    const response = await fetch('http://localhost:5000/api/catalogs/comunas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    const data = await response.json();
    console.log('✓ Comunas response:', Object.keys(data).length, 'regions');
  } catch (error) {
    console.error('✗ Comunas error:', error);
  }
  
  console.log('=== End of Backend Tests ===');
};