import React from 'react'
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaStar } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatEventDate, formatDateTime } from '@/utils/date'
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
  onViewDetails?: (eventId: string) => void
  onRegister?: (eventId: string) => void
  showOrganizer?: boolean
  compact?: boolean
}

const EventCardComponent: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onRegister,
  showOrganizer = true,
  compact = false,
}) => {
  const isUpcoming = new Date(event.startDate) > new Date()
  const isFull = event.capacity > 0 // This would come from backend

  const handleViewDetails = () => {
    onViewDetails?.(event.id)
  }

  const handleRegister = () => {
    onRegister?.(event.id)
  }

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={event.imageUrl} alt={event.title} />
              <AvatarFallback>{event.title.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{event.title}</h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <FaCalendarAlt className="mr-1" />
                {formatEventDate(event.startDate)}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <FaMapMarkerAlt className="mr-1" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-sm">
                Q{event.price.toFixed(2)}
              </div>
              <Badge
                variant={isUpcoming ? "default" : "secondary"}
                className="text-xs mt-1"
              >
                {isUpcoming ? "Próximo" : "Pasado"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-4xl font-bold opacity-50">
              {event.title.charAt(0)}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={event.status === 'published' ? "default" : "secondary"}
            className="shadow-lg"
          >
            {event.status === 'published' ? 'Publicado' :
             event.status === 'draft' ? 'Borrador' :
             event.status === 'cancelled' ? 'Cancelado' : 'Completado'}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-900 font-semibold shadow-lg">
            Q{event.price.toFixed(2)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
              {event.title}
            </h3>

            {showOrganizer && (
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Avatar className="w-5 h-5 mr-2">
                  <AvatarFallback className="text-xs">
                    {event.organizerId.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>Organizado por {event.organizerId}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {event.description}
        </p>

        <div className="space-y-2">
          {/* Date & Time */}
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="mr-2 text-primary-500 flex-shrink-0" />
            <span>{formatEventDate(event.startDate)}</span>
            <span className="mx-2">•</span>
            <FaClock className="mr-1 text-primary-500 flex-shrink-0" />
            <span>{formatDateTime(event.startDate)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-primary-500 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Capacity */}
          <div className="flex items-center text-sm text-gray-600">
            <FaUsers className="mr-2 text-primary-500 flex-shrink-0" />
            <span>Capacidad: {event.capacity} personas</span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {event.category}
            </Badge>

            {isFull && (
              <Badge variant="destructive" className="text-xs">
                Agotado
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex space-x-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleViewDetails}
          >
            Ver Detalles
          </Button>

          {isUpcoming && !isFull && (
            <Button
              className="flex-1"
              onClick={handleRegister}
            >
              Registrarse
            </Button>
          )}

          {isFull && (
            <Button
              variant="secondary"
              className="flex-1"
              disabled
            >
              Agotado
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export { EventCardComponent as EventCard }