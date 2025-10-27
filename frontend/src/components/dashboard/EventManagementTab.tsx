import React, { useState, useEffect } from 'react';
import { DashboardService, Event } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, BarChart3, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventManagementTabProps {
  activeTab: string;
}

const EventManagementTab: React.FC<EventManagementTabProps> = ({ activeTab }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'eventos') {
      loadEvents();
    }
  }, [activeTab, currentPage, statusFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const result = await DashboardService.getEvents(params);
      setEvents(result.events);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadEvents();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'published': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  if (activeTab !== 'eventos') return null;

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar evento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Tabla de eventos */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Organizador</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Inscritos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando eventos...
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No se encontraron eventos
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">
                        {event.organizer || 'Sin organizador'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{event.organizer || 'N/A'}</TableCell>
                  <TableCell>{formatDate(event.startDate)}</TableCell>
                  <TableCell>{event.registrations || 0}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {event.status === 'published' ? 'Publicado' :
                       event.status === 'active' ? 'Activo' :
                       event.status === 'completed' ? 'Completado' :
                       event.status === 'cancelled' ? 'Cancelado' :
                       event.status === 'draft' ? 'Borrador' : event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(event.revenue || 0)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="px-4 py-2 text-sm">
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
      )}
    </div>
  );
};

export default EventManagementTab;