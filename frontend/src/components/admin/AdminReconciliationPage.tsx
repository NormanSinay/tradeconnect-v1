import React, { useState, useEffect } from 'react'
import { FaBalanceScale, FaCheck, FaTimes, FaExclamationTriangle, FaSync, FaDownload, FaEye, FaFilter } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { adminPaymentService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  ReconciliationReport,
  ReconciliationDiscrepancy,
  PaymentGateway,
} from '@/types/admin'

const AdminReconciliationPage: React.FC = () => {
  const [reports, setReports] = useState<ReconciliationReport[]>([])
  const [selectedReport, setSelectedReport] = useState<ReconciliationReport | null>(null)
  const [discrepancies, setDiscrepancies] = useState<ReconciliationDiscrepancy[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [filters, setFilters] = useState({
    gateway: 'all' as PaymentGateway | 'all',
    startDate: '',
    endDate: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar reportes de reconciliación
  const loadReconciliationReports = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Aquí iría la lógica para cargar reportes de reconciliación
      // Por ahora, usamos datos mock
      const mockReports: ReconciliationReport[] = [
        {
          id: 'rec-001',
          gateway: 'stripe',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          totalGatewayTransactions: 150,
          totalLocalTransactions: 148,
          totalDiscrepancies: 2,
          discrepancies: [],
          status: 'completed',
          generatedAt: new Date(),
        },
        {
          id: 'rec-002',
          gateway: 'paypal',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          totalGatewayTransactions: 75,
          totalLocalTransactions: 76,
          totalDiscrepancies: 1,
          discrepancies: [],
          status: 'completed',
          generatedAt: new Date(),
        },
      ]

      setReports(mockReports)
      setTotalPages(1)
    } catch (err) {
      console.error('Error cargando reportes de reconciliación:', err)
      setError('Error al cargar los reportes de reconciliación')
    } finally {
      setIsLoading(false)
    }
  }

  // Ejecutar reconciliación
  const runReconciliation = async () => {
    try {
      setIsRunning(true)
      setProgress(0)
      setError(null)

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 500)

      // Aquí iría la lógica real de reconciliación
      await new Promise(resolve => setTimeout(resolve, 5000))

      clearInterval(progressInterval)
      setProgress(100)

      // Recargar reportes
      await loadReconciliationReports()
    } catch (err) {
      console.error('Error ejecutando reconciliación:', err)
      setError('Error al ejecutar la reconciliación')
    } finally {
      setIsRunning(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  // Cargar discrepancias
  const loadDiscrepancies = async (reportId: string) => {
    try {
      const reportDiscrepancies = await adminPaymentService.getReconciliationDiscrepancies()
      setDiscrepancies(reportDiscrepancies)
    } catch (err) {
      console.error('Error cargando discrepancias:', err)
    }
  }

  // Resolver discrepancia
  const resolveDiscrepancy = async (discrepancyId: string, resolution: any) => {
    try {
      await adminPaymentService.resolveReconciliationDiscrepancy(discrepancyId, resolution)
      await loadDiscrepancies(selectedReport?.id || '')
    } catch (err) {
      console.error('Error resolviendo discrepancia:', err)
      setError('Error al resolver la discrepancia')
    }
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
      completed: { variant: 'default' as const, label: 'Completado', icon: FaCheck },
      failed: { variant: 'destructive' as const, label: 'Fallido', icon: FaTimes },
      running: { variant: 'secondary' as const, label: 'Ejecutándose', icon: FaSync },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Obtener tipo de discrepancia
  const getDiscrepancyTypeLabel = (type: string) => {
    const types = {
      missing_local: 'Falta en local',
      missing_gateway: 'Falta en pasarela',
      amount_mismatch: 'Monto diferente',
      status_mismatch: 'Estado diferente',
    }
    return types[type as keyof typeof types] || type
  }

  // Exportar reporte
  const exportReport = async (reportId: string, format: 'csv' | 'excel') => {
    try {
      const blob = await adminPaymentService.exportReconciliationReport(format, reportId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reconciliacion-${reportId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando reporte:', err)
      setError('Error al exportar el reporte')
    }
  }

  useEffect(() => {
    loadReconciliationReports()
  }, [currentPage])

  useEffect(() => {
    if (selectedReport) {
      loadDiscrepancies(selectedReport.id)
    }
  }, [selectedReport])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pagos', href: '/admin/pagos' },
    { label: 'Reconciliación' },
  ]

  return (
    <AdminLayout title="Reconciliación Bancaria" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reportes Totales</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reports.length}
                  </p>
                </div>
                <FaBalanceScale className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Discrepancias Totales</p>
                  <p className="text-2xl font-bold text-red-600">
                    {reports.reduce((sum, r) => sum + r.totalDiscrepancies, 0)}
                  </p>
                </div>
                <FaExclamationTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Coincidencia</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.length > 0
                      ? Math.round(
                          ((reports.reduce((sum, r) => sum + r.totalLocalTransactions, 0) -
                            reports.reduce((sum, r) => sum + r.totalDiscrepancies, 0)) /
                            reports.reduce((sum, r) => sum + r.totalLocalTransactions, 0)) * 100
                        )
                      : 0}%
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
                  <p className="text-sm font-medium text-gray-600">Última Ejecución</p>
                  <p className="text-sm font-bold text-gray-600">
                    {reports.length > 0 ? formatDate((reports[0] as any).generatedAt) : 'Nunca'}
                  </p>
                </div>
                <FaSync className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de reconciliación */}
        <Card>
          <CardHeader>
            <CardTitle>Ejecutar Reconciliación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Select
                  value={filters.gateway}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, gateway: value as PaymentGateway | 'all' }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Pasarela" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las pasarelas</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Transferencia</SelectItem>
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
              </div>

              <Button
                onClick={runReconciliation}
                disabled={isRunning}
                className="min-w-40"
              >
                {isRunning ? (
                  <>
                    <FaSync className="h-4 w-4 mr-2 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <FaSync className="h-4 w-4 mr-2" />
                    Ejecutar Reconciliación
                  </>
                )}
              </Button>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso de reconciliación</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
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

        {/* Tabla de reportes */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes de Reconciliación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Reporte</TableHead>
                    <TableHead>Pasarela</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Transacciones Locales</TableHead>
                    <TableHead>Transacciones Pasarela</TableHead>
                    <TableHead>Discrepancias</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Generación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
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
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No hay reportes de reconciliación
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-sm">
                          {report.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {report.gateway.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(report.startDate)} - {formatDate(report.endDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          {report.totalLocalTransactions}
                        </TableCell>
                        <TableCell className="text-center">
                          {report.totalGatewayTransactions}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={report.totalDiscrepancies > 0 ? 'destructive' : 'default'}
                          >
                            {report.totalDiscrepancies}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(report.generatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <FaEye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => exportReport(report.id, 'csv')}
                            >
                              <FaDownload className="h-4 w-4" />
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

        {/* Diálogo de detalle de reporte */}
        {selectedReport && (
          <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalle del Reporte de Reconciliación</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Resumen del reporte */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">ID Reporte</p>
                    <p className="font-mono text-sm">{selectedReport.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Pasarela</p>
                    <p className="capitalize">{selectedReport.gateway.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Fecha Generación</p>
                    <p className="text-sm">{formatDate(selectedReport.generatedAt)}</p>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedReport.totalLocalTransactions}
                        </p>
                        <p className="text-sm text-gray-600">Transacciones Locales</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {selectedReport.totalGatewayTransactions}
                        </p>
                        <p className="text-sm text-gray-600">Transacciones Pasarela</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {selectedReport.totalDiscrepancies}
                        </p>
                        <p className="text-sm text-gray-600">Discrepancias</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de discrepancias */}
                {discrepancies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Discrepancias Encontradas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {discrepancies.map((discrepancy, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="destructive">
                                {getDiscrepancyTypeLabel(discrepancy.type)}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resolveDiscrepancy(`disc-${index}`, { resolved: true })}
                              >
                                Resolver
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {discrepancy.localTransactionId && (
                                <div>
                                  <Label className="text-gray-600">ID Local</Label>
                                  <p className="font-mono">{discrepancy.localTransactionId}</p>
                                </div>
                              )}
                              {discrepancy.gatewayTransactionId && (
                                <div>
                                  <Label className="text-gray-600">ID Pasarela</Label>
                                  <p className="font-mono">{discrepancy.gatewayTransactionId}</p>
                                </div>
                              )}
                              {discrepancy.localAmount && (
                                <div>
                                  <Label className="text-gray-600">Monto Local</Label>
                                  <p>Q{discrepancy.localAmount}</p>
                                </div>
                              )}
                              {discrepancy.gatewayAmount && (
                                <div>
                                  <Label className="text-gray-600">Monto Pasarela</Label>
                                  <p>Q{discrepancy.gatewayAmount}</p>
                                </div>
                              )}
                            </div>

                            <div className="mt-2">
                              <Label className="text-gray-600">Descripción</Label>
                              <p className="text-sm">{discrepancy.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {discrepancies.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FaCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-800 mb-2">
                        ¡Reconciliación Exitosa!
                      </h3>
                      <p className="text-green-600">
                        No se encontraron discrepancias entre las transacciones locales y de la pasarela.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminReconciliationPage