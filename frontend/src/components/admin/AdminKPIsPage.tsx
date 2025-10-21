import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaCalendarAlt, FaChartBar, FaTable, FaEye } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { KPICard } from '@/components/admin/KPICard'
import { ChartWrapper } from '@/components/admin/ChartWrapper'
import { DashboardFilters } from '@/components/admin/DashboardFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminDashboardService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  DashboardKPI,
  DashboardFilters as DashboardFiltersType,
  LineChartData,
  BarChartData,
  PieChartData,
  AnalyticsResult,
  MetricType,
} from '@/types/admin'

const AdminKPIsPage: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPI[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResult | null>(null)
  const [revenueChart, setRevenueChart] = useState<LineChartData | null>(null)
  const [usersChart, setUsersChart] = useState<BarChartData | null>(null)
  const [eventsChart, setEventsChart] = useState<PieChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue')
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de KPIs avanzados
  const loadKPIsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [kpisData, analyticsData] = await Promise.all([
        adminDashboardService.getKPIs(filters),
        adminDashboardService.executeAnalyticsQuery({
          period: 'last30days',
          metrics: ['revenue', 'users', 'events', 'registrations'],
          filters,
        }),
      ])

      setKpis(kpisData)
      setAnalyticsData(analyticsData)

      // Cargar gráficos según la métrica seleccionada
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos de KPIs:', err)
      setError('Error al cargar los datos de KPIs')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      const [revenueData, usersData, eventsData] = await Promise.all([
        adminDashboardService.getLineChartData('revenue', { type: 'line', responsive: true }),
        adminDashboardService.getBarChartData('users', { type: 'bar', responsive: true }),
        adminDashboardService.getPieChartData('events', { type: 'pie', responsive: true }),
      ])

      setRevenueChart(revenueData)
      setUsersChart(usersData)
      setEventsChart(eventsData)
    } catch (err) {
      console.error('Error cargando gráficos:', err)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters)
  }

  // Manejar cambio de métrica
  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric)
    // Recargar gráficos para la nueva métrica
    loadCharts()
  }

  // Exportar datos
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await adminDashboardService.exportDashboardData(format, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kpis-${selectedMetric}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando datos:', err)
      setError('Error al exportar los datos')
    }
  }

  // Obtener gráfico actual según la métrica seleccionada
  const getCurrentChart = () => {
    switch (selectedMetric) {
      case 'revenue':
        return revenueChart
      case 'users':
        return usersChart
      case 'events':
        return eventsChart
      default:
        return revenueChart
    }
  }

  // Datos de tabla para vista tabular
  const getTableData = () => {
    if (!analyticsData?.data) return []

    return analyticsData.data.map((item: any, index: number) => ({
      id: index + 1,
      period: item.period || item.date || `Período ${index + 1}`,
      revenue: item.revenue || 0,
      users: item.users || 0,
      events: item.events || 0,
      registrations: item.registrations || 0,
      conversion: item.conversion || 0,
    }))
  }

  useEffect(() => {
    loadKPIsData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'KPIs Avanzados' },
  ]

  return (
    <AdminLayout title="Dashboard de KPIs Avanzados" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Filtros */}
        <DashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
          isLoading={isLoading}
        />

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

        {/* Selector de métricas y vista */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaChartBar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Métrica:</span>
                  <Select value={selectedMetric} onValueChange={handleMetricChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Ingresos</SelectItem>
                      <SelectItem value="users">Usuarios</SelectItem>
                      <SelectItem value="events">Eventos</SelectItem>
                      <SelectItem value="registrations">Registros</SelectItem>
                      <SelectItem value="conversion">Conversión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'charts' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('charts')}
                >
                  <FaChartBar className="h-4 w-4 mr-2" />
                  Gráficos
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <FaTable className="h-4 w-4 mr-2" />
                  Tabla
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <KPICard key={index} kpi={{} as DashboardKPI} isLoading />
              ))
            : kpis.slice(0, 4).map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))
          }
        </div>

        {/* Vista de gráficos o tabla */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'charts' | 'table')}>
          <TabsContent value="charts" className="space-y-6">
            {/* Gráfico principal */}
            <ChartWrapper
              title={`Tendencia de ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`}
              type={selectedMetric === 'events' ? 'pie' : selectedMetric === 'users' ? 'bar' : 'line'}
              data={getCurrentChart() || { labels: [], datasets: [] }}
              isLoading={isLoading}
              height={400}
            />

            {/* Gráficos comparativos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartWrapper
                title="Ingresos por Mes"
                type="line"
                data={revenueChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <ChartWrapper
                title="Usuarios Activos"
                type="bar"
                data={usersChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <ChartWrapper
                title="Distribución de Eventos"
                type="pie"
                data={eventsChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />
            </div>

            {/* Métricas comparativas */}
            {analyticsData?.comparisons && (
              <Card>
                <CardHeader>
                  <CardTitle>Comparaciones Periódicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(analyticsData.comparisons).map(([key, comparison]) => (
                      <div key={key} className="text-center">
                        <h4 className="font-medium text-gray-900 mb-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-gray-900">
                            {comparison.current.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <Badge
                              variant={comparison.changePercent >= 0 ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {comparison.changePercent >= 0 ? '+' : ''}{comparison.changePercent.toFixed(1)}%
                            </Badge>
                            <span className="text-xs text-gray-500">vs anterior</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Datos Tabulares de KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
                        <TableHead className="text-right">Usuarios</TableHead>
                        <TableHead className="text-right">Eventos</TableHead>
                        <TableHead className="text-right">Registros</TableHead>
                        <TableHead className="text-right">Conversión</TableHead>
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
                          </TableRow>
                        ))
                      ) : (
                        getTableData().map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.period}</TableCell>
                            <TableCell className="text-right">Q{row.revenue.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.users.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.events.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.registrations.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.conversion.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

export default AdminKPIsPage