import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventMedia } from '@/types';
import { cn } from '@/lib/utils';

interface EventGalleryProps {
  media: EventMedia[];
}

const EventGallery: React.FC<EventGalleryProps> = ({ media }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Separate images and videos
  const images = media.filter(m => m.fileType === 'image');
  const videos = media.filter(m => m.fileType === 'video');

  // Primary media is the first image or video
  const primaryMedia = images.find(m => m.isPrimary) || images[0];
  const thumbnails = [...images, ...videos].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleOpenLightbox = () => {
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % thumbnails.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + thumbnails.length) % thumbnails.length);
  };

  const selectedMedia = thumbnails[selectedIndex];

  if (!media || media.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-center text-muted-foreground">
          No hay medios disponibles
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Primary Display */}
      <div className="mb-4 overflow-hidden relative bg-black rounded-lg">
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="relative h-80 md:h-[500px] bg-black cursor-zoom-in"
            onClick={handleOpenLightbox}
          >
            {selectedMedia?.fileType === 'image' ? (
              <Box
                component="img"
                src={selectedMedia.filePath}
                alt={selectedMedia.altText || 'Event image'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : selectedMedia?.fileType === 'video' ? (
              <video
                src={selectedMedia.filePath}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : null}

            {/* Zoom icon overlay */}
            {selectedMedia?.fileType === 'image' && (
              <Box
                component={"div" as any}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ZoomIn sx={{ color: 'white' }} />
              </Box>
            )}

            {/* Navigation Arrows */}
            {thumbnails.length > 1 && (
              <>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'white' },
                  }}
                >
                  <NavigateBefore />
                </IconButton>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'white' },
                  }}
                >
                  <NavigateNext />
                </IconButton>
              </>
            )}
          </Box>
        </motion.div>
      </Paper>

      {/* Thumbnail Grid */}
      {thumbnails.length > 1 && (
        <Grid container spacing={1}>
          {thumbnails.map((item, index) => (
            <Grid item xs={3} sm={2} md={1.5} key={item.id}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box
                  component={"div" as any}
                  sx={{
                    position: 'relative',
                    paddingTop: '75%',
                    cursor: 'pointer',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: 3,
                    borderColor: selectedIndex === index ? 'primary.main' : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: selectedIndex === index ? 'primary.main' : 'grey.400',
                    },
                  }}
                  onClick={() => handleThumbnailClick(index)}
                >
                  {item.fileType === 'image' ? (
                    <Box
                      component="img"
                      src={item.filePath}
                      alt={item.altText || `Thumbnail ${index + 1}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: selectedIndex === index ? 1 : 0.7,
                      }}
                    />
                  ) : (
                    <>
                      <Box
                        component="video"
                        src={item.filePath}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: selectedIndex === index ? 1 : 0.7,
                        }}
                      />
                      <Box
                        component={"div" as any}
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.6)',
                          borderRadius: '50%',
                          p: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PlayArrow sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                    </>
                  )}
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Lightbox Modal */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            boxShadow: 'none',
            maxWidth: '95vw',
            maxHeight: '95vh',
            m: 0,
          },
        }}
      >
        <IconButton
          onClick={handleCloseLightbox}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            zIndex: 1,
          }}
        >
          <Close />
        </IconButton>

        <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {selectedMedia?.fileType === 'image' ? (
                <Box
                  component="img"
                  src={selectedMedia.filePath}
                  alt={selectedMedia.altText || 'Event image'}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '85vh',
                    objectFit: 'contain',
                  }}
                />
              ) : selectedMedia?.fileType === 'video' ? (
                <video
                  src={selectedMedia.filePath}
                  controls
                  autoPlay
                  style={{
                    maxWidth: '100%',
                    maxHeight: '85vh',
                    objectFit: 'contain',
                  }}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Lightbox Navigation */}
          {thumbnails.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                }}
              >
                <NavigateBefore fontSize="large" />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                }}
              >
                <NavigateNext fontSize="large" />
              </IconButton>
            </>
          )}

          {/* Counter */}
          <Box
            component={"div" as any}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              px: 2,
              py: 1,
              borderRadius: 2,
            }}
          >
            {selectedIndex + 1} / {thumbnails.length}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EventGallery;
