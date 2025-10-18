import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BaseLayout from '@/components/layout/BaseLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Lazy load components for better performance
const HomePage = lazy(() => import('@/components/HomePageNew'));
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
const ForgotPasswordPage = lazy(() => import('@/components/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/components/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/components/admin/DashboardPage'));
const DebugDashboard = lazy(() => import('@/components/admin/DebugDashboard'));

// Speaker pages
const SpeakerEventsPage = lazy(() => import('@/components/speaker/SpeakerEventsPage'));
const SpeakerSchedulePage = lazy(() => import('@/components/speaker/SpeakerSchedulePage'));
const SpeakerProfilePage = lazy(() => import('@/components/speaker/SpeakerProfilePage'));

// Operator pages
const OperatorCheckinPage = lazy(() => import('@/components/operator/OperatorCheckinPage'));

// Static pages
const ContactPage = lazy(() => import('@/components/ContactPage'));
const ReportIssuePage = lazy(() => import('@/components/ReportIssuePage'));

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requiredRoles?: string[]; // New: specific roles required
  requireSuperAdmin?: boolean; // New: require super_admin specifically
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  requiredRoles = [],
  requireSuperAdmin = false,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for super_admin specifically
  if (requireSuperAdmin) {
    const isSuperAdmin = user?.roles?.includes('super_admin');
    if (!user || !isSuperAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  if (requireAdmin) {
    const adminRoles = ['super_admin', 'admin', 'manager'];
    // El backend retorna roles como array
    const hasAdminRole = user?.roles?.some(role => adminRoles.includes(role));

    if (!user || !hasAdminRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Check for specific roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = user?.roles?.some(role => requiredRoles.includes(role));
    if (!user || !hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Layout wrapper based on user role
const LayoutWrapper: React.FC = () => {
  const { user } = useAuth();

  // Super admin gets dedicated admin layout without public navbar
  const isSuperAdmin = user?.roles?.includes('super_admin');

  return isSuperAdmin ? <AdminLayout /> : <BaseLayout><Outlet /></BaseLayout>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes('super_admin');

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Routes con Layout dinámico (BaseLayout para usuarios normales, AdminLayout para super_admin) */}
        <Route element={<LayoutWrapper />}>
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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

          {/* Admin Routes - Super admin usa AdminLayout, otros admin usan BaseLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAuth requireAdmin>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Speaker Routes */}
          <Route
            path="/speaker/events"
            element={
              <ProtectedRoute requireAuth requiredRoles={['speaker']}>
                <SpeakerEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/speaker/schedule"
            element={
              <ProtectedRoute requireAuth requiredRoles={['speaker']}>
                <SpeakerSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/speaker/profile"
            element={
              <ProtectedRoute requireAuth requiredRoles={['speaker']}>
                <SpeakerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Operator Routes */}
          <Route
            path="/operator/checkin"
            element={
              <ProtectedRoute requireAuth requiredRoles={['operator']}>
                <OperatorCheckinPage />
              </ProtectedRoute>
            }
          />

          {/* Debug Route */}
          <Route path="/debug" element={<DebugDashboard />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;