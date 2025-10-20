import React, { useState } from 'react'
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ComponentProps } from '@/types'

export interface EventFilters {
  search: string
  categories: string[]
  priceRange: {
    min: number
    max: number
  }
  dateRange: {
    start: Date | null
    end: Date | null
  }
  status: ('upcoming' | 'past' | 'all')[]
  location: string
}

interface EventFiltersProps extends ComponentProps {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
  availableCategories: string[]
  maxPrice: number
  isOpen: boolean
  onToggle: () => void
}

const initialFilters: EventFilters = {
  search: '',
  categories: [],
  priceRange: { min: 0, max: 1000 },
  dateRange: { start: null, end: null },
  status: ['all'],
  location: '',
}

export const EventFiltersComponent: React.FC<EventFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCategories,
  maxPrice,
  isOpen,
  onToggle,
  className,
}) => {
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters)

  const updateFilters = (newFilters: Partial<EventFilters>) => {
    const updated = { ...localFilters, ...newFilters }
    setLocalFilters(updated)
    onFiltersChange(updated)
  }

  const resetFilters = () => {
    setLocalFilters(initialFilters)
    onFiltersChange(initialFilters)
  }

  const toggleCategory = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category]
    updateFilters({ categories: newCategories })
  }

  const toggleStatus = (status: 'upcoming' | 'past' | 'all') => {
    const newStatus = localFilters.status.includes(status)
      ? localFilters.status.filter(s => s !== status)
      : [...localFilters.status, status]
    updateFilters({ status: newStatus.length > 0 ? newStatus : ['all'] })
  }

  const activeFiltersCount = [
    localFilters.search,
    localFilters.categories.length,
    localFilters.location,
    localFilters.dateRange.start || localFilters.dateRange.end,
    localFilters.status.length > 1 || !localFilters.status.includes('all')
  ].filter(Boolean).length

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <FaFilter className="mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={`lg:block ${isOpen ? 'block' : 'hidden'} ${className}`}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-sm"
                  >
                    <FaTimes className="mr-1" />
                    Limpiar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="lg:hidden"
                >
                  <FaTimes />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Search */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Buscar</Label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={localFilters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Categories */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Categorías</Label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={localFilters.categories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary-100"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Rango de Precio (Q)
              </Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={localFilters.priceRange.min}
                    onChange={(e) => updateFilters({
                      priceRange: {
                        ...localFilters.priceRange,
                        min: Number(e.target.value) || 0
                      }
                    })}
                    className="w-24"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={localFilters.priceRange.max}
                    onChange={(e) => updateFilters({
                      priceRange: {
                        ...localFilters.priceRange,
                        max: Number(e.target.value) || maxPrice
                      }
                    })}
                    className="w-24"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={localFilters.priceRange.max}
                  onChange={(e) => updateFilters({
                    priceRange: {
                      ...localFilters.priceRange,
                      max: Number(e.target.value)
                    }
                  })}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Estado</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all' as const, label: 'Todos' },
                  { value: 'upcoming' as const, label: 'Próximos' },
                  { value: 'past' as const, label: 'Pasados' },
                ].map((status) => (
                  <Badge
                    key={status.value}
                    variant={localFilters.status.includes(status.value) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary-100"
                    onClick={() => toggleStatus(status.value)}
                  >
                    {status.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Ubicación</Label>
              <Input
                placeholder="Ciudad, departamento..."
                value={localFilters.location}
                onChange={(e) => updateFilters({ location: e.target.value })}
              />
            </div>

            {/* Date Range - Could be enhanced with date picker */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Rango de Fechas</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={localFilters.dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => updateFilters({
                    dateRange: {
                      ...localFilters.dateRange,
                      start: e.target.value ? new Date(e.target.value) : null
                    }
                  })}
                />
                <Input
                  type="date"
                  value={localFilters.dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => updateFilters({
                    dateRange: {
                      ...localFilters.dateRange,
                      end: e.target.value ? new Date(e.target.value) : null
                    }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export { EventFiltersComponent as EventFilters }