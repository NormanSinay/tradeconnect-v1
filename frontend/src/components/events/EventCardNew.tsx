import React, { useState } from 'react';
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaShoppingCart,
  FaEye,
  FaBuilding,
  FaLaptop,
  FaSyncAlt,
  FaCalendar,
  FaStar,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tantml:function_calls';
import { toast } from 'react-hot-toast';
import { eventsService } from '@/services/eventsService';
import { useCart } from '@/context/CartContext';
import type { EventCardProps } from '@/types/event.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * EventCardNew - Tarjeta de evento con imagen, detalles y acciones
 * Migrado de MUI a Tailwind CSS + shadcn/ui
 */
const EventCardNew: React.FC<EventCardProps> = ({
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
      toast.success(
        isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos'
      );
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
        return 'bg-success text-white';
      case 'virtual':
        return 'bg-info text-white';
      case 'hibrido':
        return 'bg-warning text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getModalityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'presencial':
        return <FaBuilding className="h-3 w-3" />;
      case 'virtual':
        return <FaLaptop className="h-3 w-3" />;
      case 'hibrido':
        return <FaSyncAlt className="h-3 w-3" />;
      default:
        return <FaCalendar className="h-3 w-3" />;
    }
  };

  const primaryImage =
    event.images.find((img) => img.isPrimary) || event.images[0];

  return (
    <Card
      className="h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border-2 hover:border-primary-500 group"
      onClick={handleViewDetails}
    >
      {/* Image Container */}
      <div
        className={`relative ${
          compact ? 'h-40' : 'h-52'
        } overflow-hidden bg-gray-200`}
      >
        {/* Loading Skeleton */}
        {imageLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}

        {/* Image */}
        <img
          src={primaryImage?.url || '/placeholder-event.jpg'}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            imageLoading ? 'hidden' : 'block'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />

        {/* Top Left Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {event.isFeatured && (
            <Badge className="bg-warning text-white font-bold gap-1">
              <FaStar className="h-3 w-3" />
              Destacado
            </Badge>
          )}
          <Badge className={`${getModalityColor(event.type.name)} gap-1 text-xs`}>
            {getModalityIcon(event.type.name)}
            {event.type.name}
          </Badge>
        </div>

        {/* Favorite Button */}
        <button
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite();
          }}
          disabled={favoriteMutation.isPending}
          aria-label={
            isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
          }
        >
          {isFavorite ? (
            <FaHeart className="h-5 w-5 text-error" />
          ) : (
            <FaRegHeart className="h-5 w-5 text-gray-700" />
          )}
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-2 right-2 px-3 py-1 bg-primary-600 text-white rounded-lg font-bold text-sm shadow-lg">
          {event.price === 0 ? 'Gratis' : `Q${event.price}`}
        </div>
      </div>

      <CardContent className="flex-grow pt-4 pb-2">
        {/* Title */}
        <h2 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem] leading-tight text-gray-900">
          {event.title}
        </h2>

        {/* Category Badge */}
        <div className="mb-3">
          <Badge
            className="text-xs"
            style={{
              backgroundColor: event.category.color,
              color: 'white',
            }}
          >
            {event.category.name}
          </Badge>
        </div>

        {/* Date and Location */}
        <div className="space-y-2 mb-3">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaClock className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatDate(event.startDate)} • {formatTime(event.startDate)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaMapMarkerAlt className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {event.location ||
                event.virtualLink ||
                'Ubicación por confirmar'}
            </span>
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <FaUser className="h-4 w-4 flex-shrink-0" />
          <span>{event.availableSpots} plazas disponibles</span>
        </div>

        {/* Description Preview */}
        {!compact && event.shortDescription && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-4 flex gap-2">
        {/* View Details Button */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          <FaEye className="h-4 w-4" />
          Ver detalles
        </Button>

        {/* Add to Cart Button */}
        <Button
          variant="default"
          size="sm"
          className="flex-1 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={event.availableSpots === 0}
        >
          <FaShoppingCart className="h-4 w-4" />
          {event.availableSpots === 0 ? 'Agotado' : 'Agregar'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCardNew;
