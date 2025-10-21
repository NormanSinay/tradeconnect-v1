import React, { useState, useEffect } from 'react'
import { FaHistory, FaSearch, FaFilter, FaEye, FaDownload, FaCalendarAlt, FaUser, FaShieldAlt, FaCreditCard, FaFileInvoice, FaQrcode, FaBell, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface ActivityLog {
  id: string
  timestamp: string
  action: string
  category: 'auth' | 'profile' | 'payment' | 'registration' | 'certificate' | 'notification' | 'security' | 'system'
  description: string
  ipAddress: string
  userAgent: string
  location?: string
  metadata?: Record<string, any>
  status: 'success' | 'warning' | 'error'
}

export const UserActivityLogPage: React.FC = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  useEffect(() => {
    fetchActivityLog()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, searchTerm, categoryFilter, statusFilter, dateRange])

  const fetchActivityLog = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get('/user/activity-log')

      // Mock activity data
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          timestamp: '2024-01-20T14:30:00Z',
          action: 'login',
          category: 'auth',
          description: 'Inicio de sesión exitoso',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Guatemala City, Guatemala',
          status: 'success'
        },
        {
          id: '2',
          timestamp: '2024-01-20T10:15:00Z',
          action: 'payment_completed',
          category: 'payment',
          description: 'Pago procesado exitosamente - Conferencia Anual',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Guatemala City, Guatemala',
          metadata: { amount: 150.00, currency: 'GTQ', transactionId: 'TXN-2024-001' },
          status: 'success'
        },
        {
          id: '3',
          timestamp: '2024-01-19T16:45:00Z',
          action: 'certificate_issued',
          category: 'certificate',
          description: 'Certificado emitido - Taller de Liderazgo Empresarial',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Guatemala City, Guatemala',
          metadata: { certificateId: 'CERT-2024-001', eventTitle: 'Taller de Liderazgo Empresarial' },
          status: 'success'
        },
        {
          id: '4',
          timestamp: '2024-01-19T09:30:00Z',
          action: 'profile_updated',
          category: 'profile',
          description: 'Perfil actualizado - Información personal modificada',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Guatemala City, Guatemala',
          status: 'success'
        },
        {
          id: '5',
          timestamp: '2024-01-18T14:20:00Z',
          action: 'qr_code_used',
          category: 'registration',
          description: 'Código QR utilizado - Seminario de Desarrollo Personal',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Guatemala City, Guatemala',
          metadata: { qrCode: 'QR456789123', eventTitle: 'Seminario de Desarrollo Personal' },
          status: 'success'
        },
        {
          id: '6',
          timestamp: '2024-01-18T11:00:00Z',
          action: 'password_changed',
          category: 'security',
          description: 'Contraseña cambiada exitosamente',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Guatemala City, Guatemala',
          status: 'success'
        },
        {
          id: '7',
          timestamp: '2024-01-17T15:30:00Z',
          action: 'login_failed',
          category: 'auth',
          description: 'Intento de inicio de sesión fallido - Contraseña incorrecta',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Guatemala City, Guatemala',
          status: 'warning'
        },
        {
          id: '8',
          timestamp: '2024-01-16T13:45:00Z',
          action: 'notification_sent',
          category: 'notification',
          description: 'Notificación enviada - Recordatorio de evento',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Guatemala City, Guatemala',
          metadata: { type: 'email', eventTitle: 'Workshop de Marketing Digital' },
          status: 'success'
        }
      ]

      setActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching activity log:', error)
      showToast.error('Error al cargar el historial de actividad')
    } finally {
      setIsLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(activity => activity.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === statusFilter)
    }

    if (dateRange.start) {
      filtered = filtered.filter(activity =>
        new Date(activity.timestamp) >= new Date(dateRange.start)
      )
    }

    if (dateRange.end) {
      filtered = filtered.filter(activity =>
        new Date(activity.timestamp) <= new Date(dateRange.end)
      )
    }

    setFilteredActivities(filtered)
  }

  const exportActivityLog = async () => {
    try {
      // In a real app, you would call your API
      // const response = await api.get('/user/activity-log/export', { responseType: 'blob' })

      // Mock export - create CSV content
      const csvContent = [
        'Fecha,Hora,Acción,Categoría,Descripción,Estado,Ubicación',
        ...filteredActivities.map(activity => {
          const date = new Date(activity.timestamp)
          return [
            date.toLocaleDateString('es-GT'),
            date.toLocaleTimeString('es-GT'),
            activity.action,
            activity.category,
            `"${activity.description}"`,
            activity.status,
            activity.location || ''
          ].join(',')
        })
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `historial-actividad-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast.success('Historial exportado exitosamente')
    } catch (error) {
      console.error('Error exporting activity log:', error)
      showToast.error('Error al exportar el historial')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <FaUser className="h-4 w-4 text-blue-500" />
      case 'profile':
        return <FaUser className="h-4 w-4 text-green-500" />
      case 'payment':
        return <FaCreditCard className="h-4 w-4 text-purple-500" />
      case 'registration':
        return <FaQrcode className="h-4 w-4 text-orange-500" />
      case 'certificate':
        return <FaFileInvoice className="h-4 w-4 text-teal-500" />
      case 'notification':
        return <FaBell className="h-4 w-4 text-yellow-500" />
      case 'security':
        return <FaShieldAlt className="h-4 w-4 text-red-500" />
      case 'system':
        return <FaExclamationTriangle className="h-4 w-4 text-gray-500" />
      default:
        return <FaHistory className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'auth':
        return 'Autenticación'
      case 'profile':
        return 'Perfil'
      case 'payment':
        return 'Pagos'
      case 'registration':
        return 'Registro'
      case 'certificate':
        return 'Certificados'
      case 'notification':
        return 'Notificaciones'
      case 'security':
        return 'Seguridad'
      case 'system':
        return 'Sistema'
      default:
        return 'Otro'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Éxito</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const getActionName = (action: string) => {
    const actionNames: Record<string, string> = {
      'login': 'Inicio de sesión',
      'logout': 'Cierre de sesión',
      'login_failed': 'Inicio fallido',
      'password_changed': 'Contraseña cambiada',
      'profile_updated': 'Perfil actualizado',
      'payment_completed': 'Pago completado',
      'payment_failed': 'Pago fallido',
      'certificate_issued': 'Certificado emitido',
      'qr_code_used': 'QR utilizado',
      'notification_sent': 'Notificación enviada',
      'account_created': 'Cuenta creada',
      'email_verified': 'Email verificado'
    }
    return actionNames[action] || action.replace(/_/g, ' ')
  }

  const stats = {
    total: activities.length,
    success: activities.filter(a => a.status === 'success').length,
    warning: activities.filter(a => a.status === 'warning').length,
    error: activities.filter(a => a.status === 'error').length
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historial de Actividad</h1>
          <p className="text-gray-600 mt-1">
            Revisa todas tus acciones y eventos en la plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaHistory className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaCheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Éxitos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.success}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Advertencias</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.warning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaTimesCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Errores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Buscar en actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="auth">Autenticación</SelectItem>
                  <SelectItem value="profile">Perfil</SelectItem>
                  <SelectItem value="payment">Pagos</SelectItem>
                  <SelectItem value="registration">Registro</SelectItem>
                  <SelectItem value="certificate">Certificados</SelectItem>
                  <SelectItem value="notification">Notificaciones</SelectItem>
                  <SelectItem value="security">Seguridad</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportActivityLog} variant="outline">
                <FaDownload className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Fecha inicio</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Fecha fin</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron actividades</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay actividades que coincidan con los filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getCategoryIcon(activity.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {getActionName(activity.action)}
                          </h3>
                          {getStatusBadge(activity.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <FaCalendarAlt className="mr-1 h-3 w-3" />
                            {new Date(activity.timestamp).toLocaleString('es-GT', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span>{getCategoryName(activity.category)}</span>
                          {activity.location && (
                            <span>{activity.location}</span>
                          )}
                        </div>
                        {activity.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className="mr-4">
                                <strong>{key}:</strong> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        <FaEye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}