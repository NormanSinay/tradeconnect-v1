import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/ui/dashboard-layout'
import EventCard from '@/components/ui/event-card'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/userStore'
import { FaCalendarAlt, FaPlay, FaCheckCircle, FaHistory, FaExclamationTriangle } from 'react-icons/fa'

type TabType = 'upcoming' | 'active' | 'completed' | 'past'

const DashboardEventsPage: React.FC = () => {
  const {
    upcomingEvents,
    activeCourses,
    pastEvents,
    fetchEvents,
    isLoading,
    error
  } = useUserStore()

  const [activeTab, setActiveTab] = useState<TabType>('upcoming')

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const tabs = [
    { id: 'upcoming' as TabType, label: 'Próximos', icon: FaCalendarAlt, count: upcomingEvents.length },
    { id: 'active' as TabType, label: 'En Curso', icon: FaPlay, count: activeCourses.length },
    { id: 'completed' as TabType, label: 'Completados', icon: FaCheckCircle, count: 0 },
    { id: 'past' as TabType, label: 'Pasados', icon: FaHistory, count: pastEvents.length },
  ]

  const getEventsForTab = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingEvents
      case 'active':
        return activeCourses
      case 'completed':
        return [] // TODO: Implementar cuando se tenga el endpoint
      case 'past':
        return pastEvents
      default:
        return []
    }
  }

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'upcoming':
        return {
          title: 'No tienes eventos próximos',
          description: 'No hay eventos programados en tu calendario.',
          action: 'Explorar Eventos'
        }
      case 'active':
        return {
          title: 'No tienes cursos activos',
          description: 'No tienes cursos en progreso actualmente.',
          action: 'Ver Todos los Cursos'
        }
      case 'completed':
        return {
          title: 'No hay eventos completados',
          description: 'Aún no has completado ningún evento.',
          action: null
        }
      case 'past':
        return {
          title: 'No hay eventos pasados',
          description: 'No tienes historial de eventos anteriores.',
          action: null
        }
      default:
        return {
          title: 'No hay eventos',
          description: 'No se encontraron eventos en esta categoría.',
          action: null
        }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando eventos...</p>
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
              <p className="text-lg font-medium">Error al cargar los eventos</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={fetchEvents}
              className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const events = getEventsForTab()
  const emptyState = getEmptyStateMessage()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Mis Eventos y Cursos</h1>
          <p className="mt-2 text-gray-600">Gestiona tu participación en eventos y cursos</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#6B1E22] text-[#6B1E22]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                        activeTab === tab.id
                          ? 'bg-[#6B1E22] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {events.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    onViewDetails={() => {
                      // TODO: Implementar navegación a detalles del evento
                      console.log('Ver detalles del evento:', event.id)
                    }}
                    onContinue={event.type === 'course' && event.progress !== undefined && event.progress < 100 ? () => {
                      // TODO: Implementar continuar curso
                      console.log('Continuar curso:', event.id)
                    } : undefined}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 mb-4">
                  {activeTab === 'upcoming' && <FaCalendarAlt className="h-16 w-16 mx-auto" />}
                  {activeTab === 'active' && <FaPlay className="h-16 w-16 mx-auto" />}
                  {activeTab === 'completed' && <FaCheckCircle className="h-16 w-16 mx-auto" />}
                  {activeTab === 'past' && <FaHistory className="h-16 w-16 mx-auto" />}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {emptyState.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {emptyState.description}
                </p>
                {emptyState.action && (
                  <Button
                    onClick={() => {
                      // TODO: Implementar navegación según el tab
                      if (activeTab === 'upcoming') {
                        window.location.href = '/events'
                      }
                    }}
                    className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
                  >
                    {emptyState.action}
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardEventsPage