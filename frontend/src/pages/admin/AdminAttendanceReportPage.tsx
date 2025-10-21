import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaCalendarAlt, FaQrcode, FaCheckCircle, FaClock, FaTimesCircle, FaTable, FaEye, FaUserCheck } from 'react-icons/fa'
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

interface AttendanceData {
  totalAttendees: number
  checkedInAttendees: number
  pendingCheckIn: number
  noShowAttendees: number
  attendanceRate: number
  averageCheckInTime: string
  topEventsByAttendance: Array<{
    eventId: number
    eventTitle: string
    totalAttendees: number
    checkedIn: number
    attendanceRate: number
  }>
  attendanceByPeriod: Array<{
    period: string
    total: number
    checkedIn: number
    pending: number
    noShow: number
  }>
  checkInMethods: Array<{
    method: string
    count: number
    percentage: number
  }>
  attendanceByTimeSlot: Array<{
    timeSlot: string
    attendees: number
    rate: number
  }>
}

const AdminAttendanceReportPage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [attendanceChart, setAttendanceChart] = useState<LineChartData | null>(null)
  const [checkInMethodsChart, setCheckInMethodsChart] = useState<PieChartData | null>(null)
  const [timeSlotChart, setTimeSlotChart] = useState<BarChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de asistencias
  const loadAttendanceData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener datos del reporte de asistencias (usando el servicio de eventos por ahora)
      const eventsReport = await adminReportService.getEventsReport({
        startDate: filters.dateRange?.start,
        endDate: filters.dateRange?.end
      })

      // Transformar datos para el formato esperado
      const transformedData: AttendanceData = {
        totalAttendees: eventsReport?.totalAttendees || 0,
        checkedInAttendees: eventsReport?.checkedInAttendees || 0,
        pendingCheckIn: eventsReport?.pendingCheckIn || 0,
        noShowAttendees: eventsReport?.noShowAttendees || 0,
        attendanceRate: eventsReport?.attendanceRate || 0,
        averageCheckInTime: eventsReport?.averageCheckInTime || '00:00',
        topEventsByAttendance: eventsReport?.topEventsByAttendance || [],
        attendanceByPeriod: eventsReport?.attendanceByPeriod || [],
        checkInMethods: eventsReport?.checkInMethods || [],
        attendanceByTimeSlot: eventsReport?.attendanceByTimeSlot || []
      }

      setAttendanceData(transformedData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos de asistencias:', err)
      setError('Error al cargar los datos de asistencias')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      // Gráfico de asistencias por período
      const attendanceDataChart: LineChartData = {
        labels: attendanceData?.attendanceByPeriod.map(item => item.period) || [],
        datasets: [
          {
            label: 'Total Asistentes',
            data: attendanceData?.attendanceByPeriod.map(item => item.total) || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Check-in Realizado',
            data: attendanceData?.attendanceByPeriod.map(item => item.checkedIn) || [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          },
          {
            label: 'Pendientes',
            data: attendanceData?.attendanceByPeriod.map(item => item.pending) || [],
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)'
          }
        ]
      }
      setAttendanceChart(attendanceDataChart)

      // Gráfico de métodos de check-in
      const checkInData: PieChartData = {
        labels: attendanceData?.checkInMethods.map(item => item.method) || [],
        datasets: [{
          data: attendanceData?.checkInMethods.map(item => item.count) || [],
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
      setCheckInMethodsChart(checkInData)

      // Gráfico de asistencias por horario
      const timeSlotData: BarChartData = {
        labels: attendanceData?.attendanceByTimeSlot.map(item => item.timeSlot) || [],
        datasets: [{
          label: 'Asistentes por Horario',
          data: attendanceData?.attendanceByTimeSlot.map(item => item.attendees) || [],
          backgroundColor: ['rgba(59, 130, 246, 0.8)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1
        }]
      }
      setTimeSlotChart(timeSlotData)
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
      const blob = await adminReportService.exportReport('attendance', format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-asistencias-${new Date().toISOString().split('T')[0]}.${format}`
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
    loadAttendanceData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Asistencias' },
  ]

  return (
    <AdminLayout title="Reporte de Asistencias" breadcrumbs={breadcrumbs}>
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
                      <p className="text-sm font-medium text-gray-600">Total Asistentes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {attendanceData?.totalAttendees.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaUserCheck className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +18.5% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Check-in Realizado</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {attendanceData?.checkedInAttendees.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      {((attendanceData?.checkedInAttendees || 0) / (attendanceData?.totalAttendees || 1) * 100).toFixed(1)}% del total
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tasa de Asistencia</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {attendanceData?.attendanceRate.toFixed(1) || '0'}%
                      </p>
                    </div>
                    <FaChartBar className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +5.2% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tiempo Promedio Check-in</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {attendanceData?.averageCheckInTime || '00:00'}
                      </p>
                    </div>
                    <FaClock className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-xs">
                      Minutos desde llegada
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
                title="Asistencias por Período"
                type="line"
                data={attendanceChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <ChartWrapper
                title="Métodos de Check-in"
                type="pie"
                data={checkInMethodsChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />
            </div>

            {/* Asistencias por horario y eventos top */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper
                title="Asistencias por Horario"
                type="bar"
                data={timeSlotChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Eventos por Tasa de Asistencia</CardTitle>
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
                      attendanceData?.topEventsByAttendance.slice(0, 5).map((event, index) => (
                        <div key={event.eventId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{event.eventTitle}</p>
                              <p className="text-sm text-gray-600">{event.checkedIn} / {event.totalAttendees} check-ins</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={event.attendanceRate > 70 ? 'default' : 'secondary'} className="text-xs">
                              {event.attendanceRate.toFixed(1)}% asistencia
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
                <CardTitle>Datos de Asistencias por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Total Asistentes</TableHead>
                        <TableHead className="text-right">Check-in Realizado</TableHead>
                        <TableHead className="text-right">Pendientes</TableHead>
                        <TableHead className="text-right">No Show</TableHead>
                        <TableHead className="text-right">Tasa Asistencia</TableHead>
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
                        attendanceData?.attendanceByPeriod.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">{item.total.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.checkedIn.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.pending.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.noShow.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{((item.checkedIn / item.total) * 100).toFixed(1)}%</TableCell>
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

export default AdminAttendanceReportPage