import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  Schedule,
  Person,
  ShoppingCart,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { eventsService } from '@/services/eventsService';
import { useCart } from '@/context/CartContext';
import type { EventCardProps } from '@/types/event.types';

const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  compact = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const [imageLoading, setImageLoading] = useState(true);

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (isFavorite) {
        await eventsService.removeFromFavorites(eventId);
      } else {
        await eventsService.addToFavorites(eventId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast.success(isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos');
      onToggleFavorite?.(event.id);
    },
    onError: () => {
      toast.error('Error al actualizar favoritos');
    },
  });

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(event.id);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  const handleAddToCart = async () => {
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
      onAddToCart?.(event.id);
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  const handleToggleFavorite = () => {
    favoriteMutation.mutate(event.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
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

  const primaryImage = event.images.find(img => img.isPrimary) || event.images[0];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
          borderColor: 'primary.main',
        },
        cursor: 'pointer',
      }}
      onClick={handleViewDetails}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', height: compact ? 160 : 200 }}>
        {imageLoading && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
        <CardMedia
          component="img"
          height="100%"
          image={primaryImage?.url || '/placeholder-event.jpg'}
          alt={event.title}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
          sx={{
            objectFit: 'cover',
            display: imageLoading ? 'none' : 'block',
          }}
        />

        {/* Badges */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {event.isFeatured && (
            <Chip
              label="Destacado"
              size="small"
              sx={{
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                fontWeight: 'bold',
              }}
            />
          )}
          <Chip
            label={`${getModalityIcon(event.type.name)} ${event.type.name}`}
            size="small"
            color={getModalityColor(event.type.name) as any}
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        {/* Favorite Button */}
        <Tooltip title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite();
            }}
            disabled={favoriteMutation.isPending}
          >
            {isFavorite ? (
              <Favorite sx={{ color: 'error.main' }} />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        </Tooltip>

        {/* Price Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}
        >
          {event.price === 0 ? 'Gratis' : `Q${event.price}`}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Title */}
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 1,
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            minHeight: '2.6em',
          }}
        >
          {event.title}
        </Typography>

        {/* Category */}
        <Box sx={{ mb: 1 }}>
          <Chip
            label={event.category.name}
            size="small"
            sx={{
              bgcolor: event.category.color,
              color: 'white',
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {/* Date and Location */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(event.startDate)} • {formatTime(event.startDate)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {event.location || event.virtualLink || 'Ubicación por confirmar'}
            </Typography>
          </Box>
        </Box>

        {/* Capacity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {event.availableSpots} plazas disponibles
          </Typography>
        </Box>

        {/* Description Preview */}
        {!compact && event.shortDescription && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            }}
          >
            {event.shortDescription}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
          sx={{ flex: 1, mr: 1 }}
        >
          Ver detalles
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<ShoppingCart />}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={event.availableSpots === 0}
          sx={{ flex: 1 }}
        >
          {event.availableSpots === 0 ? 'Agotado' : 'Agregar'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default EventCard;