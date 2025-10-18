import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShoppingCart,
  Plus,
  Minus,
  User,
  Building,
  Tag,
  Info,
  CheckCircle,
  Calendar,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Event } from '@/types';
import { cn } from '@/lib/utils';

interface ReservationSidebarProps {
  event: Event;
  onAddToCart: (quantity: number, participantType: 'individual' | 'empresa') => void;
  promoCode?: string;
  onApplyPromoCode?: (code: string) => void;
  discount?: number;
  loading?: boolean;
}

const ReservationSidebar: React.FC<ReservationSidebarProps> = ({
  event,
  onAddToCart,
  promoCode: appliedPromoCode,
  onApplyPromoCode,
  discount = 0,
  loading = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [participantType, setParticipantType] = useState<'individual' | 'empresa'>('individual');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Calculate prices
  const basePrice = event.price;
  const subtotal = basePrice * quantity;
  const discountAmount = discount > 0 ? (subtotal * discount) / 100 : 0;
  const total = subtotal - discountAmount;

  // Capacity calculations
  const capacityPercentage = (event.availableSpots / event.capacity) * 100;
  const isLowCapacity = event.availableSpots <= 10 && event.availableSpots > 0;
  const isSoldOut = event.availableSpots === 0;

  // Handle sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= event.availableSpots && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(quantity, participantType);
  };

  const handleApplyPromoCode = () => {
    if (promoCode.trim() && onApplyPromoCode) {
      onApplyPromoCode(promoCode.trim());
      setPromoApplied(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'sticky transition-all duration-300',
        isSticky ? 'top-6' : 'top-24'
      )}
    >
      <Card className={cn(
        'p-6 transition-all duration-300',
        isSticky ? 'border-2 border-primary' : 'border'
      )}>
        {/* Price Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">
            Reserva tu lugar
          </h3>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-primary">
              {basePrice === 0 ? 'Gratis' : `Q${basePrice.toLocaleString()}`}
            </span>
            {event.earlyBirdPrice && event.earlyBirdDeadline && (
              <span className="text-lg text-muted-foreground line-through">
                Q{event.earlyBirdPrice.toLocaleString()}
              </span>
            )}
          </div>

          {event.earlyBirdPrice && event.earlyBirdDeadline && (
            <Badge variant="secondary" className="mb-3 bg-yellow-100 text-yellow-800">
              <Tag className="h-3 w-3 mr-1" />
              Descuento early bird hasta {formatDate(event.earlyBirdDeadline)}
            </Badge>
          )}

          <p className="text-xs text-muted-foreground">
            Por participante
          </p>
        </div>

        <hr className="mb-6" />

        {/* Capacity Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Capacidad
              </span>
            </div>
            <span className="text-sm font-medium">
              {event.availableSpots} / {event.capacity}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                isSoldOut
                  ? 'bg-red-500'
                  : isLowCapacity
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              )}
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>

          {isLowCapacity && !isSoldOut && (
            <Alert className="mt-2 border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                ¡Solo quedan {event.availableSpots} plazas!
              </AlertDescription>
            </Alert>
          )}

          {isSoldOut && (
            <Alert className="mt-2 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Evento agotado
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Participant Type Selector */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de participante</InputLabel>
          <Select
            value={participantType}
            onChange={(e) => setParticipantType(e.target.value as 'individual' | 'empresa')}
            label="Tipo de participante"
            disabled={isSoldOut}
          >
            <MenuItem value="individual">
              <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                <Box component={"div" as any}>
                  <Typography variant="body2">Individual</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Para una sola persona
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <MenuItem value="empresa">
              <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business />
                <Box component={"div" as any}>
                  <Typography variant="body2">Empresa</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Facturación con NIT
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Quantity Selector */}
        <Box component={"div" as any} sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
            Cantidad de personas
          </Typography>
          <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isSoldOut}
              sx={{
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Remove />
            </IconButton>

            <TextField
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= event.availableSpots && value <= 10) {
                  setQuantity(value);
                }
              }}
              type="number"
              inputProps={{ min: 1, max: Math.min(10, event.availableSpots) }}
              sx={{
                flex: 1,
                '& input': { textAlign: 'center', fontWeight: 'bold' },
              }}
              disabled={isSoldOut}
            />

            <IconButton
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= event.availableSpots || quantity >= 10 || isSoldOut}
              sx={{
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Add />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Máximo 10 personas por reserva
          </Typography>
        </Box>

        {/* Promo Code */}
        {!isSoldOut && onApplyPromoCode && (
          <Box component={"div" as any} sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              Código promocional
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Ingresa tu código"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={promoApplied || !!appliedPromoCode}
              />
              <Button
                variant="outlined"
                onClick={handleApplyPromoCode}
                disabled={!promoCode.trim() || promoApplied || !!appliedPromoCode}
              >
                Aplicar
              </Button>
            </Stack>
            {(promoApplied || appliedPromoCode) && discount > 0 && (
              <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 1 }}>
                ¡{discount}% de descuento aplicado!
              </Alert>
            )}
          </Box>
        )}

        {/* Price Summary */}
        <Box component={"div" as any} sx={{ mb: 3, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
          <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Subtotal ({quantity} x Q{basePrice})</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Q{subtotal.toLocaleString()}
            </Typography>
          </Box>

          {discountAmount > 0 && (
            <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="success.main">
                Descuento ({discount}%)
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                -Q{discountAmount.toLocaleString()}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Q{total.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Add to Cart Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={isSoldOut || loading}
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}
        >
          {isSoldOut ? 'Evento agotado' : loading ? 'Agregando...' : 'Agregar al carrito'}
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* Event Details Quick Info */}
        <Box component={"div" as any}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Detalles del evento
          </Typography>

          <Stack spacing={1.5}>
            <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Box component={"div" as any}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Fecha y hora
                </Typography>
                <Typography variant="body2">
                  {formatDate(event.startDate)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </Typography>
              </Box>
            </Box>

            <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Box component={"div" as any}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Modalidad
                </Typography>
                <Typography variant="body2">
                  {event.isVirtual ? 'Virtual' : 'Presencial'}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Trust Badges */}
        <Box component={"div" as any} sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={<CheckCircle />} label="Pago seguro" size="small" variant="outlined" />
            <Chip icon={<CheckCircle />} label="Factura FEL" size="small" variant="outlined" />
            <Chip icon={<CheckCircle />} label="Certificado" size="small" variant="outlined" />
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReservationSidebar;
