import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CompleteProfile from './pages/auth/CompleteProfile';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthCallback from './pages/auth/AuthCallback';

// Protected routes
import ProtectedRoute from './components/auth/ProtectedRoute';

// Client pages
import ClientDashboard from './pages/ClientDashboard';
import UserProfile from './pages/UserProfile';
import FeedView from './pages/feed/FeedView';
import CreateOfferView from './pages/feed/CreateOfferView';
import MyRequestsPage from './pages/client/MyRequestsPage';
import FavoritesPage from './pages/client/FavoritesPage';
import MyAppointmentsPage from './pages/client/MyAppointmentsPage';

// Artist pages
import ArtistDashboard from './components/artist/ArtistDashboard';

// Shared components
import DashboardLayout from './components/shared/DashboardLayout';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
// New admin pages for subscription management
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOffers from './pages/admin/AdminOffers';
import AdminShops from './pages/admin/AdminShops';
import AdminPayments from './pages/admin/AdminPayments';

// Public pages
import ArtistsView from './pages/artists/ArtistsView';
import ArtistProfileView from './pages/artists/ArtistProfileView';
import SendProposalPage from './pages/proposals/SendProposalPage';
import OfferDetailPage from './pages/offers/OfferDetailPage';
import OfferTrackingPage from './pages/offers/OfferTrackingPage';

// Shop pages
import ShopsListPage from './pages/shops/ShopsListPage';
import ShopDetailPage from './pages/shops/ShopDetailPage';

// Public pages
import HomePage from './pages/HomePage';

// Static pages
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SupportPage from './pages/SupportPage';
import HelpCenterPage from './pages/HelpCenterPage';
import FAQPage from './pages/FAQPage';
import JoinArtistPage from './pages/JoinArtistPage';
import HowItWorksPage from './pages/HowItWorksPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ReportProblemPage from './pages/ReportProblemPage';
import ArtistBenefitsPage from './pages/ArtistBenefitsPage';
import ArtistPricingPage from './pages/ArtistPricingPage';
import ArtistResourcesPage from './pages/ArtistResourcesPage';
import SafetyQualityPage from './pages/SafetyQualityPage';
import TattooAftercarePage from './pages/TattooAftercarePage';
import InspirationGalleryPage from './pages/InspirationGalleryPage';

// Subscription pages
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionFailure from './pages/SubscriptionFailure';
import SubscriptionPending from './pages/SubscriptionPending';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageWrapper from './components/layout/PageWrapper';
import RealtimeNotifications from './components/notifications/RealtimeNotifications';

// Dashboard redirect component
const DashboardRedirect = () => {
  const { isClient, isArtist, isAdmin } = useAuth();
  
  if (isClient) {
    return <Navigate to="/client/dashboard" replace />;
  } else if (isArtist) {
    return <Navigate to="/artist" replace />;
  } else if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/" replace />;
};

function App() {
  console.log('App component loaded');
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isArtistDashboardRoute = location.pathname.startsWith('/artist/') || location.pathname === '/artist';
  // Only hide navbar on main dashboard page, not on other client pages
  const isMainDashboardRoute = location.pathname === '/dashboard';
  const isDashboardRoute = isAdminRoute || isArtistDashboardRoute || isMainDashboardRoute;

  return (
    <div className="App min-h-screen bg-primary-900">
      <Toaster position="top-right" />
      {user && <RealtimeNotifications />}
      {!isDashboardRoute && <Navbar />}
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PageWrapper fullScreen><HomePage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/complete-profile" element={<PageWrapper><CompleteProfile /></PageWrapper>} />
          <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
          <Route path="/reset-password" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />
          <Route path="/auth/callback" element={<PageWrapper><AuthCallback /></PageWrapper>} />
          <Route path="/artists" element={<PageWrapper><ArtistsView /></PageWrapper>} />
          <Route path="/artists/:id" element={<PageWrapper><ArtistProfileView /></PageWrapper>} />
          <Route path="/offers/:id" element={<PageWrapper><OfferDetailPage /></PageWrapper>} />
          <Route path="/offers/:id/tracking" element={
            <ProtectedRoute requiredRole="client">
              <PageWrapper><OfferTrackingPage /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/shops" element={<PageWrapper><ShopsListPage /></PageWrapper>} />
          <Route path="/shops/:id" element={<PageWrapper><ShopDetailPage /></PageWrapper>} />
          
          {/* Subscription result pages */}
          <Route path="/subscription/success" element={<PageWrapper><SubscriptionSuccess /></PageWrapper>} />
          <Route path="/subscription/failure" element={<PageWrapper><SubscriptionFailure /></PageWrapper>} />
          <Route path="/subscription/pending" element={<PageWrapper><SubscriptionPending /></PageWrapper>} />
          
          {/* Static pages */}
          <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
          <Route path="/support" element={<PageWrapper><SupportPage /></PageWrapper>} />
          <Route path="/help" element={<PageWrapper><HelpCenterPage /></PageWrapper>} />
          <Route path="/faq" element={<PageWrapper><FAQPage /></PageWrapper>} />
          <Route path="/join-artist" element={<PageWrapper><JoinArtistPage /></PageWrapper>} />
          <Route path="/how-it-works" element={<PageWrapper><HowItWorksPage /></PageWrapper>} />
          <Route path="/terms" element={<PageWrapper><TermsOfServicePage /></PageWrapper>} />
          <Route path="/privacy" element={<PageWrapper><PrivacyPolicyPage /></PageWrapper>} />
          <Route path="/report" element={<PageWrapper><ReportProblemPage /></PageWrapper>} />
          <Route path="/artist/benefits" element={<PageWrapper><ArtistBenefitsPage /></PageWrapper>} />
          <Route path="/artist/pricing" element={<PageWrapper><ArtistPricingPage /></PageWrapper>} />
          <Route path="/artist/resources" element={<PageWrapper><ArtistResourcesPage /></PageWrapper>} />
          <Route path="/safety" element={<PageWrapper><SafetyQualityPage /></PageWrapper>} />
          <Route path="/aftercare" element={<PageWrapper><TattooAftercarePage /></PageWrapper>} />
          <Route path="/inspiration" element={<PageWrapper><InspirationGalleryPage /></PageWrapper>} />

          {/* Dashboard redirect based on user role */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          {/* Protected client routes */}
          <Route path="/client/dashboard" element={
            <ProtectedRoute requiredRole="client">
              <PageWrapper><ClientDashboard /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/feed" element={
            <ProtectedRoute requiredRole="artist">
              <PageWrapper><FeedView /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/offers/create" element={
            <ProtectedRoute requiredRole="client">
              <PageWrapper><CreateOfferView /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/create-offer" element={
            <ProtectedRoute requiredRole="client">
              <PageWrapper><CreateOfferView /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute requiredRole="client">
              <PageWrapper><MyRequestsPage /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute requiredRole="client">
              <PageWrapper><FavoritesPage /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/my-appointments" element={
            <ProtectedRoute requiredRole="client">
              <PageWrapper><MyAppointmentsPage /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredRole="client">
              <PageWrapper><UserProfile /></PageWrapper>
            </ProtectedRoute>
          } />

          {/* Protected artist routes */}
          <Route path="/artist" element={
            <ProtectedRoute requiredRole="artist">
              <ArtistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/artist/*" element={
            <ProtectedRoute requiredRole="artist">
              <ArtistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/proposals/send/:offerId" element={
            <ProtectedRoute requiredRole="artist">
              <PageWrapper><SendProposalPage /></PageWrapper>
            </ProtectedRoute>
          } />

          {/* Protected admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          {/* Unauthorized page */}
          <Route path="/unauthorized" element={
            <PageWrapper>
              <div className="min-h-screen bg-primary-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-primary-100 mb-4">Acceso No Autorizado</h1>
                  <p className="text-primary-300 mb-6">No tienes permisos para acceder a esta página.</p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="btn-primary"
                  >
                    Volver
                  </button>
                </div>
              </div>
            </PageWrapper>
          } />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
}

export default App;