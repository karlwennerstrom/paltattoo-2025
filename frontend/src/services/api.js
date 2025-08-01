import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Filter out browser extension errors
    if (error.message && error.message.includes('message channel closed')) {
      console.warn('Browser extension interference in API call');
      return Promise.reject(error);
    }
    
    const message = error.response?.data?.message || error.message || 'Error desconocido';
    
    // Handle specific error status codes
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    } else if (error.response?.status === 404) {
      toast.error('Recurso no encontrado.');
    } else if (error.response?.status >= 500) {
      toast.error('Error del servidor. Intenta más tarde.');
    } else if (!error.message?.includes('message channel closed')) {
      // Only show toast for non-extension errors
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  completeProfile: (data) => api.post('/auth/complete-profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Legacy alias for backwards compatibility
export const authAPI = authService;

// Catalog services
export const catalogService = {
  getStyles: () => api.get('/catalogs/tattoo-styles'),
  getBodyParts: () => api.get('/catalogs/body-parts'),
  getComunas: (region) => api.get(`/catalogs/comunas${region ? `?region=${region}` : ''}`),
  getRegions: () => api.get('/catalogs/regions'),
  getColorTypes: () => api.get('/catalogs/color-types'),
};

// Artist services
export const artistService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/artists?${params}`);
  },
  getById: (id) => api.get(`/artists/${id}`),
  create: (data) => api.post('/artists', data),
  update: (id, data) => api.put(`/artists/${id}`, data),
  delete: (id) => api.delete(`/artists/${id}`),
  getPortfolio: (id) => api.get(`/artists/${id}/portfolio`),
  addPortfolioItem: (data) => api.post('/artists/portfolio', data),
  updatePortfolioItem: (id, data) => api.put(`/artists/portfolio/${id}`, data),
  deletePortfolioItem: (id) => api.delete(`/artists/portfolio/${id}`),
  getStats: () => api.get('/stats/artist'),
  getReviews: (id) => api.get(`/artists/${id}/reviews`),
};

// Offer services
export const offerService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/offers?${params}`);
  },
  getOffers: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/offers?${params}`);
  },
  getMyOffers: () => api.get('/offers/my'),
  getById: (id) => api.get(`/offers/${id}`),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
  uploadReferences: (id, files) => {
    const formData = new FormData();
    // Backend expects 'reference' in singular
    if (files.length > 0) {
      formData.append('reference', files[0]);
    }
    return api.post(`/offers/${id}/references`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProposals: (id) => api.get(`/offers/${id}/proposals`),
  createProposal: (id, data) => api.post(`/offers/${id}/proposals`, data),
  updateProposal: (offerId, proposalId, data) => 
    api.put(`/offers/${offerId}/proposals/${proposalId}`, data),
  deleteProposal: (offerId, proposalId) => 
    api.delete(`/offers/${offerId}/proposals/${proposalId}`),
  acceptProposal: (offerId, proposalId) => 
    api.post(`/offers/${offerId}/proposals/${proposalId}/accept`),
  rejectProposal: (offerId, proposalId) => 
    api.post(`/offers/${offerId}/proposals/${proposalId}/reject`),
};

// Profile services
export const profileService = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return api.post('/profile/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAvatar: () => api.delete('/profile/image'),
  getMyProposals: () => api.get('/proposals/my'),
  getFavorites: () => api.get('/profile/favorites'),
  addFavorite: (type, id) => api.post('/profile/favorites', { type, id }),
  removeFavorite: (type, id) => api.delete(`/profile/favorites/${type}/${id}`),
  getAppointments: () => api.get('/calendar/appointments'),
  createAppointment: (data) => api.post('/calendar/appointments', data),
  updateAppointment: (id, data) => api.put(`/calendar/appointments/${id}`, data),
  cancelAppointment: (id) => api.delete(`/calendar/appointments/${id}`),
  getNotifications: () => api.get('/profile/notifications'),
  markNotificationAsRead: (id) => api.put(`/profile/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.put('/profile/notifications/read-all'),
};

