import React from 'react';
import { Event } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, Upload } from 'lucide-react';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  if (!event) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Evento</DialogTitle>
          <DialogDescription>
            Información completa del evento seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <Badge variant={getStatusBadgeVariant(event.eventStatus.name)} className="mt-2">
                    {event.eventStatus.displayName}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                  </div>
                  {event.isVirtual ? (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-gray-500" />
                      <span>Virtual: {event.virtualLocation || 'Enlace no disponible'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{event.location || 'Ubicación no especificada'}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>{event.price > 0 ? formatCurrency(event.price, event.currency) : 'Gratuito'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{event.registeredCount} inscritos</span>
                    {event.capacity && <span> de {event.capacity}</span>}
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
                  <span className="font-medium">Tipo:</span> {event.eventType.displayName}
                </div>
                <div>
                  <span className="font-medium">Categoría:</span> {event.eventCategory.displayName}
                </div>
                {event.creator && (
                  <div>
                    <span className="font-medium">Creado por:</span> {event.creator.fullName}
                  </div>
                )}
                <div>
                  <span className="font-medium">Fecha de creación:</span> {formatDate(event.createdAt)}
                </div>
                {event.publishedAt && (
                  <div>
                    <span className="font-medium">Publicado:</span> {formatDate(event.publishedAt)}
                  </div>
                )}
                {event.cancelledAt && (
                  <div>
                    <span className="font-medium">Cancelado:</span> {formatDate(event.cancelledAt)}
                  </div>
                )}
                {event.cancellationReason && (
                  <div>
                    <span className="font-medium">Motivo de cancelación:</span>
                    <p className="text-sm text-gray-600 mt-1">{event.cancellationReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {event.shortDescription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descripción Corta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{event.shortDescription}</p>
              </CardContent>
            </Card>
          )}

          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descripción Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>
          )}

          {event.agenda && event.agenda.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.agenda.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-600">
                        {item.startTime} - {item.endTime}
                        {item.location && ` • ${item.location}`}
                      </div>
                      {item.description && <div className="text-sm mt-1">{item.description}</div>}
                      {item.speaker && <div className="text-sm text-primary mt-1">Ponente: {item.speaker}</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {event.tags && event.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(event.minAge || event.maxAge || event.requirements) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requisitos y Restricciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.minAge && event.maxAge && (
                  <div>
                    <span className="font-medium">Edad requerida:</span> {event.minAge} - {event.maxAge} años
                  </div>
                )}
                {event.minAge && !event.maxAge && (
                  <div>
                    <span className="font-medium">Edad mínima:</span> {event.minAge} años
                  </div>
                )}
                {!event.minAge && event.maxAge && (
                  <div>
                    <span className="font-medium">Edad máxima:</span> {event.maxAge} años
                  </div>
                )}
                {event.requirements && (
                  <div>
                    <span className="font-medium">Requisitos adicionales:</span>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{event.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;