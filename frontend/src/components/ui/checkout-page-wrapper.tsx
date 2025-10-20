import React from 'react'
import { useNavigate } from 'react-router-dom'
import CheckoutForm from './checkout-form'

export const CheckoutPageWrapper: React.FC = () => {
  const navigate = useNavigate()

  const handleCompletePurchase = () => {
    navigate('/profile')
  }

  const handleGoBack = () => {
    navigate('/cart')
  }

  return (
    <div id="checkoutPage" className="page-container active">
      <CheckoutForm
        onCompletePurchase={handleCompletePurchase}
        onGoBack={handleGoBack}
      />
    </div>
  )
}

export default CheckoutPageWrapper