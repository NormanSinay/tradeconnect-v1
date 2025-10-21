import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FaChartBar,
  FaChartLine,
  FaUsers,
  FaClock,
  FaDownload,
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaExclamationTriangle
} from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminCapacityService } from '@/services/admin'
import { formatDateTime, formatDate } from '@/utils/date'
import { toast } from '@/utils/toast'
import type {
  CapacityStats,
  RealTimeOccupancyReport,
  CapacityReport,
  OverbookingRiskLevel
} from '@/types/admin'

const AdminCapacityStatsPage: React.FC = () => {
  const { eventoId } = useParams<{ eventoId: string }>()
  const navigate = useNavigate()
  const eventId = parseInt(eventoId || '0')

  // Estados principales
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [capacityStats, setCapacityStats] = useState<CapacityStats | null>(null)
  const [realtimeReport, setRealtimeReport] = useState<RealTimeOccupancyReport | null>(null)
  const [capacityReport, setCapacityReport] = useState<CapacityReport | null>(null)

  // Filtros
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Cargar datos iniciales
  useEffect(() => {
    if (eventId) {
      loadData()
    }
  }, [eventId, timeRange])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calcular fechas según el rango seleccionado
      const endDate = new Date()
      const startDate = new Date()
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      const [stats, realtime, report] = await Promise.all([
        adminCapacityService.getCapacityStats(eventId, {
          dateFrom: startDate,
          dateTo: endDate
        }),
        adminCapacityService.getRealTimeOccupancyReport(eventId),
        adminCapacityService.getCapacityReport(eventId, {
          startDate,
          endDate
        })
      ])

      setCapacityStats(stats)
      setRealtimeReport(realtime)
      setCapacityReport(report)

    } catch (err) {
      console.error('Error cargando estadísticas de capacidad:', err)
      setError('Error al cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  // Exportar datos
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await adminCapacityService.exportCapacityData(eventId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `estadisticas-aforo-${eventId}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Datos exportados correctamente')
    } catch (err) {
      console.error('Error exportando datos:', err)
      toast.error('Error al exportar los datos')
    }
  }

  // Obtener icono de tendencia
  const getTrendIcon = (value: number) => {
    if (value > 0) return <FaArrowUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <FaArrowDown className="h-4 w-4 text-red-500" />
    return <FaMinus className="h-4 w-4 text-gray-500" />
  }

  // Obtener color de badge según severidad
  const getSeverityBadge = (severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'INFO': 'default',
      'WARNING': 'secondary',
      'CRITICAL': 'destructive'
    }
    return variants[severity] || 'secondary'
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: 'Aforos', href: `/admin/aforos/${eventId}` },
    { label: 'Estadísticas' }
  ]

  if (loading) {
    return (
      <AdminLayout title="Estadísticas de Aforo" breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !capacityStats || !realtimeReport || !capacityReport) {
    return (
      <AdminLayout title="Estadísticas de Aforo" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error || 'Error al cargar las estadísticas'}</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Estadísticas de Aforo" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Estadísticas de Aforo</h1>
            <p className="text-gray-600">Análisis detallado de ocupación y tendencias</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => navigate(`/admin/aforos/${eventId}`)}>
              <FaUsers className="mr-2" />
              Volver a Aforos
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaUsers className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilización Promedio</p>
                  <p className="text-2xl font-bold">{capacityStats.capacity.utilized.toFixed(1)}%</p>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(capacityStats.trends.utilizationGrowth)}
                    <span className="text-sm text-gray-500 ml-1">
                      {Math.abs(capacityStats.trends.utilizationGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaClock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lista de Espera</p>
                  <p className="text-2xl font-bold">{capacityStats.waitlist.total}</p>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(capacityStats.trends.waitlistGrowth)}
                    <span className="text-sm text-gray-500 ml-1">
                      {Math.abs(capacityStats.trends.waitlistGrowth).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaChartLine className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                  <p className="text-2xl font-bold">{(capacityStats.trends.conversionRate * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">Lista → Confirmado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaCalendar className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fecha Lleno Estimada</p>
                  <p className="text-2xl font-bold">
                    {capacityReport.trends.predictedFullDate
                      ? formatDate(capacityReport.trends.predictedFullDate)
                      : 'N/A'
                    }
                  </p>
                  <p className="text-sm text-gray-500">Basado en tendencias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de estadísticas */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="realtime">Tiempo Real</TabsTrigger>
            <TabsTrigger value="breakdown">Desglose</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Capacidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacidad Total</span>
                      <span>{capacityStats.capacity.total}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confirmados ({capacityStats.capacity.confirmed})</span>
                      <span>{((capacityStats.capacity.confirmed / capacityStats.capacity.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(capacityStats.capacity.confirmed / capacityStats.capacity.total) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Bloqueados ({capacityStats.capacity.blocked})</span>
                      <span>{((capacityStats.capacity.blocked / capacityStats.capacity.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(capacityStats.capacity.blocked / capacityStats.capacity.total) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disponibles ({capacityStats.capacity.available})</span>
                      <span>{((capacityStats.capacity.available / capacityStats.capacity.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(capacityStats.capacity.available / capacityStats.capacity.total) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Espera</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{capacityStats.waitlist.total}</div>
                    <div className="text-sm text-gray-600">Total en lista</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-green-600">{capacityStats.waitlist.confirmed}</div>
                      <div className="text-xs text-gray-600">Confirmados</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-orange-600">{capacityStats.waitlist.notified}</div>
                      <div className="text-xs text-gray-600">Notificados</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-600">{capacityStats.waitlist.active}</div>
                      <div className="text-xs text-gray-600">Activos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {capacityReport.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <FaExclamationTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                  {capacityReport.recommendations.length === 0 && (
                    <li className="text-sm text-gray-600">No hay recomendaciones específicas en este momento.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tiempo Real */}
          <TabsContent value="realtime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reporte de Ocupación en Tiempo Real</CardTitle>
                <p className="text-sm text-gray-600">
                  Última actualización: {formatDateTime(realtimeReport.timestamp)}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {realtimeReport.utilizationPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Utilización Actual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {realtimeReport.availableSpots}
                    </div>
                    <div className="text-sm text-gray-600">Plazas Disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {realtimeReport.blockedSpots}
                    </div>
                    <div className="text-sm text-gray-600">Plazas Bloqueadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {realtimeReport.waitlistCount}
                    </div>
                    <div className="text-sm text-gray-600">En Lista de Espera</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Desglose por Tipo de Acceso</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de Acceso</TableHead>
                        <TableHead>Capacidad</TableHead>
                        <TableHead>Ocupado</TableHead>
                        <TableHead>Disponible</TableHead>
                        <TableHead>Bloqueado</TableHead>
                        <TableHead>Utilización</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realtimeReport.accessTypesBreakdown.map((accessType) => (
                        <TableRow key={accessType.accessTypeId}>
                          <TableCell className="font-medium">{accessType.name}</TableCell>
                          <TableCell>{accessType.capacity}</TableCell>
                          <TableCell>{accessType.occupied}</TableCell>
                          <TableCell>{accessType.available}</TableCell>
                          <TableCell>{accessType.blocked}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={(accessType.occupied / accessType.capacity) * 100} className="w-16 h-2" />
                              <span className="text-sm">{((accessType.occupied / accessType.capacity) * 100).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Desglose */}
          <TabsContent value="breakdown" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Desglose por Tipo de Acceso</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Acceso</TableHead>
                      <TableHead>Capacidad</TableHead>
                      <TableHead>Ocupado</TableHead>
                      <TableHead>Disponible</TableHead>
                      <TableHead>Utilización</TableHead>
                      <TableHead>Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capacityReport.accessTypesBreakdown.map((accessType) => (
                      <TableRow key={accessType.accessTypeId}>
                        <TableCell className="font-medium">{accessType.name}</TableCell>
                        <TableCell>{accessType.capacity}</TableCell>
                        <TableCell>{accessType.occupied}</TableCell>
                        <TableCell>{accessType.available}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={(accessType.occupied / accessType.capacity) * 100} className="w-20 h-2" />
                            <span className="text-sm">{((accessType.occupied / accessType.capacity) * 100).toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>N/A</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alertas */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas y Notificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                {realtimeReport.alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <FaChartBar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay alertas activas
                    </h3>
                    <p className="text-gray-600">
                      Todas las métricas están dentro de los parámetros normales.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {realtimeReport.alerts.map((alert, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                        <FaExclamationTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={getSeverityBadge(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <span className="text-sm text-gray-600">{alert.type}</span>
                          </div>
                          <p className="text-sm">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

export default AdminCapacityStatsPage