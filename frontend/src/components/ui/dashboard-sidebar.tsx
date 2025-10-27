import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaGraduationCap,
  FaAward,
  FaUser,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa'
import { useAuthStore } from '@/stores/authStore'
import { UserService, UserProfile } from '@/services/userService'
import { Button } from '@/components/ui/button'

interface DashboardSidebarProps {
  className?: string
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ className = '' }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await UserService.getProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error('Error loading user profile for sidebar:', error)
      }
    }

    if (user) {
      loadUserProfile()
    }
  }, [user])

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/dashboard',
      roles: ['user', 'participant', 'speaker', 'admin', 'manager']
    },
    {
      id: 'events',
      label: 'Mis Eventos y Cursos',
      icon: FaCalendarAlt,
      path: '/dashboard/events',
      roles: ['user', 'participant', 'speaker', 'admin', 'manager']
    },
    {
      id: 'certificates',
      label: 'Mis Certificados',
      icon: FaAward,
      path: '/dashboard/certificates',
      roles: ['user', 'participant', 'speaker', 'admin', 'manager']
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: FaUser,
      path: '/dashboard/profile',
      roles: ['user', 'participant', 'speaker', 'admin', 'manager']
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: FaCog,
      path: '/dashboard/settings',
      roles: ['user', 'participant', 'speaker', 'admin', 'manager']
    }
  ]

  // Filtrar menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  )

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-gray-200"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[#6B1E22] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">
              {UserService.getInitials(userProfile)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {UserService.getFullName(userProfile)}
          </h3>
          <p className="text-sm text-gray-600 capitalize">
            {UserService.getPrimaryRole(userProfile)}
          </p>
          {userProfile?.isActive && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activo
              </span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Miembro desde {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : '2023'}
          </p>
        </div>
      </motion.div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item, index) => {
            const IconComponent = item.icon
            const isActive = location.pathname === item.path

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#6B1E22] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#6B1E22]'
                  }`}
                >
                  <IconComponent className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-3 justify-center text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          <FaSignOutAlt />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export default DashboardSidebar