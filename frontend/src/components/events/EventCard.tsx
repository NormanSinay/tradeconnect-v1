/**
 * @fileoverview EventCard - Tarjeta de evento moderna
 * @description Componente React para mostrar información de eventos en tarjetas
 *
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 * - React: Componentes interactivos con hooks y state management
 * - Astro: Server-side rendering (SSR) y routing
 * - shadcn/ui: Componentes UI preconstruidos y accesibles
 * - Tailwind CSS: Framework CSS utilitario para estilos
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 * - Lucide Icons: Iconografía moderna y consistente
 *
 * Características:
 * - Tarjeta de evento con imagen y detalles
 * - Funcionalidad de favoritos
 * - Integración con carrito de compras
 * - Estados de carga con skeletons
 * - Compatibilidad SSR con Astro
 * - Diseño responsive con Tailwind CSS
 *
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  ShoppingCart,
  Eye,
  HeartHandshake,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { eventsService } from '@/services/eventsService';
import { useCart } from '@/context/CartContext';
import type { EventCardProps } from '@/types/event.types';
import { cn } from '@/lib/utils';

/**
 * EventCard - Tarjeta de evento moderna
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
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
      className={cn(
        'h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer border-primary-500/20 hover:border-primary-500/50'
      )}
      onClick={handleViewDetails}
    >
      {/* Image */}
      <div className="relative h-40 md:h-48">
        {imageLoading && (
          <Skeleton className="absolute top-0 left-0 w-full h-full" />
        )}
        <img
          src={primaryImage?.url || '/placeholder-event.jpg'}
          alt={event.title}
          className={cn(
            'w-full h-full object-cover',
            imageLoading ? 'hidden' : 'block'
          )}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {event.isFeatured && (
            <Badge className="bg-warning text-warning-foreground font-bold">
              Destacado
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={cn(
              'text-xs',
              getModalityColor(event.type.name) === 'success' && 'bg-green-100 text-green-800',
              getModalityColor(event.type.name) === 'info' && 'bg-blue-100 text-blue-800',
              getModalityColor(event.type.name) === 'warning' && 'bg-yellow-100 text-yellow-800'
            )}
          >
            {getModalityIcon(event.type.name)} {event.type.name}
          </Badge>
        </div>

        {/* Favorite Button */}
        <button
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full p-2 transition-colors disabled:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite();
          }}
          disabled={favoriteMutation.isPending}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {isFavorite ? (
            <Heart className="h-4 w-4 text-red-500 fill-current" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded font-bold text-sm">
          {event.price === 0 ? 'Gratis' : `Q${event.price}`}
        </div>
      </div>

      <CardContent className="flex-grow pb-1">
        {/* Title */}
        <h2 className="text-lg font-bold mb-2 line-clamp-2 leading-tight min-h-[3.25rem]">
          {event.title}
        </h2>

        {/* Category */}
        <div className="mb-2">
          <Badge
            style={{ backgroundColor: event.category.color }}
            className="text-white text-xs"
          >
            {event.category.name}
          </Badge>
        </div>

        {/* Date and Location */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDate(event.startDate)} • {formatTime(event.startDate)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate flex-1">
              {event.location || event.virtualLink || 'Ubicación por confirmar'}
            </span>
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1 mb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {event.availableSpots} plazas disponibles
          </span>
        </div>

        {/* Description Preview */}
        {!compact && event.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>
        )}
      </CardContent>

      <div className="pt-0 px-4 pb-4 flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver detalles
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={event.availableSpots === 0}
          className="flex-1"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {event.availableSpots === 0 ? 'Agotado' : 'Agregar'}
        </Button>
      </div>
    </Card>
  );
};

export default EventCard;