// Portfolio services
export const portfolioService = {
  getAll: async (artistId) => {
    const response = await api.get(`/portfolio/${artistId || 'my'}`);
    // Backend returns { items: [...], total, artist }, but we want just the items
    return {
      ...response,
      data: response.data.items || response.data
    };
  },
  getById: (id) => api.get(`/portfolio/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'file') {
        formData.append('media', value);
      } else {
        formData.append(key, value);
      }
    });
    return api.post('/portfolio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.put(`/portfolio/${id}`, data),
  delete: (id) => api.delete(`/portfolio/${id}`),
  toggleFeatured: (id) => api.post(`/portfolio/${id}/feature`),
  incrementViews: (id) => api.post(`/portfolio/${id}/views`),
};

// Collection services
export const collectionService = {
  getAll: (artistId) => api.get(`/collections/${artistId || 'my'}`),
  getById: (id) => api.get(`/collections/collection/${id}`),
  create: (data) => api.post('/collections', data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  delete: (id) => api.delete(`/collections/${id}`),
  addImage: (collectionId, imageId, sortOrder = 0) => 
    api.post(`/collections/${collectionId}/images`, { imageId, sortOrder }),
  removeImage: (collectionId, imageId) => 
    api.delete(`/collections/${collectionId}/images/${imageId}`),
  reorderCollections: (collectionOrders) => 
    api.put('/collections/reorder', { collectionOrders }),
  reorderImages: (collectionId, imageOrders) => 
    api.put(`/collections/${collectionId}/images/reorder`, { imageOrders }),
};

// File upload service
export const fileService = {
  upload: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (url) => api.delete('/files', { data: { url } }),
};

// Payment services
export const paymentService = {
  // Subscription plans
  getPlans: () => api.get('/payments/plans'),
  
  // Subscription management
  getActiveSubscription: () => api.get('/payments/subscription/active'),
  getSubscriptionHistory: () => api.get('/payments/subscription/history'),
  createSubscription: (data) => api.post('/payments/subscription', data),
  cancelSubscription: (subscriptionId) => api.delete(`/payments/subscription/${subscriptionId}`),
  
  // Card tokenization
  createCardToken: (data) => api.post('/payments/card-token', data),
  
  // Payment history for a specific subscription
  getSubscriptionPaymentHistory: (subscriptionId) => 
    api.get(`/payments/subscription/${subscriptionId}/payments`),
    
  // Get payment history for current user
  getPaymentHistoryByUser: () => api.get('/payments/history'),
  
  // Get subscription changes
  getSubscriptionChanges: (limit = 50) => 
    api.get(`/payments/subscription/changes?limit=${limit}`),
    
  // Get proration preview for plan change
  getProrationPreview: (planId) => 
    api.get(`/payments/subscription/proration-preview?planId=${planId}`),
  
  // Legacy methods for compatibility
  getMySubscription: () => api.get('/payments/subscription/active'),
  getPaymentHistory: () => api.get('/payments/history'), // Legacy alias for getPaymentHistoryByUser
  getPaymentDetails: (paymentId) => api.get(`/payments/payment/${paymentId}`),
  retryPayment: (paymentId) => api.post(`/payments/payment/${paymentId}/retry`),
  
  // Admin functions
  getPaymentStats: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/payments/stats?${params}`);
  },
  createRefund: (paymentId, amount, reason) => 
    api.post(`/payments/payment/${paymentId}/refund`, { amount, reason }),

  // Email notifications
  sendSubscriptionChangeEmail: (data) => 
    api.post('/payments/subscription/send-change-email', data),
  downloadInvoice: (paymentId) => 
    api.get(`/payments/invoice/${paymentId}/download`, { responseType: 'blob' }),
};

// Statistics services
export const statsService = {
  getGeneral: () => api.get('/stats/general'),
  getArtistStats: () => api.get('/stats/artist'),
  getClientStats: () => api.get('/stats/client'),
  getClientDashboardStats: () => api.get('/stats/client-dashboard'),
  getOfferStats: () => api.get('/stats/offers'),
  getRevenue: (period = 'month') => api.get(`/stats/revenue?period=${period}`),
};

