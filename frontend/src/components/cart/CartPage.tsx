import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowBack,
  LocalOffer,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import type { CartItem } from '@/types';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isLoading, updateItem, removeItem, applyPromoCode, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateItem(itemId, { quantity: newQuantity });
    } catch (error) {
      // Error handled by context
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      // Error handled by context
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Ingresa un código promocional');
      return;
    }

    try {
      await applyPromoCode(promoCode.trim());
      setPromoCode('');
    } catch (error) {
      // Error handled by context
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearDialog(false);
    } catch (error) {
      // Error handled by context
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para continuar con la compra');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  const formatPrice = (price: number) => `Q${price.toFixed(2)}`;

  if (isLoading && !cart) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Tu carrito está vacío
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          ¡Explora nuestros eventos y agrega algunos a tu carrito!
        </Typography>
        <Box component={"div" as any} sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/events')}
          >
            Ver Eventos
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Ir al Inicio
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box component={"div" as any} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Carrito de Compras
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {cart.totalItems} {cart.totalItems === 1 ? 'producto' : 'productos'} en tu carrito
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Productos</Typography>
              <Button
                color="error"
                onClick={() => setShowClearDialog(true)}
                disabled={isLoading}
              >
                Vaciar carrito
              </Button>
            </Box>

            <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cart.items.map((item: CartItem) => (
                <Card key={item.id} sx={{ display: 'flex', p: 2 }}>
                  {/* Event Image */}
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, borderRadius: 1, objectFit: 'cover' }}
                    image={item.event?.media?.find(m => m.isPrimary)?.filePath || '/placeholder-event.jpg'}
                    alt={item.event?.title || 'Evento'}
                  />

                  {/* Event Details */}
                  <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', flex: 1, ml: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                      {item.event?.title || 'Evento'}
                    </Typography>

                    <Box component={"div" as any} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={item.event?.eventCategory?.name || 'Categoría'}
                        size="small"
                        sx={{
                          bgcolor: item.event?.eventCategory?.color,
                          color: 'white',
                        }}
                      />
                      <Chip
                        label={item.participantType === 'individual' ? 'Individual' : 'Empresa'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.event?.startDate ? new Date(item.event.startDate).toLocaleDateString('es-GT') : ''}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Precio unitario: {formatPrice(item.finalPrice)}
                    </Typography>
                  </Box>

                  {/* Quantity and Actions */}
                  <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    {/* Quantity Controls */}
                    <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoading}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            handleQuantityChange(item.id, value);
                          }
                        }}
                        inputProps={{ min: 1, style: { textAlign: 'center', width: '60px' } }}
                        disabled={isLoading}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isLoading}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    {/* Total Price */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(item.total)}
                    </Typography>

                    {/* Remove Button */}
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isLoading}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Resumen de la Orden
            </Typography>

            <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatPrice(cart.subtotal)}</Typography>
              </Box>

              {cart.discountAmount > 0 && (
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                  <Typography>Descuento:</Typography>
                  <Typography>-{formatPrice(cart.discountAmount)}</Typography>
                </Box>
              )}

              <Divider />

              <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">{formatPrice(cart.total)}</Typography>
              </Box>
            </Box>

            {/* Promo Code */}
            <Box component={"div" as any} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Código Promocional
              </Typography>
              <Box component={"div" as any} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ingresa código"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  variant="outlined"
                  onClick={handleApplyPromoCode}
                  disabled={isLoading || !promoCode.trim()}
                  startIcon={<LocalOffer />}
                >
                  Aplicar
                </Button>
              </Box>
              {cart.promoCode && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Código "{cart.promoCode}" aplicado
                </Alert>
              )}
            </Box>

            {/* Checkout Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              disabled={isLoading}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              Proceder al Pago
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/events')}
              sx={{ mt: 2 }}
            >
              Continuar Comprando
            </Button>

            {/* Security Notice */}
            <Alert severity="info" sx={{ mt: 3 }} icon={<CheckCircle />}>
              <Typography variant="body2">
                <strong>Pago seguro</strong> - Todas las transacciones están protegidas con encriptación SSL
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Clear Cart Dialog */}
      <Dialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
      >
        <DialogTitle>¿Vaciar carrito?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres remover todos los productos de tu carrito?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>Cancelar</Button>
          <Button onClick={handleClearCart} color="error" variant="contained">
            Vaciar Carrito
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage;