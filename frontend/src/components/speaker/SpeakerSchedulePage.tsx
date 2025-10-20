/**
 * @fileoverview Página de Agenda del Speaker
 * @description Calendario y gestión de participaciones programadas como ponente
 *
 * Arquitectura Recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @version 1.0.0
 * @since 2024
 */

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
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mi Agenda de Speaker</h1>
        <p className="text-muted-foreground">
          Calendario de participaciones y sesiones programadas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar/Date Selector */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Próximas Fechas</h2>
            <div className="space-y-2">
              {upcomingDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "w-full p-3 text-left rounded-lg transition-colors",
                    selectedDate === date
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {new Date(date).toLocaleDateString('es-GT', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {schedule.find((s) => s.date === date)?.events.length} eventos
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <hr className="my-6" />

            <h3 className="font-semibold mb-4">Resumen del Mes</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Eventos:</span>
                <span className="text-sm font-bold">
                  {schedule.reduce((acc, s) => acc + s.events.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Keynotes:</span>
                <span className="text-sm font-bold">
                  {schedule.reduce(
                    (acc, s) => acc + s.events.filter((e) => e.type === 'keynote').length,
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Paneles:</span>
                <span className="text-sm font-bold">
                  {schedule.reduce(
                    (acc, s) => acc + s.events.filter((e) => e.type === 'panel').length,
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Talleres:</span>
                <span className="text-sm font-bold">
                  {schedule.reduce(
                    (acc, s) => acc + s.events.filter((e) => e.type === 'workshop').length,
                    0
                  )}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Schedule Details */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6">
            {new Date(selectedDate).toLocaleDateString('es-GT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>

          {currentSchedule?.events.map((event, index) => (
            <Card key={event.id} className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        variant={event.type === 'keynote' ? 'default' : 'secondary'}
                        className={cn(
                          event.type === 'keynote' ? 'bg-red-100 text-red-800' :
                          event.type === 'panel' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        )}
                      >
                        {getTypeLabel(event.type)}
                      </Badge>
                      {event.isVirtual && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Virtual
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Avatar className="w-14 h-14 bg-primary text-primary-foreground text-lg">
                    <AvatarFallback>{index + 1}</AvatarFallback>
                  </Avatar>
                </div>

                <hr className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{event.attendees} asistentes esperados</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Preparación:</p>
                        <p className="text-sm text-muted-foreground">{event.preparation}</p>
                      </div>
                    </div>
                    {event.notes && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Notas:</p>
                          <p className="text-sm text-muted-foreground">{event.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button size="sm">
                    Ver Detalles del Evento
                  </Button>
                  <Button size="sm" variant="outline">
                    Agregar Nota
                  </Button>
                  {event.isVirtual && (
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4 mr-2" />
                      Link de Reunión
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {!currentSchedule?.events.length && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay eventos programados para esta fecha
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakerSchedulePage;
