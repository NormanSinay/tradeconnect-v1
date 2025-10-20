/**
 * @fileoverview EventSortOptions - Opciones de ordenamiento para eventos
 * @description Componente React que proporciona controles para ordenar eventos por diferentes criterios.
 * Incluye selección de campo de ordenamiento y dirección (ascendente/descendente).
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
 * - Lucide Icons: Iconografía moderna y consistente (ArrowUpDown, ArrowUp, ArrowDown, List, Grid3X3)
 *
 * Características:
 * - Selección de campo de ordenamiento
 * - Controles de dirección ascendente/descendente
 * - Vista previa de opciones de vista (deshabilitadas)
 * - Diseño responsivo con flexbox
 * - Compatibilidad completa con SSR de Astro
 *
 * @version 1.0.0
 * @since 2024
 * @author TradeConnect Team
 */

import React from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  List,
  Grid3X3,
} from 'lucide-react';
import type { EventSortOptionsProps } from '@/types/event.types';
import { cn } from '@/lib/utils';

const EventSortOptions: React.FC<EventSortOptionsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const handleSortByChange = (event: any) => {
    onSortChange(event.target.value, sortOrder);
  };

  const handleSortOrderChange = (_event: React.MouseEvent<HTMLElement>, newOrder: string | null) => {
    if (newOrder) {
      onSortChange(sortBy, newOrder as 'asc' | 'desc');
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap mb-6">
      {/* Sort By */}
      <div className="min-w-[150px]">
        <Select value={sortBy} onChange={(e) => onSortChange(e.target.value as any, sortOrder)}>
          <option value="relevance">Relevancia</option>
          <option value="date">Fecha</option>
          <option value="price">Precio</option>
          <option value="popularity">Popularidad</option>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="flex gap-1">
        <Button
          variant={sortOrder === 'asc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSortChange(sortBy, 'asc')}
        >
          <ArrowUp className="h-4 w-4 mr-1" />
          Asc
        </Button>
        <Button
          variant={sortOrder === 'desc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSortChange(sortBy, 'desc')}
        >
          <ArrowDown className="h-4 w-4 mr-1" />
          Desc
        </Button>
      </div>

      {/* View Toggle (for future use) */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-muted-foreground">
          Vista:
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventSortOptions;