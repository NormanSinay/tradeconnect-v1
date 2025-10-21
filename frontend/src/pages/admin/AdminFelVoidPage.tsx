import React, { useState, useEffect } from 'react'
import { FaBan, FaExclamationTriangle, FaSave, FaTimes, FaFileInvoice, FaUser, FaCalendar, FaDollarSign } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { adminFelService } from '@/services/admin'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type {
  FelInvoice,
  FelInvoiceStatus,
} from '@/types/admin'

const AdminFelVoidPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<FelInvoice | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Cargar datos de la factura
  const loadInvoice = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)

      const invoiceData = await adminFelService.getFelInvoice(id)
      setInvoice(invoiceData)

      // Verificar que la factura puede ser anulada
      if (invoiceData.status === 'cancelled') {
        setError('Esta factura ya está anulada')
      } else if (invoiceData.status !== 'certified') {
        setError('Solo se pueden anular facturas certificadas')
      }
    } catch (err) {
      console.error('Error cargando factura:', err)
      setError('Error al cargar los datos de la factura')
    } finally {
      setIsLoading(false)
    }
  }

  // Procesar anulación
  const handleVoid = async () => {
    if (!invoice || !cancellationReason.trim()) return

    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      await adminFelService.cancelFelInvoice({
        invoiceId: invoice.id,
        reason: cancellationReason.trim(),
        cancelledBy: 1, // TODO: Obtener del contexto de usuario actual
      })

      setSuccess('Factura anulada exitosamente')

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin/facturacion/anuladas')
      }, 2000)
    } catch (err: any) {
      console.error('Error anulando factura:', err)
      setError(err.message || 'Error al anular la factura')
    } finally {
      setIsProcessing(false)
    }
  }

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  // Formatear moneda
  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Obtener badge de estado
  const getStatusBadge = (status: FelInvoiceStatus) => {
    const statusConfig = {
      certified: { variant: 'default' as const, label: 'Certificada', icon: FaFileInvoice },
    }

    const config = statusConfig[status] || statusConfig.certified
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  useEffect(() => {
    loadInvoice()
  }, [id])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Facturación FEL', href: '/admin/facturacion' },
    { label: 'Anular Factura' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Anular Factura FEL" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!invoice) {
    return (
      <AdminLayout title="Anular Factura FEL" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">Factura no encontrada</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  const canVoid = invoice.status === 'certified'

  return (
    <AdminLayout title={`Anular Factura ${invoice.invoiceNumber}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Mensajes de estado */}
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

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advertencia de anulación */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="h-6 w-6 text-orange-500 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-orange-800 mb-2">
                  Advertencia de Anulación
                </h3>
                <p className="text-orange-700 mb-4">
                  Está a punto de anular una factura certificada. Esta acción es irreversible y puede tener
                  implicaciones fiscales. Asegúrese de tener una justificación válida antes de proceder.
                </p>
                <div className="bg-orange-100 p-3 rounded-md">
                  <p className="text-sm text-orange-800">
                    <strong>Nota:</strong> La anulación de facturas debe cumplir con los requisitos del SAT
                    y puede requerir documentación adicional para auditorías.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la factura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaFileInvoice className="h-5 w-5" />
              Información de la Factura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Número</p>
                <p className="font-mono text-sm">{invoice.invoiceNumber}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <div className="mt-1">{getStatusBadge(invoice.status)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="font-medium">{formatCurrency(invoice.total, invoice.currency)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">IVA</p>
                <p>{formatCurrency(invoice.taxAmount, invoice.currency)}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <FaUser className="h-4 w-4" />
                  Cliente
                </Label>
                <p className="mt-1">Usuario #{invoice.userId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <FaCalendar className="h-4 w-4" />
                  Fecha de Emisión
                </Label>
                <p className="mt-1">{invoice.issuedAt ? formatDate(invoice.issuedAt) : '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <FaCalendar className="h-4 w-4" />
                  Fecha de Certificación
                </Label>
                <p className="mt-1">{invoice.paidAt ? formatDate(invoice.paidAt) : '-'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <FaDollarSign className="h-4 w-4" />
                  Subtotal
                </Label>
                <p className="mt-1">{formatCurrency(invoice.subtotal, invoice.currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de anulación */}
        {canVoid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaBan className="h-5 w-5" />
                Datos de Anulación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">
                  Razón de Anulación <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Describa la razón por la cual se está anulando esta factura..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Proporcione una justificación clara y detallada para la anulación
                </p>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notas Adicionales
                </Label>
                <Textarea
                  id="notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Información adicional relevante para la anulación..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/facturacion')}
            disabled={isProcessing}
          >
            <FaTimes className="h-4 w-4 mr-2" />
            Cancelar
          </Button>

          {canVoid && (
            <Button
              variant="destructive"
              onClick={handleVoid}
              disabled={isProcessing || !cancellationReason.trim()}
            >
              <FaBan className="h-4 w-4 mr-2" />
              {isProcessing ? 'Anulando...' : 'Anular Factura'}
            </Button>
          )}
        </div>

        {/* Información adicional */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Información Importante
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• La anulación será reportada al SAT según los requisitos legales</li>
                  <li>• Se generará una nota de crédito automática si es aplicable</li>
                  <li>• El cliente recibirá notificación de la anulación por email</li>
                  <li>• Esta acción quedará registrada en el log de auditoría</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminFelVoidPage