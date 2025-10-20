/**
 * @fileoverview ReservationSidebar - Barra lateral de reservas para eventos
 * @description Componente React que proporciona una interfaz completa para reservar plazas en eventos.
 * Incluye selección de cantidad, tipo de participante, códigos promocionales y resumen de precios.
 *
 * Arquitectura:
 * - React: Componentes interactivos con hooks de estado y efectos
 *   ↓
 * - Astro: Routing y SSR - Compatible con hidratación del lado cliente
 *   ↓
 * - shadcn/ui: Componentes UI preconstruidos (Card, Button, Input, Select, Badge, Alert)
 *   ↓
 * - Tailwind CSS: Estilos utilitarios para diseño responsivo y moderno
 *   ↓
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 *   ↓
 * - Lucide Icons: Iconografía moderna y consistente (ShoppingCart, Plus, Minus, User, Building, Tag, Info, CheckCircle, Calendar, Users)
 * - Framer Motion: Animaciones suaves y transiciones fluidas
 *
 * Características:
 * - Sidebar sticky con comportamiento inteligente
 * - Indicadores de capacidad en tiempo real
 * - Sistema de códigos promocionales
 * - Resumen de precios con descuentos
 * - Estados de carga y validaciones
 * - Compatibilidad completa con SSR de Astro
 *
 * @version 1.0.0
 * @since 2024
 * @author TradeConnect Team
 */

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
        <div className="mb-4">
          <Label htmlFor="participant-type" className="text-sm font-medium mb-2 block">
            Tipo de participante
          </Label>
          <Select
            value={participantType}
            onChange={(e) => setParticipantType(e.target.value as 'individual' | 'empresa')}
            disabled={isSoldOut}
          >
            <option value="individual">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <div>
                  <span className="text-sm font-medium">Individual</span>
                  <span className="text-xs text-muted-foreground block">Para una sola persona</span>
                </div>
              </div>
            </option>
            <option value="empresa">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <div>
                  <span className="text-sm font-medium">Empresa</span>
                  <span className="text-xs text-muted-foreground block">Facturación con NIT</span>
                </div>
              </div>
            </option>
          </Select>
        </div>

        {/* Quantity Selector */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">
            Cantidad de personas
          </Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isSoldOut}
              className="h-10 w-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Input
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= event.availableSpots && value <= 10) {
                  setQuantity(value);
                }
              }}
              type="number"
              min={1}
              max={Math.min(10, event.availableSpots)}
              className="w-20 text-center font-bold"
              disabled={isSoldOut}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= event.availableSpots || quantity >= 10 || isSoldOut}
              className="h-10 w-10 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Máximo 10 personas por reserva
          </p>
        </div>

        {/* Promo Code */}
        {!isSoldOut && onApplyPromoCode && (
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">
              Código promocional
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ingresa tu código"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={promoApplied || !!appliedPromoCode}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleApplyPromoCode}
                disabled={!promoCode.trim() || promoApplied || !!appliedPromoCode}
              >
                Aplicar
              </Button>
            </div>
            {(promoApplied || appliedPromoCode) && discount > 0 && (
              <Alert className="mt-2 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ¡{discount}% de descuento aplicado!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Price Summary */}
        <div className="mb-4 bg-muted p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Subtotal ({quantity} x Q{basePrice})</span>
            <span className="text-sm font-medium">
              Q{subtotal.toLocaleString()}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-sm text-green-600">
                Descuento ({discount}%)
              </span>
              <span className="text-sm text-green-600 font-medium">
                -Q{discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <hr className="my-2" />

          <div className="flex justify-between">
            <span className="text-lg font-bold">
              Total
            </span>
            <span className="text-lg font-bold text-primary">
              Q{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="default"
          size="lg"
          className="w-full py-6 text-lg font-bold"
          onClick={handleAddToCart}
          disabled={isSoldOut || loading}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isSoldOut ? 'Evento agotado' : loading ? 'Agregando...' : 'Agregar al carrito'}
        </Button>

        <hr className="my-6" />

        {/* Event Details Quick Info */}
        <div>
          <h4 className="text-lg font-bold mb-4">
            Detalles del evento
          </h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Fecha y hora
                </p>
                <p className="text-sm">
                  {formatDate(event.startDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Modalidad
                </p>
                <p className="text-sm">
                  {event.isVirtual ? 'Virtual' : 'Presencial'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Pago seguro
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Factura FEL
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Certificado
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReservationSidebar;
