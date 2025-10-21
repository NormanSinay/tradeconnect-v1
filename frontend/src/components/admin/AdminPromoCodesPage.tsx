import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaTrash, FaEdit, FaEye, FaToggleOn, FaToggleOff, FaCopy, FaChartBar } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminPromotionService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  PromoCodeResponse,
  PromoCodeFilters,
  DiscountType,
  PromoCodeStats,
} from '@/types/admin'

const AdminPromoCodesPage: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCodeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPromoCodes, setSelectedPromoCodes] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<PromoCodeFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPromoCodes, setTotalPromoCodes] = useState(0)
  const [stats, setStats] = useState<PromoCodeStats[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadPromoCodes()
    loadStats()
  }, [currentPage, filters])

  // Cargar códigos promocionales
  const loadPromoCodes = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        ...filters,
      }

      const result = await adminPromotionService.getPromoCodes(filters, params)
      setPromoCodes(result.data)
      setTotalPages(result.totalPages || 1)
      setTotalPromoCodes(result.total || 0)
    } catch (err) {
      console.error('Error cargando códigos promocionales:', err)
      setError('Error al cargar los códigos promocionales')
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const statsData = await adminPromotionService.getPromoCodeStatsOverview()
      setStats(statsData)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Manejar filtros
  const handleFilterChange = (newFilters: Partial<PromoCodeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  // Manejar selección de códigos
  const handleSelectPromoCode = (promoCodeId: number, checked: boolean) => {
    setSelectedPromoCodes(prev =>
      checked
        ? [...prev, promoCodeId]
        : prev.filter(id => id !== promoCodeId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedPromoCodes(checked ? promoCodes.map(p => p.id) : [])
  }

  // Acciones individuales
  const handleViewPromoCode = (promoCode: PromoCodeResponse) => {
    // TODO: Navigate to promo code detail
    console.log('View promo code:', promoCode)
  }

  const handleEditPromoCode = (promoCode: PromoCodeResponse) => {
    // TODO: Navigate to edit page
    console.log('Edit promo code:', promoCode)
  }

  const handleViewStats = (promoCode: PromoCodeResponse) => {
    // TODO: Navigate to stats page
    console.log('View stats for promo code:', promoCode)
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      // TODO: Show success toast
    } catch (err) {
      console.error('Error copying code:', err)
    }
  }

  const handleTogglePromoCode = async (promoCode: PromoCodeResponse) => {
    try {
      if (promoCode.isActive) {
        await adminPromotionService.deactivatePromoCode(promoCode.id)
      } else {
        await adminPromotionService.activatePromoCode(promoCode.id)
      }
      loadPromoCodes()
    } catch (err) {
      console.error('Error cambiando estado del código promocional:', err)
      setError('Error al cambiar el estado del código promocional')
    }
  }

  const handleDeletePromoCode = async (promoCodeId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este código promocional?')) return

    try {
      await adminPromotionService.deletePromoCode(promoCodeId)
      loadPromoCodes()
      loadStats()
    } catch (err) {
      console.error('Error eliminando código promocional:', err)
      setError('Error al eliminar el código promocional')
    }
  }

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedPromoCodes.length === 0) return
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedPromoCodes.length} códigos promocionales?`)) return

    try {
      await Promise.all(selectedPromoCodes.map(id => adminPromotionService.deletePromoCode(id)))
      setSelectedPromoCodes([])
      loadPromoCodes()
      loadStats()
    } catch (err) {
      console.error('Error eliminando códigos promocionales:', err)
      setError('Error al eliminar los códigos promocionales')
    }
  }

  const handleBulkExport = async () => {
    try {
      const blob = await adminPromotionService.exportPromoCodes('excel', filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `codigos-promocionales-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando códigos promocionales:', err)
      setError('Error al exportar los códigos promocionales')
    }
  }

  // Obtener badge de tipo de descuento
  const getDiscountTypeBadge = (type: DiscountType) => {
    const variants: Record<DiscountType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PERCENTAGE: 'default',
      FIXED_AMOUNT: 'secondary',
      BUY_X_GET_Y: 'outline',
      SPECIAL_PRICE: 'destructive',
    }
    return variants[type] || 'secondary'
  }

  // Obtener nombre de tipo de descuento
  const getDiscountTypeName = (type: DiscountType) => {
    const names: Record<DiscountType, string> = {
      PERCENTAGE: 'Porcentaje',
      FIXED_AMOUNT: 'Monto Fijo',
      BUY_X_GET_Y: 'Compra X Lleva Y',
      SPECIAL_PRICE: 'Precio Especial',
    }
    return names[type] || type
  }

  // Calcular estadísticas totales
  const totalStats = stats.reduce(
    (acc, stat) => ({
      totalUses: acc.totalUses + stat.totalUses,
      uniqueUsers: acc.uniqueUsers + stat.uniqueUsers,
      totalDiscount: acc.totalDiscount + stat.totalDiscount,
    }),
    { totalUses: 0, uniqueUsers: 0, totalDiscount: 0 }
  )

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Códigos Promocionales' },
  ]

  return (
    <AdminLayout title="Gestión de Códigos Promocionales" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Códigos</p>
                  <p className="text-2xl font-bold">{totalPromoCodes}</p>
                </div>
                <FaSearch className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usos Totales</p>
                  <p className="text-2xl font-bold">{totalStats.totalUses}</p>
                </div>
                <FaToggleOn className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Únicos</p>
                  <p className="text-2xl font-bold">{totalStats.uniqueUsers}</p>
                </div>
                <FaCopy className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descuento Total</p>
                  <p className="text-2xl font-bold">Q{totalStats.totalDiscount.toFixed(2)}</p>
                </div>
                <FaDownload className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Códigos Promocionales</h1>
            <p className="text-gray-600">Gestiona todos los códigos promocionales del sistema</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={() => {/* TODO: Navigate to create */}}>
              <FaPlus className="mr-2" />
              Nuevo Código
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar códigos promocionales..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <select
                  value={filters.discountType || ''}
                  onChange={(e) => handleFilterChange({ discountType: e.target.value as DiscountType || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="FIXED_AMOUNT">Monto Fijo</option>
                  <option value="BUY_X_GET_Y">Compra X Lleva Y</option>
                  <option value="SPECIAL_PRICE">Precio Especial</option>
                </select>

                <select
                  value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleFilterChange({
                    isActive: e.target.value === '' ? undefined : e.target.value === 'active'
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedPromoCodes.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedPromoCodes.length} código{selectedPromoCodes.length > 1 ? 's' : ''} seleccionado{selectedPromoCodes.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <FaDownload className="mr-2" />
                    Exportar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <FaTrash className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de códigos promocionales */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : promoCodes.length === 0 ? (
              <div className="p-12 text-center">
                <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron códigos promocionales
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay códigos promocionales registrados.'}
                </p>
                <Button onClick={() => {/* TODO: Navigate to create */}}>
                  <FaPlus className="mr-2" />
                  Crear primer código
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPromoCodes.length === promoCodes.length && promoCodes.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promoCode) => (
                    <TableRow key={promoCode.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPromoCodes.includes(promoCode.id)}
                          onCheckedChange={(checked) => handleSelectPromoCode(promoCode.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {promoCode.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(promoCode.code)}
                            className="h-6 w-6 p-0"
                          >
                            <FaCopy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promoCode.name}</div>
                          {promoCode.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {promoCode.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDiscountTypeBadge(promoCode.discountType)}>
                          {getDiscountTypeName(promoCode.discountType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {promoCode.discountType === 'PERCENTAGE'
                            ? `${promoCode.discountValue}%`
                            : `Q${promoCode.discountValue.toFixed(2)}`
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{promoCode.currentUsesTotal}</span>
                          {promoCode.maxUsesTotal && (
                            <span className="text-sm text-gray-500">/{promoCode.maxUsesTotal}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={promoCode.isActive ? 'default' : 'secondary'}>
                          {promoCode.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {promoCode.startDate ? formatDateTime(promoCode.startDate) : 'Sin fecha'}
                      </TableCell>
                      <TableCell>
                        {promoCode.endDate ? formatDateTime(promoCode.endDate) : 'Sin fecha'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FaFilter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewPromoCode(promoCode)}>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPromoCode(promoCode)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewStats(promoCode)}>
                              <FaChartBar className="mr-2" />
                              Ver estadísticas
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyCode(promoCode.code)}>
                              <FaCopy className="mr-2" />
                              Copiar código
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleTogglePromoCode(promoCode)}>
                              {promoCode.isActive ? (
                                <>
                                  <FaToggleOff className="mr-2" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <FaToggleOn className="mr-2" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePromoCode(promoCode.id)}
                              className="text-red-600"
                            >
                              <FaTrash className="mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalPromoCodes)} de {totalPromoCodes} códigos promocionales
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTrash className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminPromoCodesPage