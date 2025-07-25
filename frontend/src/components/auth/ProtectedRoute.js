import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingPage from '../../pages/LoadingPage';

const ProtectedRoute = ({ 
  children, 
  requiredAuth = true, 
  requiredRole = null,
  requiredSubscription = null,
  redirectTo = "/login" 
}) => {
  const { isAuthenticated, loading, user, isArtist, isClient, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingPage />;
  }

  // Check authentication requirement
  if (requiredAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect authenticated users away from auth pages
  if (!requiredAuth && isAuthenticated) {
    // Redirect to the page they were trying to access or dashboard
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  // Check role requirement
  if (requiredRole && isAuthenticated) {
    const hasRequiredRole = 
      (requiredRole === 'artist' && isArtist) ||
      (requiredRole === 'client' && isClient) ||
      (requiredRole === 'admin' && isAdmin);
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check subscription requirement (for artists)
  if (requiredSubscription && isAuthenticated && isArtist) {
    // This would need to check the actual subscription status
    // For now, we'll just render the children
    // In a real implementation, you'd check:
    // const { getSubscriptionPlan } = useApp();
    // const plan = getSubscriptionPlan();
    // if (!['premium', 'pro'].includes(plan) && requiredSubscription === 'premium') ...
  }

  return children;
};

export default ProtectedRoute;