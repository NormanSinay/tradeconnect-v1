import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaTag, FaPercent, FaMoneyBillWave, FaUsers, FaTable, FaEye, FaBullhorn } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ChartWrapper } from '@/components/admin/ChartWrapper'
import { DashboardFilters } from '@/components/admin/DashboardFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminReportService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type { DashboardFilters as DashboardFiltersType, LineChartData, BarChartData, PieChartData } from '@/types/admin'

interface PromotionsData {
  totalPromotions: number
  activePromotions: number
  totalDiscount: number
  totalCodesUsed: number
  conversionRate: number
  averageDiscount: number
  promotionsByType: Array<{
    type: string
    count: number
    discount: number
    usage: number
  }>
  promotionsByPeriod: Array<{
    period: string
    total: number
    used: number
    discount: number
    revenue: number
  }>
  topPromotions: Array<{
    promotionId: number
    name: string
    type: string
    usageCount: number
    totalDiscount: number
    conversionRate: number
  }>
  promotionPerformance: Array<{
    promotionId: number
    name: string
    effectiveness: number
    roi: number
    trend: 'up' | 'down' | 'stable'
  }>
  discountDistribution: Array<{
    range: string
    count: number
    percentage: number
  }>
}

const AdminPromotionsReportPage: React.FC = () => {
  const [promotionsData, setPromotionsData] = useState<PromotionsData | null>(null)
  const [promotionsChart, setPromotionsChart] = useState<LineChartData | null>(null)
  const [typeChart, setTypeChart] = useState<PieChartData | null>(null)
  const [performanceChart, setPerformanceChart] = useState<BarChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de promociones
  const loadPromotionsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener datos del reporte de promociones (usando el servicio de eventos por ahora)
      const promotionsReport = await adminReportService.getEventsReport({
        startDate: filters.dateRange?.start,
        endDate: filters.dateRange?.end
      })

      // Transformar datos para el formato esperado
      const transformedData: PromotionsData = {
        totalPromotions: promotionsReport?.totalPromotions || 0,
        activePromotions: promotionsReport?.activePromotions || 0,
        totalDiscount: promotionsReport?.totalDiscount || 0,
        totalCodesUsed: promotionsReport?.totalCodesUsed || 0,
        conversionRate: promotionsReport?.conversionRate || 0,
        averageDiscount: promotionsReport?.averageDiscount || 0,
        promotionsByType: promotionsReport?.promotionsByType || [],
        promotionsByPeriod: promotionsReport?.promotionsByPeriod || [],
        topPromotions: promotionsReport?.topPromotions || [],
        promotionPerformance: promotionsReport?.promotionPerformance || [],
        discountDistribution: promotionsReport?.discountDistribution || []
      }

      setPromotionsData(transformedData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos de promociones:', err)
      setError('Error al cargar los datos de promociones')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      // Gráfico de promociones por período
      const promotionsDataChart: LineChartData = {
        labels: promotionsData?.promotionsByPeriod.map(item => item.period) || [],
        datasets: [
          {
            label: 'Códigos Usados',
            data: promotionsData?.promotionsByPeriod.map(item => item.used) || [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          },
          {
            label: 'Descuento Total',
            data: promotionsData?.promotionsByPeriod.map(item => item.discount) || [],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }
        ]
      }
      setPromotionsChart(promotionsDataChart)

      // Gráfico de tipos de promoción
      const typeData: PieChartData = {
        labels: promotionsData?.promotionsByType.map(item => item.type) || [],
        datasets: [{
          data: promotionsData?.promotionsByType.map(item => item.count) || [],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(147, 51, 234, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(147, 51, 234)'
          ],
          borderWidth: 1
        }]
      }
      setTypeChart(typeData)

      // Gráfico de rendimiento
      const performanceData: BarChartData = {
        labels: promotionsData?.promotionPerformance.map(item => item.name) || [],
        datasets: [{
          label: 'ROI (%)',
          data: promotionsData?.promotionPerformance.map(item => item.roi) || [],
          backgroundColor: ['rgba(59, 130, 246, 0.8)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1
        }]
      }
      setPerformanceChart(performanceData)
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
      const blob = await adminReportService.exportReport('promotions', format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-promociones-${new Date().toISOString().split('T')[0]}.${format}`
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
    loadPromotionsData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Promociones' },
  ]

  return (
    <AdminLayout title="Reporte de Promociones" breadcrumbs={breadcrumbs}>
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

        {/* KPIs principales */}
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
                      <p className="text-sm font-medium text-gray-600">Total Promociones</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {promotionsData?.totalPromotions.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaBullhorn className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      {promotionsData?.activePromotions || 0} activas
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Códigos Usados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {promotionsData?.totalCodesUsed.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaTag className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +15.2% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Descuento Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Q{promotionsData?.totalDiscount.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaMoneyBillWave className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="destructive" className="text-xs">
                      Q{promotionsData?.averageDiscount.toLocaleString() || '0'} promedio
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {promotionsData?.conversionRate.toFixed(1) || '0'}%
                      </p>
                    </div>
                    <FaPercent className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +5.7% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Selector de vista */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-end space-x-2">
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
          </CardContent>
        </Card>

        {/* Vista de gráficos o tabla */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'charts' | 'table')}>
          <TabsContent value="charts" className="space-y-6">
            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper
                title="Uso de Promociones por Período"
                type="line"
                data={promotionsChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <ChartWrapper
                title="Distribución por Tipo"
                type="pie"
                data={typeChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />
            </div>

            {/* Rendimiento y top promociones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper
                title="ROI de Promociones"
                type="bar"
                data={performanceChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Top Promociones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      ))
                    ) : (
                      promotionsData?.topPromotions.slice(0, 5).map((promotion, index) => (
                        <div key={promotion.promotionId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{promotion.name}</p>
                              <p className="text-sm text-gray-600">{promotion.usageCount} usos • {promotion.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {promotion.conversionRate.toFixed(1)}% conversión
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">
                                Q{promotion.totalDiscount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Datos de Promociones por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Total Promociones</TableHead>
                        <TableHead className="text-right">Códigos Usados</TableHead>
                        <TableHead className="text-right">Descuento Total</TableHead>
                        <TableHead className="text-right">Ingresos Generados</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
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
                        promotionsData?.promotionsByPeriod.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">{item.total.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.used.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Q{item.discount.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Q{item.revenue.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{((item.revenue / item.discount) * 100).toFixed(1)}%</TableCell>
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

export default AdminPromotionsReportPage