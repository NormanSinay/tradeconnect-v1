import React, { useState, useEffect } from 'react'
import { FaFileAlt, FaSearch, FaFilter, FaDownload, FaEye, FaExclamationTriangle, FaInfo, FaCheck, FaTimes } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminSystemService } from '@/services/admin'
import type { AuditLog, AuditFilters, AuditQueryParams, AuditSearchResult } from '@/types/admin'

const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showLogDetails, setShowLogDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all')
  const [successFilter, setSuccessFilter] = useState<string>('all')

  // Cargar logs
  const loadLogs = async () => {
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

      const params: AuditQueryParams = {
        page: currentPage,
        limit: 50,
        search: searchTerm || undefined,
        filters,
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      }

      const result: AuditSearchResult = await adminSystemService.getAuditLogs(filters, {
        page: currentPage,
        limit: 50,
      })

      setLogs(result.logs)
      setTotalPages(result.pagination.pages)
      setTotalLogs(result.pagination.total)
    } catch (err: any) {
      console.error('Error cargando logs:', err)
      setError('Error al cargar los logs del sistema')
    } finally {
      setIsLoading(false)
    }
  }

  // Exportar logs
  const handleExportLogs = async () => {
    try {
      // TODO: Implementar exportación de logs
      // await adminSystemService.exportAuditLogs({ ... })
      alert('Funcionalidad de exportación próximamente disponible')
    } catch (err: any) {
      console.error('Error exportando logs:', err)
      setError('Error al exportar los logs')
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
      low: { label: 'Bajo', color: 'bg-blue-100 text-blue-800' },
      medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Alto', color: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Crítico', color: 'bg-red-100 text-red-800' },
    }

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low

    return (
      <Badge className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    )
  }

  // Obtener icono de acción
  const getActionIcon = (action: string) => {
    const actionConfig = {
      login: { icon: FaCheck, color: 'text-green-500' },
      logout: { icon: FaTimes, color: 'text-gray-500' },
      password_change: { icon: FaKey, color: 'text-blue-500' },
      user_create: { icon: FaUserPlus, color: 'text-green-500' },
      user_update: { icon: FaUserEdit, color: 'text-blue-500' },
      user_delete: { icon: FaTrash, color: 'text-red-500' },
      system_config_update: { icon: FaCog, color: 'text-purple-500' },
      data_export: { icon: FaDownload, color: 'text-blue-500' },
    }

    const config = actionConfig[action as keyof typeof actionConfig] || { icon: FaInfo, color: 'text-gray-500' }
    const Icon = config.icon

    return <Icon className={`h-4 w-4 ${config.color}`} />
  }

  // Obtener badge de éxito
  const getSuccessBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-100 text-green-800 font-medium">
        <FaCheck className="h-3 w-3 mr-1" />
        Éxito
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 font-medium">
        <FaTimes className="h-3 w-3 mr-1" />
        Error
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

  useEffect(() => {
    loadLogs()
  }, [currentPage, searchTerm, actionFilter, severityFilter, userFilter, dateFrom, dateTo, resourceTypeFilter, successFilter])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Logs del Sistema' },
  ]

  return (
    <AdminLayout title="Logs del Sistema" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Mensajes de error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTimes className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaFilter className="h-5 w-5" />
              Filtros de Búsqueda
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
                    <SelectItem value="password_change">Cambio de contraseña</SelectItem>
                    <SelectItem value="user_create">Crear usuario</SelectItem>
                    <SelectItem value="user_update">Actualizar usuario</SelectItem>
                    <SelectItem value="user_delete">Eliminar usuario</SelectItem>
                    <SelectItem value="system_config_update">Configuración sistema</SelectItem>
                    <SelectItem value="data_export">Exportar datos</SelectItem>
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

              <div>
                <Label htmlFor="userId">ID de Usuario</Label>
                <Input
                  id="userId"
                  placeholder="123"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dateFrom">Fecha Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dateTo">Fecha Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="resourceType">Tipo de Recurso</Label>
                <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los recursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="payment">Pago</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
              <Button onClick={handleExportLogs}>
                <FaDownload className="h-4 w-4 mr-2" />
                Exportar Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaFileAlt className="h-5 w-5" />
              Logs del Sistema ({totalLogs})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
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
                                <div className="text-xs text-gray-500">{log.ipAddress}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <span className="capitalize">
                                {log.action.replace('_', ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.resourceType}</div>
                              {log.resourceId && (
                                <div className="text-xs text-gray-500">ID: {log.resourceId}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                          <TableCell>{getSuccessBadge(log.success)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <FaEye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalles del Log</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>ID del Log</Label>
                                      <p className="font-mono text-sm">{log.id}</p>
                                    </div>
                                    <div>
                                      <Label>Timestamp</Label>
                                      <p className="font-mono text-sm">{formatDate(log.timestamp)}</p>
                                    </div>
                                    <div>
                                      <Label>Usuario</Label>
                                      <p>{log.userEmail || `ID: ${log.userId || 'Sistema'}`}</p>
                                    </div>
                                    <div>
                                      <Label>IP Address</Label>
                                      <p className="font-mono">{log.ipAddress || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label>Acción</Label>
                                      <p className="capitalize">{log.action.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                      <Label>Recurso</Label>
                                      <p>{log.resourceType} {log.resourceId && `(ID: ${log.resourceId})`}</p>
                                    </div>
                                  </div>

                                  {log.oldValues && (
                                    <div>
                                      <Label>Valores Anteriores</Label>
                                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(log.oldValues, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {log.newValues && (
                                    <div>
                                      <Label>Valores Nuevos</Label>
                                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(log.newValues, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {log.metadata && (
                                    <div>
                                      <Label>Metadata Adicional</Label>
                                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {log.errorMessage && (
                                    <div>
                                      <Label className="text-red-600">Mensaje de Error</Label>
                                      <p className="text-red-700 bg-red-50 p-2 rounded">{log.errorMessage}</p>
                                    </div>
                                  )}
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminLogsPage