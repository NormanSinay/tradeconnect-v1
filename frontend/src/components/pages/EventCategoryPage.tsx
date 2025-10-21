import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaFilter, FaSort } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/services/api'

interface Event {
  id: string
  title: string
  description: string
  category: string
  startDate: string
  endDate: string
  location: string
  capacity: number
  registeredCount: number
  price: number
  imageUrl?: string
  status: 'active' | 'cancelled' | 'completed'
}

const categoryNames: Record<string, string> = {
  'conferencias': 'Conferencias',
  'talleres': 'Talleres',
  'cursos': 'Cursos',
  'seminarios': 'Seminarios',
  'networking': 'Networking',
  'capacitacion': 'Capacitación Empresarial'
}

export const EventCategoryPage: React.FC = () => {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'popularity'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming'>('all')

  useEffect(() => {
    if (categoria) {
      fetchEventsByCategory()
    }
  }, [categoria, sortBy, filterStatus])

  const fetchEventsByCategory = async () => {
    try {
      setLoading(true)
      // In a real app, you would call your API
      // const response = await api.get(`/events/category/${categoria}`, {
      //   params: { sort: sortBy, status: filterStatus }
      // })

      // Mock data for now
      const mockEvents: Event[] = [
        {
          id: '1',
          title: categoria === 'conferencias' ? 'Conferencia sobre Innovación Digital' : 'Taller de Liderazgo Empresarial',
          description: `Evento especializado en ${categoryNames[categoria || ''] || categoria}`,
          category: categoria || '',
          startDate: '2024-02-15T09:00:00Z',
          endDate: '2024-02-15T17:00:00Z',
          location: 'Centro de Convenciones, Ciudad de Guatemala',
          capacity: 200,
          registeredCount: 45,
          price: 150,
          status: 'active'
        },
        {
          id: '2',
          title: categoria === 'conferencias' ? 'Conferencia Anual de Tecnología' : 'Taller Avanzado de Gestión',
          description: `Aprende las últimas tendencias en ${categoryNames[categoria || ''] || categoria}`,
          category: categoria || '',
          startDate: '2024-03-20T08:30:00Z',
          endDate: '2024-03-20T16:30:00Z',
          location: 'Hotel Marriott, Zona 10',
          capacity: 150,
          registeredCount: 89,
          price: 200,
          status: 'active'
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setEvents(mockEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando eventos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryNames[categoria || ''] || categoria}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre los mejores eventos de {categoryNames[categoria || '']?.toLowerCase() || categoria} organizados por la Cámara de Comercio
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <FaFilter className="text-gray-500" />
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los eventos</SelectItem>
                <SelectItem value="active">Eventos activos</SelectItem>
                <SelectItem value="upcoming">Próximos eventos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <FaSort className="text-gray-500" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Fecha</SelectItem>
                <SelectItem value="price">Precio</SelectItem>
                <SelectItem value="popularity">Popularidad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-gray-500 mb-4">
                <FaCalendarAlt className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No hay eventos disponibles</h3>
                <p>No se encontraron eventos en esta categoría por el momento.</p>
              </div>
              <Button onClick={() => navigate('/events')}>
                Ver todos los eventos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event.id)}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    {getStatusBadge(event.status)}
                  </div>
                  <CardDescription className="line-clamp-3">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 h-4 w-4" />
                      {formatDate(event.startDate)}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 h-4 w-4" />
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-2 h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaUsers className="mr-2 h-4 w-4" />
                        {event.registeredCount}/{event.capacity}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        Q{event.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4" size="sm">
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Related Categories */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Otras Categorías de Eventos</CardTitle>
              <CardDescription>
                Explora más tipos de eventos que podrían interesarte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(categoryNames)
                  .filter(([key]) => key !== categoria)
                  .map(([key, name]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-auto p-4"
                    onClick={() => navigate(`/eventos/categoria/${key}`)}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}