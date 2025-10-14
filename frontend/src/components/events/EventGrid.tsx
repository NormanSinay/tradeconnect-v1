import React from 'react';
import { Box, Typography, Skeleton, Button } from '@mui/material';
import EventCard from './EventCard';
import type { EventGridViewProps } from '@/types/event.types';

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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (events.length === 0 && !loading) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          No se encontraron eventos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Intenta ajustar los filtros de búsqueda para encontrar más eventos.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
          gap: 3,
        }}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onViewDetails={onEventClick}
          />
        ))}
      </Box>

      {/* Load More Button */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            onClick={onLoadMore}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            {loading ? 'Cargando...' : 'Cargar más eventos'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EventGrid;