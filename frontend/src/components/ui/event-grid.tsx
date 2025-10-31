import React from 'react'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSearch, FaUser, FaStar, FaImage, FaChalkboardTeacher, FaLaptop, FaHandshake } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Event } from '@/types'
import { formatCurrency, formatDate, getModalityText, getTypeText } from '@/utils/sampleData'
import { useCartStore } from '@/stores/cartStore'
import toast from 'react-hot-toast'

interface EventGridProps {
  events: (Event | BackendEvent)[]
  loading?: boolean
}

interface BackendEvent {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  price: number
  modality: string
  eventType?: { name: string }
  eventCategory?: { name: string }
  image?: string
  featured?: boolean
}

const EventGrid: React.FC<EventGridProps> = ({ events, loading = false }) => {
  const { addToCart } = useCartStore()

  const handleAddToCart = (event: Event | BackendEvent) => {
    // Transform backend event to frontend format if needed
    const eventToAdd: Event = 'eventType' in event ? {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.startDate,
      time: `${event.startDate} - ${event.endDate}`,
      location: event.modality === 'virtual' ? 'Virtual' : 'Presencial',
      modality: (event.modality as 'presencial' | 'virtual' | 'hibrido') || 'presencial',
      type: (event.eventType?.name as 'conferencia' | 'taller' | 'networking' | 'seminario' | 'curso') || 'conferencia',
      price: event.price,
      image: event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      featured: event.featured || false,
      category: event.eventCategory?.name || 'general'
    } : (event as Event)

    addToCart(eventToAdd)
    toast.success(`"${eventToAdd.title}" agregado al carrito`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-300 rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <motion.div
            className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <FaSearch size={32} className="text-gray-400" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron eventos
          </h3>
          <p className="text-gray-500 mb-6">
            No hay eventos disponibles que coincidan con tu búsqueda en este momento.
          </p>
          <p className="text-sm text-gray-400">
            Intenta con otros términos de búsqueda o revisa más tarde.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {events.map((event, index) => {
        // Determine if it's a backend event or frontend event
        const isBackendEvent = 'eventType' in event;
        const eventType = isBackendEvent ? (event.eventType?.name || 'evento') : (event as Event).type;
        const eventDate = isBackendEvent ? event.startDate : (event as Event).date;
        const eventTime = isBackendEvent ? `${event.startDate} - ${event.endDate}` : (event as Event).time;
        const eventImage = isBackendEvent ? (event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80') : (event as Event).image;

        // Check if image exists and is valid
        const hasValidImage = eventImage && eventImage !== 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

        // Get appropriate fallback icon based on event type
        const getFallbackIcon = () => {
          switch (eventType?.toLowerCase()) {
            case 'conferencia':
            case 'conferences':
              return FaChalkboardTeacher;
            case 'taller':
            case 'workshop':
              return FaLaptop;
            case 'networking':
            case 'redes':
              return FaHandshake;
            default:
              return FaImage;
          }
        };

        const FallbackIcon = getFallbackIcon();

        // Format time properly - extract only time part
        const formatTime = (timeString: string) => {
          try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('es-GT', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          } catch {
            return timeString;
          }
        };

        const startTime = isBackendEvent ? formatTime(event.startDate) : eventTime.split(' - ')[0] || '00:00';
        const endTime = isBackendEvent ? formatTime(event.endDate) : eventTime.split(' - ')[1] || '00:00';

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white border border-gray-200 hover:border-[#6B1E22]/20 max-w-sm mx-auto">
              <div className="relative overflow-hidden">
                {hasValidImage ? (
                  <img
                    src={eventImage}
                    alt={event.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-[#6B1E22]/10 to-[#2c5aa0]/10 flex items-center justify-center">
                    <FallbackIcon
                      size={48}
                      className="text-[#6B1E22] opacity-70"
                    />
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-[#6B1E22] text-white hover:bg-[#5a191e] shadow-lg text-xs px-2 py-1"
                  >
                    {getTypeText(eventType)}
                  </Badge>
                  {isBackendEvent && event.featured && (
                    <Badge
                      variant="secondary"
                      className="bg-[#28a745] text-white hover:bg-[#218838] shadow-lg text-xs px-2 py-1"
                    >
                      <FaStar className="mr-1" size={8} />
                      Destacado
                    </Badge>
                  )}
                </div>

                {/* Price badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg">
                    <span className="text-sm font-bold text-[#6B1E22]">
                      {formatCurrency(event.price)}
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2 group-hover:text-[#6B1E22] transition-colors duration-300 leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-[#6B1E22] flex-shrink-0" size={12} />
                      <span className="font-medium">{formatDate(eventDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-[#2c5aa0] flex-shrink-0" size={12} />
                      <span className="font-medium">{startTime} - {endTime}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-[#28a745] flex-shrink-0" size={12} />
                      <span className="capitalize font-medium">{getModalityText(event.modality)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <FaUser className="mr-1" size={10} />
                    <span>Disponible</span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(event)}
                    className="bg-[#6B1E22] hover:bg-[#5a191e] text-white px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm"
                  >
                    Inscribirse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  )
}

export default EventGrid