// Calendar services
export const calendarService = {
  // Appointments
  getAppointments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/calendar/appointments?${params}`);
  },
  getAppointmentById: (id) => api.get(`/calendar/appointments/${id}`),
  createAppointment: (data) => api.post('/calendar/appointments', data),
  createStandaloneAppointment: (data) => api.post('/calendar/appointments/standalone', data),
  updateAppointment: (id, data) => api.put(`/calendar/appointments/${id}`, data),
  cancelAppointment: (id, reason) => api.put(`/calendar/appointments/${id}/cancel`, { cancellation_reason: reason }),
  completeAppointment: (id, data) => api.put(`/calendar/appointments/${id}/complete`, data),
  getUpcomingAppointments: (days = 7) => api.get(`/calendar/appointments/upcoming?days=${days}`),
  getAppointmentStats: () => api.get('/calendar/appointments/stats'),
  
  // Availability
  getAvailability: (artistId) => api.get(`/calendar/availability/${artistId}`),
  updateAvailability: (weeklySchedule) => api.put('/calendar/availability', { weekly_schedule: weeklySchedule }),
  getAvailableSlots: (artistId, date, duration = 1) => 
    api.get(`/calendar/availability/${artistId}/slots?date=${date}&duration=${duration}`),
};

// Sponsored shops services
export const sponsoredShopsService = {
  // Public endpoints
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/sponsored-shops?${params}`);
  },
  getById: (id) => api.get(`/sponsored-shops/${id}`),
  getFeatured: (limit = 5) => api.get(`/sponsored-shops/featured?limit=${limit}`),
  getCategories: () => api.get('/sponsored-shops/categories'),
  getByCategory: (category, limit = 10) => api.get(`/sponsored-shops/category/${category}?limit=${limit}`),
  trackClick: (id) => api.post(`/sponsored-shops/${id}/click`),
  
  // Admin endpoints
  create: (data) => api.post('/sponsored-shops', data),
  update: (id, data) => api.put(`/sponsored-shops/${id}`, data),
  delete: (id) => api.delete(`/sponsored-shops/${id}`),
  uploadLogo: (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post(`/sponsored-shops/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCover: (id, file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return api.post(`/sponsored-shops/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getStats: () => api.get('/sponsored-shops/admin/stats'),
};

// Proposal services
export const proposalService = {
  // Get proposals by artist (with optional status filter)
  getMyProposals: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/proposals/artist?${params}`);
  },
  
  // Get proposals for a specific offer
  getByOffer: (offerId) => api.get(`/proposals/offer/${offerId}`),
  
  // Get proposal details
  getById: (id) => api.get(`/proposals/${id}`),
  
  // Update a proposal (message, price, duration)
  update: (id, data) => api.put(`/proposals/${id}`, data),
  
  // Update proposal status (accept, reject, withdraw)
  updateStatus: (id, data) => api.put(`/proposals/${id}/status`, data),
  
  // Delete a proposal
  delete: (id) => api.delete(`/proposals/${id}`),
  
  // Create a new proposal for an offer
  create: (offerId, data) => api.post(`/offers/${offerId}/proposals`, data),
  
  // Check if artist has already sent a proposal for an offer
  checkExisting: (offerId) => api.get(`/proposals/check/${offerId}`),
  
  // Check if artist has already sent proposals for multiple offers (batch)
  checkExistingBatch: (offerIds) => api.post('/proposals/check-batch', { offerIds }),
};

// Search services
export const searchService = {
  global: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
  artists: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/search/artists?${params}`);
  },
  offers: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/search/offers?${params}`);
  },
  suggestions: (query) => api.get(`/search/suggestions?q=${encodeURIComponent(query)}`),
};

// Utility functions
export const apiUtils = {
  // Handle file uploads with progress
  uploadWithProgress: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      },
    });
  },
  
  // Handle concurrent requests
  concurrent: (requests) => Promise.all(requests),
  
  // Format error messages
  formatError: (error) => {
    if (error.response?.data?.errors) {
      return error.response.data.errors.map(err => err.message).join(', ');
    }
    return error.response?.data?.message || error.message || 'Error desconocido';
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },
  
  // Get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  // Clear auth data
  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};

// Catalog services (alternative name for compatibility)
export const catalogsAPI = catalogService;

// Subscription services
export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/my-subscription'),
  subscribe: (planId) => api.post('/subscriptions/subscribe', { planId }),
  changePlan: (subscriptionId, newPlanId) => api.put(`/subscriptions/${subscriptionId}/change-plan`, { planId: newPlanId }),
  cancelSubscription: () => api.post('/subscriptions/cancel'),
  renewSubscription: () => api.post('/subscriptions/renew'),
  getInvoices: () => api.get('/subscriptions/invoices'),
  updatePaymentMethod: (data) => api.put('/subscriptions/payment-method', data),
};


// Default export
export default api;