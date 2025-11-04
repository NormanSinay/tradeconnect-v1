import React, { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { usePermissions } from '@/hooks/usePermissions';
// import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Edit, Trash2, Clock, MapPin, AlertTriangle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Speaker {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  category?: string;
  rating?: number;
  baseRate?: number;
  rateType?: string;
  modalities?: string[];
  languages?: string[];
  isActive: boolean;
  fullName?: string;
}

interface EventSpeaker {
  id: number;
  speakerId: number;
  eventId: number;
  role: 'keynote_speaker' | 'panelist' | 'facilitator' | 'moderator' | 'guest';
  participationStart?: string;
  participationEnd?: string;
  modality: 'presential' | 'virtual' | 'hybrid';
  order: number;
  status: 'tentative' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  speaker?: Speaker;
}

interface EventSpeakerManagerProps {
  eventId: number;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SpeakerFormData {
  speakerId: number;
  role: 'keynote_speaker' | 'panelist' | 'facilitator' | 'moderator' | 'guest';
  participationStart?: string;
  participationEnd?: string;
  modality: 'presential' | 'virtual' | 'hybrid';
  order: number;
  notes: string;
}

const EventSpeakerManager: React.FC<EventSpeakerManagerProps> = ({
  eventId,
  eventTitle,
  isOpen,
  onClose
}) => {
  const permissions = usePermissions();
  // const { withErrorHandling } = useErrorHandler();

  // Estados principales
  const [eventSpeakers, setEventSpeakers] = useState<EventSpeaker[]>([]);
  const [availableSpeakers, setAvailableSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados para formularios
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<EventSpeaker | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [speakerToDelete, setSpeakerToDelete] = useState<EventSpeaker | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<SpeakerFormData>({
    speakerId: 0,
    role: 'panelist',
    participationStart: undefined,
    participationEnd: undefined,
    modality: 'presential',
    order: 1,
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen && eventId) {
      loadEventSpeakers();
      loadAvailableSpeakers();
    }
  }, [isOpen, eventId]);

  // Cargar speakers asignados al evento
  const loadEventSpeakers = async () => {
    try {
      setLoading(true);
      const speakers = await DashboardService.getEventSpeakers(eventId);
      setEventSpeakers(speakers);
    } catch (error) {
      console.error('Error cargando speakers del evento:', error);
      toast.error('Error al cargar los speakers del evento');
    } finally {
      setLoading(false);
    }
  };

  // Cargar speakers disponibles desde la tabla de speakers
  const loadAvailableSpeakers = async () => {
    try {
      // Usar el método getSpeakers que consulta la tabla speakers
      const result = await DashboardService.getSpeakers({
        limit: 100
      });

      // Transformar a formato Speaker
      const speakers: Speaker[] = result.speakers.map(speaker => ({
        id: speaker.id,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        email: speaker.email,
        phone: speaker.phone,
        category: speaker.category || 'speaker',
        isActive: speaker.isActive,
        fullName: `${speaker.firstName} ${speaker.lastName}`
      }));

      setAvailableSpeakers(speakers);
    } catch (error) {
      console.error('Error cargando speakers disponibles:', error);
      toast.error('Error al cargar la lista de speakers disponibles');
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.speakerId) {
      errors.speakerId = 'Debe seleccionar un speaker';
    }

    // Las fechas de participación ahora son opcionales
    if (formData.participationStart && formData.participationEnd) {
      const start = new Date(formData.participationStart);
      const end = new Date(formData.participationEnd);

      if (end <= start) {
        errors.participationEnd = 'La fecha de fin debe ser posterior al inicio';
      }
    }

    if (formData.order < 1) {
      errors.order = 'El orden debe ser mayor a 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      speakerId: 0,
      role: 'panelist',
      participationStart: undefined,
      participationEnd: undefined,
      modality: 'presential',
      order: 1,
      notes: ''
    });
    setFormErrors({});
    setEditingSpeaker(null);
  };

  // Asignar speaker al evento
  const handleAssignSpeaker = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Verificar si el speaker ya está asignado al evento
      const isAlreadyAssigned = eventSpeakers.some(speaker => speaker.speakerId === formData.speakerId);
      if (isAlreadyAssigned) {
        toast.error('Este speaker ya está asignado a este evento');
        return;
      }

