import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FaUsers, FaSearch, FaDownload, FaCheck, FaTimes, FaEye, FaExclamationTriangle, FaUserCheck, FaUserTimes } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { adminEventService } from '@/services/admin'
import type { EventRegistrationInfo, AdminPaginatedResponse, DetailedEvent } from '@/types/admin'

const AdminEventParticipantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<DetailedEvent | null>(null)
  const [participants, setParticipants] = useState<EventRegistrationInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalParticipants, setTotalParticipants] = useState(0)

  const eventId = id ? parseInt(id, 10) : null

  useEffect(() => {
    if (eventId) {
      loadEvent()
      loadParticipants()
    }
  }, [eventId, currentPage, statusFilter])

  const loadEvent = async () => {
    if (!eventId) return

    try {
      const eventData = await adminEventService.getEventById(eventId)
      setEvent(eventData)
    } catch (err) {
      console.error('Error cargando evento:', err)
    }
  }

  const loadParticipants = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      setError(null)

      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
      }

      const result: AdminPaginatedResponse<EventRegistrationInfo> =
        await adminEventService.getEventRegistrations(eventId, params)

      setParticipants(result.data)
      setTotalPages(Math.ceil(result.total / result.limit))
      setTotalParticipants(result.total)
    } catch (err) {
      console.error('Error cargando participantes:', err)
      setError('Error al cargar los participantes')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar participantes por búsqueda local
  const filteredParticipants = participants.filter(participant => {
    const searchLower = searchTerm.toLowerCase()
    // TODO: Agregar búsqueda por nombre de usuario cuando esté disponible
    return searchTerm === '' || participant.registrationNumber?.toLowerCase().includes(searchLower)
  })

  const handleStatusChange = async (registrationId: number, newStatus: string) => {
    try {
      // TODO: Implementar cambio de estado
      console.log('Cambiando estado:', registrationId, newStatus)
      await loadParticipants()
    } catch (err) {
      console.error('Error cambiando estado:', err)
      setError('Error al cambiar el estado de la inscripción')
    }
  }

  const handleCancelRegistration = async (registrationId: number) => {
    const reason = prompt('Razón de cancelación:')
    if (!reason) return

    try {
      await adminEventService.cancelRegistration(eventId!, registrationId, reason)
      await loadParticipants()
    } catch (err) {
      console.error('Error cancelando inscripción:', err)
      setError('Error al cancelar la inscripción')
    }
  }

  const handleExportParticipants = async () => {
    try {
      const blob = await adminEventService.exportEventRegistrations(eventId!, 'excel')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `participantes-evento-${eventId}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando participantes:', err)
      setError('Error al exportar los participantes')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      attended: 'outline',
      no_show: 'destructive',
    }
    return variants[status] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      attended: 'Asistió',
      no_show: 'No asistió',
    }
    return labels[status] || status
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: event?.title || 'Participantes', href: `/admin/eventos/${eventId}/participantes` },
  ]

  if (loading && !event) {
    return (
      <AdminLayout title="Cargando..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!event) {
    return (
      <AdminLayout title="Error" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">No se pudo cargar el evento</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Participantes: ${event.title}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Participantes del Evento</h1>
            <p className="text-gray-600">Gestiona las inscripciones de {event.title}</p>
          </div>
          <Button onClick={handleExportParticipants}>
            <FaDownload className="mr-2" />
            Exportar Lista
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaUsers className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{totalParticipants}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaUserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {participants.filter(p => p.status === 'confirmed').length}
                  </p>
                  <p className="text-sm text-gray-600">Confirmadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaUserTimes className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {participants.filter(p => p.status === 'cancelled').length}
                  </p>
                  <p className="text-sm text-gray-600">Canceladas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaCheck className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {participants.filter(p => p.status === 'attended').length}
                  </p>
                  <p className="text-sm text-gray-600">Asistieron</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar por número de registro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="attended">Asistió</option>
                <option value="no_show">No asistió</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de participantes */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="p-12 text-center">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron participantes
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay participantes inscritos en este evento.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Registro</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Fecha de Inscripción</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {participant.registrationNumber || `#${participant.id}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Usuario #{participant.userId}</div>
                          {/* TODO: Mostrar nombre real del usuario cuando esté disponible */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(participant.status)}>
                          {getStatusLabel(participant.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {participant.paymentStatus ? (
                          <Badge variant={participant.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                            {participant.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(participant.registeredAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {participant.checkInTime ? (
                          <div>
                            <div className="text-sm">
                              {new Date(participant.checkInTime).toLocaleString()}
                            </div>
                            {participant.checkOutTime && (
                              <div className="text-xs text-gray-500">
                                Salida: {new Date(participant.checkOutTime).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">No registrado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FaEye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>

                            {participant.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(participant.id, 'confirmed')}>
                                <FaCheck className="mr-2" />
                                Confirmar
                              </DropdownMenuItem>
                            )}

                            {participant.status === 'confirmed' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(participant.id, 'attended')}>
                                  <FaCheck className="mr-2" />
                                  Marcar como asistió
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(participant.id, 'no_show')}>
                                  <FaTimes className="mr-2" />
                                  Marcar como no asistió
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleCancelRegistration(participant.id)}
                              className="text-red-600"
                            >
                              <FaTimes className="mr-2" />
                              Cancelar inscripción
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
              Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalParticipants)} de {totalParticipants} participantes
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
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminEventParticipantsPage