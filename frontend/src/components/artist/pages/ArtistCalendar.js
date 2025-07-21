import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CalendarTab from '../CalendarTab';
import { hasCalendarAccess } from '../../../utils/subscriptionHelpers';

const ArtistCalendar = () => {
  const { user } = useAuth();
  
  // Check if user has access to calendar (pro or premium plans only)
  const userHasCalendarAccess = hasCalendarAccess(user);

  // Redirect to subscription page if user doesn't have access
  if (!userHasCalendarAccess && user) {
    return <Navigate to="/artist/subscription" replace />;
  }

  return <CalendarTab />;
};

export default ArtistCalendar;