import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EventCard from './EventCard';
import type { EventGridViewProps } from '@/types/event.types';
import { cn } from '@/lib/utils';

const EventGrid: React.FC<EventGridViewProps> = ({
  events,
  loading = false,
  onEventClick,
  onLoadMore,
  hasMore = false,
  columns = 3,
}) => {
  const getColumns = () => {
    if (typeof columns === 'number') {
      return columns;
    }
    return 3;
  };
  if (loading && events.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-80 sm:h-96 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0 && !loading) {
    return (
      <div className="text-center py-12 px-4">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No se encontraron eventos
        </h3>
        <p className="text-sm text-muted-foreground">
          Intenta ajustar los filtros de búsqueda para encontrar más eventos.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          'grid gap-6',
          getColumns() === 1 && 'grid-cols-1',
          getColumns() === 2 && 'grid-cols-1 md:grid-cols-2',
          getColumns() === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          getColumns() === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          getColumns() === 5 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
        )}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onViewDetails={onEventClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 text-base font-medium"
          >
            {loading ? 'Cargando...' : 'Cargar más eventos'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventGrid;