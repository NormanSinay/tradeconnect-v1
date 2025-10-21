import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUser, FaCreditCard, FaQrcode, FaDownload, FaEye, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'

interface Registration {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  registrationDate: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded'
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'failed'
  amount: number
  currency: string
  qrCode?: string
  certificateUrl?: string
  checkInTime?: string
  speakers: string[]
  category: string
  description: string
}

export const UserRegistrationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, statusFilter, paymentFilter])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)

      // In a real app, you would call your API
      // const response = await api.get('/user/registrations')

      // Mock registrations data
      const mockRegistrations: Registration[] = [
        {
          id: '1',
          eventId: 'event-1',
          eventTitle: 'Conferencia Anual de Innovación Tecnológica',
          eventDate: '2024-02-15',
          eventTime: '09:00',
          eventLocation: 'Centro de Convenciones, Ciudad de Guatemala',
          registrationDate: '2024-01-10T14:30:00Z',
          status: 'confirmed',
          paymentStatus: 'paid',
          amount: 150.00,
          currency: 'GTQ',
          qrCode: 'QR-2024-001',
          certificateUrl: '/certificado/123',
          checkInTime: '2024-02-15T09:15:00Z',
          speakers: ['Dr. Carlos Rodríguez', 'Lic. Ana López'],
          category: 'Tecnología',
          description: 'Conferencia anual sobre las últimas tendencias en innovación tecnológica'
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
          paymentStatus: 'paid',
          amount: 200.00,
          currency: 'GTQ',
          qrCode: 'QR-2024-002',
          certificateUrl: '/certificado/456',
          speakers: ['Lic. María González'],
          category: 'Negocios',
          description: 'Taller práctico sobre desarrollo de habilidades de liderazgo'
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
          paymentStatus: 'paid',
          amount: 120.00,
          currency: 'GTQ',
          qrCode: 'QR-2024-003',
          certificateUrl: '/certificado/789',
          checkInTime: '2024-01-10T10:30:00Z',
          speakers: ['Ing. José Martínez'],
          category: 'Marketing',
          description: 'Estrategias avanzadas de marketing digital para empresas'
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
          paymentStatus: 'pending',
          amount: 180.00,
          currency: 'GTQ',
          speakers: ['CPA. Ana López'],
          category: 'Finanzas',
          description: 'Gestión efectiva de finanzas personales y empresariales'
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setRegistrations(mockRegistrations)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = registrations

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(registration =>
        registration.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.speakers.some(speaker =>
          speaker.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        registration.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(registration => registration.status === statusFilter)
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(registration => registration.paymentStatus === paymentFilter)
    }

    setFilteredRegistrations(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Reembolsado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Reembolsado</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const handleViewDetails = (registrationId: string) => {
    navigate(`/mis-inscripciones/${registrationId}`)
  }

  const handleDownloadQR = (qrCode: string) => {
    // In a real app, this would download the QR code
    alert(`Descargando código QR: ${qrCode}`)
  }

  const handleDownloadCertificate = (certificateUrl: string) => {
    // In a real app, this would download the certificate
    alert('Descargando certificado...')
  }

  const handleCancelRegistration = async (registrationId: string) => {
    if (confirm('¿Estás seguro de que quieres cancelar esta inscripción? Esta acción no se puede deshacer.')) {
      try {
        // In a real app, you would call your API
        // const response = await api.put(`/user/registrations/${registrationId}/cancel`)

        setRegistrations(prev => prev.map(reg =>
          reg.id === registrationId
            ? { ...reg, status: 'cancelled' as const }
            : reg
        ))

        alert('Inscripción cancelada exitosamente')
      } catch (error) {
        console.error('Error cancelling registration:', error)
        alert('Error al cancelar la inscripción')
      }
    }
  }

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    paid: registrations.filter(r => r.paymentStatus === 'paid').length,
    totalSpent: registrations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + r.amount, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus inscripciones...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Mis Inscripciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona todas tus inscripciones a eventos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <p className="text-sm text-gray-600">Confirmadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.paid}</div>
              <p className="text-sm text-gray-600">Pagadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-indigo-600">Q{stats.totalSpent.toFixed(2)}</div>
              <p className="text-sm text-gray-600">Total gastado</p>
            </CardContent>
          </Card>
        </div>

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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de inscripción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setPaymentFilter('all')
              }}>
                <FaFilter className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registrations List */}
        <div className="space-y-6">
          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron inscripciones</h3>
                <p className="text-gray-600 mb-4">
                  {registrations.length === 0
                    ? 'Aún no te has inscrito a ningún evento.'
                    : 'No hay inscripciones que coincidan con los filtros aplicados.'
                  }
                </p>
                {registrations.length === 0 && (
                  <Button onClick={() => navigate('/events')}>
                    Explorar eventos
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Event Info */}
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {registration.eventTitle}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2 h-3 w-3" />
                              {new Date(registration.eventDate).toLocaleDateString('es-GT', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-2 h-3 w-3" />
                              {registration.eventTime}
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2 h-3 w-3" />
                              {registration.eventLocation}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {getStatusBadge(registration.status)}
                          {getPaymentStatusBadge(registration.paymentStatus)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {registration.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <FaUser className="mr-2 h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {registration.speakers.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment & Actions */}
                    <div>
                      <div className="mb-4">
                        <div className="text-lg font-semibold text-gray-900">
                          Q{registration.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Registrado: {new Date(registration.registrationDate).toLocaleDateString('es-GT')}
                        </div>
                        {registration.checkInTime && (
                          <div className="text-sm text-green-600 mt-1">
                            Check-in: {new Date(registration.checkInTime).toLocaleDateString('es-GT')}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(registration.id)}
                          className="w-full"
                        >
                          <FaEye className="mr-2 h-3 w-3" />
                          Ver detalles
                        </Button>

                        {registration.qrCode && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadQR(registration.qrCode!)}
                            className="w-full"
                          >
                            <FaQrcode className="mr-2 h-3 w-3" />
                            Descargar QR
                          </Button>
                        )}

                        {registration.certificateUrl && registration.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCertificate(registration.certificateUrl)}
                            className="w-full"
                          >
                            <FaDownload className="mr-2 h-3 w-3" />
                            Certificado
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div>
                      {registration.status === 'confirmed' && registration.paymentStatus === 'paid' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 font-medium">
                              Inscripción activa
                            </span>
                          </div>
                        </div>
                      )}

                      {registration.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center">
                            <FaExclamationTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-sm text-yellow-700">
                              Pendiente de confirmación
                            </span>
                          </div>
                        </div>
                      )}

                      {registration.status === 'cancelled' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center">
                            <FaTimesCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-700">
                              Inscripción cancelada
                            </span>
                          </div>
                        </div>
                      )}

                      {registration.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelRegistration(registration.id)}
                          className="w-full text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Cancelar inscripción
                        </Button>
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