import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cart, CartItem, CartContextType, ParticipantData } from '@/types';
import type { ReactNode } from 'react';
// Import from cartService instead of api to avoid circular dependency
// cartService is implemented locally in this context for now
import { SESSION_KEYS } from '@/utils/constants';
import toast from 'react-hot-toast';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from session storage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const storedCart = sessionStorage.getItem(SESSION_KEYS.CART_ITEMS);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    };

    loadCart();
  }, []);

  // Save cart to session storage whenever it changes
  useEffect(() => {
    if (cart) {
      sessionStorage.setItem(SESSION_KEYS.CART_ITEMS, JSON.stringify(cart));
    } else {
      sessionStorage.removeItem(SESSION_KEYS.CART_ITEMS);
    }
  }, [cart]);

  const addItem = async (itemData: Omit<CartItem, 'id' | 'addedAt'>): Promise<void> => {
    try {
      setIsLoading(true);

      // For now, handle local cart management
      // TODO: Integrate with backend cart API
      const newItem: CartItem = {
        ...itemData,
        id: Date.now(), // Temporary ID
        addedAt: new Date().toISOString(),
      };

      setCart(prevCart => {
        if (!prevCart) {
          return {
            id: Date.now(),
            sessionId: `session_${Date.now()}`,
            totalItems: 1,
            subtotal: newItem.finalPrice * newItem.quantity,
            discountAmount: 0,
            promoDiscount: 0,
            total: newItem.finalPrice * newItem.quantity,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            lastActivity: new Date().toISOString(),
            isAbandoned: false,
            items: [newItem],
          };
        }

        // Check if item already exists
        const existingItemIndex = prevCart.items.findIndex(
          item => item.eventId === newItem.eventId &&
                   item.participantType === newItem.participantType
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...prevCart.items];
          const existingItem = updatedItems[existingItemIndex];
          if (existingItem) {
            existingItem.quantity += newItem.quantity;
            existingItem.total = existingItem.finalPrice * existingItem.quantity;
          }

          const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

          return {
            ...prevCart,
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal,
            total: subtotal - prevCart.discountAmount,
            lastActivity: new Date().toISOString(),
          };
        } else {
          // Add new item
          const updatedItems = [...prevCart.items, newItem];
          const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

          return {
            ...prevCart,
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal,
            total: subtotal - prevCart.discountAmount,
            lastActivity: new Date().toISOString(),
          };
        }
      });

      toast.success('Producto agregado al carrito');
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      toast.error('Error al agregar producto al carrito');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (itemId: number, updates: Partial<CartItem>): Promise<void> => {
    try {
      setIsLoading(true);

      setCart(prevCart => {
        if (!prevCart) return null;

        const updatedItems = prevCart.items.map(item => {
          if (item.id === itemId) {
            const updatedItem = { ...item, ...updates };
            updatedItem.total = updatedItem.finalPrice * updatedItem.quantity;
            return updatedItem;
          }
          return item;
        });

        const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

        return {
          ...prevCart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          total: subtotal - prevCart.discountAmount,
          lastActivity: new Date().toISOString(),
        };
      });

      toast.success('Producto actualizado');
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      toast.error('Error al actualizar producto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number): Promise<void> => {
    try {
      setIsLoading(true);

      setCart(prevCart => {
        if (!prevCart) return null;

        const updatedItems = prevCart.items.filter(item => item.id !== itemId);

        if (updatedItems.length === 0) {
          return null; // Clear cart if no items left
        }

        const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);

        return {
          ...prevCart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          total: subtotal - prevCart.discountAmount,
          lastActivity: new Date().toISOString(),
        };
      });

      toast.success('Producto removido del carrito');
    } catch (error: any) {
      console.error('Error removing cart item:', error);
      toast.error('Error al remover producto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setCart(null);
      sessionStorage.removeItem(SESSION_KEYS.CART_ITEMS);
      toast.success('Carrito vaciado');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error('Error al vaciar carrito');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const applyPromoCode = async (code: string): Promise<void> => {
    try {
      setIsLoading(true);

      // TODO: Integrate with backend promo code validation
      // For now, simulate promo code application
      if (code.toUpperCase() === 'DESCUENTO20') {
        setCart(prevCart => {
          if (!prevCart) return null;

          const discountAmount = prevCart.subtotal * 0.2; // 20% discount

          return {
            ...prevCart,
            promoCode: code,
            discountAmount,
            total: prevCart.subtotal - discountAmount,
            lastActivity: new Date().toISOString(),
          };
        });

        toast.success('Código promocional aplicado');
      } else {
        throw new Error('Código promocional inválido');
      }
    } catch (error: any) {
      console.error('Error applying promo code:', error);
      toast.error(error.message || 'Error al aplicar código promocional');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // TODO: Fetch cart from backend
      // For now, just ensure cart is up to date
      setCart(prevCart => prevCart ? {
        ...prevCart,
        lastActivity: new Date().toISOString(),
      } : null);
    } catch (error: any) {
      console.error('Error refreshing cart:', error);
      toast.error('Error al actualizar carrito');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: CartContextType = {
    cart,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyPromoCode,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};