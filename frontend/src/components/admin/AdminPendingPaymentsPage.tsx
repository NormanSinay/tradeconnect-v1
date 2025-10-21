import React, { useState, useEffect } from 'react'
import { FaClock, FaCheck, FaTimes, FaEye, FaPlay, FaPause, FaRedo, FaFilter, FaDownload } from 'react-icons/fa'
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
  PaymentGateway,
} from '@/types/admin'

const AdminPendingPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null)
  const [filters, setFilters] = useState<PaymentFilters>({ status: ['pending'] })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Cargar pagos pendientes
  const loadPendingPayments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await adminPaymentService.getPaymentTransactions(filters, {
        page: currentPage,
        limit: 20
      })

      setPayments(response.transactions)
      setTotalPages(response.pagination.totalPages)
    } catch (err) {
      console.error('Error cargando pagos pendientes:', err)
      setError('Error al cargar los pagos pendientes')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = () => {
    const newFilters: PaymentFilters = { status: ['pending'] }

    if (selectedGateway !== 'all') {
      newFilters.gateway = selectedGateway
    }

    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({ status: ['pending'] })
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

  // Calcular tiempo transcurrido
  const getTimeElapsed = (createdAt: Date) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    } else {
      return `${diffMinutes}m`
    }
  }

  // Obtener clase de urgencia
  const getUrgencyClass = (createdAt: Date) => {
    const hours = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60)

    if (hours > 24) return 'text-red-600 font-medium'
    if (hours > 12) return 'text-orange-600 font-medium'
    if (hours > 6) return 'text-yellow-600'
    return 'text-gray-600'
  }

  // Confirmar pago manualmente
  const handleConfirmPayment = async (payment: PaymentTransaction) => {
    try {
      setProcessingPayment(payment.id)

      await adminPaymentService.confirmPayment({
        transactionId: payment.id,
        status: 'completed',
      })

      await loadPendingPayments()
      setShowConfirmDialog(false)
      setSelectedPayment(null)
    } catch (err) {
      console.error('Error confirmando pago:', err)
      setError('Error al confirmar el pago')
    } finally {
      setProcessingPayment(null)
    }
  }

  // Rechazar pago
  const handleRejectPayment = async () => {
    if (!selectedPayment || !rejectReason) return

    try {
      setProcessingPayment(selectedPayment.id)

      await adminPaymentService.cancelPayment(selectedPayment.id, rejectReason)

      await loadPendingPayments()
      setShowRejectDialog(false)
      setSelectedPayment(null)
      setRejectReason('')
    } catch (err) {
      console.error('Error rechazando pago:', err)
      setError('Error al rechazar el pago')
    } finally {
      setProcessingPayment(null)
    }
  }

  // Reintentar procesamiento
  const handleRetryPayment = async (payment: PaymentTransaction) => {
    try {
      setProcessingPayment(payment.id)

      // Aquí iría la lógica para reintentar el procesamiento
      // Por ahora, solo recargamos los datos
      await loadPendingPayments()
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
      a.download = `pagos-pendientes-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando pagos pendientes:', err)
      setError('Error al exportar los pagos pendientes')
    }
  }

  useEffect(() => {
    loadPendingPayments()
  }, [filters, currentPage])

  useEffect(() => {
    handleFiltersChange()
  }, [selectedGateway])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pagos', href: '/admin/pagos' },
    { label: 'Pagos Pendientes' },
  ]

  return (
    <AdminLayout title="Pagos Pendientes de Procesamiento" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {payments.length}
                  </p>
                </div>
                <FaClock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monto Total Pendiente</p>
                  <p className="text-2xl font-bold text-blue-600">
                    Q{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
                <FaClock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {payments.length > 0
                      ? Math.round(
                          payments.reduce((sum, p) =>
                            sum + (new Date().getTime() - new Date(p.createdAt).getTime()), 0
                          ) / payments.length / (1000 * 60 * 60)
                        )
                      : 0}h
                  </p>
                </div>
                <FaClock className="h-8 w-8 text-gray-500" />
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

        {/* Tabla de pagos pendientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pagos Pendientes de Procesamiento</CardTitle>
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
                    <TableHead>Tiempo Espera</TableHead>
                    <TableHead>Intentos</TableHead>
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
                        No hay pagos pendientes de procesamiento
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
                        <TableCell>
                          <span className={getTimeElapsed(payment.createdAt)}>
                            {getTimeElapsed(payment.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {payment.retryCount || 0}
                          </Badge>
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

                            <Dialog open={showConfirmDialog && selectedPayment?.id === payment.id} onOpenChange={setShowConfirmDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={processingPayment === payment.id}
                                  onClick={() => setSelectedPayment(payment)}
                                >
                                  <FaCheck className="h-4 w-4 text-green-600" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirmar Pago Manualmente</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p>¿Está seguro de que desea confirmar manualmente este pago?</p>
                                  <p className="text-sm text-gray-600">
                                    Monto: {selectedPayment ? formatAmount(selectedPayment.amount, selectedPayment.currency) : ''}
                                  </p>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                                      Cancelar
                                    </Button>
                                    <Button
                                      onClick={() => handleConfirmPayment(payment)}
                                      disabled={processingPayment === payment.id}
                                    >
                                      {processingPayment === payment.id ? 'Procesando...' : 'Confirmar Pago'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetryPayment(payment)}
                              disabled={processingPayment === payment.id}
                            >
                              <FaRedo className="h-4 w-4 text-blue-600" />
                            </Button>

                            <Dialog open={showRejectDialog && selectedPayment?.id === payment.id} onOpenChange={setShowRejectDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={processingPayment === payment.id}
                                  onClick={() => setSelectedPayment(payment)}
                                >
                                  <FaTimes className="h-4 w-4 text-red-600" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rechazar Pago</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Motivo del rechazo</label>
                                    <select
                                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                    >
                                      <option value="">Seleccionar motivo</option>
                                      <option value="insufficient_funds">Fondos insuficientes</option>
                                      <option value="card_declined">Tarjeta rechazada</option>
                                      <option value="expired_card">Tarjeta expirada</option>
                                      <option value="fraud_suspected">Sospecha de fraude</option>
                                      <option value="invalid_payment_method">Método de pago inválido</option>
                                      <option value="other">Otro</option>
                                    </select>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                                      Cancelar
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleRejectPayment}
                                      disabled={processingPayment === payment.id || !rejectReason}
                                    >
                                      {processingPayment === payment.id ? 'Procesando...' : 'Rechazar Pago'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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
        {selectedPayment && !showConfirmDialog && !showRejectDialog && (
          <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalle del Pago Pendiente</DialogTitle>
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
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FaClock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monto</label>
                    <p className="text-2xl font-bold text-green-600">
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
                    <label className="text-sm font-medium text-gray-600">Tiempo de Espera</label>
                    <p className={cn("font-medium", getUrgencyClass(selectedPayment.createdAt))}>
                      {getTimeElapsed(selectedPayment.createdAt)}
                    </p>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Intentos de Procesamiento</label>
                    <p>{selectedPayment.retryCount || 0}</p>
                  </div>
                  {selectedPayment.lastRetryAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Último Intento</label>
                      <p>{formatDate(selectedPayment.lastRetryAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminPendingPaymentsPage