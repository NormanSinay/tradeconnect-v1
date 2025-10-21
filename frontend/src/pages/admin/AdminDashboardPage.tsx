import React, { useState, useEffect } from 'react'
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { KPICard } from '@/components/admin/KPICard'
import { ChartWrapper } from '@/components/admin/ChartWrapper'
import { DashboardFilters } from '@/components/admin/DashboardFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminDashboardService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  DashboardKPI,
  DashboardSummary,
  DashboardFilters as DashboardFiltersType,
  LineChartData,
  BarChartData,
  PieChartData,
  DashboardAlert,
} from '@/types/admin'

const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [kpis, setKpis] = useState<DashboardKPI[]>([])
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [revenueChart, setRevenueChart] = useState<LineChartData | null>(null)
  const [eventsChart, setEventsChart] = useState<BarChartData | null>(null)
  const [usersChart, setUsersChart] = useState<PieChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [summaryData, kpisData, alertsData] = await Promise.all([
        adminDashboardService.getDashboardSummary(filters),
        adminDashboardService.getKPIs(filters),
        adminDashboardService.getAlerts(),
      ])

      setSummary(summaryData)
      setKpis(kpisData)
      setAlerts(alertsData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      const [revenueData, eventsData, usersData] = await Promise.all([
        adminDashboardService.getLineChartData('revenue', { type: 'line', responsive: true }),
        adminDashboardService.getBarChartData('events', { type: 'bar', responsive: true }),
        adminDashboardService.getPieChartData('users', { type: 'pie', responsive: true }),
      ])

      setRevenueChart(revenueData)
      setEventsChart(eventsData)
      setUsersChart(usersData)
    } catch (err) {
      console.error('Error cargando gráficos:', err)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters)
  }

  // Exportar datos
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await adminDashboardService.exportDashboardData(format, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando datos:', err)
      setError('Error al exportar los datos')
    }
  }

  // Obtener icono de alerta
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />
    }
  }

  // Obtener color de prioridad de alerta
  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'high':
        return 'border-orange-200 bg-orange-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard' },
  ]

  return (
    <AdminLayout title="Dashboard Administrativo" breadcrumbs={breadcrumbs}>
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
                <FaTimesCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
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

        {/* Alertas del sistema */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FaExclamationTriangle className="h-5 w-5" />
                <span>Alertas del Sistema</span>
                <Badge variant="secondary">{alerts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border",
                      getAlertPriorityColor(alert.priority)
                    )}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {alerts.length > 5 && (
                  <Button variant="outline" className="w-full">
                    Ver todas las alertas ({alerts.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de ingresos */}
          <ChartWrapper
            title="Ingresos por Mes"
            type="line"
            data={revenueChart || { labels: [], datasets: [] }}
            isLoading={isLoading}
          />

          {/* Gráfico de eventos */}
          <ChartWrapper
            title="Eventos por Categoría"
            type="bar"
            data={eventsChart || { labels: [], datasets: [] }}
            isLoading={isLoading}
          />

          {/* Gráfico de usuarios */}
          <ChartWrapper
            title="Distribución de Usuarios"
            type="pie"
            data={usersChart || { labels: [], datasets: [] }}
            isLoading={isLoading}
          />

          {/* Actividad reciente */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  [
                    { type: 'user', message: 'Nuevo usuario registrado', time: 'Hace 5 minutos' },
                    { type: 'event', message: 'Evento creado exitosamente', time: 'Hace 12 minutos' },
                    { type: 'payment', message: 'Pago procesado', time: 'Hace 1 hora' },
                    { type: 'report', message: 'Reporte generado', time: 'Hace 2 horas' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        activity.type === 'user' ? "bg-green-500" :
                        activity.type === 'event' ? "bg-blue-500" :
                        activity.type === 'payment' ? "bg-yellow-500" : "bg-red-500"
                      )}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboardPage