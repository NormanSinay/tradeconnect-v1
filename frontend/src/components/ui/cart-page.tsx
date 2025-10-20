import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import CartItem from './cart-item'
import CartSummary from './cart-summary'

interface CartItemData {
  id: number
  eventId: number
  quantity: number
  price: number
  currency: string
  event?: {
    id: number
    title: string
    isVirtual: boolean
    eventCategory?: {
      name: string
    }
  }
}

interface CartPageProps {
  onCheckout?: () => void
  onContinueShopping?: () => void
}

export const CartPage: React.FC<CartPageProps> = ({
  onCheckout = () => {},
  onContinueShopping = () => {}
}) => {
  const [cartItems, setCartItems] = useState<CartItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart')

      if (response.data.success) {
        setCartItems((response.data.data as any).items || [])
      } else {
        setError('Error al cargar el carrito')
      }
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError('Error al cargar el carrito')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      const response = await api.put('/cart/update', {
        itemId: id,
        quantity
      })

      if (response.data.success) {
        setCartItems(items =>
          items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        )
      }
    } catch (err) {
      console.error('Error updating quantity:', err)
      // Revert local state on error
      fetchCart()
    }
  }

  const removeItem = async (id: number) => {
    try {
      const response = await api.delete(`/cart/remove/${id}`)

      if (response.data.success) {
        setCartItems(items => items.filter(item => item.id !== id))
      }
    } catch (err) {
      console.error('Error removing item:', err)
      // Revert local state on error
      fetchCart()
    }
  }

  const getEventIcon = (event?: any) => {
    if (!event) return '📅'
    switch (event.eventCategory?.name?.toLowerCase()) {
      case 'conferencia': return '🎤'
      case 'taller': return '🛠️'
      case 'curso': return '📚'
      case 'networking': return '🤝'
      default: return '📅'
    }
  }

  const getEventCategory = (event?: any) => {
    if (!event) return 'Evento'
    return event.isVirtual ? 'Virtual' : 'Presencial'
  }

  // Transform cart items for the UI components
  const transformedItems = cartItems.map(item => ({
    id: item.id,
    title: item.event?.title || 'Evento',
    category: getEventCategory(item.event),
    price: item.price,
    quantity: item.quantity,
    icon: getEventIcon(item.event)
  }))

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>Mi Carrito 🛒</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Cargando...</p>
        </div>
        <div className="cart-content">
          <div className="cart-items">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="cart-item" style={{ background: '#f8f9fa', border: 'none' }}>
                <div className="cart-item-image" style={{ background: '#f0f0f0' }}></div>
                <div className="cart-item-details">
                  <div style={{ height: '24px', background: '#f0f0f0', marginBottom: '8px', borderRadius: '4px' }}></div>
                  <div style={{ height: '18px', background: '#f0f0f0', marginBottom: '8px', borderRadius: '4px', width: '60%' }}></div>
                  <div style={{ height: '28px', background: '#f0f0f0', marginBottom: '8px', borderRadius: '4px', width: '40%' }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary" style={{ background: '#f8f9fa', border: 'none' }}>
            <div style={{ height: '200px', background: '#f0f0f0', borderRadius: '32px' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cart-container">
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Error al cargar el carrito</h2>
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={fetchCart}
            style={{ marginTop: '2rem' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Mi Carrito 🛒</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
          {totalItems} {totalItems === 1 ? 'evento seleccionado' : 'eventos seleccionados'}
        </p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {transformedItems.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <CartSummary
          items={transformedItems}
          discount={0} // TODO: Calculate discount from API
          onCheckout={onCheckout}
          onContinueShopping={onContinueShopping}
        />
      </div>
    </div>
  )
}

export default CartPage