import React, { useState, useMemo } from 'react'
import { FaSearch, FaFilter, FaSort } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EventCard } from './EventCard'
import type { Event, ComponentProps } from '@/types'

interface EventGridProps extends ComponentProps {
  events: Event[]
  loading?: boolean
  onEventClick?: (eventId: string) => void
  onRegister?: (eventId: string) => void
  showFilters?: boolean
  showSearch?: boolean
  itemsPerPage?: number
}

type SortOption = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
type FilterStatus = 'all' | 'upcoming' | 'past' | 'published' | 'draft'

export const EventGrid: React.FC<EventGridProps> = ({
  events,
  loading = false,
  onEventClick,
  onRegister,
  showFilters = true,
  showSearch = true,
  itemsPerPage = 12,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date-asc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      // Search filter
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const now = new Date()
      const eventDate = new Date(event.startDate)
      let matchesStatus = true

      switch (filterStatus) {
        case 'upcoming':
          matchesStatus = eventDate > now
          break
        case 'past':
          matchesStatus = eventDate < now
          break
        case 'published':
          matchesStatus = event.status === 'published'
          break
        case 'draft':
          matchesStatus = event.status === 'draft'
          break
        default:
          matchesStatus = true
      }

      return matchesSearch && matchesStatus
    })

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case 'date-desc':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name-asc':
          return a.title.localeCompare(b.title)
        case 'name-desc':
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    return filtered
  }, [events, searchTerm, sortBy, filterStatus])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage)
  const paginatedEvents = filteredAndSortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              {showSearch && (
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {/* Filters */}
              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Todos los eventos</option>
                    <option value="upcoming">Próximos</option>
                    <option value="past">Pasados</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Borradores</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="date-asc">Fecha ↑</option>
                    <option value="date-desc">Fecha ↓</option>
                    <option value="price-asc">Precio ↑</option>
                    <option value="price-desc">Precio ↓</option>
                    <option value="name-asc">Nombre A-Z</option>
                    <option value="name-desc">Nombre Z-A</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredAndSortedEvents.length} evento{filteredAndSortedEvents.length !== 1 ? 's' : ''} encontrado{filteredAndSortedEvents.length !== 1 ? 's' : ''}
      </div>

      {/* Events Grid */}
      {paginatedEvents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron eventos
            </h3>
            <p className="text-gray-600">
              Intenta ajustar tus filtros de búsqueda o revisa más tarde.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={onEventClick}
                onRegister={onRegister}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                  className="w-10 h-10 p-0"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}