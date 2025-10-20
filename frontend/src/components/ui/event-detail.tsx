import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface Event {
  id: number
  title: string
  description?: string
  shortDescription?: string
  price: number
  currency: string
  startDate: string
  endDate: string
  location?: string
  virtualLocation?: string
  isVirtual: boolean
  capacity: number
  eventCategory?: {
    name: string
  }
  eventType?: {
    name: string
  }
  tags?: string[]
  requirements?: string
}

interface EventDetailProps {
  eventId?: number
  onAddToCart?: (quantity: number) => void
  onGoBack?: () => void
}

export const EventDetail: React.FC<EventDetailProps> = ({
  eventId = 1,
  onAddToCart = () => {},
  onGoBack = () => {}
}) => {
  const [quantity, setQuantity] = useState(1)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/public/events/${eventId}`)

        if (response.data.success) {
          setEvent(response.data.data as Event)
        } else {
          setError('Error al cargar el evento')
        }
      } catch (err) {
        console.error('Error fetching event:', err)
        setError('Error al cargar el evento')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const formatPrice = (price: number, currency: string) => {
    return `Q${price.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startTime = start.toLocaleTimeString('es-GT', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    const endTime = end.toLocaleTimeString('es-GT', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return `${startTime} - ${endTime}`
  }

  const getEventIcon = (eventType?: string) => {
    switch (eventType?.toLowerCase()) {
      case 'conferencia': return '🎤'
      case 'taller': return '🛠️'
      case 'curso': return '📚'
      case 'networking': return '🤝'
      default: return '📅'
    }
  }

  const getDefaultFeatures = () => [
    'Acceso a todas las conferencias magistrales',
    'Material digital del evento',
    'Coffee break y almuerzo incluido',
    'Certificado de participación blockchain',
    'Factura FEL automática',
    'Networking con empresarios destacados'
  ]

  if (loading) {
    return (
      <div className="event-detail-container">
        <div className="event-detail-info">
          <div className="event-detail-image" style={{ background: '#f0f0f0' }}>
            <div style={{ fontSize: '4rem', color: '#ccc' }}>⏳</div>
          </div>
          <div style={{ height: '40px', background: '#f0f0f0', marginBottom: '1rem', borderRadius: '8px' }}></div>
          <div style={{ height: '20px', background: '#f0f0f0', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
          <div style={{ height: '20px', background: '#f0f0f0', marginBottom: '2rem', borderRadius: '4px', width: '60%' }}></div>
          <div style={{ height: '200px', background: '#f0f0f0', borderRadius: '20px' }}></div>
        </div>
        <div className="booking-card">
          <div style={{ height: '60px', background: '#f0f0f0', marginBottom: '2rem', borderRadius: '16px' }}></div>
          <div style={{ height: '200px', background: '#f0f0f0', borderRadius: '16px' }}></div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="event-detail-container">
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Error al cargar el evento</h2>
          <p>{error || 'Evento no encontrado'}</p>
          <button
            className="btn-primary"
            onClick={onGoBack}
            style={{ marginTop: '2rem' }}
          >
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1)
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

  const handleAddToCart = () => {
    onAddToCart(quantity)
  }

  return (
    <div className="event-detail-container">
      <div className="event-detail-info">
        <div className="event-detail-image">
          {getEventIcon(event.eventType?.name)}
        </div>

        <h1>{event.title}</h1>

        <div className="event-tags">
          <span className="tag">{event.isVirtual ? '🌐 Virtual' : '🏢 Presencial'}</span>
          <span className="tag">{event.eventCategory?.name || 'Evento'}</span>
          {event.eventType && <span className="tag">{event.eventType.name}</span>}
        </div>

        <p className="event-description">{event.description || event.shortDescription}</p>

        <div className="event-features">
          <h3>✨ Lo que incluye</h3>
          <div className="feature-list">
            {getDefaultFeatures().map((feature: string, index: number) => (
              <div key={index} className="feature-item">{feature}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="booking-card">
        <div className="booking-price">{formatPrice(event.price, event.currency)}</div>

        <div className="booking-info">
          <div className="booking-info-item">
            <span className="booking-info-label">📅 Fecha</span>
            <span className="booking-info-value">{formatDate(event.startDate)}</span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">🕐 Hora</span>
            <span className="booking-info-value">{formatTime(event.startDate, event.endDate)}</span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">📍 Lugar</span>
            <span className="booking-info-value">
              {event.isVirtual ? (event.virtualLocation || 'En línea') : (event.location || 'Por confirmar')}
            </span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">👥 Cupos</span>
            <span className="booking-info-value">{event.capacity} disponibles</span>
          </div>
        </div>

        <div className="quantity-selector">
          <label>Cantidad:</label>
          <div className="quantity-controls">
            <button className="quantity-btn" onClick={decreaseQuantity}>-</button>
            <span className="quantity-value">{quantity}</span>
            <button className="quantity-btn" onClick={increaseQuantity}>+</button>
          </div>
        </div>

        <button className="btn-primary" onClick={handleAddToCart} style={{ width: '100%' }}>
          Agregar al Carrito 🛒
        </button>
      </div>
    </div>
  )
}

export default EventDetail