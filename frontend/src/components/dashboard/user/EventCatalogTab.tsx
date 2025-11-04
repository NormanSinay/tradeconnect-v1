import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Clock, DollarSign, Search } from 'lucide-react';
import { UserDashboardService, UserEvent } from '@/services/userDashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import EventRegistrationFlow from '@/components/ui/event-registration-flow';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const EventCatalogTab: React.FC<{ activeTab: string }> = ({ }) => {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [registrationFlowOpen, setRegistrationFlowOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<UserEvent | null>(null);
  const { withErrorHandling } = useErrorHandler();
  const location = useLocation();

  // Cargar eventos disponibles
  const loadEvents = async (page = 1, filters: any = {}) => {
    try {
      setLoading(true);
      const eventsData = await withErrorHandling(async () => {
        // Filtrar valores vacíos y "all"
        const apiFilters = Object.entries(filters).reduce((acc: any, [key, value]) => {
          if (value && value !== 'all' && value !== '') {
            acc[key] = value;
          }
          return acc;
        }, {});

        return UserDashboardService.getAvailableEvents({
          ...apiFilters,
          page,
          limit: 12
        });
      }, 'Error cargando eventos disponibles');

      setEvents(Array.isArray(eventsData) ? eventsData : []);
      // La API debería devolver información de paginación, pero por ahora mantenemos la lógica básica
      setTotalPages(Math.ceil((Array.isArray(eventsData) ? eventsData : []).length / 12));
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

  // Check for return URL with event registration hash
  useEffect(() => {
    if (location.hash.startsWith('#register-event-')) {
      const eventId = parseInt(location.hash.replace('#register-event-', ''));
      if (eventId && events.length > 0) {
        const event = events.find(e => e.id === eventId);
        if (event) {
          setSelectedEvent(event);
          setRegistrationFlowOpen(true);
          // Clear the hash
          window.history.replaceState(null, '', location.pathname + location.search);
        }
      }
    }
  }, [location, events]);

  // Función para abrir el flujo de registro
  const handleRegister = (event: UserEvent) => {
    setSelectedEvent(event);
    setRegistrationFlowOpen(true);
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case 'virtual': return 'bg-blue-100 text-blue-800';
      case 'presencial': return 'bg-green-100 text-green-800';
      case 'hibrido': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModalityText = (modality: string) => {
    switch (modality) {
      case 'virtual': return 'Virtual';
      case 'presencial': return 'Presencial';
      case 'hibrido': return 'Híbrido';
      default: return modality;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
        <span className="ml-3 text-gray-600">Cargando catálogo de eventos...</span>
      </div>
    );
  }

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

      {/* Grid de eventos */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron eventos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={event.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getModalityColor(event.modality)}>
                      {getModalityText(event.modality)}
                    </Badge>
                  </div>
                  {event.status === 'full' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="destructive" className="text-lg px-4 py-2">
                        AGOTADO
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {event.category}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{event.registered}/{event.capacity} inscritos</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-[#4CAF50]" />
                      <span className="font-semibold text-[#4CAF50]">
                        Q{event.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#4CAF50] hover:bg-[#45a049]"
                        onClick={() => handleRegister(event)}
                        disabled={event.status === 'full' || event.status === 'cancelled'}
                      >
                        {event.status === 'full' ? 'Agotado' : 'Inscribirme'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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

      {/* Event Registration Flow */}
      {selectedEvent && (
        <EventRegistrationFlow
          isOpen={registrationFlowOpen}
          onClose={() => {
            setRegistrationFlowOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default EventCatalogTab;