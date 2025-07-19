import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthCallback from './pages/auth/AuthCallback';

// Protected routes
import ProtectedRoute from './components/auth/ProtectedRoute';

// Client pages
import FeedView from './pages/feed/FeedView';
import CreateOfferView from './pages/feed/CreateOfferView';
import MyRequestsPage from './pages/client/MyRequestsPage';
import FavoritesPage from './pages/client/FavoritesPage';
import MyAppointmentsPage from './pages/client/MyAppointmentsPage';

// Artist pages
// import ArtistDashboard from './components/artist/ArtistDashboard';
import ArtistOverview from './components/artist/pages/ArtistOverview';
import ArtistPortfolio from './components/artist/pages/ArtistPortfolio';
import ArtistProposals from './components/artist/pages/ArtistProposals';
import ArtistCalendar from './components/artist/pages/ArtistCalendar';
import ArtistAnalytics from './components/artist/pages/ArtistAnalytics';
import ArtistSubscription from './components/artist/pages/ArtistSubscription';

// Shared components
import DashboardLayout from './components/shared/DashboardLayout';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './components/admin/pages/AdminOverview';
import AdminUsers from './components/admin/pages/AdminUsers';
import AdminOffers from './components/admin/pages/AdminOffers';
import AdminShops from './components/admin/pages/AdminShops';
import AdminContent from './components/admin/pages/AdminContent';
import AdminPayments from './components/admin/pages/AdminPayments';
import AdminReports from './components/admin/pages/AdminReports';
import AdminMessages from './components/admin/pages/AdminMessages';
import AdminSettings from './components/admin/pages/AdminSettings';

// Public pages
import ArtistsView from './pages/artists/ArtistsView';
import ArtistProfileView from './pages/artists/ArtistProfileView';
import SendProposalPage from './pages/proposals/SendProposalPage';
import OfferDetailPage from './pages/offers/OfferDetailPage';

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

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageWrapper from './components/layout/PageWrapper';

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
  const isArtistRoute = location.pathname.startsWith('/artist');
  const isDashboardRoute = isAdminRoute || isArtistRoute;

  return (
    <div className="App min-h-screen bg-primary-900">
      <Toaster position="top-right" />
      {!isDashboardRoute && <Navbar />}
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PageWrapper fullScreen><HomePage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
          <Route path="/reset-password" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />
          <Route path="/auth/callback" element={<PageWrapper><AuthCallback /></PageWrapper>} />
          <Route path="/artists" element={<PageWrapper><ArtistsView /></PageWrapper>} />
          <Route path="/artists/:id" element={<PageWrapper><ArtistProfileView /></PageWrapper>} />
          <Route path="/offers/:id" element={<PageWrapper><OfferDetailPage /></PageWrapper>} />
          <Route path="/shops" element={<PageWrapper><ShopsListPage /></PageWrapper>} />
          <Route path="/shops/:id" element={<PageWrapper><ShopDetailPage /></PageWrapper>} />
          
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

          {/* Protected client routes */}
          <Route path="/feed" element={
            <ProtectedRoute>
              <PageWrapper><FeedView /></PageWrapper>
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

          {/* Protected artist routes */}
          <Route path="/artist" element={
            <ProtectedRoute requiredRole="artist">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/artist/dashboard" replace />} />
            <Route path="dashboard" element={<ArtistOverview />} />
            <Route path="portfolio" element={<ArtistPortfolio />} />
            <Route path="proposals" element={<ArtistProposals />} />
            <Route path="calendar" element={<ArtistCalendar />} />
            <Route path="analytics" element={<ArtistAnalytics />} />
            <Route path="subscription" element={<ArtistSubscription />} />
          </Route>
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
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
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