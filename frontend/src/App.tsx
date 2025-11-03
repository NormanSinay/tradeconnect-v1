import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import RoleProtectedRoute from './components/auth/RoleProtectedRoute'
import { useTokenValidation } from './hooks/useTokenValidation'
import ScrollToTop from './components/ui/ScrollToTop'

// Componente para proteger rutas con autenticación básica
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    window.location.href = '/login'
    return null
  }

  return <>{children}</>
}

// Componente para redirigir según rol
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuthStore()

  // Debug log para verificar el rol
  console.log('RoleBasedRedirect - User:', user)
  console.log('RoleBasedRedirect - Role:', user?.role)

  // Si es super_admin, redirigir al dashboard de super admin
  if (user?.role === 'super_admin') {
    console.log('RoleBasedRedirect - Redirecting to super admin dashboard')
    window.location.href = '/dashboard/super-admin'
    return null
  }

  // Si es admin, redirigir al dashboard de admin
  if (user?.role === 'admin') {
    console.log('RoleBasedRedirect - Redirecting to admin dashboard')
    window.location.href = '/dashboard/admin'
    return null
  }

  // Si es user, redirigir al dashboard de usuario
  if (user?.role === 'user') {
    console.log('RoleBasedRedirect - Redirecting to user dashboard')
    window.location.href = '/dashboard/user'
    return null
  }

  // Si es participant, redirigir al dashboard de participante
  if (user?.role === 'participant') {
    console.log('RoleBasedRedirect - Redirecting to participant dashboard')
    window.location.href = '/dashboard/participant'
    return null
  }

  // Si es client, redirigir al dashboard de cliente
  if (user?.role === 'client') {
    console.log('RoleBasedRedirect - Redirecting to client dashboard')
    window.location.href = '/dashboard/client'
    return null
  }

  // Para otros roles no definidos, mantener en dashboard normal
  console.log('RoleBasedRedirect - Using normal dashboard')
  return <DashboardMainPage />
}

// Pages
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardMainPage from './pages/DashboardMainPage'
import DashboardEventsPage from './pages/DashboardEventsPage'
import DashboardCertificatesPage from './pages/DashboardCertificatesPage'
import DashboardProfilePage from './pages/DashboardProfilePage'
import DashboardSettingsPage from './pages/DashboardSettingsPage'
import DashboardSuperAdminPage from './pages/DashboardSuperAdminPage'
import DashboardAdminPage from './pages/DashboardAdminPage'
import DashboardUserPage from './pages/DashboardUserPage'
import DashboardParticipantPage from './pages/DashboardParticipantPage'
import DashboardClientPage from './pages/DashboardClientPage'
import TermsPage from './pages/TermsPage'
import VerificationPage from './pages/VerificationPage'
import UserEventsPage from './pages/UserEventsPage'
import UserCertificatesPage from './pages/UserCertificatesPage'
import UserProfilePage from './pages/UserProfilePage'
import UserSettingsPage from './pages/UserSettingsPage'
import EventDetailPage from './pages/EventDetailPage'

function App() {
  // Validar tokens y sesiones automáticamente
  useTokenValidation();

  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />
      <Route path="/dashboard/super-admin" element={<RoleProtectedRoute allowedRoles={['super_admin']}><DashboardSuperAdminPage /></RoleProtectedRoute>} />
      <Route path="/dashboard/admin" element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin']}><DashboardAdminPage /></RoleProtectedRoute>} />
      <Route path="/dashboard/user" element={<RoleProtectedRoute allowedRoles={['user']}><DashboardUserPage /></RoleProtectedRoute>} />
      <Route path="/dashboard/participant" element={<RoleProtectedRoute allowedRoles={['participant']}><DashboardParticipantPage /></RoleProtectedRoute>} />
      <Route path="/dashboard/client" element={<RoleProtectedRoute allowedRoles={['client']}><DashboardClientPage /></RoleProtectedRoute>} />
      <Route path="/events" element={<RoleProtectedRoute allowedRoles={['user', 'participant', 'client', 'admin', 'super_admin']}><UserEventsPage /></RoleProtectedRoute>} />
      <Route path="/certificates" element={<RoleProtectedRoute allowedRoles={['user', 'participant', 'client', 'admin', 'super_admin']}><UserCertificatesPage /></RoleProtectedRoute>} />
      <Route path="/profile" element={<RoleProtectedRoute allowedRoles={['user', 'participant', 'client', 'admin', 'super_admin']}><UserProfilePage /></RoleProtectedRoute>} />
      <Route path="/settings" element={<RoleProtectedRoute allowedRoles={['user', 'participant', 'client', 'admin', 'super_admin']}><UserSettingsPage /></RoleProtectedRoute>} />
      <Route path="/dashboard/events" element={<RoleProtectedRoute allowedRoles={['user', 'participant', 'client', 'admin', 'super_admin']}><DashboardEventsPage /></RoleProtectedRoute>} />
      <Route path="/dashboard/certificates" element={<RoleProtectedRoute allowedRoles={['user', 'participant', 'client', 'admin', 'super_admin']}><DashboardCertificatesPage /></RoleProtectedRoute>} />
      <Route path="/dashboard/profile" element={<RoleProtectedRoute allowedRoles={['user', 'participant', 'client', 'admin', 'super_admin']}><DashboardProfilePage /></RoleProtectedRoute>} />
      <Route path="/dashboard/settings" element={<RoleProtectedRoute allowedRoles={['user', 'participant', 'client', 'admin', 'super_admin']}><DashboardSettingsPage /></RoleProtectedRoute>} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/verify" element={<VerificationPage />} />
    </Routes>
    </>
  )
}

export default App