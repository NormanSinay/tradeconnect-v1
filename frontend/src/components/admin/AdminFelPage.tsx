import React, { useState, useEffect } from 'react'
import { FaFileInvoice, FaClock, FaCheck, FaTimes, FaCertificate, FaCog, FaDownload, FaFilter, FaEye, FaRedo, FaBan } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminFelService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  FelInvoice,
  FelInvoiceStatus,
  FelCertifier,
  FelStats,
  FelDashboard,
  FelAlert,
  FelInvoiceFilters,
} from '@/types/admin'

const AdminFelPage: React.FC = () => {
  const [invoices, setInvoices] = useState<FelInvoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<FelInvoice | null>(null)
  const [stats, setStats] = useState<FelStats | null>(null)
  const [dashboard, setDashboard] = useState<FelDashboard | null>(null)
  const [alerts, setAlerts] = useState<FelAlert[]>([])
  const [filters, setFilters] = useState<FelInvoiceFilters>({
    status: [],
    startDate: undefined,
    endDate: undefined,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingInvoice, setProcessingInvoice] = useState<string | null>(null)

  // Cargar datos del dashboard FEL
  const loadFelDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [dashboardData, alertsData] = await Promise.all([
        adminFelService.getFelDashboard(),
        adminFelService.getFelAlerts(),
      ])

      setDashboard(dashboardData)
      setAlerts(alertsData)
      setStats(dashboardData.monthStats)
    } catch (err) {
      console.error('Error cargando dashboard FEL:', err)
      setError('Error al cargar el dashboard de facturación FEL')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar facturas con filtros
  const loadInvoices = async () => {
    try {
      const result = await adminFelService.getFelInvoices(filters, {
        page: currentPage,
        limit: 20,
      })
      setInvoices(result.invoices)
      setTotalPages(Math.ceil(result.pagination.total / result.pagination.limit))
    } catch (err) {
      console.error('Error cargando facturas:', err)
      setError('Error al cargar las facturas FEL')
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = () => {
    setCurrentPage(1)
    loadInvoices()
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      status: [],
      startDate: undefined,
      endDate: undefined,
    })
    setSearchTerm('')
    setCurrentPage(1)
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
      draft: { variant: 'secondary' as const, label: 'Borrador', icon: FaClock },
      generated: { variant: 'outline' as const, label: 'Generada', icon: FaFileInvoice },
      sent: { variant: 'default' as const, label: 'Enviada', icon: FaClock },
      certified: { variant: 'default' as const, label: 'Certificada', icon: FaCertificate },
      cancelled: { variant: 'destructive' as const, label: 'Anulada', icon: FaBan },
      error: { variant: 'destructive' as const, label: 'Error', icon: FaTimes },
    }

    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Reintentar certificación
  const retryCertification = async (invoiceId: string) => {
    try {
      setProcessingInvoice(invoiceId)
      await adminFelService.retryFelCertification(invoiceId)
      await loadInvoices()
      await loadFelDashboard()
    } catch (err) {
      console.error('Error reintentando certificación:', err)
      setError('Error al reintentar la certificación')
    } finally {
      setProcessingInvoice(null)
    }
  }

  // Exportar datos
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await adminFelService.exportFelInvoices(format, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facturas-fel-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando facturas:', err)
      setError('Error al exportar las facturas FEL')
    }
  }

  useEffect(() => {
    loadFelDashboard()
  }, [])

  useEffect(() => {
    loadInvoices()
  }, [currentPage, filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Facturación FEL' },
  ]

  return (
    <AdminLayout title="Panel de Facturación FEL" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalInvoices}
                    </p>
                  </div>
                  <FaFileInvoice className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Certificadas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.certifiedInvoices}
                    </p>
                  </div>
                  <FaCertificate className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.byStatus.draft + stats.byStatus.generated + stats.byStatus.sent}
                    </p>
                  </div>
                  <FaClock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Anuladas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.cancelledInvoices}
                    </p>
                  </div>
                  <FaBan className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.successRate.toFixed(1)}%
                    </p>
                  </div>
                  <FaCheck className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alertas */}
        {alerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <FaTimes className="h-5 w-5" />
                Alertas FEL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <span className="text-sm">{alert.message}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder="Buscar por número de factura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={filters.status?.join(',') || 'all'}
                  onValueChange={(value) => {
                    const statuses = value === 'all' ? [] : value.split(',') as FelInvoiceStatus[]
                    setFilters(prev => ({ ...prev, status: statuses }))
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="generated">Generada</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="certified">Certificada</SelectItem>
                    <SelectItem value="cancelled">Anulada</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.startDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      startDate: e.target.value ? new Date(e.target.value) : undefined
                    }))}
                    className="w-32"
                  />
                  <Input
                    type="date"
                    value={filters.endDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      endDate: e.target.value ? new Date(e.target.value) : undefined
                    }))}
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

        {/* Tabla de facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Facturas FEL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Fecha Certificación</TableHead>
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
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No hay facturas FEL
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          Usuario #{invoice.userId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {invoice.issuedAt ? formatDate(invoice.issuedAt) : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <FaEye className="h-4 w-4" />
                            </Button>

                            {(invoice.status === 'error' || invoice.status === 'sent') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => retryCertification(invoice.id.toString())}
                                disabled={processingInvoice === invoice.id.toString()}
                              >
                                <FaRedo className="h-4 w-4 text-blue-600" />
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

        {/* Diálogo de detalle de factura */}
        {selectedInvoice && (
          <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalle de Factura FEL</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Número</p>
                    <p className="font-mono text-sm">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="font-medium">{formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">IVA</p>
                    <p>{formatCurrency(selectedInvoice.taxAmount, selectedInvoice.currency)}</p>
                  </div>
                </div>

                {/* Información detallada */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de la Factura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID Pago</label>
                        <p className="mt-1 font-mono text-sm">{selectedInvoice.paymentId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID Evento</label>
                        <p className="mt-1">{selectedInvoice.eventId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID Usuario</label>
                        <p className="mt-1">{selectedInvoice.userId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Subtotal</label>
                        <p className="mt-1">{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                        <p className="mt-1">{formatDate(selectedInvoice.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Emisión</label>
                        <p className="mt-1">{selectedInvoice.issuedAt ? formatDate(selectedInvoice.issuedAt) : '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Pago</label>
                        <p className="mt-1">{selectedInvoice.paidAt ? formatDate(selectedInvoice.paidAt) : '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Anulación</label>
                        <p className="mt-1">{selectedInvoice.cancelledAt ? formatDate(selectedInvoice.cancelledAt) : '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notas */}
                {selectedInvoice.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Acciones */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                    Cerrar
                  </Button>
                  {selectedInvoice.pdfUrl && (
                    <Button variant="outline" asChild>
                      <a href={selectedInvoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <FaDownload className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </a>
                    </Button>
                  )}
                  {selectedInvoice.xmlUrl && (
                    <Button variant="outline" asChild>
                      <a href={selectedInvoice.xmlUrl} target="_blank" rel="noopener noreferrer">
                        <FaDownload className="h-4 w-4 mr-2" />
                        Descargar XML
                      </a>
                    </Button>
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

export default AdminFelPage