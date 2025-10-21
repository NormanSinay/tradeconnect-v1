import React, { useState, useEffect } from 'react'
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationTriangle, FaEye, FaDownload, FaFileInvoice } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface Payment {
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
}

export const UserPaymentsPage: React.FC = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, methodFilter])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get('/user/payments')

      // Mock payments data
      const mockPayments: Payment[] = [
        {
          id: '1',
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
          receiptUrl: '/api/payments/1/receipt'
        },
        {
          id: '2',
          transactionId: 'TXN-2024-002',
          eventTitle: 'Taller de Liderazgo Empresarial',
          eventDate: '2024-01-18',
          amount: 200.00,
          currency: 'GTQ',
          method: 'paypal',
          status: 'completed',
          createdAt: '2024-01-15T10:15:00Z',
          completedAt: '2024-01-15T10:16:00Z',
          fees: 6.00,
          netAmount: 194.00,
          gatewayReference: 'PAY-987654321',
          invoiceNumber: 'FAC-2024-002',
          receiptUrl: '/api/payments/2/receipt'
        },
        {
          id: '3',
          transactionId: 'TXN-2024-003',
          eventTitle: 'Seminario de Desarrollo Personal',
          eventDate: '2024-01-12',
          amount: 100.00,
          currency: 'GTQ',
          method: 'bank_transfer',
          status: 'pending',
          createdAt: '2024-01-10T09:00:00Z',
          receiptUrl: '/api/payments/3/receipt'
        },
        {
          id: '4',
          transactionId: 'TXN-2024-004',
          eventTitle: 'Workshop de Marketing Digital',
          eventDate: '2024-01-30',
          amount: 250.00,
          currency: 'GTQ',
          method: 'stripe',
          status: 'failed',
          createdAt: '2024-01-20T11:30:00Z',
          failedAt: '2024-01-20T11:31:00Z',
          receiptUrl: '/api/payments/4/receipt'
        },
        {
          id: '5',
          transactionId: 'TXN-2024-005',
          eventTitle: 'Conferencia de Tecnología Avanzada',
          eventDate: '2024-01-08',
          amount: 180.00,
          currency: 'GTQ',
          method: 'fel',
          status: 'refunded',
          createdAt: '2024-01-05T16:45:00Z',
          completedAt: '2024-01-05T16:46:00Z',
          refundedAt: '2024-01-07T10:00:00Z',
          refundAmount: 180.00,
          fees: 5.40,
          netAmount: 174.60,
          gatewayReference: 'FEL-456789123',
          invoiceNumber: 'FAC-2024-005',
          receiptUrl: '/api/payments/5/receipt'
        }
      ]

      setPayments(mockPayments)
    } catch (error) {
      console.error('Error fetching payments:', error)
      showToast.error('Error al cargar los pagos')
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter)
    }

    setFilteredPayments(filtered)
  }

  const downloadReceipt = async (payment: Payment) => {
    try {
      if (!payment.receiptUrl) {
        showToast.error('URL de recibo no disponible')
        return
      }

      // In a real app, you would call your API
      // const response = await api.get(payment.receiptUrl, { responseType: 'blob' })

      // Mock download - create a simple receipt content
      const content = `
RECIBO DE PAGO
==============

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
    }
  }

  const viewPaymentDetails = (payment: Payment) => {
    // In a real app, you would open a modal or navigate to a detailed view
    showToast.info(`Viendo detalles del pago ${payment.transactionId}`)
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <FaCreditCard className="h-4 w-4 text-blue-600" />
      case 'paypal':
        return <FaPaypal className="h-4 w-4 text-blue-600" />
      case 'bank_transfer':
        return <FaMoneyBillWave className="h-4 w-4 text-green-600" />
      case 'cash':
        return <FaMoneyBillWave className="h-4 w-4 text-green-600" />
      case 'stripe':
        return <FaCreditCard className="h-4 w-4 text-purple-600" />
      case 'fel':
        return <FaFileInvoice className="h-4 w-4 text-orange-600" />
      default:
        return <FaCreditCard className="h-4 w-4 text-gray-600" />
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <FaClock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />
      case 'refunded':
        return <FaCheckCircle className="h-5 w-5 text-blue-500" />
      case 'cancelled':
        return <FaTimesCircle className="h-5 w-5 text-gray-500" />
      default:
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    refundedAmount: payments.reduce((sum, p) => sum + (p.refundAmount || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historial de Pagos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus transacciones y descargas recibos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaCreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaCheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaClock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaTimesCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fallidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">Q</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total pagado</p>
                  <p className="text-2xl font-bold text-gray-900">Q{stats.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">Q</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reembolsado</p>
                  <p className="text-2xl font-bold text-gray-900">Q{stats.refundedAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Input
                  placeholder="Buscar por evento, transacción o factura..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="failed">Fallidos</SelectItem>
                  <SelectItem value="refunded">Reembolsados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="fel">FEL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaCreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pagos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes pagos que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <CardTitle className="text-lg">{payment.transactionId}</CardTitle>
                        <CardDescription className="text-sm">
                          {payment.eventTitle}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Fecha del evento</p>
                      <p className="font-medium">
                        {new Date(payment.eventDate).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monto</p>
                      <p className="font-medium text-lg text-green-600">
                        {payment.currency} {payment.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-600">Método:</p>
                      {getMethodIcon(payment.method)}
                      <span className="font-medium">{getMethodName(payment.method)}</span>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha</p>
                      <p className="font-medium">
                        {new Date(payment.createdAt).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                  </div>

                  {payment.refundAmount && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <FaCheckCircle className="inline mr-2" />
                        Reembolsado: {payment.currency} {payment.refundAmount.toFixed(2)}
                        {payment.refundedAt && ` el ${new Date(payment.refundedAt).toLocaleDateString('es-GT')}`}
                      </p>
                    </div>
                  )}

                  {payment.fees && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Comisiones</p>
                          <p className="font-medium">{payment.currency} {payment.fees.toFixed(2)}</p>
                        </div>
                        {payment.netAmount && (
                          <div>
                            <p className="text-gray-600">Monto neto</p>
                            <p className="font-medium">{payment.currency} {payment.netAmount.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {payment.invoiceNumber && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <strong>Factura FEL:</strong> {payment.invoiceNumber}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => viewPaymentDetails(payment)}
                    >
                      <FaEye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadReceipt(payment)}
                    >
                      <FaDownload className="mr-2 h-4 w-4" />
                      Recibo
                    </Button>
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