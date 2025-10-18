import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight } from 'react-icons/fa';
import type { Event } from '@/types';

interface FeaturedEventsCarouselProps {
  events: Event[];
}

const FeaturedEventsCarousel: React.FC<FeaturedEventsCarouselProps> = ({ events }) => {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerView = 3; // Default to 3 items per view for desktop
  const maxIndex = Math.max(0, events.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl md:text-4xl font-bold text-primary">
            Eventos Destacados
          </h3>

          <div className="flex gap-2">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500"
            >
              <FaChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500"
            >
              <FaChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(currentIndex, currentIndex + itemsPerView).map((event) => (
                  <Card
                    key={event.id}
                    className="h-full flex flex-col transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-lg"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={
                          event.media?.[0]?.filePath ||
                          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
                        }
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <CardContent className="flex-grow">
                      {/* Featured Badge */}
                      {event.isFeatured && (
                        <Badge className="bg-accent text-white font-bold mb-2">
                          Destacado
                        </Badge>
                      )}

                      {/* Title */}
                      <h4 className="text-lg font-bold mb-2 line-clamp-2">
                        {event.title}
                      </h4>

                      {/* Short Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.shortDescription || event.description}
                      </p>

                      {/* Event Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatDate(event.startDate)}
                          </span>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {event.location}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <FaUsers className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {event.availableSpots} cupos disponibles
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <p className="text-lg font-bold text-primary mt-4">
                        {formatCurrency(event.price, event.currency)}
                      </p>
                    </CardContent>

                    <div className="p-4 pt-0">
                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event.id);
                        }}
                      >
                        Ver Detalles
                        <FaArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/events')}
          >
            Ver Todos los Eventos
            <FaArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEventsCarousel;
