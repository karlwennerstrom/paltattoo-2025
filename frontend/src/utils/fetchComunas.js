// Alternative fetch function for comunas
export const fetchComunasDirectly = async () => {
  const url = 'http://localhost:5000/api/catalogs/comunas';
  console.log('fetchComunasDirectly: Attempting to fetch from', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    console.log('fetchComunasDirectly: Response status:', response.status);
    console.log('fetchComunasDirectly: Response headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('fetchComunasDirectly: Data received:', data);
    return data;
  } catch (error) {
    console.error('fetchComunasDirectly: Error:', error);
    throw error;
  }
};