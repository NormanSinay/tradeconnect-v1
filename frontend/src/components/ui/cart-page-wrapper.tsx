import React from 'react'
import { useNavigate } from 'react-router-dom'
import CartPage from './cart-page'

export const CartPageWrapper: React.FC = () => {
  const navigate = useNavigate()

  const handleCheckout = () => {
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    navigate('/')
  }

  return (
    <div id="cartPage" className="page-container active">
      <CartPage
        onCheckout={handleCheckout}
        onContinueShopping={handleContinueShopping}
      />
    </div>
  )
}

export default CartPageWrapper