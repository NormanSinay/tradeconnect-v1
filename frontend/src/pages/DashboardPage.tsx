import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/ui/dashboard-layout'
import StatsCard from '@/components/ui/stats-card'
import EventCard from '@/components/ui/event-card'
import ProgressBar from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { FaCalendarAlt, FaCheckCircle, FaCertificate, FaClock, FaExclamationTriangle, FaUser } from 'react-icons/fa'

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const {
    stats,
    upcomingEvents,
    activeCourses,
    fetchStats,
    fetchEvents,
    isLoading,
    error
  } = useUserStore()

  useEffect(() => {
    fetchStats()
    fetchEvents()
  }, [fetchStats, fetchEvents])

  if (isLoading && !stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <FaExclamationTriangle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error al cargar el dashboard</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                fetchStats()
                fetchEvents()
              }}
              className="bg-[#6B1E22] text-white px-4 py-2 rounded-lg hover:bg-[#8a2b30] transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="mt-2 text-gray-600">Resumen de tu actividad en TradeConnect</p>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Mostrar diferentes métricas según el rol */}
              {user?.role === 'participant' || user?.role === 'speaker' ? (
                <>
                  <StatsCard
                    title="Eventos Activos"
                    value={stats.activeEvents}
                    icon={<FaCalendarAlt />}
                    description="Eventos en los que estás inscrito"
                  />
                  <StatsCard
                    title="Eventos Completados"
                    value={stats.completedEvents}
                    icon={<FaCheckCircle />}
                    description="Eventos finalizados exitosamente"
                  />
                  <StatsCard
                    title="Certificados"
                    value={stats.certificates}
                    icon={<FaCertificate />}
                    description="Certificados obtenidos"
                  />
                  <StatsCard
                    title="Horas de Formación"
                    value={`${stats.trainingHours}h`}
                    icon={<FaClock />}
                    description="Tiempo total de capacitación"
                  />
                </>
              ) : (
                <>
                  <StatsCard
                    title="Estado de Cuenta"
                    value="Activa"
                    icon={<FaCheckCircle />}
                    description="Tu cuenta está activa"
                  />
                  <StatsCard
                    title="Tipo de Usuario"
                    value={user?.role === 'user' ? 'Regular' : user?.role || 'Usuario'}
                    icon={<FaUser />}
                    description="Tu rol en la plataforma"
                  />
                  <StatsCard
                    title="Email Verificado"
                    value="Sí"
                    icon={<FaCheckCircle />}
                    description="Tu email está verificado"
                  />
                  <StatsCard
                    title="Último Acceso"
                    value="Hoy"
                    icon={<FaClock />}
                    description="Tu última conexión"
                  />
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Próximos Eventos - Solo para participantes y speakers */}
        {(user?.role === 'participant' || user?.role === 'speaker') && upcomingEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Próximos Eventos</h2>
              <Link
                to="/dashboard/events"
                className="text-[#6B1E22] hover:text-[#8a2b30] font-medium transition-colors"
              >
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  onViewDetails={() => {
                    // TODO: Implementar navegación a detalles del evento
                    console.log('Ver detalles del evento:', event.id)
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Progreso de Cursos Activos - Solo para participantes y speakers */}
        {(user?.role === 'participant' || user?.role === 'speaker') && activeCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Progreso de Cursos Activos</h2>
              <Link
                to="/dashboard/events"
                className="text-[#6B1E22] hover:text-[#8a2b30] font-medium transition-colors"
              >
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {course.description}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      En Progreso
                    </span>
                  </div>

                  {course.progress !== undefined && (
                    <div className="mb-4">
                      <ProgressBar progress={course.progress} />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Módulos: 8/12 completados</span>
                    <span>Próxima clase: {course.date ? new Date(course.date).toLocaleDateString('es-GT') : 'Por definir'}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // TODO: Implementar navegación a detalles del curso
                        console.log('Ver detalles del curso:', course.id)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implementar continuar curso
                        console.log('Continuar curso:', course.id)
                      }}
                      className="flex-1 px-4 py-2 bg-[#6B1E22] text-white rounded-lg hover:bg-[#8a2b30] transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State - Solo mostrar para participantes y speakers */}
        {(user?.role === 'participant' || user?.role === 'speaker') &&
         upcomingEvents.length === 0 && activeCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center py-12"
          >
            <FaCalendarAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No tienes eventos próximos
            </h3>
            <p className="text-gray-600 mb-6">
              Explora nuestros eventos y cursos disponibles para continuar tu formación.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center px-6 py-3 bg-[#6B1E22] text-white rounded-lg hover:bg-[#8a2b30] transition-colors font-medium"
            >
              Explorar Eventos
            </Link>
          </motion.div>
        )}

        {/* Welcome message for non-participants */}
        {user?.role !== 'participant' && user?.role !== 'speaker' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center py-12"
          >
            <FaUser className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              ¡Bienvenido a TradeConnect!
            </h3>
            <p className="text-gray-600 mb-6">
              Tu cuenta está activa. Explora la plataforma y descubre todas las funcionalidades disponibles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/events">
                <Button variant="outline">
                  Ver Eventos Disponibles
                </Button>
              </Link>
              <Link to="/dashboard/profile">
                <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
                  Completar Mi Perfil
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage