import React from 'react'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSearch } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Event } from '@/types'
import { formatCurrency, formatDate, getModalityText, getTypeText } from '@/utils/sampleData'
import { useCartStore } from '@/stores/cartStore'
import toast from 'react-hot-toast'

interface EventGridProps {
  events: Event[]
  loading?: boolean
}

const EventGrid: React.FC<EventGridProps> = ({ events, loading = false }) => {
  const { addToCart } = useCartStore()

  const handleAddToCart = (event: Event) => {
    addToCart(event)
    toast.success(`"${event.title}" agregado al carrito`)
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
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="relative overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <Badge
                  variant="secondary"
                  className="bg-white/90 text-gray-800 hover:bg-white"
                >
                  {getTypeText(event.type)}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-[#6B1E22]" size={14} />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-[#6B1E22]" size={14} />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-[#6B1E22]" size={14} />
                    <span className="capitalize">{getModalityText(event.modality)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-2xl font-bold text-[#6B1E22]">
                  {formatCurrency(event.price)}
                </span>
                <Button
                  onClick={() => handleAddToCart(event)}
                  className="bg-[#6B1E22] hover:bg-[#5a191e] text-white px-6"
                >
                  Inscribirse
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default EventGrid