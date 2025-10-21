import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaCertificate, FaQrcode, FaCreditCard, FaBell, FaUser, FaCog, FaChartLine, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'

interface DashboardStats {
  upcomingEvents: number
  totalCertificates: number
  activeQRCodes: number
  pendingPayments: number
  unreadNotifications: number
}

interface UpcomingEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

interface RecentActivity {
  id: string
  type: 'registration' | 'payment' | 'certificate' | 'notification'
  title: string
  description: string
  date: string
  status?: 'success' | 'pending' | 'failed'
}

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    upcomingEvents: 0,
    totalCertificates: 0,
    activeQRCodes: 0,
    pendingPayments: 0,
    unreadNotifications: 0
  })
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // In a real app, you would call your API
      // const response = await api.get('/user/dashboard')

      // Mock data for dashboard
      const mockStats: DashboardStats = {
        upcomingEvents: 3,
        totalCertificates: 8,
        activeQRCodes: 5,
        pendingPayments: 1,
        unreadNotifications: 2
      }

      const mockUpcomingEvents: UpcomingEvent[] = [
        {
          id: '1',
          title: 'Conferencia Anual de Innovación Tecnológica',
          date: '2024-02-15',
          time: '09:00',
          location: 'Centro de Convenciones, Ciudad de Guatemala',
          status: 'confirmed'
        },
        {
          id: '2',
          title: 'Taller de Marketing Digital para Emprendedores',
          date: '2024-03-20',
          time: '14:00',
          location: 'Hotel Marriott, Zona 10',
          status: 'confirmed'
        },
        {
          id: '3',
          title: 'Seminario de Finanzas Personales',
          date: '2024-04-10',
          time: '10:00',
          location: 'Centro Empresarial, Zona 4',
          status: 'pending'
        }
      ]

      const mockRecentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'registration',
          title: 'Inscripción confirmada',
          description: 'Te has inscrito exitosamente al evento "Conferencia Anual de Innovación Tecnológica"',
          date: '2024-01-15T10:30:00Z',
          status: 'success'
        },
        {
          id: '2',
          type: 'certificate',
          title: 'Certificado emitido',
          description: 'Se ha emitido tu certificado para "Taller de Liderazgo Empresarial"',
          date: '2024-01-12T16:45:00Z',
          status: 'success'
        },
        {
          id: '3',
          type: 'payment',
          title: 'Pago pendiente',
          description: 'Tienes un pago pendiente por Q150.00 del evento "Seminario de Finanzas"',
          date: '2024-01-10T09:15:00Z',
          status: 'pending'
        },
        {
          id: '4',
          type: 'notification',
          title: 'Recordatorio de evento',
          description: 'El evento "Conferencia Anual" comienza en 2 días',
          date: '2024-01-13T08:00:00Z'
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStats(mockStats)
      setUpcomingEvents(mockUpcomingEvents)
      setRecentActivity(mockRecentActivity)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <FaCalendarAlt className="h-4 w-4 text-blue-500" />
      case 'payment':
        return <FaCreditCard className="h-4 w-4 text-green-500" />
      case 'certificate':
        return <FaCertificate className="h-4 w-4 text-purple-500" />
      case 'notification':
        return <FaBell className="h-4 w-4 text-orange-500" />
      default:
        return <FaBell className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Hola, {user?.name?.split(' ')[0] || 'Usuario'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido de vuelta a tu panel de control
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/mis-eventos/proximos')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.upcomingEvents}</p>
                  <p className="text-sm text-gray-600">Próximos eventos</p>
                </div>
                <FaCalendarAlt className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/mis-certificados')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCertificates}</p>
                  <p className="text-sm text-gray-600">Certificados</p>
                </div>
                <FaCertificate className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/mis-codigos-qr')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.activeQRCodes}</p>
                  <p className="text-sm text-gray-600">Códigos QR activos</p>
                </div>
                <FaQrcode className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/mis-pagos')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</p>
                  <p className="text-sm text-gray-600">Pagos pendientes</p>
                </div>
                <FaCreditCard className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/mi-cuenta/notificaciones')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.unreadNotifications}</p>
                  <p className="text-sm text-gray-600">Notificaciones</p>
                </div>
                <FaBell className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Próximos Eventos</CardTitle>
                  <CardDescription>
                    Eventos en los que estás inscrito
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/mis-eventos/proximos')}>
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No tienes eventos próximos
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h4>
                        <Badge
                          className={
                            event.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {event.status === 'confirmed' ? 'Confirmado' :
                           event.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 h-3 w-3" />
                          {formatDate(event.date)} a las {event.time}
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 h-3 w-3" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>
                    Tus últimas acciones en la plataforma
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/mi-cuenta')}>
                  Ver todo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No hay actividad reciente
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString('es-GT', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {activity.status && (
                          <Badge
                            className={`mt-1 text-xs ${
                              activity.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : activity.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {activity.status === 'success' ? 'Completado' :
                             activity.status === 'pending' ? 'Pendiente' : 'Fallido'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/mi-cuenta/perfil')}
              >
                <FaUser className="h-6 w-6" />
                <span className="text-sm">Editar Perfil</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/mi-cuenta/seguridad')}
              >
                <FaCog className="h-6 w-6" />
                <span className="text-sm">Seguridad</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/mis-certificados')}
              >
                <FaCertificate className="h-6 w-6" />
                <span className="text-sm">Certificados</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/mis-codigos-qr')}
              >
                <FaQrcode className="h-6 w-6" />
                <span className="text-sm">Mis QR</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}