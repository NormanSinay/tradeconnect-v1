import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { adminDashboardService } from '@/services/admin'
import { useRealtimeMetrics, useRealtimeAlerts } from '@/hooks/useWebSocket'
import { useAuth } from '@/context/AuthContext'
import type { DashboardKPI, DashboardAlert, SystemStats, PerformanceMetric } from '@/types/admin'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  avatar?: string
}

interface AdminContextType {
  // Usuario actual
  user: AdminUser | null
  isAuthenticated: boolean

  // Estado del dashboard
  kpis: DashboardKPI[]
  alerts: DashboardAlert[]
  systemStats: SystemStats | null
  performanceMetrics: PerformanceMetric[]

  // Estado de carga
  isLoading: boolean
  error: string | null

  // Métricas en tiempo real
  realtimeMetrics: any
  realtimeAlerts: any[]
  lastMetricsUpdate: Date | null

  // Configuración del sistema
  systemConfig: {
    theme: 'light' | 'dark'
    language: string
    timezone: string
    notifications: boolean
    autoRefresh: boolean
    refreshInterval: number
  }

  // Acciones
  refreshData: () => Promise<void>
  dismissAlert: (alertId: string) => Promise<void>
  updateRefreshInterval: (interval: string) => Promise<void>
  updateSystemConfig: (config: Partial<AdminContextType['systemConfig']>) => Promise<void>

  // Permisos
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  canAccessRoute: (route: string) => boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

interface AdminProviderProps {
  children: ReactNode
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user: authUser, isAuthenticated: authIsAuthenticated } = useAuth()

