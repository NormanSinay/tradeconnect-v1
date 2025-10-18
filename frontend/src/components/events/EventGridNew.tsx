import React from 'react';
import EventCardNew from './EventCardNew';
import type { EventGridViewProps } from '@/types/event.types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * EventGridNew - Grid responsivo para mostrar eventos
 * Migrado de MUI a Tailwind CSS + shadcn/ui
 */
const EventGridNew: React.FC<EventGridViewProps> = ({
  events,
  loading = false,
  onEventClick,
  onLoadMore,
  hasMore = false,
  columns = 3,
}) => {
  const getGridCols = () => {
    if (typeof columns === 'number') {
      // Dynamic grid based on columns prop
      return {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      }[columns] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  };

  // Loading Skeletons
  if (loading && events.length === 0) {
    return (
      <div className={`grid ${getGridCols()} gap-4 sm:gap-5 md:gap-6`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-[350px] sm:h-[380px] md:h-[400px] rounded-lg"
          />
        ))}
      </div>
    );
  }

  // Empty State
  if (events.length === 0 && !loading) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">
          No se encontraron eventos
        </h3>
        <p className="text-sm text-gray-500">
          Intenta ajustar los filtros de búsqueda para encontrar más eventos.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Events Grid */}
      <div className={`grid ${getGridCols()} gap-6`}>
        {events.map((event) => (
          <EventCardNew
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
            variant="default"
            size="lg"
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-6 text-base rounded-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Cargando más...
              </>
            ) : (
              'Cargar más eventos'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventGridNew;
