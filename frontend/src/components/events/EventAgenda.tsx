import React, { useState, useEffect } from 'react'
import { FaClock, FaMapMarkerAlt, FaUser, FaMicrophone, FaCoffee, FaUtensils, FaWifi, FaQuestion } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime } from '@/utils/date'
import { cn } from '@/lib/utils'

// Mock agenda data - in a real app, this would come from an API
interface AgendaItem {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: 'talk' | 'workshop' | 'break' | 'networking' | 'registration' | 'closing'
  speaker?: {
    id: string
    name: string
    title: string
    avatar?: string
    bio?: string
  }
  location?: string
  capacity?: number
  tags?: string[]
  isRequired?: boolean
}

interface EventAgendaProps {
  eventId?: string
  className?: string
}

const mockAgenda: AgendaItem[] = [
  {
    id: '1',
    title: 'Registro y Bienvenida',
    description: 'Recoge tu material y conoce a otros asistentes',
    startTime: new Date('2024-04-15T08:00:00'),
    endTime: new Date('2024-04-15T09:00:00'),
    type: 'registration',
    location: 'Lobby Principal',
    capacity: 150,
    isRequired: true,
  },
  {
    id: '2',
    title: 'Introducción a React 18',
    description: 'Exploraremos las nuevas características de React 18 incluyendo Concurrent Features y Suspense',
    startTime: new Date('2024-04-15T09:00:00'),
    endTime: new Date('2024-04-15T10:30:00'),
    type: 'talk',
    speaker: {
      id: '1',
      name: 'María González',
      title: 'Arquitecta de Software Senior',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
      bio: 'Experta en desarrollo web moderno con más de 10 años de experiencia',
    },
    location: 'Auditorio Principal',
    capacity: 150,
    tags: ['React', 'JavaScript', 'Frontend'],
    isRequired: true,
  },
  {
    id: '3',
    title: 'Break y Networking',
    description: 'Toma un café y conoce a otros desarrolladores',
    startTime: new Date('2024-04-15T10:30:00'),
    endTime: new Date('2024-04-15T11:00:00'),
    type: 'break',
    location: 'Área de Networking',
    capacity: 50,
  },
  {
    id: '4',
    title: 'Concurrent Features en React 18',
    description: 'Profundizaremos en las nuevas APIs de concurrencia y cómo mejorar la UX',
    startTime: new Date('2024-04-15T11:00:00'),
    endTime: new Date('2024-04-15T12:30:00'),
    type: 'workshop',
    speaker: {
      id: '1',
      name: 'María González',
      title: 'Arquitecta de Software Senior',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
    },
    location: 'Sala de Talleres A',
    capacity: 30,
    tags: ['React', 'Concurrent', 'Performance'],
    isRequired: false,
  },
  {
    id: '5',
    title: 'Almuerzo',
    description: 'Disfruta de un almuerzo buffet con opciones vegetarianas',
    startTime: new Date('2024-04-15T12:30:00'),
    endTime: new Date('2024-04-15T14:00:00'),
    type: 'break',
    location: 'Comedor',
    capacity: 150,
  },
  {
    id: '6',
    title: 'Server Components y SSR',
    description: 'Aprende sobre los nuevos Server Components y estrategias de renderizado',
    startTime: new Date('2024-04-15T14:00:00'),
    endTime: new Date('2024-04-15T15:30:00'),
    type: 'talk',
    speaker: {
      id: '1',
      name: 'María González',
      title: 'Arquitecta de Software Senior',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
    },
    location: 'Auditorio Principal',
    capacity: 150,
    tags: ['React', 'SSR', 'Server Components'],
    isRequired: true,
  },
  {
    id: '7',
    title: 'Sesión de Preguntas y Respuestas',
    description: 'Preguntas abiertas sobre React 18 y mejores prácticas',
    startTime: new Date('2024-04-15T15:30:00'),
    endTime: new Date('2024-04-15T16:00:00'),
    type: 'networking',
    speaker: {
      id: '1',
      name: 'María González',
      title: 'Arquitecta de Software Senior',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
    },
    location: 'Auditorio Principal',
    capacity: 150,
  },
  {
    id: '8',
    title: 'Cierre y Certificados',
    description: 'Entrega de certificados y despedida',
    startTime: new Date('2024-04-15T16:00:00'),
    endTime: new Date('2024-04-15T17:00:00'),
    type: 'closing',
    location: 'Auditorio Principal',
    capacity: 150,
    isRequired: true,
  },
]

