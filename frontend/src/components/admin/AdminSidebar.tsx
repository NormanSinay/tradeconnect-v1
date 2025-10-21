import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCertificate,
  FaFileCode,
  FaRocket,
  FaEnvelope,
  FaLink,
  FaChevronDown,
  FaChevronRight,
  FaCreditCard,
  FaTags,
  FaFileInvoice,
  FaQrcode
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ComponentProps } from '@/types'

interface AdminSidebarProps extends ComponentProps {
  isOpen: boolean
  onToggle: () => void
  onLogout: () => void
}

const menuItems = [
  {
    icon: FaTachometerAlt,
    label: 'Dashboard',
    path: '/admin',
    badge: null,
    submenu: [
      {
        icon: FaTachometerAlt,
        label: 'Principal',
        path: '/admin',
      },
      {
        icon: FaTachometerAlt,
        label: 'Inicio',
        path: '/admin/inicio',
      },
      {
        icon: FaTachometerAlt,
        label: 'KPIs',
        path: '/admin/kpis',
      },
      {
        icon: FaTachometerAlt,
        label: 'Analytics',
        path: '/admin/analytics',
      },
    ],
  },
  {
    icon: FaCalendarAlt,
    label: 'Eventos',
    path: '/admin/eventos',
    badge: null,
    submenu: [
      {
        icon: FaCalendarAlt,
        label: 'Gestión',
        path: '/admin/eventos',
      },
      {
        icon: FaCalendarAlt,
        label: 'Crear Evento',
        path: '/admin/eventos/crear',
      },
      {
        icon: FaCalendarAlt,
        label: 'Templates',
        path: '/admin/eventos/templates',
      },
      {
        icon: FaCalendarAlt,
        label: 'Transmisión',
        path: '/admin/transmision',
      },
    ],
  },
  {
    icon: FaUsers,
    label: 'Inscripciones',
    path: '/admin/inscripciones',
    badge: null,
    submenu: [
      {
        icon: FaUsers,
        label: 'Gestión',
        path: '/admin/inscripciones',
      },
      {
        icon: FaUsers,
        label: 'Crear Inscripción',
        path: '/admin/inscripciones/crear',
      },
      {
        icon: FaUsers,
        label: 'Exportar',
        path: '/admin/inscripciones/exportar',
      },
    ],
  },
  {
    icon: FaUsers,
    label: 'Asistencias',
    path: '/admin/asistencias',
    badge: null,
    submenu: [
      {
        icon: FaUsers,
        label: 'Control de Acceso',
        path: '/admin/control-acceso',
      },
      {
        icon: FaUsers,
        label: 'Reportes',
        path: '/admin/asistencias/reporte',
      },
    ],
  },
  {
    icon: FaUsers,
    label: 'Aforos',
    path: '/admin/aforos',
    badge: null,
    submenu: [
      {
        icon: FaUsers,
        label: 'Gestión',
        path: '/admin/aforos',
      },
      {
        icon: FaUsers,
        label: 'Overbooking',
        path: '/admin/aforos/overbooking',
      },
      {
        icon: FaUsers,
        label: 'Estadísticas',
        path: '/admin/aforos/estadisticas',
      },
    ],
  },
  {
    icon: FaCertificate,
    label: 'Certificados',
    path: '/admin/certificados',
    badge: null,
    submenu: [
      {
        icon: FaCertificate,
        label: 'Gestión',
        path: '/admin/certificados',
      },
      {
        icon: FaFileCode,
        label: 'Plantillas',
        path: '/admin/certificados/templates',
      },
      {
        icon: FaRocket,
        label: 'Generación Masiva',
        path: '/admin/certificados/generar-lote',
      },
      {
        icon: FaEnvelope,
        label: 'Enviados',
        path: '/admin/certificados/enviados',
      },
      {
        icon: FaLink,
        label: 'Blockchain',
        path: '/admin/certificados/blockchain',
      },
      {
        icon: FaFileAlt,
        label: 'Reportes',
        path: '/admin/certificados/reporte',
      },
    ],
  },
  {
    icon: FaCreditCard,
    label: 'Pagos',
    path: '/admin/pagos',
    badge: null,
    submenu: [
      {
        icon: FaCreditCard,
        label: 'Gestión',
        path: '/admin/pagos',
      },
      {
        icon: FaCreditCard,
        label: 'Pendientes',
        path: '/admin/pagos/pendientes',
      },
      {
        icon: FaCreditCard,
        label: 'Configuración',
        path: '/admin/pagos/configuracion',
      },
      {
        icon: FaCreditCard,
        label: 'Reembolsos',
        path: '/admin/reembolsos',
      },
      {
        icon: FaCreditCard,
        label: 'Conciliación',
        path: '/admin/reconciliacion',
      },
    ],
  },
  {
    icon: FaTags,
    label: 'Promociones',
    path: '/admin/promociones',
    badge: null,
    submenu: [
      {
        icon: FaTags,
        label: 'Gestión',
        path: '/admin/promociones',
      },
      {
        icon: FaTags,
        label: 'Crear Promoción',
        path: '/admin/promociones/crear',
      },
      {
        icon: FaTags,
        label: 'Códigos',
        path: '/admin/codigos-promocionales',
      },
      {
        icon: FaTags,
        label: 'Reportes',
        path: '/admin/promociones/reporte',
      },
    ],
  },
  {
    icon: FaFileInvoice,
    label: 'FEL',
    path: '/admin/fel',
    badge: null,
    submenu: [
      {
        icon: FaFileInvoice,
        label: 'Panel Principal',
        path: '/admin/fel',
      },
      {
        icon: FaFileInvoice,
        label: 'Pendientes',
        path: '/admin/fel/pendientes',
      },
      {
        icon: FaFileInvoice,
        label: 'Emitidas',
        path: '/admin/fel/emitidas',
      },
      {
        icon: FaFileInvoice,
        label: 'Anuladas',
        path: '/admin/fel/anuladas',
      },
      {
        icon: FaFileInvoice,
        label: 'Certificación',
        path: '/admin/fel/certificacion',
      },
      {
        icon: FaFileInvoice,
        label: 'Configuración',
        path: '/admin/fel/configuracion',
      },
    ],
  },
  {
    icon: FaFileAlt,
    label: 'Reportes',
    path: '/admin/reportes',
    badge: null,
    submenu: [
      {
        icon: FaFileAlt,
        label: 'Financiero',
        path: '/admin/reportes/financiero',
      },
      {
        icon: FaFileAlt,
        label: 'Personalizado',
        path: '/admin/reportes/personalizado',
      },
    ],
  },
  {
    icon: FaQrcode,
    label: 'QR',
    path: '/admin/qr',
    badge: null,
    submenu: [
      {
        icon: FaQrcode,
        label: 'Escáner',
        path: '/admin/qr/escaner',
      },
      {
        icon: FaQrcode,
        label: 'Validación Offline',
        path: '/admin/validacion-offline',
      },
    ],
  },
  {
    icon: FaCog,
    label: 'Sistema',
    path: '/admin/sistema',
    badge: null,
    submenu: [
      {
        icon: FaCog,
        label: 'Configuración',
        path: '/admin/configuracion',
      },
      {
        icon: FaCog,
        label: 'Empresa',
        path: '/admin/configuracion-empresa',
      },
      {
        icon: FaCog,
        label: 'Localización',
        path: '/admin/configuracion-localizacion',
      },
      {
        icon: FaCog,
        label: 'Auditoría',
        path: '/admin/auditoria',
      },
      {
        icon: FaCog,
        label: 'Logs',
        path: '/admin/logs',
      },
      {
        icon: FaCog,
        label: 'Backups',
        path: '/admin/backups',
      },
    ],
  },
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onToggle,
  onLogout,
  className,
}) => {
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuKey)
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    )
  }

  const isMenuExpanded = (menuKey: string) => expandedMenus.includes(menuKey)
  const isSubmenuActive = (submenu: any[]) => submenu.some(item => location.pathname === item.path)

  // Verificar permisos para mostrar/ocultar elementos del menú
  const canAccessMenuItem = (path: string) => {
    // Aquí se podría integrar con el contexto de permisos
    // Por ahora, mostrar todos los elementos
    return true
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">TC</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">TradeConnect</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <FaTimes />
          </Button>
        </div>

        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              // Verificar permisos antes de renderizar
              if (!canAccessMenuItem(item.path)) return null

              const Icon = item.icon
              const isActive = location.pathname === item.path
              const hasSubmenu = item.submenu && item.submenu.length > 0
              const isExpanded = isMenuExpanded(item.path)
              const isSubActive = hasSubmenu && isSubmenuActive(item.submenu)

              return (
                <div key={item.path}>
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.path)}
                      className={cn(
                        "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        (isActive || isSubActive)
                          ? "bg-primary-50 text-primary-700 border-r-2 border-primary-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isExpanded ? (
                        <FaChevronDown className="h-4 w-4" />
                      ) : (
                        <FaChevronRight className="h-4 w-4" />
                      )}
                      {item.badge && !hasSubmenu && (
                        <Badge variant="secondary" className="ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700 border-r-2 border-primary-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      onClick={() => {
                        // Close sidebar on mobile after navigation
                        if (window.innerWidth < 1024) {
                          onToggle()
                        }
                      }}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )}

                  {/* Submenu */}
                  {hasSubmenu && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu
                        .filter(subItem => canAccessMenuItem(subItem.path))
                        .map((subItem) => {
                        const SubIcon = subItem.icon
                        const isSubActive = location.pathname === subItem.path

                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                              isSubActive
                                ? "bg-primary-50 text-primary-700 border-r-2 border-primary-700"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            )}
                            onClick={() => {
                              // Close sidebar on mobile after navigation
                              if (window.innerWidth < 1024) {
                                onToggle()
                              }
                            }}
                          >
                            <SubIcon className="mr-3 h-4 w-4" />
                            <span className="flex-1">{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <Separator />

          {/* User Section */}
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@tradeconnect.gt
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onLogout}
            >
              <FaSignOutAlt className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}