import React, { useState } from 'react';
import { DashboardService, Event } from '@/services/dashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

interface EventPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: Event | null;
}

const EventPublishModal: React.FC<EventPublishModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  event
}) => {
  const { withErrorHandling } = useErrorHandler();
  const permissions = usePermissions();
  const [submitting, setSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!event) return;

    // Verificar permisos antes de proceder
    if (!permissions.canPublishEvents) {
      toast.error('No tienes permisos para publicar eventos');
      return;
    }

    try {
      setSubmitting(true);
      const publishData = withErrorHandling(async () => {
        await DashboardService.publishEvent(event.id);
        toast.success('Evento publicado exitosamente');
        onSuccess();
        onClose();
      }, 'Error al publicar evento');

      await publishData();
    } catch (error) {
      console.error('Error in handlePublish:', error);
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
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Upload className="h-5 w-5" />
            Publicar Evento
          </DialogTitle>
          <DialogDescription>
            ¿Está seguro de que desea publicar este evento? Una vez publicado, estará visible para todos los usuarios.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Card className="bg-green-50 border-green-200">
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

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Una vez publicado, el evento será visible en el listado público y los usuarios podrán registrarse.
              Asegúrese de que toda la información esté correcta antes de publicar.
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
            onClick={handlePublish}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? 'Publicando...' : 'Publicar Evento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventPublishModal;