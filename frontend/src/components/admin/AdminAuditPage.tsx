import React, { useState, useEffect } from 'react'
import { FaShieldAlt, FaSearch, FaFilter, FaDownload, FaEye, FaUser, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaInfo } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminSystemService } from '@/services/admin'
import type { AuditLog, AuditFilters, AuditSearchResult } from '@/types/admin'

const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showLogDetails, setShowLogDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [activeTab, setActiveTab] = useState('all')

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all')
  const [successFilter, setSuccessFilter] = useState<string>('all')

  // Estadísticas de auditoría
  const [auditStats, setAuditStats] = useState({
    totalLogs: 0,
    criticalEvents: 0,
    failedOperations: 0,
    uniqueUsers: 0,
    todayLogs: 0,
  })

  // Cargar logs de auditoría
  const loadAuditLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const filters: AuditFilters = {}

      if (actionFilter !== 'all') filters.action = [actionFilter as any]
      if (severityFilter !== 'all') filters.severity = [severityFilter as any]
      if (userFilter) filters.userId = parseInt(userFilter)
      if (dateFrom) filters.startDate = new Date(dateFrom)
      if (dateTo) filters.endDate = new Date(dateTo)
      if (resourceTypeFilter !== 'all') filters.resourceType = resourceTypeFilter
      if (successFilter !== 'all') filters.success = successFilter === 'true'

      const result: AuditSearchResult = await adminSystemService.getAuditLogs(filters, {
        page: currentPage,
        limit: 50,
      })

      setLogs(result.logs)
      setTotalPages(result.pagination.pages)
      setTotalLogs(result.pagination.total)

      // Calcular estadísticas
      calculateAuditStats(result.logs)
    } catch (err: any) {
      console.error('Error cargando logs de auditoría:', err)
      setError('Error al cargar los logs de auditoría')
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular estadísticas de auditoría
  const calculateAuditStats = (logsData: AuditLog[]) => {
    const stats = {
      totalLogs: logsData.length,
      criticalEvents: logsData.filter(log => log.severity === 'critical').length,
      failedOperations: logsData.filter(log => !log.success).length,
      uniqueUsers: new Set(logsData.map(log => log.userId).filter(Boolean)).size,
      todayLogs: logsData.filter(log => {
        const today = new Date()
        const logDate = new Date(log.timestamp)
        return logDate.toDateString() === today.toDateString()
      }).length,
    }
    setAuditStats(stats)
  }

  // Exportar reporte de auditoría
  const handleExportAuditReport = async () => {
    try {
      // TODO: Implementar exportación de reporte de auditoría
      alert('Funcionalidad de exportación próximamente disponible')
    } catch (err: any) {
      console.error('Error exportando reporte:', err)
      setError('Error al exportar el reporte de auditoría')
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
      second: '2-digit',
    }).format(new Date(date))
  }

  // Obtener badge de severidad
  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { label: 'Bajo', color: 'bg-blue-100 text-blue-800', icon: FaInfo },
      medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800', icon: FaExclamationTriangle },
      high: { label: 'Alto', color: 'bg-orange-100 text-orange-800', icon: FaExclamationTriangle },
      critical: { label: 'Crítico', color: 'bg-red-100 text-red-800', icon: FaExclamationTriangle },
    }

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low
    const Icon = config.icon

    return (
      <Badge className={`${config.color} font-medium flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Obtener badge de acción crítica
  const getCriticalActionBadge = (action: string) => {
    const criticalActions = [
      'user_delete',
      'system_config_update',
      'data_export',
      'data_import',
      'role_revoke',
      'payment_refund',
    ]

    if (criticalActions.includes(action)) {
      return (
        <Badge className="bg-red-100 text-red-800 font-medium">
          <FaShieldAlt className="h-3 w-3 mr-1" />
          Crítico
        </Badge>
      )
    }

    return null
  }

  // Obtener badge de éxito/error
  const getSuccessBadge = (success: boolean, hasError: boolean) => {
    if (hasError) {
      return (
        <Badge className="bg-red-100 text-red-800 font-medium">
          <FaTimesCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      )
    }

    return success ? (
      <Badge className="bg-green-100 text-green-800 font-medium">
        <FaCheckCircle className="h-3 w-3 mr-1" />
        Éxito
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 font-medium">
        <FaExclamationTriangle className="h-3 w-3 mr-1" />
        Advertencia
      </Badge>
    )
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setActionFilter('all')
    setSeverityFilter('all')
    setUserFilter('')
    setDateFrom('')
    setDateTo('')
    setResourceTypeFilter('all')
    setSuccessFilter('all')
    setCurrentPage(1)
  }

  // Filtrar logs por pestaña activa
  const getFilteredLogs = () => {
    switch (activeTab) {
      case 'critical':
        return logs.filter(log => log.severity === 'critical')
      case 'failed':
        return logs.filter(log => !log.success || log.errorMessage)
      case 'today':
        const today = new Date()
        return logs.filter(log => {
          const logDate = new Date(log.timestamp)
          return logDate.toDateString() === today.toDateString()
        })
      default:
        return logs
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [currentPage, searchTerm, actionFilter, severityFilter, userFilter, dateFrom, dateTo, resourceTypeFilter, successFilter])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Auditoría' },
  ]

  const filteredLogs = getFilteredLogs()

  return (
    <AdminLayout title="Auditoría de Cambios" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Mensajes de error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas de auditoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold">{auditStats.totalLogs}</p>
                </div>
                <FaShieldAlt className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eventos Críticos</p>
                  <p className="text-2xl font-bold text-red-600">{auditStats.criticalEvents}</p>
                </div>
                <FaExclamationTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Operaciones Fallidas</p>
                  <p className="text-2xl font-bold text-orange-600">{auditStats.failedOperations}</p>
                </div>
                <FaTimesCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Únicos</p>
                  <p className="text-2xl font-bold text-green-600">{auditStats.uniqueUsers}</p>
                </div>
                <FaUser className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Logs de Hoy</p>
                  <p className="text-2xl font-bold text-purple-600">{auditStats.todayLogs}</p>
                </div>
                <FaCalendarAlt className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaFilter className="h-5 w-5" />
              Filtros de Auditoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Usuario, acción, recurso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="action">Acción</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las acciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="user_create">Crear usuario</SelectItem>
                    <SelectItem value="user_update">Actualizar usuario</SelectItem>
                    <SelectItem value="user_delete">Eliminar usuario</SelectItem>
                    <SelectItem value="role_assign">Asignar rol</SelectItem>
                    <SelectItem value="role_revoke">Revocar rol</SelectItem>
                    <SelectItem value="system_config_update">Configuración sistema</SelectItem>
                    <SelectItem value="data_export">Exportar datos</SelectItem>
                    <SelectItem value="data_import">Importar datos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severidad</Label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las severidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="success">Estado</Label>
                <Select value={successFilter} onValueChange={setSuccessFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Exitosos</SelectItem>
                    <SelectItem value="false">Fallidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
              <Button onClick={handleExportAuditReport}>
                <FaDownload className="h-4 w-4 mr-2" />
                Exportar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs de auditoría por pestañas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaShieldAlt className="h-5 w-5" />
              Logs de Auditoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todos ({logs.length})</TabsTrigger>
                <TabsTrigger value="critical">Críticos ({auditStats.criticalEvents})</TabsTrigger>
                <TabsTrigger value="failed">Fallidos ({auditStats.failedOperations})</TabsTrigger>
                <TabsTrigger value="today">Hoy ({auditStats.todayLogs})</TabsTrigger>
              </TabsList>

              {['all', 'critical', 'failed', 'today'].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha/Hora</TableHead>
                              <TableHead>Usuario</TableHead>
                              <TableHead>Acción</TableHead>
                              <TableHead>Recurso</TableHead>
                              <TableHead>Severidad</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Detalles</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="font-mono text-sm">
                                  {formatDate(log.timestamp)}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {log.userEmail || `Usuario ${log.userId || 'Sistema'}`}
                                    </div>
                                    {log.ipAddress && (
                                      <div className="text-xs text-gray-500 font-mono">
                                        {log.ipAddress}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="capitalize font-medium">
                                      {log.action.replace('_', ' ')}
                                    </div>
                                    {getCriticalActionBadge(log.action)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{log.resourceType}</div>
                                    {log.resourceId && (
                                      <div className="text-xs text-gray-500 font-mono">
                                        ID: {log.resourceId}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                                <TableCell>
                                  {getSuccessBadge(log.success, !!log.errorMessage)}
                                </TableCell>
                                <TableCell>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <FaEye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl">
                                      <DialogHeader>
                                        <DialogTitle>Detalles de Auditoría</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>ID del Log</Label>
                                            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{log.id}</p>
                                          </div>
                                          <div>
                                            <Label>Timestamp</Label>
                                            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                                              {formatDate(log.timestamp)}
                                            </p>
                                          </div>
                                          <div>
                                            <Label>Usuario</Label>
                                            <p className="bg-gray-100 p-2 rounded">
                                              {log.userEmail || `ID: ${log.userId || 'Sistema'}`}
                                            </p>
                                          </div>
                                          <div>
                                            <Label>Dirección IP</Label>
                                            <p className="font-mono bg-gray-100 p-2 rounded">
                                              {log.ipAddress || 'N/A'}
                                            </p>
                                          </div>
                                          <div>
                                            <Label>User Agent</Label>
                                            <p className="text-xs bg-gray-100 p-2 rounded break-all">
                                              {log.userAgent || 'N/A'}
                                            </p>
                                          </div>
                                          <div>
                                            <Label>Acción</Label>
                                            <p className="bg-gray-100 p-2 rounded capitalize">
                                              {log.action.replace('_', ' ')}
                                            </p>
                                          </div>
                                        </div>

                                        {log.location && (
                                          <div>
                                            <Label>Ubicación</Label>
                                            <div className="bg-gray-100 p-3 rounded">
                                              <p>País: {log.location.country || 'N/A'}</p>
                                              <p>Ciudad: {log.location.city || 'N/A'}</p>
                                              {log.location.latitude && log.location.longitude && (
                                                <p className="font-mono text-xs">
                                                  Coordenadas: {log.location.latitude}, {log.location.longitude}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {log.oldValues && (
                                          <div>
                                            <Label>Valores Anteriores</Label>
                                            <pre className="bg-red-50 border border-red-200 p-3 rounded text-xs overflow-x-auto">
                                              {JSON.stringify(log.oldValues, null, 2)}
                                            </pre>
                                          </div>
                                        )}

                                        {log.newValues && (
                                          <div>
                                            <Label>Valores Nuevos</Label>
                                            <pre className="bg-green-50 border border-green-200 p-3 rounded text-xs overflow-x-auto">
                                              {JSON.stringify(log.newValues, null, 2)}
                                            </pre>
                                          </div>
                                        )}

                                        {log.metadata && (
                                          <div>
                                            <Label>Metadata Adicional</Label>
                                            <pre className="bg-blue-50 border border-blue-200 p-3 rounded text-xs overflow-x-auto">
                                              {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                          </div>
                                        )}

                                        {log.errorMessage && (
                                          <div>
                                            <Label className="text-red-600">Mensaje de Error</Label>
                                            <div className="bg-red-50 border border-red-200 p-3 rounded">
                                              <p className="text-red-700">{log.errorMessage}</p>
                                            </div>
                                          </div>
                                        )}

                                        <div className="flex gap-2">
                                          {getSeverityBadge(log.severity)}
                                          {getSuccessBadge(log.success, !!log.errorMessage)}
                                          {getCriticalActionBadge(log.action)}
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Paginación */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages} ({totalLogs} logs totales)
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              Anterior
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Siguiente
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminAuditPage