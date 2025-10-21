import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaCreditCard, FaDownload, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaFileInvoice } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface PaymentReceipt {
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
  receiptNumber: string
  receiptUrl?: string
  paymentMethodDetails?: {
    cardLast4?: string
    cardBrand?: string
    paypalEmail?: string
    bankAccount?: string
  }
}

export const PaymentReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [payment, setPayment] = useState<PaymentReceipt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPaymentReceipt()
    }
  }, [id])

  const fetchPaymentReceipt = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get(`/user/payments/${id}/receipt`)

      // Mock payment receipt
      const mockPayment: PaymentReceipt = {
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
        receiptNumber: 'REC-2024-001',
        receiptUrl: '/api/payments/1/receipt',
        paymentMethodDetails: {
          cardLast4: '4242',
          cardBrand: 'Visa'
        }
      }

      setPayment(mockPayment)
    } catch (error) {
      console.error('Error fetching payment receipt:', error)
      showToast.error('Error al cargar el comprobante de pago')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReceipt = async () => {
    if (!payment) return

    try {
      setIsDownloading(true)

      // In a real app, you would call your API
      // const response = await api.get(payment.receiptUrl, { responseType: 'blob' })

      // Mock download - create a formatted receipt
      const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Comprobante de Pago - ${payment.receiptNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .receipt-number { font-size: 18px; margin: 10px 0; }
        .details { margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #059669; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">TradeConnect</div>
        <div class="receipt-number">Comprobante de Pago #${payment.receiptNumber}</div>
        <div>Fecha: ${new Date().toLocaleDateString('es-GT')}</div>
    </div>

    <div class="details">
        <div class="detail-row">
            <span>ID de Transacción:</span>
            <span>${payment.transactionId}</span>
        </div>
        <div class="detail-row">
            <span>Evento:</span>
            <span>${payment.eventTitle}</span>
        </div>
        <div class="detail-row">
            <span>Fecha del evento:</span>
            <span>${new Date(payment.eventDate).toLocaleDateString('es-GT')}</span>
        </div>
        <div class="detail-row">
            <span>Método de pago:</span>
            <span>${getMethodName(payment.method)}</span>
        </div>
        <div class="detail-row">
            <span>Estado:</span>
            <span>${payment.status}</span>
        </div>
        <div class="detail-row">
            <span>Fecha de pago:</span>
            <span>${new Date(payment.completedAt || payment.createdAt).toLocaleDateString('es-GT')}</span>
        </div>
        ${payment.paymentMethodDetails?.cardLast4 ? `
        <div class="detail-row">
            <span>Tarjeta:</span>
            <span>**** **** **** ${payment.paymentMethodDetails.cardLast4}</span>
        </div>
        ` : ''}
        ${payment.gatewayReference ? `
        <div class="detail-row">
            <span>Referencia:</span>
            <span>${payment.gatewayReference}</span>
        </div>
        ` : ''}
        <div class="detail-row">
            <span>Subtotal:</span>
            <span>${payment.currency} ${payment.amount.toFixed(2)}</span>
        </div>
        ${payment.fees ? `
        <div class="detail-row">
            <span>Comisiones:</span>
            <span>${payment.currency} ${payment.fees.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="detail-row total">
            <span>Total pagado:</span>
            <span>${payment.currency} ${(payment.netAmount || payment.amount).toFixed(2)}</span>
        </div>
        ${payment.refundAmount ? `
        <div class="detail-row">
            <span>Reembolsado:</span>
            <span>${payment.currency} ${payment.refundAmount.toFixed(2)}</span>
        </div>
        ` : ''}
    </div>

    <div class="footer">
        <p>Este comprobante es válido como recibo oficial de pago.</p>
        <p>TradeConnect S.A. - Todos los derechos reservados</p>
        <p>Generado el ${new Date().toLocaleString('es-GT')}</p>
    </div>
</body>
</html>`

      const blob = new Blob([receiptHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `comprobante-${payment.receiptNumber}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast.success('Comprobante descargado exitosamente')
    } catch (error) {
      console.error('Error downloading receipt:', error)
      showToast.error('Error al descargar el comprobante')
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
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Reembolsado</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
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
          <h2 className="mt-4 text-lg font-medium text-gray-900">Comprobante no encontrado</h2>
          <p className="mt-2 text-sm text-gray-600">
            No se pudo encontrar el comprobante de pago solicitado.
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
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900">Comprobante de Pago</h1>
          <p className="text-gray-600 mt-1">
            Recibo oficial de tu transacción
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {getMethodIcon(payment.method)}
              </div>
              <CardTitle className="text-2xl">Comprobante #{payment.receiptNumber}</CardTitle>
              <CardDescription>
                {payment.eventTitle}
              </CardDescription>
              <div className="mt-4">
                {getStatusBadge(payment.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Receipt Details */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ID de Transacción:</span>
                  <p className="font-mono text-xs mt-1">{payment.transactionId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fecha del evento:</span>
                  <p className="mt-1">{new Date(payment.eventDate).toLocaleDateString('es-GT')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Método de pago:</span>
                  <p className="mt-1">{getMethodName(payment.method)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fecha de pago:</span>
                  <p className="mt-1">
                    {new Date(payment.completedAt || payment.createdAt).toLocaleDateString('es-GT')}
                  </p>
                </div>
              </div>

              {payment.paymentMethodDetails && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Detalles del pago</h4>
                  <div className="space-y-1 text-sm">
                    {payment.paymentMethodDetails.cardLast4 && (
                      <p><span className="font-medium">Tarjeta:</span> **** **** **** {payment.paymentMethodDetails.cardLast4}</p>
                    )}
                    {payment.paymentMethodDetails.cardBrand && (
                      <p><span className="font-medium">Marca:</span> {payment.paymentMethodDetails.cardBrand}</p>
                    )}
                    {payment.gatewayReference && (
                      <p><span className="font-medium">Referencia:</span> {payment.gatewayReference}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Resumen financiero</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monto del evento:</span>
                    <span>{payment.currency} {payment.amount.toFixed(2)}</span>
                  </div>
                  {payment.fees && (
                    <div className="flex justify-between text-gray-600">
                      <span>Comisiones:</span>
                      <span>-{payment.currency} {payment.fees.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total pagado:</span>
                    <span className="text-green-600">{payment.currency} {(payment.netAmount || payment.amount).toFixed(2)}</span>
                  </div>
                  {payment.refundAmount && (
                    <div className="flex justify-between text-blue-600">
                      <span>Reembolsado:</span>
                      <span>-{payment.currency} {payment.refundAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Link */}
            {payment.invoiceNumber && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <FaFileInvoice className="inline mr-2 h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Factura disponible</span>
                    <p className="text-sm text-blue-700">Número: {payment.invoiceNumber}</p>
                  </div>
                  <Button
                    onClick={() => navigate(`/factura/${payment.id}`)}
                    variant="outline"
                    size="sm"
                  >
                    Ver factura
                  </Button>
                </div>
              </div>
            )}

            {/* Download Button */}
            <div className="text-center">
              <Button
                onClick={downloadReceipt}
                disabled={isDownloading}
                size="lg"
                className="px-8"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Descargando...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2 h-5 w-5" />
                    Descargar Comprobante
                  </>
                )}
              </Button>
            </div>

            {/* Footer Information */}
            <div className="text-center text-sm text-gray-600">
              <p>Este comprobante es válido como recibo oficial de pago.</p>
              <p className="mt-1">TradeConnect S.A. - Todos los derechos reservados</p>
              <p className="mt-1">Generado el {new Date().toLocaleDateString('es-GT')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}