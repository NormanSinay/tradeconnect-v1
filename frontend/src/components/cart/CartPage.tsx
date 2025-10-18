import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  Tag,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import type { CartItem } from '@/types';
import { cn } from '@/lib/utils';

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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-muted-foreground mb-8">
          ¡Explora nuestros eventos y agrega algunos a tu carrito!
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ver Eventos
          </Button>
          <Button onClick={() => navigate('/')}>
            Ir al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Carrito de Compras
        </h1>
        <p className="text-muted-foreground">
          {cart.totalItems} {cart.totalItems === 1 ? 'producto' : 'productos'} en tu carrito
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Productos</h3>
              <Button
                variant="destructive"
                onClick={() => setShowClearDialog(true)}
                disabled={isLoading}
              >
                Vaciar carrito
              </Button>
            </div>

            <div className="space-y-4">
              {cart.items.map((item: CartItem) => (
                <Card key={item.id} className="flex p-4">
                  {/* Event Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.event?.media?.find(m => m.isPrimary)?.filePath || '/placeholder-event.jpg'}
                      alt={item.event?.title || 'Evento'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="flex flex-col flex-1 ml-4">
                    <h4 className="text-lg font-semibold mb-2">
                      {item.event?.title || 'Evento'}
                    </h4>

                    <div className="flex gap-2 mb-2">
                      <Badge
                        style={{
                          backgroundColor: item.event?.eventCategory?.color,
                          color: 'white',
                        }}
                      >
                        {item.event?.eventCategory?.name || 'Categoría'}
                      </Badge>
                      <Badge variant="outline">
                        {item.participantType === 'individual' ? 'Individual' : 'Empresa'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {item.event?.startDate ? new Date(item.event.startDate).toLocaleDateString('es-GT') : ''}
                    </p>

                    <p className="text-sm text-gray-600">
                      Precio unitario: {formatPrice(item.finalPrice)}
                    </p>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoading}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            handleQuantityChange(item.id, value);
                          }
                        }}
                        className="w-16 text-center"
                        min={1}
                        disabled={isLoading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Total Price */}
                    <p className="text-lg font-bold">
                      {formatPrice(item.total)}
                    </p>

                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h3 className="text-lg font-bold mb-4">
              Resumen de la Orden
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento:</span>
                  <span>-{formatPrice(cart.discountAmount)}</span>
                </div>
              )}

              <hr />

              <div className="flex justify-between font-bold">
                <span className="text-lg">Total:</span>
                <span className="text-lg">{formatPrice(cart.total)}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">
                Código Promocional
              </h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Ingresa código"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  onClick={handleApplyPromoCode}
                  disabled={isLoading || !promoCode.trim()}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Aplicar
                </Button>
              </div>
              {cart.promoCode && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  Código "{cart.promoCode}" aplicado
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <Button
              className="w-full py-3 text-lg mb-3"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              Proceder al Pago
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/events')}
            >
              Continuar Comprando
            </Button>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Pago seguro</strong> - Todas las transacciones están protegidas con encriptación SSL
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Clear Cart Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Vaciar carrito?</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            ¿Estás seguro de que quieres remover todos los productos de tu carrito?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleClearCart}>
              Vaciar Carrito
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartPage;