import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaSave, FaExclamationTriangle, FaMoneyBillWave, FaFileInvoiceDollar, FaCalendarAlt, FaCheck } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { adminRegistrationService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  CancellationReason,
  RefundPolicyResult,
} from '@/types/admin'

interface AdminRegistrationCancelPageProps {
  registrationId: number
}

const AdminRegistrationCancelPage: React.FC<AdminRegistrationCancelPageProps> = ({ registrationId }) => {
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registration, setRegistration] = useState<any>(null)
  const [refundPolicy, setRefundPolicy] = useState<RefundPolicyResult | null>(null)

  // Form data
  const [cancellationData, setCancellationData] = useState({
    reason: 'participant_request' as any,
    customReason: '',
    refundAmount: 0,
    notes: '',
    notifyParticipant: true,
    sendRefundEmail: true,
  })

  // Cargar datos de la inscripción
  useEffect(() => {
    loadRegistration()
    loadRefundPolicy()
  }, [registrationId])

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

  const loadRefundPolicy = async () => {
    try {
      const policy = await adminRegistrationService.getRefundPolicy(registrationId)
      setRefundPolicy(policy)
      setCancellationData(prev => ({
        ...prev,
        refundAmount: policy.refundAmount,
      }))
    } catch (err) {
      console.error('Error cargando política de reembolso:', err)
      // No mostrar error si no hay política
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setCancellationData(prev => ({ ...prev, [field]: value }))
  }

  // Validar formulario
  const validateForm = () => {
    if (!cancellationData.reason) return 'Selecciona una razón de cancelación'
    if (cancellationData.reason === 'other' && !cancellationData.customReason.trim()) {
      return 'Ingresa una razón personalizada'
    }
    if (cancellationData.refundAmount < 0) return 'El monto de reembolso no puede ser negativo'
    if (cancellationData.refundAmount > (registration?.totalAmount || 0)) {
      return 'El monto de reembolso no puede ser mayor al monto total'
    }
    return null
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!confirm('¿Estás seguro de que deseas cancelar esta inscripción? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setCancelling(true)
      setError(null)
      setSuccess(null)

      const reason = cancellationData.reason === 'other'
        ? cancellationData.customReason
        : cancellationData.reason

      await adminRegistrationService.cancelRegistration(
        registrationId,
        reason as CancellationReason,
        cancellationData.refundAmount
      )

      setSuccess('Inscripción cancelada exitosamente')

      // TODO: Navigate back after a delay
      setTimeout(() => {
        window.history.back()
      }, 2000)
    } catch (err) {
      console.error('Error cancelando inscripción:', err)
      setError('Error al cancelar la inscripción')
    } finally {
      setCancelling(false)
    }
  }

  // Obtener texto de razón de cancelación
  const getCancellationReasonText = (reason: CancellationReason) => {
    const texts: Record<string, string> = {
      participant_request: 'Solicitud del participante',
      event_cancelled: 'Evento cancelado',
      duplicate_registration: 'Inscripción duplicada',
      payment_failed: 'Fallo en el pago',
      no_show: 'No presentó',
      other: 'Otra razón',
    }
    return texts[reason as any] || reason
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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Inscripciones', href: '/admin/inscripciones' },
    { label: registration?.registrationCode || `Inscripción #${registrationId}`, href: `/admin/inscripciones/${registrationId}/detalle` },
    { label: 'Cancelar' },
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

  if (error && !registration) {
    return (
      <AdminLayout title="Error" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                {error}
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
    <AdminLayout title={`Cancelar Inscripción ${registration?.registrationCode}`} breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <FaArrowLeft className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Cancelar Inscripción</h1>
              <p className="text-gray-600">{registration?.registrationCode}</p>
            </div>
          </div>
        </div>

        {/* Advertencia */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-yellow-900 mb-2">
                  Advertencia de Cancelación
                </h3>
                <p className="text-yellow-800 mb-4">
                  Estás a punto de cancelar esta inscripción. Esta acción es irreversible y puede involucrar
                  reembolsos o cambios en el estado del participante.
                </p>
                <div className="bg-yellow-100 p-3 rounded-md">
                  <p className="text-sm text-yellow-900">
                    <strong>Nota:</strong> Asegúrate de revisar las políticas de cancelación y reembolso
                    antes de proceder.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la inscripción */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Inscripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Participante</p>
                <p className="font-semibold">{registration.firstName} {registration.lastName}</p>
                <p className="text-sm text-gray-600">{registration.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estado Actual</p>
                <Badge variant={getStatusBadge(registration.status)}>
                  {getStatusText(registration.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-lg font-semibold">Q {registration.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Política de reembolso */}
        {refundPolicy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaMoneyBillWave className="mr-2" />
                Política de Reembolso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Porcentaje de Reembolso</p>
                    <p className="text-lg font-semibold text-green-600">
                      {refundPolicy.refundPercentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monto Sugerido</p>
                    <p className="text-lg font-semibold">Q {refundPolicy.refundAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Política</p>
                    <p className="text-sm">{refundPolicy.policy}</p>
                  </div>
                </div>
                {refundPolicy.conditions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Condiciones:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {refundPolicy.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario de cancelación */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Cancelación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Razón de cancelación */}
              <div>
                <Label className="text-base font-medium">Razón de Cancelación *</Label>
                <RadioGroup
                  value={cancellationData.reason}
                  onValueChange={(value) => handleInputChange('reason', value)}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="participant_request" id="participant_request" />
                    <Label htmlFor="participant_request">Solicitud del participante</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="event_cancelled" id="event_cancelled" />
                    <Label htmlFor="event_cancelled">Evento cancelado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="duplicate_registration" id="duplicate_registration" />
                    <Label htmlFor="duplicate_registration">Inscripción duplicada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="payment_failed" id="payment_failed" />
                    <Label htmlFor="payment_failed">Fallo en el pago</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_show" id="no_show" />
                    <Label htmlFor="no_show">No presentó al evento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Otra razón</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Razón personalizada */}
              {cancellationData.reason === 'other' && (
                <div>
                  <Label htmlFor="customReason">Especificar Razón *</Label>
                  <Textarea
                    id="customReason"
                    value={cancellationData.customReason}
                    onChange={(e) => handleInputChange('customReason', e.target.value)}
                    placeholder="Describe la razón de la cancelación..."
                    required
                  />
                </div>
              )}

              {/* Monto de reembolso */}
              <div>
                <Label htmlFor="refundAmount">Monto de Reembolso (Q)</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={registration?.totalAmount || 0}
                  value={cancellationData.refundAmount}
                  onChange={(e) => handleInputChange('refundAmount', parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Máximo posible: Q {registration?.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Notas adicionales */}
              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={cancellationData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notas adicionales sobre la cancelación..."
                  rows={3}
                />
              </div>

              {/* Opciones de notificación */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifyParticipant"
                    checked={cancellationData.notifyParticipant}
                    onChange={(e) => handleInputChange('notifyParticipant', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="notifyParticipant">Notificar al participante por email</Label>
                </div>
                {cancellationData.refundAmount > 0 && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sendRefundEmail"
                      checked={cancellationData.sendRefundEmail}
                      onChange={(e) => handleInputChange('sendRefundEmail', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="sendRefundEmail">Enviar confirmación de reembolso por email</Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mensajes de error y éxito */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <p className="text-green-700">{success}</p>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={cancelling} className="bg-red-600 hover:bg-red-700">
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelando...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Cancelar Inscripción
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminRegistrationCancelPage