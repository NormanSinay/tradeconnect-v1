import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Componente para proteger rutas
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

  // Para otros roles, mantener en dashboard normal
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
import TermsPage from './pages/TermsPage'
import VerificationPage from './pages/VerificationPage'
import UserEventsPage from './pages/UserEventsPage'
import UserCertificatesPage from './pages/UserCertificatesPage'
import UserProfilePage from './pages/UserProfilePage'
import UserSettingsPage from './pages/UserSettingsPage'

function App() {
  return (
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
      <Route path="/dashboard/super-admin" element={<ProtectedRoute><DashboardSuperAdminPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><UserEventsPage /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><UserCertificatesPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} />
      <Route path="/dashboard/events" element={<ProtectedRoute><DashboardEventsPage /></ProtectedRoute>} />
      <Route path="/dashboard/certificates" element={<ProtectedRoute><DashboardCertificatesPage /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardProfilePage /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettingsPage /></ProtectedRoute>} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/verify" element={<VerificationPage />} />
    </Routes>
  )
}

export default App