import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Star
} from 'lucide-react';

interface ActiveParticipation {
  id: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  status: 'registered' | 'confirmed' | 'in_progress' | 'completed';
  attendanceValidated: boolean;
  checkInTime?: string;
  nextSession?: string;
  instructor?: string;
}

const ActiveParticipantTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // Mock data - será reemplazado con datos reales de la API
  const activeParticipations: ActiveParticipation[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-11-15',
      eventTime: '09:00 - 17:00',
      location: 'Centro de Convenciones, Guatemala',
      modality: 'presencial',
      status: 'confirmed',
      attendanceValidated: false,
      nextSession: 'Sesión de mañana: Estrategias de Marketing',
      instructor: 'Dra. María López'
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-11-20',
      eventTime: '14:00 - 18:00',
      location: 'Online - Zoom',
      modality: 'virtual',
      status: 'registered',
      attendanceValidated: false,
      nextSession: 'Panel: Tendencias 2024',
      instructor: 'Ing. Carlos Ramírez'
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      eventDate: '2024-09-10',
      eventTime: '08:00 - 12:00',
      location: 'Hotel Marriott, Guatemala',
      modality: 'hibrido',
      status: 'completed',
      attendanceValidated: true,
      checkInTime: '08:15',
      instructor: 'Lic. Ana García'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered': return 'Inscrito';
      case 'confirmed': return 'Confirmado';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const getModalityText = (modality: string) => {
    switch (modality) {
      case 'virtual': return 'Virtual';
      case 'presencial': return 'Presencial';
      case 'hibrido': return 'Híbrido';
      default: return modality;
    }
  };

  const upcomingEvents = activeParticipations.filter(p =>
    p.status !== 'completed' && new Date(p.eventDate) >= new Date()
  ).length;

  const completedEvents = activeParticipations.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>¡Bienvenido Participante!</strong> Aquí puedes hacer seguimiento de tus eventos activos,
          validar asistencia y acceder a recursos del evento.
        </AlertDescription>
      </Alert>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#607D8B]" />
              <div>
                <p className="text-sm text-gray-600">Próximos Eventos</p>
                <p className="text-2xl font-bold">{upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold">{completedEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Asistencias Validadas</p>
                <p className="text-2xl font-bold">
                  {activeParticipations.filter(p => p.attendanceValidated).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de participaciones activas */}
      <div className="space-y-4">
        {activeParticipations.map((participation, index) => (
          <motion.div
            key={participation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{participation.eventTitle}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Instructor: {participation.instructor}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(participation.status)}>
                      {getStatusText(participation.status)}
                    </Badge>
                    {participation.attendanceValidated && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Asistencia Validada
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Información del evento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(participation.eventDate)} - {participation.eventTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{participation.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Modalidad: {getModalityText(participation.modality)}</span>
                  </div>
                  {participation.checkInTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Check-in: {participation.checkInTime}</span>
                    </div>
                  )}
                </div>

                {/* Próxima sesión */}
                {participation.nextSession && participation.status !== 'completed' && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Próxima sesión:</strong> {participation.nextSession}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Estado de asistencia */}
                {!participation.attendanceValidated && participation.status !== 'completed' && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Asistencia pendiente:</strong> Recuerda validar tu asistencia al llegar al evento
                      escaneando el código QR correspondiente.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  {participation.status !== 'completed' && (
                    <Button className="flex-1 bg-[#607D8B] hover:bg-[#546E7A]">
                      <QrCode className="w-4 h-4 mr-2" />
                      Validar Asistencia
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    Ver Detalles
                  </Button>
                  {participation.status === 'completed' && (
                    <Button variant="outline" className="flex-1">
                      <Star className="w-4 h-4 mr-2" />
                      Evaluar Evento
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recordatorio de asistencia */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <QrCode className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">¿Cómo validar mi asistencia?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Al llegar al evento, busca el código QR de check-in</li>
                <li>• Escanea el código con la app o cámara de tu dispositivo</li>
                <li>• Confirma tu asistencia cuando se te solicite</li>
                <li>• Recibirás confirmación inmediata de tu check-in</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveParticipantTab;