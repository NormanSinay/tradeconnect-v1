/**
 * @fileoverview EventGallery - Galería de medios para eventos
 * @description Componente React que muestra una galería interactiva de imágenes y videos de eventos.
 * Incluye lightbox modal, navegación por teclado, miniaturas y soporte para múltiples formatos.
 *
 * Arquitectura:
 * - React: Componentes interactivos con hooks de estado
 *   ↓
 * - Astro: Routing y SSR - Compatible con hidratación del lado cliente
 *   ↓
 * - shadcn/ui: Componentes UI preconstruidos (Dialog, Button)
 *   ↓
 * - Tailwind CSS: Estilos utilitarios para diseño responsivo y moderno
 *   ↓
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 *   ↓
 * - Lucide Icons: Iconografía moderna y consistente (X, ChevronRight, ChevronLeft, ZoomIn, Play)
 * - Framer Motion: Animaciones suaves y transiciones fluidas
 *
 * Características:
 * - Galería responsiva con miniaturas
 * - Lightbox modal con navegación
 * - Soporte para imágenes y videos
 * - Animaciones con Framer Motion
 * - Navegación por teclado
 * - Estados de carga optimizados
 * - Compatibilidad completa con SSR de Astro
 *
 * @version 1.0.0
 * @since 2024
 * @author TradeConnect Team
 */

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
              <img
                src={selectedMedia.filePath}
                alt={selectedMedia.altText || 'Event image'}
                className="w-full h-full object-contain"
              />
            ) : selectedMedia?.fileType === 'video' ? (
              <video
                src={selectedMedia.filePath}
                controls
                className="w-full h-full object-contain"
              />
            ) : null}

            {/* Zoom icon overlay */}
            {selectedMedia?.fileType === 'image' && (
              <div className="absolute top-4 right-4 bg-black/60 rounded-full p-2 flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Navigation Arrows */}
            {thumbnails.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Thumbnail Grid */}
      {thumbnails.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {thumbnails.map((item, index) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index ? "border-primary" : "border-transparent hover:border-gray-400"
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              {item.fileType === 'image' ? (
                <img
                  src={item.filePath}
                  alt={item.altText || `Thumbnail ${index + 1}`}
                  className={cn(
                    "w-full h-full object-cover transition-opacity",
                    selectedIndex === index ? "opacity-100" : "opacity-70"
                  )}
                />
              ) : (
                <>
                  <video
                    src={item.filePath}
                    className={cn(
                      "w-full h-full object-cover transition-opacity",
                      selectedIndex === index ? "opacity-100" : "opacity-70"
                    )}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 rounded-full p-1">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        className="max-w-[95vw] max-h-[95vh]"
      >
        <DialogContent className="p-0 bg-black/95 border-none">
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center justify-center min-h-[85vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center w-full h-full"
              >
                {selectedMedia?.fileType === 'image' ? (
                  <img
                    src={selectedMedia.filePath}
                    alt={selectedMedia.altText || 'Event image'}
                    className="max-w-full max-h-[85vh] object-contain"
                  />
                ) : selectedMedia?.fileType === 'video' ? (
                  <video
                    src={selectedMedia.filePath}
                    controls
                    autoPlay
                    className="max-w-full max-h-[85vh] object-contain"
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Lightbox Navigation */}
          {thumbnails.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-lg">
            {selectedIndex + 1} / {thumbnails.length}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventGallery;
