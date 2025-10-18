import React from 'react';
import { FaSort, FaArrowUp, FaArrowDown, FaThLarge, FaList } from 'react-icons/fa';
import type { EventSortOptionsProps } from '@/types/event.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

/**
 * EventSortOptionsNew - Opciones de ordenamiento de eventos
 * Migrado de MUI a Tailwind CSS + shadcn/ui
 */
const EventSortOptionsNew: React.FC<EventSortOptionsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const handleSortByChange = (value: string) => {
    onSortChange(value, sortOrder);
  };

  const handleSortOrderToggle = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex items-center gap-3 flex-wrap mb-6">
      {/* Sort By Select */}
      <div className="flex items-center gap-2">
        <FaSort className="h-4 w-4 text-gray-500" />
        <Select value={sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevancia</SelectItem>
            <SelectItem value="date">Fecha</SelectItem>
            <SelectItem value="price">Precio</SelectItem>
            <SelectItem value="popularity">Popularidad</SelectItem>
          </SelectContent>
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
            <FaArrowUp className="h-4 w-4" />
            Ascendente
          </>
        ) : (
          <>
            <FaArrowDown className="h-4 w-4" />
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
            <FaList className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-l-none bg-gray-100"
            disabled
          >
            <FaThLarge className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventSortOptionsNew;