      const speakerData = {
        speakerId: formData.speakerId,
        role: formData.role,
        participationStart: formData.participationStart || undefined,
        participationEnd: formData.participationEnd || undefined,
        modality: formData.modality,
        order: formData.order,
        notes: formData.notes || undefined
      };

      await DashboardService.assignSpeakerToEvent(eventId, speakerData);

      toast.success('Speaker asignado exitosamente al evento');
      setShowAssignModal(false);
      resetForm();
      loadEventSpeakers();

    } catch (error: any) {
      console.error('Error asignando speaker:', error);

      if (error.message?.includes('ya está asignado')) {
        toast.error('Este speaker ya está asignado a este evento');
      } else if (error.message?.includes('disponibilidad')) {
        toast.error('El speaker no está disponible en las fechas seleccionadas');
      } else {
        toast.error('Error al asignar el speaker al evento');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Editar asignación de speaker
  const handleEditSpeaker = (speaker: EventSpeaker) => {
    setEditingSpeaker(speaker);
    setFormData({
      speakerId: speaker.speakerId,
      role: speaker.role,
      participationStart: speaker.participationStart ? new Date(speaker.participationStart).toISOString().slice(0, 10) : undefined,
      participationEnd: speaker.participationEnd ? new Date(speaker.participationEnd).toISOString().slice(0, 10) : undefined,
      modality: speaker.modality,
      order: speaker.order,
      notes: speaker.notes || ''
    });
    setShowAssignModal(true);
  };

  // Mostrar modal de confirmación para eliminar
  const handleDeleteClick = (speaker: EventSpeaker) => {
    setSpeakerToDelete(speaker);
    setShowDeleteConfirm(true);
  };

  // Confirmar eliminación de speaker
  const handleConfirmDelete = async () => {
    if (!speakerToDelete) return;

    try {
      setSubmitting(true);
      setShowDeleteConfirm(false);

      await DashboardService.removeSpeakerFromEvent(eventId, speakerToDelete.speakerId, 'Removido por administrador');

      toast.success('Speaker removido exitosamente del evento');
      loadEventSpeakers();
      setSpeakerToDelete(null);

    } catch (error: any) {
      console.error('Error removiendo speaker:', error);

      // Manejo específico de errores
      if (error.message?.includes('SPEAKER_ASSIGNMENT_NOT_FOUND')) {
        toast.error('La asignación de este speaker ya fue eliminada o no existe');
      } else if (error.message?.includes('CANNOT_REMOVE_COMPLETED_ASSIGNMENT')) {
        toast.error('No se puede eliminar una asignación completada');
      } else if (error.message?.includes('INSUFFICIENT_PERMISSIONS')) {
        toast.error('No tiene permisos para eliminar asignaciones de speakers');
      } else {
        toast.error(error.message || 'Error al remover el speaker del evento');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener nombre del rol
  const getRoleDisplayName = (role: string): string => {
    const roleNames: { [key: string]: string } = {
      'keynote_speaker': 'Conferencista Principal',
      'panelist': 'Panelista',
      'facilitator': 'Facilitador',
      'moderator': 'Moderador',
      'guest': 'Invitado'
    };
    return roleNames[role] || role;
  };

  // Obtener color del badge según el rol
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'keynote_speaker': return 'default';
      case 'moderator': return 'secondary';
      case 'facilitator': return 'outline';
      default: return 'secondary';
    }
  };

  // Obtener color del badge según el estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'tentative': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!permissions.canViewEvents) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para gestionar speakers de eventos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestionar Speakers - {eventTitle}
          </DialogTitle>
          <DialogDescription>
            Asigna y gestiona los speakers para este evento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con acciones */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {eventSpeakers.length} speaker(s) asignado(s)
            </div>
            {permissions.canUpdateEvents && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowAssignModal(true);
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Asignar Speaker
              </Button>
            )}
          </div>

          {/* Lista de speakers asignados */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando speakers...</p>
              </div>
            ) : eventSpeakers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay speakers asignados
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Asigna speakers para que participen en este evento
                  </p>
                  {permissions.canUpdateEvents && (
                    <Button
                      onClick={() => {
                        resetForm();
                        setShowAssignModal(true);
                      }}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Asignar Primer Speaker
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {eventSpeakers.map((eventSpeaker) => (
                  <Card key={eventSpeaker.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {eventSpeaker.speaker?.firstName?.[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {eventSpeaker.speaker?.firstName} {eventSpeaker.speaker?.lastName}
                              </h3>
                              <Badge variant={getRoleBadgeVariant(eventSpeaker.role)}>
                                {getRoleDisplayName(eventSpeaker.role)}
                              </Badge>
                              <Badge variant={getStatusBadgeVariant(eventSpeaker.status)}>
                                {eventSpeaker.status === 'confirmed' ? 'Confirmado' :
                                 eventSpeaker.status === 'tentative' ? 'Tentativo' :
                                 eventSpeaker.status === 'completed' ? 'Completado' : 'Cancelado'}
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatDate(eventSpeaker.participationStart)} - {formatDate(eventSpeaker.participationEnd)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {eventSpeaker.modality === 'presential' ? 'Presencial' :
                                   eventSpeaker.modality === 'virtual' ? 'Virtual' : 'Híbrido'}
                                </span>
                              </div>
                              {eventSpeaker.speaker?.email && (
                                <div>
                                  Email: {eventSpeaker.speaker.email}
                                </div>
                              )}
                              {eventSpeaker.notes && (
                                <div>
                                  Notas: {eventSpeaker.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {permissions.canUpdateEvents && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSpeaker(eventSpeaker)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(eventSpeaker)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación para eliminar */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Confirmar eliminación
              </DialogTitle>
              <DialogDescription>
                ¿Está seguro de que desea remover a <strong>{speakerToDelete?.speaker?.firstName} {speakerToDelete?.speaker?.lastName}</strong> del evento <strong>{eventTitle}</strong>?
                <br />
                <span className="text-sm text-gray-600 mt-2 block">
                  Esta acción no se puede deshacer.
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSpeakerToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? 'Eliminando...' : 'Eliminar Speaker'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para asignar/editar speaker */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSpeaker ? 'Editar Asignación de Speaker' : 'Asignar Speaker al Evento'}
              </DialogTitle>
              <DialogDescription>
                Complete la información para asignar un speaker al evento
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="speaker-select">Speaker *</Label>
                <Select
                  value={formData.speakerId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, speakerId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpeakers.map((speaker) => (
                      <SelectItem key={speaker.id} value={speaker.id.toString()}>
                        {speaker.firstName} {speaker.lastName} - {speaker.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.speakerId && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.speakerId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role-select">Rol del Speaker *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keynote_speaker">Conferencista Principal</SelectItem>
                    <SelectItem value="panelist">Panelista</SelectItem>
                    <SelectItem value="facilitator">Facilitador</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="guest">Invitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Fecha de Inicio <span className="text-gray-400">(opcional)</span></Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.participationStart}
                    onChange={(e) => setFormData({ ...formData, participationStart: e.target.value })}
                    className={formErrors.participationStart ? 'border-red-500' : ''}
                  />
                  {formErrors.participationStart && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.participationStart}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end-date">Fecha de Fin <span className="text-gray-400">(opcional)</span></Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.participationEnd}
                    onChange={(e) => setFormData({ ...formData, participationEnd: e.target.value })}
                    className={formErrors.participationEnd ? 'border-red-500' : ''}
                  />
                  {formErrors.participationEnd && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.participationEnd}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modality-select">Modalidad</Label>
                  <Select
                    value={formData.modality}
                    onValueChange={(value: any) => setFormData({ ...formData, modality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presential">Presencial</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">Orden de Aparición</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className={formErrors.order ? 'border-red-500' : ''}
                  />
                  {formErrors.order && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.order}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas internas sobre la participación del speaker..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignSpeaker}
                  disabled={submitting}
                >
                  {submitting ? 'Asignando...' : editingSpeaker ? 'Actualizar' : 'Asignar Speaker'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default EventSpeakerManager;