import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface CartItem {
  id: number
  eventId: number
  quantity: number
  price: number
  currency: string
  event?: {
    id: number
    title: string
    isVirtual: boolean
  }
}

interface CheckoutFormProps {
  onCompletePurchase?: () => void
  onGoBack?: () => void
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onCompletePurchase = () => {},
  onGoBack = () => {}
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState('credit-card')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotals, setCartTotals] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCartData()
  }, [])

  const fetchCartData = async () => {
    try {
      setLoading(true)
      const [cartResponse, totalsResponse] = await Promise.all([
        api.get('/cart'),
        api.get('/cart/calculate')
      ])

      if (cartResponse.data.success) {
        setCartItems((cartResponse.data.data as any).items || [])
      }

      if (totalsResponse.data.success) {
        setCartTotals(totalsResponse.data.data)
      }
    } catch (err) {
      console.error('Error fetching cart data:', err)
      setError('Error al cargar los datos del carrito')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCompletePurchase = async () => {
    try {
      setProcessing(true)
      // TODO: Implement actual payment processing
      // This would integrate with Stripe, PayPal, etc.
      setTimeout(() => {
        setCurrentStep(3)
        setProcessing(false)
      }, 2000)
    } catch (err) {
      console.error('Error processing payment:', err)
      setError('Error al procesar el pago')
      setProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return `Q${price.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="checkout-container">
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Cargando información del carrito...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="checkout-container">
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Error</h2>
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={fetchCartData}
            style={{ marginTop: '2rem' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const paymentMethods = [
    { id: 'credit-card', name: 'Tarjeta de Crédito', icon: '💳' },
    { id: 'bank-transfer', name: 'Transferencia', icon: '🏦' },
    { id: 'paypal', name: 'PayPal', icon: '💰' },
    { id: 'mobile', name: 'Pago Móvil', icon: '📱' }
  ]

  return (
    <div className="checkout-container">
      <div className="checkout-steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <span className="step-label">Información</span>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <span className="step-label">Pago</span>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <span className="step-label">Confirmación</span>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          {currentStep === 1 && (
            <>
              <div className="form-section">
                <h3>📋 Información Personal</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input type="text" placeholder="Juan" required />
                  </div>
                  <div className="form-group">
                    <label>Apellido *</label>
                    <input type="text" placeholder="Pérez" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" placeholder="juan@email.com" required />
                  </div>
                  <div className="form-group">
                    <label>Teléfono *</label>
                    <input type="tel" placeholder="+502 1234-5678" required />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>🏢 Información de Facturación</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>NIT *</label>
                    <input type="text" placeholder="12345678" required />
                  </div>
                  <div className="form-group">
                    <label>Nombre Fiscal *</label>
                    <input type="text" placeholder="Empresa S.A." required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Dirección Fiscal *</label>
                  <input type="text" placeholder="Av. Principal, Zona 10" required />
                </div>
              </div>

              <button className="btn-primary" onClick={nextStep} style={{ width: '100%', marginTop: '2rem' }} disabled={processing}>
                {processing ? 'Procesando...' : 'Continuar al Pago →'}
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="form-section">
                <h3>💳 Método de Pago</h3>
                <div className="payment-methods">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className={`payment-method ${selectedPayment === method.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="payment-icon">{method.icon}</div>
                      <div className="payment-name">{method.name}</div>
                    </div>
                  ))}
                </div>

                {selectedPayment === 'credit-card' && (
                  <>
                    <div className="form-row" style={{ marginTop: '2rem' }}>
                      <div className="form-group">
                        <label>Número de Tarjeta *</label>
                        <input type="text" placeholder="1234 5678 9012 3456" required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Fecha de Expiración *</label>
                        <input type="text" placeholder="MM/AA" required />
                      </div>
                      <div className="form-group">
                        <label>CVV *</label>
                        <input type="text" placeholder="123" required />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn-secondary" onClick={prevStep} style={{ flex: 1 }}>
                  ← Atrás
                </button>
                <button className="btn-primary" onClick={handleCompletePurchase} style={{ flex: 1 }} disabled={processing}>
                  {processing ? 'Procesando...' : 'Confirmar Compra →'}
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="form-section">
              <h3>✅ Confirmación de Compra</h3>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                  ¡Compra Exitosa!
                </h4>
                <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                  Tu pedido ha sido procesado correctamente. Recibirás tu factura FEL por email.
                </p>
                <button className="btn-primary" onClick={onCompletePurchase} style={{ width: '100%' }}>
                  Ver Mis Eventos 🎯
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="cart-summary">
          <h2>Resumen del Pedido</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              📋 Eventos ({cartItems.length})
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.8' }}>
              {cartItems.map((item, index) => (
                <div key={item.id}>
                  • {item.event?.title || `Evento ${item.eventId}`}
                  {index < cartItems.length - 1 && <br />}
                </div>
              ))}
            </div>
          </div>

          {cartTotals && (
            <>
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatPrice(cartTotals.subtotal || 0)}</span>
              </div>
              {cartTotals.discountAmount > 0 && (
                <div className="summary-row">
                  <span className="summary-label">Descuento</span>
                  <span className="summary-value" style={{ color: 'var(--success)' }}>
                    -{formatPrice(cartTotals.discountAmount)}
                  </span>
                </div>
              )}
              <div className="summary-row">
                <span className="summary-label">IVA (12%)</span>
                <span className="summary-value">{formatPrice((cartTotals.subtotal || 0) * 0.12)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span className="summary-label">Total a Pagar</span>
                <span className="summary-value">{formatPrice(cartTotals.total || 0)}</span>
              </div>
            </>
          )}

          <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center' }}>
            🔒 Pago seguro y encriptado<br />
            📄 Factura FEL automática
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutForm