import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaStar, FaUsers, FaCalendarAlt, FaMoneyBillWave, FaTable, FaEye, FaMicrophone } from 'react-icons/fa'
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

interface SpeakersData {
  totalSpeakers: number
  activeSpeakers: number
  totalEvents: number
  averageRating: number
  totalPayments: number
  averagePaymentPerSpeaker: number
  topSpeakers: Array<{
    speakerId: number
    name: string
    eventsCount: number
    totalAttendees: number
    averageRating: number
    totalEarnings: number
  }>
  speakersBySpecialty: Array<{
    specialty: string
    count: number
    percentage: number
    averageRating: number
  }>
  speakersByPeriod: Array<{
    period: string
    newSpeakers: number
    activeSpeakers: number
    totalEvents: number
    averageRating: number
  }>
  speakerPerformance: Array<{
    speakerId: number
    name: string
    performance: number
    trend: 'up' | 'down' | 'stable'
  }>
  contractStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
}

const AdminSpeakersReportPage: React.FC = () => {
  const [speakersData, setSpeakersData] = useState<SpeakersData | null>(null)
  const [speakersChart, setSpeakersChart] = useState<LineChartData | null>(null)
  const [specialtyChart, setSpecialtyChart] = useState<PieChartData | null>(null)
  const [performanceChart, setPerformanceChart] = useState<BarChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de speakers
  const loadSpeakersData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener datos del reporte de speakers
      const speakersReport = await adminReportService.getSpeakersReport({
        startDate: filters.dateRange?.start,
        endDate: filters.dateRange?.end
      })

      // Transformar datos para el formato esperado
      const transformedData: SpeakersData = {
        totalSpeakers: speakersReport?.totalSpeakers || 0,
        activeSpeakers: speakersReport?.activeSpeakers || 0,
        totalEvents: speakersReport?.totalEvents || 0,
        averageRating: speakersReport?.averageRating || 0,
        totalPayments: speakersReport?.totalPayments || 0,
        averagePaymentPerSpeaker: speakersReport?.averagePaymentPerSpeaker || 0,
        topSpeakers: speakersReport?.topSpeakers || [],
        speakersBySpecialty: speakersReport?.speakersBySpecialty || [],
        speakersByPeriod: speakersReport?.speakersByPeriod || [],
        speakerPerformance: speakersReport?.speakerPerformance || [],
        contractStatus: speakersReport?.contractStatus || []
      }

      setSpeakersData(transformedData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos de speakers:', err)
      setError('Error al cargar los datos de speakers')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      // Gráfico de speakers por período
      const speakersDataChart: LineChartData = {
        labels: speakersData?.speakersByPeriod.map(item => item.period) || [],
        datasets: [
          {
            label: 'Speakers Activos',
            data: speakersData?.speakersByPeriod.map(item => item.activeSpeakers) || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'Nuevos Speakers',
            data: speakersData?.speakersByPeriod.map(item => item.newSpeakers) || [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          }
        ]
      }
      setSpeakersChart(speakersDataChart)

      // Gráfico de especialidades
      const specialtyData: PieChartData = {
        labels: speakersData?.speakersBySpecialty.map(item => item.specialty) || [],
        datasets: [{
          data: speakersData?.speakersBySpecialty.map(item => item.count) || [],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(147, 51, 234, 0.8)',
            'rgba(6, 182, 212, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(147, 51, 234)',
            'rgb(6, 182, 212)'
          ],
          borderWidth: 1
        }]
      }
      setSpecialtyChart(specialtyData)

      // Gráfico de rendimiento
      const performanceData: BarChartData = {
        labels: speakersData?.speakerPerformance.map(item => item.name) || [],
        datasets: [{
          label: 'Rendimiento',
          data: speakersData?.speakerPerformance.map(item => item.performance) || [],
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
      const blob = await adminReportService.exportReport('speakers', format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-speakers-${new Date().toISOString().split('T')[0]}.${format}`
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
    loadSpeakersData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Speakers' },
  ]

  return (
    <AdminLayout title="Reporte de Speakers" breadcrumbs={breadcrumbs}>
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
                      <p className="text-sm font-medium text-gray-600">Total Speakers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {speakersData?.totalSpeakers.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaMicrophone className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      {speakersData?.activeSpeakers || 0} activos
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {speakersData?.averageRating.toFixed(1) || '0'}
                      </p>
                    </div>
                    <FaStar className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +0.3 vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Eventos Realizados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {speakersData?.totalEvents.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCalendarAlt className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +12 eventos este mes
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pagos Totales</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Q{speakersData?.totalPayments.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaMoneyBillWave className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      Q{speakersData?.averagePaymentPerSpeaker.toLocaleString() || '0'} promedio
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
                title="Speakers por Período"
                type="line"
                data={speakersChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <ChartWrapper
                title="Distribución por Especialidad"
                type="pie"
                data={specialtyChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />
            </div>

            {/* Rendimiento y top speakers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper
                title="Rendimiento de Speakers"
                type="bar"
                data={performanceChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Top Speakers</CardTitle>
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
                      speakersData?.topSpeakers.slice(0, 5).map((speaker, index) => (
                        <div key={speaker.speakerId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{speaker.name}</p>
                              <p className="text-sm text-gray-600">{speaker.eventsCount} eventos • {speaker.totalAttendees} asistentes</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {speaker.averageRating.toFixed(1)} ★
                              </Badge>
                              <span className="text-sm font-medium text-gray-900">
                                Q{speaker.totalEarnings.toLocaleString()}
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
                <CardTitle>Datos de Speakers por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Nuevos Speakers</TableHead>
                        <TableHead className="text-right">Speakers Activos</TableHead>
                        <TableHead className="text-right">Eventos</TableHead>
                        <TableHead className="text-right">Calificación Promedio</TableHead>
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
                        speakersData?.speakersByPeriod.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">{item.newSpeakers.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.activeSpeakers.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.totalEvents.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.averageRating.toFixed(1)}</TableCell>
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

export default AdminSpeakersReportPage