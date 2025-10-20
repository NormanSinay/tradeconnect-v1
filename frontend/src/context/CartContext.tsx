import React, { createContext, useContext } from 'react';
import type { Cart, CartItem, CartContextType, ParticipantData } from '@/types';
import type { ReactNode } from 'react';
import { cartService } from '@/services/cartService';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// CartContext for React/Astro architecture
// Compatible with: React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui → Tailwind CSS → Radix UI → React Icons

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
   const queryClient = useQueryClient();

   // Fetch cart from backend (SSR-safe with React Query)
   const { data: cartData, isLoading: cartLoading, error: cartError } = useQuery({
     queryKey: ['cart'],
     queryFn: () => cartService.getCart(),
     staleTime: 30000, // 30 seconds
     retry: 2,
     // Disable query on server-side to prevent hydration mismatches
     enabled: typeof window !== 'undefined',
   });

   const cart = cartData?.data || null;
   const isLoading = cartLoading;

   // Mutations for cart operations (SSR-safe)
   const addItemMutation = useMutation({
     mutationFn: cartService.addItem,
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cart'] });
       // Only show toast on client-side
       if (typeof window !== 'undefined') {
         toast.success('Producto agregado al carrito');
       }
     },
     onError: (error: any) => {
       console.error('Error adding item to cart:', error);
       // Only show toast on client-side
       if (typeof window !== 'undefined') {
         toast.error(error.response?.data?.message || 'Error al agregar producto al carrito');
       }
     },
   });

   const updateItemMutation = useMutation({
     mutationFn: ({ itemId, updates }: { itemId: number; updates: Partial<CartItem> }) =>
       cartService.updateItem(itemId, updates),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cart'] });
       if (typeof window !== 'undefined') {
         toast.success('Producto actualizado');
       }
     },
     onError: (error: any) => {
       console.error('Error updating cart item:', error);
       if (typeof window !== 'undefined') {
         toast.error(error.response?.data?.message || 'Error al actualizar producto');
       }
     },
   });

   const removeItemMutation = useMutation({
     mutationFn: cartService.removeItem,
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cart'] });
       if (typeof window !== 'undefined') {
         toast.success('Producto removido del carrito');
       }
     },
     onError: (error: any) => {
       console.error('Error removing cart item:', error);
       if (typeof window !== 'undefined') {
         toast.error(error.response?.data?.message || 'Error al remover producto');
       }
     },
   });

   const clearCartMutation = useMutation({
     mutationFn: cartService.clearCart,
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cart'] });
       if (typeof window !== 'undefined') {
         toast.success('Carrito vaciado');
       }
     },
     onError: (error: any) => {
       console.error('Error clearing cart:', error);
       if (typeof window !== 'undefined') {
         toast.error(error.response?.data?.message || 'Error al vaciar carrito');
       }
     },
   });

   const applyPromoCodeMutation = useMutation({
     mutationFn: cartService.applyPromoCode,
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['cart'] });
       if (typeof window !== 'undefined') {
         toast.success('Código promocional aplicado');
       }
     },
     onError: (error: any) => {
       console.error('Error applying promo code:', error);
       if (typeof window !== 'undefined') {
         toast.error(error.response?.data?.message || 'Error al aplicar código promocional');
       }
     },
   });

  const addItem = async (itemData: Omit<CartItem, 'id' | 'addedAt'>): Promise<void> => {
    await addItemMutation.mutateAsync(itemData);
  };

  const updateItem = async (itemId: number, updates: Partial<CartItem>): Promise<void> => {
    await updateItemMutation.mutateAsync({ itemId, updates });
  };

  const removeItem = async (itemId: number): Promise<void> => {
    await removeItemMutation.mutateAsync(itemId);
  };

  const clearCart = async (): Promise<void> => {
    await clearCartMutation.mutateAsync();
  };

  const applyPromoCode = async (code: string): Promise<void> => {
    await applyPromoCodeMutation.mutateAsync(code);
  };

  const refreshCart = async (): Promise<void> => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
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