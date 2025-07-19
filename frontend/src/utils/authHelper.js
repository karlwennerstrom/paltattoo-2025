// Auto-login helper for development
export const autoLoginForDev = async () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  // If no token exists, auto-login with test credentials
  if (!token || !user) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'artist@test.com',
          password: 'password123'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Auto-logged in as test artist');
        return true;
      }
    } catch (error) {
      console.log('Auto-login failed:', error);
    }
  }
  
  return false;
};