import { create } from 'zustand'
import { Event, CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  total: number
}

interface CartActions {
  addToCart: (event: Event) => void
  removeFromCart: (eventId: number) => void
  clearCart: () => void
  getTotalItems: () => number
}

export const useCartStore = create<CartState & CartActions>((set, get) => ({
  // State
  items: [],
  total: 0,

  // Actions
  addToCart: (event) => {
    const { items } = get()
    const existingItem = items.find(item => item.event.id === event.id)

    if (existingItem) {
      // Increment quantity if item already exists
      const updatedItems = items.map(item =>
        item.event.id === event.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
      set({
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.event.price * item.quantity), 0)
      })
    } else {
      // Add new item
      const newItems = [...items, { event, quantity: 1 }]
      set({
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.event.price * item.quantity), 0)
      })
    }
  },

  removeFromCart: (eventId) => {
    const { items } = get()
    const updatedItems = items.filter(item => item.event.id !== eventId)
    set({
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + (item.event.price * item.quantity), 0)
    })
  },

  clearCart: () => set({ items: [], total: 0 }),

  getTotalItems: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))