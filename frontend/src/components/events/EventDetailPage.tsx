import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Share,
  Heart,
  ShoppingCart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  Link as LinkIcon,
  Mail,
  Phone,
  Globe,
  Building,
  CalendarDays,
  Clock as AccessTime,
  LocateIcon as LocationOn,
  Heart as Favorite,
  Heart as FavoriteBorder,
  Globe as Public,
  ChevronRight as NavigateNext,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { eventsService } from '@/services/eventsService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import type { Event } from '@/types/event.types';
import { cn } from '@/lib/utils';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch event details
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getEventById(id!),
    enabled: !!id,
  });

  // Fetch related events
  const { data: relatedEvents } = useQuery({
    queryKey: ['events', 'related', event?.id],
    queryFn: () => eventsService.getRelatedEvents(event!.id, 4),
    enabled: !!event?.id,
  });

  useEffect(() => {
    if (event) {
      // Check if event is in favorites (would need to implement this)
      // setIsFavorite(checkIfFavorite(event.id));
    }
  }, [event]);

  const handleAddToCart = async () => {
    if (!event) return;

    try {
      await addItem({
        eventId: parseInt(event.id),
        quantity: 1,
        basePrice: event.price,
        discountAmount: 0,
        finalPrice: event.price,
        participantType: 'individual',
        total: event.price,
        isGroupRegistration: false,
      });
      toast.success('Evento agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  const handleToggleFavorite = async () => {
    if (!event || !isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar a favoritos');
      return;
    }

    try {
      if (isFavorite) {
        await eventsService.removeFromFavorites(event.id);
        toast.success('Removido de favoritos');
      } else {
        await eventsService.addToFavorites(event.id);
        toast.success('Agregado a favoritos');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Evento',
          text: event?.shortDescription || 'Descubre este evento',
          url,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModalityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'presencial':
        return 'success';
      case 'virtual':
        return 'info';
      case 'hibrido':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getModalityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'presencial':
        return '🏢';
      case 'virtual':
        return '💻';
      case 'hibrido':
        return '🔄';
      default:
        return '📅';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Evento no encontrado
        </h2>
        <p className="text-muted-foreground mb-6">
          El evento que buscas no existe o ha sido eliminado.
        </p>
        <Button onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al catálogo
        </Button>
      </div>
    );
  }

  const primaryImage = event.images.find(img => img.isPrimary) || event.images[0];
  const galleryImages = event.images.filter(img => !img.isPrimary);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <button
          onClick={() => navigate('/')}
          className="hover:text-foreground transition-colors"
        >
          Inicio
        </button>
        <span className="mx-2">/</span>
        <button
          onClick={() => navigate('/events')}
          className="hover:text-foreground transition-colors"
        >
          Eventos
        </button>
        <span className="mx-2">/</span>
        <span className="text-foreground">{event.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <Card className="mb-6 overflow-hidden">
            <div className="relative h-96">
              <img
                src={event.images[selectedImageIndex]?.url || primaryImage?.url || '/placeholder-event.jpg'}
                alt={event.title}
                className="w-full h-full object-cover"
              />

              {/* Navigation arrows for gallery */}
              {event.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                    onClick={() => setSelectedImageIndex(prev =>
                      prev > 0 ? prev - 1 : event.images.length - 1
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                    onClick={() => setSelectedImageIndex(prev =>
                      prev < event.images.length - 1 ? prev + 1 : 0
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white/80 hover:bg-white/90"
                  onClick={handleToggleFavorite}
                  title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white/80 hover:bg-white/90"
                  onClick={handleShare}
                  title="Compartir"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Thumbnail gallery */}
            {event.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {event.images.map((image, index) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={image.alt}
                    className={`w-20 h-16 object-cover rounded cursor-pointer border-2 transition-opacity ${
                      selectedImageIndex === index
                        ? 'border-primary opacity-100'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Event Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">
                  {event.title}
                </h1>
                <div className="flex gap-2 mb-4">
                  <Badge
                    style={{ backgroundColor: event.category.color, color: 'white' }}
                  >
                    {event.category.name}
                  </Badge>
                  <Badge variant="outline">
                    {getModalityIcon(event.type.name)} {event.type.name}
                  </Badge>
                  {event.isFeatured && (
                    <Badge variant="secondary">
                      ⭐ Destacado
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDate(event.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AccessTime className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="font-medium">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <LocationOn className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">
                    {event.location || event.virtualLink || 'Por confirmar'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <h2 className="text-xl font-bold mb-3">
              Descripción del Evento
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {event.description}
            </p>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <Box component={"div" as any} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Ponentes
                </Typography>
                <Grid container spacing={2}>
                  {event.speakers.map((speaker) => (
                    <Grid item xs={12} sm={6} key={speaker.id}>
                      <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                        <Avatar
                          sx={{ width: 60, height: 60, mr: 2 }}
                        >
                          {speaker.photo ? (
                            <img src={speaker.photo} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            speaker.name.charAt(0)
                          )}
                        </Avatar>
                        <Box component={"div" as any} sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {speaker.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {speaker.specialties.join(', ')}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {speaker.bio}
                          </Typography>
                          {speaker.socialLinks && (
                            <Box component={"div" as any} sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              {speaker.socialLinks.linkedin && (
                                <IconButton size="small" href={speaker.socialLinks.linkedin} target="_blank">
                                  <Public fontSize="small" />
                                </IconButton>
                              )}
                              {speaker.socialLinks.website && (
                                <IconButton size="small" href={speaker.socialLinks.website} target="_blank">
                                  <LinkIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Agenda */}
            <Box component={"div" as any} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Agenda del Evento
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agenda detallada próximamente...
              </Typography>
            </Box>

            {/* What includes */}
            <Box component={"div" as any} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                ¿Qué incluye?
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Acceso completo al evento" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Materiales del curso/evento" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Certificado de participación" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Soporte técnico durante el evento" />
                </ListItem>
              </List>
            </Box>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Reserva tu lugar
            </Typography>

            {/* Price */}
            <Box component={"div" as any} sx={{ mb: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {event.price === 0 ? 'Gratis' : `Q${event.price}`}
              </Typography>
              {event.earlyBirdPrice && event.earlyBirdDeadline && (
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  Antes: Q{event.earlyBirdPrice}
                </Typography>
              )}
            </Box>

            {/* Capacity */}
            <Box component={"div" as any} sx={{ mb: 3 }}>
              <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person color="action" />
                <Typography variant="body2">
                  {event.availableSpots} plazas disponibles de {event.capacity}
                </Typography>
              </Box>
              <Box component={"div" as any} sx={{
                width: '100%',
                height: 8,
                bgcolor: 'grey.200',
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <Box component={"div" as any} sx={{
                  width: `${(event.availableSpots / event.capacity) * 100}%`,
                  height: '100%',
                  bgcolor: event.availableSpots > 0 ? 'success.main' : 'error.main',
                  transition: 'width 0.3s ease',
                }} />
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={event.availableSpots === 0}
                sx={{ py: 1.5 }}
              >
                {event.availableSpots === 0 ? 'Agotado' : 'Agregar al carrito'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/checkout')}
                disabled={event.availableSpots === 0}
              >
                Comprar ahora
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Event Details */}
            <Box component={"div" as any} sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detalles del evento
              </Typography>
              <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                  <Typography variant="body2">{event.type.name}</Typography>
                </Box>
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Categoría:</Typography>
                  <Typography variant="body2">{event.category.name}</Typography>
                </Box>
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Duración:</Typography>
                  <Typography variant="body2">
                    {Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60))} horas
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Organizer Info */}
            <Box component={"div" as any}>
              <Typography variant="h6" gutterBottom>
                Organizador
              </Typography>
              <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Business />
                </Avatar>
                <Box component={"div" as any}>
                  <Typography variant="subtitle2">TradeConnect</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Eventos Empresariales
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </div>
      </div>

      {/* Related Events */}
      {relatedEvents && relatedEvents.length > 0 && (
        <Box component={"div" as any} sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Eventos relacionados
          </Typography>
          <Grid container spacing={3}>
            {relatedEvents.slice(0, 3).map((relatedEvent: Event) => (
              <Grid item xs={12} sm={6} md={4} key={relatedEvent.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                  onClick={() => navigate(`/events/${relatedEvent.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={relatedEvent.images[0]?.url || '/placeholder-event.jpg'}
                    alt={relatedEvent.title}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h3" noWrap>
                      {relatedEvent.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(relatedEvent.startDate)}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      {relatedEvent.price === 0 ? 'Gratis' : `Q${relatedEvent.price}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Video Dialog */}
      <Dialog
        open={showVideoDialog}
        onClose={() => setShowVideoDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Video del Evento</DialogTitle>
        <DialogContent>
          <Box component={"div" as any} sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Video del evento"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              allowFullScreen
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVideoDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventDetailPage;