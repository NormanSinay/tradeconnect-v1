/**
 * @fileoverview CheckoutSummary - Componente de resumen del carrito en checkout
 * @description Componente React para mostrar resumen de orden en proceso de pago
 *
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 * - React: Componentes interactivos con hooks y state management
 * - Astro: Server-side rendering (SSR) y routing
 * - shadcn/ui: Componentes UI preconstruidos y accesibles
 * - Tailwind CSS: Framework CSS utilitario para estilos
 * - Radix UI: Primitivos accesibles subyacentes en shadcn/ui
 * - Lucide Icons: Iconografía moderna y consistente
 *
 * Características:
 * - Resumen completo de items del carrito
 * - Cálculos automáticos de subtotal y descuentos
 * - Información de seguridad de pago
 * - Compatibilidad SSR con Astro
 * - Diseño responsive con Tailwind CSS
 *
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface CheckoutSummaryProps {
  showSecurityBadge?: boolean;
}

/**
 * CheckoutSummary - Componente de resumen del carrito en checkout
 * Componente completamente migrado a arquitectura moderna
 * Arquitectura: React + Astro + Tailwind CSS + shadcn/ui + Radix UI + Lucide Icons
 */
const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  showSecurityBadge = true,
}) => {
  const { cart } = useCart();

  const formatPrice = (price: number) => `Q${price.toFixed(2)}`;

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto">
      <h3 className="text-lg font-bold mb-6">
        Resumen del Pedido
      </h3>

      {/* Cart Items */}
      <div className="mb-3">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex mb-2 pb-2 border-b border-border"
          >
            <img
              className="w-[70px] h-[70px] rounded-lg mr-2 object-cover"
              src={
                item.event?.media?.find((m) => m.isPrimary)?.filePath ||
                '/placeholder-event.jpg'
              }
              alt={item.event?.title}
            />
            <div className="flex-1">
              <p className="text-sm font-bold mb-0.5 leading-tight">
                {item.event?.title}
              </p>
              <p className="text-xs text-muted-foreground block mb-0.5">
                Cantidad: {item.quantity} × {formatPrice(item.finalPrice)}
              </p>
              {item.participantType && (
                <Badge variant="outline" className="text-xs h-5">
                  {item.participantType === 'individual' ? 'Individual' : 'Empresa'}
                </Badge>
              )}
            </div>
            <p className="text-sm font-bold self-start">
              {formatPrice(item.total)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-2" />

      {/* Price Breakdown */}
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <p className="text-sm text-muted-foreground">
            Subtotal ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}):
          </p>
          <p className="text-sm">{formatPrice(cart.subtotal)}</p>
        </div>

        {cart.discountAmount > 0 && (
          <div className="flex justify-between mb-1">
            <p className="text-sm text-green-600">
              <CheckCircle className="inline h-4 w-4 mr-0.5 align-middle" />
              Descuento aplicado:
            </p>
            <p className="text-sm text-green-600 font-bold">
              -{formatPrice(cart.discountAmount)}
            </p>
          </div>
        )}

        {cart.promoCode && (
          <div className="flex justify-between mb-1">
            <p className="text-xs text-green-600">
              Código: {cart.promoCode}
            </p>
          </div>
        )}
      </div>

      <Separator className="my-2" />

      {/* Total */}
      <div className="flex justify-between mb-3 p-2 rounded-lg bg-primary/10">
        <p className="text-lg font-bold">
          Total a Pagar:
        </p>
        <p className="text-lg text-primary font-bold">
          {formatPrice(cart.total)}
        </p>
      </div>

      {/* Security Badge */}
      {showSecurityBadge && (
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong className="block">🔒 Pago 100% Seguro</strong>
            <span className="text-muted-foreground">Encriptación SSL • PCI DSS Compliant</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Additional Info */}
      <div className="mt-2">
        <p className="text-xs text-muted-foreground block">
          • Factura FEL incluida
        </p>
        <p className="text-xs text-muted-foreground block">
          • Certificados digitales
        </p>
        <p className="text-xs text-muted-foreground block">
          • Código QR de acceso
        </p>
      </div>
    </Card>
  );
};

export default CheckoutSummary;
