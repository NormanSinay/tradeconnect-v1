import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaChartLine, FaTable, FaEye, FaCalculator } from 'react-icons/fa'
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

interface FinancialData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalRefunds: number
  refundRate: number
  averageTransactionValue: number
  revenueByEvent: Array<{
    eventId: number
    eventTitle: string
    revenue: number
    expenses: number
    profit: number
    margin: number
  }>
  revenueByPeriod: Array<{
    period: string
    revenue: number
    expenses: number
    profit: number
    refunds: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    percentage: number
    transactionCount: number
  }>
  cashFlow: Array<{
    period: string
    inflow: number
    outflow: number
    netCashFlow: number
  }>
  topRevenueEvents: Array<{
    eventId: number
    title: string
    revenue: number
    growth: number
  }>
}

const AdminFinancialReportPage: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [revenueChart, setRevenueChart] = useState<LineChartData | null>(null)
  const [paymentMethodsChart, setPaymentMethodsChart] = useState<PieChartData | null>(null)
  const [cashFlowChart, setCashFlowChart] = useState<BarChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos financieros
  const loadFinancialData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener datos del reporte financiero
      const financialReport = await adminReportService.getFinancialReport({
        startDate: filters.dateRange?.start,
        endDate: filters.dateRange?.end,
        includeRefunds: true
      })

      // Transformar datos para el formato esperado
      const transformedData: FinancialData = {
        totalRevenue: financialReport?.totalRevenue || 0,
        totalExpenses: financialReport?.totalExpenses || 0,
        netProfit: financialReport?.netProfit || 0,
        profitMargin: financialReport?.profitMargin || 0,
        totalRefunds: financialReport?.totalRefunds || 0,
        refundRate: financialReport?.refundRate || 0,
        averageTransactionValue: financialReport?.averageTransactionValue || 0,
        revenueByEvent: financialReport?.revenueByEvent || [],
        revenueByPeriod: financialReport?.revenueByPeriod || [],
        paymentMethods: financialReport?.paymentMethods || [],
        cashFlow: financialReport?.cashFlow || [],
        topRevenueEvents: financialReport?.topRevenueEvents || []
      }

      setFinancialData(transformedData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos financieros:', err)
      setError('Error al cargar los datos financieros')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      // Gráfico de ingresos vs gastos por período
      const revenueData: LineChartData = {
        labels: financialData?.revenueByPeriod.map(item => item.period) || [],
        datasets: [
          {
            label: 'Ingresos',
            data: financialData?.revenueByPeriod.map(item => item.revenue) || [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          },
          {
            label: 'Gastos',
            data: financialData?.revenueByPeriod.map(item => item.expenses) || [],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          },
          {
            label: 'Ganancia Neta',
            data: financialData?.revenueByPeriod.map(item => item.profit) || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }
        ]
      }
      setRevenueChart(revenueData)

      // Gráfico de métodos de pago
      const paymentData: PieChartData = {
        labels: financialData?.paymentMethods.map(item => item.method) || [],
        datasets: [{
          data: financialData?.paymentMethods.map(item => item.amount) || [],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(147, 51, 234, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(147, 51, 234)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 1
        }]
      }
      setPaymentMethodsChart(paymentData)

      // Gráfico de flujo de caja
      const cashFlowData: BarChartData = {
        labels: financialData?.cashFlow.map(item => item.period) || [],
        datasets: [{
          label: 'Flujo de Caja Neto',
          data: financialData?.cashFlow.map(item => item.netCashFlow) || [],
          backgroundColor: ['rgba(59, 130, 246, 0.8)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1
        }]
      }
      setCashFlowChart(cashFlowData)
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
      const blob = await adminReportService.exportReport('financial', format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.${format}`
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
    loadFinancialData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Financiero' },
  ]

  return (
    <AdminLayout title="Reporte Financiero Completo" breadcrumbs={breadcrumbs}>
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
                        Q{financialData?.totalRevenue.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaMoneyBillWave className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +22.4% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ganancia Neta</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Q{financialData?.netProfit.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCalculator className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      {financialData?.profitMargin.toFixed(1) || '0'}% margen
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor Promedio Transacción</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Q{financialData?.averageTransactionValue.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCreditCard className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="destructive" className="text-xs">
                      -1.8% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tasa de Reembolsos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {financialData?.refundRate.toFixed(1) || '0'}%
                      </p>
                    </div>
                    <FaExchangeAlt className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-xs">
                      Q{financialData?.totalRefunds.toLocaleString() || '0'} total
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
                title="Ingresos vs Gastos por Período"
                type="line"
                data={revenueChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <ChartWrapper
                title="Distribución por Método de Pago"
                type="pie"
                data={paymentMethodsChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />
            </div>

            {/* Flujo de caja y eventos top */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper
                title="Flujo de Caja"
                type="bar"
                data={cashFlowChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Eventos por Ingresos</CardTitle>
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
                      financialData?.topRevenueEvents.slice(0, 5).map((event, index) => (
                        <div key={event.eventId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{event.title}</p>
                              <p className="text-sm text-gray-600">Q{event.revenue.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={event.growth > 0 ? 'default' : 'destructive'} className="text-xs">
                              {event.growth > 0 ? '+' : ''}{event.growth.toFixed(1)}%
                            </Badge>
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
                <CardTitle>Datos Financieros por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
                        <TableHead className="text-right">Gastos</TableHead>
                        <TableHead className="text-right">Ganancia Neta</TableHead>
                        <TableHead className="text-right">Reembolsos</TableHead>
                        <TableHead className="text-right">Margen</TableHead>
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
                        financialData?.revenueByPeriod.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">Q{item.revenue.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Q{item.expenses.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Q{item.profit.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Q{item.refunds.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{((item.profit / item.revenue) * 100).toFixed(1)}%</TableCell>
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

export default AdminFinancialReportPage