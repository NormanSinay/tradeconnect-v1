import React, { useState, useEffect } from 'react'
import { FaCreditCard, FaDownload, FaEye, FaFilter, FaSearch, FaCalendarAlt, FaMoneyBillWave, FaUniversity } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatDateTime } from '@/utils/date'
import { showToast } from '@/utils/toast'
import { cn } from '@/lib/utils'

// Mock Payment type for now
interface Payment {
  id: string
  userId: string
  eventId: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  paymentMethod: string
  transactionId: string
  description: string
  createdAt: Date
  updatedAt: Date
}

// Mock data - in a real app, this would come from an API
const mockPayments: Payment[] = [
  {
    id: '1',
    userId: 'user1',
    eventId: 'event1',
    amount: 150.00,
    currency: 'GTQ',
    status: 'completed',
    paymentMethod: 'credit_card',
    transactionId: 'txn_123456789',
    description: 'Registro al Evento: Conferencia Tech 2024',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    userId: 'user1',
    eventId: 'event2',
    amount: 75.50,
    currency: 'GTQ',
    status: 'completed',
    paymentMethod: 'paypal',
    transactionId: 'txn_987654321',
    description: 'Registro al Evento: Workshop de React',
    createdAt: new Date('2024-02-20T14:15:00'),
    updatedAt: new Date('2024-02-20T14:15:00'),
  },
  {
    id: '3',
    userId: 'user1',
    eventId: 'event3',
    amount: 200.00,
    currency: 'GTQ',
    status: 'pending',
    paymentMethod: 'bank_transfer',
    transactionId: 'txn_456789123',
    description: 'Registro al Evento: Seminario de IA',
    createdAt: new Date('2024-03-10T09:45:00'),
    updatedAt: new Date('2024-03-10T09:45:00'),
  },
]

interface PaymentHistoryProps {
  className?: string
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className }) => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Load payments on component mount
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true)
        // In a real app, this would be an API call
        // const response = await api.get('/payments/history')
        // setPayments(response.data)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPayments(mockPayments)
        setFilteredPayments(mockPayments)
      } catch (error) {
        console.error('Error loading payment history:', error)
        showToast.error('Error al cargar el historial de pagos')
      } finally {
        setIsLoading(false)
      }
    }

    loadPayments()
  }, [])

  // Filter payments based on search and status
  useEffect(() => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Reembolsado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <FaCreditCard className="h-4 w-4" />
      case 'paypal':
        return <FaMoneyBillWave className="h-4 w-4" />
      case 'bank_transfer':
        return <FaUniversity className="h-4 w-4" />
      default:
        return <FaCreditCard className="h-4 w-4" />
    }
  }

  const handleDownloadReceipt = (payment: Payment) => {
    // In a real app, this would generate/download a PDF receipt
    showToast.info('Descargando recibo...')
    setTimeout(() => {
      showToast.success('Recibo descargado exitosamente')
    }, 1500)
  }

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando historial de pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Pagos</h1>
          <p className="text-gray-600 mt-1">Revisa todos tus pagos y descargas recibos</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaMoneyBillWave className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900">
                  Q{totalSpent.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaCreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaCalendarAlt className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FaFilter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar por evento o ID de transacción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="sm:w-48">
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="failed">Fallidos</SelectItem>
                  <SelectItem value="refunded">Reembolsados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Realizados</CardTitle>
          <CardDescription>
            {filteredPayments.length} de {payments.length} pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FaCreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron pagos
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'Aún no has realizado ningún pago'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDateTime(payment.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">
                            {payment.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {payment.transactionId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="text-sm capitalize">
                            {payment.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          Q{payment.amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <FaEye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalles del Pago</DialogTitle>
                                <DialogDescription>
                                  Información completa de la transacción
                                </DialogDescription>
                              </DialogHeader>
                              {selectedPayment && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">ID de Transacción</Label>
                                      <p className="text-sm text-gray-600">{selectedPayment.transactionId}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Fecha</Label>
                                      <p className="text-sm text-gray-600">
                                        {formatDateTime(selectedPayment.createdAt)}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Monto</Label>
                                      <p className="text-sm text-gray-600">
                                        Q{selectedPayment.amount.toFixed(2)}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Estado</Label>
                                      <div className="mt-1">
                                        {getStatusBadge(selectedPayment.status)}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Descripción</Label>
                                    <p className="text-sm text-gray-600">{selectedPayment.description}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {payment.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment)}
                            >
                              <FaDownload className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}