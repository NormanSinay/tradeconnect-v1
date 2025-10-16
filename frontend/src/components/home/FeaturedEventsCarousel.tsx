import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  LocationOn,
  People,
  ArrowForward,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Event } from '@/types';

interface FeaturedEventsCarouselProps {
  events: Event[];
}

const FeaturedEventsCarousel: React.FC<FeaturedEventsCarouselProps> = ({ events }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerView = isMobile ? 1 : isTablet ? 2 : 3;
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
    <Box component={"div" as any} sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          component={"div" as any}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
            }}
          >
            Eventos Destacados
          </Typography>

          <Box component={"div" as any} sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.500',
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.500',
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        {/* Carousel */}
        <Box component={"div" as any} sx={{ position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                component={"div" as any}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {events.slice(currentIndex, currentIndex + itemsPerView).map((event) => (
                  <Card
                    key={event.id}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleEventClick(event.id)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        event.media?.[0]?.filePath ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
                      }
                      alt={event.title}
                      sx={{ objectFit: 'cover' }}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Featured Badge */}
                      {event.isFeatured && (
                        <Chip
                          label="Destacado"
                          size="small"
                          sx={{
                            bgcolor: 'accent.main',
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 1,
                          }}
                        />
                      )}

                      {/* Title */}
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {event.title}
                      </Typography>

                      {/* Short Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {event.shortDescription || event.description}
                      </Typography>

                      {/* Event Info */}
                      <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(event.startDate)}
                          </Typography>
                        </Box>

                        {event.location && (
                          <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.location}
                            </Typography>
                          </Box>
                        )}

                        <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.availableSpots} cupos disponibles
                          </Typography>
                        </Box>
                      </Box>

                      {/* Price */}
                      <Typography
                        variant="h6"
                        sx={{
                          mt: 2,
                          fontWeight: 'bold',
                          color: 'primary.main',
                        }}
                      >
                        {formatCurrency(event.price, event.currency)}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForward />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event.id);
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* View All Button */}
        <Box component={"div" as any} sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/events')}
          >
            Ver Todos los Eventos
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedEventsCarousel;
