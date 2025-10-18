import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SpeakerSchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2024-03-15');

  // Mock data - Replace with actual API call
  const schedule = [
    {
      id: 1,
      date: '2024-03-15',
      events: [
        {
          id: 1,
          title: 'Transformación Digital en Empresas',
          time: '09:00 - 10:30',
          type: 'keynote',
          location: 'Auditorio Principal',
          isVirtual: false,
          attendees: 150,
          preparation: 'Presentación + Demo',
          notes: 'Llevar laptop con presentación',
        },
        {
          id: 2,
          title: 'Panel: Futuro de la IA',
          time: '14:00 - 15:30',
          type: 'panel',
          location: 'Virtual - Zoom',
          isVirtual: true,
          attendees: 200,
          preparation: 'Revisar preguntas del moderador',
          notes: '',
        },
      ],
    },
    {
      id: 2,
      date: '2024-03-20',
      events: [
        {
          id: 3,
          title: 'Workshop: Innovación Tecnológica',
          time: '10:00 - 12:00',
          type: 'workshop',
          location: 'Sala de Conferencias A',
          isVirtual: false,
          attendees: 50,
          preparation: 'Material impreso + Ejercicios prácticos',
          notes: 'Confirmar equipos audiovisuales',
        },
      ],
    },
  ];

  const upcomingDates = schedule.map((s) => s.date);
  const currentSchedule = schedule.find((s) => s.date === selectedDate);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'keynote':
        return 'error';
      case 'panel':
        return 'warning';
      case 'workshop':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'keynote':
        return 'Keynote';
      case 'panel':
        return 'Panel';
      case 'workshop':
        return 'Taller';
      default:
        return type;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Mi Agenda de Speaker
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Calendario de participaciones y sesiones programadas
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Calendar/Date Selector */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Próximas Fechas
            </Typography>
            <List>
              {upcomingDates.map((date) => (
                <ListItem
                  key={date}
                  button
                  selected={selectedDate === date}
                  onClick={() => setSelectedDate(date)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <CalendarToday sx={{ mr: 2 }} />
                  <ListItemText
                    primary={new Date(date).toLocaleDateString('es-GT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    secondary={
                      schedule.find((s) => s.date === date)?.events.length + ' eventos'
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Resumen del Mes
            </Typography>
            <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Eventos:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {schedule.reduce((acc, s) => acc + s.events.length, 0)}
                </Typography>
              </Box>
              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Keynotes:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {schedule.reduce(
                    (acc, s) => acc + s.events.filter((e) => e.type === 'keynote').length,
                    0
                  )}
                </Typography>
              </Box>
              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Paneles:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {schedule.reduce(
                    (acc, s) => acc + s.events.filter((e) => e.type === 'panel').length,
                    0
                  )}
                </Typography>
              </Box>
              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Talleres:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {schedule.reduce(
                    (acc, s) => acc + s.events.filter((e) => e.type === 'workshop').length,
                    0
                  )}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Schedule Details */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {new Date(selectedDate).toLocaleDateString('es-GT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>

          {currentSchedule?.events.map((event, index) => (
            <Card key={event.id} sx={{ mb: 3 }}>
              <CardContent>
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box component={"div" as any}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {event.title}
                    </Typography>
                    <Box component={"div" as any} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={getTypeLabel(event.type)}
                        color={getTypeColor(event.type)}
                        size="small"
                      />
                      {event.isVirtual && (
                        <Chip
                          icon={<Videocam />}
                          label="Virtual"
                          color="info"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem',
                    }}
                  >
                    {index + 1}
                  </Avatar>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime color="action" />
                      <Typography variant="body2">{event.time}</Typography>
                    </Box>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn color="action" />
                      <Typography variant="body2">{event.location}</Typography>
                    </Box>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People color="action" />
                      <Typography variant="body2">
                        {event.attendees} asistentes esperados
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <Description color="action" />
                      <Box component={"div" as any}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Preparación:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.preparation}
                        </Typography>
                      </Box>
                    </Box>
                    {event.notes && (
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Description color="action" />
                        <Box component={"div" as any}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Notas:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.notes}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>

                <Box component={"div" as any} sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" size="small">
                    Ver Detalles del Evento
                  </Button>
                  <Button variant="outlined" size="small">
                    Agregar Nota
                  </Button>
                  {event.isVirtual && (
                    <Button variant="outlined" color="info" size="small">
                      Link de Reunión
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}

          {!currentSchedule?.events.length && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No hay eventos programados para esta fecha
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SpeakerSchedulePage;
