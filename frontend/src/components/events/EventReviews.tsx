import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  Avatar,
  Button,
  Divider,
  LinearProgress,
  Grid,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Star,
  StarBorder,
  ThumbUp,
  ThumbUpOutlined,
  VerifiedUser,
  Edit,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

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
    <Box component={"div" as any}>
      {/* Overall Rating Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Average Rating */}
          <Grid item xs={12} md={4}>
            <Box component={"div" as any} sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {averageRating.toFixed(1)}
              </Typography>
              <Rating
                value={averageRating}
                precision={0.1}
                readOnly
                size="large"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Basado en {totalReviews || reviews.length} evaluaciones
              </Typography>
            </Box>
          </Grid>

          {/* Rating Distribution */}
          <Grid item xs={12} md={8}>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <Box key={rating} component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 60 }}>
                  <Typography variant="body2">{rating}</Typography>
                  <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'warning.main',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                  {count}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>

        {/* Write Review Button */}
        <Box component={"div" as any} sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleWriteReview}
            size="large"
          >
            Escribir una evaluación
          </Button>
        </Box>
      </Paper>

      {/* Reviews List */}
      {currentReviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aún no hay evaluaciones para este evento. ¡Sé el primero en escribir una!
          </Typography>
        </Paper>
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
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Box component={"div" as any} sx={{ display: 'flex', gap: 2 }}>
                    {/* Avatar */}
                    <Avatar
                      src={review.userAvatar || undefined}
                      alt={review.userName}
                      sx={{ width: 50, height: 50 }}
                    >
                      {review.userName.charAt(0)}
                    </Avatar>

                    {/* Review Content */}
                    <Box component={"div" as any} sx={{ flex: 1 }}>
                      {/* Header */}
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {review.userName}
                          </Typography>
                          {review.isVerified && (
                            <Chip
                              icon={<VerifiedUser />}
                              label="Verificado"
                              size="small"
                              color="primary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(review.createdAt)}
                        </Typography>
                      </Box>

                      {/* Rating */}
                      <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />

                      {/* Comment */}
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {review.comment}
                      </Typography>

                      {/* Actions */}
                      <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          size="small"
                          startIcon={review.isHelpful ? <ThumbUp /> : <ThumbUpOutlined />}
                          onClick={() => onHelpfulClick?.(review.id)}
                          sx={{
                            color: review.isHelpful ? 'primary.main' : 'text.secondary',
                            textTransform: 'none',
                          }}
                        >
                          Útil ({review.helpfulCount || 0})
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Write Review Dialog */}
      <Dialog
        open={writeDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Escribir una evaluación</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Rating Input */}
          <Box component={"div" as any} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tu calificación
            </Typography>
            <Rating
              value={newRating}
              onChange={(event, newValue) => setNewRating(newValue)}
              size="large"
              emptyIcon={<StarBorder fontSize="inherit" />}
            />
          </Box>

          {/* Comment Input */}
          <Box component={"div" as any}>
            <Typography variant="subtitle2" gutterBottom>
              Tu comentario
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Comparte tu experiencia con este evento..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Mínimo 20 caracteres
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!newRating || newComment.length < 20}
          >
            Publicar evaluación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventReviews;
