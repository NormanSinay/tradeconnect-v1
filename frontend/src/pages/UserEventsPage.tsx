import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPlay, FaDownload, FaEye, FaCheckCircle } from 'react-icons/fa';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  status: 'confirmed' | 'completed' | 'cancelled';
  image?: string;
  progress?: number;
  modules?: number;
  completedModules?: number;
  nextSession?: string;
}

const UserEventsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada real a la API
      // const response = await fetch(`/api/v1/users/events?status=${activeTab}`);
      // const data = await response.json();

      // Datos mock por ahora
      const mockEvents: Record<string, Event[]> = {
        upcoming: [
          {
            id: 1,
            title: 'Taller de Marketing Digital',
            description: 'Aprende estrategias efectivas de marketing digital para impulsar tu negocio.',
            date: '2023-10-25',
            time: '14:00 - 18:00',
            modality: 'virtual',
            status: 'confirmed',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 2,
            title: 'Conferencia Innovación',
            description: 'Evento anual que reúne a los principales líderes empresariales.',
            date: '2023-11-05',
            time: '09:00 - 17:00',
            modality: 'presencial',
            status: 'confirmed',
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
          }
        ],
        active: [
          {
            id: 3,
            title: 'Curso de Gestión Empresarial',
            description: 'Curso completo sobre gestión y administración empresarial.',
            date: '2023-10-28',
            time: '19:00 - 21:00',
            modality: 'virtual',
            status: 'confirmed',
            progress: 65,
            modules: 12,
            completedModules: 8,
            nextSession: '2023-10-28',
            image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 4,
            title: 'Diplomado en Liderazgo',
            description: 'Desarrolla habilidades de liderazgo para gestionar equipos.',
            date: '2023-10-30',
            time: '18:00 - 20:00',
            modality: 'virtual',
            status: 'confirmed',
            progress: 30,
            modules: 10,
            completedModules: 3,
            nextSession: '2023-10-30',
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
          }
        ],
        completed: [],
        past: [
          {
            id: 5,
            title: 'Taller de Finanzas Personales',
            description: 'Aprende a gestionar tus finanzas personales de manera efectiva.',
            date: '2023-08-15',
            time: '14:00 - 18:00',
            modality: 'virtual',
            status: 'completed'
          },
          {
            id: 6,
            title: 'Conferencia de Tecnología',
            description: 'Las últimas tendencias en tecnología empresarial.',
            date: '2023-07-22',
            time: '09:00 - 17:00',
            modality: 'presencial',
            status: 'completed'
          },
          {
            id: 7,
            title: 'Curso de Ventas',
            description: 'Técnicas avanzadas de ventas y negociación.',
            date: '2023-06-10',
            time: '19:00 - 21:00',
            modality: 'virtual',
            status: 'completed'
          }
        ]
      };

      setEvents(mockEvents[activeTab] || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', variant: 'default' as const },
      completed: { label: 'Completado', variant: 'secondary' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'virtual':
        return <FaPlay className="text-blue-500" />;
      case 'presencial':
        return <FaMapMarkerAlt className="text-green-500" />;
      case 'hibrido':
        return <FaCalendarAlt className="text-purple-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  const renderEventCard = (event: Event) => (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {event.image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              {getStatusBadge(event.status)}
            </div>
          </div>
        )}

        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            {!event.image && getStatusBadge(event.status)}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-gray-600 mb-4">{event.description}</p>

          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FaCalendarAlt />
              <span>{new Date(event.date).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              {getModalityIcon(event.modality)}
              <span className="capitalize">{event.modality}</span>
            </div>
          </div>

          {event.progress !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso</span>
                <span>{event.progress}%</span>
              </div>
              <Progress value={event.progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Módulos: {event.completedModules}/{event.modules}</span>
                {event.nextSession && (
                  <span>Próxima: {new Date(event.nextSession).toLocaleDateString('es-ES')}</span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1">
              <FaEye className="mr-2" />
              Ver Detalles
            </Button>

            {activeTab === 'upcoming' && (
              <Button className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30]">
                <FaPlay className="mr-2" />
                Acceder
              </Button>
            )}

            {activeTab === 'active' && (
              <Button className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30]">
                <FaPlay className="mr-2" />
                Continuar
              </Button>
            )}

            {(activeTab === 'completed' || activeTab === 'past') && (
              <Button className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30]">
                <FaDownload className="mr-2" />
                Ver Certificado
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta página.</p>
          <Link to="/login">
            <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user?.name}</span>
              <Link to="/dashboard">
                <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-6 sm:px-0"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Eventos y Cursos</h1>
            <p className="mt-2 text-gray-600">Gestiona tu participación en eventos y cursos</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
              <TabsTrigger value="active">En Curso</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
              <TabsTrigger value="past">Pasados</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto"></div>
                  <p className="text-gray-600 mt-4">Cargando eventos...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12">
                  <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay eventos en esta categoría
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'upcoming' && 'No tienes eventos próximos registrados.'}
                    {activeTab === 'active' && 'No tienes cursos activos en este momento.'}
                    {activeTab === 'completed' && 'Aún no has completado ningún evento.'}
                    {activeTab === 'past' && 'No hay eventos pasados para mostrar.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map(renderEventCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default UserEventsPage;