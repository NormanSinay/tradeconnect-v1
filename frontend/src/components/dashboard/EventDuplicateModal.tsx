import React, { useState, useEffect } from 'react';
import { DashboardService, Event } from '@/services/dashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import { Copy, AlertTriangle } from 'lucide-react';

interface EventDuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: Event | null;
}

interface DuplicateModifications {
  title: string;
  startDate: string;
  endDate: string;
  price: number;
}

interface DuplicateErrors {
  title?: string;
  startDate?: string;
  endDate?: string;
  price?: string;
}

const EventDuplicateModal: React.FC<EventDuplicateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  event
}) => {
  const { withErrorHandling } = useErrorHandler();

  const [duplicateModifications, setDuplicateModifications] = useState<DuplicateModifications>({
    title: '',
    startDate: '',
    endDate: '',
    price: 0
  });

  const [duplicateErrors, setDuplicateErrors] = useState<DuplicateErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      setDuplicateModifications({
        title: `${event.title} (Copia)`,
        startDate: '',
        endDate: '',
        price: event.price
      });
    }
  }, [event, isOpen]);

  const validateDuplicateForm = (): boolean => {
    const errors: DuplicateErrors = {};

    // Validar título único si se proporciona
    if (duplicateModifications.title.trim()) {
      if (duplicateModifications.title.trim().length < 3) {
        errors.title = 'El título debe tener al menos 3 caracteres';
      } else if (duplicateModifications.title.trim().length > 100) {
        errors.title = 'El título no puede exceder 100 caracteres';
      }
    }

    // Validar fechas coherentes si se proporcionan ambas
    if (duplicateModifications.startDate && duplicateModifications.endDate) {
      const startDate = new Date(duplicateModifications.startDate);
      const endDate = new Date(duplicateModifications.endDate);
      const now = new Date();

      if (startDate >= endDate) {
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }

      // Validar que las fechas no sean en el pasado
      if (startDate <= now) {
        errors.startDate = 'La fecha de inicio debe ser futura';
      }

      // Validación de duración máxima (30 días)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        errors.endDate = 'La duración del evento no puede exceder 30 días';
      }
    } else if (duplicateModifications.startDate && !duplicateModifications.endDate) {
      errors.endDate = 'Debe proporcionar la fecha de fin si modifica la fecha de inicio';
    } else if (!duplicateModifications.startDate && duplicateModifications.endDate) {
      errors.startDate = 'Debe proporcionar la fecha de inicio si modifica la fecha de fin';
    }

    // Validar precio no negativo y dentro de límites
    if (duplicateModifications.price < 0) {
      errors.price = 'El precio no puede ser negativo';
    } else if (duplicateModifications.price > 10000) {
      errors.price = 'El precio no puede exceder Q10,000.00';
    }

    setDuplicateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    if (!validateDuplicateForm()) return;

    try {
      setSubmitting(true);
      const duplicateData = withErrorHandling(async () => {
        await DashboardService.duplicateEvent(event.id, duplicateModifications);
        toast.success('Evento duplicado exitosamente');
        onSuccess();
        onClose();
        setDuplicateModifications({ title: '', startDate: '', endDate: '', price: 0 });
        setDuplicateErrors({});
      }, 'Error al duplicar evento');

      await duplicateData();
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);

      // Manejo específico de errores para duplicación
      if (error.message?.includes('título') || error.message?.includes('title')) {
        toast.error('Error de validación de título: ' + error.message);
        setDuplicateErrors({ title: error.message });
      } else if (error.message?.includes('fecha') || error.message?.includes('date')) {
        toast.error('Error de validación de fechas: ' + error.message);
        setDuplicateErrors({ startDate: error.message, endDate: error.message });
      } else if (error.message?.includes('precio') || error.message?.includes('price')) {
        toast.error('Error de validación de precio: ' + error.message);
        setDuplicateErrors({ price: error.message });
      } else if (error.message?.includes('permiso') || error.message?.includes('permission')) {
        toast.error('No tienes permisos para duplicar este evento');
      } else if (error.message?.includes('duplicado') || error.message?.includes('duplicate')) {
        toast.error('Error en la duplicación: ' + error.message);
      } else {
        toast.error('Error al duplicar el evento: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setDuplicateModifications({ title: '', startDate: '', endDate: '', price: 0 });
      setDuplicateErrors({});
    }
  };

  if (!event) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Copy className="h-5 w-5" />
            Duplicar Evento
          </DialogTitle>
          <DialogDescription>
            Configure las modificaciones opcionales para el evento duplicado. Los campos vacíos mantendrán los valores originales.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {event.title[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                    <p className="text-sm text-gray-600">
                      {event.price > 0 ? formatCurrency(event.price, event.currency) : 'Gratuito'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Los campos opcionales permiten modificar el evento duplicado. Si deja un campo vacío, se mantendrá el valor original.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="duplicate-title">Nuevo título (opcional)</Label>
                <Input
                  id="duplicate-title"
                  value={duplicateModifications.title}
                  onChange={(e) => setDuplicateModifications({ ...duplicateModifications, title: e.target.value })}
                  placeholder={`${event.title} (Copia)`}
                  className={duplicateErrors.title ? 'border-red-500' : ''}
                />
                {duplicateErrors.title && <p className="text-sm text-red-500 mt-1">{duplicateErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duplicate-startDate">Nueva fecha de inicio (opcional)</Label>
                  <Input
                    id="duplicate-startDate"
                    type="datetime-local"
                    value={duplicateModifications.startDate}
                    onChange={(e) => setDuplicateModifications({ ...duplicateModifications, startDate: e.target.value })}
                    className={duplicateErrors.startDate ? 'border-red-500' : ''}
                  />
                  {duplicateErrors.startDate && <p className="text-sm text-red-500 mt-1">{duplicateErrors.startDate}</p>}
                </div>
                <div>
                  <Label htmlFor="duplicate-endDate">Nueva fecha de fin (opcional)</Label>
                  <Input
                    id="duplicate-endDate"
                    type="datetime-local"
                    value={duplicateModifications.endDate}
                    onChange={(e) => setDuplicateModifications({ ...duplicateModifications, endDate: e.target.value })}
                    className={duplicateErrors.endDate ? 'border-red-500' : ''}
                  />
                  {duplicateErrors.endDate && <p className="text-sm text-red-500 mt-1">{duplicateErrors.endDate}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="duplicate-price">Nuevo precio (opcional)</Label>
                <Input
                  id="duplicate-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={duplicateModifications.price || ''}
                  onChange={(e) => setDuplicateModifications({ ...duplicateModifications, price: parseFloat(e.target.value) || 0 })}
                  placeholder={event.price.toString()}
                  className={duplicateErrors.price ? 'border-red-500' : ''}
                />
                {duplicateErrors.price && <p className="text-sm text-red-500 mt-1">{duplicateErrors.price}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Duplicando...' : 'Duplicar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDuplicateModal;