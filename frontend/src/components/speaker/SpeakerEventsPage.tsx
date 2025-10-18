import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Calendar,
  MapPin,
  Users,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SpeakerEventsPage: React.FC = () => {
  // Mock data - Replace with actual API call
  const upcomingEvents = [
    {
      id: 1,
      title: 'Transformación Digital en Empresas',
      date: '2024-03-15',
      time: '14:00',
      location: 'Auditorio Principal',
      attendees: 150,
      status: 'confirmed',
      mySession: 'Keynote Speaker',
    },
    {
      id: 2,
      title: 'Innovación Tecnológica 2024',
      date: '2024-03-20',
      time: '10:00',
      location: 'Sala de Conferencias A',
      attendees: 80,
      status: 'pending',
      mySession: 'Panel de Expertos',
    },
  ];

  const pastEvents = [
    {
      id: 3,
      title: 'Liderazgo en la Era Digital',
      date: '2024-02-10',
      time: '16:00',
      location: 'Centro de Convenciones',
      attendees: 200,
      rating: 4.8,
      feedback: 12,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Mis Eventos como Speaker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tus participaciones como ponente en eventos
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {upcomingEvents.length}
              </Typography>
              <Typography variant="body2">Eventos Próximos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {pastEvents.length}
              </Typography>
              <Typography variant="body2">Eventos Completados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                4.7
              </Typography>
              <Typography variant="body2">Rating Promedio</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                430
              </Typography>
              <Typography variant="body2">Total Asistentes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Events */}
      <Paper sx={{ mb: 4 }}>
        <Box component={"div" as any} sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Eventos Próximos
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Evento</TableCell>
                <TableCell>Mi Participación</TableCell>
                <TableCell>Fecha y Hora</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Asistentes</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {event.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{event.mySession}</TableCell>
                  <TableCell>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 16 }} />
                      {new Date(event.date).toLocaleDateString('es-GT')} - {event.time}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16 }} />
                      {event.location}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People sx={{ fontSize: 16 }} />
                      {event.attendees}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(event.status)}
                      color={getStatusColor(event.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Info />}>
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Past Events */}
      <Paper>
        <Box component={"div" as any} sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Eventos Pasados
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Evento</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Asistentes</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Feedback</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pastEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {event.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString('es-GT')}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.attendees}</TableCell>
                  <TableCell>
                    <Chip label={`⭐ ${event.rating}`} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={`${event.feedback} comentarios`} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Info />}>
                      Ver Evaluaciones
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default SpeakerEventsPage;
