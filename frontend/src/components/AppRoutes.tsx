import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

// Lazy load components for better performance
const HomePage = lazy(() => import('@/components/HomePage'));
// Placeholder components for now - will be implemented later
const EventsPage = lazy(() => import('@/components/EventsPage'));
const EventDetailPage = lazy(() => import('@/components/events/EventDetailPage'));
const CartPage = lazy(() => import('@/components/cart/CartPage'));
const CheckoutPage = lazy(() => import('@/components/checkout/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('@/components/checkout/CheckoutSuccessPage'));
const ProfilePage = lazy(() => import('@/components/profile/ProfilePage'));
const CertificatesPage = () => <div>Certificates Page - Coming Soon</div>;
const CertificateDetailPage = lazy(() => import('@/components/certificates/CertificateDetailPage'));
const LoginPage = lazy(() => import('@/components/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/components/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/components/admin/DashboardPage'));

// Static pages
const ContactPage = lazy(() => import('@/components/ContactPage'));
const ReportIssuePage = lazy(() => import('@/components/ReportIssuePage'));

// Loading component
const LoadingFallback: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh'
    }}
  >
    <CircularProgress size={60} thickness={4} />
  </div>
);

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* Static Pages */}
        <Route path="/about" element={<div>About Page - Coming Soon</div>} />
        <Route path="/how-it-works" element={<div>How It Works Page - Coming Soon</div>} />
        <Route path="/organizers" element={<div>Organizers Page - Coming Soon</div>} />
        <Route path="/business" element={<div>Business Page - Coming Soon</div>} />
        <Route path="/help" element={<div>Help Page - Coming Soon</div>} />
        <Route path="/faq" element={<div>FAQ Page - Coming Soon</div>} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/report-issue" element={<ReportIssuePage />} />
        <Route path="/terms" element={<div>Terms Page - Coming Soon</div>} />
        <Route path="/privacy" element={<div>Privacy Page - Coming Soon</div>} />
        <Route path="/cookies" element={<div>Cookies Page - Coming Soon</div>} />
        <Route path="/fel-info" element={<div>FEL Info Page - Coming Soon</div>} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute requireAuth>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute requireAuth>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <ProtectedRoute requireAuth>
              <CheckoutSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute requireAuth>
              <CertificatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates/:id"
          element={
            <ProtectedRoute requireAuth>
              <CertificateDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth requireAdmin>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;