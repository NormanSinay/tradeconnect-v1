import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  MapPin,
  QrCode,
  Calendar as EventIcon,
  Download,
  Video,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import type { EventRegistration, ApiResponse } from '@/types';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

type EventFilter = 'upcoming' | 'past' | 'cancelled';

interface TabPanelProps {
  children?: React.ReactNode;
  value: EventFilter;
  currentValue: EventFilter;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, currentValue }) => (
  <div hidden={value !== currentValue}>
    {value === currentValue && <Box component={"div" as any} sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const MyEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EventFilter>('upcoming');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<EventRegistration | null>(null);

  // Fetch user registrations
  const {
    data: registrations,
    isLoading,
    error,
    refetch,
  } = useQuery<EventRegistration[]>({
    queryKey: ['user-events'],
    queryFn: async () => {
      const response: ApiResponse<EventRegistration[]> = await apiService.get(
        '/registrations/my-events'
      );
      return response.data || [];
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: EventFilter) => {
    setActiveTab(newValue);
  };

  const handleQrModalOpen = (registration: EventRegistration) => {
    setSelectedRegistration(registration);
    setQrModalOpen(true);
  };

  const handleQrModalClose = () => {
    setQrModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleDownloadQR = async (registrationId: number) => {
    try {
      toast.success('Descargando código QR...');
      // TODO: Implement QR download
      // const response = await apiService.get(`/qr/${registrationId}/download`, { responseType: 'blob' });
    } catch (error) {
      toast.error('Error al descargar código QR');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (
    status: 'confirmed' | 'pending' | 'cancelled'
  ): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
    }
  };

  const getStatusText = (status: 'confirmed' | 'pending' | 'cancelled'): string => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
    }
  };

  const filterRegistrations = (
    registrations: EventRegistration[] | undefined,
    filter: EventFilter
  ): EventRegistration[] => {
    if (!registrations) return [];

    const now = new Date();

    return registrations.filter((reg) => {
      if (!reg.event) return false;

      const eventDate = new Date(reg.event.startDate);

      switch (filter) {
        case 'upcoming':
          return eventDate >= now && reg.registrationStatus !== 'cancelled';
        case 'past':
          return eventDate < now && reg.registrationStatus !== 'cancelled';
        case 'cancelled':
          return reg.registrationStatus === 'cancelled';
        default:
          return false;
      }
    });
  };

  if (isLoading) {
    return (
      <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error al cargar eventos. Por favor intenta de nuevo.
        <Button size="small" onClick={() => refetch()} sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  const filteredRegistrations = filterRegistrations(registrations, activeTab);

  return (
    <Box component={"div" as any}>
      {/* Header */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Mis Eventos
      </Typography>

      {/* Filter Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab
          label={`Próximos (${filterRegistrations(registrations, 'upcoming').length})`}
          value="upcoming"
        />
        <Tab
          label={`Pasados (${filterRegistrations(registrations, 'past').length})`}
          value="past"
        />
        <Tab
          label={`Cancelados (${filterRegistrations(registrations, 'cancelled').length})`}
          value="cancelled"
        />
      </Tabs>

      {/* Events Grid */}
      {filteredRegistrations.length === 0 ? (
        <Alert severity="info">
          No tienes eventos en esta categoría.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredRegistrations.map((registration) => (
            <Grid item xs={12} md={6} key={registration.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Event Title and Status */}
                  <Box
                    component={"div" as any}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1, pr: 2 }}>
                      {registration.event?.title}
                    </Typography>
                    <Chip
                      label={getStatusText(registration.registrationStatus)}
                      color={getStatusColor(registration.registrationStatus)}
                      size="small"
                    />
                  </Box>

                  {/* Event Details */}
                  <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                    {/* Date */}
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {registration.event && formatDate(registration.event.startDate)}
                      </Typography>
                    </Box>

                    {/* Location */}
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {registration.event?.isVirtual ? (
                        <Videocam sx={{ fontSize: 18, color: 'text.secondary' }} />
                      ) : (
                        <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {registration.event?.isVirtual
                          ? registration.event.virtualLocation || 'Evento Virtual'
                          : registration.event?.location || 'Ubicación por confirmar'}
                      </Typography>
                    </Box>

                    {/* Registration Info */}
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {registration.quantity} {registration.quantity === 1 ? 'asistente' : 'asistentes'} •{' '}
                        {registration.event?.currency === 'USD' ? '$' : 'Q'}
                        {registration.totalAmount}
                      </Typography>
                    </Box>

                    {/* Payment Status */}
                    {registration.paymentStatus && (
                      <Chip
                        label={
                          registration.paymentStatus === 'paid'
                            ? 'Pagado'
                            : registration.paymentStatus === 'pending'
                            ? 'Pago Pendiente'
                            : 'Reembolsado'
                        }
                        size="small"
                        color={
                          registration.paymentStatus === 'paid'
                            ? 'success'
                            : registration.paymentStatus === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                        sx={{ width: 'fit-content' }}
                      />
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box component={"div" as any} sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {registration.registrationStatus === 'confirmed' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<QrCode />}
                        onClick={() => handleQrModalOpen(registration)}
                      >
                        Ver QR
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EventIcon />}
                      href={`/events/${registration.eventId}`}
                    >
                      Ver Detalles
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onClose={handleQrModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Código QR - Check-in</Typography>
            <Button onClick={handleQrModalClose} size="small">
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Box component={"div" as any} sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedRegistration.event?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Registro #{selectedRegistration.id}
              </Typography>

              {/* QR Code Placeholder */}
              <Box
                component={"div" as any}
                sx={{
                  width: 300,
                  height: 300,
                  mx: 'auto',
                  my: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                }}
              >
                <QrCode sx={{ fontSize: 280, color: 'grey.400' }} />
                {/* TODO: Implement actual QR code generation */}
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                Presenta este código QR al ingresar al evento para registrar tu asistencia.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() =>
              selectedRegistration && handleDownloadQR(selectedRegistration.id)
            }
          >
            Descargar QR
          </Button>
          <Button onClick={handleQrModalClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyEvents;
