import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaDownload, FaChartBar, FaUsers, FaShoppingCart, FaDollarSign, FaCalendarAlt, FaFilter } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminPromotionService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  PromoCodeResponse,
  PromoCodeStats,
  PromoCodeUsageResponse,
} from '@/types/admin'

interface AdminPromoCodeStatsPageProps {
  promoCodeId?: number
}

const AdminPromoCodeStatsPage: React.FC<AdminPromoCodeStatsPageProps> = ({ promoCodeId }) => {
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState<PromoCodeResponse | null>(null)
  const [stats, setStats] = useState<PromoCodeStats | null>(null)
  const [usageHistory, setUsageHistory] = useState<PromoCodeUsageResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30') // días

  // Cargar datos iniciales
  useEffect(() => {
    if (promoCodeId) {
      loadData()
    }
  }, [promoCodeId, dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [promoCodeData, statsData, usageData] = await Promise.all([
        adminPromotionService.getPromoCodeById(promoCodeId!),
        adminPromotionService.getPromoCodeStats(promoCodeId!),
        adminPromotionService.getPromoCodeUsage(promoCodeId!, {
          startDate: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        }),
      ])

      setPromoCode(promoCodeData)
      setStats(statsData)
      setUsageHistory(usageData)
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
      setError('Error al cargar las estadísticas del código promocional')
    } finally {
      setLoading(false)
    }
  }

  // Exportar datos
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await adminPromotionService.exportPromoCodeUsage(promoCodeId!, format, {
        startDate: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `uso-codigo-${promoCode?.code}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando datos:', err)
      setError('Error al exportar los datos')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Estadísticas de Código Promocional" breadcrumbs={[]}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!promoCode || !stats) {
    return (
      <AdminLayout title="Estadísticas de Código Promocional" breadcrumbs={[]}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Código promocional no encontrado</h2>
          <p className="text-gray-600 mt-2">El código promocional que intenta ver no existe.</p>
        </div>
      </AdminLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Códigos Promocionales', href: '/admin/codigos-descuento' },
    { label: `Estadísticas: ${promoCode.code}` },
  ]

  return (
    <AdminLayout title="Estadísticas de Código Promocional" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Estadísticas del Código</h1>
            <div className="flex items-center space-x-4 mt-2">
              <code className="bg-gray-100 px-3 py-1 rounded-lg text-lg font-mono font-bold">
                {promoCode.code}
              </code>
              <span className="text-gray-600">{promoCode.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                promoCode.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {promoCode.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
                <SelectItem value="365">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <FaDownload className="mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
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
                <FaFilter className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Usos</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUses}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {promoCode.maxUsesTotal ? `${promoCode.currentUsesTotal}/${promoCode.maxUsesTotal}` : 'Sin límite'}
                  </p>
                </div>
                <FaShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Únicos</p>
                  <p className="text-3xl font-bold text-green-600">{stats.uniqueUsers}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.totalUses > 0 ? `${((stats.uniqueUsers / stats.totalUses) * 100).toFixed(1)}% de conversión` : 'Sin usos'}
                  </p>
                </div>
                <FaUsers className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descuento Total</p>
                  <p className="text-3xl font-bold text-orange-600">Q{stats.totalDiscount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.totalUses > 0 ? `Q${(stats.totalDiscount / stats.totalUses).toFixed(2)} promedio` : 'Sin usos'}
                  </p>
                </div>
                <FaDollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Usuarios que completaron compra
                  </p>
                </div>
                <FaChartBar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del código */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Código Promocional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Tipo de Descuento</p>
                <p className="text-lg font-semibold">
                  {promoCode.discountType === 'PERCENTAGE'
                    ? `${promoCode.discountValue}%`
                    : `Q${promoCode.discountValue.toFixed(2)}`
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de Creación</p>
                <p className="text-lg font-semibold">{formatDateTime(promoCode.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de Inicio</p>
                <p className="text-lg font-semibold">
                  {promoCode.startDate ? formatDateTime(promoCode.startDate) : 'Inmediato'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de Fin</p>
                <p className="text-lg font-semibold">
                  {promoCode.endDate ? formatDateTime(promoCode.endDate) : 'Sin expiración'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historial de uso */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Uso Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {usageHistory.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay usos registrados
                </h3>
                <p className="text-gray-600">
                  Este código promocional aún no ha sido utilizado en el período seleccionado.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {usageHistory.slice(0, 10).map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Usuario ID: {usage.userId}
                        </p>
                        <p className="text-sm text-gray-500">
                          Evento ID: {usage.eventId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Q{usage.discountAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(usage.appliedAt)}
                      </p>
                    </div>
                  </div>
                ))}

                {usageHistory.length > 10 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Mostrando los 10 usos más recientes de {usageHistory.length} totales
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de tendencias (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencias de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <FaChartBar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gráfico de Tendencias
                </h3>
                <p className="text-gray-600">
                  El gráfico de tendencias se implementará próximamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminPromoCodeStatsPage