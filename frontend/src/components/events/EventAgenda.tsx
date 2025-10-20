/**
 * @fileoverview EventAgenda - Componente de agenda de eventos
 * @description Componente React para mostrar la agenda de sesiones de un evento
 *
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 * - React: Componentes interactivos con hooks y state management
 * - Astro: Server-side rendering (SSR) y routing
 * - shadcn/ui: Componentes UI preconstruidos y accesibles
 * - Tailwind CSS: Framework CSS utilitario para estilos
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 * - Lucide Icons: Iconografía moderna y consistente
 *
 * Características:
 * - Agenda con timeline visual
 * - Acordeón para detalles de sesiones
 * - Información de ponentes
 * - Animaciones suaves con Framer Motion
 * - Compatibilidad SSR con Astro
 * - Diseño responsive con Tailwind CSS
 *
 * @version 1.0.0
 * @since 2024
 */

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

/**
 * EventAgenda - Componente de agenda de eventos
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
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
            <div className="mb-2 relative">
              {/* Timeline dot */}
              <div className="absolute left-8 top-6 w-4 h-4 rounded-full bg-primary border-3 border-background z-10 hidden md:block" />

              <Accordion
                value={expanded === session.id ? `session-${session.id}` : ""}
                onValueChange={() => handleChange(session.id)}
                className="ml-0 md:ml-8 shadow-md data-[state=open]:shadow-lg"
              >
                <AccordionItem value={`session-${session.id}`}>
                  <AccordionTrigger className="hover:bg-muted/50">
                    <div className="flex items-center gap-2 w-full pr-2">
                      {/* Time Badge */}
                      <div className="flex flex-col items-center min-w-[80px] bg-primary/10 text-primary rounded p-1">
                        <span className="text-xs font-bold">
                          {formatTime(session.startTime)}
                        </span>
                        <span className="text-xs">
                          {formatTime(session.endTime)}
                        </span>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-0.5">
                          <h3 className="text-lg font-semibold">
                            {session.title}
                          </h3>
                          {session.sessionType && (
                            <Badge variant="secondary" className="h-5">
                              {getSessionTypeLabel(session.sessionType)}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {session.speakerName && (
                            <div className="flex items-center gap-0.5">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {session.speakerName}
                              </span>
                            </div>
                          )}

                          {session.location && (
                            <div className="flex items-center gap-0.5">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {session.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <Separator className="mb-2" />

                    <div className="flex flex-col md:flex-row gap-3">
                      {/* Speaker Info */}
                      {session.speakerName && (
                        <div className="flex gap-2 mb-2 md:mb-0">
                          <Avatar className="w-15 h-15">
                            <AvatarImage src={session.speakerPhoto || undefined} alt={session.speakerName} />
                            <AvatarFallback>{session.speakerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-sm font-bold">
                              {session.speakerName}
                            </h4>
                            <span className="text-xs text-muted-foreground block">
                              Ponente
                            </span>
                            {session.speakerBio && (
                              <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
                                {session.speakerBio}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Session Description */}
                      <div className="flex-1">
                        {session.description && (
                          <>
                            <h4 className="text-sm font-bold mb-1">
                              Descripción
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {session.description}
                            </p>
                          </>
                        )}

                        {/* Additional Details */}
                        {session.capacity && (
                          <div className="mt-2 flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Capacidad: {session.capacity} personas
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventAgenda;
