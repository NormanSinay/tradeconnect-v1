import React, { useState } from 'react';
import { DashboardService, Event } from '@/services/dashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface EventCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: Event | null;
}

const EventCancelModal: React.FC<EventCancelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  event
}) => {
  const { withErrorHandling } = useErrorHandler();
  const permissions = usePermissions();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!event || !reason.trim()) return;

    // Verificar permisos antes de proceder
    if (!permissions.canCancelEvents) {
      toast.error('No tienes permisos para cancelar eventos');
      return;
    }

    try {
      setSubmitting(true);
      const cancelData = withErrorHandling(async () => {
        await DashboardService.updateEventStatus(event.id, 'cancel', reason);
        toast.success('Evento cancelado exitosamente');
        onSuccess();
        onClose();
        setReason('');
      }, 'Error al cancelar evento');

      await cancelData();
    } catch (error) {
      console.error('Error in handleCancel:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setReason('');
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
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <X className="h-5 w-5" />
            Cancelar Evento
          </DialogTitle>
          <DialogDescription>
            Indique el motivo de la cancelación del evento.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Card className="bg-orange-50 border-orange-200 mb-4">
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
            <div>
              <Label htmlFor="cancel-reason">Motivo de cancelación *</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explique el motivo de la cancelación..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Advertencia:</strong> La cancelación del evento notificará automáticamente a todos los inscritos
              y no se podrán realizar nuevas inscripciones. Esta acción no se puede deshacer.
            </p>
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
            variant="destructive"
            onClick={handleCancel}
            disabled={submitting || !reason.trim()}
          >
            {submitting ? 'Cancelando...' : 'Cancelar Evento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventCancelModal;