/**
 * @fileoverview EventsTable - Tabla de gestión de eventos administrativos
 *
 * Arquitectura Recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @version 1.0.0
 * @author TradeConnect Team
 * @license MIT
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Upload,
  Copy,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Event {
  id: string | number;
  title: string;
  date: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registrations: number;
  capacity: number;
  price: number;
  category: string;
  image?: string;
}

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string | number) => void;
  onView: (event: Event) => void;
  onPublish: (eventId: string | number) => void;
  onDuplicate: (eventId: string | number) => void;
  onCreate: () => void;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof Event;

const EventsTable: React.FC<EventsTableProps> = ({
  events,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onPublish,
  onDuplicate,
  onCreate,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<(string | number)[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('date');

  // Handle sorting
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort data
  const sortedEvents = React.useMemo(() => {
    const comparator = (a: Event, b: Event) => {
      if (orderBy === 'date') {
        return order === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (orderBy === 'registrations' || orderBy === 'capacity' || orderBy === 'price') {
        return order === 'asc'
          ? Number(a[orderBy]) - Number(b[orderBy])
          : Number(b[orderBy]) - Number(a[orderBy]);
      }
      const aValue = String(a[orderBy]).toLowerCase();
      const bValue = String(b[orderBy]).toLowerCase();
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    };

    return [...events].sort(comparator);
  }, [events, order, orderBy]);

  // Filter events by search query
  const filteredEvents = sortedEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const paginatedEvents = filteredEvents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedEvents(paginatedEvents.map((e) => e.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleSelectOne = (eventId: string | number) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventData: Event) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventData);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedEvent) {
      onDelete(selectedEvent.id);
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Event['status']) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  return (
    <div className="w-full overflow-hidden shadow-lg bg-card rounded-lg">
      {/* Toolbar */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        selectedEvents.length > 0 && "bg-primary/10"
      )}>
        {selectedEvents.length > 0 ? (
          <div className="flex-1 text-sm font-medium">
            {selectedEvents.length} seleccionado(s)
          </div>
        ) : (
          <div className="flex-1 flex gap-2 items-center">
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        )}

        {selectedEvents.length > 0 ? (
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar seleccionados
          </Button>
        ) : (
          <Button onClick={onCreate} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginatedEvents.length > 0 && selectedEvents.length === paginatedEvents.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Seleccionar todos"
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleRequestSort('title')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Título
                  {orderBy === 'title' && (
                    <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleRequestSort('date')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Fecha
                  {orderBy === 'date' && (
                    <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleRequestSort('status')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Estado
                  {orderBy === 'status' && (
                    <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleRequestSort('registrations')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Inscripciones
                  {orderBy === 'registrations' && (
                    <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleRequestSort('capacity')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Capacidad
                  {orderBy === 'capacity' && (
                    <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleRequestSort('price')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Precio
                  {orderBy === 'price' && (
                    <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.map((event) => {
              const isSelected = selectedEvents.includes(event.id);
              const capacityPercent = (event.registrations / event.capacity) * 100;

              return (
                <TableRow key={event.id} className={cn(isSelected && "bg-muted/50")}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectOne(event.id)}
                      aria-label={`Seleccionar ${event.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">{event.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(event.date), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(event.status) as any}>
                      {getStatusLabel(event.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div>
                      <div className="text-sm">
                        {event.registrations} / {event.capacity}
                      </div>
                      <div className={cn(
                        "text-xs",
                        capacityPercent >= 90 ? "text-destructive" :
                        capacityPercent >= 70 ? "text-yellow-600" : "text-green-600"
                      )}>
                        {capacityPercent.toFixed(0)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{event.capacity}</TableCell>
                  <TableCell className="text-right">
                    {event.price === 0 ? (
                      <Badge variant="secondary">Gratis</Badge>
                    ) : (
                      `Q${event.price.toLocaleString('es-GT')}`
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(event)}
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(event)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" title="Más acciones">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onPublish(event.id)}>
                            {event.status === 'published' ? 'Despublicar' : 'Publicar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(event.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(event)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Mostrando {page * rowsPerPage + 1} a {Math.min((page + 1) * rowsPerPage, filteredEvents.length)} de {filteredEvents.length} eventos
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Filas por página:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => handleChangeRowsPerPage({ target: { value: e.target.value } } as any)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page >= Math.ceil(filteredEvents.length / rowsPerPage) - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar el evento "{selectedEvent?.title}"? Esta acción no
              se puede deshacer.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsTable;
