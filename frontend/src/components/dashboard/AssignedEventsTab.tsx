import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Eye, Edit, CheckCircle, XCircle, Upload, Filter, CalendarDays } from 'lucide-react';
import { SpeakerDashboardService, SpeakerAssignedEvent } from '@/services/speakerDashboardService';
import { useSpeakerDashboardState } from '@/hooks/useSpeakerDashboardState';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AssignedEventsTab: React.FC<{ activeTab: string }> = () => {
  const [events, setEvents] = useState<SpeakerAssignedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const { formatDate } = useSpeakerDashboardState();

  useEffect(() => {
    loadAssignedEvents();
  }, []);

  const loadAssignedEvents = async () => {
    try {
      setLoading(true);
      const assignedEvents = await SpeakerDashboardService.getAssignedEvents();
      setEvents(assignedEvents);
    } catch (error) {
      console.error('Error loading assigned events:', error);
      toast.error('Error al cargar eventos asignados');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmParticipation = async (eventId: number) => {
    try {
      await SpeakerDashboardService.confirmEventParticipation(eventId);
      toast.success('Participación confirmada exitosamente');
      loadAssignedEvents();
    } catch (error) {
      console.error('Error confirming participation:', error);
      toast.error('Error al confirmar participación');
    }
  };

  const handleCancelParticipation = async (eventId: number) => {
    const reason = prompt('¿Cuál es la razón de la cancelación?');
    if (reason) {
      try {
        await SpeakerDashboardService.cancelEventParticipation(eventId, reason);
        toast.success('Participación cancelada exitosamente');
        loadAssignedEvents();
      } catch (error) {
        console.error('Error canceling participation:', error);
        toast.error('Error al cancelar participación');
      }
    }
  };

  const handleViewEventDetails = async (eventId: number) => {
    try {
      const eventDetails = await SpeakerDashboardService.getEventDetails(eventId);
      // Aquí se podría abrir un modal o navegar a una página de detalles
      toast.success('Detalles del evento obtenidos');
      console.log('Event details:', eventDetails);
    } catch (error) {
      console.error('Error getting event details:', error);
      toast.error('Error al obtener detalles del evento');
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesSearch = event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (event.notes && event.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const eventDate = new Date(event.participationStart);
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        switch (dateFilter) {
          case 'today':
            matchesDate = eventDate.toDateString() === now.toDateString();
            break;
          case 'week':
            matchesDate = eventDate >= now && eventDate <= nextWeek;
            break;
          case 'month':
            matchesDate = eventDate >= now && eventDate <= nextMonth;
            break;
          case 'past':
            matchesDate = eventDate < now;
            break;
        }
      }

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [events, statusFilter, searchTerm, dateFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tentative':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleLabels = {
      keynote_speaker: 'Keynote Speaker',
      panelist: 'Panelista',
      facilitator: 'Facilitador',
      moderator: 'Moderador',
      guest: 'Invitado'
    };
    return <Badge variant="outline">{roleLabels[role as keyof typeof roleLabels] || role}</Badge>;
  };

  // Calendar view data
  const calendarEvents = useMemo(() => {
    return filteredEvents.map(event => ({
      id: event.id,
      title: event.eventTitle,
      start: new Date(event.participationStart),
      end: new Date(event.participationEnd),
      status: event.status,
      location: event.location || 'Por definir',
      modality: event.modality
    }));
  }, [filteredEvents]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Cargando eventos asignados...</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-600">Eventos Asignados</h2>
          <p className="text-gray-600">Gestiona tus eventos y participaciones</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <Users className="w-4 h-4 mr-2" />
            Lista
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Calendario
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="tentative">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="past">Pasados</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('all');
                setSearchTerm('');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                   <div className="flex justify-between items-start">
                     <CardTitle className="text-lg font-semibold text-purple-600">
                       {event.eventTitle}
                     </CardTitle>
                     <div className="flex gap-2">
                       {getStatusBadge(event.status)}
                       {getRoleBadge(event.role)}
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <div className="flex items-center text-sm text-gray-600">
                       <Calendar className="w-4 h-4 mr-2" />
                       {formatDate(event.participationStart)}
                     </div>
                     <div className="flex items-center text-sm text-gray-600">
                       <Clock className="w-4 h-4 mr-2" />
                       {event.participationStart ? formatDate(event.participationStart) : 'Por definir'} - {event.participationEnd ? formatDate(event.participationEnd) : 'Por definir'}
                     </div>
                     <div className="flex items-center text-sm text-gray-600">
                       <MapPin className="w-4 h-4 mr-2" />
                       {event.location || 'Por definir'}
                     </div>
                     <div className="flex items-center text-sm text-gray-600">
                       <Users className="w-4 h-4 mr-2" />
                       {event.modality === 'virtual' ? 'Virtual' : event.modality === 'hybrid' ? 'Híbrido' : 'Presencial'}
                     </div>
                   </div>

                   <p className="text-sm text-gray-700 line-clamp-3">
                     {event.notes || 'Sin descripción adicional'}
                   </p>

                   <div className="flex gap-2 pt-2">
                     <Button
                       size="sm"
                       variant="outline"
                       className="flex-1"
                       onClick={() => handleViewEventDetails(event.id)}
                     >
                       <Eye className="w-4 h-4 mr-2" />
                       Ver Detalles
                     </Button>
                     <Button
                       size="sm"
                       variant="outline"
                       className="flex-1"
                       onClick={() => toast.success('Subir material')}
                     >
                       <Upload className="w-4 h-4 mr-2" />
                       Material
                     </Button>
                   </div>

                  {event.status === 'tentative' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleConfirmParticipation(event.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleCancelParticipation(event.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vista de calendario próximamente
              </h3>
              <p className="text-gray-600">
                La vista de calendario estará disponible en una próxima actualización.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredEvents.length === 0 && events.length > 0 && (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron eventos con los filtros aplicados
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros para ver más eventos.
          </p>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes eventos asignados
          </h3>
          <p className="text-gray-600">
            Cuando te asignen eventos como speaker, aparecerán aquí.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AssignedEventsTab;