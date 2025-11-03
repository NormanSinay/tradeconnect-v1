import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  price: number;
  capacity: number;
  registered: number;
  category: string;
  image?: string;
}

const EventCatalogTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  // Mock data - será reemplazado con datos reales de la API
  const events: Event[] = [
    {
      id: 1,
      title: 'Taller de Marketing Digital Avanzado',
      description: 'Aprende las últimas tendencias en marketing digital y estrategias efectivas para tu negocio.',
      date: '2024-11-15',
      time: '09:00 - 17:00',
      location: 'Centro de Convenciones, Guatemala',
      modality: 'presencial',
      price: 150,
      capacity: 50,
      registered: 23,
      category: 'Marketing',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      title: 'Conferencia Innovación Empresarial 2024',
      description: 'Descubre las innovaciones que están transformando el mundo empresarial.',
      date: '2024-11-20',
      time: '14:00 - 18:00',
      location: 'Online - Zoom',
      modality: 'virtual',
      price: 75,
      capacity: 200,
      registered: 145,
      category: 'Innovación',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      title: 'Seminario Gestión del Talento Humano',
      description: 'Estrategias modernas para atraer, desarrollar y retener talento en tu organización.',
      date: '2024-11-25',
      time: '08:00 - 12:00',
      location: 'Hotel Marriott, Guatemala',
      modality: 'hibrido',
      price: 120,
      capacity: 80,
      registered: 67,
      category: 'Recursos Humanos',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
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

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case 'virtual': return 'bg-blue-100 text-blue-800';
      case 'presencial': return 'bg-green-100 text-green-800';
      case 'hibrido': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-[#4CAF50] hover:text-white">
            Todos
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-[#4CAF50] hover:text-white">
            Marketing
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-[#4CAF50] hover:text-white">
            Innovación
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-[#4CAF50] hover:text-white">
            Recursos Humanos
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Filtrar por fecha
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="w-4 h-4 mr-2" />
            Filtrar por modalidad
          </Button>
        </div>
      </div>

      {/* Grid de eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={getModalityColor(event.modality)}>
                    {getModalityText(event.modality)}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {event.category}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{event.registered}/{event.capacity} inscritos</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-[#4CAF50]" />
                    <span className="font-semibold text-[#4CAF50]">
                      Q{event.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                    <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049]">
                      Inscribirme
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center pt-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" className="bg-[#4CAF50] text-white">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCatalogTab;