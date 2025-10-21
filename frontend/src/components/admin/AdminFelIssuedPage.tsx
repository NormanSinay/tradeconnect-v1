import React, { useState, useEffect } from 'react'
import { FaCheck, FaFileInvoice, FaEye, FaDownload, FaFilter, FaCertificate, FaRedo } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminFelService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  FelInvoice,
  FelInvoiceStatus,
  FelInvoiceFilters,
} from '@/types/admin'

const AdminFelIssuedPage: React.FC = () => {
  const [invoices, setInvoices] = useState<FelInvoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<FelInvoice | null>(null)
  const [filters, setFilters] = useState<FelInvoiceFilters>({
    status: ['certified'],
    startDate: undefined,
    endDate: undefined,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingInvoice, setProcessingInvoice] = useState<string | null>(null)

  // Cargar facturas emitidas
  const loadIssuedInvoices = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await adminFelService.getFelInvoices(filters, {
        page: currentPage,
        limit: 20,
      })

      setInvoices(result.invoices)
      setTotalPages(Math.ceil(result.pagination.total / result.pagination.limit))
    } catch (err) {
      console.error('Error cargando facturas emitidas:', err)
      setError('Error al cargar las facturas emitidas')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = () => {
    setCurrentPage(1)
    loadIssuedInvoices()
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      status: ['certified'],
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
    const statusConfig: Partial<Record<FelInvoiceStatus, { variant: 'default' | 'secondary' | 'destructive', label: string, icon: any }>> = {
      certified: { variant: 'default' as const, label: 'Certificada', icon: FaCertificate },
    }

    const config = statusConfig[status] || statusConfig.certified || { variant: 'secondary' as const, label: 'Desconocido', icon: FaCertificate }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Reenviar factura por email
  const resendInvoice = async (invoiceId: string) => {
    try {
      setProcessingInvoice(invoiceId)
      await adminFelService.resendFelInvoice({
        invoiceId: parseInt(invoiceId),
        requestedBy: 1, // TODO: Obtener del contexto de usuario actual
      })
      await loadIssuedInvoices()
    } catch (err) {
      console.error('Error reenviando factura:', err)
      setError('Error al reenviar la factura')
    } finally {
      setProcessingInvoice(null)
    }
  }

  // Descargar PDF
  const downloadPDF = async (invoiceId: string) => {
    try {
      const blob = await adminFelService.downloadFelInvoicePDF(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error descargando PDF:', err)
      setError('Error al descargar el PDF')
    }
  }

  // Descargar XML
  const downloadXML = async (invoiceId: string) => {
    try {
      const blob = await adminFelService.downloadFelInvoiceXML(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${invoiceId}.xml`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error descargando XML:', err)
      setError('Error al descargar el XML')
    }
  }

  // Exportar datos
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await adminFelService.exportFelInvoices(format, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facturas-emitidas-fel-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando facturas emitidas:', err)
      setError('Error al exportar las facturas emitidas')
    }
  }

  useEffect(() => {
    loadIssuedInvoices()
  }, [currentPage, filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Facturación FEL', href: '/admin/facturacion' },
    { label: 'Emitidas' },
  ]

  return (
    <AdminLayout title="Facturas FEL Emitidas" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Emitidas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {invoices.length}
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
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {invoices.filter(i => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(i.issuedAt || i.createdAt) > weekAgo
                    }).length}
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
                  <p className="text-sm font-medium text-gray-600">Monto Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      invoices.reduce((sum, i) => sum + i.total, 0),
                      'GTQ'
                    )}
                  </p>
                </div>
                <FaCheck className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">IVA Total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(
                      invoices.reduce((sum, i) => sum + i.taxAmount, 0),
                      'GTQ'
                    )}
                  </p>
                </div>
                <FaCertificate className="h-8 w-8 text-orange-500" />
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
                    placeholder="Buscar por número de factura..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

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

        {/* Tabla de facturas emitidas */}
        <Card>
          <CardHeader>
            <CardTitle>Facturas Certificadas FEL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Evento</TableHead>
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
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No hay facturas emitidas
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
                        <TableCell className="text-sm">
                          Evento #{invoice.eventId}
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

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadPDF(invoice.id.toString())}
                            >
                              <FaDownload className="h-4 w-4 text-blue-600" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadXML(invoice.id.toString())}
                            >
                              <FaDownload className="h-4 w-4 text-green-600" />
                            </Button>

                            {!invoice.emailSent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resendInvoice(invoice.id.toString())}
                                disabled={processingInvoice === invoice.id.toString()}
                              >
                                <MdEmail className="h-4 w-4 text-purple-600" />
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
                <DialogTitle>Detalle de Factura Emitida</DialogTitle>
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
                        <label className="text-sm font-medium text-gray-600">Fecha de Certificación</label>
                        <p className="mt-1">{selectedInvoice.paidAt ? formatDate(selectedInvoice.paidAt) : '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email Enviado</label>
                        <p className="mt-1">
                          {selectedInvoice.emailSent ? (
                            <Badge variant="default">Sí</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </p>
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
                  <Button
                    variant="outline"
                    onClick={() => downloadPDF(selectedInvoice.id.toString())}
                  >
                    <FaDownload className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadXML(selectedInvoice.id.toString())}
                  >
                    <FaDownload className="h-4 w-4 mr-2" />
                    Descargar XML
                  </Button>
                  {!selectedInvoice.emailSent && (
                    <Button
                      onClick={() => resendInvoice(selectedInvoice.id.toString())}
                      disabled={processingInvoice === selectedInvoice.id.toString()}
                    >
                      <MdEmail className="h-4 w-4 mr-2" />
                      {processingInvoice === selectedInvoice.id.toString() ? 'Enviando...' : 'Enviar por Email'}
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

export default AdminFelIssuedPage