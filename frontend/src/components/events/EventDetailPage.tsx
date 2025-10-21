import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaShare, FaHeart, FaRegHeart, FaExternalLinkAlt } from 'react-icons/fa'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatEventDate, formatDateTime, formatRelativeDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import { useWebSocket } from '@/hooks/useWebSocket'
import { RealTimeIndicator } from '@/components/common/RealTimeIndicator'
import { LiveEventStats } from '@/components/events/LiveEventStats'
import { EventChat } from '@/components/events/EventChat'
import { EventAgenda } from '@/components/events/EventAgenda'
import type { Event, ComponentProps } from '@/types'

interface EventDetailPageProps extends ComponentProps {
  event: Event
  onRegister?: (eventId: string) => void
  onBack?: () => void
  isRegistered?: boolean
  isFavorite?: boolean
  onToggleFavorite?: (eventId: string) => void
  onShare?: (eventId: string) => void
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  event,
  onRegister,
  onBack,
  isRegistered = false,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  className,
}) => {
  const { joinEvent, leaveEvent } = useWebSocket() || {}
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Join event room for real-time updates
  useEffect(() => {
    if (joinEvent && leaveEvent) {
      joinEvent(event.id)
      return () => leaveEvent(event.id)
    }
    return
  }, [event.id, joinEvent, leaveEvent])

  const isUpcoming = new Date(event.startDate) > new Date()
  const isFull = event.capacity <= 0 // This would come from backend
  const spotsLeft = Math.max(0, event.capacity - 0) // This would come from backend

  const handleRegister = () => {
    onRegister?.(event.id)
  }

  const handleToggleFavorite = () => {
    onToggleFavorite?.(event.id)
    showToast.success(
      isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos'
    )
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      showToast.success('Enlace copiado al portapapeles')
    }
    onShare?.(event.id)
  }

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          ← Volver
        </Button>
      )}

      {/* Hero Section */}
      <div className="relative mb-8">
        <div className="relative h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg overflow-hidden">
          {event.imageUrl ? (
            <>
              <img
                src={event.imageUrl}
                alt={event.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-6xl font-bold opacity-50">
                    {event.title.charAt(0)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-6xl font-bold opacity-50">
                {event.title.charAt(0)}
              </div>
            </div>
          )}

          {/* Real-time indicator */}
          <div className="absolute top-4 left-4">
            <RealTimeIndicator />
          </div>

          {/* Overlay Actions */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleFavorite}
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="bg-white/90 hover:bg-white text-gray-900"
            >
              <FaShare />
            </Button>
          </div>

          {/* Status and Price Badges */}
          <div className="absolute bottom-4 left-4 flex space-x-2">
            <Badge
              variant={event.status === 'published' ? "default" : "secondary"}
              className="shadow-lg"
            >
              {event.status === 'published' ? 'Publicado' :
               event.status === 'draft' ? 'Borrador' :
               event.status === 'cancelled' ? 'Cancelado' : 'Completado'}
            </Badge>
            <Badge variant="secondary" className="bg-white/90 text-gray-900 font-semibold shadow-lg">
              Q{event.price.toFixed(2)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarFallback className="text-xs">
                        {event.organizerId.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>Organizado por {event.organizerId}</span>
                  </div>
                </div>
                <Badge variant="outline">{event.category}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-center text-gray-700">
                <FaCalendarAlt className="mr-3 text-primary-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">{formatEventDate(event.startDate)}</div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-700">
                <FaMapMarkerAlt className="mr-3 text-primary-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">{event.location}</div>
                  <div className="text-sm text-gray-500">
                    {formatRelativeDate(event.startDate)}
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-center text-gray-700">
                <FaUsers className="mr-3 text-primary-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">
                    {spotsLeft > 0 ? `${spotsLeft} lugares disponibles` : 'Evento lleno'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Capacidad total: {event.capacity} personas
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for additional content */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`prose prose-sm max-w-none ${!showFullDescription ? 'line-clamp-4' : ''}`}>
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  </div>
                  {event.description.length > 300 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto mt-2"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? 'Ver menos' : 'Ver más'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Categoría:</span>
                      <p>{event.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Estado:</span>
                      <p className="capitalize">{event.status}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Creado:</span>
                      <p>{formatDateTime(event.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Actualizado:</span>
                      <p>{formatDateTime(event.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agenda">
              <EventAgenda eventId={event.id} />
            </TabsContent>

            <TabsContent value="chat">
              <EventChat eventId={event.id} />
            </TabsContent>

            <TabsContent value="stats">
              <LiveEventStats eventId={event.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">
                Q{event.price.toFixed(2)}
              </CardTitle>
              {spotsLeft > 0 && (
                <p className="text-sm text-gray-600">
                  {spotsLeft} lugares disponibles
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {isRegistered ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium text-green-600">¡Estás registrado!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Recibirás actualizaciones por email
                  </p>
                </div>
              ) : (
                <>
                  {isUpcoming && !isFull ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleRegister}
                    >
                      Registrarse Ahora
                    </Button>
                  ) : isFull ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      Evento Lleno
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      Evento Pasado
                    </Button>
                  )}

                  <div className="text-xs text-gray-500 text-center">
                    Al registrarte aceptas nuestros términos y condiciones
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleShare}
              >
                <FaShare className="mr-2" />
                Compartir Evento
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleFavorite}
              >
                {isFavorite ? <FaHeart className="mr-2 text-red-500" /> : <FaRegHeart className="mr-2" />}
                {isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
              </Button>

              {event.location && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExternalLink(`https://maps.google.com/?q=${encodeURIComponent(event.location)}`)}
                >
                  <FaExternalLinkAlt className="mr-2" />
                  Ver en Maps
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}