  // Estado del usuario admin (derivado del contexto de autenticación)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Estado del dashboard
  const [kpis, setKpis] = useState<DashboardKPI[]>([])
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])

  // Estado de carga y errores
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Configuración del sistema
  const [systemConfig, setSystemConfig] = useState<AdminContextType['systemConfig']>({
    theme: 'light',
    language: 'es',
    timezone: 'America/Guatemala',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 segundos
  })

  // WebSocket para métricas en tiempo real
  const { metrics: realtimeMetrics, lastUpdate: lastMetricsUpdate } = useRealtimeMetrics(isAuthenticated)
  const { alerts: realtimeAlerts } = useRealtimeAlerts(isAuthenticated)

  // Cargar datos iniciales del dashboard
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [kpisData, alertsData, statsData, metricsData] = await Promise.all([
        adminDashboardService.getKPIs(),
        adminDashboardService.getAlerts(),
        adminDashboardService.getSystemStats(),
        adminDashboardService.getPerformanceMetrics(),
      ])

      setKpis(kpisData)
      setAlerts(alertsData)
      setSystemStats(statsData)
      setPerformanceMetrics(metricsData)
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // Refrescar datos
  const refreshData = async () => {
    await loadDashboardData()
  }

  // Descartar alerta
  const dismissAlert = async (alertId: string) => {
    try {
      await adminDashboardService.dismissAlert(alertId)
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (err) {
      console.error('Error descartando alerta:', err)
      setError('Error al descartar la alerta')
    }
  }

  // Actualizar intervalo de refresco
  const updateRefreshInterval = async (interval: string) => {
    try {
      await adminDashboardService.updateRefreshInterval(interval as any)
      // Aquí podrías actualizar la configuración local
    } catch (err) {
      console.error('Error actualizando intervalo de refresco:', err)
      setError('Error al actualizar el intervalo de refresco')
    }
  }

  // Verificar permisos
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission) || user.permissions.includes('*')
  }

  // Verificar roles
  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.role === role || user.role === 'super_admin'
  }

  // Actualizar configuración del sistema
  const updateSystemConfig = async (config: Partial<AdminContextType['systemConfig']>) => {
    try {
      setSystemConfig(prev => ({ ...prev, ...config }))
      // Aquí se podría guardar en localStorage o enviar al backend
      localStorage.setItem('adminSystemConfig', JSON.stringify({ ...systemConfig, ...config }))
    } catch (err) {
      console.error('Error actualizando configuración:', err)
      setError('Error al actualizar la configuración')
    }
  }

  // Verificar acceso a rutas basado en permisos
  const canAccessRoute = (route: string): boolean => {
    if (!user) return false

    // Definir permisos requeridos por ruta
    const routePermissions: Record<string, string[]> = {
      '/admin': ['dashboard.view'],
      '/admin/eventos': ['events.view'],
      '/admin/eventos/crear': ['events.edit'],
      '/admin/inscripciones': ['registrations.view'],
      '/admin/certificados': ['certificates.view'],
      '/admin/pagos': ['payments.view'],
      '/admin/promociones': ['promotions.view'],
      '/admin/fel': ['fel.view'],
      '/admin/reportes': ['reports.view'],
      '/admin/configuracion': ['settings.view'],
      '/admin/auditoria': ['audit.view'],
    }

    const requiredPermissions = routePermissions[route] || []
    if (requiredPermissions.length === 0) return true

    return requiredPermissions.some(permission => hasPermission(permission))
  }

  // Sincronizar con el contexto de autenticación
  useEffect(() => {
    if (authIsAuthenticated && authUser) {
      // Verificar si el usuario tiene rol de admin
      const userRole = (authUser as any).role || 'user'
      if (userRole === 'admin' || userRole === 'super_admin') {
        const adminUser: AdminUser = {
          id: authUser.id,
          name: authUser.name || authUser.email,
          email: authUser.email,
          role: userRole,
          permissions: (authUser as any).permissions || [
            'dashboard.view',
            'dashboard.edit',
            'users.view',
            'users.edit',
            'events.view',
            'events.edit',
            'registrations.view',
            'registrations.edit',
            'certificates.view',
            'certificates.edit',
            'payments.view',
            'payments.edit',
            'promotions.view',
            'promotions.edit',
            'fel.view',
            'fel.edit',
            'reports.view',
            'reports.export',
            'settings.view',
            'settings.edit',
            'audit.view',
            'system.view',
            'system.edit',
          ],
          avatar: (authUser as any).avatar,
        }

        setUser(adminUser)
        setIsAuthenticated(true)
      } else {
        // Usuario no es admin
        setUser(null)
        setIsAuthenticated(false)
      }
    } else {
      setUser(null)
      setIsAuthenticated(false)
    }

    // Cargar configuración del sistema desde localStorage
    const savedConfig = localStorage.getItem('adminSystemConfig')
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setSystemConfig(prev => ({ ...prev, ...parsedConfig }))
      } catch (err) {
        console.error('Error cargando configuración:', err)
      }
    }
  }, [authIsAuthenticated, authUser])

  // Cargar datos cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated])

  // Actualizar alertas en tiempo real
  useEffect(() => {
    if (realtimeAlerts.length > 0) {
      setAlerts(prev => {
        const newAlerts = [...realtimeAlerts, ...prev]
        // Remover duplicados y mantener solo las más recientes
        return newAlerts
          .filter((alert, index, self) =>
            index === self.findIndex(a => a.id === alert.id)
          )
          .slice(0, 20) // Mantener máximo 20 alertas
      })
    }
  }, [realtimeAlerts])

  const value: AdminContextType = {
    user,
    isAuthenticated,
    kpis,
    alerts,
    systemStats,
    performanceMetrics,
    isLoading,
    error,
    realtimeMetrics,
    realtimeAlerts,
    lastMetricsUpdate,
    systemConfig,
    refreshData,
    dismissAlert,
    updateRefreshInterval,
    updateSystemConfig,
    hasPermission,
    hasRole,
    canAccessRoute,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

// Hook para usar el contexto de admin
export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

// Hook para verificar permisos específicos
export const usePermission = (permission: string): boolean => {
  const { hasPermission } = useAdmin()
  return hasPermission(permission)
}

// Hook para verificar roles específicos
export const useRole = (role: string): boolean => {
  const { hasRole } = useAdmin()
  return hasRole(role)
}