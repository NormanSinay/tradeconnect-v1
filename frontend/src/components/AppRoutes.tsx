import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

// Lazy load components for better performance
const HomePage = lazy(() => import('@/components/HomePage'));
// Placeholder components for now - will be implemented later
const EventsPage = lazy(() => import('@/components/EventsPage'));
const EventDetailPage = () => <div>Event Detail Page - Coming Soon</div>;
const CartPage = () => <div>Cart Page - Coming Soon</div>;
const CheckoutPage = () => <div>Checkout Page - Coming Soon</div>;
const ProfilePage = () => <div>Profile Page - Coming Soon</div>;
const CertificatesPage = () => <div>Certificates Page - Coming Soon</div>;
const CertificateDetailPage = () => <div>Certificate Detail Page - Coming Soon</div>;
const LoginPage = () => <div>Login Page - Coming Soon</div>;
const RegisterPage = () => <div>Register Page - Coming Soon</div>;
const DashboardPage = () => <div>Dashboard Page - Coming Soon</div>;

// Loading component
const LoadingFallback: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="50vh"
  >
    <CircularProgress size={60} thickness={4} />
  </Box>
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