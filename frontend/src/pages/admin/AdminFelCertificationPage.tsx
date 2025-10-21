import React, { useState, useEffect } from 'react'
import { FaCertificate, FaCheck, FaTimes, FaClock, FaExclamationTriangle, FaSync, FaEye, FaFilter, FaDownload } from 'react-icons/fa'
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
  FelDocument,
  FelCertifier,
  FelDocumentStatus,
} from '@/types/admin'

interface CertificationLog {
  id: string
  documentId: string
  certifier: FelCertifier
  status: 'success' | 'failed' | 'pending' | 'retrying'
  authorizationNumber?: string
  authorizationDate?: Date
  errorMessage?: string
  processingTime?: number
  createdAt: Date
  completedAt?: Date
}

const AdminFelCertificationPage: React.FC = () => {
  const [certificationLogs, setCertificationLogs] = useState<CertificationLog[]>([])
  const [selectedLog, setSelectedLog] = useState<CertificationLog | null>(null)
  const [certifierStatus, setCertifierStatus] = useState<Record<FelCertifier, {
    status: 'operational' | 'degraded' | 'down'
    lastCheck: Date
    responseTime?: number
  }>>({} as any)
  const [filters, setFilters] = useState({
    certifier: 'all' as FelCertifier | 'all',
    status: 'all' as 'all' | 'success' | 'failed' | 'pending' | 'retrying',
    startDate: '',
    endDate: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingCertifier, setProcessingCertifier] = useState<string | null>(null)

  // Cargar logs de certificación
  const loadCertificationLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Aquí iría la lógica para cargar logs de certificación
      // Por ahora, usamos datos mock
      const mockLogs: CertificationLog[] = [
        {
          id: 'cert-001',
          documentId: 'doc-001',
          certifier: 'infile',
          status: 'success',
          authorizationNumber: '123456789',
          authorizationDate: new Date(),
          processingTime: 1500,
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 'cert-002',
          documentId: 'doc-002',
          certifier: 'dimexa',
          status: 'failed',
          errorMessage: 'Error de conexión con SAT',
          processingTime: 3000,
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 'cert-003',
          documentId: 'doc-003',
          certifier: 'infile',
          status: 'pending',
          createdAt: new Date(),
        },
      ]

      setCertificationLogs(mockLogs)
      setTotalPages(1)
    } catch (err) {
      console.error('Error cargando logs de certificación:', err)
      setError('Error al cargar los logs de certificación')
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar estado de certificadores
  const checkCertifierStatus = async () => {
    try {
      const certifiers: FelCertifier[] = ['infile', 'dimexa']

      for (const certifier of certifiers) {
        try {
          const startTime = Date.now()
          await adminFelService.testFelCertifierConnection(certifier)
          const responseTime = Date.now() - startTime

          setCertifierStatus(prev => ({
            ...prev,
            [certifier]: {
              status: 'operational',
              lastCheck: new Date(),
              responseTime,
            },
          }))
        } catch (err) {
          setCertifierStatus(prev => ({
            ...prev,
            [certifier]: {
              status: 'down',
              lastCheck: new Date(),
            },
          }))
        }
      }
    } catch (err) {
      console.error('Error verificando estado de certificadores:', err)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = () => {
    setCurrentPage(1)
    loadCertificationLogs()
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      certifier: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
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

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { variant: 'default' as const, label: 'Exitoso', icon: FaCheck },
      failed: { variant: 'destructive' as const, label: 'Fallido', icon: FaTimes },
      pending: { variant: 'secondary' as const, label: 'Pendiente', icon: FaClock },
      retrying: { variant: 'outline' as const, label: 'Reintentando', icon: FaSync },
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

  // Obtener badge de estado de certificador
  const getCertifierStatusBadge = (status: string) => {
    const statusConfig = {
      operational: { variant: 'default' as const, label: 'Operativo', color: 'text-green-600' },
      degraded: { variant: 'secondary' as const, label: 'Degradado', color: 'text-yellow-600' },
      down: { variant: 'destructive' as const, label: 'Fuera de servicio', color: 'text-red-600' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.down

    return (
      <Badge variant={config.variant} className={cn('flex items-center gap-1', config.color)}>
        <div className="w-2 h-2 rounded-full bg-current"></div>
        {config.label}
      </Badge>
    )
  }

  // Probar conexión con certificador
  const testCertifierConnection = async (certifier: FelCertifier) => {
    try {
      setProcessingCertifier(certifier)
      await adminFelService.testFelCertifierConnection(certifier)
      await checkCertifierStatus()
    } catch (err) {
      console.error('Error probando conexión:', err)
      setError('Error al probar la conexión con el certificador')
    } finally {
      setProcessingCertifier(null)
    }
  }

  // Exportar logs
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      // Aquí iría la lógica para exportar logs de certificación
      const blob = new Blob([''], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `logs-certificacion-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando logs:', err)
      setError('Error al exportar los logs de certificación')
    }
  }

  useEffect(() => {
    loadCertificationLogs()
    checkCertifierStatus()
  }, [currentPage])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Facturación FEL', href: '/admin/facturacion' },
    { label: 'Certificación SAT' },
  ]

  return (
    <AdminLayout title="Certificación SAT FEL" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estado de certificadores */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Certificadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(certifierStatus).map(([certifier, status]) => (
                <div key={certifier} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaCertificate className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium capitalize">{certifier}</p>
                      <p className="text-sm text-gray-600">
                        Última verificación: {formatDate(status.lastCheck)}
                        {status.responseTime && ` (${status.responseTime}ms)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCertifierStatusBadge(status.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testCertifierConnection(certifier as FelCertifier)}
                      disabled={processingCertifier === certifier}
                    >
                      <FaSync className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Certificaciones</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {certificationLogs.length}
                  </p>
                </div>
                <FaCertificate className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Exitosas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {certificationLogs.filter(l => l.status === 'success').length}
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
                  <p className="text-sm font-medium text-gray-600">Fallidas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {certificationLogs.filter(l => l.status === 'failed').length}
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
                  <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {certificationLogs.length > 0
                      ? Math.round((certificationLogs.filter(l => l.status === 'success').length / certificationLogs.length) * 100)
                      : 0}%
                  </p>
                </div>
                <FaCertificate className="h-8 w-8 text-purple-500" />
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
                    placeholder="Buscar por ID de documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={filters.certifier}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, certifier: value as FelCertifier | 'all' }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Certificador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los certificadores</SelectItem>
                    <SelectItem value="infile">InFile</SelectItem>
                    <SelectItem value="dimexa">Dimexa</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="success">Exitosos</SelectItem>
                    <SelectItem value="failed">Fallidos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="retrying">Reintentando</SelectItem>
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

        {/* Tabla de logs de certificación */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Certificación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Documento</TableHead>
                    <TableHead>Certificador</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Número Autorización</TableHead>
                    <TableHead>Tiempo Procesamiento</TableHead>
                    <TableHead>Fecha Creación</TableHead>
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
                  ) : certificationLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No hay logs de certificación
                      </TableCell>
                    </TableRow>
                  ) : (
                    certificationLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {log.documentId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.certifier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.status)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.authorizationNumber || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.processingTime ? `${log.processingTime}ms` : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <FaEye className="h-4 w-4" />
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

        {/* Diálogo de detalle del log */}
        {selectedLog && (
          <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalle del Log de Certificación</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">ID Documento</p>
                    <p className="font-mono text-sm">{selectedLog.documentId}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Certificador</p>
                    <p className="capitalize">{selectedLog.certifier}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Tiempo Procesamiento</p>
                    <p>{selectedLog.processingTime ? `${selectedLog.processingTime}ms` : '-'}</p>
                  </div>
                </div>

                {/* Información detallada */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Certificación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Número de Autorización</label>
                        <p className="mt-1 font-mono text-sm">{selectedLog.authorizationNumber || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Autorización</label>
                        <p className="mt-1">{selectedLog.authorizationDate ? formatDate(selectedLog.authorizationDate) : '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                        <p className="mt-1">{formatDate(selectedLog.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Finalización</label>
                        <p className="mt-1">{selectedLog.completedAt ? formatDate(selectedLog.completedAt) : '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Error */}
                {selectedLog.errorMessage && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-800">Error de Certificación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-700">{selectedLog.errorMessage}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Acciones */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedLog(null)}>
                    Cerrar
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

export default AdminFelCertificationPage