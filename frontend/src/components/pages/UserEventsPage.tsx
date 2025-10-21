import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUser, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSearch, FaFilter, FaEye, FaQrcode, FaDownload } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'

interface UserEvent {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  registrationDate: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded'
  checkInTime?: string
  qrCode?: string
  certificateUrl?: string
  speakers: string[]
  category: string
  description: string
  isUpcoming: boolean
  daysUntil: number
}

export const UserEventsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [events, setEvents] = useState<UserEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<UserEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    fetchUserEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, categoryFilter, statusFilter, activeTab])

  const fetchUserEvents = async () => {
    try {
      setLoading(true)

      // In a real app, you would call your API
      // const response = await api.get('/user/events')

      // Mock events data
      const mockEvents: UserEvent[] = [
        {
          id: '1',
          eventId: 'event-1',
          eventTitle: 'Conferencia Anual de Innovación Tecnológica',
          eventDate: '2024-02-15',
          eventTime: '09:00',
          eventLocation: 'Centro de Convenciones, Ciudad de Guatemala',
          registrationDate: '2024-01-10T14:30:00Z',
          status: 'confirmed',
          checkInTime: '2024-02-15T09:15:00Z',
          qrCode: 'QR-2024-001',
          certificateUrl: '/certificado/123',
          speakers: ['Dr. Carlos Rodríguez', 'Lic. Ana López'],
          category: 'Tecnología',
          description: 'Conferencia anual sobre las últimas tendencias en innovación tecnológica',
          isUpcoming: true,
          daysUntil: 5
        },
        {
          id: '2',
          eventId: 'event-2',
          eventTitle: 'Taller de Liderazgo Empresarial',
          eventDate: '2024-03-20',
          eventTime: '14:00',
          eventLocation: 'Hotel Marriott, Zona 10',
          registrationDate: '2024-01-08T10:15:00Z',
          status: 'confirmed',
          qrCode: 'QR-2024-002',
          certificateUrl: '/certificado/456',
          speakers: ['Lic. María González'],
          category: 'Negocios',
          description: 'Taller práctico sobre desarrollo de habilidades de liderazgo',
          isUpcoming: true,
          daysUntil: 30
        },
        {
          id: '3',
          eventId: 'event-3',
          eventTitle: 'Seminario de Marketing Digital',
          eventDate: '2024-01-10',
          eventTime: '10:00',
          eventLocation: 'Centro Empresarial, Zona 4',
          registrationDate: '2023-12-15T16:45:00Z',
          status: 'confirmed',
          checkInTime: '2024-01-10T10:30:00Z',
          qrCode: 'QR-2024-003',
          certificateUrl: '/certificado/789',
          speakers: ['Ing. José Martínez'],
          category: 'Marketing',
          description: 'Estrategias avanzadas de marketing digital para empresas',
          isUpcoming: false,
          daysUntil: -5
        },
        {
          id: '4',
          eventId: 'event-4',
          eventTitle: 'Workshop de Finanzas Personales',
          eventDate: '2024-04-10',
          eventTime: '09:00',
          eventLocation: 'Torre Empresarial, Zona 9',
          registrationDate: '2024-01-12T11:20:00Z',
          status: 'pending',
          speakers: ['CPA. Ana López'],
          category: 'Finanzas',
          description: 'Gestión efectiva de finanzas personales y empresariales',
          isUpcoming: true,
          daysUntil: 40
        },
        {
          id: '5',
          eventId: 'event-5',
          eventTitle: 'Congreso de Recursos Humanos',
          eventDate: '2023-11-15',
          eventTime: '08:30',
          eventLocation: 'Hotel Intercontinental, Zona 10',
          registrationDate: '2023-10-20T09:00:00Z',
          status: 'confirmed',
          checkInTime: '2023-11-15T09:00:00Z',
          qrCode: 'QR-2023-015',
          certificateUrl: '/certificado/101',
          speakers: ['Lic. Roberto García', 'Dra. Carmen Flores'],
          category: 'Recursos Humanos',
          description: 'Congreso anual sobre tendencias en gestión del talento humano',
          isUpcoming: false,
          daysUntil: -60
        }
      ]

      // Calculate days until for each event
      const eventsWithDays = mockEvents.map(event => ({
        ...event,
        daysUntil: Math.ceil((new Date(event.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        isUpcoming: new Date(event.eventDate) > new Date()
      }))

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setEvents(eventsWithDays)
    } catch (error) {
      console.error('Error fetching user events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    // Tab filter
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => event.isUpcoming)
    } else if (activeTab === 'past') {
      filtered = filtered.filter(event => !event.isUpcoming)
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(event => event.status === 'cancelled')
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.speakers.some(speaker =>
          speaker.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter)
    }

    setFilteredEvents(filtered)
  }

  const getStatusBadge = (status: string, isUpcoming: boolean) => {
    if (status === 'cancelled') {
      return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
    }
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
    }
    if (isUpcoming) {
      return <Badge className="bg-blue-100 text-blue-800">Próximo</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Completado</Badge>
  }

  const getStatusIcon = (status: string, isUpcoming: boolean) => {
    if (status === 'cancelled') {
      return <FaTimesCircle className="h-5 w-5 text-red-500" />
    }
    if (status === 'pending') {
      return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
    }
    if (isUpcoming) {
      return <FaCalendarAlt className="h-5 w-5 text-blue-500" />
    }
    return <FaCheckCircle className="h-5 w-5 text-green-500" />
  }

  const handleViewEvent = (eventId: string) => {
    navigate(`/event/${eventId}`)
  }

  const handleDownloadQR = (qrCode: string) => {
    // In a real app, this would download the QR code
    alert(`Descargando código QR: ${qrCode}`)
  }

  const handleDownloadCertificate = (certificateUrl: string) => {
    // In a real app, this would download the certificate
    alert('Descargando certificado...')
  }

  const getCategories = () => {
    return Array.from(new Set(events.map(event => event.category)))
  }

  const stats = {
    upcoming: events.filter(e => e.isUpcoming && e.status === 'confirmed').length,
    past: events.filter(e => !e.isUpcoming && e.status === 'confirmed').length,
    cancelled: events.filter(e => e.status === 'cancelled').length,
    total: events.length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus eventos...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todos los eventos en los que estás inscrito
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
              <p className="text-sm text-gray-600">Próximos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.past}</div>
              <p className="text-sm text-gray-600">Pasados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <p className="text-sm text-gray-600">Cancelados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="past">Pasados</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {getCategories().map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setStatusFilter('all')
              }}>
                <FaFilter className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === 'upcoming' ? 'No tienes eventos próximos' :
                   activeTab === 'past' ? 'No tienes eventos pasados' :
                   'No tienes eventos cancelados'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'upcoming'
                    ? 'Cuando te inscribas a eventos futuros, aparecerán aquí.'
                    : activeTab === 'past'
                    ? 'Los eventos completados aparecerán en esta sección.'
                    : 'Los eventos cancelados aparecerán aquí.'
                  }
                </p>
                {activeTab === 'upcoming' && (
                  <Button onClick={() => navigate('/events')}>
                    Explorar eventos
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Event Info */}
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {event.eventTitle}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2 h-3 w-3" />
                              {new Date(event.eventDate).toLocaleDateString('es-GT', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-2 h-3 w-3" />
                              {event.eventTime}
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2 h-3 w-3" />
                              {event.eventLocation}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(event.status, event.isUpcoming)}
                          {event.isUpcoming && event.daysUntil <= 7 && (
                            <Badge className="bg-orange-100 text-orange-800">
                              {event.daysUntil === 0 ? 'Hoy' : `En ${event.daysUntil} días`}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <FaUser className="mr-2 h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {event.speakers.join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <span>Inscrito: {new Date(event.registrationDate).toLocaleDateString('es-GT')}</span>
                        {event.checkInTime && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-green-600">
                              Check-in: {new Date(event.checkInTime).toLocaleDateString('es-GT')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div>
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          {getStatusIcon(event.status, event.isUpcoming)}
                          <span className="ml-2 text-sm font-medium">
                            {event.status === 'confirmed' && event.isUpcoming ? 'Confirmado' :
                             event.status === 'confirmed' && !event.isUpcoming ? 'Completado' :
                             event.status === 'pending' ? 'Pendiente' :
                             event.status === 'cancelled' ? 'Cancelado' : 'Reembolsado'}
                          </span>
                        </div>

                        {event.isUpcoming && event.status === 'confirmed' && (
                          <div className="text-sm text-blue-600">
                            {event.daysUntil === 0 ? '¡Es hoy!' :
                             event.daysUntil === 1 ? 'Mañana' :
                             `En ${event.daysUntil} días`}
                          </div>
                        )}

                        {!event.isUpcoming && event.checkInTime && (
                          <div className="text-sm text-green-600">
                            Asistencia confirmada
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEvent(event.eventId)}
                          className="w-full"
                        >
                          <FaEye className="mr-2 h-3 w-3" />
                          Ver evento
                        </Button>

                        {event.qrCode && event.isUpcoming && event.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadQR(event.qrCode!)}
                            className="w-full"
                          >
                            <FaQrcode className="mr-2 h-3 w-3" />
                            Código QR
                          </Button>
                        )}

                        {event.certificateUrl && !event.isUpcoming && event.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCertificate(event.certificateUrl)}
                            className="w-full"
                          >
                            <FaDownload className="mr-2 h-3 w-3" />
                            Certificado
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <div className="text-sm text-gray-600 mb-4">
                        <div className="mb-2">
                          <span className="font-medium">Categoría:</span> {event.category}
                        </div>
                        <div>
                          <span className="font-medium">Speakers:</span> {event.speakers.length}
                        </div>
                      </div>

                      {event.isUpcoming && event.status === 'confirmed' && event.daysUntil <= 3 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <FaExclamationTriangle className="h-4 w-4 text-orange-500 mr-2" />
                            <span className="text-sm text-orange-700 font-medium">
                              ¡Evento próximo!
                            </span>
                          </div>
                        </div>
                      )}

                      {!event.isUpcoming && event.checkInTime && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 font-medium">
                              Asistencia confirmada
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}