export const EventAgenda: React.FC<EventAgendaProps> = ({
  eventId = '1',
  className,
}) => {
  const [agenda, setAgenda] = useState<AgendaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null)

  useEffect(() => {
    const loadAgenda = async () => {
      try {
        setIsLoading(true)
        // In a real app, this would be an API call
        // const response = await api.get(`/events/${eventId}/agenda`)
        // setAgenda(response.data)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setAgenda(mockAgenda)
      } catch (error) {
        console.error('Error loading agenda:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAgenda()
  }, [eventId])

  const getTypeIcon = (type: AgendaItem['type']) => {
    switch (type) {
      case 'talk':
        return <FaMicrophone className="h-4 w-4" />
      case 'workshop':
        return <FaUser className="h-4 w-4" />
      case 'break':
        return <FaCoffee className="h-4 w-4" />
      case 'networking':
        return <FaWifi className="h-4 w-4" />
      case 'registration':
        return <FaUser className="h-4 w-4" />
      case 'closing':
        return <FaQuestion className="h-4 w-4" />
      default:
        return <FaClock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: AgendaItem['type']) => {
    switch (type) {
      case 'talk':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'workshop':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'break':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'networking':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'registration':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'closing':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: AgendaItem['type']) => {
    switch (type) {
      case 'talk':
        return 'Charla'
      case 'workshop':
        return 'Taller'
      case 'break':
        return 'Descanso'
      case 'networking':
        return 'Networking'
      case 'registration':
        return 'Registro'
      case 'closing':
        return 'Cierre'
      default:
        return type
    }
  }

  const formatDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }
    return `${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando agenda del evento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda del Evento</h1>
          <p className="text-gray-600 mt-1">Programa completo del evento con horarios y actividades</p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Agenda Content */}
      {viewMode === 'timeline' ? (
        <div className="space-y-4">
          {agenda.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline line */}
              {index < agenda.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200" />
              )}

              <div className="flex items-start space-x-4">
                {/* Time */}
                <div className="flex-shrink-0 w-24 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDateTime(item.startTime).split(' ')[1]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDuration(item.startTime, item.endTime)}
                  </div>
                </div>

                {/* Timeline dot */}
                <div className={cn(
                  'flex-shrink-0 w-3 h-3 rounded-full border-2 border-white shadow-sm mt-2',
                  item.type === 'talk' ? 'bg-blue-500' :
                  item.type === 'workshop' ? 'bg-green-500' :
                  item.type === 'break' ? 'bg-orange-500' :
                  item.type === 'networking' ? 'bg-purple-500' :
                  'bg-gray-500'
                )} />

                {/* Content */}
                <Card className="flex-1 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedItem(item)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={cn(
                            'p-2 rounded-lg border',
                            getTypeColor(item.type)
                          )}>
                            {getTypeIcon(item.type)}
                          </div>

                          <div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(item.type)}
                              </Badge>
                              {item.isRequired && (
                                <Badge variant="secondary" className="text-xs">
                                  Obligatorio
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {item.location && (
                            <div className="flex items-center space-x-1">
                              <FaMapMarkerAlt className="h-4 w-4" />
                              <span>{item.location}</span>
                            </div>
                          )}

                          {item.capacity && (
                            <div className="flex items-center space-x-1">
                              <FaUser className="h-4 w-4" />
                              <span>Capacidad: {item.capacity}</span>
                            </div>
                          )}

                          {item.speaker && (
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={item.speaker.avatar} alt={item.speaker.name} />
                                <AvatarFallback className="text-xs">
                                  {item.speaker.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{item.speaker.name}</span>
                            </div>
                          )}
                        </div>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {agenda.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedItem(item)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      'p-3 rounded-lg border',
                      getTypeColor(item.type)
                    )}>
                      {getTypeIcon(item.type)}
                    </div>

                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">
                          {formatDateTime(item.startTime).split(' ')[1]} - {formatDateTime(item.endTime).split(' ')[1]}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(item.type)}
                        </Badge>
                        {item.isRequired && (
                          <Badge variant="secondary" className="text-xs">
                            Obligatorio
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    {item.location && (
                      <div className="flex items-center space-x-1 justify-end mb-1">
                        <FaMapMarkerAlt className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    {item.speaker && (
                      <div className="flex items-center space-x-2 justify-end">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={item.speaker.avatar} alt={item.speaker.name} />
                          <AvatarFallback className="text-xs">
                            {item.speaker.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{item.speaker.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'p-2 rounded-lg border',
                    getTypeColor(selectedItem.type)
                  )}>
                    {getTypeIcon(selectedItem.type)}
                  </div>
                  <div>
                    <CardTitle>{selectedItem.title}</CardTitle>
                    <CardDescription>
                      {formatDateTime(selectedItem.startTime).split(' ')[1]} - {formatDateTime(selectedItem.endTime).split(' ')[1]}
                      ({formatDuration(selectedItem.startTime, selectedItem.endTime)})
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {selectedItem.description && (
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedItem.location && (
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedItem.location}</span>
                  </div>
                )}

                {selectedItem.capacity && (
                  <div className="flex items-center space-x-2">
                    <FaUser className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Capacidad: {selectedItem.capacity} personas</span>
                  </div>
                )}
              </div>

              {selectedItem.speaker && (
                <div>
                  <h4 className="font-medium mb-2">Speaker</h4>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedItem.speaker.avatar} alt={selectedItem.speaker.name} />
                      <AvatarFallback>
                        {selectedItem.speaker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedItem.speaker.name}</p>
                      <p className="text-sm text-gray-600">{selectedItem.speaker.title}</p>
                      {selectedItem.speaker.bio && (
                        <p className="text-sm text-gray-500 mt-1">{selectedItem.speaker.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}