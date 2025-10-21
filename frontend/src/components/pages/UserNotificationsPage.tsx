import React, { useState, useEffect } from 'react'
import { FaBell, FaEnvelope, FaSms, FaMobileAlt, FaToggleOn, FaToggleOff, FaSave, FaCheckCircle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface NotificationPreferences {
  email: {
    eventReminders: boolean
    certificateIssued: boolean
    paymentConfirmations: boolean
    accountUpdates: boolean
    marketing: boolean
    systemNotifications: boolean
  }
  sms: {
    eventReminders: boolean
    paymentConfirmations: boolean
    securityAlerts: boolean
  }
  push: {
    eventReminders: boolean
    certificateIssued: boolean
    paymentConfirmations: boolean
    systemNotifications: boolean
  }
}

interface NotificationHistory {
  id: string
  type: 'email' | 'sms' | 'push'
  title: string
  message: string
  sentAt: string
  status: 'sent' | 'delivered' | 'failed'
  read: boolean
}

export const UserNotificationsPage: React.FC = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      eventReminders: true,
      certificateIssued: true,
      paymentConfirmations: true,
      accountUpdates: true,
      marketing: false,
      systemNotifications: true
    },
    sms: {
      eventReminders: false,
      paymentConfirmations: true,
      securityAlerts: true
    },
    push: {
      eventReminders: true,
      certificateIssued: true,
      paymentConfirmations: true,
      systemNotifications: true
    }
  })
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    fetchNotificationData()
  }, [])

  const fetchNotificationData = async () => {
    try {
      // In a real app, you would call your API
      // const response = await api.get('/user/notifications')

      // Mock notification history
      const mockHistory: NotificationHistory[] = [
        {
          id: '1',
          type: 'email',
          title: 'Recordatorio de evento',
          message: 'El evento "Conferencia Anual de Innovación Tecnológica" comienza en 2 días',
          sentAt: '2024-01-20T09:00:00Z',
          status: 'delivered',
          read: true
        },
        {
          id: '2',
          type: 'push',
          title: 'Certificado emitido',
          message: 'Se ha emitido tu certificado para "Taller de Liderazgo Empresarial"',
          sentAt: '2024-01-18T14:30:00Z',
          status: 'delivered',
          read: false
        },
        {
          id: '3',
          type: 'sms',
          title: 'Pago confirmado',
          message: 'Tu pago de Q150.00 ha sido procesado exitosamente',
          sentAt: '2024-01-15T11:15:00Z',
          status: 'delivered',
          read: true
        },
        {
          id: '4',
          type: 'email',
          title: 'Actualización de cuenta',
          message: 'Tu perfil ha sido actualizado exitosamente',
          sentAt: '2024-01-12T16:45:00Z',
          status: 'sent',
          read: true
        }
      ]

      setHistory(mockHistory)
    } catch (error) {
      console.error('Error fetching notification data:', error)
    }
  }

  const updatePreference = (channel: keyof NotificationPreferences, key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const savePreferences = async () => {
    try {
      setIsLoading(true)

      // In a real app, you would call your API
      // const response = await api.put('/user/notifications/preferences', preferences)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      showToast.success('Preferencias de notificación guardadas exitosamente')
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving preferences:', error)
      showToast.error('Error al guardar las preferencias')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // In a real app, you would call your API
      // const response = await api.put(`/user/notifications/${notificationId}/read`)

      setHistory(prev => prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ))

      showToast.success('Notificación marcada como leída')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      showToast.error('Error al marcar la notificación como leída')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <FaEnvelope className="h-4 w-4 text-blue-500" />
      case 'sms':
        return <FaSms className="h-4 w-4 text-green-500" />
      case 'push':
        return <FaMobileAlt className="h-4 w-4 text-purple-500" />
      default:
        return <FaBell className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Entregado</Badge>
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Enviado</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const notificationCategories = [
    {
      title: 'Recordatorios de Eventos',
      description: 'Notificaciones sobre eventos próximos y cambios de horario',
      email: 'eventReminders',
      sms: 'eventReminders',
      push: 'eventReminders'
    },
    {
      title: 'Certificados Emitidos',
      description: 'Cuando se emite un nuevo certificado de participación',
      email: 'certificateIssued',
      sms: null,
      push: 'certificateIssued'
    },
    {
      title: 'Confirmaciones de Pago',
      description: 'Confirmación de pagos procesados y recibos',
      email: 'paymentConfirmations',
      sms: 'paymentConfirmations',
      push: 'paymentConfirmations'
    },
    {
      title: 'Actualizaciones de Cuenta',
      description: 'Cambios en tu perfil y configuración de seguridad',
      email: 'accountUpdates',
      sms: null,
      push: null
    },
    {
      title: 'Alertas de Seguridad',
      description: 'Intentos de inicio de sesión y cambios de seguridad',
      email: null,
      sms: 'securityAlerts',
      push: null
    },
    {
      title: 'Notificaciones del Sistema',
      description: 'Mantenimiento, actualizaciones y anuncios importantes',
      email: 'systemNotifications',
      sms: null,
      push: 'systemNotifications'
    },
    {
      title: 'Marketing y Promociones',
      description: 'Ofertas especiales, nuevos eventos y contenido promocional',
      email: 'marketing',
      sms: null,
      push: null
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preferencias de Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona cómo y cuándo quieres recibir notificaciones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preferences */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Configuración de Notificaciones</span>
                  {hasUnsavedChanges && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Cambios sin guardar
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Elige qué tipos de notificaciones quieres recibir por cada canal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationCategories.map((category, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Email */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Email</span>
                        </div>
                        {category.email ? (
                          <Switch
                            checked={preferences.email[category.email as keyof typeof preferences.email]}
                            onCheckedChange={(checked) =>
                              updatePreference('email', category.email!, checked)
                            }
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No disponible</span>
                        )}
                      </div>

                      {/* SMS */}
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FaSms className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">SMS</span>
                        </div>
                        {category.sms ? (
                          <Switch
                            checked={preferences.sms[category.sms as keyof typeof preferences.sms]}
                            onCheckedChange={(checked) =>
                              updatePreference('sms', category.sms!, checked)
                            }
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No disponible</span>
                        )}
                      </div>

                      {/* Push */}
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FaMobileAlt className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Push</span>
                        </div>
                        {category.push ? (
                          <Switch
                            checked={preferences.push[category.push as keyof typeof preferences.push]}
                            onCheckedChange={(checked) =>
                              updatePreference('push', category.push!, checked)
                            }
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No disponible</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {hasUnsavedChanges && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={savePreferences} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2 h-4 w-4" />
                          Guardar Preferencias
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notification History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Historial de Notificaciones</CardTitle>
                <CardDescription>
                  Tus notificaciones recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">
                    No hay notificaciones recientes
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.read
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getNotificationIcon(notification.type)}
                            <span className="text-sm font-medium capitalize">
                              {notification.type}
                            </span>
                          </div>
                          {getStatusBadge(notification.status)}
                        </div>

                        <h4 className={`text-sm font-medium mb-1 ${
                          notification.read ? 'text-gray-900' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </h4>

                        <p className={`text-xs mb-2 ${
                          notification.read ? 'text-gray-600' : 'text-blue-700'
                        }`}>
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.sentAt).toLocaleDateString('es-GT', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {!notification.read && (
                            <FaCheckCircle className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}

                    {history.length > 5 && (
                      <Button variant="outline" className="w-full">
                        Ver todas las notificaciones
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">No leídas</span>
                    <Badge className="bg-red-100 text-red-800">
                      {history.filter(n => !n.read).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Esta semana</span>
                    <span className="text-sm font-medium">
                      {history.filter(n =>
                        new Date(n.sentAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Entregadas</span>
                    <span className="text-sm font-medium text-green-600">
                      {history.filter(n => n.status === 'delivered').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}