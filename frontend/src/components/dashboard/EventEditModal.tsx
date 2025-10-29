import React, { useState, useEffect } from 'react';
import { DashboardService, Event, UpdateEventData } from '@/services/dashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: Event | null;
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

const EventEditModal: React.FC<EventEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  event
}) => {
  const { withErrorHandling } = useErrorHandler();

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

  useEffect(() => {
    if (event && isOpen) {
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
      setFormErrors({});
    }
  }, [event, isOpen]);

  const validateForm = (): boolean => {
    const errors: EventFormErrors = {};

    // Validación de título
    if (!formData.title.trim()) {
      errors.title = 'El título del evento es obligatorio';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'El título no puede exceder 100 caracteres';
    }

    // Validación de descripción corta
    if (formData.shortDescription && formData.shortDescription.length > 200) {
      errors.shortDescription = 'La descripción corta no puede exceder 200 caracteres';
    }

    // Validación de fechas
    if (!formData.startDate) {
      errors.startDate = 'La fecha de inicio es obligatoria';
    } else {
      const startDate = new Date(formData.startDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time for date comparison

      // Solo validar fecha futura si el evento no ha empezado aún
      if (event && new Date(event.startDate) > now && startDate < now) {
        errors.startDate = 'La fecha de inicio no puede ser en el pasado para eventos futuros';
      }
    }

    if (!formData.endDate) {
      errors.endDate = 'La fecha de fin es obligatoria';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate >= endDate) {
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }

      // Validación de duración máxima (30 días)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        errors.endDate = 'La duración del evento no puede exceder 30 días';
      }
    }

    // Validación de ubicación para eventos presenciales
    if (!formData.isVirtual && !formData.location.trim()) {
      errors.location = 'La ubicación es obligatoria para eventos presenciales';
    } else if (!formData.isVirtual && formData.location.trim().length < 5) {
      errors.location = 'La ubicación debe tener al menos 5 caracteres';
    }

    // Validación de enlace virtual para eventos virtuales
    if (formData.isVirtual && !formData.virtualLocation.trim()) {
      errors.virtualLocation = 'El enlace virtual es obligatorio para eventos virtuales';
    } else if (formData.isVirtual && formData.virtualLocation.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(formData.virtualLocation.trim())) {
        errors.virtualLocation = 'El enlace virtual debe ser una URL válida (https://...)';
      }
    }

    // Validación de precio
    if (formData.price < 0) {
      errors.price = 'El precio no puede ser negativo';
    } else if (formData.price > 10000) {
      errors.price = 'El precio no puede exceder Q10,000.00';
    }

    // Validación de capacidad
    if (formData.capacity < 0) {
      errors.capacity = 'La capacidad no puede ser negativa';
    } else if (formData.capacity > 10000) {
      errors.capacity = 'La capacidad no puede exceder 10,000 personas';
    }

    // Validación de edades
    if (formData.minAge < 0) {
      errors.minAge = 'La edad mínima no puede ser negativa';
    } else if (formData.minAge > 120) {
      errors.minAge = 'La edad mínima no puede exceder 120 años';
    }

    if (formData.maxAge < 0) {
      errors.maxAge = 'La edad máxima no puede ser negativa';
    } else if (formData.maxAge > 120) {
      errors.maxAge = 'La edad máxima no puede exceder 120 años';
    }

    if (formData.minAge > 0 && formData.maxAge > 0 && formData.minAge > formData.maxAge) {
      errors.maxAge = 'La edad máxima debe ser mayor o igual que la mínima';
    }

    // Validación de requisitos
    if (formData.requirements && formData.requirements.length > 500) {
      errors.requirements = 'Los requisitos no pueden exceder 500 caracteres';
    }

    // Validación de descripción completa
    if (formData.description && formData.description.length > 2000) {
      errors.description = 'La descripción completa no puede exceder 2000 caracteres';
    }

    // Validación de tipos y categorías
    if (!formData.eventTypeId || formData.eventTypeId === 0) {
      errors.eventTypeId = 'Debe seleccionar un tipo de evento';
    }

    if (!formData.eventCategoryId || formData.eventCategoryId === 0) {
      errors.eventCategoryId = 'Debe seleccionar una categoría de evento';
    }

    // Validación de tags
    if (formData.tags.length > 10) {
      errors.tags = 'No puede tener más de 10 etiquetas';
    } else {
      const invalidTags = formData.tags.filter(tag => tag.length > 20);
      if (invalidTags.length > 0) {
        errors.tags = 'Cada etiqueta no puede exceder 20 caracteres';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event || !validateForm()) return;

    try {
      setSubmitting(true);
      const updateData = withErrorHandling(async () => {
        const eventData: UpdateEventData = {
          ...formData,
          tags: formData.tags.filter(tag => tag.trim() !== '')
        };
        await DashboardService.updateEvent(event.id, eventData);
        toast.success('Evento actualizado exitosamente');
        onSuccess();
        onClose();
      }, 'Error al actualizar evento');

      await updateData();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>
            Modifique la información del evento seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Título *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={formErrors.title ? 'border-red-500' : ''}
              placeholder="Ingrese el título del evento"
            />
            {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <Label htmlFor="edit-shortDescription">Descripción corta</Label>
            <Textarea
              id="edit-shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              rows={2}
              placeholder="Breve descripción del evento"
            />
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isVirtual"
              checked={formData.isVirtual}
              onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
            />
            <Label htmlFor="edit-isVirtual">Evento virtual</Label>
          </div>

          {!formData.isVirtual && (
            <div>
              <Label htmlFor="edit-location">Ubicación</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dirección del evento"
              />
            </div>
          )}

          {formData.isVirtual && (
            <div>
              <Label htmlFor="edit-virtualLocation">Enlace virtual</Label>
              <Input
                id="edit-virtualLocation"
                value={formData.virtualLocation}
                onChange={(e) => setFormData({ ...formData, virtualLocation: e.target.value })}
                placeholder="URL de Zoom, Meet, etc."
              />
            </div>
          )}

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
                  <SelectItem value="2">Publicado</SelectItem>
                  <SelectItem value="3">Cancelado</SelectItem>
                  <SelectItem value="4">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-eventTypeId">Tipo de evento *</Label>
              <Select value={formData.eventTypeId.toString()} onValueChange={(value) => setFormData({ ...formData, eventTypeId: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Conferencia</SelectItem>
                  <SelectItem value="2">Taller</SelectItem>
                  <SelectItem value="3">Seminario</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.eventTypeId && <p className="text-sm text-red-500 mt-1">{formErrors.eventTypeId}</p>}
            </div>
            <div>
              <Label htmlFor="edit-eventCategoryId">Categoría *</Label>
              <Select value={formData.eventCategoryId.toString()} onValueChange={(value) => setFormData({ ...formData, eventCategoryId: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tecnología</SelectItem>
                  <SelectItem value="2">Negocios</SelectItem>
                  <SelectItem value="3">Educación</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.eventCategoryId && <p className="text-sm text-red-500 mt-1">{formErrors.eventCategoryId}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Descripción completa</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Descripción detallada del evento"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Actualizando...' : 'Actualizar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventEditModal;