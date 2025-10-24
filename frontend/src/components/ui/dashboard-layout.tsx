import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaCertificate,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome
} from 'react-icons/fa'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { profile, fetchProfile } = useUserStore()

  useEffect(() => {
    if (!profile) {
      fetchProfile()
    }
  }, [profile, fetchProfile])

  // Función para determinar qué navegación mostrar según el rol
  const getNavigationByRole = (userRole: string) => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: FaTachometerAlt, current: location.pathname === '/dashboard', roles: ['user', 'participant', 'speaker', 'admin', 'super_admin', 'manager', 'operator', 'client'] },
      { name: 'Mis Eventos y Cursos', href: '/dashboard/events', icon: FaCalendarAlt, current: location.pathname === '/dashboard/events', roles: ['participant', 'speaker', 'admin', 'super_admin'] },
      { name: 'Mis Certificados', href: '/dashboard/certificates', icon: FaCertificate, current: location.pathname === '/dashboard/certificates', roles: ['participant', 'speaker', 'admin', 'super_admin'] },
      { name: 'Mi Perfil', href: '/dashboard/profile', icon: FaUser, current: location.pathname === '/dashboard/profile', roles: ['user', 'participant', 'speaker', 'admin', 'super_admin', 'manager', 'operator', 'client'] },
      { name: 'Configuración', href: '/dashboard/settings', icon: FaCog, current: location.pathname === '/dashboard/settings', roles: ['user', 'participant', 'speaker', 'admin', 'super_admin', 'manager', 'operator', 'client'] },
    ]

    return baseNavigation.filter(item => item.roles.includes(userRole))
  }

  const navigation = getNavigationByRole(user?.role || 'user')

  const handleLogout = () => {
    logout()
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      user: 'Usuario Regular',
      participant: 'Participante',
      speaker: 'Ponente',
      admin: 'Administrador',
      super_admin: 'Super Administrador',
      manager: 'Gerente',
      operator: 'Operador',
      client: 'Cliente'
    }
    return roleNames[role] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      user: 'default',
      participant: 'secondary',
      speaker: 'outline',
      admin: 'destructive',
      super_admin: 'destructive',
      manager: 'destructive',
      operator: 'outline',
      client: 'secondary'
    }
    return variants[role] || 'default'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6B1E22]"
              >
                {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>

              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <FaHome className="mr-2 h-4 w-4" />
                  Ir al Home
                </Button>
              </Link>

              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || `${profile?.firstName} ${profile?.lastName}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {profile?.role && (
                      <Badge variant={getRoleBadgeVariant(profile.role)} className="text-xs">
                        {getRoleDisplayName(profile.role)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="h-8 w-8 rounded-full bg-[#6B1E22] flex items-center justify-center text-white font-semibold text-sm">
                  {profile?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <FaSignOutAlt className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `} style={{ top: '73px' }}>
          <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
            {/* User Card */}
            <div className="px-4 mb-6">
              <div className="bg-gradient-to-r from-[#6B1E22] to-[#8a2b30] rounded-lg p-4 text-white">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {profile?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">
                      {profile?.firstName} {profile?.lastName}
                    </h3>
                    <p className="text-xs opacity-90">
                      {profile?.role && getRoleDisplayName(profile.role)}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      Miembro desde: {profile?.memberSince}
                    </p>
                  </div>
                </div>

                {/* User Stats */}
                {profile?.role === 'participant' && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-lg font-bold">12</div>
                      <div className="text-xs opacity-90">Eventos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">8</div>
                      <div className="text-xs opacity-90">Certificados</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${item.current
                      ? 'bg-[#6B1E22] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#6B1E22]'
                    }
                  `}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-[#6B1E22]'}
                  `} />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-4 mt-6">
              <div className="text-xs text-gray-500 text-center">
                TradeConnect v1.0
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout