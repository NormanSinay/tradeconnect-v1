import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaMoneyBillWave, FaShoppingCart, FaCreditCard, FaCalendarAlt, FaTable, FaEye } from 'react-icons/fa'
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

interface SalesData {
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  conversionRate: number
  topProducts: Array<{
    name: string
    revenue: number
    quantity: number
  }>
  salesByPeriod: Array<{
    period: string
    revenue: number
    transactions: number
    averageOrder: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    percentage: number
  }>
}

const AdminSalesReportPage: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [revenueChart, setRevenueChart] = useState<LineChartData | null>(null)
  const [transactionsChart, setTransactionsChart] = useState<BarChartData | null>(null)
  const [paymentMethodsChart, setPaymentMethodsChart] = useState<PieChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de ventas
  const loadSalesData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener datos del reporte financiero
      const financialData = await adminReportService.getFinancialReport({
        startDate: filters.dateRange?.start,
        endDate: filters.dateRange?.end,
        includeRefunds: false
      })

      // Transformar datos para el formato esperado
      const transformedData: SalesData = {
        totalRevenue: financialData?.totalRevenue || 0,
        totalTransactions: financialData?.totalTransactions || 0,
        averageOrderValue: financialData?.averageOrderValue || 0,
        conversionRate: financialData?.conversionRate || 0,
        topProducts: financialData?.topProducts || [],
        salesByPeriod: financialData?.salesByPeriod || [],
        paymentMethods: financialData?.paymentMethods || []
      }

      setSalesData(transformedData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos de ventas:', err)
      setError('Error al cargar los datos de ventas')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      // Gráfico de ingresos por período
      const revenueData: LineChartData = {
        labels: salesData?.salesByPeriod.map(item => item.period) || [],
        datasets: [{
          label: 'Ingresos',
          data: salesData?.salesByPeriod.map(item => item.revenue) || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
      }
      setRevenueChart(revenueData)

      // Gráfico de transacciones
      const transactionsData: BarChartData = {
        labels: salesData?.salesByPeriod.map(item => item.period) || [],
        datasets: [{
          label: 'Transacciones',
          data: salesData?.salesByPeriod.map(item => item.transactions) || [],
          backgroundColor: ['rgba(34, 197, 94, 0.8)'],
          borderColor: ['rgb(34, 197, 94)'],
          borderWidth: 1
        }]
      }
      setTransactionsChart(transactionsData)

      // Gráfico de métodos de pago
      const paymentData: PieChartData = {
        labels: salesData?.paymentMethods.map(item => item.method) || [],
        datasets: [{
          data: salesData?.paymentMethods.map(item => item.amount) || [],
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
      setPaymentMethodsChart(paymentData)
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
      const blob = await adminReportService.exportReport('sales', format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.${format}`
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
    loadSalesData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Ventas' },
  ]

  return (
    <AdminLayout title="Reporte de Ventas" breadcrumbs={breadcrumbs}>
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
                      <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Q{salesData?.totalRevenue.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaMoneyBillWave className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +12.5% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Transacciones</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {salesData?.totalTransactions.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaShoppingCart className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +8.2% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor Promedio Orden</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Q{salesData?.averageOrderValue.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCreditCard className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="destructive" className="text-xs">
                      -2.1% vs mes anterior
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
                        {salesData?.conversionRate.toFixed(1) || '0'}%
                      </p>
                    </div>
                    <FaChartBar className="h-8 w-8 text-orange-500" />
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
                title="Ingresos por Período"
                type="line"
                data={revenueChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <ChartWrapper
                title="Transacciones por Período"
                type="bar"
                data={transactionsChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />
            </div>

            {/* Método de pago y productos top */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper
                title="Distribución por Método de Pago"
                type="pie"
                data={paymentMethodsChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Productos Más Vendidos</CardTitle>
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
                      salesData?.topProducts.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.quantity} unidades</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">Q{product.revenue.toLocaleString()}</p>
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
                <CardTitle>Datos de Ventas por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
                        <TableHead className="text-right">Transacciones</TableHead>
                        <TableHead className="text-right">Valor Promedio</TableHead>
                        <TableHead className="text-right">Tasa Conversión</TableHead>
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
                          </TableRow>
                        ))
                      ) : (
                        salesData?.salesByPeriod.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">Q{item.revenue.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.transactions.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Q{item.averageOrder.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{((item.transactions / item.revenue) * 100).toFixed(1)}%</TableCell>
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

export default AdminSalesReportPage