import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FaSearch, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaSort } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
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

interface SearchFilters {
  query: string
  category: string
  dateRange: string
  priceRange: string
  location: string
  availability: string
}

const categories = [
  { value: 'conferencias', label: 'Conferencias' },
  { value: 'talleres', label: 'Talleres' },
  { value: 'cursos', label: 'Cursos' },
  { value: 'seminarios', label: 'Seminarios' },
  { value: 'networking', label: 'Networking' },
  { value: 'capacitacion', label: 'Capacitación Empresarial' }
]

export const EventSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'price' | 'popularity'>('relevance')

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    dateRange: searchParams.get('dateRange') || '',
    priceRange: searchParams.get('priceRange') || '',
    location: searchParams.get('location') || '',
    availability: searchParams.get('availability') || ''
  })

  useEffect(() => {
    if (filters.query || Object.values(filters).some(v => v)) {
      searchEvents()
    }
  }, [filters, sortBy])

  const searchEvents = async () => {
    try {
      setLoading(true)

      // Update URL params
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
      if (sortBy !== 'relevance') params.set('sort', sortBy)
      setSearchParams(params)

      // In a real app, you would call your API
      // const response = await api.get('/events/search', {
      //   params: { ...filters, sort: sortBy }
      // })

      // Mock search results
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Conferencia sobre Innovación Digital',
          description: 'Aprende sobre las últimas tendencias en transformación digital',
          category: 'conferencias',
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
          title: 'Taller de Liderazgo Empresarial',
          description: 'Desarrolla habilidades de liderazgo para equipos modernos',
          category: 'talleres',
          startDate: '2024-02-20T08:30:00Z',
          endDate: '2024-02-20T16:30:00Z',
          location: 'Hotel Marriott, Zona 10',
          capacity: 50,
          registeredCount: 12,
          price: 300,
          status: 'active'
        },
        {
          id: '3',
          title: 'Curso de Marketing Digital',
          description: 'Estrategias completas para promocionar tu negocio online',
          category: 'cursos',
          startDate: '2024-03-01T09:00:00Z',
          endDate: '2024-03-03T17:00:00Z',
          location: 'Centro Empresarial, Zona 4',
          capacity: 30,
          registeredCount: 8,
          price: 500,
          status: 'active'
        }
      ]

      // Filter mock results based on search criteria
      let filteredEvents = mockEvents

      if (filters.query) {
        filteredEvents = filteredEvents.filter(event =>
          event.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          event.description.toLowerCase().includes(filters.query.toLowerCase())
        )
      }

      if (filters.category) {
        filteredEvents = filteredEvents.filter(event => event.category === filters.category)
      }

      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number)
        filteredEvents = filteredEvents.filter(event =>
          event.price >= (min || 0) && (max ? event.price <= max : true)
        )
      }

      // Sort results
      filteredEvents.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          case 'price':
            return a.price - b.price
          case 'popularity':
            return b.registeredCount - a.registeredCount
          default:
            return 0
        }
      })

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      setEvents(filteredEvents)
    } catch (error) {
      console.error('Error searching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      dateRange: '',
      priceRange: '',
      location: '',
      availability: ''
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Buscar Eventos
          </h1>
          <p className="text-xl text-gray-600">
            Encuentra el evento perfecto para ti
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar eventos, conferencias, talleres..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center"
              >
                <FaFilter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Filtros de Búsqueda
                <Button onClick={clearFilters} variant="ghost" size="sm">
                  Limpiar filtros
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Precios
                  </label>
                  <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier precio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier precio</SelectItem>
                      <SelectItem value="0-100">Q0 - Q100</SelectItem>
                      <SelectItem value="100-300">Q100 - Q300</SelectItem>
                      <SelectItem value="300-500">Q300 - Q500</SelectItem>
                      <SelectItem value="500">Más de Q500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidad
                  </label>
                  <Select value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier disponibilidad</SelectItem>
                      <SelectItem value="available">Con cupos disponibles</SelectItem>
                      <SelectItem value="limited">Cupos limitados</SelectItem>
                      <SelectItem value="full">Eventos completos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sort and Results Count */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="text-gray-600 mb-2 sm:mb-0">
            {loading ? 'Buscando...' : `${events.length} eventos encontrados`}
          </div>
          <div className="flex items-center space-x-4">
            <FaSort className="text-gray-500" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevancia</SelectItem>
                <SelectItem value="date">Fecha</SelectItem>
                <SelectItem value="price">Precio</SelectItem>
                <SelectItem value="popularity">Popularidad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando eventos...</p>
          </div>
        )}

        {/* Results */}
        {!loading && events.length === 0 && (filters.query || Object.values(filters).some(v => v)) && (
          <Card>
            <CardContent className="pt-6 text-center">
              <FaSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta ajustar tus filtros de búsqueda o busca con otros términos.
              </p>
              <Button onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && events.length > 0 && (
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
                      {new Date(event.startDate).toLocaleTimeString('es-GT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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

        {/* Popular Searches */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Búsquedas Populares</CardTitle>
            <CardDescription>
              Eventos más buscados por nuestros usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['conferencias', 'talleres', 'marketing digital', 'liderazgo', 'innovación', 'emprendimiento'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('query', term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}