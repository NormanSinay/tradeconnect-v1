import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  X,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { es } from 'date-fns/locale';
import type { EventFilters as EventFiltersType, EventCategory, EventType } from '@/types/event.types';
import { cn } from '@/lib/utils';

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
  categories: EventCategory[];
  types: EventType[];
  loading?: boolean;
}

const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  types,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin || 0,
    filters.priceMax || 1000,
  ]);
  const [dateFrom, setDateFrom] = useState<Date | null>(
    filters.dateFrom ? new Date(filters.dateFrom) : null
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    filters.dateTo ? new Date(filters.dateTo) : null
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({ ...filters, search: searchTerm || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters, onFiltersChange]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.category ? filters.category.split(',') : [];
    let newCategories: string[];

    if (checked) {
      newCategories = [...currentCategories, categoryId];
    } else {
      newCategories = currentCategories.filter(id => id !== categoryId);
    }

    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories.join(',') : ('' as any),
    });
  };

  const handleTypeChange = (typeSlug: string, checked: boolean) => {
    const currentTypes = filters.type ? filters.type.split(',') : [];
    let newTypes: string[];

    if (checked) {
      newTypes = [...currentTypes, typeSlug];
    } else {
      newTypes = currentTypes.filter(slug => slug !== typeSlug);
    }

    onFiltersChange({
      ...filters,
      type: newTypes.length > 0 ? newTypes.join(',') : undefined,
    });
  };

  const handleModalityChange = (modality: 'presencial' | 'virtual' | 'hibrido') => {
    onFiltersChange({
      ...filters,
      modality: filters.modality === modality ? undefined : modality,
    });
  };

  const handlePriceRangeChange = (newValue: number[]) => {
    const [min, max] = newValue as [number, number];
    setPriceRange([min, max]);
  };

  const handlePriceRangeCommit = (newValue: number[]) => {
    const [min, max] = newValue as [number, number];
    onFiltersChange({
      ...filters,
      priceMin: min > 0 ? min : undefined,
      priceMax: max < 1000 ? max : undefined,
    });
  };

  const handleDateFromChange = (date: Date | null) => {
    setDateFrom(date);
    onFiltersChange({
      ...filters,
      dateFrom: date ? date.toISOString().split('T')[0] : undefined,
    });
  };

  const handleDateToChange = (date: Date | null) => {
    setDateTo(date);
    onFiltersChange({
      ...filters,
      dateTo: date ? date.toISOString().split('T')[0] : undefined,
    });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      location: event.target.value || undefined,
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 1000]);
    setDateFrom(null);
    setDateTo(null);
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.modality) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.location) count++;
    if (filters.featured) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="p-4 mb-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
            disabled={loading}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            Filtros activos ({activeFiltersCount}):
          </h3>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFiltersChange({ ...filters, search: undefined })}>
                Búsqueda: {filters.search}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFiltersChange({ ...filters, category: undefined })}>
                Categoría: {filters.category}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {filters.modality && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFiltersChange({ ...filters, modality: undefined })}>
                Modalidad: {filters.modality}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFiltersChange({ ...filters, priceMin: undefined, priceMax: undefined })}>
                Precio: Q{filters.priceMin || 0} - Q{filters.priceMax || 1000}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFiltersChange({ ...filters, location: undefined })}>
                Ubicación: {filters.location}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="ml-auto"
              disabled={loading}
            >
              Limpiar todos
            </Button>
          </div>
        </div>
      )}

      {/* Filters Accordion */}
      <Accordion type="single" collapsible defaultValue="filters">
        <AccordionItem value="filters">
          <AccordionTrigger className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filtros avanzados</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-6">
              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Categorías
                </Label>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.category?.split(',').includes(category.id) || false}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Types */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Tipos de Evento
                </Label>
                <div className="flex flex-wrap gap-3">
                  {types.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.id}`}
                        checked={filters.type?.split(',').includes(type.slug) || false}
                        onCheckedChange={(checked) => handleTypeChange(type.slug, checked as boolean)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`type-${type.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modality */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Modalidad
                </Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'presencial', label: 'Presencial' },
                    { value: 'virtual', label: 'Virtual' },
                    { value: 'hibrido', label: 'Híbrido' },
                  ].map((modality) => (
                    <div key={modality.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modality-${modality.value}`}
                        checked={filters.modality === modality.value}
                        onCheckedChange={() => handleModalityChange(modality.value as any)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`modality-${modality.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {modality.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium mb-4 block">
                  Rango de Precio (Q)
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value as [number, number]);
                    handlePriceRangeChange(value);
                  }}
                  onValueCommit={(value) => handlePriceRangeCommit(value)}
                  min={0}
                  max={1000}
                  step={50}
                  disabled={loading}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Q{priceRange[0]}</span>
                  <span>Q{priceRange[1]}</span>
                </div>
              </div>

              {/* Dates - Temporarily disabled */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-from" className="text-sm font-medium mb-2 block">
                    Fecha desde
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="date-from"
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => handleDateFromChange(e.target.value ? new Date(e.target.value) : null)}
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-sm font-medium mb-2 block">
                    Fecha hasta
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="date-to"
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => handleDateToChange(e.target.value ? new Date(e.target.value) : null)}
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-sm font-medium mb-2 block">
                  Ubicación
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="location"
                    value={filters.location || ''}
                    onChange={handleLocationChange}
                    disabled={loading}
                    className="pl-10"
                    placeholder="Buscar por ubicación..."
                  />
                </div>
              </div>

              {/* Featured Events */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={filters.featured || false}
                  onCheckedChange={(checked) => onFiltersChange({ ...filters, featured: checked || undefined })}
                  disabled={loading}
                />
                <Label
                  htmlFor="featured"
                  className="text-sm font-normal cursor-pointer"
                >
                  Solo eventos destacados
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {loading && (
        <div className="flex justify-center mt-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </Card>
  );
};

export default EventFilters;