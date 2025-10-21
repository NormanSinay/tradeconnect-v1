import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaCreditCard, FaEye, FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaDownload, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface PaymentDetail {
  id: string
  transactionId: string
  eventTitle: string
  eventDate: string
  amount: number
  currency: string
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'stripe' | 'fel'
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled'
  createdAt: string
  completedAt?: string
  failedAt?: string
  refundedAt?: string
  refundAmount?: number
  fees?: number
  netAmount?: number
  gatewayReference?: string
  invoiceNumber?: string
  receiptUrl?: string
  paymentMethodDetails?: {
    cardLast4?: string
    cardBrand?: string
    paypalEmail?: string
    bankAccount?: string
  }
  timeline: Array<{
    timestamp: string
    action: string
    description: string
    status: 'success' | 'warning' | 'error'
  }>
}

export const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [payment, setPayment] = useState<PaymentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPaymentDetail()
    }
  }, [id])

  const fetchPaymentDetail = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get(`/user/payments/${id}`)

      // Mock payment detail
      const mockPayment: PaymentDetail = {
        id: id || 'payment-1',
        transactionId: 'TXN-2024-001',
        eventTitle: 'Conferencia Anual de Innovación Tecnológica',
        eventDate: '2024-01-25',
        amount: 150.00,
        currency: 'GTQ',
        method: 'credit_card',
        status: 'completed',
        createdAt: '2024-01-18T14:30:00Z',
        completedAt: '2024-01-18T14:31:00Z',
        fees: 4.50,
        netAmount: 145.50,
        gatewayReference: 'ch_1234567890',
        invoiceNumber: 'FAC-2024-001',
        receiptUrl: '/api/payments/1/receipt',
        paymentMethodDetails: {
          cardLast4: '4242',
          cardBrand: 'Visa'
        },
        timeline: [
          {
            timestamp: '2024-01-18T14:30:00Z',
            action: 'payment_initiated',
            description: 'Pago iniciado con tarjeta de crédito',
            status: 'success'
          },
          {
            timestamp: '2024-01-18T14:30:15Z',
            action: 'payment_processing',
            description: 'Procesando pago con gateway',
            status: 'success'
          },
          {
            timestamp: '2024-01-18T14:31:00Z',
            action: 'payment_completed',
            description: 'Pago completado exitosamente',
            status: 'success'
          }
        ]
      }

      setPayment(mockPayment)
    } catch (error) {
      console.error('Error fetching payment detail:', error)
      showToast.error('Error al cargar los detalles del pago')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReceipt = async () => {
    if (!payment || !payment.receiptUrl) return

    try {
      setIsDownloading(true)

      // In a real app, you would call your API
      // const response = await api.get(payment.receiptUrl, { responseType: 'blob' })

      // Mock download
      const content = `
RECIBO DE PAGO
==============

ID de Pago: ${payment.id}
ID de Transacción: ${payment.transactionId}
Evento: ${payment.eventTitle}
Fecha del evento: ${payment.eventDate}
Monto: ${payment.currency} ${payment.amount.toFixed(2)}
Método: ${getMethodName(payment.method)}
Estado: ${payment.status}
Fecha de creación: ${new Date(payment.createdAt).toLocaleDateString('es-GT')}
${payment.completedAt ? `Fecha de completado: ${new Date(payment.completedAt).toLocaleDateString('es-GT')}` : ''}
${payment.failedAt ? `Fecha de fallo: ${new Date(payment.failedAt).toLocaleDateString('es-GT')}` : ''}
${payment.refundedAt ? `Fecha de reembolso: ${new Date(payment.refundedAt).toLocaleDateString('es-GT')}` : ''}
${payment.refundAmount ? `Monto reembolsado: ${payment.currency} ${payment.refundAmount.toFixed(2)}` : ''}
${payment.fees ? `Comisiones: ${payment.currency} ${payment.fees.toFixed(2)}` : ''}
${payment.netAmount ? `Monto neto: ${payment.currency} ${payment.netAmount.toFixed(2)}` : ''}
${payment.gatewayReference ? `Referencia gateway: ${payment.gatewayReference}` : ''}
${payment.invoiceNumber ? `Número de factura: ${payment.invoiceNumber}` : ''}
${payment.paymentMethodDetails?.cardLast4 ? `Tarjeta terminada en: **** ${payment.paymentMethodDetails.cardLast4}` : ''}
${payment.paymentMethodDetails?.cardBrand ? `Marca: ${payment.paymentMethodDetails.cardBrand}` : ''}
      `.trim()

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recibo-${payment.transactionId}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast.success('Recibo descargado exitosamente')
    } catch (error) {
      console.error('Error downloading receipt:', error)
      showToast.error('Error al descargar el recibo')
    } finally {
      setIsDownloading(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <FaCreditCard className="h-5 w-5 text-blue-600" />
      case 'paypal':
        return <FaCreditCard className="h-5 w-5 text-blue-600" />
      case 'bank_transfer':
        return <FaCreditCard className="h-5 w-5 text-green-600" />
      case 'cash':
        return <FaCreditCard className="h-5 w-5 text-green-600" />
      case 'stripe':
        return <FaCreditCard className="h-5 w-5 text-purple-600" />
      case 'fel':
        return <FaCreditCard className="h-5 w-5 text-orange-600" />
      default:
        return <FaCreditCard className="h-5 w-5 text-gray-600" />
    }
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Tarjeta de Crédito'
      case 'paypal':
        return 'PayPal'
      case 'bank_transfer':
        return 'Transferencia Bancaria'
      case 'cash':
        return 'Efectivo'
      case 'stripe':
        return 'Stripe'
      case 'fel':
        return 'FEL'
      default:
        return 'Desconocido'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><FaCheckCircle className="mr-1 h-3 w-3" />Completado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><FaClock className="mr-1 h-3 w-3" />Pendiente</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><FaTimesCircle className="mr-1 h-3 w-3" />Fallido</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800"><FaCheckCircle className="mr-1 h-3 w-3" />Reembolsado</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><FaTimesCircle className="mr-1 h-3 w-3" />Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <FaTimesCircle className="h-4 w-4 text-red-500" />
      default:
        return <FaClock className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Pago no encontrado</h2>
          <p className="mt-2 text-sm text-gray-600">
            No se pudo encontrar el pago solicitado.
          </p>
          <Button onClick={() => navigate('/mis-pagos')} className="mt-4">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis pagos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/mis-pagos')}
            className="mb-4"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis pagos
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Detalle del Pago</h1>
          <p className="text-gray-600 mt-1">
            Información completa de tu transacción
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {getMethodIcon(payment.method)}
                      <span className="ml-2">{payment.transactionId}</span>
                    </CardTitle>
                    <CardDescription>
                      {payment.eventTitle}
                    </CardDescription>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha del evento</label>
                    <p className="text-lg font-semibold">
                      {new Date(payment.eventDate).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Monto total</label>
                    <p className="text-2xl font-bold text-green-600">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Método de pago</label>
                    <p className="text-lg font-semibold">{getMethodName(payment.method)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de creación</label>
                    <p className="text-lg font-semibold">
                      {new Date(payment.createdAt).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Details */}
            {payment.paymentMethodDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles del Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {payment.paymentMethodDetails.cardLast4 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tarjeta</label>
                        <p>**** **** **** {payment.paymentMethodDetails.cardLast4}</p>
                      </div>
                    )}
                    {payment.paymentMethodDetails.cardBrand && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Marca</label>
                        <p>{payment.paymentMethodDetails.cardBrand}</p>
                      </div>
                    )}
                    {payment.paymentMethodDetails.paypalEmail && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email PayPal</label>
                        <p>{payment.paymentMethodDetails.paypalEmail}</p>
                      </div>
                    )}
                    {payment.paymentMethodDetails.bankAccount && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Cuenta bancaria</label>
                        <p>{payment.paymentMethodDetails.bankAccount}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desglose Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monto del evento:</span>
                    <span className="font-semibold">{payment.currency} {payment.amount.toFixed(2)}</span>
                  </div>
                  {payment.fees && (
                    <div className="flex justify-between text-gray-600">
                      <span>Comisiones:</span>
                      <span>-{payment.currency} {payment.fees.toFixed(2)}</span>
                    </div>
                  )}
                  {payment.netAmount && (
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Monto neto:</span>
                      <span>{payment.currency} {payment.netAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {payment.refundAmount && (
                    <div className="flex justify-between text-blue-600 font-semibold">
                      <span>Reembolsado:</span>
                      <span>-{payment.currency} {payment.refundAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Línea de Tiempo</CardTitle>
                <CardDescription>
                  Historial completo de la transacción
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payment.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTimelineIcon(event.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {event.action.replace(/_/g, ' ')}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString('es-GT', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Rápida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID de Transacción</label>
                    <p className="text-sm font-mono break-all">{payment.transactionId}</p>
                  </div>
                  {payment.gatewayReference && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Referencia Gateway</label>
                      <p className="text-sm font-mono break-all">{payment.gatewayReference}</p>
                    </div>
                  )}
                  {payment.invoiceNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Factura</label>
                      <p className="text-sm font-semibold text-blue-600">{payment.invoiceNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payment.receiptUrl && (
                  <Button
                    onClick={downloadReceipt}
                    disabled={isDownloading}
                    className="w-full"
                    variant="default"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Descargando...
                      </>
                    ) : (
                      <>
                        <FaDownload className="mr-2 h-4 w-4" />
                        Descargar Recibo
                      </>
                    )}
                  </Button>
                )}
                {payment.invoiceNumber && (
                  <Button
                    onClick={() => navigate(`/factura/${payment.id}`)}
                    className="w-full"
                    variant="outline"
                  >
                    <FaEye className="mr-2 h-4 w-4" />
                    Ver Factura
                  </Button>
                )}
                <Button
                  onClick={() => navigate('/mis-pagos')}
                  variant="ghost"
                  className="w-full"
                >
                  <FaArrowLeft className="mr-2 h-4 w-4" />
                  Ver todos los pagos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}