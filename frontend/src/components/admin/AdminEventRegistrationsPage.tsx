import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaTrash, FaEdit, FaEye, FaUsers, FaCheck, FaTimes, FaClock, FaFileInvoiceDollar, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminRegistrationService } from '@/services/admin'
import { adminEventService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  RegistrationStatus,
  ParticipantType,
  RegistrationFilters,
  PaginationOptions,
  PaginatedResponse,
  RegistrationResponse,
  AdminEvent,
} from '@/types/admin'
import type { EventRegistrationStatus } from '@/types/admin'

interface AdminEventRegistrationsPageProps {
  eventId: number
}

const AdminEventRegistrationsPage: React.FC<AdminEventRegistrationsPageProps> = ({ eventId }) => {
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<RegistrationFilters>({ eventId })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRegistrations, setTotalRegistrations] = useState(0)
  const [event, setEvent] = useState<any>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadEvent()
    loadRegistrations()
  }, [currentPage, filters, searchTerm, eventId])

  // Cargar evento
  const loadEvent = async () => {
    try {
      const eventData = await adminEventService.getEventById(eventId)
      setEvent(eventData)
    } catch (error) {
      console.error('Error cargando evento:', error)
    }
  }

  // Cargar inscripciones
  const loadRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)

      const pagination: PaginationOptions = {
        page: currentPage,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }

      const result = await adminRegistrationService.getRegistrations(filters, pagination)
      setRegistrations(result.data)
      setTotalPages(result.pagination.totalPages)
      setTotalRegistrations(result.pagination.total)
    } catch (err) {
      console.error('Error cargando inscripciones:', err)
      setError('Error al cargar las inscripciones')
    } finally {
      setLoading(false)
    }
  }

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({ ...prev, search: value || undefined }))
    setCurrentPage(1)
  }

  // Manejar filtros
  const handleFilterChange = (newFilters: Partial<RegistrationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  // Manejar selección de inscripciones
  const handleSelectRegistration = (registrationId: number, checked: boolean) => {
    setSelectedRegistrations(prev =>
      checked
        ? [...prev, registrationId]
        : prev.filter(id => id !== registrationId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedRegistrations(checked ? registrations.map(r => r.registrationId || 0).filter(id => id > 0) : [])
  }

  // Acciones individuales
  const handleViewRegistration = (registration: RegistrationResponse) => {
    // TODO: Navigate to registration detail
    console.log('View registration:', registration)
  }

  const handleEditRegistration = (registration: RegistrationResponse) => {
    // TODO: Navigate to edit registration
    console.log('Edit registration:', registration)
  }

  const handleCancelRegistration = (registration: RegistrationResponse) => {
    // TODO: Navigate to cancel registration
    console.log('Cancel registration:', registration)
  }

  const handleConfirmRegistration = async (registrationId: number) => {
    try {
      await adminRegistrationService.confirmRegistration(registrationId)
      loadRegistrations()
    } catch (error) {
      console.error('Error confirmando inscripción:', error)
      setError('Error al confirmar la inscripción')
    }
  }

  const handleDeleteRegistration = async (registrationId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta inscripción?')) return

    try {
      // TODO: Implement delete registration method
      console.log('Delete registration:', registrationId)
      loadRegistrations()
    } catch (err) {
      console.error('Error eliminando inscripción:', err)
      setError('Error al eliminar la inscripción')
    }
  }

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedRegistrations.length === 0) return
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedRegistrations.length} inscripciones?`)) return

    try {
      // TODO: Implement bulk delete
      setSelectedRegistrations([])
      loadRegistrations()
    } catch (err) {
      console.error('Error eliminando inscripciones:', err)
      setError('Error al eliminar las inscripciones')
    }
  }

  const handleBulkExport = async () => {
    try {
      // TODO: Implement export registrations
      console.log('Export registrations')
    } catch (err) {
      console.error('Error exportando inscripciones:', err)
      setError('Error al exportar las inscripciones')
    }
  }

  // Obtener badge de estado
  const getStatusBadge = (status: RegistrationStatus | EventRegistrationStatus) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      BORRADOR: 'secondary',
      PENDIENTE_PAGO: 'outline',
      PAGADO: 'default',
      CONFIRMADO: 'default',
      CANCELADO: 'destructive',
      EXPIRADO: 'destructive',
      REEMBOLSADO: 'destructive',
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      attended: 'default',
      no_show: 'outline',
    }
    return variants[status as string] || 'secondary'
  }

  // Obtener texto de estado
  const getStatusText = (status: RegistrationStatus | EventRegistrationStatus) => {
    const texts: Record<string, string> = {
      BORRADOR: 'Borrador',
      PENDIENTE_PAGO: 'Pendiente de Pago',
      PAGADO: 'Pagado',
      CONFIRMADO: 'Confirmado',
      CANCELADO: 'Cancelado',
      EXPIRADO: 'Expirado',
      REEMBOLSADO: 'Reembolsado',
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      attended: 'Asistió',
      no_show: 'No Asistió',
    }
    return texts[status as string] || status as string
  }

  // Obtener texto de tipo de participante
  const getParticipantTypeText = (type: ParticipantType) => {
    const texts: Record<ParticipantType, string> = {
      individual: 'Individual',
      empresa: 'Empresa',
    }
    return texts[type] || type
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/events' },
    { label: event?.title || 'Evento', href: `/admin/events/${eventId}/editar` },
    { label: 'Inscripciones' },
  ]

  return (
    <AdminLayout title={`Inscripciones - ${event?.title || 'Evento'}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => {/* TODO: Navigate back */}}>
              <FaArrowLeft className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Inscripciones del Evento</h1>
              <p className="text-gray-600">{event?.title || `Evento #${eventId}`}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={() => {/* TODO: Navigate to create */}}>
              <FaPlus className="mr-2" />
              Nueva Inscripción
            </Button>
          </div>
        </div>

        {/* Información del evento */}
        {event && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha del Evento</p>
                  <p className="text-lg font-semibold">
                    {formatDateTime(event.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Capacidad Total</p>
                  <p className="text-lg font-semibold">{event.capacity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Inscritos</p>
                  <p className="text-lg font-semibold">{totalRegistrations}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponibles</p>
                  <p className="text-lg font-semibold">{event.capacity - totalRegistrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FaUsers className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{totalRegistrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FaCheck className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.status === 'CONFIRMADO').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FaClock className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.status === 'PENDIENTE_PAGO').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FaTimes className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Canceladas</p>
                  <p className="text-2xl font-bold">
                    {registrations.filter(r => r.status === 'CANCELADO').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email, código..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <select
                  value={filters.status?.[0] || ''}
                  onChange={(e) => handleFilterChange({
                    status: e.target.value ? [e.target.value as any] : undefined
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="BORRADOR">Borrador</option>
                  <option value="PENDIENTE_PAGO">Pendiente de Pago</option>
                  <option value="PAGADO">Pagado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="EXPIRADO">Expirado</option>
                  <option value="REEMBOLSADO">Reembolsado</option>
                </select>

                <select
                  value={filters.participantType?.[0] || ''}
                  onChange={(e) => handleFilterChange({
                    participantType: e.target.value ? [e.target.value as ParticipantType] : undefined
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="individual">Individual</option>
                  <option value="empresa">Empresa</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedRegistrations.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedRegistrations.length} inscripción{selectedRegistrations.length > 1 ? 'es' : ''} seleccionada{selectedRegistrations.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <FaDownload className="mr-2" />
                    Exportar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <FaTrash className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de inscripciones */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-12 text-center">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron inscripciones
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay inscripciones para este evento.'}
                </p>
                <Button onClick={() => {/* TODO: Navigate to create */}}>
                  <FaPlus className="mr-2" />
                  Crear primera inscripción
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRegistrations.length === registrations.length && registrations.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Asistencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.registrationId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRegistrations.includes(registration.registrationId || 0)}
                          onCheckedChange={(checked) => handleSelectRegistration(registration.registrationId || 0, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{registration.registrationCode}</div>
                          <div className="text-sm text-gray-500">
                            ID: {registration.registrationId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {(registration as any).firstName} {(registration as any).lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(registration as any).email}
                          </div>
                          {(registration as any).companyName && (
                            <div className="text-sm text-gray-500">
                              {(registration as any).companyName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getParticipantTypeText((registration as any).participantType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            Q {registration.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(registration.status as any)}>
                          {getStatusText(registration.status as any)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {/* TODO: Add registration date */}
                          {formatDateTime(new Date())}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <FaCalendarAlt className="mr-2" />
                          Ver
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FaFilter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewRegistration(registration)}>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditRegistration(registration)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {registration.status === 'PENDIENTE_PAGO' && (
                              <DropdownMenuItem onClick={() => handleConfirmRegistration(registration.registrationId || 0)}>
                                <FaCheck className="mr-2" />
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            {registration.status !== 'CANCELADO' && registration.status !== 'REEMBOLSADO' && (
                              <DropdownMenuItem onClick={() => handleCancelRegistration(registration)}>
                                <FaTimes className="mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteRegistration(registration.registrationId || 0)}
                              className="text-red-600"
                            >
                              <FaTrash className="mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalRegistrations)} de {totalRegistrations} inscripciones
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTimes className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminEventRegistrationsPage