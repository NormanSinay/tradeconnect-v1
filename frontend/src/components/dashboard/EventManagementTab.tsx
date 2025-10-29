import React, { useState, useEffect, useCallback } from 'react';
import { DashboardService, Event, CreateEventData, UpdateEventData } from '@/services/dashboardService';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Eye, Edit, Trash2, Download, Calendar, MapPin, Users, DollarSign, AlertTriangle, Copy, Upload, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import EventDuplicateModal from './EventDuplicateModal';
import toast from 'react-hot-toast';

interface EventManagementTabProps {
  activeTab: string;
}

interface EventFormData {
  title: string;
  description: string;
  shortDescription: string;
  startDate: string;
  endDate: string;
  location: string;
  virtualLocation: string;
  isVirtual: boolean;
  price: number;
  currency: string;
  capacity: number;
  minAge: number;
  maxAge: number;
  tags: string[];
  requirements: string;
  eventTypeId: number;
  eventCategoryId: number;
  eventStatusId: number;
}

interface EventFormErrors {
  title?: string;
  description?: string;
  shortDescription?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  virtualLocation?: string;
  price?: string;
  currency?: string;
  capacity?: string;
  minAge?: string;
  maxAge?: string;
  tags?: string;
  requirements?: string;
  eventTypeId?: string;
  eventCategoryId?: string;
  eventStatusId?: string;
}

