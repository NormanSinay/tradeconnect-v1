import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  CardMedia,
  Chip,
} from '@mui/material';
import { Security, CheckCircle } from '@mui/icons-material';
import { useCart } from '@/context/CartContext';

interface CheckoutSummaryProps {
  showSecurityBadge?: boolean;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  showSecurityBadge = true,
}) => {
  const { cart } = useCart();

  const formatPrice = (price: number) => `Q${price.toFixed(2)}`;

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 3,
        position: 'sticky',
        top: 24,
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Resumen del Pedido
      </Typography>

      {/* Cart Items */}
      <Box component={"div" as any} sx={{ mb: 3 }}>
        {cart.items.map((item) => (
          <Box
            component={"div" as any}
            key={item.id}
            sx={{
              display: 'flex',
              mb: 2,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardMedia
              component="img"
              sx={{
                width: 70,
                height: 70,
                borderRadius: 2,
                mr: 2,
                objectFit: 'cover',
              }}
              image={
                item.event?.media?.find((m) => m.isPrimary)?.filePath ||
                '/placeholder-event.jpg'
              }
              alt={item.event?.title}
            />
            <Box component={"div" as any} sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 'bold', mb: 0.5, lineHeight: 1.3 }}
              >
                {item.event?.title}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                Cantidad: {item.quantity} × {formatPrice(item.finalPrice)}
              </Typography>
              {item.participantType && (
                <Chip
                  label={item.participantType === 'individual' ? 'Individual' : 'Empresa'}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 'bold', alignSelf: 'flex-start' }}
            >
              {formatPrice(item.total)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Price Breakdown */}
      <Box component={"div" as any} sx={{ mb: 2 }}>
        <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}):
          </Typography>
          <Typography variant="body2">{formatPrice(cart.subtotal)}</Typography>
        </Box>

        {cart.discountAmount > 0 && (
          <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="success.main">
              <CheckCircle sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Descuento aplicado:
            </Typography>
            <Typography variant="body2" color="success.main" fontWeight="bold">
              -{formatPrice(cart.discountAmount)}
            </Typography>
          </Box>
        )}

        {cart.promoCode && (
          <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="success.main">
              Código: {cart.promoCode}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Total */}
      <Box
        component={"div" as any}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'light'
              ? 'primary.50'
              : 'primary.dark',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Total a Pagar:
        </Typography>
        <Typography
          variant="h6"
          color="primary.main"
          sx={{ fontWeight: 'bold' }}
        >
          {formatPrice(cart.total)}
        </Typography>
      </Box>

      {/* Security Badge */}
      {showSecurityBadge && (
        <Alert
          severity="success"
          icon={<Security />}
          sx={{
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography variant="caption" display="block">
            <strong>🔒 Pago 100% Seguro</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Encriptación SSL • PCI DSS Compliant
          </Typography>
        </Alert>
      )}

      {/* Additional Info */}
      <Box component={"div" as any} sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          • Factura FEL incluida
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • Certificados digitales
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          • Código QR de acceso
        </Typography>
      </Box>
    </Paper>
  );
};

export default CheckoutSummary;
