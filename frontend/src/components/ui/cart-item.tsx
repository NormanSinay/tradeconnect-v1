import React from 'react'

interface CartItemProps {
  item: {
    id: number
    title: string
    category: string
    price: number
    quantity: number
    icon: string
  }
  onUpdateQuantity?: (id: number, quantity: number) => void
  onRemove?: (id: number) => void
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity = () => {},
  onRemove = () => {}
}) => {
  const increaseQuantity = () => {
    onUpdateQuantity(item.id, item.quantity + 1)
  }

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1)
    }
  }

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.icon}
      </div>
      <div className="cart-item-details">
        <div className="cart-item-title">{item.title}</div>
        <div className="cart-item-category">{item.category}</div>
        <div className="cart-item-price">Q{item.price.toFixed(2)}</div>
        <div className="cart-item-actions">
          <div className="quantity-controls">
            <button className="quantity-btn" onClick={decreaseQuantity}>-</button>
            <span className="quantity-value">{item.quantity}</span>
            <button className="quantity-btn" onClick={increaseQuantity}>+</button>
          </div>
          <button className="btn-remove" onClick={() => onRemove(item.id)}>
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartItem