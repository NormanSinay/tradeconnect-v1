import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'
import SearchForm from '@/components/ui/search-form'
import EventGrid from '@/components/ui/event-grid'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/uiStore'
import { Event } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { FaFilter, FaSort, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'

const EventsPage: React.FC = () => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [modalityFilter, setModalityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const { searchQuery, selectedCategory } = useUIStore()

  // Build query parameters for API call
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      limit: '100',
      sortBy,
      sortOrder
    })

    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim())
    }

    if (selectedCategory !== 'Todos') {
      params.append('category', selectedCategory)
    }

    if (modalityFilter !== 'all') {
      params.append('modality', modalityFilter)
    }

    if (typeFilter !== 'all') {
      params.append('eventType', typeFilter)
    }

    return params.toString()
  }, [searchQuery, selectedCategory, sortBy, sortOrder, modalityFilter, typeFilter])

  // Fetch events with filters from backend API
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ['events', queryParams],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/public/events?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const result = await response.json()
      return result.data || { events: [], total: 0, pagination: {} }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Update filtered events when data changes
  useEffect(() => {
    if (eventsData?.events) {
      setFilteredEvents(eventsData.events)
    }
  }, [eventsData])

  const handleSearch = (_query: string) => {
    // Search is handled by query parameters and useEffect
  }

  const handleCategoryFilter = (category: string) => {
    useUIStore.getState().setSelectedCategory(category)
  }

  // Fetch categories from backend
  const { data: categoriesData } = useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/public/events/categories`)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const result = await response.json()
      return result.data || []
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Fetch event types from backend - Note: This endpoint doesn't exist yet
  // For now, we'll use static data
  const eventTypesData = [
    { id: 1, name: 'conferencia' },
    { id: 2, name: 'taller' },
    { id: 3, name: 'networking' },
    { id: 4, name: 'seminario' },
    { id: 5, name: 'curso' }
  ]

  const categories = ['Todos', ...(categoriesData?.map((cat: any) => cat.name) || [])]
  const eventTypes = ['all', ...(eventTypesData?.map((type: any) => type.name) || [])]
  const modalities = [
    { value: 'all', label: 'Todas las modalidades' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hibrido', label: 'Híbrido' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Eventos y Cursos
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora nuestra amplia gama de eventos empresariales y cursos especializados para tu crecimiento profesional
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-8">
            <SearchForm onSearch={handleSearch} />
          </div>

          {/* Advanced Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <FaFilter className="text-[#6B1E22]" />
              <span className="font-semibold text-gray-900">Filtros Avanzados</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {eventTypesData?.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modality Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
                <Select value={modalityFilter} onValueChange={setModalityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modalities.map((modality) => (
                      <SelectItem key={modality.value} value={modality.value}>
                        {modality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-')
                  setSortBy(field)
                  setSortOrder(order as 'ASC' | 'DESC')
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-DESC">Más recientes</SelectItem>
                    <SelectItem value="createdAt-ASC">Más antiguos</SelectItem>
                    <SelectItem value="title-ASC">Nombre A-Z</SelectItem>
                    <SelectItem value="title-DESC">Nombre Z-A</SelectItem>
                    <SelectItem value="price-ASC">Precio menor a mayor</SelectItem>
                    <SelectItem value="price-DESC">Precio mayor a menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategory !== 'Todos' && (
                <Badge variant="secondary" className="bg-[#6B1E22] text-white">
                  Categoría: {selectedCategory}
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="bg-[#2c5aa0] text-white">
                  Tipo: {typeFilter}
                </Badge>
              )}
              {modalityFilter !== 'all' && (
                <Badge variant="secondary" className="bg-[#28a745] text-white">
                  Modalidad: {modalities.find(m => m.value === modalityFilter)?.label}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="bg-gray-600 text-white">
                  Búsqueda: "{searchQuery}"
                </Badge>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-gray-600">
              {eventsLoading ? (
                'Cargando eventos...'
              ) : (
                <>
                  <span className="font-semibold text-gray-900">{filteredEvents.length}</span> eventos encontrados
                  {eventsData?.total && eventsData.total > filteredEvents.length && (
                    <span className="text-sm text-gray-500 ml-2">
                      (de {eventsData.total} total)
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Sort Icon */}
            <div className="flex items-center gap-2 text-gray-500">
              <FaSort size={14} />
              <span className="text-sm">
                {sortBy === 'createdAt' && sortOrder === 'DESC' && 'Más recientes'}
                {sortBy === 'createdAt' && sortOrder === 'ASC' && 'Más antiguos'}
                {sortBy === 'title' && sortOrder === 'ASC' && 'A-Z'}
                {sortBy === 'title' && sortOrder === 'DESC' && 'Z-A'}
                {sortBy === 'price' && sortOrder === 'ASC' && 'Precio ↑'}
                {sortBy === 'price' && sortOrder === 'DESC' && 'Precio ↓'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {eventsError ? (
            <div className="text-center py-16">
              <div className="text-red-500 mb-4">
                <FaCalendarAlt size={48} className="mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error al cargar eventos
              </h3>
              <p className="text-gray-500">
                No se pudieron cargar los eventos. Por favor, intenta de nuevo más tarde.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <EventGrid events={filteredEvents} loading={eventsLoading && filteredEvents.length === 0} />
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default EventsPage