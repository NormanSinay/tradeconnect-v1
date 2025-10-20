import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaStar, FaClock, FaFilter, FaSearch } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatEventDate, formatDateTime } from '@/utils/date'
import { showToast } from '@/utils/toast'
import { cn } from '@/lib/utils'

// Mock event data for speaker - in a real app, this would come from an API
interface SpeakerEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  capacity: number
  registeredCount: number
  price: number
  status: 'upcoming' | 'completed' | 'cancelled'
  rating: number
  reviewCount: number
  imageUrl?: string
  tags: string[]
  attendees: Array<{
    id: string
    name: string
    avatar?: string
    registeredAt: Date
  }>
}

const mockSpeakerEvents: SpeakerEvent[] = [
  {
    id: '1',
    title: 'Introducción a React 18 y Nuevas Características',
    description: 'Aprende sobre las últimas novedades de React 18, incluyendo Concurrent Features, Suspense, y las nuevas APIs.',
    startDate: new Date('2024-04-15T09:00:00'),
    endDate: new Date('2024-04-15T17:00:00'),
    location: 'Centro Cultural Miguel Ángel Asturias, Guatemala City',
    capacity: 150,
    registeredCount: 120,
    price: 150.00,
    status: 'upcoming',
    rating: 4.9,
    reviewCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    attendees: [
      {
        id: '1',
        name: 'Carlos Rodríguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        registeredAt: new Date('2024-03-01'),
      },
      {
        id: '2',
        name: 'Ana López',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        registeredAt: new Date('2024-03-05'),
      },
    ],
  },
  {
    id: '2',
    title: 'Arquitecturas de Microservicios con Node.js',
    description: 'Explora cómo diseñar y implementar arquitecturas de microservicios escalables usando Node.js y contenedores.',
    startDate: new Date('2024-03-20T14:00:00'),
    endDate: new Date('2024-03-20T18:00:00'),
    location: 'Hotel Marriott, Zona 10',
    capacity: 100,
    registeredCount: 85,
    price: 200.00,
    status: 'upcoming',
    rating: 4.7,
    reviewCount: 32,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
    tags: ['Node.js', 'Microservicios', 'Backend', 'Docker'],
    attendees: [],
  },
  {
    id: '3',
    title: 'TypeScript Avanzado: Patrones y Mejores Prácticas',
    description: 'Domina TypeScript con patrones avanzados, tipos condicionales, y técnicas para código más robusto.',
    startDate: new Date('2024-02-10T09:00:00'),
    endDate: new Date('2024-02-10T13:00:00'),
    location: 'Universidad Francisco Marroquín',
    capacity: 80,
    registeredCount: 80,
    price: 120.00,
    status: 'completed',
    rating: 4.8,
    reviewCount: 28,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
    tags: ['TypeScript', 'JavaScript', 'Programación', 'Best Practices'],
    attendees: [],
  },
]

interface SpeakerEventsPageProps {
  speakerId?: string
  className?: string
}

export const SpeakerEventsPage: React.FC<SpeakerEventsPageProps> = ({
  speakerId = '1',
  className,
}) => {
  const [events, setEvents] = useState<SpeakerEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<SpeakerEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')

  // Load speaker events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        // In a real app, this would be an API call
        // const response = await api.get(`/speakers/${speakerId}/events`)
        // setEvents(response.data)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setEvents(mockSpeakerEvents)
        setFilteredEvents(mockSpeakerEvents)
      } catch (error) {
        console.error('Error loading speaker events:', error)
        showToast.error('Error al cargar los eventos del speaker')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [speakerId])

  // Filter and sort events
  useEffect(() => {
    let filtered = events

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'attendees':
          return b.registeredCount - a.registeredCount
        case 'price':
          return a.price - b.price
        default:
          return 0
      }
    })

    setFilteredEvents(filtered)
  }, [events, searchTerm, statusFilter, sortBy])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            )}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {rating} ({Math.floor(Math.random() * 50) + 10} reseñas)
        </span>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Próximo</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando eventos del speaker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
          <p className="text-gray-600 mt-1">Gestiona y visualiza todos tus eventos como speaker</p>
        </div>

        <Button>
          Crear Nuevo Evento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Asistentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.reduce((sum, event) => sum + event.registeredCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaStar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(events.reduce((sum, event) => sum + event.rating, 0) / events.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaClock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'upcoming').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaFilter className="h-5 w-5" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar eventos por título, descripción o tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="upcoming">Próximos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="attendees">Asistentes</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Event Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaCalendarAlt className="h-12 w-12 text-primary/50" />
                </div>
              )}

              <div className="absolute top-3 right-3">
                {getStatusBadge(event.status)}
              </div>

              <div className="absolute bottom-3 left-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="font-semibold text-gray-900">
                    Q{event.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Title and Rating */}
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  {renderStars(event.rating)}
                </div>

                {/* Date and Location */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="h-4 w-4 flex-shrink-0" />
                    <span>{formatEventDate(event.startDate)} • {formatDateTime(event.startDate)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FaUsers className="h-4 w-4 flex-shrink-0" />
                    <span>{event.registeredCount} / {event.capacity} asistentes</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {event.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.tags.length - 3} más
                    </Badge>
                  )}
                </div>

                {/* Recent Attendees */}
                {event.attendees.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Asistentes recientes:</p>
                    <div className="flex -space-x-2">
                      {event.attendees.slice(0, 5).map((attendee) => (
                        <Avatar key={attendee.id} className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={attendee.avatar} alt={attendee.name} />
                          <AvatarFallback className="text-xs">
                            {attendee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {event.registeredCount > 5 && (
                        <div className="w-8 h-8 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{event.registeredCount - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    Ver Detalles
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron eventos
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Intenta ajustar tus filtros de búsqueda'
              : 'Aún no has creado ningún evento'
            }
          </p>
        </div>
      )}
    </div>
  )
}