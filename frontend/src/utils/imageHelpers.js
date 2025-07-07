const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Return as-is if it's already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Return as-is if it's a placeholder image
  if (imagePath.startsWith('/placeholder')) {
    return imagePath;
  }
  
  // Return as-is if it's an absolute path starting with /uploads
  if (imagePath.startsWith('/uploads/')) {
    return API_BASE_URL.replace('/api', '') + imagePath;
  }
  
  // Otherwise, assume it's a relative path and prepend the uploads directory
  return `${API_BASE_URL.replace('/api', '')}/uploads/${imagePath}`;
};

export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-avatar.jpg';
  return getImageUrl(imagePath);
};

export const getTattooImageUrl = (imagePath, index = null) => {
  if (!imagePath) {
    // If index is provided, return a specific placeholder
    if (index !== null) {
      return `/placeholder-tattoo-${(index % 12) + 1}.jpg`;
    }
    return '/placeholder-tattoo.jpg';
  }
  return getImageUrl(imagePath);
};

export const getRandomPlaceholderTattoo = () => {
  const randomIndex = Math.floor(Math.random() * 12) + 1;
  return `/placeholder-tattoo-${randomIndex}.jpg`;
};