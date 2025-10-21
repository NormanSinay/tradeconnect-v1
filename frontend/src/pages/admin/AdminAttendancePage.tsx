import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaQrcode, FaCheck, FaTimes, FaClock, FaUsers, FaCalendarAlt, FaSearch, FaFilter, FaDownload } from 'react-icons/fa'
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
  AttendanceReport,
  AttendanceInfo,
  AttendanceStatus,
  AttendanceMethod,
} from '@/types/admin'

interface AdminAttendancePageProps {
  eventId: number
}

const AdminAttendancePage: React.FC<AdminAttendancePageProps> = ({ eventId }) => {
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: [] as AttendanceStatus[],
    method: [] as AttendanceMethod[],
  })
  const [event, setEvent] = useState<any>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadEvent()
    loadAttendanceReport()
  }, [eventId])

  // Cargar evento
  const loadEvent = async () => {
    try {
      const eventData = await adminEventService.getEventById(eventId)
      setEvent(eventData)
    } catch (error) {
      console.error('Error cargando evento:', error)
    }
  }

  // Cargar reporte de asistencia
  const loadAttendanceReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const report = await adminRegistrationService.getAttendanceReport(eventId)
      setAttendanceReport(report)
    } catch (err) {
      console.error('Error cargando reporte de asistencia:', err)
      setError('Error al cargar el reporte de asistencia')
    } finally {
      setLoading(false)
    }
  }

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  // Manejar filtros
  const handleFilterChange = (filterType: 'status' | 'method', value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value as any]
        : prev[filterType].filter(item => item !== value)
    }))
  }

  // Manejar selección de asistentes
  const handleSelectAttendee = (registrationId: number, checked: boolean) => {
    setSelectedAttendees(prev =>
      checked
        ? [...prev, registrationId]
        : prev.filter(id => id !== registrationId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (!attendanceReport) return
    setSelectedAttendees(checked ? attendanceReport.attendees.map(a => a.userId) : [])
  }

  // Filtrar asistentes
  const getFilteredAttendees = () => {
    if (!attendanceReport) return []

    return attendanceReport.attendees.filter(attendee => {
      // Filtro de búsqueda
      const matchesSearch = searchTerm === '' ||
        attendee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de estado
      const matchesStatus = filters.status.length === 0 ||
        (attendee.checkInTime && filters.status.includes('checked_in')) ||
        (attendee.checkOutTime && filters.status.includes('checked_out')) ||
        (!attendee.checkInTime && !attendee.checkOutTime && filters.status.includes('no_show'))

      // Filtro de método
      const matchesMethod = filters.method.length === 0 ||
        filters.method.includes(attendee.method)

      return matchesSearch && matchesStatus && matchesMethod
    })
  }

  // Acciones individuales
  const handleMarkAttendance = async (registrationId: number) => {
    try {
      await adminRegistrationService.markAttendance(registrationId, {
        method: 'manual',
        notes: 'Marcado desde reporte de asistencia',
      })
      loadAttendanceReport()
    } catch (error) {
      console.error('Error marcando asistencia:', error)
      setError('Error al marcar asistencia')
    }
  }

  const handleCheckoutAttendance = async (registrationId: number) => {
    try {
      await adminRegistrationService.checkoutAttendance(registrationId, {
        notes: 'Checkout desde reporte de asistencia',
      })
      loadAttendanceReport()
    } catch (error) {
      console.error('Error registrando checkout:', error)
      setError('Error al registrar checkout')
    }
  }

  // Acciones masivas
  const handleBulkMarkAttendance = async () => {
    if (selectedAttendees.length === 0) return

    try {
      // TODO: Implement bulk attendance marking
      console.log('Bulk mark attendance for:', selectedAttendees)
      loadAttendanceReport()
    } catch (error) {
      console.error('Error marcando asistencia masiva:', error)
      setError('Error al marcar asistencia masiva')
    }
  }

  const handleBulkExport = async () => {
    try {
      const blob = await adminRegistrationService.exportAttendanceReport(eventId, 'excel')
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `asistencia_evento_${eventId}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exportando asistencia:', error)
      setError('Error al exportar el reporte de asistencia')
    }
  }

  // Obtener badge de estado de asistencia
  const getAttendanceStatusBadge = (attendee: any) => {
    if (attendee.checkOutTime) {
      return <Badge variant="default">Completado</Badge>
    } else if (attendee.checkInTime) {
      return <Badge variant="secondary">Check-in</Badge>
    } else {
      return <Badge variant="destructive">No Show</Badge>
    }
  }

  // Obtener texto de método de asistencia
  const getMethodText = (method: AttendanceMethod) => {
    const texts: Record<AttendanceMethod, string> = {
      qr_scan: 'QR',
      manual: 'Manual',
      rfid: 'RFID',
      biometric: 'Biométrico',
      other: 'Otro',
    }
    return texts[method] || method
  }

  // Calcular estadísticas
  const getStats = () => {
    if (!attendanceReport) return { total: 0, checkedIn: 0, checkedOut: 0, noShow: 0 }

    const attendees = getFilteredAttendees()
    const checkedIn = attendees.filter(a => a.checkInTime).length
    const checkedOut = attendees.filter(a => a.checkOutTime).length
    const noShow = attendees.length - checkedIn

    return {
      total: attendees.length,
      checkedIn,
      checkedOut,
      noShow,
    }
  }

  const stats = getStats()
  const filteredAttendees = getFilteredAttendees()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/events' },
    { label: event?.title || 'Evento', href: `/admin/events/${eventId}/editar` },
    { label: 'Asistencia' },
  ]

  if (loading) {
    return (
      <AdminLayout title="Cargando..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Asistencia - ${event?.title || 'Evento'}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <FaArrowLeft className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Control de Asistencia</h1>
              <p className="text-gray-600">{event?.title || `Evento #${eventId}`}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={handleBulkMarkAttendance} disabled={selectedAttendees.length === 0}>
              <FaCheck className="mr-2" />
              Marcar Asistencia ({selectedAttendees.length})
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
                  <p className="text-sm font-medium text-gray-600">Total Inscritos</p>
                  <p className="text-lg font-semibold">{attendanceReport?.totalRegistrations || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Asistentes</p>
                  <p className="text-lg font-semibold text-green-600">{attendanceReport?.totalAttendees || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Asistencia</p>
                  <p className="text-lg font-semibold">
                    {attendanceReport ? Math.round(attendanceReport.attendanceRate * 100) : 0}%
                  </p>
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
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FaCheck className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Check-in</p>
                  <p className="text-2xl font-bold">{stats.checkedIn}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FaClock className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completado</p>
                  <p className="text-2xl font-bold">{stats.checkedOut}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FaTimes className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">No Show</p>
                  <p className="text-2xl font-bold">{stats.noShow}</p>
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
                  placeholder="Buscar por nombre, email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <select
                  value=""
                  onChange={(e) => handleFilterChange('status', e.target.value, true)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="checked_in">Check-in</option>
                  <option value="checked_out">Completado</option>
                  <option value="no_show">No Show</option>
                </select>

                <select
                  value=""
                  onChange={(e) => handleFilterChange('method', e.target.value, true)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los métodos</option>
                  <option value="qr_scan">QR</option>
                  <option value="manual">Manual</option>
                  <option value="rfid">RFID</option>
                  <option value="biometric">Biométrico</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de asistencia */}
        <Card>
          <CardContent className="p-0">
            {filteredAttendees.length === 0 ? (
              <div className="p-12 text-center">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron asistentes
                </h3>
                <p className="text-gray-600">
                  {searchTerm || Object.values(filters).some(f => f.length > 0)
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay registros de asistencia para este evento.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendees.map((attendee) => (
                    <TableRow key={attendee.userId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAttendees.includes(attendee.userId)}
                          onCheckedChange={(checked) => handleSelectAttendee(attendee.userId, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {attendee.firstName} {attendee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendee.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAttendanceStatusBadge(attendee)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {attendee.checkInTime ? formatDateTime(attendee.checkInTime) : 'No registrado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {attendee.checkOutTime ? formatDateTime(attendee.checkOutTime) : 'No registrado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {attendee.duration ? `${Math.floor(attendee.duration / 60)}h ${attendee.duration % 60}m` : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getMethodText(attendee.method)}
                        </Badge>
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
                            {!attendee.checkInTime && (
                              <DropdownMenuItem onClick={() => handleMarkAttendance(attendee.userId)}>
                                <FaCheck className="mr-2" />
                                Marcar Check-in
                              </DropdownMenuItem>
                            )}
                            {attendee.checkInTime && !attendee.checkOutTime && (
                              <DropdownMenuItem onClick={() => handleCheckoutAttendance(attendee.userId)}>
                                <FaClock className="mr-2" />
                                Registrar Check-out
                              </DropdownMenuItem>
                            )}
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

export default AdminAttendancePage