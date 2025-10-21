import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaDownload, FaChartBar, FaUsers, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaQrcode, FaSync } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { adminQRService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  AttendanceDashboard,
  AttendanceStats,
  AccessLogStats,
} from '@/types/admin'

interface AdminAccessControlPageProps {
  eventId: number
}

const AdminAccessControlPage: React.FC<AdminAccessControlPageProps> = ({ eventId }) => {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<AttendanceDashboard | null>(null)
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [accessStats, setAccessStats] = useState<AccessLogStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
    // Actualizar cada 30 segundos
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [dashboardData, statsData, accessData] = await Promise.all([
        adminQRService.getAttendanceDashboard(eventId),
        adminQRService.getAttendanceStats(eventId),
        adminQRService.getAccessLogStats({ eventId }),
      ])

      setDashboard(dashboardData)
      setStats(statsData)
      setAccessStats(accessData)
      setLastUpdate(new Date())
    } catch (err: any) {
      console.error('Error cargando datos de control de acceso:', err)
      setError('Error al cargar los datos del control de acceso')
    } finally {
      setLoading(false)
    }
  }

  // Exportar reporte de asistencia
  const handleExportAttendance = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await adminQRService.exportAttendanceReport(eventId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-asistencia-${eventId}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando reporte:', err)
      setError('Error al exportar el reporte')
    }
  }

  if (loading && !dashboard) {
    return (
      <AdminLayout title="Control de Acceso" breadcrumbs={[]}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: 'Control de Acceso' },
  ]

  return (
    <AdminLayout title="Control de Acceso" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Control de Acceso - Evento #{eventId}</h1>
            <p className="text-gray-600 mt-1">
              Panel de control en tiempo real para gestión de asistencia
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => loadData()}>
              <FaSync className="mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" onClick={() => handleExportAttendance('csv')}>
              <FaDownload className="mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExportAttendance('excel')}>
              <FaDownload className="mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado actual */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Asistencia Actual</p>
                    <p className="text-3xl font-bold text-blue-600">{dashboard.currentAttendance.checkedIn}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      de {dashboard.currentAttendance.total} registrados
                    </p>
                  </div>
                  <FaUsers className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-4">
                  <Progress
                    value={(dashboard.currentAttendance.checkedIn / dashboard.currentAttendance.total) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Capacidad</p>
                    <p className="text-3xl font-bold text-green-600">{dashboard.capacity}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {dashboard.occupancyRate.toFixed(1)}% ocupación
                    </p>
                  </div>
                  <FaChartBar className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-4">
                  <Progress value={dashboard.occupancyRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Check-outs</p>
                    <p className="text-3xl font-bold text-orange-600">{dashboard.currentAttendance.checkedOut}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Han salido del evento
                    </p>
                  </div>
                  <FaCheckCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Última Actualización</p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatDateTime(lastUpdate).split(' ')[1]}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Datos en tiempo real
                    </p>
                  </div>
                  <FaClock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estadísticas detalladas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaUsers className="mr-2" />
                  Estadísticas de Asistencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total asistentes:</span>
                    <span className="font-semibold">{stats.totalAttendees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-ins:</span>
                    <span className="font-semibold text-green-600">{stats.checkedIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Check-outs:</span>
                    <span className="font-semibold text-blue-600">{stats.checkedOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">No-shows:</span>
                    <span className="font-semibold text-red-600">{stats.totalAttendees - stats.checkedIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tasa de asistencia:</span>
                    <span className="font-semibold">{stats.attendanceRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duración promedio:</span>
                    <span className="font-semibold">{stats.averageDuration.toFixed(0)} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaQrcode className="mr-2" />
                  Horas Pico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.peakHours.slice(0, 5).map((peak) => (
                    <div key={peak.hour} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {peak.hour.toString().padStart(2, '0')}:00
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(peak.count / Math.max(...stats.peakHours.map(p => p.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold">{peak.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaChartBar className="mr-2" />
                  Puntos de Acceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.topAccessPoints && dashboard.topAccessPoints.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.topAccessPoints.slice(0, 5).map((point) => (
                      <div key={point.accessPoint} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{point.accessPoint}</span>
                        <Badge variant="secondary">{point.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No hay datos de puntos de acceso</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs de acceso */}
        {accessStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaClock className="mr-2" />
                Estadísticas de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{accessStats.successfulAttempts}</p>
                  <p className="text-sm text-gray-600">Intentos exitosos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{accessStats.failedAttempts}</p>
                  <p className="text-sm text-gray-600">Intentos fallidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{accessStats.suspiciousAttempts}</p>
                  <p className="text-sm text-gray-600">Intentos sospechosos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{accessStats.totalAttempts}</p>
                  <p className="text-sm text-gray-600">Total intentos</p>
                </div>
              </div>

              {accessStats.suspiciousPatterns.repeatedFailures.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Patrones Sospechosos</h4>
                  <div className="space-y-2">
                    {accessStats.suspiciousPatterns.repeatedFailures.slice(0, 3).map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-gray-700">IP: {pattern.ip}</span>
                        </div>
                        <Badge variant="destructive">{pattern.count} fallos</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Alertas */}
        {dashboard?.alerts && dashboard.alerts.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <FaExclamationTriangle className="mr-2" />
                Alertas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard.alerts.map((alert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">{alert.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminAccessControlPage