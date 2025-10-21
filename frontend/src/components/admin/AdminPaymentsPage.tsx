import React, { useState, useEffect } from 'react'
import { FaCreditCard, FaSearch, FaFilter, FaDownload, FaEye, FaUndo, FaCheck, FaTimes, FaClock } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminPaymentService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  PaymentTransaction,
  PaymentFilters,
  PaymentStats,
  PaymentStatus,
  PaymentGateway,
  PaymentMethod,
} from '@/types/admin'

const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all')
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null)
  const [showRefundDialog, setShowRefundDialog] = useState(false)

  // Cargar datos de pagos
  const loadPayments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [paymentsData, statsData] = await Promise.all([
        adminPaymentService.getPaymentTransactions(filters, { page: currentPage, limit: 20 }),
        adminPaymentService.getPaymentStats(filters),
      ])

      setPayments(paymentsData.transactions)
      setTotalPages(paymentsData.pagination.pages)
      setStats(statsData)
    } catch (err) {
      console.error('Error cargando pagos:', err)
      setError('Error al cargar los pagos')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = () => {
    const newFilters: PaymentFilters = {}

    if (selectedStatus !== 'all') {
      newFilters.status = selectedStatus
    }

    if (selectedGateway !== 'all') {
      newFilters.gateway = selectedGateway
    }

    if (searchTerm) {
      // Aquí podríamos buscar por ID de transacción, email, etc.
    }

    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setSelectedStatus('all')
    setSelectedGateway('all')
    setCurrentPage(1)
  }

  // Obtener badge de estado
  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pendiente', icon: FaClock },
      processing: { variant: 'default' as const, label: 'Procesando', icon: FaClock },
      completed: { variant: 'default' as const, label: 'Completado', icon: FaCheck },
      failed: { variant: 'destructive' as const, label: 'Fallido', icon: FaTimes },
      cancelled: { variant: 'outline' as const, label: 'Cancelado', icon: FaTimes },
      refunded: { variant: 'secondary' as const, label: 'Reembolsado', icon: FaUndo },
    }

    const config = statusConfig[status] || statusConfig.pending
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

  // Exportar datos
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await adminPaymentService.exportPaymentTransactions(format, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pagos-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando pagos:', err)
      setError('Error al exportar los pagos')
    }
  }

  // Procesar reembolso
  const handleRefund = async (payment: PaymentTransaction) => {
    // Aquí iría la lógica para procesar reembolso
    setSelectedPayment(payment)
    setShowRefundDialog(true)
  }

  useEffect(() => {
    loadPayments()
  }, [filters, currentPage])

  useEffect(() => {
    handleFiltersChange()
  }, [selectedStatus, selectedGateway])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pagos' },
  ]

  return (
    <AdminLayout title="Gestión de Pagos" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transacciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalTransactions.toLocaleString() || 0}
                  </p>
                </div>
                <FaCreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    Q{stats?.totalAmount.toLocaleString() || 0}
                  </p>
                </div>
                <FaCreditCard className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats ? Math.round(stats.successRate * 100) : 0}%
                  </p>
                </div>
                <FaCheck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Comisiones</p>
                  <p className="text-2xl font-bold text-orange-600">
                    Q{stats?.totalFees.toLocaleString() || 0}
                  </p>
                </div>
                <FaCreditCard className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por ID, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as PaymentStatus | 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="failed">Fallido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedGateway} onValueChange={(value) => setSelectedGateway(value as PaymentGateway | 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Pasarela" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las pasarelas</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Transferencia</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  <FaFilter className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <FaDownload className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('excel')}>
                  <FaDownload className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Tabla de pagos */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transacción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Pasarela</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No se encontraron transacciones de pago
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payment.gateway.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.billingInfo.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <FaEye className="h-4 w-4" />
                            </Button>
                            {payment.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRefund(payment)}
                              >
                                <FaUndo className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de detalle de pago */}
        {selectedPayment && (
          <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalle de Transacción</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID Transacción</label>
                    <p className="font-mono text-sm">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monto</label>
                    <p className="text-lg font-bold">
                      {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pasarela</label>
                    <p className="capitalize">{selectedPayment.gateway.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                    <p>{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Confirmación</label>
                    <p>{selectedPayment.confirmedAt ? formatDate(selectedPayment.confirmedAt) : 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Información de Facturación</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p><strong>{selectedPayment.billingInfo.firstName} {selectedPayment.billingInfo.lastName}</strong></p>
                    <p>{selectedPayment.billingInfo.email}</p>
                    {selectedPayment.billingInfo.phone && <p>{selectedPayment.billingInfo.phone}</p>}
                  </div>
                </div>

                {selectedPayment.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Descripción</label>
                    <p>{selectedPayment.description}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Diálogo de reembolso */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Procesar Reembolso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>¿Está seguro de que desea procesar un reembolso para esta transacción?</p>
              <p className="text-sm text-gray-600">
                Monto: {selectedPayment ? formatAmount(selectedPayment.amount, selectedPayment.currency) : ''}
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  // Aquí iría la lógica de reembolso
                  setShowRefundDialog(false)
                }}>
                  Procesar Reembolso
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default AdminPaymentsPage