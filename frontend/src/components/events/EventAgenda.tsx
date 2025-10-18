import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface EventSession {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  speakerName?: string;
  speakerPhoto?: string;
  speakerBio?: string;
  sessionType?: 'keynote' | 'workshop' | 'panel' | 'break' | 'networking';
  capacity?: number;
  isActive: boolean;
}

interface EventAgendaProps {
  sessions: EventSession[];
}

const EventAgenda: React.FC<EventAgendaProps> = ({ sessions }) => {
  const [expanded, setExpanded] = useState<number | false>(false);

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSessionTypeColor = (type?: string) => {
    switch (type) {
      case 'keynote':
        return 'primary';
      case 'workshop':
        return 'secondary';
      case 'panel':
        return 'info';
      case 'break':
        return 'warning';
      case 'networking':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSessionTypeLabel = (type?: string) => {
    switch (type) {
      case 'keynote':
        return 'Conferencia Principal';
      case 'workshop':
        return 'Taller';
      case 'panel':
        return 'Panel';
      case 'break':
        return 'Descanso';
      case 'networking':
        return 'Networking';
      default:
        return 'Sesión';
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-6 text-center bg-muted rounded-lg">
        <p className="text-muted-foreground">
          La agenda del evento estará disponible próximamente
        </p>
      </div>
    );
  }

  // Sort sessions by start time
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div>
      {/* Timeline indicator */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-primary/30 hidden md:block" />

        {sortedSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Box component={"div" as any} sx={{ mb: 2, position: 'relative' }}>
              {/* Timeline dot */}
              <Box
                component={"div" as any}
                sx={{
                  position: 'absolute',
                  left: 32,
                  top: 24,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  border: '3px solid',
                  borderColor: 'background.paper',
                  zIndex: 1,
                  display: { xs: 'none', md: 'block' },
                }}
              />

              <Accordion
                expanded={expanded === session.id}
                onChange={handleChange(session.id)}
                sx={{
                  ml: { xs: 0, md: 8 },
                  '&:before': { display: 'none' },
                  boxShadow: 2,
                  '&.Mui-expanded': {
                    boxShadow: 4,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                    {/* Time Badge */}
                    <Box
                      component={"div" as any}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 80,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {formatTime(session.startTime)}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                        {formatTime(session.endTime)}
                      </Typography>
                    </Box>

                    {/* Session Info */}
                    <Box component={"div" as any} sx={{ flex: 1 }}>
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" component="h3">
                          {session.title}
                        </Typography>
                        {session.sessionType && (
                          <Chip
                            label={getSessionTypeLabel(session.sessionType)}
                            size="small"
                            color={getSessionTypeColor(session.sessionType) as any}
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>

                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        {session.speakerName && (
                          <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {session.speakerName}
                            </Typography>
                          </Box>
                        )}

                        {session.location && (
                          <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Room sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {session.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Divider sx={{ mb: 2 }} />

                  <Box component={"div" as any} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    {/* Speaker Info */}
                    {session.speakerName && (
                      <Box component={"div" as any} sx={{ display: 'flex', gap: 2, mb: { xs: 2, md: 0 } }}>
                        <Avatar
                          src={session.speakerPhoto || undefined}
                          alt={session.speakerName}
                          sx={{ width: 60, height: 60 }}
                        >
                          {session.speakerName.charAt(0)}
                        </Avatar>
                        <Box component={"div" as any}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {session.speakerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Ponente
                          </Typography>
                          {session.speakerBio && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 300 }}>
                              {session.speakerBio}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Session Description */}
                    <Box component={"div" as any} sx={{ flex: 1 }}>
                      {session.description && (
                        <>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Descripción
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {session.description}
                          </Typography>
                        </>
                      )}

                      {/* Additional Details */}
                      {session.capacity && (
                        <Box component={"div" as any} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Capacidad: {session.capacity} personas
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default EventAgenda;
