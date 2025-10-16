import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  Tooltip,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore,
  LocationOn,
  Schedule,
  Person,
  CheckCircle,
  Share,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  ArrowBack,
  NavigateNext,
  PlayArrow,
  CalendarToday,
  AccessTime,
  Group,
  Star,
  StarBorder,
  Link as LinkIcon,
  Email,
  Phone,
  Public,
  Business,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { eventsService } from '@/services/eventsService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import type { Event } from '@/types/event.types';

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
            <Box component={"div" as any} sx={{ mt: 2 }}>
              <Skeleton variant="text" height={60} />
              <Skeleton variant="text" height={30} width="60%" />
              <Skeleton variant="text" height={20} width="40%" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom>
          Evento no encontrado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          El evento que buscas no existe o ha sido eliminado.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/events')}
        >
          Volver al catálogo
        </Button>
      </Container>
    );
  }

  const primaryImage = event.images.find(img => img.isPrimary) || event.images[0];
  const galleryImages = event.images.filter(img => !img.isPrimary);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer' }}
        >
          Inicio
        </MuiLink>
        <MuiLink
          component="button"
          variant="body2"
          onClick={() => navigate('/events')}
          sx={{ cursor: 'pointer' }}
        >
          Eventos
        </MuiLink>
        <Typography variant="body2" color="text.primary">
          {event.title}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Image Gallery */}
          <Paper sx={{ mb: 3, overflow: 'hidden' }}>
            <Box component={"div" as any} sx={{ position: 'relative', height: 400 }}>
              <CardMedia
                component="img"
                height="100%"
                image={event.images[selectedImageIndex]?.url || primaryImage?.url || '/placeholder-event.jpg'}
                alt={event.title}
                sx={{ objectFit: 'cover' }}
              />

              {/* Navigation arrows for gallery */}
              {event.images.length > 1 && (
                <>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    }}
                    onClick={() => setSelectedImageIndex(prev =>
                      prev > 0 ? prev - 1 : event.images.length - 1
                    )}
                  >
                    <NavigateNext sx={{ transform: 'rotate(180deg)' }} />
                  </IconButton>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    }}
                    onClick={() => setSelectedImageIndex(prev =>
                      prev < event.images.length - 1 ? prev + 1 : 0
                    )}
                  >
                    <NavigateNext />
                  </IconButton>
                </>
              )}

              {/* Action buttons */}
              <Box component={"div" as any} sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <Tooltip title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                  <IconButton
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    }}
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite ? <Favorite sx={{ color: 'error.main' }} /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Compartir">
                  <IconButton
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    }}
                    onClick={handleShare}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Thumbnail gallery */}
            {event.images.length > 1 && (
              <Box component={"div" as any} sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                {event.images.map((image, index) => (
                  <Box
                    key={image.id}
                    component="img"
                    src={image.url}
                    alt={image.alt}
                    sx={{
                      width: 80,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? '2px solid' : '2px solid transparent',
                      borderColor: selectedImageIndex === index ? 'primary.main' : 'transparent',
                      opacity: selectedImageIndex === index ? 1 : 0.7,
                      '&:hover': { opacity: 1 },
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* Event Info */}
          <Box component={"div" as any} sx={{ mb: 3 }}>
            <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box component={"div" as any} sx={{ flex: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {event.title}
                </Typography>
                <Box component={"div" as any} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={event.category.name}
                    sx={{
                      bgcolor: event.category.color,
                      color: 'white',
                    }}
                  />
                  <Chip
                    label={`${getModalityIcon(event.type.name)} ${event.type.name}`}
                    color={getModalityColor(event.type.name) as any}
                  />
                  {event.isFeatured && (
                    <Chip
                      label="⭐ Destacado"
                      sx={{
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Date and Location */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="action" />
                  <Box component={"div" as any}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(event.startDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime color="action" />
                  <Box component={"div" as any}>
                    <Typography variant="body2" color="text.secondary">
                      Hora
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="action" />
                  <Box component={"div" as any} sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ubicación
                    </Typography>
                    <Typography variant="body1">
                      {event.location || event.virtualLink || 'Por confirmar'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Description */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Descripción del Evento
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
              {event.description}
            </Typography>

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
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
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
        </Grid>
      </Grid>

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
    </Container>
  );
};

export default EventDetailPage;