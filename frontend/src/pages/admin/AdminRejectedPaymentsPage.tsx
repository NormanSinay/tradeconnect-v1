import React, { useState, useEffect } from 'react'
import { FaTimes, FaEye, FaRedo, FaFilter, FaDownload, FaExclamationTriangle } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminPaymentService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  PaymentTransaction,
  PaymentFilters,
  PaymentGateway,
} from '@/types/admin'

const AdminRejectedPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null)
  const [filters, setFilters] = useState<PaymentFilters>({ status: 'failed' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  // Cargar pagos rechazados
  const loadRejectedPayments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await adminPaymentService.getPaymentTransactions(filters, {
        page: currentPage,
        limit: 20
      })

      setPayments(response.transactions)
      setTotalPages(response.pagination.pages)
    } catch (err) {
      console.error('Error cargando pagos rechazados:', err)
      setError('Error al cargar los pagos rechazados')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = () => {
    const newFilters: PaymentFilters = { status: 'failed' }

    if (selectedGateway !== 'all') {
      newFilters.gateway = selectedGateway
    }

    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({ status: 'failed' })
    setSearchTerm('')
    setSelectedGateway('all')
    setCurrentPage(1)
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

  // Obtener motivo de rechazo
  const getRejectionReason = (payment: PaymentTransaction) => {
    // Aquí se podría extraer el motivo del gatewayResponse o metadata
    // Por ahora, devolvemos un motivo genérico basado en el estado
    if (payment.gatewayResponse) {
      return payment.gatewayResponse.message || 'Error en procesamiento'
    }
    return 'Pago rechazado por la pasarela'
  }

  // Reintentar pago rechazado
  const handleRetryPayment = async (payment: PaymentTransaction) => {
    try {
      setProcessingPayment(payment.id)

      // Aquí iría la lógica para reintentar el pago
      // Podría crear una nueva transacción o reintentar la existente
      await loadRejectedPayments()
    } catch (err) {
      console.error('Error reintentando pago:', err)
      setError('Error al reintentar el pago')
    } finally {
      setProcessingPayment(null)
    }
  }

  // Exportar datos
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await adminPaymentService.exportPaymentTransactions(format, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pagos-rechazados-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando pagos rechazados:', err)
      setError('Error al exportar los pagos rechazados')
    }
  }

  useEffect(() => {
    loadRejectedPayments()
  }, [filters, currentPage])

  useEffect(() => {
    handleFiltersChange()
  }, [selectedGateway])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pagos', href: '/admin/pagos' },
    { label: 'Pagos Rechazados' },
  ]

  return (
    <AdminLayout title="Pagos Rechazados" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rechazados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {payments.length}
                  </p>
                </div>
                <FaTimes className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monto Total Rechazado</p>
                  <p className="text-2xl font-bold text-red-600">
                    Q{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
                <FaTimes className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Rechazo</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {payments.length > 0 ? Math.round((payments.length / (payments.length + 100)) * 100) : 0}%
                  </p>
                </div>
                <FaExclamationTriangle className="h-8 w-8 text-orange-500" />
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
                  <Input
                    placeholder="Buscar por ID, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

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

        {/* Tabla de pagos rechazados */}
        <Card>
          <CardHeader>
            <CardTitle>Pagos Rechazados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transacción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Pasarela</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Motivo de Rechazo</TableHead>
                    <TableHead>Fecha</TableHead>
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
                        No hay pagos rechazados
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payment.gateway.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <p className="font-medium">
                              {payment.billingInfo.firstName} {payment.billingInfo.lastName}
                            </p>
                            <p className="text-gray-500">{payment.billingInfo.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="max-w-xs truncate" title={getRejectionReason(payment)}>
                            {getRejectionReason(payment)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(payment.createdAt)}
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

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetryPayment(payment)}
                              disabled={processingPayment === payment.id}
                              title="Reintentar pago"
                            >
                              <FaRedo className="h-4 w-4 text-blue-600" />
                            </Button>
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

        {/* Diálogo de detalle de pago rechazado */}
        {selectedPayment && (
          <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalle del Pago Rechazado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID Transacción</label>
                    <p className="font-mono text-sm">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <div className="mt-1">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <FaTimes className="h-3 w-3" />
                        Rechazado
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monto</label>
                    <p className="text-2xl font-bold text-red-600">
                      {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pasarela</label>
                    <p className="capitalize">{selectedPayment.gateway.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Rechazo</label>
                    <p>{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Intentos</label>
                    <p>{selectedPayment.retryCount || 0}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Motivo del Rechazo</label>
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{getRejectionReason(selectedPayment)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Información del Cliente</label>
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

                {/* Respuesta del gateway */}
                {selectedPayment.gatewayResponse && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Respuesta de la Pasarela</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedPayment.gatewayResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => handleRetryPayment(selectedPayment)}
                    disabled={processingPayment === selectedPayment.id}
                  >
                    {processingPayment === selectedPayment.id ? 'Procesando...' : 'Reintentar Pago'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminRejectedPaymentsPage