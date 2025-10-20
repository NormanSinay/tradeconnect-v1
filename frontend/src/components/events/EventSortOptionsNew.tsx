/**
 * @fileoverview EventSortOptionsNew - Opciones de ordenamiento mejoradas para eventos
 * @description Componente React que proporciona controles mejorados para ordenar eventos.
 * Incluye selector moderno y toggle de dirección con mejor UX.
 *
 * Arquitectura:
 * - React: Componentes funcionales con props tipadas
 *   ↓
 * - Astro: Routing y SSR - Compatible con hidratación del lado cliente
 *   ↓
 * - shadcn/ui: Componentes UI preconstruidos (Select, Button)
 *   ↓
 * - Tailwind CSS: Estilos utilitarios para diseño responsivo y moderno
 *   ↓
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 *   ↓
 * - Lucide Icons: Iconografía moderna y consistente (ArrowUp, ArrowDown, List, Grid3X3)
 *
 * Mejoras sobre EventSortOptions:
 * - Selector shadcn/ui moderno
 * - Toggle de dirección más intuitivo
 * - Mejor organización visual
 * - Estados deshabilitados para futuras vistas
 * - Compatibilidad completa con SSR de Astro
 *
 * @version 1.1.0
 * @since 2024
 * @author TradeConnect Team
 */

import React from 'react';
import { ArrowUp, ArrowDown, List, Grid3X3 } from 'lucide-react';
import type { EventSortOptionsProps } from '@/types/event.types';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
const EventSortOptionsNew: React.FC<EventSortOptionsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const handleSortByChange = (value: string) => {
    onSortChange(value as 'relevance' | 'date' | 'price' | 'popularity', sortOrder);
  };

  const handleSortOrderToggle = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex items-center gap-3 flex-wrap mb-6">
      {/* Sort By Select */}
      <div className="flex items-center gap-2">
        <ArrowUp className="h-4 w-4 text-gray-500" />
        <Select value={sortBy} onChange={(e) => handleSortByChange(e.target.value)}>
          <option value="relevance">Relevancia</option>
          <option value="date">Fecha</option>
          <option value="price">Precio</option>
          <option value="popularity">Popularidad</option>
        </Select>
      </div>

      {/* Sort Order Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSortOrderToggle}
        className="gap-2"
      >
        {sortOrder === 'asc' ? (
          <>
            <ArrowUp className="h-4 w-4" />
            Ascendente
          </>
        ) : (
          <>
            <ArrowDown className="h-4 w-4" />
            Descendente
          </>
        )}
      </Button>

      {/* View Toggle (for future use) */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-gray-600">Vista:</span>
        <div className="flex border border-gray-300 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-r-none"
            disabled
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-l-none bg-gray-100"
            disabled
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventSortOptionsNew;
