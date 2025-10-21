import React, { useState, useEffect } from 'react'
import { FaUndo, FaEye, FaCheck, FaTimes, FaFilter, FaDownload, FaPlus, FaExclamationTriangle } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { adminPaymentService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  RefundInfo,
  PaymentTransaction,
} from '@/types/admin'

const AdminRefundsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundInfo[]>([])
  const [selectedRefund, setSelectedRefund] = useState<RefundInfo | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null)
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
    startDate: '',
    endDate: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewRefundDialog, setShowNewRefundDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [newRefundData, setNewRefundData] = useState({
    transactionId: '',
    amount: '',
    reason: '',
    description: '',
  })
  const [processingRefund, setProcessingRefund] = useState<string | null>(null)

  // Cargar reembolsos
  const loadRefunds = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const filterParams: any = {}
      if (filters.status !== 'all') filterParams.status = filters.status
      if (filters.startDate) filterParams.startDate = new Date(filters.startDate)
      if (filters.endDate) filterParams.endDate = new Date(filters.endDate)

      const response = await adminPaymentService.getRefunds(filterParams, {
        page: currentPage,
        limit: 20
      })

      setRefunds(response.data)
      setTotalPages(Math.ceil(response.total / 20))
    } catch (err) {
      console.error('Error cargando reembolsos:', err)
      setError('Error al cargar los reembolsos')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = () => {
    setCurrentPage(1)
    loadRefunds()
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      status: 'all',
      startDate: '',
      endDate: '',
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Formatear monto
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
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

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pendiente', icon: FaExclamationTriangle },
      processing: { variant: 'default' as const, label: 'Procesando', icon: FaExclamationTriangle },
      completed: { variant: 'default' as const, label: 'Completado', icon: FaCheck },
      failed: { variant: 'destructive' as const, label: 'Fallido', icon: FaTimes },
      cancelled: { variant: 'outline' as const, label: 'Cancelado', icon: FaTimes },
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

  // Procesar nuevo reembolso
  const handleNewRefund = async () => {
    if (!newRefundData.transactionId || !newRefundData.amount || !newRefundData.reason) return

    try {
      setProcessingRefund('new')

      await adminPaymentService.processRefund({
        transactionId: newRefundData.transactionId,
        amount: parseFloat(newRefundData.amount),
        reason: newRefundData.reason,
        description: newRefundData.description || undefined,
      })

      await loadRefunds()
      setShowNewRefundDialog(false)
      setNewRefundData({
        transactionId: '',
        amount: '',
        reason: '',
        description: '',
      })
    } catch (err) {
      console.error('Error procesando reembolso:', err)
      setError('Error al procesar el reembolso')
    } finally {
      setProcessingRefund(null)
    }
  }

  // Cancelar reembolso
  const handleCancelRefund = async () => {
    if (!selectedRefund) return

    try {
      setProcessingRefund(selectedRefund.id)

      await adminPaymentService.cancelRefund(selectedRefund.id, 'Cancelado por administrador')

      await loadRefunds()
      setShowCancelDialog(false)
      setSelectedRefund(null)
    } catch (err) {
      console.error('Error cancelando reembolso:', err)
      setError('Error al cancelar el reembolso')
    } finally {
      setProcessingRefund(null)
    }
  }

  // Cargar detalles del pago para nuevo reembolso
  const loadPaymentForRefund = async (transactionId: string) => {
    try {
      const payment = await adminPaymentService.getPaymentTransaction(transactionId)
      setSelectedPayment(payment)
    } catch (err) {
      console.error('Error cargando detalles del pago:', err)
      setError('Error al cargar los detalles del pago')
    }
  }

  // Exportar datos
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await adminPaymentService.exportRefunds(format, {
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reembolsos-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando reembolsos:', err)
      setError('Error al exportar los reembolsos')
    }
  }

  useEffect(() => {
    loadRefunds()
  }, [currentPage])

  useEffect(() => {
    if (newRefundData.transactionId) {
      loadPaymentForRefund(newRefundData.transactionId)
    }
  }, [newRefundData.transactionId])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pagos', href: '/admin/pagos' },
    { label: 'Reembolsos' },
  ]

  return (
    <AdminLayout title="Gestión de Reembolsos" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reembolsos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {refunds.length}
                  </p>
                </div>
                <FaUndo className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monto Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    Q{refunds.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                  </p>
                </div>
                <FaUndo className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {refunds.filter(r => r.status === 'completed').length}
                  </p>
                </div>
                <FaCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {refunds.filter(r => r.status === 'pending' || r.status === 'processing').length}
                  </p>
                </div>
                <FaExclamationTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header con acciones */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Dialog open={showNewRefundDialog} onOpenChange={setShowNewRefundDialog}>
              <DialogTrigger asChild>
                <Button>
                  <FaPlus className="h-4 w-4 mr-2" />
                  Nuevo Reembolso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Procesar Nuevo Reembolso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">ID de Transacción</label>
                    <Input
                      value={newRefundData.transactionId}
                      onChange={(e) => setNewRefundData(prev => ({ ...prev, transactionId: e.target.value }))}
                      placeholder="Ingrese el ID de la transacción"
                    />
                  </div>

                  {selectedPayment && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">Pago encontrado:</p>
                      <p>Monto original: {formatAmount(selectedPayment.amount)}</p>
                      <p>Estado: {selectedPayment.status}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Monto a reembolsar</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newRefundData.amount}
                      onChange={(e) => setNewRefundData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Motivo del reembolso</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newRefundData.reason}
                      onChange={(e) => setNewRefundData(prev => ({ ...prev, reason: e.target.value }))}
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
                    <label className="text-sm font-medium">Descripción (opcional)</label>
                    <Textarea
                      value={newRefundData.description}
                      onChange={(e) => setNewRefundData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detalles adicionales del reembolso..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewRefundDialog(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleNewRefund}
                      disabled={processingRefund === 'new' || !newRefundData.transactionId || !newRefundData.amount || !newRefundData.reason}
                    >
                      {processingRefund === 'new' ? 'Procesando...' : 'Procesar Reembolso'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder="Buscar por ID de transacción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                >
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
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-32"
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-32"
                  />
                </div>

                <Button variant="outline" onClick={handleFiltersChange}>
                  <FaFilter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>

                <Button variant="outline" onClick={clearFilters}>
                  Limpiar
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

        {/* Tabla de reembolsos */}
        <Card>
          <CardHeader>
            <CardTitle>Reembolsos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Reembolso</TableHead>
                    <TableHead>ID Transacción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Solicitud</TableHead>
                    <TableHead>Fecha Procesamiento</TableHead>
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
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : refunds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No hay reembolsos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    refunds.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell className="font-mono text-sm">
                          {refund.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {refund.transactionId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(refund.amount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {refund.reason.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(refund.status)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(refund.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {refund.processedAt ? formatDate(refund.processedAt) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRefund(refund)}
                            >
                              <FaEye className="h-4 w-4" />
                            </Button>

                            {(refund.status === 'pending' || refund.status === 'processing') && (
                              <Dialog open={showCancelDialog && selectedRefund?.id === refund.id} onOpenChange={setShowCancelDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={processingRefund === refund.id}
                                    onClick={() => setSelectedRefund(refund)}
                                  >
                                    <FaTimes className="h-4 w-4 text-red-600" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cancelar Reembolso</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p>¿Está seguro de que desea cancelar este reembolso?</p>
                                    <p className="text-sm text-gray-600">
                                      Monto: {selectedRefund ? formatAmount(selectedRefund.amount) : ''}
                                    </p>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                                        Cancelar
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={handleCancelRefund}
                                        disabled={processingRefund === refund.id}
                                      >
                                        {processingRefund === refund.id ? 'Cancelando...' : 'Cancelar Reembolso'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
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

        {/* Diálogo de detalle de reembolso */}
        {selectedRefund && !showCancelDialog && (
          <Dialog open={!!selectedRefund} onOpenChange={() => setSelectedRefund(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalle del Reembolso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID Reembolso</label>
                    <p className="font-mono text-sm">{selectedRefund.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <div className="mt-1">{getStatusBadge(selectedRefund.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID Transacción</label>
                    <p className="font-mono text-sm">{selectedRefund.transactionId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monto</label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatAmount(selectedRefund.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Comisión</label>
                    <p className="text-lg font-semibold text-orange-600">
                      {formatAmount(selectedRefund.fee)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monto Neto</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatAmount(selectedRefund.netAmount)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Motivo del Reembolso</label>
                  <p className="mt-1">{selectedRefund.reason.replace('_', ' ')}</p>
                </div>

                {selectedRefund.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Descripción</label>
                    <p>{selectedRefund.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Solicitud</label>
                    <p>{formatDate(selectedRefund.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Procesamiento</label>
                    <p>{selectedRefund.processedAt ? formatDate(selectedRefund.processedAt) : 'No procesado'}</p>
                  </div>
                </div>

                {selectedRefund.gatewayRefundId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID en Pasarela</label>
                    <p className="font-mono text-sm">{selectedRefund.gatewayRefundId}</p>
                  </div>
                )}

                {/* Respuesta del gateway */}
                {selectedRefund.gatewayResponse && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Respuesta de la Pasarela</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedRefund.gatewayResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminRefundsPage