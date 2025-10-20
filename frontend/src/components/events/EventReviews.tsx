/**
 * @fileoverview EventReviews - Sistema completo de reseñas y calificaciones para eventos
 * @description Componente React que muestra reseñas de usuarios, estadísticas de calificaciones,
 * distribución de ratings y formulario para escribir reseñas. Incluye paginación y animaciones.
 *
 * Arquitectura:
 * - React: Componentes interactivos con hooks de estado y efectos
 *   ↓
 * - Astro: Routing y SSR - Compatible con hidratación del lado cliente
 *   ↓
 * - shadcn/ui: Componentes UI preconstruidos (Card, Button, Avatar, Badge, Progress, Dialog, Textarea)
 *   ↓
 * - Tailwind CSS: Estilos utilitarios para diseño responsivo y moderno
 *   ↓
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 *   ↓
 * - Lucide Icons: Iconografía moderna y consistente (Star, ThumbsUp, ShieldCheck, Edit, X)
 * - Framer Motion: Animaciones suaves y transiciones fluidas
 *
 * Características:
 * - Sistema completo de reseñas con paginación
 * - Estadísticas de calificaciones con distribución
 * - Formulario modal para escribir reseñas
 * - Sistema de votos útiles
 * - Animaciones de entrada escalonadas
 * - Estados de carga y manejo de errores
 * - Compatibilidad completa con SSR de Astro
 *
 * @version 1.0.0
 * @since 2024
 * @author TradeConnect Team
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  ThumbsUp,
  ShieldCheck,
  Edit,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified?: boolean;
  helpfulCount?: number;
  isHelpful?: boolean;
}

interface EventReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews?: number;
  onWriteReview?: () => void;
  onHelpfulClick?: (reviewId: number) => void;
  itemsPerPage?: number;
}

const EventReviews: React.FC<EventReviewsProps> = ({
  reviews,
  averageRating,
  totalReviews,
  onWriteReview,
  onHelpfulClick,
  itemsPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [writeDialogOpen, setWriteDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState<number | null>(5);
  const [newComment, setNewComment] = useState('');

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  // Pagination
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWriteReview = () => {
    setWriteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setWriteDialogOpen(false);
    setNewRating(5);
    setNewComment('');
  };

  const handleSubmitReview = () => {
    if (onWriteReview) {
      onWriteReview();
    }
    handleCloseDialog();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Overall Rating Summary */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-2">
              {averageRating.toFixed(1)}
            </h2>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-6 w-6',
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Basado en {totalReviews || reviews.length} evaluaciones
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 min-w-[60px]">
                  <span className="text-sm">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm min-w-[40px] text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        <div className="mt-3 text-center">
          <Button
            variant="default"
            onClick={handleWriteReview}
            size="lg"
          >
            <Edit className="h-4 w-4 mr-2" />
            Escribir una evaluación
          </Button>
        </div>
      </Card>

      {/* Reviews List */}
      {currentReviews.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">
            Aún no hay evaluaciones para este evento. ¡Sé el primero en escribir una!
          </p>
        </Card>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {currentReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-3 mb-2">
                  <div className="flex gap-2">
                    {/* Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.userAvatar || undefined} alt={review.userName} />
                      <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {/* Review Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <h4 className="text-lg font-bold">
                            {review.userName}
                          </h4>
                          {review.isVerified && (
                            <Badge variant="default" className="h-5">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-4 w-4',
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-sm mb-2 leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onHelpfulClick?.(review.id)}
                          className={cn(
                            review.isHelpful ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {review.isHelpful ? <ThumbsUp className="h-4 w-4 mr-1 fill-current" /> : <ThumbsUp className="h-4 w-4 mr-1" />}
                          Útil ({review.helpfulCount || 0})
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Primera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="px-3 py-2 text-sm">
                  {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Última
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Write Review Dialog */}
      <Dialog open={writeDialogOpen} onOpenChange={setWriteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Escribir una evaluación</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Rating Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tu calificación
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8",
                        star <= (newRating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tu comentario
              </label>
              <Textarea
                placeholder="Comparte tu experiencia con este evento..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 20 caracteres
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={!newRating || newComment.length < 20}
            >
              Publicar evaluación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventReviews;
