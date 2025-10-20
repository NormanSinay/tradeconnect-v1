/**
 * @fileoverview Events Page component for TradeConnect Frontend
 * @description

Arquitectura recomendada si migras:
  React (componentes interactivos)
    ↓
  Astro (routing y SSR)
    ↓
  shadcn/ui (componentes UI)
    ↓
  Tailwind CSS (estilos)
    ↓
  Radix UI (primitivos accesibles)
    ↓
  React Icons (iconos)

 * @architecture
 * - React: Componentes interactivos con hooks y context
 * - Astro: Routing y Server-Side Rendering (SSR)
 * - shadcn/ui: Componentes UI preconstruidos
 * - Tailwind CSS: Sistema de estilos utilitarios
 * - Radix UI: Primitivos accesibles para componentes
 * - React Icons: Biblioteca de iconos
 *
 * @compatibility SSR: Compatible con Astro SSR
 * @compatibility React: Compatible con React 18+
 * @compatibility TypeScript: Tipos completos incluidos
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Inicio
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="ml-1 text-sm font-medium text-foreground md:ml-2">Eventos</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Catálogo de Eventos
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-2">
            Descubre eventos empresariales y cursos de formación
          </p>
          {eventsData && (
            <p className="text-sm text-muted-foreground hidden sm:block">
              {eventsData.total} eventos encontrados
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 order-2 md:order-1">
            <EventFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              types={types}
              loading={eventsLoading}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 order-1 md:order-2">
            {/* Sort Options */}
            <EventSortOptions
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />

            {/* Error State */}
            {eventsError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Error al cargar los eventos. Por favor, intenta de nuevo.
                </AlertDescription>
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
              <div className="flex justify-center mt-8 px-4 sm:px-0">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(null as any, 1)}
                    disabled={currentPage === 1}
                  >
                    Primera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(null as any, currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {paginationInfo.currentPage} de {paginationInfo.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(null as any, currentPage + 1)}
                    disabled={currentPage === paginationInfo.totalPages}
                  >
                    Siguiente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(null as any, paginationInfo.totalPages)}
                    disabled={currentPage === paginationInfo.totalPages}
                  >
                    Última
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {eventsLoading && events.length === 0 && (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty State */}
            {!eventsLoading && events.length === 0 && !eventsError && (
              <div className="text-center py-16 px-4">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No se encontraron eventos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda o verifica que los criterios sean correctos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;