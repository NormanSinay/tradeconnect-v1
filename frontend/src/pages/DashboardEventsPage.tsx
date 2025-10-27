import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaDownload,
  FaExclamationTriangle,
  FaFilter
} from 'react-icons/fa'
import { useAuthStore } from '@/stores/authStore'
import { UserService, UserProfile } from '@/services/userService'
import DashboardSidebar from '@/components/ui/dashboard-sidebar'
import DashboardHeader from '@/components/ui/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Event {
  id: number
  title: string
  date: string
  time: string
  modality: 'virtual' | 'presencial' | 'hibrido'
  status: 'confirmed' | 'pending' | 'completed'
  image?: string
  description?: string
  location?: string
  instructor?: string
  progress?: number
}

interface Course {
  id: number
  title: string
  progress: number
  modulesCompleted: number
  totalModules: number
  nextClassDate?: string
  instructor: string
  status: 'active' | 'completed' | 'paused'
}

const DashboardEventsPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [activeCourses, setActiveCourses] = useState<Course[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadEventsData()
    }
  }, [isAuthenticated])

  const loadEventsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener perfil del usuario
      const profile = await UserService.getProfile()
      setUserProfile(profile)

      // Mock data - será reemplazado con llamadas a la API reales
      setUpcomingEvents([
        {
          id: 1,
          title: 'Taller de Marketing Digital',
          date: '2023-10-25',
          time: '14:00 - 18:00',
          modality: 'virtual',
          status: 'confirmed',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          description: 'Aprende estrategias efectivas de marketing digital para impulsar tu negocio.',
          location: 'Plataforma Zoom',
          instructor: 'María González'
        },
        {
          id: 2,
          title: 'Conferencia Innovación Empresarial',
          date: '2023-11-05',
          time: '09:00 - 17:00',
          modality: 'presencial',
          status: 'confirmed',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          description: 'Evento anual que reúne a los principales líderes empresariales.',
          location: 'Hotel Marriott, Ciudad de Guatemala',
          instructor: 'Carlos Rodríguez'
        }
      ])

      setActiveCourses([
        {
          id: 1,
          title: 'Curso de Gestión Empresarial',
          progress: 65,
          modulesCompleted: 8,
          totalModules: 12,
          nextClassDate: '2023-10-28',
          instructor: 'Dra. María López',
          status: 'active'
        },
        {
          id: 2,
          title: 'Diplomado en Liderazgo',
          progress: 30,
          modulesCompleted: 3,
          totalModules: 10,
          nextClassDate: '2023-10-30',
          instructor: 'Ing. Carlos Ramírez',
          status: 'active'
        }
      ])

      setCompletedEvents([
        {
          id: 3,
          title: 'Taller de Finanzas Personales',
          date: '2023-08-15',
          time: '14:00 - 18:00',
          modality: 'virtual',
          status: 'completed',
          description: 'Aprende a gestionar tus finanzas personales de manera efectiva.',
          instructor: 'Ana Martínez'
        }
      ])

      setPastEvents([
        {
          id: 4,
          title: 'Conferencia de Tecnología',
          date: '2023-07-22',
          time: '09:00 - 17:00',
          modality: 'presencial',
          status: 'completed',
          description: 'Explora las últimas tendencias en tecnología empresarial.',
          instructor: 'Dr. Roberto Sánchez'
        },
        {
          id: 5,
          title: 'Curso de Ventas',
          date: '2023-06-10',
          time: '08:00 - 12:00',
          modality: 'virtual',
          status: 'completed',
          description: 'Desarrolla técnicas avanzadas de ventas y negociación.',
          instructor: 'Luis Hernández'
        }
      ])
    } catch (err) {
      console.error('Error loading events data:', err)
      setError(err instanceof Error ? err.message : 'Error cargando datos de eventos')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getModalityText = (modality: string) => {
    switch (modality) {
      case 'virtual': return 'Virtual'
      case 'presencial': return 'Presencial'
      case 'hibrido': return 'Híbrido'
      default: return modality
    }
  }

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case 'virtual': return 'text-blue-600 bg-blue-100'
      case 'presencial': return 'text-green-600 bg-green-100'
      case 'hibrido': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado'
      case 'pending': return 'Pendiente'
      case 'completed': return 'Completado'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder al dashboard.</p>
          <Link to="/login">
            <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Cargando...</span>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22]"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Bienvenido, {user?.name}</span>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Alert className="border-red-200 bg-red-50">
            <FaExclamationTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button
                onClick={loadEventsData}
                variant="outline"
                size="sm"
                className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {UserService.getFullName(userProfile)}</span>
              <Button
                onClick={logout}
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <DashboardHeader
              title="Mis Eventos y Cursos"
              subtitle="Gestiona tu participación en eventos y cursos"
            />

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                <TabsTrigger value="active">En Curso</TabsTrigger>
                <TabsTrigger value="completed">Completados</TabsTrigger>
                <TabsTrigger value="past">Pasados</TabsTrigger>
              </TabsList>

              {/* Próximos Eventos */}
              <TabsContent value="upcoming" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModalityColor(event.modality)}`}>
                              {getModalityText(event.modality)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {getStatusText(event.status)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Fecha:</strong> {formatDate(event.date)}</p>
                          <p><strong>Horario:</strong> {event.time}</p>
                          {event.location && <p><strong>Lugar:</strong> {event.location}</p>}
                          {event.instructor && <p><strong>Instructor:</strong> {event.instructor}</p>}
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30]">
                            <FaEye className="mr-2" />
                            Ver Detalles
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <FaDownload className="mr-2" />
                            Ticket
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {upcomingEvents.length === 0 && (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos próximos</h3>
                    <p className="text-gray-600 mb-4">No tienes eventos confirmados próximamente.</p>
                    <Link to="/events">
                      <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
                        Explorar Eventos Disponibles
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              {/* Cursos Activos */}
              <TabsContent value="active" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {activeCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6 bg-white"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Instructor: {course.instructor}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Módulos: {course.modulesCompleted}/{course.totalModules}</span>
                            {course.nextClassDate && (
                              <span>Próxima clase: {formatDate(course.nextClassDate)}</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6">
                          <Button className="w-full lg:w-auto bg-[#6B1E22] hover:bg-[#8a2b30]">
                            <FaClock className="mr-2" />
                            Continuar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progreso</span>
                          <span className="font-medium text-gray-900">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#6B1E22] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {activeCourses.length === 0 && (
                  <div className="text-center py-12">
                    <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos activos</h3>
                    <p className="text-gray-600 mb-4">No tienes cursos en progreso actualmente.</p>
                    <Link to="/events">
                      <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
                        Explorar Cursos Disponibles
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              {/* Eventos Completados */}
              <TabsContent value="completed" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {completedEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Completado
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p><strong>Fecha:</strong> {formatDate(event.date)}</p>
                        <p><strong>Horario:</strong> {event.time}</p>
                        {event.instructor && <p><strong>Instructor:</strong> {event.instructor}</p>}
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <FaEye className="mr-2" />
                          Ver Detalles
                        </Button>
                        <Button size="sm" className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30]">
                          <FaDownload className="mr-2" />
                          Certificado
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {completedEvents.length === 0 && (
                  <div className="text-center py-12">
                    <FaCheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos completados</h3>
                    <p className="text-gray-600">Aún no has completado ningún evento.</p>
                  </div>
                )}
              </TabsContent>

              {/* Eventos Pasados */}
              <TabsContent value="past" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-x-auto"
                >
                  <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Evento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Modalidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pastEvents.map((event, index) => (
                        <motion.tr
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            {event.instructor && (
                              <div className="text-sm text-gray-500">{event.instructor}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModalityColor(event.modality)}`}>
                              {getModalityText(event.modality)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              Completado
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <FaEye className="mr-1" />
                                Ver
                              </Button>
                              <Button size="sm" className="bg-[#6B1E22] hover:bg-[#8a2b30]">
                                <FaDownload className="mr-1" />
                                Certificado
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>

                {pastEvents.length === 0 && (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos pasados</h3>
                    <p className="text-gray-600">No tienes historial de eventos anteriores.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardEventsPage