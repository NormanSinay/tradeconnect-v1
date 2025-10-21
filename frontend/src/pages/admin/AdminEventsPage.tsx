import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaTrash, FaEdit, FaEye, FaCopy, FaCog, FaPlay, FaUsers, FaPodcast } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminEventService } from '@/services/admin'
import { formatDateTime, formatEventDate } from '@/utils/date'
import type {
  PublicEvent,
  EventQueryParams,
  EventFilters,
  EventTypeInfo,
  EventCategoryInfo,
  EventStatusInfo,
} from '@/types/admin'

const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<EventFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [eventTypes, setEventTypes] = useState<EventTypeInfo[]>([])
  const [eventCategories, setEventCategories] = useState<EventCategoryInfo[]>([])
  const [eventStatuses, setEventStatuses] = useState<EventStatusInfo[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadEvents()
    loadMetadata()
  }, [currentPage, filters])

  // Cargar eventos
  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: EventQueryParams = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        filters,
      }

      const result = await adminEventService.getEvents(params)
      setEvents(result.events)
      setTotalPages(result.pagination.pages)
      setTotalEvents(result.pagination.total)
    } catch (err) {
      console.error('Error cargando eventos:', err)
      setError('Error al cargar los eventos')
    } finally {
      setLoading(false)
    }
  }

  // Cargar metadatos
  const loadMetadata = async () => {
    try {
      const [types, categories, statuses] = await Promise.all([
        adminEventService.getEventTypes(),
        adminEventService.getEventCategories(),
        adminEventService.getEventStatuses(),
      ])
      setEventTypes(types)
      setEventCategories(categories)
      setEventStatuses(statuses)
    } catch (err) {
      console.error('Error cargando metadatos:', err)
    }
  }

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Manejar filtros
  const handleFilterChange = (newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  // Manejar selección de eventos
  const handleSelectEvent = (eventId: number, checked: boolean) => {
    setSelectedEvents(prev =>
      checked
        ? [...prev, eventId]
        : prev.filter(id => id !== eventId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedEvents(checked ? events.map(e => e.id) : [])
  }

  // Acciones individuales
  const handleViewEvent = (event: PublicEvent) => {
    // TODO: Navigate to event detail
    console.log('View event:', event)
  }

  const handleEditEvent = (event: PublicEvent) => {
    // TODO: Navigate to edit page
    console.log('Edit event:', event)
  }

  const handleDuplicateEvent = (event: PublicEvent) => {
    // TODO: Navigate to duplicate page
    console.log('Duplicate event:', event)
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return

    try {
      await adminEventService.deleteEvent(eventId)
      loadEvents()
    } catch (err) {
      console.error('Error eliminando evento:', err)
      setError('Error al eliminar el evento')
    }
  }

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedEvents.length === 0) return
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedEvents.length} eventos?`)) return

    try {
      await Promise.all(selectedEvents.map(id => adminEventService.deleteEvent(id)))
      setSelectedEvents([])
      loadEvents()
    } catch (err) {
      console.error('Error eliminando eventos:', err)
      setError('Error al eliminar los eventos')
    }
  }

  const handleBulkExport = async () => {
    try {
      const blob = await adminEventService.exportEvents('excel', filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `eventos-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando eventos:', err)
      setError('Error al exportar los eventos')
    }
  }

  // Obtener badge de estado
  const getStatusBadge = (status: EventStatusInfo) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      published: 'default',
      draft: 'secondary',
      cancelled: 'destructive',
      completed: 'outline',
    }
    return variants[status.name] || 'secondary'
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos' },
  ]

  return (
    <AdminLayout title="Gestión de Eventos" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Eventos</h1>
            <p className="text-gray-600">Gestiona todos los eventos del sistema</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={() => {/* TODO: Navigate to create */}}>
              <FaPlus className="mr-2" />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <select
                  value={filters.eventTypeId || ''}
                  onChange={(e) => handleFilterChange({ eventTypeId: e.target.value ? Number(e.target.value) : undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los tipos</option>
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.displayName}</option>
                  ))}
                </select>

                <select
                  value={filters.eventCategoryId || ''}
                  onChange={(e) => handleFilterChange({ eventCategoryId: e.target.value ? Number(e.target.value) : undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todas las categorías</option>
                  {eventCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                  ))}
                </select>

                <select
                  value={filters.eventStatusId || ''}
                  onChange={(e) => handleFilterChange({ eventStatusId: e.target.value ? Number(e.target.value) : undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los estados</option>
                  {eventStatuses.map(status => (
                    <option key={status.id} value={status.id}>{status.displayName}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedEvents.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedEvents.length} evento{selectedEvents.length > 1 ? 's' : ''} seleccionado{selectedEvents.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <FaDownload className="mr-2" />
                    Exportar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <FaTrash className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de eventos */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center">
                <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron eventos
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay eventos registrados.'}
                </p>
                <Button onClick={() => {/* TODO: Navigate to create */}}>
                  <FaPlus className="mr-2" />
                  Crear primer evento
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedEvents.length === events.length && events.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Inscritos</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={(checked) => handleSelectEvent(event.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {event.location || event.virtualLocation}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.eventType.displayName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.eventCategory.displayName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatEventDate(event.startDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(event.startDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(event.eventStatus)}>
                          {event.eventStatus.displayName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{event.registeredCount}</span>
                        {event.capacity && (
                          <span className="text-sm text-gray-500">/{event.capacity}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {event.currency} {event.price.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FaCog className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateEvent(event)}>
                              <FaCopy className="mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {/* TODO: Navigate to config */}}>
                              <FaCog className="mr-2" />
                              Configuración
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {/* TODO: Navigate to publish */}}>
                              <FaPlay className="mr-2" />
                              Publicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {/* TODO: Navigate to participants */}}>
                              <FaUsers className="mr-2" />
                              Participantes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {/* TODO: Navigate to streaming */}}>
                              <FaPodcast className="mr-2" />
                              Transmisión
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600"
                            >
                              <FaTrash className="mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalEvents)} de {totalEvents} eventos
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTrash className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminEventsPage