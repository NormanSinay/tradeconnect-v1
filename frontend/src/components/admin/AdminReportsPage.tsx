import React, { useState, useEffect } from 'react'
import { FaDownload, FaFilter, FaChartBar, FaFileAlt, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaCertificate, FaStar, FaEye } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminReportService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type { DashboardFilters as DashboardFiltersType } from '@/types/admin'
import { Link } from 'react-router-dom'

interface ReportSummary {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  route: string
  metrics: {
    total: number
    change: number
    changePercent: number
  }
  lastUpdated: Date
}

const AdminReportsPage: React.FC = () => {
  const [reportSummaries, setReportSummaries] = useState<ReportSummary[]>([])
  const [filters, setFilters] = useState<DashboardFiltersType>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'last7days' | 'last30days' | 'last90days' | 'lastYear'>('last30days')

  // Cargar resúmenes de reportes
  const loadReportSummaries = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener datos de diferentes reportes
      const [
        eventsReport,
        registrationsReport,
        financialReport,
        speakersReport,
        certificatesReport,
        systemReport
      ] = await Promise.all([
        adminReportService.getEventsReport({}),
        adminReportService.getRegistrationsReport({}),
        adminReportService.getFinancialReport({}),
        adminReportService.getSpeakersReport({}),
        adminReportService.getCertificatesReport({}),
        adminReportService.getSystemReport({})
      ])

      const summaries: ReportSummary[] = [
        {
          id: 'sales',
          title: 'Ventas',
          description: 'Reportes de ingresos y transacciones',
          icon: <FaMoneyBillWave className="h-6 w-6" />,
          route: '/admin/reportes/ventas',
          metrics: {
            total: financialReport?.totalRevenue || 0,
            change: financialReport?.revenueChange || 0,
            changePercent: financialReport?.revenueChangePercent || 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'registrations',
          title: 'Inscripciones',
          description: 'Registro de participantes por evento',
          icon: <FaUsers className="h-6 w-6" />,
          route: '/admin/reportes/inscripciones',
          metrics: {
            total: registrationsReport?.totalRegistrations || 0,
            change: registrationsReport?.registrationsChange || 0,
            changePercent: registrationsReport?.registrationsChangePercent || 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'attendance',
          title: 'Asistencias',
          description: 'Control de asistencia a eventos',
          icon: <FaCalendarAlt className="h-6 w-6" />,
          route: '/admin/reportes/asistencias',
          metrics: {
            total: registrationsReport?.totalAttended || 0,
            change: registrationsReport?.attendanceChange || 0,
            changePercent: registrationsReport?.attendanceChangePercent || 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'financial',
          title: 'Financiero',
          description: 'Análisis financiero completo',
          icon: <FaMoneyBillWave className="h-6 w-6" />,
          route: '/admin/reportes/financiero',
          metrics: {
            total: financialReport?.totalRevenue || 0,
            change: financialReport?.revenueChange || 0,
            changePercent: financialReport?.revenueChangePercent || 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'speakers',
          title: 'Speakers',
          description: 'Evaluación y rendimiento de speakers',
          icon: <FaStar className="h-6 w-6" />,
          route: '/admin/reportes/speakers',
          metrics: {
            total: speakersReport?.totalSpeakers || 0,
            change: speakersReport?.speakersChange || 0,
            changePercent: speakersReport?.speakersChangePercent || 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'certificates',
          title: 'Certificados',
          description: 'Emisión y validación de certificados',
          icon: <FaCertificate className="h-6 w-6" />,
          route: '/admin/reportes/certificados',
          metrics: {
            total: certificatesReport?.totalCertificates || 0,
            change: certificatesReport?.certificatesChange || 0,
            changePercent: certificatesReport?.certificatesChangePercent || 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'promotions',
          title: 'Promociones',
          description: 'Efectividad de códigos promocionales',
          icon: <FaChartBar className="h-6 w-6" />,
          route: '/admin/reportes/promociones',
          metrics: {
            total: financialReport?.totalPromotions || 0,
            change: financialReport?.promotionsChange || 0,
            changePercent: financialReport?.promotionsChangePercent || 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'custom',
          title: 'Personalizados',
          description: 'Reportes configurables por el usuario',
          icon: <FaFileAlt className="h-6 w-6" />,
          route: '/admin/reportes/custom',
          metrics: {
            total: 0,
            change: 0,
            changePercent: 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'analytics',
          title: 'Analytics',
          description: 'Métricas en tiempo real',
          icon: <FaChartBar className="h-6 w-6" />,
          route: '/admin/analytics',
          metrics: {
            total: systemReport?.totalMetrics || 0,
            change: systemReport?.metricsChange || 0,
            changePercent: systemReport?.metricsChangePercent || 0
          },
          lastUpdated: new Date()
        },
        {
          id: 'kpis',
          title: 'KPIs',
          description: 'Indicadores clave de rendimiento',
          icon: <FaEye className="h-6 w-6" />,
          route: '/admin/kpis',
          metrics: {
            total: 0,
            change: 0,
            changePercent: 0
          },
          lastUpdated: new Date()
        }
      ]

      setReportSummaries(summaries)
    } catch (err) {
      console.error('Error cargando resúmenes de reportes:', err)
      setError('Error al cargar los resúmenes de reportes')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters: DashboardFiltersType) => {
    setFilters(newFilters)
  }

  // Exportar todos los reportes
  const handleExportAll = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Implementar exportación masiva
      console.log('Exportando todos los reportes en formato:', format)
    } catch (err) {
      console.error('Error exportando reportes:', err)
      setError('Error al exportar los reportes')
    }
  }

  useEffect(() => {
    loadReportSummaries()
  }, [filters, selectedPeriod])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Reportes' },
  ]

  return (
    <AdminLayout title="Dashboard de Reportes" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Filtros y controles */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaFilter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Período:</span>
                  <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7days">Últimos 7 días</SelectItem>
                      <SelectItem value="last30days">Últimos 30 días</SelectItem>
                      <SelectItem value="last90days">Últimos 90 días</SelectItem>
                      <SelectItem value="lastYear">Último año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAll('pdf')}
                  disabled={isLoading}
                >
                  <FaDownload className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAll('excel')}
                  disabled={isLoading}
                >
                  <FaDownload className="h-4 w-4 mr-2" />
                  Exportar Excel
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

        {/* Resumen de métricas principales */}
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
                      <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Q{reportSummaries.find(r => r.id === 'sales')?.metrics.total.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaMoneyBillWave className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <Badge
                      variant={(reportSummaries.find(r => r.id === 'sales')?.metrics.changePercent || 0) >= 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {(reportSummaries.find(r => r.id === 'sales')?.metrics.changePercent || 0) >= 0 ? '+' : ''}
                      {(reportSummaries.find(r => r.id === 'sales')?.metrics.changePercent || 0).toFixed(1)}%
                    </Badge>
                    <span className="text-xs text-gray-500">vs período anterior</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Inscripciones</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportSummaries.find(r => r.id === 'registrations')?.metrics.total.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaUsers className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <Badge
                      variant={(reportSummaries.find(r => r.id === 'registrations')?.metrics.changePercent || 0) >= 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {(reportSummaries.find(r => r.id === 'registrations')?.metrics.changePercent || 0) >= 0 ? '+' : ''}
                      {(reportSummaries.find(r => r.id === 'registrations')?.metrics.changePercent || 0).toFixed(1)}%
                    </Badge>
                    <span className="text-xs text-gray-500">vs período anterior</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Eventos Activos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportSummaries.find(r => r.id === 'attendance')?.metrics.total.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCalendarAlt className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <Badge
                      variant={(reportSummaries.find(r => r.id === 'attendance')?.metrics.changePercent || 0) >= 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {(reportSummaries.find(r => r.id === 'attendance')?.metrics.changePercent || 0) >= 0 ? '+' : ''}
                      {(reportSummaries.find(r => r.id === 'attendance')?.metrics.changePercent || 0).toFixed(1)}%
                    </Badge>
                    <span className="text-xs text-gray-500">vs período anterior</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificados Emitidos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportSummaries.find(r => r.id === 'certificates')?.metrics.total.toLocaleString() || '0'}
                      </p>
                    </div>
                    <FaCertificate className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <Badge
                      variant={(reportSummaries.find(r => r.id === 'certificates')?.metrics.changePercent || 0) >= 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {(reportSummaries.find(r => r.id === 'certificates')?.metrics.changePercent || 0) >= 0 ? '+' : ''}
                      {(reportSummaries.find(r => r.id === 'certificates')?.metrics.changePercent || 0).toFixed(1)}%
                    </Badge>
                    <span className="text-xs text-gray-500">vs período anterior</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Grid de reportes disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            reportSummaries.map((report) => (
              <Link key={report.id} to={report.route}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {report.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {report.metrics.total.toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={(report.metrics.changePercent || 0) >= 0 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {(report.metrics.changePercent || 0) >= 0 ? '+' : ''}
                            {(report.metrics.changePercent || 0).toFixed(1)}%
                          </Badge>
                          <span className="text-xs text-gray-500">vs anterior</span>
                        </div>
                      </div>
                      <FaEye className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Actualizado: {report.lastUpdated.toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Reportes programados */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Programar Reportes Automáticos</h3>
              <p className="text-gray-600 mb-4">
                Configura reportes que se generen y envíen automáticamente por email.
              </p>
              <Button variant="outline">
                <FaCalendarAlt className="h-4 w-4 mr-2" />
                Configurar Reportes Programados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminReportsPage