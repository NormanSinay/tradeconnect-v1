import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaFileAlt, FaPlus, FaEdit, FaTrash, FaPlay, FaSave, FaTable, FaEye, FaCog } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ChartWrapper } from '@/components/admin/ChartWrapper'
import { DashboardFilters } from '@/components/admin/DashboardFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { adminReportService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type { DashboardFilters as DashboardFiltersType, LineChartData, BarChartData, PieChartData } from '@/types/admin'

interface CustomReport {
  id: string
  name: string
  description: string
  type: 'events' | 'registrations' | 'payments' | 'speakers' | 'certificates' | 'system'
  filters: Record<string, any>
  groupBy?: string[]
  metrics?: string[]
  dateRange: { start: Date; end: Date }
  format: 'json' | 'csv' | 'excel' | 'pdf'
  createdAt: Date
  lastRun?: Date
  isScheduled: boolean
}

interface ReportBuilder {
  name: string
  description: string
  type: CustomReport['type']
  filters: Record<string, any>
  groupBy: string[]
  metrics: string[]
  dateRange: { start: Date; end: Date }
  format: CustomReport['format']
}

const AdminCustomReportPage: React.FC = () => {
  const [customReports, setCustomReports] = useState<CustomReport[]>([])
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [reportChart, setReportChart] = useState<LineChartData | BarChartData | PieChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [viewMode, setViewMode] = useState<'builder' | 'reports' | 'results'>('reports')
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado del constructor de reportes
  const [builder, setBuilder] = useState<ReportBuilder>({
    name: '',
    description: '',
    type: 'events',
    filters: {},
    groupBy: [],
    metrics: [],
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
      end: new Date()
    },
    format: 'json'
  })

  // Opciones disponibles según el tipo de reporte
  const reportOptions = {
    events: {
      metrics: ['totalEvents', 'publishedEvents', 'totalRegistrations', 'averageOccupancy', 'totalRevenue'],
      groupBy: ['category', 'status', 'organizer', 'month', 'year'],
      filters: ['startDate', 'endDate', 'category', 'status', 'organizerId']
    },
    registrations: {
      metrics: ['totalRegistrations', 'confirmedRegistrations', 'pendingRegistrations', 'cancelledRegistrations', 'conversionRate'],
      groupBy: ['eventId', 'status', 'paymentStatus', 'month', 'year'],
      filters: ['startDate', 'endDate', 'eventId', 'status', 'paymentStatus']
    },
    payments: {
      metrics: ['totalRevenue', 'totalTransactions', 'averageTransactionValue', 'refundRate', 'paymentMethodBreakdown'],
      groupBy: ['paymentMethod', 'eventId', 'month', 'year'],
      filters: ['startDate', 'endDate', 'paymentMethod', 'eventId', 'minAmount', 'maxAmount']
    },
    speakers: {
      metrics: ['totalSpeakers', 'activeSpeakers', 'averageRating', 'totalEvents', 'totalPayments'],
      groupBy: ['specialty', 'status', 'month', 'year'],
      filters: ['startDate', 'endDate', 'specialty', 'status', 'minRating', 'maxRating']
    },
    certificates: {
      metrics: ['totalCertificates', 'issuedCertificates', 'validatedCertificates', 'blockchainStored', 'validationRate'],
      groupBy: ['eventId', 'type', 'status', 'month', 'year'],
      filters: ['startDate', 'endDate', 'eventId', 'type', 'status']
    },
    system: {
      metrics: ['totalUsers', 'activeUsers', 'totalEvents', 'systemUptime', 'errorRate'],
      groupBy: ['day', 'week', 'month', 'year'],
      filters: ['startDate', 'endDate', 'component', 'severity']
    }
  }

  // Cargar reportes personalizados
  const loadCustomReports = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simular carga de reportes guardados
      const mockReports: CustomReport[] = [
        {
          id: '1',
          name: 'Ingresos por Evento - Último Mes',
          description: 'Análisis de ingresos generados por cada evento en el último mes',
          type: 'events',
          filters: { period: 'last30days' },
          groupBy: ['eventId'],
          metrics: ['totalRevenue', 'totalRegistrations'],
          dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
          format: 'excel',
          createdAt: new Date(),
          lastRun: new Date(),
          isScheduled: false
        },
        {
          id: '2',
          name: 'Rendimiento de Speakers',
          description: 'Evaluación del rendimiento de speakers por especialidad',
          type: 'speakers',
          filters: { minRating: 4.0 },
          groupBy: ['specialty'],
          metrics: ['averageRating', 'totalEvents', 'totalEarnings'],
          dateRange: { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), end: new Date() },
          format: 'pdf',
          createdAt: new Date(),
          lastRun: new Date(),
          isScheduled: true
        }
      ]

      setCustomReports(mockReports)
    } catch (err) {
      console.error('Error cargando reportes personalizados:', err)
      setError('Error al cargar los reportes personalizados')
    } finally {
      setIsLoading(false)
    }
  }

  // Ejecutar reporte
  const runReport = async (report: CustomReport) => {
    try {
      setIsRunning(true)
      setError(null)
      setSelectedReport(report)

      const result = await adminReportService.generateCustomReport({
        name: report.name,
        type: report.type,
        filters: report.filters,
        groupBy: report.groupBy,
        metrics: report.metrics,
        dateRange: report.dateRange,
        format: report.format
      })

      setReportData(result)

      // Crear gráfico basado en los datos
      if (result && result.data) {
        const chartData: LineChartData = {
          labels: result.data.map((item: any, index: number) => item.label || `Item ${index + 1}`),
          datasets: [{
            label: (report.metrics && report.metrics[0]) || 'Valor',
            data: result.data.map((item: any) => item.value || (report.metrics && report.metrics[0] && item[report.metrics[0]]) || 0),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }]
        }
        setReportChart(chartData)
      }

      setViewMode('results')
    } catch (err) {
      console.error('Error ejecutando reporte:', err)
      setError('Error al ejecutar el reporte')
    } finally {
      setIsRunning(false)
    }
  }

  // Guardar reporte personalizado
  const saveReport = async () => {
    try {
      if (!builder.name.trim()) {
        setError('El nombre del reporte es requerido')
        return
      }

      const newReport: CustomReport = {
        id: Date.now().toString(),
        name: builder.name,
        description: builder.description,
        type: builder.type,
        filters: builder.filters,
        groupBy: builder.groupBy,
        metrics: builder.metrics,
        dateRange: builder.dateRange,
        format: builder.format,
        createdAt: new Date(),
        isScheduled: false
      }

      setCustomReports(prev => [...prev, newReport])

      // Resetear constructor
      setBuilder({
        name: '',
        description: '',
        type: 'events',
        filters: {},
        groupBy: [],
        metrics: [],
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        format: 'json'
      })

      setViewMode('reports')
    } catch (err) {
      console.error('Error guardando reporte:', err)
      setError('Error al guardar el reporte')
    }
  }

  // Eliminar reporte
  const deleteReport = async (reportId: string) => {
    try {
      setCustomReports(prev => prev.filter(r => r.id !== reportId))
    } catch (err) {
      console.error('Error eliminando reporte:', err)
      setError('Error al eliminar el reporte')
    }
  }

  // Manejar cambios en el constructor
  const handleBuilderChange = (field: keyof ReportBuilder, value: any) => {
    setBuilder(prev => ({ ...prev, [field]: value }))
  }

  // Manejar cambios en métricas y agrupaciones
  const handleMetricsChange = (metric: string, checked: boolean) => {
    setBuilder(prev => ({
      ...prev,
      metrics: checked
        ? [...prev.metrics, metric]
        : prev.metrics.filter(m => m !== metric)
    }))
  }

  const handleGroupByChange = (group: string, checked: boolean) => {
    setBuilder(prev => ({
      ...prev,
      groupBy: checked
        ? [...prev.groupBy, group]
        : prev.groupBy.filter(g => g !== group)
    }))
  }

  useEffect(() => {
    loadCustomReports()
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Personalizados' },
  ]

  return (
    <AdminLayout title="Reportes Personalizados" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
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

        {/* Selector de vista */}
        <Card>
          <CardContent className="p-4">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'builder' | 'reports' | 'results')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reports">Mis Reportes</TabsTrigger>
                <TabsTrigger value="builder">Constructor</TabsTrigger>
                <TabsTrigger value="results" disabled={!reportData}>Resultados</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Vista de reportes guardados */}
        {viewMode === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Reportes Personalizados</h2>
              <Button onClick={() => setViewMode('builder')}>
                <FaPlus className="h-4 w-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : customReports.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <FaFileAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes personalizados</h3>
                    <p className="text-gray-600 mb-4">Crea tu primer reporte personalizado usando el constructor.</p>
                    <Button onClick={() => setViewMode('builder')}>
                      <FaPlus className="h-4 w-4 mr-2" />
                      Crear Reporte
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                customReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{report.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        </div>
                        <Badge variant={report.isScheduled ? 'default' : 'secondary'} className="text-xs">
                          {report.isScheduled ? 'Programado' : 'Manual'}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tipo:</span>
                          <Badge variant="outline" className="text-xs capitalize">{report.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Formato:</span>
                          <Badge variant="outline" className="text-xs uppercase">{report.format}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Última ejecución:</span>
                          <span className="text-gray-900">
                            {report.lastRun ? report.lastRun.toLocaleDateString('es-ES') : 'Nunca'}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => runReport(report)}
                          disabled={isRunning}
                          className="flex-1"
                        >
                          <FaPlay className="h-3 w-3 mr-1" />
                          Ejecutar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReport(report.id)}
                        >
                          <FaTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Constructor de reportes */}
        {viewMode === 'builder' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Constructor de Reportes</h2>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setViewMode('reports')}>
                  Cancelar
                </Button>
                <Button onClick={saveReport}>
                  <FaSave className="h-4 w-4 mr-2" />
                  Guardar Reporte
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuración básica */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Nombre del Reporte</Label>
                    <Input
                      id="report-name"
                      value={builder.name}
                      onChange={(e) => handleBuilderChange('name', e.target.value)}
                      placeholder="Ej: Ingresos por Evento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="report-description">Descripción</Label>
                    <Textarea
                      id="report-description"
                      value={builder.description}
                      onChange={(e) => handleBuilderChange('description', e.target.value)}
                      placeholder="Describe qué analizará este reporte"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="report-type">Tipo de Reporte</Label>
                    <Select value={builder.type} onValueChange={(value: any) => handleBuilderChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="events">Eventos</SelectItem>
                        <SelectItem value="registrations">Inscripciones</SelectItem>
                        <SelectItem value="payments">Pagos</SelectItem>
                        <SelectItem value="speakers">Speakers</SelectItem>
                        <SelectItem value="certificates">Certificados</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="report-format">Formato de Exportación</Label>
                    <Select value={builder.format} onValueChange={(value: any) => handleBuilderChange('format', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas y agrupaciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas y Agrupaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Métricas a Incluir</Label>
                    <div className="mt-2 space-y-2">
                      {reportOptions[builder.type].metrics.map((metric) => (
                        <div key={metric} className="flex items-center space-x-2">
                          <Checkbox
                            id={`metric-${metric}`}
                            checked={builder.metrics.includes(metric)}
                            onCheckedChange={(checked) => handleMetricsChange(metric, checked as boolean)}
                          />
                          <Label htmlFor={`metric-${metric}`} className="text-sm capitalize">
                            {metric.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Agrupar Por</Label>
                    <div className="mt-2 space-y-2">
                      {reportOptions[builder.type].groupBy.map((group) => (
                        <div key={group} className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-${group}`}
                            checked={builder.groupBy.includes(group)}
                            onCheckedChange={(checked) => handleGroupByChange(group, checked as boolean)}
                          />
                          <Label htmlFor={`group-${group}`} className="text-sm capitalize">
                            {group.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vista previa */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {builder.name || 'Nombre del Reporte'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {builder.description || 'Descripción del reporte'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      Tipo: {builder.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Métricas: {builder.metrics.length}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Agrupaciones: {builder.groupBy.length}
                    </Badge>
                    <Badge variant="outline" className="text-xs uppercase">
                      Formato: {builder.format}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resultados del reporte */}
        {viewMode === 'results' && reportData && selectedReport && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedReport.name}</h2>
                <p className="text-sm text-gray-600">{selectedReport.description}</p>
              </div>
              <Button onClick={() => setViewMode('reports')}>
                <FaFileAlt className="h-4 w-4 mr-2" />
                Volver a Reportes
              </Button>
            </div>

            {/* Gráfico de resultados */}
            {reportChart && (
              <ChartWrapper
                title="Resultados del Reporte"
                type="line"
                data={reportChart}
                isLoading={false}
                height={400}
              />
            )}

            {/* Tabla de datos */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Reporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(reportData.data?.[0] || {}).map((key) => (
                          <TableHead key={key} className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.data?.map((row: any, index: number) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, cellIndex: number) => (
                            <TableCell key={cellIndex}>
                              {typeof value === 'number' ? value.toLocaleString() : String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCustomReportPage