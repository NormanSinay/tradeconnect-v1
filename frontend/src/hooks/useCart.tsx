import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Cart, CartItem, Event, ApiResponse } from '@/types'
import { api } from '@/services/api'
import { showToast } from '@/utils/toast'
import { useAuth } from '@/context/AuthContext'
import type { AxiosResponse } from 'axios'

interface CartContextType {
  cart: Cart | null
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
  addToCart: (eventId: string, quantity?: number) => Promise<void>
  removeFromCart: (eventId: string) => Promise<void>
  updateQuantity: (eventId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Calculate derived values
  const items = cart?.items || []
  const total = cart?.total || 0
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Load cart on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart()
    } else {
      setCart(null)
    }
  }, [isAuthenticated, user])

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      const response: AxiosResponse<ApiResponse<Cart>> = await api.get('/cart')
      if (response.data.success) {
        setCart(response.data.data as Cart)
      }
    } catch (error: any) {
      console.error('Error loading cart:', error)
      // Don't show error toast for cart loading failures
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const addToCart = useCallback(async (eventId: string, quantity = 1) => {
    if (!isAuthenticated) {
      showToast.error('Debes iniciar sesión para agregar al carrito')
      return
    }

    try {
      setIsLoading(true)
      const response: AxiosResponse<ApiResponse<Cart>> = await api.post('/cart/items', { eventId, quantity })

      if (response.data.success) {
        setCart(response.data.data as Cart)
        showToast.success('Evento agregado al carrito')
      } else {
        showToast.error(response.data.error || 'Error al agregar al carrito')
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      showToast.error(error.response?.data?.error || 'Error al agregar al carrito')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const removeFromCart = useCallback(async (eventId: string) => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      const response: AxiosResponse<ApiResponse<Cart>> = await api.delete(`/cart/items/${eventId}`)

      if (response.data.success) {
        setCart(response.data.data as Cart)
        showToast.success('Evento removido del carrito')
      } else {
        showToast.error(response.data.error || 'Error al remover del carrito')
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error)
      showToast.error(error.response?.data?.error || 'Error al remover del carrito')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const updateQuantity = useCallback(async (eventId: string, quantity: number) => {
    if (!isAuthenticated) return

    if (quantity <= 0) {
      await removeFromCart(eventId)
      return
    }

    try {
      setIsLoading(true)
      const response: AxiosResponse<ApiResponse<Cart>> = await api.put(`/cart/items/${eventId}`, { quantity })

      if (response.data.success) {
        setCart(response.data.data as Cart)
      } else {
        showToast.error(response.data.error || 'Error al actualizar cantidad')
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error)
      showToast.error(error.response?.data?.error || 'Error al actualizar cantidad')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, removeFromCart])

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      const response: AxiosResponse<ApiResponse<Cart>> = await api.delete('/cart')

      if (response.data.success) {
        setCart(null)
        showToast.success('Carrito vaciado')
      } else {
        showToast.error(response.data.error || 'Error al vaciar carrito')
      }
    } catch (error: any) {
      console.error('Error clearing cart:', error)
      showToast.error(error.response?.data?.error || 'Error al vaciar carrito')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const value: CartContextType = {
    cart,
    items,
    total,
    itemCount,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}