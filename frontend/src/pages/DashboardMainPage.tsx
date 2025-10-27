import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaCertificate,
  FaClock,
  FaPlay,
  FaEye,
  FaDownload,
  FaExclamationTriangle
} from 'react-icons/fa'
import { useAuthStore } from '@/stores/authStore'
import { UserService, UserProfile, UserStats } from '@/services/userService'
import DashboardSidebar from '@/components/ui/dashboard-sidebar'
import DashboardHeader from '@/components/ui/dashboard-header'
import StatsCard from '@/components/ui/stats-card'
import ProgressBar from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Event {
  id: number
  title: string
  date: string
  time: string
  modality: 'virtual' | 'presencial' | 'hibrido'
  status: 'confirmed' | 'pending' | 'completed'
  image?: string
}

interface Course {
  id: number
  title: string
  progress: number
  modulesCompleted: number
  totalModules: number
  nextClassDate?: string
  instructor: string
}

const DashboardMainPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [activeCourses, setActiveCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [profile, stats] = await Promise.all([
        UserService.getProfile(),
        UserService.getUserStats()
      ])

      setUserProfile(profile)
      setUserStats(stats)

      // Mock data para eventos y cursos - será reemplazado con llamadas a la API
      setUpcomingEvents([
        {
          id: 1,
          title: 'Taller de Marketing Digital',
          date: '2023-10-25',
          time: '14:00 - 18:00',
          modality: 'virtual',
          status: 'confirmed',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 2,
          title: 'Conferencia Innovación Empresarial',
          date: '2023-11-05',
          time: '09:00 - 17:00',
          modality: 'presencial',
          status: 'confirmed',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
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
          instructor: 'Dra. María López'
        },
        {
          id: 2,
          title: 'Diplomado en Liderazgo',
          progress: 30,
          modulesCompleted: 3,
          totalModules: 10,
          nextClassDate: '2023-10-30',
          instructor: 'Ing. Carlos Ramírez'
        }
      ])
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Error cargando datos del dashboard')
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
                onClick={loadDashboardData}
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
              title="Dashboard Principal"
              subtitle="Resumen de tu actividad en TradeConnect"
            />

            {/* Stats Grid */}
            {userStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Eventos Activos</CardTitle>
                    <FaCalendarAlt className="h-4 w-4 text-[#6B1E22]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#6B1E22]">{userStats.activeEvents}</div>
                    <p className="text-xs text-gray-500">Inscripciones activas</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Eventos Completados</CardTitle>
                    <FaCheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{userStats.completedEvents}</div>
                    <p className="text-xs text-gray-500">Asistidos exitosamente</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Certificados</CardTitle>
                    <FaCertificate className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{userStats.certificates}</div>
                    <p className="text-xs text-gray-500">Obtenidos</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Horas de Formación</CardTitle>
                    <FaClock className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{userStats.trainingHours}h</div>
                    <p className="text-xs text-gray-500">Total acumulado</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* User Info Card */}
            {userProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white overflow-hidden shadow rounded-lg mb-6"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Información del Usuario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                      <dd className="mt-1 text-sm text-gray-900">{UserService.getFullName(userProfile)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userProfile.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Rol Principal</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Badge variant="secondary" className="capitalize">
                          {UserService.getPrimaryRole(userProfile)}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="mt-1 text-sm">
                        <Badge variant={userProfile.isActive ? "default" : "destructive"}>
                          {userProfile.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email Verificado</dt>
                      <dd className="mt-1 text-sm">
                        <Badge variant={userProfile.isEmailVerified ? "default" : "secondary"}>
                          {userProfile.isEmailVerified ? 'Verificado' : 'Pendiente'}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Miembro desde</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(userProfile.createdAt).toLocaleDateString('es-GT')}
                      </dd>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Próximos Eventos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Próximos Eventos</h2>
                <Link to="/dashboard/events">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModalityColor(event.modality)}`}>
                          {getModalityText(event.modality)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p><strong>Fecha:</strong> {formatDate(event.date)}</p>
                        <p><strong>Horario:</strong> {event.time}</p>
                      </div>

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
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/events">
                    <Button className="w-full bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
                      Ver Eventos Disponibles
                    </Button>
                  </Link>
                  <Link to="/dashboard/certificates">
                    <Button variant="outline" className="w-full">
                      Mis Certificados
                    </Button>
                  </Link>
                  <Link to="/dashboard/profile">
                    <Button variant="outline" className="w-full">
                      Editar Perfil
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Progreso de Cursos Activos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Progreso de Cursos Activos</h2>
                <Link to="/dashboard/events">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>

              <div className="space-y-6">
                {activeCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6"
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
                          <FaPlay className="mr-2" />
                          Continuar
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium text-gray-900">{course.progress}%</span>
                      </div>
                      <ProgressBar progress={course.progress} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardMainPage