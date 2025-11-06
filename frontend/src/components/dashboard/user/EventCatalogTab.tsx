import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { UserDashboardService, UserEvent } from '@/services/userDashboardService';
import EventGrid from '@/components/ui/event-grid';

interface EventCatalogTabProps {
  activeTab: string;
  onRegisterEvent?: (event: UserEvent) => void;
}

// Interface para eventos en formato BackendEvent (que EventGrid espera)
interface BackendEvent {
  id: number;
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  modality: string;
  isVirtual: boolean;
  location?: string;
  virtualLocation?: string;
  capacity?: number;
  registeredCount: number;
  eventType?: { name: string; id: number };
  eventCategory?: { name: string; id: number };
  eventStatus?: { name: string; id: number };
  image?: string;
  featured?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const EventCatalogTab: React.FC<EventCatalogTabProps> = ({ onRegisterEvent }) => {
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Función para transformar UserEvent a BackendEvent
  const transformToBackendEvent = (userEvent: UserEvent): BackendEvent => {
    return {
      id: userEvent.id,
      title: userEvent.title,
      description: userEvent.description,
      shortDescription: userEvent.description,
      startDate: userEvent.date,
      endDate: userEvent.date, // No tenemos endDate separado
      price: typeof userEvent.price === 'string' ? parseFloat(userEvent.price) : userEvent.price,
      currency: 'GTQ',
      modality: userEvent.modality,
      isVirtual: userEvent.modality === 'virtual',
      location: userEvent.modality !== 'virtual' ? userEvent.location : undefined,
      virtualLocation: userEvent.modality === 'virtual' ? userEvent.location : undefined,
      capacity: userEvent.capacity,
      registeredCount: userEvent.registered,
      eventType: { name: 'Capacitación', id: 1 },
      eventCategory: { name: userEvent.category, id: 1 },
      eventStatus: { name: 'published', id: 1 },
      image: userEvent.image,
      featured: false,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Cargar eventos disponibles
  const loadEvents = async (page = 1, filters: any = {}) => {
    try {
      setLoading(true);

      // Filtrar valores vacíos y "all"
      const apiFilters = Object.entries(filters).reduce((acc: any, [key, value]) => {
        if (value && value !== 'all' && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const eventsData = await UserDashboardService.getAvailableEvents({
        ...apiFilters,
        page,
        limit: 12
      });

      // Transformar UserEvent[] a BackendEvent[]
      const transformedEvents = Array.isArray(eventsData)
        ? eventsData.map(transformToBackendEvent)
        : [];

      setEvents(transformedEvents);
      setTotalPages(Math.ceil(transformedEvents.length / 12));
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(currentPage, {
      category: categoryFilter,
      modality: modalityFilter,
      search: searchTerm
    });
  }, [currentPage, categoryFilter, modalityFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={categoryFilter === '' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategoryFilter('')}
          >
            Todos
          </Badge>
          <Badge
            variant={categoryFilter === 'Marketing' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategoryFilter('Marketing')}
          >
            Marketing
          </Badge>
          <Badge
            variant={categoryFilter === 'Innovación' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategoryFilter('Innovación')}
          >
            Innovación
          </Badge>
          <Badge
            variant={categoryFilter === 'Recursos Humanos' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategoryFilter('Recursos Humanos')}
          >
            Recursos Humanos
          </Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={modalityFilter} onValueChange={setModalityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Modalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de eventos - Usando componente EventGrid */}
      <EventGrid events={events} loading={loading} />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventCatalogTab;