import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaEdit, FaTrash, FaCheck, FaTimes, FaDownload, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaBuilding, FaCreditCard, FaClock, FaFileInvoiceDollar, FaQrcode, FaMapMarkerAlt } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
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
import { adminRegistrationService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  RegistrationResponse,
  AttendanceInfo,
  AttendanceStatus,
} from '@/types/admin'

interface AdminRegistrationDetailPageProps {
  registrationId: number
}

const AdminRegistrationDetailPage: React.FC<AdminRegistrationDetailPageProps> = ({ registrationId }) => {
  const [registration, setRegistration] = useState<any>(null)
  const [attendance, setAttendance] = useState<AttendanceInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadRegistration()
    loadAttendance()
  }, [registrationId])

  // Cargar inscripción
  const loadRegistration = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminRegistrationService.getRegistrationById(registrationId)
      setRegistration(data)
    } catch (err) {
      console.error('Error cargando inscripción:', err)
      setError('Error al cargar la inscripción')
    } finally {
      setLoading(false)
    }
  }

  // Cargar información de asistencia
  const loadAttendance = async () => {
    try {
      const data = await adminRegistrationService.getAttendanceInfo(registrationId)
      setAttendance(data)
    } catch (err) {
      console.error('Error cargando asistencia:', err)
      // No mostrar error si no hay asistencia
    }
  }

  // Acciones
  const handleEditRegistration = () => {
    // TODO: Navigate to edit
    console.log('Edit registration:', registration)
  }

  const handleCancelRegistration = () => {
    // TODO: Navigate to cancel
    console.log('Cancel registration:', registration)
  }

  const handleConfirmRegistration = async () => {
    try {
      await adminRegistrationService.confirmRegistration(registrationId)
      loadRegistration()
    } catch (error) {
      console.error('Error confirmando inscripción:', error)
      setError('Error al confirmar la inscripción')
    }
  }

  const handleDeleteRegistration = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta inscripción? Esta acción no se puede deshacer.')) return

    try {
      // TODO: Implement delete method
      console.log('Delete registration:', registrationId)
      // TODO: Navigate back
    } catch (err) {
      console.error('Error eliminando inscripción:', err)
      setError('Error al eliminar la inscripción')
    }
  }

  const handleMarkAttendance = async () => {
    try {
      await adminRegistrationService.markAttendance(registrationId, {
        method: 'manual',
        notes: 'Marcado desde panel administrativo',
      })
      loadAttendance()
    } catch (error) {
      console.error('Error marcando asistencia:', error)
      setError('Error al marcar asistencia')
    }
  }

  const handleCheckoutAttendance = async () => {
    try {
      await adminRegistrationService.checkoutAttendance(registrationId, {
        notes: 'Checkout desde panel administrativo',
      })
      loadAttendance()
    } catch (error) {
      console.error('Error registrando checkout:', error)
      setError('Error al registrar checkout')
    }
  }

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      BORRADOR: 'secondary',
      PENDIENTE_PAGO: 'outline',
      PAGADO: 'default',
      CONFIRMADO: 'default',
      CANCELADO: 'destructive',
      EXPIRADO: 'destructive',
      REEMBOLSADO: 'destructive',
    }
    return variants[status] || 'secondary'
  }

  // Obtener texto de estado
  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      BORRADOR: 'Borrador',
      PENDIENTE_PAGO: 'Pendiente de Pago',
      PAGADO: 'Pagado',
      CONFIRMADO: 'Confirmado',
      CANCELADO: 'Cancelado',
      EXPIRADO: 'Expirado',
      REEMBOLSADO: 'Reembolsado',
    }
    return texts[status] || status
  }

  // Obtener texto de tipo de participante
  const getParticipantTypeText = (type: string) => {
    const texts: Record<string, string> = {
      individual: 'Individual',
      empresa: 'Empresa',
    }
    return texts[type] || type
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Inscripciones', href: '/admin/inscripciones' },
    { label: registration?.registrationCode || `Inscripción #${registrationId}`, href: '#' },
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

  if (error || !registration) {
    return (
      <AdminLayout title="Error" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <FaTimes className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                {error || 'Inscripción no encontrada'}
              </h3>
              <Button onClick={() => window.history.back()}>
                <FaArrowLeft className="mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Inscripción ${registration.registrationCode}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <FaArrowLeft className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Inscripción {registration.registrationCode}</h1>
              <p className="text-gray-600">ID: {registration.registrationId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleEditRegistration}>
              <FaEdit className="mr-2" />
              Editar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FaDownload className="mr-2" />
                  Acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                {registration.status === 'PENDIENTE_PAGO' && (
                  <DropdownMenuItem onClick={handleConfirmRegistration}>
                    <FaCheck className="mr-2" />
                    Confirmar
                  </DropdownMenuItem>
                )}
                {registration.status !== 'CANCELADO' && registration.status !== 'REEMBOLSADO' && (
                  <DropdownMenuItem onClick={handleCancelRegistration}>
                    <FaTimes className="mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteRegistration}
                  className="text-red-600"
                >
                  <FaTrash className="mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del participante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaUser className="mr-2" />
                Información del Participante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre completo</p>
                <p className="text-lg font-semibold">{registration.firstName} {registration.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tipo de participante</p>
                <Badge variant="outline">{getParticipantTypeText(registration.participantType)}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  {registration.email}
                </p>
              </div>
              {registration.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Teléfono</p>
                  <p className="flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    {registration.phone}
                  </p>
                </div>
              )}
              {registration.companyName && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Empresa</p>
                  <p className="flex items-center">
                    <FaBuilding className="mr-2 text-gray-400" />
                    {registration.companyName}
                  </p>
                </div>
              )}
              {registration.position && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Cargo</p>
                  <p>{registration.position}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCreditCard className="mr-2" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <Badge variant={getStatusBadge(registration.status)}>
                  {getStatusText(registration.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monto total</p>
                <p className="text-2xl font-bold text-green-600">Q {registration.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Código de registro</p>
                <p className="font-mono text-sm">{registration.registrationCode}</p>
              </div>
              {registration.nit && (
                <div>
                  <p className="text-sm font-medium text-gray-600">NIT</p>
                  <p className="font-mono text-sm">{registration.nit}</p>
                </div>
              )}
              {registration.cui && (
                <div>
                  <p className="text-sm font-medium text-gray-600">CUI</p>
                  <p className="font-mono text-sm">{registration.cui}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del evento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                Información del Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Evento</p>
                <p className="font-semibold">Evento #{registration.eventId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de registro</p>
                <p className="flex items-center">
                  <FaClock className="mr-2 text-gray-400" />
                  {formatDateTime(new Date())} {/* TODO: Add registration date */}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asistencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FaQrcode className="mr-2" />
                Control de Asistencia
              </span>
              {!attendance?.checkInTime && (
                <Button onClick={handleMarkAttendance}>
                  <FaCheck className="mr-2" />
                  Marcar Asistencia
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Check-in</p>
                    <p className="text-lg font-semibold">
                      {attendance.checkInTime ? formatDateTime(attendance.checkInTime) : 'No registrado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Check-out</p>
                    <p className="text-lg font-semibold">
                      {attendance.checkOutTime ? formatDateTime(attendance.checkOutTime) : 'No registrado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Duración</p>
                    <p className="text-lg font-semibold">
                      {attendance.duration ? `${Math.floor(attendance.duration / 60)}h ${attendance.duration % 60}m` : 'N/A'}
                    </p>
                  </div>
                </div>
                {attendance.checkInTime && !attendance.checkOutTime && (
                  <Button onClick={handleCheckoutAttendance}>
                    <FaTimes className="mr-2" />
                    Registrar Check-out
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaQrcode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No hay información de asistencia registrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campos personalizados */}
        {registration.customFields && Object.keys(registration.customFields).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(registration.customFields).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-gray-600">{key}</p>
                    <p>{String(value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

export default AdminRegistrationDetailPage