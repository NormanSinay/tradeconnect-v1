import React, { useState, useEffect } from 'react'
import { FaBell, FaUser, FaCog, FaSignOutAlt, FaSearch, FaBars } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAdmin } from '@/context/AdminContext'
import { cn } from '@/lib/utils'
import type { ComponentProps } from '@/types'

interface AdminHeaderProps extends ComponentProps {
  onMenuClick?: () => void
  onSearch?: (query: string) => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onMenuClick,
  onSearch,
  className,
}) => {
  const { user, alerts } = useAdmin()
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Calcular notificaciones no leídas
  useEffect(() => {
    const unread = alerts.filter(alert => !alert.read).length
    setUnreadNotifications(unread)
  }, [alerts])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleLogout = () => {
    // Implementar logout
    console.log('Logout')
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className={cn("bg-white border-b border-gray-200 px-4 py-3", className)}>
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and search */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <FaBars className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="relative hidden md:block">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Search button for mobile */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <FaSearch className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <FaBell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Notificaciones</h3>
                <p className="text-sm text-gray-500">
                  {unreadNotifications} notificaciones sin leer
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No hay notificaciones
                  </div>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          alert.priority === 'high' ? 'bg-red-500' :
                          alert.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {alert.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {alerts.length > 5 && (
                <div className="px-4 py-2 border-t border-gray-200">
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todas las notificaciones
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary-100 text-primary-600">
                    {user?.name ? getUserInitials(user.name) : 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role || 'Administrador'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || 'admin@tradeconnect.gt'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FaUser className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FaCog className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <FaSignOutAlt className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader