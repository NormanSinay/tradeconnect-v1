import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import { ShoppingCart, Add, Remove } from '@mui/icons-material';
import { useCart } from '@/context/CartContext';

interface MiniCartProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

const MiniCart: React.FC<MiniCartProps> = ({ anchorEl, onClose, onOpen }) => {
  const navigate = useNavigate();
  const { cart, updateItem, removeItem } = useCart();

  const open = Boolean(anchorEl);

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
    } else {
      await updateItem(itemId, { quantity: newQuantity });
    }
  };

  const formatPrice = (price: number) => `Q${price.toFixed(2)}`;

  const totalItems = cart?.totalItems || 0;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={onOpen}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={totalItems} color="error">
          <ShoppingCart />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 600 },
        }}
      >
        <Box component={"div" as any} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Carrito de Compras
          </Typography>

          {cart && cart.items.length > 0 ? (
            <>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {cart.items.slice(0, 3).map((item) => (
                  <ListItem key={item.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        sx={{ width: 50, height: 50 }}
                      >
                        {item.event?.media?.find(m => m.isPrimary)?.filePath ? (
                          <img
                            src={item.event.media.find(m => m.isPrimary)?.filePath}
                            alt={item.event.title || 'Evento'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ) : (
                          item.event?.title?.charAt(0) || 'E'
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap>
                          {item.event?.title}
                        </Typography>
                      }
                      secondary={
                        <Box component={"div" as any}>
                          <Typography variant="caption" color="text.secondary">
                            {formatPrice(item.finalPrice)} x {item.quantity}
                          </Typography>
                          <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <Chip
                              label={item.quantity}
                              size="small"
                              sx={{ minWidth: 30 }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 1 }}>
                      {formatPrice(item.total)}
                    </Typography>
                  </ListItem>
                ))}

                {cart.items.length > 3 && (
                  <ListItem sx={{ px: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Y {cart.items.length - 3} producto{cart.items.length - 3 > 1 ? 's' : ''} más...
                    </Typography>
                  </ListItem>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box component={"div" as any} sx={{ mb: 2 }}>
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatPrice(cart.subtotal)}</Typography>
                </Box>
                {cart.discountAmount > 0 && (
                  <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main">Descuento:</Typography>
                    <Typography variant="body2" color="success.main">
                      -{formatPrice(cart.discountAmount)}
                    </Typography>
                  </Box>
                )}
                <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <Typography variant="body1">Total:</Typography>
                  <Typography variant="body1">{formatPrice(cart.total)}</Typography>
                </Box>
              </Box>

              <Box component={"div" as any} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleViewCart}
                >
                  Ver Carrito Completo
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCheckout}
                >
                  Proceder al Pago
                </Button>
              </Box>
            </>
          ) : (
            <Box component={"div" as any} sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Tu carrito está vacío
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  onClose();
                  navigate('/events');
                }}
              >
                Ver Eventos
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default MiniCart;