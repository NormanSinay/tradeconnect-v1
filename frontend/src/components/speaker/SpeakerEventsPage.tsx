/**
 * @fileoverview Página de Eventos del Speaker
 * @description Gestión de eventos donde el usuario participa como ponente
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
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Eventos como Speaker</h1>
        <p className="text-muted-foreground">
          Gestiona tus participaciones como ponente en eventos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold mb-2">
              {upcomingEvents.length}
            </div>
            <p className="text-sm">Eventos Próximos</p>
          </CardContent>
        </Card>
        <Card className="bg-green-600 text-white">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold mb-2">
              {pastEvents.length}
            </div>
            <p className="text-sm">Eventos Completados</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold mb-2">
              4.7
            </div>
            <p className="text-sm">Rating Promedio</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold mb-2">
              430
            </div>
            <p className="text-sm">Total Asistentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Eventos Próximos</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Mi Participación</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Asistentes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <span className="font-medium">{event.title}</span>
                  </TableCell>
                  <TableCell>{event.mySession}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('es-GT')} - {event.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.attendees}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.status === 'confirmed' ? 'default' : 'secondary'}
                      className={cn(
                        event.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''
                      )}
                    >
                      {getStatusText(event.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Info className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Past Events */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Eventos Pasados</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Asistentes</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <span className="font-medium">{event.title}</span>
                  </TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString('es-GT')}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.attendees}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50">
                      ⭐ {event.rating}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {event.feedback} comentarios
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Info className="w-4 h-4 mr-2" />
                      Ver Evaluaciones
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default SpeakerEventsPage;
