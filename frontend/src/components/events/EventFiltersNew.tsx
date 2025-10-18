import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaTimes,
  FaFilter,
  FaMapMarkerAlt,
  FaCalendar,
  FaDollarSign,
} from 'react-icons/fa';
import type {
  EventFilters as EventFiltersType,
  EventCategory,
  EventType,
} from '@/types/event.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
  categories: EventCategory[];
  types: EventType[];
  loading?: boolean;
}

/**
 * EventFiltersNew - Panel de filtros para eventos
 * Migrado de MUI a Tailwind CSS + shadcn/ui
 */
const EventFiltersNew: React.FC<EventFiltersProps> = ({
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({ ...filters, search: searchTerm || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.category
      ? filters.category.split(',')
      : [];
    let newCategories: string[];

    if (checked) {
      newCategories = [...currentCategories, categoryId];
    } else {
      newCategories = currentCategories.filter((id) => id !== categoryId);
    }

    onFiltersChange({
      ...filters,
      category:
        newCategories.length > 0 ? newCategories.join(',') : ('' as any),
    });
  };

  const handleTypeChange = (typeSlug: string, checked: boolean) => {
    const currentTypes = filters.type ? filters.type.split(',') : [];
    let newTypes: string[];

    if (checked) {
      newTypes = [...currentTypes, typeSlug];
    } else {
      newTypes = currentTypes.filter((slug) => slug !== typeSlug);
    }

    onFiltersChange({
      ...filters,
      type: newTypes.length > 0 ? newTypes.join(',') : undefined,
    });
  };

  const handleModalityChange = (
    modality: 'presencial' | 'virtual' | 'hibrido'
  ) => {
    onFiltersChange({
      ...filters,
      modality: filters.modality === modality ? undefined : modality,
    });
  };

  const handlePriceRangeChange = (newValue: number[]) => {
    setPriceRange([newValue[0], newValue[1]]);
  };

  const handlePriceRangeCommit = (newValue: number[]) => {
    const [min, max] = newValue;
    onFiltersChange({
      ...filters,
      priceMin: min > 0 ? min : undefined,
      priceMax: max < 1000 ? max : undefined,
    });
  };

  const handleLocationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFiltersChange({
      ...filters,
      location: event.target.value || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 1000]);
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count += filters.category.split(',').length;
    if (filters.type) count += filters.type.split(',').length;
    if (filters.modality) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.location) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="h-full sticky top-20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaFilter className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2 text-sm"
            >
              <FaTimes className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="search"
              type="search"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {/* Accordion Filters */}
        <Accordion type="multiple" defaultValue={['categories', 'modality', 'price']} className="w-full">
          {/* Categories */}
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm font-semibold">
              Categorías
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {categories.map((category) => {
                  const isChecked = filters.category
                    ?.split(',')
                    .includes(category.id);
                  return (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category.id, checked as boolean)
                        }
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-normal cursor-pointer flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Types */}
          {types.length > 0 && (
            <AccordionItem value="types">
              <AccordionTrigger className="text-sm font-semibold">
                Tipos
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {types.map((type) => {
                    const isChecked = filters.type?.split(',').includes(type.slug);
                    return (
                      <div
                        key={type.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`type-${type.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleTypeChange(type.slug, checked as boolean)
                          }
                          disabled={loading}
                        />
                        <Label
                          htmlFor={`type-${type.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {type.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Modality */}
          <AccordionItem value="modality">
            <AccordionTrigger className="text-sm font-semibold">
              Modalidad
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {[
                  { value: 'presencial', label: 'Presencial', emoji: '🏢' },
                  { value: 'virtual', label: 'Virtual', emoji: '💻' },
                  { value: 'hibrido', label: 'Híbrido', emoji: '🔄' },
                ].map((modality) => (
                  <Button
                    key={modality.value}
                    variant={
                      filters.modality === modality.value
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() =>
                      handleModalityChange(
                        modality.value as 'presencial' | 'virtual' | 'hibrido'
                      )
                    }
                    disabled={loading}
                  >
                    <span>{modality.emoji}</span>
                    {modality.label}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-sm font-semibold">
              Rango de Precio
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaDollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    Q{priceRange[0]} - Q{priceRange[1]}
                    {priceRange[1] === 1000 && '+'}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  onValueCommit={handlePriceRangeCommit}
                  disabled={loading}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Q0</span>
                  <span>Q1000+</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Location */}
          <AccordionItem value="location">
            <AccordionTrigger className="text-sm font-semibold">
              Ubicación
            </AccordionTrigger>
            <AccordionContent>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Ciudad, departamento..."
                  value={filters.location || ''}
                  onChange={handleLocationChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default EventFiltersNew;