const EventManagementTab: React.FC<EventManagementTabProps> = ({ activeTab }) => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter] = useState<string>('all');
  const [virtualFilter, setVirtualFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para modales y formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusChangeReason, setStatusChangeReason] = useState<string>('');

  // Estado del formulario
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    shortDescription: '',
    startDate: '',
    endDate: '',
    location: '',
    virtualLocation: '',
    isVirtual: false,
    price: 0,
    currency: 'GTQ',
    capacity: 0,
    minAge: 0,
    maxAge: 0,
    tags: [],
    requirements: '',
    eventTypeId: 0,
    eventCategoryId: 0,
    eventStatusId: 1
  });
  const [formErrors, setFormErrors] = useState<EventFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Estados adicionales para duplicación (ya no se usan aquí, se manejan en el modal)

  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab, currentPage, statusFilter, categoryFilter, typeFilter, virtualFilter]);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        const params: any = {
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          eventCategoryId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined,
          eventTypeId: typeFilter !== 'all' ? parseInt(typeFilter) : undefined,
          isVirtual: virtualFilter !== 'all' ? virtualFilter === 'true' : undefined,
          sortBy: 'startDate',
          sortOrder: 'DESC'
        };

        const result = await DashboardService.getEvents(params);
        setEvents(result.events);
        setTotalPages(result.pagination.totalPages);
      }, 'Error al cargar eventos');

      await loadData();
    } catch (error) {
      console.error('Error in loadEvents:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, categoryFilter, typeFilter, virtualFilter, searchTerm, withErrorHandling]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadEvents();
  };

  // Funciones para gestión de eventos con validaciones específicas
  const validateStateTransition = (event: Event, newStatus: string): { isValid: boolean; message?: string } => {
    const currentStatus = event.eventStatus.name;

    // No permitir cambiar al mismo estado
    if (currentStatus === newStatus) {
      return {
        isValid: false,
        message: 'El evento ya está en ese estado'
      };
    }

    switch (newStatus) {
      case 'published':
        if (currentStatus !== 'draft' && currentStatus !== 'approved') {
          return {
            isValid: false,
            message: 'Solo se pueden publicar eventos en estado "Borrador" o "Aprobado"'
          };
        }
        // Validaciones adicionales para publicar
        if (!event.title?.trim()) {
          return { isValid: false, message: 'El evento debe tener un título válido' };
        }
        if (!event.startDate || new Date(event.startDate) <= new Date()) {
          return { isValid: false, message: 'La fecha de inicio debe ser futura' };
        }
        if (!event.endDate || new Date(event.endDate) <= new Date(event.startDate)) {
          return { isValid: false, message: 'La fecha de fin debe ser posterior a la fecha de inicio' };
        }
        break;

      case 'cancelled':
        if (currentStatus === 'completed' || currentStatus === 'archived') {
          return {
            isValid: false,
            message: 'No se pueden cancelar eventos completados o archivados'
          };
        }
        break;

      case 'completed':
        if (currentStatus !== 'published' && currentStatus !== 'ongoing') {
          return {
            isValid: false,
            message: 'Solo se pueden completar eventos publicados o en progreso'
          };
        }
        if (new Date(event.endDate) > new Date()) {
          return {
            isValid: false,
            message: 'Solo se pueden completar eventos que ya han finalizado'
          };
        }
        break;

      case 'postponed':
        if (currentStatus === 'completed' || currentStatus === 'cancelled' || currentStatus === 'archived') {
          return {
            isValid: false,
            message: 'No se pueden posponer eventos completados, cancelados o archivados'
          };
        }
        break;

      case 'ongoing':
        if (currentStatus !== 'published') {
          return {
            isValid: false,
            message: 'Solo se pueden marcar como en progreso eventos publicados'
          };
        }
        const now = new Date();
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        if (now < startDate || now > endDate) {
          return {
            isValid: false,
            message: 'Solo se pueden marcar como en progreso eventos dentro de su período de duración'
          };
        }
        break;

      case 'archived':
        if (currentStatus !== 'completed' && currentStatus !== 'cancelled') {
          return {
            isValid: false,
            message: 'Solo se pueden archivar eventos completados o cancelados'
          };
        }
        break;

      default:
        return { isValid: true };
    }

    return { isValid: true };
  };

  const handlePublishEvent = async (eventId: number) => {
    const event = selectedEvent;
    if (!event) return;

    // Verificar permisos antes de proceder
    if (!permissions.canPublishEvents) {
      toast.error('No tienes permisos para publicar eventos');
      return;
    }

    const validation = validateStateTransition(event, 'published');
    if (!validation.isValid) {
      toast.error(validation.message || 'No se puede publicar el evento');
      return;
    }

    try {
      const publishData = withErrorHandling(async () => {
        await DashboardService.publishEvent(eventId);
        toast.success('Evento publicado exitosamente');
        loadEvents();
      }, 'Error al publicar evento');

      await publishData();
      setShowPublishModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Error in handlePublishEvent:', error);
      // Manejo específico de errores para publicar
      if (error.message?.includes('fecha') || error.message?.includes('date')) {
        toast.error('Error de validación de fechas: ' + error.message);
      } else if (error.message?.includes('título') || error.message?.includes('title')) {
        toast.error('Error de validación de título: ' + error.message);
      } else if (error.message?.includes('permiso') || error.message?.includes('permission')) {
        toast.error('No tienes permisos para publicar este evento');
      } else {
        toast.error('Error al publicar el evento: ' + error.message);
      }
    }
  };

  const handleCancelEvent = async (eventId: number, reason: string) => {
    const event = selectedEvent;
    if (!event) return;

    // Verificar permisos antes de proceder
    if (!permissions.canCancelEvents) {
      toast.error('No tienes permisos para cancelar eventos');
      return;
    }

    if (!reason?.trim()) {
      toast.error('Debe proporcionar un motivo de cancelación');
      return;
    }

    const validation = validateStateTransition(event, 'cancelled');
    if (!validation.isValid) {
      toast.error(validation.message || 'No se puede cancelar el evento');
      return;
    }

    try {
      const cancelData = withErrorHandling(async () => {
        await DashboardService.updateEventStatus(eventId, 'cancel', reason);
        toast.success('Evento cancelado exitosamente');
        loadEvents();
      }, 'Error al cancelar evento');

      await cancelData();
      setShowCancelModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Error in handleCancelEvent:', error);
      // Manejo específico de errores para cancelar
      if (error.message?.includes('motivo') || error.message?.includes('reason')) {
        toast.error('Error en el motivo de cancelación: ' + error.message);
      } else if (error.message?.includes('permiso') || error.message?.includes('permission')) {
        toast.error('No tienes permisos para cancelar este evento');
      } else if (error.message?.includes('estado') || error.message?.includes('status')) {
        toast.error('Error de estado del evento: ' + error.message);
      } else {
        toast.error('Error al cancelar el evento: ' + error.message);
      }
    }
  };

  // Nuevas funciones para cambios de estado adicionales
  const handleChangeEventStatus = async (eventId: number, newStatus: string, reason?: string) => {
    const event = selectedEvent;
    if (!event) return;

    // Verificar permisos antes de proceder
    if (!permissions.canChangeEventStatus) {
      toast.error('No tienes permisos para cambiar el estado de eventos');
      return;
    }

    const validation = validateStateTransition(event, newStatus);
    if (!validation.isValid) {
      toast.error(validation.message || `No se puede cambiar el estado a ${newStatus}`);
      return;
    }

    try {
      const statusData = withErrorHandling(async () => {
        // Mapear el estado a la acción correcta para el backend
        const actionMap: { [key: string]: string } = {
          'completed': 'complete',
          'cancelled': 'cancel',
          'postponed': 'postpone',
          'archived': 'archive',
          'ongoing': 'ongoing'
        };

        const action = actionMap[newStatus] || newStatus;
        await DashboardService.updateEventStatus(eventId, action as any, reason || '');
        toast.success(`Estado del evento cambiado exitosamente a ${newStatus}`);
        loadEvents();
      }, `Error al cambiar estado del evento`);

      await statusData();
      setShowStatusModal(false);
      setSelectedEvent(null);
      setNewStatus('');
      setStatusChangeReason('');
    } catch (error: any) {
      console.error('Error in handleChangeEventStatus:', error);
      // Manejo específico de errores para cambios de estado
      if (error.message?.includes('motivo') || error.message?.includes('reason')) {
        toast.error('Error en el motivo del cambio: ' + error.message);
      } else if (error.message?.includes('permiso') || error.message?.includes('permission')) {
        toast.error('No tienes permisos para cambiar el estado de este evento');
      } else if (error.message?.includes('estado') || error.message?.includes('status')) {
        toast.error('Error de transición de estado: ' + error.message);
      } else if (error.message?.includes('fecha') || error.message?.includes('date')) {
        toast.error('Error de validación de fechas: ' + error.message);
      } else if (error.message?.includes('validación') || error.message?.includes('validation')) {
        toast.error('Error de validación: ' + error.message);
      } else {
        toast.error('Error al cambiar el estado del evento: ' + error.message);
      }
    }
  };

  // Función de duplicación ya no se necesita aquí, se maneja en el modal

  const handleDeleteEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleDeleteEventConfirm = async () => {
    if (!selectedEvent) return;

    // Verificar permisos antes de proceder
    if (!permissions.canDeleteEvents) {
      toast.error('No tienes permisos para eliminar eventos');
      return;
    }

    try {
      setSubmitting(true);
      const deleteData = withErrorHandling(async () => {
        await DashboardService.deleteEvent(selectedEvent.id);
        toast.success('Evento eliminado exitosamente');
        setShowDeleteModal(false);
        setSelectedEvent(null);
        loadEvents();
      }, 'Error al eliminar evento');

      await deleteData();
    } catch (error) {
      console.error('Error in handleDeleteEventConfirm:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Funciones para formularios
  const validateForm = (): boolean => {
    const errors: EventFormErrors = {};

    if (!formData.title.trim()) errors.title = 'Título es requerido';
    if (!formData.startDate) errors.startDate = 'Fecha de inicio es requerida';
    if (!formData.endDate) errors.endDate = 'Fecha de fin es requerida';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    if (formData.price < 0) errors.price = 'El precio no puede ser negativo';
    if (formData.capacity < 0) errors.capacity = 'La capacidad no puede ser negativa';
    if (formData.minAge < 0) errors.minAge = 'La edad mínima no puede ser negativa';
    if (formData.maxAge < 0) errors.maxAge = 'La edad máxima no puede ser negativa';
    if (formData.minAge > formData.maxAge && formData.maxAge > 0) {
      errors.maxAge = 'La edad máxima debe ser mayor que la mínima';
    }
    if (!formData.eventTypeId) errors.eventTypeId = 'Tipo de evento es requerido';
    if (!formData.eventCategoryId) errors.eventCategoryId = 'Categoría de evento es requerida';

    // Validación específica para eventos virtuales/híbridos
    if (formData.virtualLocation.trim()) {
      try {
        new URL(formData.virtualLocation);
      } catch {
        errors.virtualLocation = 'El enlace virtual debe ser una URL válida';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      startDate: '',
      endDate: '',
      location: '',
      virtualLocation: '',
      isVirtual: false,
      price: 0,
      currency: 'GTQ',
      capacity: 0,
      minAge: 0,
      maxAge: 0,
      tags: [],
      requirements: '',
      eventTypeId: 0,
      eventCategoryId: 0,
      eventStatusId: 1
    });
    setFormErrors({});
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    // Verificar permisos antes de proceder
    if (!permissions.canCreateEvents) {
      toast.error('No tienes permisos para crear eventos');
      return;
    }

    try {
      setSubmitting(true);
      const createData = withErrorHandling(async () => {
        const eventData: CreateEventData = {
          ...formData,
          // No enviar virtualLocation si el evento no es virtual o está vacío
          virtualLocation: formData.isVirtual && formData.virtualLocation.trim() ? formData.virtualLocation.trim() : undefined,
          tags: formData.tags.filter(tag => tag.trim() !== '')
        };
        await DashboardService.createEvent(eventData);
        toast.success('Evento creado exitosamente');
        setShowCreateModal(false);
        resetForm();
        loadEvents();
      }, 'Error al crear evento');

      await createData();
    } catch (error) {
      console.error('Error in handleCreateEvent:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent || !validateForm()) return;

    // Verificar permisos antes de proceder
    if (!permissions.canUpdateEvents) {
      toast.error('No tienes permisos para editar eventos');
      return;
    }

    try {
      setSubmitting(true);
      const updateData = withErrorHandling(async () => {
        const eventData: UpdateEventData = {
          ...formData,
          // No enviar virtualLocation si el evento no es virtual o está vacío
          virtualLocation: formData.isVirtual && formData.virtualLocation.trim() ? formData.virtualLocation.trim() : undefined,
          tags: formData.tags.filter(tag => tag.trim() !== '')
        };
        await DashboardService.updateEvent(selectedEvent.id, eventData);
        toast.success('Evento actualizado exitosamente');
        setShowEditModal(false);
        resetForm();
        loadEvents();
      }, 'Error al actualizar evento');

      await updateData();
    } catch (error) {
      console.error('Error in handleEditEvent:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const handleEditEventClick = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      shortDescription: event.shortDescription || '',
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      location: event.location || '',
      virtualLocation: event.virtualLocation || '',
      isVirtual: event.isVirtual,
      price: event.price,
      currency: event.currency,
      capacity: event.capacity || 0,
      minAge: event.minAge || 0,
      maxAge: event.maxAge || 0,
      tags: event.tags || [],
      requirements: event.requirements || '',
      eventTypeId: event.eventType.id,
      eventCategoryId: event.eventCategory.id,
      eventStatusId: event.eventStatus.id
    });
    setShowEditModal(true);
  };

  const handleDuplicateEventClick = (event: Event) => {
    // Verificar permisos antes de proceder
    if (!permissions.canDuplicateEvents) {
      toast.error('No tienes permisos para duplicar eventos');
      return;
    }

    setSelectedEvent(event);
    setShowDuplicateModal(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      case 'ongoing': return 'default';
      case 'postponed': return 'secondary';
      case 'archived': return 'outline';
      case 'review': return 'secondary';
      case 'approved': return 'default';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency === 'GTQ' ? 'GTQ' : 'USD'
    }).format(amount);
  };

  if (activeTab !== 'events') return null;

  return (
    <div className="space-y-6">
      {/* Verificación de permisos */}
      {!permissions.canViewEvents && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para ver eventos.
          </AlertDescription>
        </Alert>
      )}

      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="review">En Revisión</SelectItem>
              <SelectItem value="approved">Aprobado</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="ongoing">En Progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="postponed">Pospuesto</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="1">Negocios</SelectItem>
              <SelectItem value="2">Tecnología</SelectItem>
              <SelectItem value="3">Marketing</SelectItem>
              <SelectItem value="4">Finanzas</SelectItem>
              <SelectItem value="5">Salud</SelectItem>
              <SelectItem value="6">Educación</SelectItem>
              <SelectItem value="7">Legal</SelectItem>
              <SelectItem value="8">Construcción</SelectItem>
              <SelectItem value="9">Manufactura</SelectItem>
              <SelectItem value="10">Retail</SelectItem>
              <SelectItem value="11">Turismo</SelectItem>
              <SelectItem value="12">Agricultura</SelectItem>
              <SelectItem value="13">Energía</SelectItem>
              <SelectItem value="14">Medio Ambiente</SelectItem>
              <SelectItem value="15">Deportes</SelectItem>
              <SelectItem value="16">Entretenimiento</SelectItem>
              <SelectItem value="17">Gobierno</SelectItem>
              <SelectItem value="18">ONG</SelectItem>
              <SelectItem value="19">Otro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={virtualFilter} onValueChange={setVirtualFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Modalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="false">Presencial</SelectItem>
              <SelectItem value="true">Virtual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Funcionalidad de exportación en desarrollo')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {permissions.canCreateEvents && (
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Evento</DialogTitle>
                  <DialogDescription>
                    Complete la información requerida para crear un nuevo evento.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateEvent(); }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={formErrors.title ? 'border-red-500' : ''}
                      />
                      {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
                    </div>
                    <div>
                      <Label htmlFor="shortDescription">Descripción corta</Label>
                      <Textarea
                        id="shortDescription"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Fecha de inicio *</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className={formErrors.startDate ? 'border-red-500' : ''}
                        />
                        {formErrors.startDate && <p className="text-sm text-red-500 mt-1">{formErrors.startDate}</p>}
                      </div>
                      <div>
                        <Label htmlFor="endDate">Fecha de fin *</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className={formErrors.endDate ? 'border-red-500' : ''}
                        />
                        {formErrors.endDate && <p className="text-sm text-red-500 mt-1">{formErrors.endDate}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isVirtual" className="text-sm font-medium">
                        Evento virtual
                      </Label>
                      <Switch
                        id="isVirtual"
                        checked={formData.isVirtual}
                        onCheckedChange={(checked) => setFormData({ ...formData, isVirtual: checked })}
                      />
                    </div>
                    {!formData.isVirtual && (
                      <div>
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Dirección del evento"
                        />
                      </div>
                    )}
                    {formData.isVirtual && (
                      <div>
                        <Label htmlFor="virtualLocation">Enlace virtual</Label>
                        <Input
                          id="virtualLocation"
                          type="url"
                          value={formData.virtualLocation}
                          onChange={(e) => setFormData({ ...formData, virtualLocation: e.target.value })}
                          placeholder="https://zoom.us/j/123456789"
                          className={formErrors.virtualLocation ? 'border-red-500' : ''}
                        />
                        {formErrors.virtualLocation && <p className="text-sm text-red-500 mt-1">{formErrors.virtualLocation}</p>}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Precio</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          className={formErrors.price ? 'border-red-500' : ''}
                        />
                        {formErrors.price && <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>}
                      </div>
                      <div>
                        <Label htmlFor="currency">Moneda</Label>
                        <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GTQ">Quetzales (GTQ)</SelectItem>
                            <SelectItem value="USD">Dólares (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacidad</Label>
                        <Input
                          id="capacity"
                          type="number"
                          min="0"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                          className={formErrors.capacity ? 'border-red-500' : ''}
                        />
                        {formErrors.capacity && <p className="text-sm text-red-500 mt-1">{formErrors.capacity}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="eventTypeId">Tipo de evento *</Label>
                        <Select value={formData.eventTypeId.toString()} onValueChange={(value) => setFormData({ ...formData, eventTypeId: parseInt(value) })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Conferencia</SelectItem>
                            <SelectItem value="2">Taller</SelectItem>
                            <SelectItem value="3">Seminario</SelectItem>
                            <SelectItem value="4">Webinar</SelectItem>
                            <SelectItem value="5">Networking</SelectItem>
                            <SelectItem value="6">Feria Comercial</SelectItem>
                            <SelectItem value="7">Panel de Discusión</SelectItem>
                            <SelectItem value="8">Capacitación</SelectItem>
                            <SelectItem value="9">Evento de Lanzamiento</SelectItem>
                            <SelectItem value="10">Evento Social</SelectItem>
                            <SelectItem value="11">Evento Híbrido</SelectItem>
                            <SelectItem value="12">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.eventTypeId && <p className="text-sm text-red-500 mt-1">{formErrors.eventTypeId}</p>}
                      </div>
                      <div>
                        <Label htmlFor="eventCategoryId">Categoría *</Label>
                        <Select value={formData.eventCategoryId.toString()} onValueChange={(value) => setFormData({ ...formData, eventCategoryId: parseInt(value) })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="1">Negocios</SelectItem>
                              <SelectItem value="2">Tecnología</SelectItem>
                              <SelectItem value="3">Marketing</SelectItem>
                              <SelectItem value="4">Finanzas</SelectItem>
                              <SelectItem value="5">Salud</SelectItem>
                              <SelectItem value="6">Educación</SelectItem>
                              <SelectItem value="7">Legal</SelectItem>
                              <SelectItem value="8">Construcción</SelectItem>
                              <SelectItem value="9">Manufactura</SelectItem>
                              <SelectItem value="10">Retail</SelectItem>
                              <SelectItem value="11">Turismo</SelectItem>
                              <SelectItem value="12">Agricultura</SelectItem>
                              <SelectItem value="13">Energía</SelectItem>
                              <SelectItem value="14">Medio Ambiente</SelectItem>
                              <SelectItem value="15">Deportes</SelectItem>
                              <SelectItem value="16">Entretenimiento</SelectItem>
                              <SelectItem value="17">Gobierno</SelectItem>
                              <SelectItem value="18">ONG</SelectItem>
                              <SelectItem value="19">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                        {formErrors.eventCategoryId && <p className="text-sm text-red-500 mt-1">{formErrors.eventCategoryId}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción completa</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Creando...' : 'Crear Evento'}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tabla de eventos */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead>Tipo/Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Inscritos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando eventos...
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron eventos
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        {event.isVirtual ? (
                          <>
                            <Upload className="h-3 w-3" />
                            Virtual
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3" />
                            {event.location || 'Sin ubicación'}
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(event.startDate)}</div>
                      <div className="text-gray-500">al {formatDate(event.endDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{event.eventType.displayName}</div>
                      <div className="text-gray-500">{event.eventCategory.displayName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.price > 0 ? formatCurrency(event.price, event.currency) : 'Gratuito'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{event.registeredCount}</span>
                      {event.capacity && (
                        <span className="text-gray-500">/ {event.capacity}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(event.eventStatus.name)}>
                      {event.eventStatus.displayName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEvent(event)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {permissions.canUpdateEvents && (
                        <>
                          <Dialog open={showEditModal && selectedEvent?.id === event.id} onOpenChange={(open: boolean) => {
                            if (!open) setShowEditModal(false);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEventClick(event)}
                                title="Editar evento"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar Evento</DialogTitle>
                                <DialogDescription>
                                  Modifique la información del evento seleccionado.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-title">Título *</Label>
                                  <Input
                                    id="edit-title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={formErrors.title ? 'border-red-500' : ''}
                                  />
                                  {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-startDate">Fecha de inicio *</Label>
                                    <Input
                                      id="edit-startDate"
                                      type="datetime-local"
                                      value={formData.startDate}
                                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                      className={formErrors.startDate ? 'border-red-500' : ''}
                                    />
                                    {formErrors.startDate && <p className="text-sm text-red-500 mt-1">{formErrors.startDate}</p>}
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-endDate">Fecha de fin *</Label>
                                    <Input
                                      id="edit-endDate"
                                      type="datetime-local"
                                      value={formData.endDate}
                                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                      className={formErrors.endDate ? 'border-red-500' : ''}
                                    />
                                    {formErrors.endDate && <p className="text-sm text-red-500 mt-1">{formErrors.endDate}</p>}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor="edit-price">Precio</Label>
                                    <Input
                                      id="edit-price"
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={formData.price}
                                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                      className={formErrors.price ? 'border-red-500' : ''}
                                    />
                                    {formErrors.price && <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>}
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-capacity">Capacidad</Label>
                                    <Input
                                      id="edit-capacity"
                                      type="number"
                                      min="0"
                                      value={formData.capacity}
                                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                      className={formErrors.capacity ? 'border-red-500' : ''}
                                    />
                                    {formErrors.capacity && <p className="text-sm text-red-500 mt-1">{formErrors.capacity}</p>}
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-status">Estado</Label>
                                    <Select value={formData.eventStatusId.toString()} onValueChange={(value) => setFormData({ ...formData, eventStatusId: parseInt(value) })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="1">Borrador</SelectItem>
                                          <SelectItem value="2">En Revisión</SelectItem>
                                          <SelectItem value="3">Aprobado</SelectItem>
                                          <SelectItem value="4">Publicado</SelectItem>
                                          <SelectItem value="5">En Progreso</SelectItem>
                                          <SelectItem value="6">Completado</SelectItem>
                                          <SelectItem value="7">Cancelado</SelectItem>
                                          <SelectItem value="8">Pospuesto</SelectItem>
                                          <SelectItem value="9">Archivado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleEditEvent} disabled={submitting}>
                                    {submitting ? 'Actualizando...' : 'Actualizar Evento'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {event.eventStatus.name === 'draft' && permissions.canPublishEvents && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowPublishModal(true);
                              }}
                              title="Publicar evento"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}

                          {event.eventStatus.name === 'published' && permissions.canCancelEvents && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowCancelModal(true);
                              }}
                              title="Cancelar evento"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Botón para cambiar estado adicional */}
                          {permissions.canChangeEventStatus && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setNewStatus('');
                                setStatusChangeReason('');
                                setShowStatusModal(true);
                              }}
                              title="Cambiar estado"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}

                          {permissions.canDuplicateEvents && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicateEventClick(event)}
                              title="Duplicar evento"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}

                          {permissions.canDeleteEvents && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEventClick(event)}
                              className="text-red-600 hover:text-red-700"
                              title="Eliminar evento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de detalles de evento */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Evento</DialogTitle>
            <DialogDescription>
              Información completa del evento seleccionado.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                      <Badge variant={getStatusBadgeVariant(selectedEvent.eventStatus.name)} className="mt-2">
                        {selectedEvent.eventStatus.displayName}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(selectedEvent.startDate)} - {formatDate(selectedEvent.endDate)}</span>
                      </div>
                      {selectedEvent.isVirtual ? (
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-gray-500" />
                          <span>Virtual: {selectedEvent.virtualLocation || 'Enlace no disponible'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{selectedEvent.location || 'Ubicación no especificada'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{selectedEvent.price > 0 ? formatCurrency(selectedEvent.price, selectedEvent.currency) : 'Gratuito'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{selectedEvent.registeredCount} inscritos</span>
                        {selectedEvent.capacity && <span> de {selectedEvent.capacity}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clasificación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Tipo:</span> {selectedEvent.eventType.displayName}
                    </div>
                    <div>
                      <span className="font-medium">Categoría:</span> {selectedEvent.eventCategory.displayName}
                    </div>
                    {selectedEvent.creator && (
                      <div>
                        <span className="font-medium">Creado por:</span> {selectedEvent.creator.fullName}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Fecha de creación:</span> {formatDate(selectedEvent.createdAt)}
                    </div>
                    {selectedEvent.publishedAt && (
                      <div>
                        <span className="font-medium">Publicado:</span> {formatDate(selectedEvent.publishedAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {selectedEvent.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedEvent.description}</p>
                  </CardContent>
                </Card>
              )}

              {selectedEvent.agenda && selectedEvent.agenda.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agenda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedEvent.agenda.map((item, index) => (
                        <div key={index} className="border-l-4 border-primary pl-4 py-2">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-600">
                            {item.startTime} - {item.endTime}
                            {item.location && ` • ${item.location}`}
                          </div>
                          {item.description && <div className="text-sm mt-1">{item.description}</div>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este evento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {selectedEvent.title[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-600">{formatDate(selectedEvent.startDate)}</p>
                    <Badge variant={getStatusBadgeVariant(selectedEvent.eventStatus.name)} className="mt-1">
                      {selectedEvent.eventStatus.displayName}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Al eliminar este evento, se perderán todas las inscripciones,
                  configuraciones y datos asociados. Esta acción es irreversible.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEventConfirm}
              disabled={submitting}
            >
              {submitting ? 'Eliminando...' : 'Eliminar Evento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de publicar evento */}
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Upload className="h-5 w-5" />
              Publicar Evento
            </DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea publicar este evento? Una vez publicado, estará visible para todos los usuarios.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="py-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {selectedEvent.title[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-600">{formatDate(selectedEvent.startDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPublishModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => selectedEvent && handlePublishEvent(selectedEvent.id)}
            >
              Publicar Evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de cancelar evento */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <X className="h-5 w-5" />
              Cancelar Evento
            </DialogTitle>
            <DialogDescription>
              Indique el motivo de la cancelación del evento. Este campo es obligatorio.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="py-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {selectedEvent.title[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-600">{formatDate(selectedEvent.startDate)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="cancel-reason">Motivo de cancelación *</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Explique el motivo de la cancelación..."
                  className="mt-2"
                  rows={3}
                  required
                />
              </div>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> La cancelación del evento notificará automáticamente a todos los inscritos
                  y no se podrán realizar nuevas inscripciones. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const reason = (document.getElementById('cancel-reason') as HTMLTextAreaElement)?.value;
                if (reason && selectedEvent) {
                  handleCancelEvent(selectedEvent.id, reason);
                } else {
                  toast.error('Debe proporcionar un motivo de cancelación');
                }
              }}
            >
              Cancelar Evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de cambiar estado del evento */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-600">
              <Edit className="h-5 w-5" />
              Cambiar Estado del Evento
            </DialogTitle>
            <DialogDescription>
              Seleccione el nuevo estado para el evento.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="py-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {selectedEvent.title[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-600">Estado actual: {selectedEvent.eventStatus.displayName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="new-status">Nuevo estado *</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nuevo estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedEvent.eventStatus.name !== 'published' && (
                        <SelectItem value="published">Publicado</SelectItem>
                      )}
                      {selectedEvent.eventStatus.name !== 'ongoing' && (
                        <SelectItem value="ongoing">En Progreso</SelectItem>
                      )}
                      {selectedEvent.eventStatus.name !== 'completed' && (
                        <SelectItem value="completed">Completado</SelectItem>
                      )}
                      {selectedEvent.eventStatus.name !== 'cancelled' && (
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      )}
                      {selectedEvent.eventStatus.name !== 'postponed' && (
                        <SelectItem value="postponed">Pospuesto</SelectItem>
                      )}
                      {selectedEvent.eventStatus.name !== 'archived' && (
                        <SelectItem value="archived">Archivado</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {(newStatus === 'cancelled' || newStatus === 'postponed') && (
                  <div>
                    <Label htmlFor="status-reason">Motivo del cambio *</Label>
                    <Textarea
                      id="status-reason"
                      placeholder="Explique el motivo del cambio de estado..."
                      value={statusChangeReason}
                      onChange={(e) => setStatusChangeReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (newStatus && selectedEvent) {
                  if ((newStatus === 'cancelled' || newStatus === 'postponed') && !statusChangeReason.trim()) {
                    toast.error('Debe proporcionar un motivo para este cambio de estado');
                    return;
                  }
                  handleChangeEventStatus(selectedEvent.id, newStatus, statusChangeReason);
                } else {
                  toast.error('Debe seleccionar un nuevo estado');
                }
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Cambiar Estado
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de duplicar evento */}
      <EventDuplicateModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        onSuccess={() => {
          setShowDuplicateModal(false);
          setSelectedEvent(null);
          loadEvents(); // Actualizar lista automáticamente
        }}
        event={selectedEvent}
      />

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