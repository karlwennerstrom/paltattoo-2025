/**
 * Utility functions for subscription-based feature access control
 */

/**
 * Check if user has access to calendar features
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user has pro or premium subscription
 */
export const hasCalendarAccess = (user) => {
  return user?.subscription && 
    (user.subscription.planName === 'pro' || user.subscription.planName === 'premium');
};

/**
 * Check if user has access to advanced analytics
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user has premium subscription
 */
export const hasAdvancedAnalytics = (user) => {
  return user?.subscription && user.subscription.planName === 'premium';
};

/**
 * Check if user has access to priority support
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user has pro or premium subscription
 */
export const hasPrioritySupport = (user) => {
  return user?.subscription && 
    (user.subscription.planName === 'pro' || user.subscription.planName === 'premium');
};

/**
 * Get user's current plan name or default to 'basic'
 * @param {Object} user - User object from AuthContext
 * @returns {string} - Plan name ('basic', 'pro', or 'premium')
 */
export const getUserPlanName = (user) => {
  return user?.subscription?.planName || 'basic';
};

/**
 * Check if user has active subscription
 * @param {Object} user - User object from AuthContext
 * @returns {boolean} - True if user has active subscription
 */
export const hasActiveSubscription = (user) => {
  return user?.subscription && user.subscription.status === 'active';
};

/**
 * Get features available for user's current plan
 * @param {Object} user - User object from AuthContext
 * @returns {Object} - Object with feature flags
 */
export const getUserFeatures = (user) => {
  const planName = getUserPlanName(user);
  
  const features = {
    basic: {
      portfolio: true,
      proposals: true,
      calendar: false,
      analytics: false,
      prioritySupport: false,
      maxPortfolioImages: 10,
      maxProposalsPerMonth: 5
    },
    pro: {
      portfolio: true,
      proposals: true,
      calendar: true,
      analytics: true,
      prioritySupport: true,
      maxPortfolioImages: 50,
      maxProposalsPerMonth: 50
    },
    premium: {
      portfolio: true,
      proposals: true,
      calendar: true,
      analytics: true,
      prioritySupport: true,
      maxPortfolioImages: -1, // unlimited
      maxProposalsPerMonth: -1 // unlimited
    }
  };
  
  return features[planName] || features.basic;
};