import React, { useState, useEffect } from 'react'
import { FaUsers, FaCalendarAlt, FaMoneyBillWave, FaChartLine, FaClock, FaCheckCircle } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { KPICard } from '@/components/admin/KPICard'
import { ChartWrapper } from '@/components/admin/ChartWrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { adminDashboardService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  DashboardKPI,
  SystemStats,
  PerformanceMetric,
  LineChartData,
  BarChartData,
  ExtendedSystemStats,
} from '@/types/admin'

const AdminDashboardInicioPage: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPI[]>([])
  const [systemStats, setSystemStats] = useState<ExtendedSystemStats | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [revenueChart, setRevenueChart] = useState<LineChartData | null>(null)
  const [userGrowthChart, setUserGrowthChart] = useState<BarChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos del dashboard de inicio
  const loadDashboardInicioData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [kpisData, statsData, metricsData] = await Promise.all([
        adminDashboardService.getKPIs(),
        adminDashboardService.getSystemStats(),
        adminDashboardService.getPerformanceMetrics(),
      ])

      setKpis(kpisData)
      setSystemStats(statsData)
      setPerformanceMetrics(metricsData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos del dashboard de inicio:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      const [revenueData, userGrowthData] = await Promise.all([
        adminDashboardService.getLineChartData('revenue', { type: 'line', responsive: true }),
        adminDashboardService.getBarChartData('users', { type: 'bar', responsive: true }),
      ])

      setRevenueChart(revenueData)
      setUserGrowthChart(userGrowthData)
    } catch (err) {
      console.error('Error cargando gráficos:', err)
    }
  }

  // KPIs principales para la página de inicio
  const mainKPIs: DashboardKPI[] = [
    {
      id: 'total-users',
      title: 'Total Usuarios',
      value: systemStats?.totalUsers || 0,
      change: 12,
      changeType: 'increase',
      format: 'number',
      icon: '👥',
      trend: 'up',
    },
    {
      id: 'active-events',
      title: 'Eventos Activos',
      value: systemStats?.totalEvents || 0,
      change: 8,
      changeType: 'increase',
      format: 'number',
      icon: '📅',
      trend: 'up',
    },
    {
      id: 'total-revenue',
      title: 'Ingresos Totales',
      value: systemStats?.totalRevenue || 0,
      change: 15,
      changeType: 'increase',
      format: 'currency',
      icon: '💰',
      trend: 'up',
    },
    {
      id: 'conversion-rate',
      title: 'Tasa de Conversión',
      value: systemStats?.conversionRate || 0,
      change: 5,
      changeType: 'increase',
      format: 'percentage',
      icon: '📈',
      trend: 'up',
    },
  ]

  // Métricas de rendimiento para mostrar
  const keyMetrics = performanceMetrics.slice(0, 3)

  // Acciones rápidas
  const quickActions = [
    {
      title: 'Crear Evento',
      description: 'Publicar un nuevo evento',
      icon: FaCalendarAlt,
      action: () => console.log('Crear evento'),
      color: 'bg-blue-500',
    },
    {
      title: 'Ver Reportes',
      description: 'Consultar estadísticas detalladas',
      icon: FaChartLine,
      action: () => console.log('Ver reportes'),
      color: 'bg-green-500',
    },
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: FaUsers,
      action: () => console.log('Gestionar usuarios'),
      color: 'bg-purple-500',
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: FaMoneyBillWave,
      action: () => console.log('Configuración'),
      color: 'bg-orange-500',
    },
  ]

  useEffect(() => {
    loadDashboardInicioData()
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Inicio' },
  ]

  return (
    <AdminLayout title="Dashboard de Inicio" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Mensaje de bienvenida */}
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Bienvenido al Panel Administrativo!
                </h2>
                <p className="text-gray-600">
                  Aquí tienes un resumen general del estado de tu plataforma TradeConnect.
                  Monitorea métricas clave y accede rápidamente a las funciones principales.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
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

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <KPICard key={index} kpi={{} as DashboardKPI} isLoading />
              ))
            : mainKPIs.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))
          }
        </div>

        {/* Métricas de rendimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            : keyMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">{metric.name}</h3>
                      <Badge
                        variant={
                          metric.status === 'excellent' ? 'default' :
                          metric.status === 'good' ? 'secondary' :
                          metric.status === 'warning' ? 'destructive' : 'outline'
                        }
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {metric.value} {metric.unit}
                    </div>
                    {metric.target && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progreso</span>
                          <span>{metric.target} {metric.unit}</span>
                        </div>
                        <Progress
                          value={(metric.value / metric.target) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          }
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWrapper
            title="Tendencia de Ingresos"
            type="line"
            data={revenueChart || { labels: [], datasets: [] }}
            isLoading={isLoading}
          />

          <ChartWrapper
            title="Crecimiento de Usuarios"
            type="bar"
            data={userGrowthChart || { labels: [], datasets: [] }}
            isLoading={isLoading}
          />
        </div>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                  onClick={action.action}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", action.color)}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estado del sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Base de Datos</p>
                  <p className="text-sm text-gray-500">Conectado y operativo</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">API Services</p>
                  <p className="text-sm text-gray-500">Todos los servicios activos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Última Sincronización</p>
                  <p className="text-sm text-gray-500">Hace 2 minutos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboardInicioPage