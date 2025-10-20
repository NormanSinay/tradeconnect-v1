import React from 'react'

interface CartItem {
  id: number
  title: string
  price: number
  quantity: number
}

interface CartSummaryProps {
  items?: CartItem[]
  discount?: number
  onCheckout?: () => void
  onContinueShopping?: () => void
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  items = [
    { id: 1, title: 'Cumbre Empresarial 2025', price: 1250, quantity: 1 },
    { id: 2, title: 'Liderazgo Digital', price: 350, quantity: 1 },
    { id: 3, title: 'Finanzas Corporativas', price: 500, quantity: 2 }
  ],
  discount = 260,
  onCheckout = () => {},
  onContinueShopping = () => {}
}) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const iva = subtotal * 0.12
  const total = subtotal - discount + iva

  return (
    <div className="cart-summary">
      <h2>Resumen de Compra</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📋 Eventos ({items.length})</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.8' }}>
          {items.map((item, index) => (
            <div key={item.id}>
              • {item.title}
              {index < items.length - 1 && <br />}
            </div>
          ))}
        </div>
      </div>

      <div className="summary-row">
        <span className="summary-label">Subtotal</span>
        <span className="summary-value">Q{subtotal.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Descuento Afiliado</span>
        <span className="summary-value" style={{ color: 'var(--success)' }}>-Q{discount.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">IVA (12%)</span>
        <span className="summary-value">Q{iva.toFixed(2)}</span>
      </div>

      <div className="summary-divider"></div>

      <div className="summary-total">
        <span className="summary-label">Total</span>
        <span className="summary-value">Q{total.toFixed(2)}</span>
      </div>

      <button className="btn-primary" onClick={onCheckout} style={{ width: '100%' }}>
        Proceder al Pago 💳
      </button>

      <button className="btn-secondary" onClick={onContinueShopping} style={{ width: '100%', marginTop: '1rem' }}>
        Seguir Comprando
      </button>
    </div>
  )
}

export default CartSummary