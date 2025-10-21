import React from 'react'
import { FaCalendarAlt, FaFilter, FaSearch, FaDownload } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ComponentProps } from '@/types'
import type { DashboardFilters, TimePeriod } from '@/types/admin'

interface DashboardFiltersProps extends ComponentProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void
  isLoading?: boolean
}

interface LocalFilters {
  timePeriod?: string
  search?: string
  categories?: string[]
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  isLoading = false,
  className,
}) => {
  const [localFilters, setLocalFilters] = React.useState<LocalFilters>({
    timePeriod: filters.dateRange ? 'custom' : 'thisMonth',
    search: '',
    categories: filters.categories,
  })

  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'thisWeek', label: 'Esta semana' },
    { value: 'lastWeek', label: 'Semana pasada' },
    { value: 'thisMonth', label: 'Este mes' },
    { value: 'lastMonth', label: 'Mes pasado' },
    { value: 'thisYear', label: 'Este año' },
    { value: 'lastYear', label: 'Año pasado' },
  ]

  const handleTimePeriodChange = (value: TimePeriod) => {
    setLocalFilters(prev => ({ ...prev, timePeriod: value }))
    onFiltersChange({
      ...filters,
      dateRange: undefined, // Reset custom date range
    })
  }

  const handleSearchChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, search: value }))
    // Debounced search update
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        ...filters,
        // Add search to filters if needed
      })
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      categories: value ? [value] : undefined,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).some(key =>
    filters[key as keyof DashboardFilters] !== undefined &&
    filters[key as keyof DashboardFilters] !== null &&
    (Array.isArray(filters[key as keyof DashboardFilters])
      ? (filters[key as keyof DashboardFilters] as any[]).length > 0
      : true)
  )

  return (
    <Card className={cn("mb-6", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Filtros principales */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Período de tiempo */}
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="h-4 w-4 text-gray-500" />
              <Select
                value={localFilters.timePeriod || 'thisMonth'}
                onValueChange={handleTimePeriodChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <FaSearch className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar eventos, usuarios..."
                value={localFilters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
            </div>

            {/* Categoría */}
            <Select
              value={filters.categories?.[0] || ''}
              onValueChange={handleCategoryChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                <SelectItem value="conference">Conferencias</SelectItem>
                <SelectItem value="workshop">Talleres</SelectItem>
                <SelectItem value="seminar">Seminarios</SelectItem>
                <SelectItem value="webinar">Webinars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-2">
            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={isLoading}
              >
                <FaFilter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}

            {/* Exportar */}
            {onExport && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('pdf')}
                  disabled={isLoading}
                >
                  <FaDownload className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('excel')}
                  disabled={isLoading}
                >
                  <FaDownload className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('csv')}
                  disabled={isLoading}
                >
                  <FaDownload className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600 mr-2">Filtros activos:</span>
            {localFilters.timePeriod && (
              <Badge variant="secondary">
                Período: {timePeriods.find(p => p.value === localFilters.timePeriod)?.label}
              </Badge>
            )}
            {localFilters.search && (
              <Badge variant="secondary">
                Búsqueda: {localFilters.search}
              </Badge>
            )}
            {filters.categories?.length && (
              <Badge variant="secondary">
                Categoría: {filters.categories[0]}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}