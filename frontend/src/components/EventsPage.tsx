import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { NavigateNext } from '@mui/icons-material';

// Components
import EventFilters from '@/components/events/EventFilters';
import EventGrid from '@/components/events/EventGrid';
import EventSortOptions from '@/components/events/EventSortOptions';

// Services and Types
import { eventsService } from '@/services/eventsService';
import type { Event, EventFilters as EventFiltersType, EventCategory, EventType } from '@/types/event.types';

const EventsPage: React.FC = () => {
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<EventFiltersType['sortBy']>('relevance');
  const [sortOrder, setSortOrder] = useState<EventFiltersType['sortOrder']>('desc');

  // Fetch events with current filters
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['events', filters, currentPage, sortBy, sortOrder],
    queryFn: () =>
      eventsService.searchEvents(
        { ...filters, sortBy, sortOrder },
        currentPage,
        20
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories and types for filters
  const { data: categories = [] } = useQuery({
    queryKey: ['event-categories'],
    queryFn: () => eventsService.getEventCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: types = [] } = useQuery({
    queryKey: ['event-types'],
    queryFn: () => eventsService.getEventTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle filter changes
  const handleFiltersChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort changes
  const handleSortChange = (
    newSortBy: EventFiltersType['sortBy'],
    newSortOrder: EventFiltersType['sortOrder']
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle event click
  const handleEventClick = (eventId: string) => {
    // Navigate to event detail page
    window.location.href = `/events/${eventId}`;
  };

  // Handle load more (for infinite scroll alternative)
  const handleLoadMore = () => {
    if (eventsData && currentPage < eventsData.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Memoized events list
  const events = useMemo(() => {
    return eventsData?.events || [];
  }, [eventsData]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    if (!eventsData) return null;
    return {
      currentPage: eventsData.page,
      totalPages: eventsData.totalPages,
      totalItems: eventsData.total,
      itemsPerPage: 20,
    };
  }, [eventsData]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <MuiLink component={Link} to="/" color="inherit">
            Inicio
          </MuiLink>
          <Typography color="text.primary">Eventos</Typography>
        </Breadcrumbs>
      </Container>

      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          py: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              color: 'text.primary',
              fontSize: { xs: '1.8rem', md: '2.125rem' },
            }}
          >
            Catálogo de Eventos
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 1,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Descubre eventos empresariales y cursos de formación
          </Typography>
          {eventsData && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {eventsData.total} eventos encontrados
            </Typography>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{
          display: 'flex',
          gap: { xs: 2, md: 4 },
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Filters Sidebar */}
          <Box sx={{
            width: { xs: '100%', md: 300 },
            flexShrink: 0,
            order: { xs: 2, md: 1 }
          }}>
            <EventFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              types={types}
              loading={eventsLoading}
            />
          </Box>

          {/* Main Content */}
          <Box sx={{
            flex: 1,
            order: { xs: 1, md: 2 }
          }}>
            {/* Sort Options */}
            <EventSortOptions
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />

            {/* Error State */}
            {eventsError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Error al cargar los eventos. Por favor, intenta de nuevo.
              </Alert>
            )}

            {/* Events Grid */}
            <EventGrid
              events={events}
              loading={eventsLoading}
              onEventClick={handleEventClick}
              onLoadMore={handleLoadMore}
              hasMore={paginationInfo ? currentPage < paginationInfo.totalPages : false}
            />

            {/* Pagination */}
            {paginationInfo && paginationInfo.totalPages > 1 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
                px: { xs: 2, sm: 0 }
              }}>
                <Pagination
                  count={paginationInfo.totalPages}
                  page={paginationInfo.currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                  boundaryCount={1}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                  }}
                />
              </Box>
            )}

            {/* Loading State */}
            {eventsLoading && events.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Empty State */}
            {!eventsLoading && events.length === 0 && !eventsError && (
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
                  Intenta ajustar los filtros de búsqueda o verifica que los criterios sean correctos.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default EventsPage;