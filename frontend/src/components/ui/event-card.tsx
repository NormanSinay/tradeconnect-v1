import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaVideo, FaBuilding, FaPlay } from 'react-icons/fa'

interface EventCardProps {
  id: number
  title: string
  date: string
  time?: string
  modality: 'virtual' | 'presencial' | 'hibrido'
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  type: 'event' | 'course'
  progress?: number
  image?: string
  description?: string
  location?: string
  onViewDetails?: () => void
  onContinue?: () => void
  className?: string
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  time,
  modality,
  status,
  type,
  progress,
  image,
  description,
  location,
  onViewDetails,
  onContinue,
  className = ''
}) => {
  const getStatusBadge = () => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendiente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completado', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status]
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getModalityIcon = () => {
    switch (modality) {
      case 'virtual':
        return <FaVideo className="h-4 w-4 text-blue-600" />
      case 'presencial':
        return <FaBuilding className="h-4 w-4 text-green-600" />
      case 'hibrido':
        return <FaPlay className="h-4 w-4 text-purple-600" />
      default:
        return null
    }
  }

  const getModalityText = () => {
    switch (modality) {
      case 'virtual':
        return 'Virtual'
      case 'presencial':
        return 'Presencial'
      case 'hibrido':
        return 'Híbrido'
      default:
        return modality
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className={className}
    >
      <Card className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
        {image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            />
            <div className="absolute top-3 right-3">
              {getStatusBadge()}
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {title}
            </h3>
            {!image && (
              <div className="ml-3">
                {getStatusBadge()}
              </div>
            )}
          </div>

          {progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#6B1E22] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-400" />
              <span>{formatDate(date)}</span>
            </div>

            {time && (
              <div className="flex items-center text-sm text-gray-600">
                <FaClock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{time}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              {getModalityIcon()}
              <span className="ml-2">{getModalityText()}</span>
            </div>

            {location && modality !== 'virtual' && (
              <div className="flex items-center text-sm text-gray-600">
                <FaMapMarkerAlt className="h-4 w-4 mr-2 text-gray-400" />
                <span className="line-clamp-1">{location}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t border-gray-100">
          <div className="flex gap-2 w-full">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="flex-1"
              >
                Ver Detalles
              </Button>
            )}

            {onContinue && type === 'course' && progress !== undefined && progress < 100 && (
              <Button
                size="sm"
                onClick={onContinue}
                className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
              >
                Continuar
              </Button>
            )}

            {type === 'event' && status === 'confirmed' && modality === 'virtual' && (
              <Button
                size="sm"
                className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
              >
                Acceder
              </Button>
            )}

            {type === 'event' && status === 'confirmed' && modality === 'presencial' && (
              <Button
                size="sm"
                className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
              >
                Descargar Ticket
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default EventCard