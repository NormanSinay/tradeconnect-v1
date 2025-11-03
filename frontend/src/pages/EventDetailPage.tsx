import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Share2,
  Heart,
  ShoppingCart,
  CheckCircle,
  Info
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import CheckoutWizard from '@/components/checkout/CheckoutWizard';
import AccessTypeComparison from '@/components/checkout/AccessTypeComparison';
import { CheckoutService, AccessType } from '@/services/checkoutService';

interface Event {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  location: string;
  modality: 'virtual' | 'presencial' | 'hibrido';
  price: number;
  capacity: number;
  registered: number;
  category: string;
  image: string;
  instructor: string;
  objectives: string[];
  requirements: string[];
  agenda: Array<{
    time: string;
    title: string;
    description: string;
  }>;
  rating: number;
  reviews: number;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, items } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [accessTypes, setAccessTypes] = useState<AccessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedAccessType, setSelectedAccessType] = useState<AccessType | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock event data - will be replaced with API call
  useEffect(() => {
    const mockEvent: Event = {
      id: parseInt(id || '1'),
      title: 'Taller Avanzado de Marketing Digital',
      description: 'Aprende las últimas tendencias y estrategias en marketing digital para hacer crecer tu negocio.',
      longDescription: 'Este taller intensivo te proporcionará las herramientas y conocimientos necesarios para dominar el marketing digital en la era actual. Desde estrategias de SEO avanzadas hasta campañas en redes sociales efectivas, aprenderás todo lo que necesitas para destacar en el competitivo mundo digital.',
      date: '2024-11-15',
      time: '09:00 - 17:00',
      location: 'Centro de Convenciones, Guatemala City',
      modality: 'presencial',
      price: 150,
      capacity: 50,
      registered: 23,
      category: 'Marketing Digital',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      instructor: 'Dra. María González',
      objectives: [
        'Dominar estrategias de SEO avanzadas',
        'Crear campañas efectivas en redes sociales',
        'Implementar marketing de contenidos',
        'Analizar métricas y ROI'
      ],
      requirements: [
        'Conocimientos básicos de marketing',
        'Computadora personal',
        'Acceso a internet'
      ],
      agenda: [
        { time: '09:00 - 10:30', title: 'Introducción al Marketing Digital', description: 'Conceptos básicos y tendencias actuales' },
        { time: '10:30 - 12:00', title: 'SEO Avanzado', description: 'Técnicas de optimización para motores de búsqueda' },
        { time: '12:00 - 13:00', title: 'Almuerzo', description: 'Break para networking' },
        { time: '13:00 - 14:30', title: 'Redes Sociales Estratégicas', description: 'Campañas efectivas en plataformas sociales' },
        { time: '14:30 - 16:00', title: 'Marketing de Contenidos', description: 'Creación y distribución de contenido valioso' },
        { time: '16:00 - 17:00', title: 'Análisis y Métricas', description: 'Medición de resultados y ROI' }
      ],
      rating: 4.8,
      reviews: 156
    };

    setEvent(mockEvent);

    // Load access types
    const loadAccessTypes = async () => {
      try {
        const types = await CheckoutService.getEventAccessTypes(mockEvent.id);
        setAccessTypes(types);
      } catch (error) {
        // Mock access types if API fails
        const mockTypes: AccessType[] = [
          {
            id: 1,
            name: 'General',
            description: 'Acceso estándar al evento',
            price: 150,
            benefits: ['Acceso a todas las sesiones', 'Material digital', 'Certificado de participación'],
            capacity: 30,
            sold: 23,
            available: true
          },
          {
            id: 2,
            name: 'VIP',
            description: 'Acceso premium con beneficios exclusivos',
            price: 250,
            benefits: ['Acceso prioritario', 'Sesión networking exclusiva', 'Certificado premium', 'Coffee break premium', 'Material físico'],
            capacity: 15,
            sold: 8,
            available: true
          },
          {
            id: 3,
            name: 'Expositor',
            description: 'Acceso completo para expositores',
            price: 350,
            benefits: ['Stand en exposición', 'Sesiones de networking', 'Certificado de expositor', 'Material promocional', 'Lista de contactos'],
            capacity: 5,
            sold: 2,
            available: true
          }
        ];
        setAccessTypes(mockTypes);
      }
    };

    loadAccessTypes();
    setLoading(false);
  }, [id]);

  const handleAddToCart = (accessType: AccessType) => {
    if (!event) return;

    // Create a simplified event object for cart
    const cartEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      modality: event.modality,
      price: accessType.price,
      capacity: event.capacity,
      registered: event.registered,
      category: event.category,
      image: event.image,
      type: 'conferencia' as const,
      featured: false
    };

    addToCart(cartEvent);
    setSelectedAccessType(accessType);
  };

  const handleBuyNow = (accessType: AccessType) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSelectedAccessType(accessType);
    setShowCheckout(true);
  };

  const handleCheckoutComplete = (result: any) => {
    // Handle successful checkout
    setShowCheckout(false);
    navigate('/dashboard/user/registrations', {
      state: {
        success: true,
        message: '¡Inscripción completada exitosamente!',
        qrCode: result.qrCode,
        registrationId: result.registrationId
      }
    });
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h1>
          <Button onClick={() => navigate('/events')}>
            Volver a eventos
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (showCheckout && selectedAccessType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <CheckoutWizard
            eventId={event.id}
            eventTitle={event.title}
            onComplete={handleCheckoutComplete}
            onCancel={handleCheckoutCancel}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Image */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute top-4 left-4">
                <Badge className={getModalityColor(event.modality)}>
                  {getModalityText(event.modality)}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={isWishlisted ? 'bg-red-100 text-red-600' : ''}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="secondary" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Quick Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-sm text-gray-600">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <p className="text-sm">{event.location}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <p className="text-sm">{event.registered}/{event.capacity} inscritos</p>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{event.rating}</span>
                  <span className="text-sm text-gray-600">({event.reviews} reseñas)</span>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{event.instructor}</p>
                <p className="text-sm text-gray-600">Experto en Marketing Digital</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Title and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{event.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline">{event.category}</Badge>
            <Badge variant="outline">{getModalityText(event.modality)}</Badge>
            <Badge variant="outline">{event.registered < event.capacity ? 'Disponible' : 'Agotado'}</Badge>
          </div>
        </motion.div>

        {/* Access Types Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <AccessTypeComparison
            accessTypes={accessTypes}
            selectedTypeId={selectedAccessType?.id}
            onSelectType={(type) => setSelectedAccessType(type)}
            eventTitle={event.title}
          />
        </motion.div>

        {/* Action Buttons */}
        {selectedAccessType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <Button
              onClick={() => handleBuyNow(selectedAccessType)}
              className="bg-[#6B1E22] hover:bg-[#8a2b30] flex-1"
              disabled={!isAuthenticated}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Comprar Ahora - Q{selectedAccessType.price.toLocaleString()}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAddToCart(selectedAccessType)}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Agregar al Carrito
            </Button>
          </motion.div>
        )}

        {!isAuthenticated && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>¿Quieres inscribirte?</strong> Debes iniciar sesión para poder comprar entradas.
              <Button
                variant="link"
                className="p-0 ml-2 text-blue-600 hover:text-blue-800"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{event.longDescription}</p>
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card>
              <CardHeader>
                <CardTitle>Objetivos de Aprendizaje</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {event.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Agenda */}
            <Card>
              <CardHeader>
                <CardTitle>Agenda del Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.agenda.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-shrink-0 w-24 text-sm font-medium text-[#6B1E22]">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {event.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacidad</span>
                  <span className="font-medium">{event.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inscritos</span>
                  <span className="font-medium">{event.registered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponibles</span>
                  <span className="font-medium">{event.capacity - event.registered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valoración</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{event.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetailPage;