import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaTable, FaEye } from 'react-icons/fa'
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

interface RegistrationsData {
  totalRegistrations: number
  confirmedRegistrations: number
  pendingRegistrations: number
  cancelledRegistrations: number
  conversionRate: number
  averageRegistrationTime: number
  topEvents: Array<{
    eventId: number
    eventTitle: string
    registrations: number
    capacity: number
    occupancyRate: number
  }>
  registrationsByPeriod: Array<{
    period: string
    total: number
    confirmed: number
    pending: number
    cancelled: number
  }>
  registrationsByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  registrationsByPaymentStatus: Array<{
    paymentStatus: string
    count: number
    percentage: number
  }>
}

const AdminRegistrationsReportPage: React.FC = () => {
  const [registrationsData, setRegistrationsData] = useState<RegistrationsData | null>(null)
  const [registrationsChart, setRegistrationsChart] = useState<LineChartData | null>(null)
  const [statusChart, setStatusChart] = useState<PieChartData | null>(null)
  const [paymentStatusChart, setPaymentStatusChart] = useState<PieChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de inscripciones
  const loadRegistrationsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener datos del reporte de inscripciones
      const registrationsReport = await adminReportService.getRegistrationsReport({
        startDate: filters.dateRange?.start,
        endDate: filters.dateRange?.end
      })

      // Transformar datos para el formato esperado
      const transformedData: RegistrationsData = {
        totalRegistrations: registrationsReport?.totalRegistrations || 0,
        confirmedRegistrations: registrationsReport?.confirmedRegistrations || 0,
        pendingRegistrations: registrationsReport?.pendingRegistrations || 0,
        cancelledRegistrations: registrationsReport?.cancelledRegistrations || 0,
        conversionRate: registrationsReport?.conversionRate || 0,
        averageRegistrationTime: registrationsReport?.averageRegistrationTime || 0,
        topEvents: registrationsReport?.topEvents || [],
        registrationsByPeriod: registrationsReport?.registrationsByPeriod || [],
        registrationsByStatus: registrationsReport?.registrationsByStatus || [],
        registrationsByPaymentStatus: registrationsReport?.registrationsByPaymentStatus || []
      }

      setRegistrationsData(transformedData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos de inscripciones:', err)
      setError('Error al cargar los datos de inscripciones')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      // Gráfico de inscripciones por período
      const registrationsDataChart: LineChartData = {
        labels: registrationsData?.registrationsByPeriod.map(item => item.period) || [],
        datasets: [
          {
            label: 'Total',
            data: registrationsData?.registrationsByPeriod.map(item => item.total) || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Confirmadas',
            data: registrationsData?.registrationsByPeriod.map(item => item.confirmed) || [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          },
          {
            label: 'Pendientes',
            data: registrationsData?.registrationsByPeriod.map(item => item.pending) || [],
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)'
          }
        ]
      }
      setRegistrationsChart(registrationsDataChart)

      // Gráfico de estado de inscripciones
      const statusData: PieChartData = {
        labels: registrationsData?.registrationsByStatus.map(item => item.status) || [],
        datasets: [{
          data: registrationsData?.registrationsByStatus.map(item => item.count) || [],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 1
        }]
      }
      setStatusChart(statusData)

      // Gráfico de estado de pagos
      const paymentStatusData: PieChartData = {
        labels: registrationsData?.registrationsByPaymentStatus.map(item => item.paymentStatus) || [],
        datasets: [{
          data: registrationsData?.registrationsByPaymentStatus.map(item => item.count) || [],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 1
        }]
      }
      setPaymentStatusChart(paymentStatusData)
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
      const blob = await adminReportService.exportReport('registrations', format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-inscripciones-${new Date().toISOString().split('T')[0]}.${format}`
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
    loadRegistrationsData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Inscripciones' },
  ]

  return (
    <AdminLayout title="Reporte de Inscripciones" breadcrumbs={breadcrumbs}>
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
                      <p className="text-sm font-medium text-gray-600">Total Inscripciones</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {registrationsData?.totalRegistrations.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaUsers className="h-8 w-8 text-blue-500" />
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
                      <p className="text-sm font-medium text-gray-600">Inscripciones Confirmadas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {registrationsData?.confirmedRegistrations.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      {((registrationsData?.confirmedRegistrations || 0) / (registrationsData?.totalRegistrations || 1) * 100).toFixed(1)}% del total
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Inscripciones Pendientes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {registrationsData?.pendingRegistrations.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaClock className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-xs">
                      Requieren atención
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
                        {registrationsData?.conversionRate.toFixed(1) || '0'}%
                      </p>
                    </div>
                    <FaChartBar className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +3.7% vs mes anterior
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
                title="Inscripciones por Período"
                type="line"
                data={registrationsChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <ChartWrapper
                title="Estado de Inscripciones"
                type="pie"
                data={statusChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />
            </div>

            {/* Estado de pagos y eventos top */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper
                title="Estado de Pagos"
                type="pie"
                data={paymentStatusChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Eventos Más Populares</CardTitle>
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
                      registrationsData?.topEvents.slice(0, 5).map((event, index) => (
                        <div key={event.eventId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{event.eventTitle}</p>
                              <p className="text-sm text-gray-600">{event.registrations} / {event.capacity} inscritos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={event.occupancyRate > 80 ? 'default' : 'secondary'} className="text-xs">
                              {event.occupancyRate.toFixed(1)}% ocupado
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
                <CardTitle>Datos de Inscripciones por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Confirmadas</TableHead>
                        <TableHead className="text-right">Pendientes</TableHead>
                        <TableHead className="text-right">Canceladas</TableHead>
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
                            <TableCell>
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        registrationsData?.registrationsByPeriod.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">{item.total.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.confirmed.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.pending.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.cancelled.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{((item.confirmed / item.total) * 100).toFixed(1)}%</TableCell>
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

export default AdminRegistrationsReportPage