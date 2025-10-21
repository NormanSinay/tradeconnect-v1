import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCreditCard, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaFileAlt, FaUndo, FaCheck, FaTimes, FaClock, FaDownload } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminPaymentService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  PaymentTransaction,
  RefundData,
  RefundInfo,
} from '@/types/admin'

const AdminPaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [payment, setPayment] = useState<PaymentTransaction | null>(null)
  const [refunds, setRefunds] = useState<RefundInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundDescription, setRefundDescription] = useState('')
  const [isProcessingRefund, setIsProcessingRefund] = useState(false)

  // Cargar datos del pago
  const loadPaymentData = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)

      const [paymentData, refundsData] = await Promise.all([
        adminPaymentService.getPaymentTransaction(id),
        adminPaymentService.getRefunds({ transactionId: id }),
      ])

      setPayment(paymentData)
      setRefunds(refundsData.data || [])
    } catch (err) {
      console.error('Error cargando datos del pago:', err)
      setError('Error al cargar los datos del pago')
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pendiente', icon: FaClock },
      processing: { variant: 'default' as const, label: 'Procesando', icon: FaClock },
      completed: { variant: 'default' as const, label: 'Completado', icon: FaCheck },
      failed: { variant: 'destructive' as const, label: 'Fallido', icon: FaTimes },
      cancelled: { variant: 'outline' as const, label: 'Cancelado', icon: FaTimes },
      refunded: { variant: 'secondary' as const, label: 'Reembolsado', icon: FaUndo },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Formatear monto
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency === 'GTQ' ? 'GTQ' : 'USD',
    }).format(amount)
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

  // Procesar reembolso
  const handleRefund = async () => {
    if (!payment || !refundAmount || !refundReason) return

    try {
      setIsProcessingRefund(true)

      const refundData: RefundData = {
        transactionId: payment.id,
        amount: parseFloat(refundAmount),
        reason: refundReason,
        description: refundDescription || undefined,
      }

      await adminPaymentService.processRefund(refundData)

      // Recargar datos
      await loadPaymentData()
      setShowRefundDialog(false)
      setRefundAmount('')
      setRefundReason('')
      setRefundDescription('')
    } catch (err) {
      console.error('Error procesando reembolso:', err)
      setError('Error al procesar el reembolso')
    } finally {
      setIsProcessingRefund(false)
    }
  }

  // Cancelar pago
  const handleCancelPayment = async () => {
    if (!payment) return

    try {
      await adminPaymentService.cancelPayment(payment.id, 'Cancelado por administrador')
      await loadPaymentData()
    } catch (err) {
      console.error('Error cancelando pago:', err)
      setError('Error al cancelar el pago')
    }
  }

  // Calcular monto disponible para reembolso
  const getAvailableRefundAmount = () => {
    if (!payment) return 0

    const totalRefunded = refunds
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0)

    return payment.amount - totalRefunded
  }

  useEffect(() => {
    loadPaymentData()
  }, [id])

  if (isLoading) {
    return (
      <AdminLayout title="Detalle de Pago" breadcrumbs={[]}>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !payment) {
    return (
      <AdminLayout title="Detalle de Pago" breadcrumbs={[]}>
        <div className="space-y-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <FaTimes className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar el pago</h3>
                <p className="text-red-600">{error || 'Pago no encontrado'}</p>
                <Button
                  onClick={() => navigate('/admin/pagos')}
                  className="mt-4"
                >
                  <FaArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Pagos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pagos', href: '/admin/pagos' },
    { label: `Pago ${payment.id.substring(0, 8)}...` },
  ]

  return (
    <AdminLayout title={`Detalle de Pago - ${payment.id.substring(0, 8)}...`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/pagos')}
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pagos
          </Button>

          <div className="flex gap-2">
            <Button variant="outline">
              <FaDownload className="h-4 w-4 mr-2" />
              Recibo
            </Button>

            {payment.status === 'completed' && getAvailableRefundAmount() > 0 && (
              <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FaUndo className="h-4 w-4 mr-2" />
                    Reembolsar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Procesar Reembolso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="refund-amount">Monto a reembolsar</Label>
                      <Input
                        id="refund-amount"
                        type="number"
                        step="0.01"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder={`Máximo: ${formatAmount(getAvailableRefundAmount(), payment.currency)}`}
                        max={getAvailableRefundAmount()}
                      />
                    </div>

                    <div>
                      <Label htmlFor="refund-reason">Motivo del reembolso</Label>
                      <select
                        id="refund-reason"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                      >
                        <option value="">Seleccionar motivo</option>
                        <option value="requested_by_customer">Solicitado por cliente</option>
                        <option value="duplicate">Pago duplicado</option>
                        <option value="fraud">Fraude</option>
                        <option value="product_not_received">Producto no recibido</option>
                        <option value="product_defective">Producto defectuoso</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="refund-description">Descripción (opcional)</Label>
                      <Textarea
                        id="refund-description"
                        value={refundDescription}
                        onChange={(e) => setRefundDescription(e.target.value)}
                        placeholder="Detalles adicionales del reembolso..."
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowRefundDialog(false)}
                        disabled={isProcessingRefund}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleRefund}
                        disabled={isProcessingRefund || !refundAmount || !refundReason}
                      >
                        {isProcessingRefund ? 'Procesando...' : 'Procesar Reembolso'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {(payment.status === 'pending' || payment.status === 'processing') && (
              <Button
                variant="destructive"
                onClick={handleCancelPayment}
              >
                <FaTimes className="h-4 w-4 mr-2" />
                Cancelar Pago
              </Button>
            )}
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaCreditCard className="h-5 w-5" />
                  Información de la Transacción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">ID de Transacción</Label>
                    <p className="font-mono text-sm mt-1">{payment.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Estado</Label>
                    <div className="mt-1">{getStatusBadge(payment.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Monto Total</Label>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatAmount(payment.amount, payment.currency)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Comisión</Label>
                    <p className="text-lg font-semibold text-orange-600 mt-1">
                      {formatAmount(payment.fee, payment.currency)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Monto Neto</Label>
                    <p className="text-lg font-semibold text-blue-600 mt-1">
                      {formatAmount(payment.netAmount, payment.currency)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Pasarela</Label>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {payment.gateway.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-600">Descripción</Label>
                  <p className="mt-1">{payment.description || 'Sin descripción'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
                    <p className="mt-1">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Fecha de Confirmación</Label>
                    <p className="mt-1">
                      {payment.confirmedAt ? formatDate(payment.confirmedAt) : 'No confirmado'}
                    </p>
                  </div>
                </div>

                {payment.gatewayTransactionId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">ID en Pasarela</Label>
                    <p className="font-mono text-sm mt-1">{payment.gatewayTransactionId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de facturación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaUser className="h-5 w-5" />
                  Información de Facturación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nombre Completo</Label>
                    <p className="mt-1">
                      {payment.billingInfo.firstName} {payment.billingInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Correo Electrónico</Label>
                    <p className="mt-1">{payment.billingInfo.email}</p>
                  </div>
                  {payment.billingInfo.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                      <p className="mt-1">{payment.billingInfo.phone}</p>
                    </div>
                  )}
                  {payment.billingInfo.nit && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">NIT</Label>
                      <p className="mt-1">{payment.billingInfo.nit}</p>
                    </div>
                  )}
                  {payment.billingInfo.cui && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">CUI</Label>
                      <p className="mt-1">{payment.billingInfo.cui}</p>
                    </div>
                  )}
                </div>

                {payment.billingInfo.address && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Dirección</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p>{payment.billingInfo.address.street}</p>
                        <p>
                          {payment.billingInfo.address.city}, {payment.billingInfo.address.state}
                        </p>
                        <p>{payment.billingInfo.address.zipCode}, {payment.billingInfo.address.country}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Método de pago */}
            {payment.paymentMethod && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaCreditCard className="h-5 w-5" />
                    Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                      <p className="mt-1 capitalize">
                        {payment.paymentMethod.type.replace('_', ' ')}
                      </p>
                    </div>
                    {payment.paymentMethod.cardBrand && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Marca de Tarjeta</Label>
                        <p className="mt-1 capitalize">{payment.paymentMethod.cardBrand}</p>
                      </div>
                    )}
                    {payment.paymentMethod.cardLastFour && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Últimos 4 dígitos</Label>
                        <p className="mt-1 font-mono">**** **** **** {payment.paymentMethod.cardLastFour}</p>
                      </div>
                    )}
                    {payment.paymentMethod.bankName && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Banco</Label>
                        <p className="mt-1">{payment.paymentMethod.bankName}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reembolsos */}
            {refunds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaUndo className="h-5 w-5" />
                    Historial de Reembolsos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {refunds.map((refund) => (
                      <div key={refund.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Reembolso {refund.id.substring(0, 8)}...</span>
                          {getStatusBadge(refund.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-gray-600">Monto</Label>
                            <p className="font-medium">{formatAmount(refund.amount, payment.currency)}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Motivo</Label>
                            <p>{refund.reason}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Fecha</Label>
                            <p>{formatDate(refund.createdAt)}</p>
                          </div>
                          {refund.processedAt && (
                            <div>
                              <Label className="text-gray-600">Procesado</Label>
                              <p>{formatDate(refund.processedAt)}</p>
                            </div>
                          )}
                        </div>
                        {refund.description && (
                          <div className="mt-2">
                            <Label className="text-gray-600">Descripción</Label>
                            <p className="text-sm">{refund.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto Original</span>
                  <span className="font-medium">{formatAmount(payment.amount, payment.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comisión</span>
                  <span className="font-medium text-orange-600">
                    -{formatAmount(payment.fee, payment.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reembolsos</span>
                  <span className="font-medium text-red-600">
                    -{formatAmount(
                      refunds.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0),
                      payment.currency
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Monto Neto</span>
                  <span className="text-green-600">
                    {formatAmount(
                      payment.netAmount - refunds.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0),
                      payment.currency
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Registro de ID de registro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaFileAlt className="h-5 w-5" />
                  Registro Relacionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-sm font-medium text-gray-600">ID de Registro</Label>
                  <p className="font-mono text-sm mt-1">{payment.registrationId}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate(`/admin/registrations/${payment.registrationId}`)}
                >
                  Ver Registro
                </Button>
              </CardContent>
            </Card>

            {/* Timeline de estados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaCalendarAlt className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Pago creado</p>
                      <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                    </div>
                  </div>

                  {payment.confirmedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Pago confirmado</p>
                        <p className="text-xs text-gray-500">{formatDate(payment.confirmedAt)}</p>
                      </div>
                    </div>
                  )}

                  {refunds.map((refund) => (
                    <div key={refund.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Reembolso procesado</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(refund.createdAt)} - {formatAmount(refund.amount, payment.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminPaymentDetailPage