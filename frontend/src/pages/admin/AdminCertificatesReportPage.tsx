import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaCertificate, FaQrcode, FaCheckCircle, FaClock, FaTable, FaEye, FaFileAlt } from 'react-icons/fa'
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

interface CertificatesData {
  totalCertificates: number
  issuedCertificates: number
  pendingCertificates: number
  validatedCertificates: number
  blockchainStored: number
  totalTemplates: number
  certificatesByEvent: Array<{
    eventId: number
    eventTitle: string
    certificatesCount: number
    issuedCount: number
    validatedCount: number
  }>
  certificatesByPeriod: Array<{
    period: string
    issued: number
    validated: number
    pending: number
    blockchain: number
  }>
  certificatesByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  validationStats: Array<{
    status: string
    count: number
    percentage: number
  }>
  topValidatedEvents: Array<{
    eventId: number
    title: string
    certificates: number
    validationRate: number
  }>
}

const AdminCertificatesReportPage: React.FC = () => {
  const [certificatesData, setCertificatesData] = useState<CertificatesData | null>(null)
  const [certificatesChart, setCertificatesChart] = useState<LineChartData | null>(null)
  const [typeChart, setTypeChart] = useState<PieChartData | null>(null)
  const [validationChart, setValidationChart] = useState<BarChartData | null>(null)
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de certificados
  const loadCertificatesData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener datos del reporte de certificados
      const certificatesReport = await adminReportService.getCertificatesReport({
        startDate: filters.dateRange?.start,
        endDate: filters.dateRange?.end
      })

      // Transformar datos para el formato esperado
      const transformedData: CertificatesData = {
        totalCertificates: certificatesReport?.totalCertificates || 0,
        issuedCertificates: certificatesReport?.issuedCertificates || 0,
        pendingCertificates: certificatesReport?.pendingCertificates || 0,
        validatedCertificates: certificatesReport?.validatedCertificates || 0,
        blockchainStored: certificatesReport?.blockchainStored || 0,
        totalTemplates: certificatesReport?.totalTemplates || 0,
        certificatesByEvent: certificatesReport?.certificatesByEvent || [],
        certificatesByPeriod: certificatesReport?.certificatesByPeriod || [],
        certificatesByType: certificatesReport?.certificatesByType || [],
        validationStats: certificatesReport?.validationStats || [],
        topValidatedEvents: certificatesReport?.topValidatedEvents || []
      }

      setCertificatesData(transformedData)

      // Cargar gráficos
      await loadCharts()
    } catch (err) {
      console.error('Error cargando datos de certificados:', err)
      setError('Error al cargar los datos de certificados')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de gráficos
  const loadCharts = async () => {
    try {
      // Gráfico de certificados por período
      const certificatesDataChart: LineChartData = {
        labels: certificatesData?.certificatesByPeriod.map(item => item.period) || [],
        datasets: [
          {
            label: 'Emitidos',
            data: certificatesData?.certificatesByPeriod.map(item => item.issued) || [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          },
          {
            label: 'Validados',
            data: certificatesData?.certificatesByPeriod.map(item => item.validated) || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: 'En Blockchain',
            data: certificatesData?.certificatesByPeriod.map(item => item.blockchain) || [],
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)'
          }
        ]
      }
      setCertificatesChart(certificatesDataChart)

      // Gráfico de tipos de certificado
      const typeData: PieChartData = {
        labels: certificatesData?.certificatesByType.map(item => item.type) || [],
        datasets: [{
          data: certificatesData?.certificatesByType.map(item => item.count) || [],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(147, 51, 234, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(147, 51, 234)'
          ],
          borderWidth: 1
        }]
      }
      setTypeChart(typeData)

      // Gráfico de validación
      const validationData: BarChartData = {
        labels: certificatesData?.validationStats.map(item => item.status) || [],
        datasets: [{
          label: 'Certificados',
          data: certificatesData?.validationStats.map(item => item.count) || [],
          backgroundColor: ['rgba(59, 130, 246, 0.8)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1
        }]
      }
      setValidationChart(validationData)
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
      const blob = await adminReportService.exportReport('certificates', format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-certificados-${new Date().toISOString().split('T')[0]}.${format}`
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
    loadCertificatesData()
  }, [filters])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes', href: '/admin/reportes' },
    { label: 'Certificados' },
  ]

  return (
    <AdminLayout title="Reporte de Certificados" breadcrumbs={breadcrumbs}>
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
                      <p className="text-sm font-medium text-gray-600">Total Certificados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {certificatesData?.totalCertificates.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCertificate className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      {certificatesData?.issuedCertificates || 0} emitidos
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificados Validados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {certificatesData?.validatedCertificates.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      {((certificatesData?.validatedCertificates || 0) / (certificatesData?.totalCertificates || 1) * 100).toFixed(1)}% validados
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">En Blockchain</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {certificatesData?.blockchainStored.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaQrcode className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="default" className="text-xs">
                      +8.5% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Plantillas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {certificatesData?.totalTemplates.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaFileAlt className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-xs">
                      Activas
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
                title="Certificados por Período"
                type="line"
                data={certificatesChart || { labels: [], datasets: [] }}
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

            {/* Validación y eventos top */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper
                title="Estado de Validación"
                type="bar"
                data={validationChart || { labels: [], datasets: [] }}
                isLoading={isLoading}
                height={300}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Eventos por Validación</CardTitle>
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
                      certificatesData?.topValidatedEvents.slice(0, 5).map((event, index) => (
                        <div key={event.eventId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{event.title}</p>
                              <p className="text-sm text-gray-600">{event.certificates} certificados</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={event.validationRate > 80 ? 'default' : 'secondary'} className="text-xs">
                              {event.validationRate.toFixed(1)}% validado
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
                <CardTitle>Datos de Certificados por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-right">Emitidos</TableHead>
                        <TableHead className="text-right">Validados</TableHead>
                        <TableHead className="text-right">Pendientes</TableHead>
                        <TableHead className="text-right">En Blockchain</TableHead>
                        <TableHead className="text-right">Tasa Validación</TableHead>
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
                        certificatesData?.certificatesByPeriod.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">{item.issued.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.validated.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.pending.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.blockchain.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{((item.validated / item.issued) * 100).toFixed(1)}%</TableCell>
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

export default AdminCertificatesReportPage