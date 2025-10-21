import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaBolt, FaClock, FaUsers, FaEye, FaSync, FaPlay, FaPause } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ChartWrapper } from '@/components/admin/ChartWrapper'
import { DashboardFilters } from '@/components/admin/DashboardFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminReportService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type { DashboardFilters as DashboardFiltersType, LineChartData, BarChartData, PieChartData } from '@/types/admin'

interface RealTimeMetrics {
  activeUsers: number
  currentSessions: number
  liveEvents: number
  pendingRegistrations: number
  recentTransactions: number
  systemLoad: number
  lastUpdated: Date
}

interface AnalyticsStream {
  id: string
  name: string
  type: 'users' | 'events' | 'transactions' | 'system'
  data: Array<{
    timestamp: Date
    value: number
    metadata?: Record<string, any>
  }>
  isActive: boolean
  updateInterval: number // en segundos
}

const AdminAnalyticsPage: React.FC = () => {
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null)
  const [analyticsStreams, setAnalyticsStreams] = useState<AnalyticsStream[]>([])
  const [selectedStream, setSelectedStream] = useState<AnalyticsStream | null>(null)
  const [streamChart, setStreamChart] = useState<LineChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar métricas en tiempo real
  const loadRealTimeMetrics = async () => {
    try {
      // Simular carga de métricas en tiempo real
      const mockMetrics: RealTimeMetrics = {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        currentSessions: Math.floor(Math.random() * 200) + 100,
        liveEvents: Math.floor(Math.random() * 10) + 2,
        pendingRegistrations: Math.floor(Math.random() * 50) + 10,
        recentTransactions: Math.floor(Math.random() * 20) + 5,
        systemLoad: Math.random() * 100,
        lastUpdated: new Date()
      }

      setRealTimeMetrics(mockMetrics)
    } catch (err) {
      console.error('Error cargando métricas en tiempo real:', err)
      setError('Error al cargar las métricas en tiempo real')
    }
  }

  // Cargar streams de analytics
  const loadAnalyticsStreams = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simular streams de analytics
      const mockStreams: AnalyticsStream[] = [
        {
          id: '1',
          name: 'Usuarios Activos',
          type: 'users',
          data: generateMockData(50, 100, 200),
          isActive: true,
          updateInterval: 30
        },
        {
          id: '2',
          name: 'Transacciones en Tiempo Real',
          type: 'transactions',
          data: generateMockData(20, 0, 50),
          isActive: true,
          updateInterval: 15
        },
        {
          id: '3',
          name: 'Eventos Activos',
          type: 'events',
          data: generateMockData(10, 0, 20),
          isActive: true,
          updateInterval: 60
        },
        {
          id: '4',
          name: 'Carga del Sistema',
          type: 'system',
          data: generateMockData(80, 0, 100),
          isActive: true,
          updateInterval: 10
        }
      ]

      setAnalyticsStreams(mockStreams)

      // Seleccionar primer stream por defecto
      if (mockStreams.length > 0) {
        const firstStream = mockStreams[0]
        if (firstStream) {
          setSelectedStream(firstStream)
          updateStreamChart(firstStream)
        }
      }
    } catch (err) {
      console.error('Error cargando streams de analytics:', err)
      setError('Error al cargar los streams de analytics')
    } finally {
      setIsLoading(false)
    }
  }

  // Generar datos mock para streams
  const generateMockData = (count: number, min: number, max: number): Array<{ timestamp: Date; value: number }> => {
    const data = []
    const now = new Date()

    for (let i = count - 1; i >= 0; i--) {
      data.push({
        timestamp: new Date(now.getTime() - i * 60000), // cada minuto
        value: Math.floor(Math.random() * (max - min + 1)) + min
      })
    }

    return data
  }

  // Actualizar gráfico del stream seleccionado
  const updateStreamChart = (stream: AnalyticsStream) => {
    const chartData: LineChartData = {
      labels: stream.data.map(item => item.timestamp.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })),
      datasets: [{
        label: stream.name,
        data: stream.data.map(item => item.value),
        borderColor: getStreamColor(stream.type),
        backgroundColor: getStreamColor(stream.type, 0.1)
      }]
    }
    setStreamChart(chartData)
  }

  // Obtener color según tipo de stream
  const getStreamColor = (type: AnalyticsStream['type'], alpha: number = 1): string => {
    const colors = {
      users: `rgba(59, 130, 246, ${alpha})`,
      events: `rgba(34, 197, 94, ${alpha})`,
      transactions: `rgba(245, 158, 11, ${alpha})`,
      system: `rgba(239, 68, 68, ${alpha})`
    }
    return colors[type]
  }

  // Manejar cambio de stream
  const handleStreamChange = (streamId: string) => {
    const stream = analyticsStreams.find(s => s.id === streamId)
    if (stream) {
      setSelectedStream(stream)
      updateStreamChart(stream)
    }
  }

  // Toggle modo live
  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode)

    if (!isLiveMode) {
      // Iniciar actualización en tiempo real
      startLiveUpdates()
    } else {
      // Detener actualización
      stopLiveUpdates()
    }
  }

  // Iniciar actualizaciones en vivo
  const startLiveUpdates = () => {
    if (updateInterval) return

    const interval = setInterval(() => {
      loadRealTimeMetrics()

      // Actualizar streams activos
      setAnalyticsStreams(prevStreams =>
        prevStreams.map(stream => {
          if (stream.isActive) {
            const newData = [...stream.data]
            // Remover dato más antiguo si hay más de 50
            if (newData.length > 50) {
              newData.shift()
            }
            // Agregar nuevo dato
            newData.push({
              timestamp: new Date(),
              value: Math.floor(Math.random() * 100) + (stream.type === 'users' ? 50 : 0)
            })

            return { ...stream, data: newData }
          }
          return stream
        })
      )

      // Actualizar gráfico si hay stream seleccionado
      if (selectedStream) {
        const updatedStream = analyticsStreams.find(s => s.id === selectedStream.id)
        if (updatedStream) {
          updateStreamChart(updatedStream)
        }
      }
    }, 5000) // Actualizar cada 5 segundos

    setUpdateInterval(interval)
  }

  // Detener actualizaciones en vivo
  const stopLiveUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      setUpdateInterval(null)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters)
  }

  // Exportar datos
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await adminReportService.exportReport('analytics', format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-tiempo-real-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando datos:', err)
      setError('Error al exportar los datos')
    }
  }

  useEffect(() => {
    loadAnalyticsStreams()
    loadRealTimeMetrics()

    // Iniciar actualizaciones en vivo por defecto
    startLiveUpdates()

    // Cleanup
    return () => {
      stopLiveUpdates()
    }
  }, [])

  useEffect(() => {
    if (selectedStream) {
      updateStreamChart(selectedStream)
    }
  }, [selectedStream])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Analytics en Tiempo Real' },
  ]

  return (
    <AdminLayout title="Analytics en Tiempo Real" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Controles de modo live */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaBolt className={cn("h-4 w-4", isLiveMode ? "text-green-500" : "text-gray-400")} />
                  <span className="text-sm font-medium">Modo Live:</span>
                  <Badge variant={isLiveMode ? "default" : "secondary"}>
                    {isLiveMode ? "ACTIVO" : "PAUSADO"}
                  </Badge>
                </div>
                {realTimeMetrics && (
                  <div className="text-sm text-gray-600">
                    Última actualización: {realTimeMetrics.lastUpdated.toLocaleTimeString('es-ES')}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={isLiveMode ? "outline" : "default"}
                  size="sm"
                  onClick={toggleLiveMode}
                >
                  {isLiveMode ? (
                    <>
                      <FaPause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <FaPlay className="h-4 w-4 mr-2" />
                      Reanudar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadRealTimeMetrics()
                    loadAnalyticsStreams()
                  }}
                >
                  <FaSync className="h-4 w-4 mr-2" />
                  Actualizar
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

        {/* KPIs en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {realTimeMetrics?.activeUsers.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaUsers className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      <FaBolt className="h-3 w-3 mr-1" />
                      En vivo
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {realTimeMetrics?.currentSessions.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaEye className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      <FaBolt className="h-3 w-3 mr-1" />
                      En vivo
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Eventos en Vivo</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {realTimeMetrics?.liveEvents.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaClock className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      <FaBolt className="h-3 w-3 mr-1" />
                      En vivo
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Carga del Sistema</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {realTimeMetrics?.systemLoad.toFixed(1) || '0'}%
                      </p>
                    </div>
                    <FaChartBar className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-4">
                    <Badge
                      variant={realTimeMetrics && realTimeMetrics.systemLoad > 80 ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {realTimeMetrics && realTimeMetrics.systemLoad > 80 ? "Alta" : "Normal"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Selector de stream y gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lista de streams */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Streams Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsStreams.map((stream) => (
                  <div
                    key={stream.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      selectedStream?.id === stream.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => handleStreamChange(stream.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{stream.name}</p>
                        <p className="text-xs text-gray-600 capitalize">{stream.type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={stream.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {stream.isActive ? "Live" : "Pausado"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Actualización: cada {stream.updateInterval}s
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico del stream seleccionado */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                {selectedStream ? selectedStream.name : 'Seleccionar Stream'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStream && streamChart ? (
                <ChartWrapper
                  title={`Datos en Tiempo Real - ${selectedStream.name}`}
                  type="line"
                  data={streamChart}
                  isLoading={false}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <FaChartBar className="h-12 w-12 mx-auto mb-4" />
                    <p>Selecciona un stream para ver los datos en tiempo real</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transacciones recientes</span>
                  <Badge variant="default" className="text-xs">
                    {realTimeMetrics?.recentTransactions || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inscripciones pendientes</span>
                  <Badge variant="secondary" className="text-xs">
                    {realTimeMetrics?.pendingRegistrations || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eventos activos</span>
                  <Badge variant="default" className="text-xs">
                    {realTimeMetrics?.liveEvents || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(realTimeMetrics?.systemLoad || 0, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {realTimeMetrics?.systemLoad.toFixed(1) || '0'}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memoria</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {Math.floor(Math.random() * 40) + 60}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conexiones</span>
                  <Badge variant="default" className="text-xs">
                    {realTimeMetrics?.currentSessions || 0} activas
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminAnalyticsPage