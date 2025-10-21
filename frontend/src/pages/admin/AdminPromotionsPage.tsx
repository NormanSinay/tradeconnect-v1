import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaTrash, FaEdit, FaEye, FaToggleOn, FaToggleOff, FaPlay, FaPause } from 'react-icons/fa'
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
  PromotionResponse,
  PromotionFilters,
  PromotionType,
  PromotionStats,
} from '@/types/admin'

const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPromotions, setSelectedPromotions] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<PromotionFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPromotions, setTotalPromotions] = useState(0)
  const [stats, setStats] = useState<PromotionStats | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadPromotions()
    loadStats()
  }, [currentPage, filters])

  // Cargar promociones
  const loadPromotions = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        ...filters,
      }

      const result = await adminPromotionService.getPromotions(filters, params)
      setPromotions(result.data)
      setTotalPages(result.totalPages || 1)
      setTotalPromotions(result.total || 0)
    } catch (err) {
      console.error('Error cargando promociones:', err)
      setError('Error al cargar las promociones')
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const statsData = await adminPromotionService.getPromotionStats()
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
  const handleFilterChange = (newFilters: Partial<PromotionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  // Manejar selección de promociones
  const handleSelectPromotion = (promotionId: number, checked: boolean) => {
    setSelectedPromotions(prev =>
      checked
        ? [...prev, promotionId]
        : prev.filter(id => id !== promotionId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedPromotions(checked ? promotions.map(p => p.id) : [])
  }

  // Acciones individuales
  const handleViewPromotion = (promotion: PromotionResponse) => {
    // TODO: Navigate to promotion detail
    console.log('View promotion:', promotion)
  }

  const handleEditPromotion = (promotion: PromotionResponse) => {
    // TODO: Navigate to edit page
    console.log('Edit promotion:', promotion)
  }

  const handleTogglePromotion = async (promotion: PromotionResponse) => {
    try {
      if (promotion.isActive) {
        await adminPromotionService.deactivatePromotion(promotion.id)
      } else {
        await adminPromotionService.activatePromotion(promotion.id)
      }
      loadPromotions()
    } catch (err) {
      console.error('Error cambiando estado de promoción:', err)
      setError('Error al cambiar el estado de la promoción')
    }
  }

  const handleDeletePromotion = async (promotionId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta promoción?')) return

    try {
      await adminPromotionService.deletePromotion(promotionId)
      loadPromotions()
      loadStats()
    } catch (err) {
      console.error('Error eliminando promoción:', err)
      setError('Error al eliminar la promoción')
    }
  }

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedPromotions.length === 0) return
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedPromotions.length} promociones?`)) return

    try {
      await Promise.all(selectedPromotions.map(id => adminPromotionService.deletePromotion(id)))
      setSelectedPromotions([])
      loadPromotions()
      loadStats()
    } catch (err) {
      console.error('Error eliminando promociones:', err)
      setError('Error al eliminar las promociones')
    }
  }

  const handleBulkExport = async () => {
    try {
      const blob = await adminPromotionService.exportPromotions('excel', filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `promociones-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando promociones:', err)
      setError('Error al exportar las promociones')
    }
  }

  // Obtener badge de tipo
  const getTypeBadge = (type: PromotionType) => {
    const variants: Record<PromotionType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      GENERAL: 'default',
      EVENT_SPECIFIC: 'secondary',
      CATEGORY_SPECIFIC: 'outline',
      MEMBERSHIP: 'destructive',
    }
    return variants[type] || 'secondary'
  }

  // Obtener nombre de tipo
  const getTypeName = (type: PromotionType) => {
    const names: Record<PromotionType, string> = {
      GENERAL: 'General',
      EVENT_SPECIFIC: 'Evento Específico',
      CATEGORY_SPECIFIC: 'Categoría Específica',
      MEMBERSHIP: 'Membresía',
    }
    return names[type] || type
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Promociones' },
  ]

  return (
    <AdminLayout title="Gestión de Promociones" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Promociones</p>
                    <p className="text-2xl font-bold">{stats.totalPromotions}</p>
                  </div>
                  <FaSearch className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Activas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activePromotions}</p>
                  </div>
                  <FaToggleOn className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Códigos Totales</p>
                    <p className="text-2xl font-bold">{stats.totalPromoCodes}</p>
                  </div>
                  <FaPlay className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Descuento Total</p>
                    <p className="text-2xl font-bold">Q{stats.totalDiscountGiven.toFixed(2)}</p>
                  </div>
                  <FaDownload className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Promociones</h1>
            <p className="text-gray-600">Gestiona todas las promociones del sistema</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={() => {/* TODO: Navigate to create */}}>
              <FaPlus className="mr-2" />
              Nueva Promoción
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
                  placeholder="Buscar promociones..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange({ type: e.target.value as PromotionType || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="GENERAL">General</option>
                  <option value="EVENT_SPECIFIC">Evento Específico</option>
                  <option value="CATEGORY_SPECIFIC">Categoría Específica</option>
                  <option value="MEMBERSHIP">Membresía</option>
                </select>

                <select
                  value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleFilterChange({
                    isActive: e.target.value === '' ? undefined : e.target.value === 'active'
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedPromotions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedPromotions.length} promoción{selectedPromotions.length > 1 ? 'es' : ''} seleccionada{selectedPromotions.length > 1 ? 's' : ''}
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

        {/* Tabla de promociones */}
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
            ) : promotions.length === 0 ? (
              <div className="p-12 text-center">
                <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron promociones
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay promociones registradas.'}
                </p>
                <Button onClick={() => {/* TODO: Navigate to create */}}>
                  <FaPlus className="mr-2" />
                  Crear primera promoción
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPromotions.length === promotions.length && promotions.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Promoción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPromotions.includes(promotion.id)}
                          onCheckedChange={(checked) => handleSelectPromotion(promotion.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promotion.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {promotion.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadge(promotion.type)}>
                          {getTypeName(promotion.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={promotion.isActive ? 'default' : 'secondary'}>
                          {promotion.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {promotion.startDate ? formatDateTime(promotion.startDate) : 'Sin fecha'}
                      </TableCell>
                      <TableCell>
                        {promotion.endDate ? formatDateTime(promotion.endDate) : 'Sin fecha'}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{promotion.priority}</span>
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
                            <DropdownMenuItem onClick={() => handleViewPromotion(promotion)}>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPromotion(promotion)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePromotion(promotion)}>
                              {promotion.isActive ? (
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
                              onClick={() => handleDeletePromotion(promotion.id)}
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
              Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalPromotions)} de {totalPromotions} promociones
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

export default AdminPromotionsPage