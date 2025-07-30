// Subscription Helper Functions
// Centralized logic for subscription feature access

/**
 * Check if user has access to calendar features
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user can access calendar
 */
export const hasCalendarAccess = (user) => {
  const planName = getUserPlanName(user);
  return planName === 'premium' || planName === 'pro';
};

/**
 * Get user's current plan name
 * @param {Object} user - User object from AuthContext
 * @returns {string} - Plan name (basic, premium, pro)
 */
export const getUserPlanName = (user) => {
  if (!user) {
    return 'basic';
  }
  
  // Check multiple possible locations for subscription data
  const subscription = user.subscription || user.subscriptionData || null;
  
  if (!subscription) {
    return 'basic';
  }
  
  // Try multiple possible field names for the plan name
  const planName = (
    subscription.planName || 
    subscription.plan_name || 
    subscription.plan || 
    subscription.name ||
    'basic'
  ).toLowerCase();
  
  // Handle different plan name formats
  if (planName.includes('básico') || planName.includes('basico') || planName.includes('gratis') || planName === 'basic' || planName === '') {
    return 'basic';
  }
  if (planName.includes('premium')) {
    return 'premium';
  }
  if (planName.includes('pro')) {
    return 'pro';
  }
  // Default to basic if no match
  return 'basic';
};

/**
 * Check if user has premium features (premium or pro)
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user has premium features
 */
export const hasPremiumFeatures = (user) => {
  const planName = getUserPlanName(user);
  return planName === 'premium' || planName === 'pro';
};

/**
 * Check if user has pro features
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user has pro features
 */
export const hasProFeatures = (user) => {
  const planName = getUserPlanName(user);
  return planName === 'pro';
};

/**
 * Get user's subscription features based on plan
 * @param {Object} user - User object from AuthContext
 * @returns {Object} - Feature flags object
 */
export const getUserFeatures = (user) => {
  const planName = getUserPlanName(user);
  
  const features = {
    basic: {
      calendar: false,
      unlimitedProposals: false,
      unlimitedGallery: false,
      analytics: false,
      prioritySupport: false,
      badge: false,
      maxImages: 10,
      maxProposals: 5,
      maxCollections: 3
    },
    premium: {
      calendar: true,
      unlimitedProposals: true,
      unlimitedGallery: true,
      analytics: true,
      prioritySupport: true,
      badge: true,
      maxImages: -1, // unlimited
      maxProposals: -1, // unlimited
      maxCollections: 20
    },
    pro: {
      calendar: true,
      unlimitedProposals: true,
      unlimitedGallery: true,
      analytics: true,
      prioritySupport: true,
      badge: true,
      multipleCalendars: true,
      advancedAnalytics: true,
      socialIntegration: true,
      apiAccess: true,
      dedicatedSupport: true,
      maxImages: -1, // unlimited
      maxProposals: -1, // unlimited
      maxCollections: -1 // unlimited
    }
  };
  
  return features[planName] || features.basic;
};

/**
 * Format plan name for display
 * @param {string} planName - Plan name
 * @returns {string} - Formatted plan name
 */
export const formatPlanName = (planName) => {
  if (!planName) return 'Básico';
  
  const names = {
    basic: 'Básico',
    premium: 'Premium',
    pro: 'Pro'
  };
  
  return names[planName.toLowerCase()] || 'Básico';
};

/**
 * Get upgrade message for feature
 * @param {string} feature - Feature name
 * @returns {string} - Upgrade message
 */
export const getUpgradeMessage = (feature) => {
  const messages = {
    calendar: 'Actualiza a Premium para acceder al calendario completo',
    analytics: 'Actualiza a Premium para ver estadísticas detalladas',
    unlimitedGallery: 'Actualiza a Premium para galería ilimitada',
    unlimitedProposals: 'Actualiza a Premium para propuestas ilimitadas'
  };
  
  return messages[feature] || 'Actualiza tu plan para acceder a esta función';
};