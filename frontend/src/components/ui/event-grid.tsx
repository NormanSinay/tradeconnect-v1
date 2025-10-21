import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface Event {
  id: number
  title: string
  shortDescription?: string
  price: number
  currency: string
  startDate: string
  endDate: string
  location?: string
  isVirtual: boolean
  capacity: number
  eventCategory?: {
    name: string
  }
  eventType?: {
    name: string
  }
}

interface EventGridProps {
  onEventClick?: (eventId: number) => void
  onAddToCart?: (eventId: number) => void
}

export const EventGrid: React.FC<EventGridProps> = ({
  onEventClick = () => {},
  onAddToCart = () => {}
}) => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await api.get('/public/events', {
          params: {
            limit: 8,
            page: 1
          }
        })

        if (response.data.success) {
          setEvents((response.data.data as any).events || [])
        } else {
          setError('Error al cargar eventos')
        }
      } catch (err) {
        // Silenciar errores de red cuando el backend no está disponible
        // console.error('Error fetching events:', err)
        setError('Error al cargar eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const formatPrice = (price: number, currency: string) => {
    return `Q${price.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
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

  const getEventBadge = (isVirtual: boolean, eventType?: string) => {
    if (isVirtual) return 'Virtual'
    if (eventType?.toLowerCase().includes('curso')) return 'Curso'
    return 'Presencial'
  }

  if (loading) {
    return (
      <div className="bento-section">
        <div className="section-header">
          <h2>Próximos Eventos 🎯</h2>
          <p>Eventos empresariales y oportunidades de networking</p>
        </div>
        <div className="bento-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bento-item">
              <div className="event-image" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#ccc' }}>⏳</div>
              </div>
              <div className="event-title" style={{ background: '#f0f0f0', height: '20px', marginBottom: '8px', borderRadius: '4px' }}></div>
              <div className="event-category" style={{ background: '#f0f0f0', height: '16px', marginBottom: '8px', borderRadius: '4px' }}></div>
              <div className="event-price" style={{ background: '#f0f0f0', height: '24px', marginBottom: '8px', borderRadius: '4px' }}></div>
              <div className="event-meta" style={{ background: '#f0f0f0', height: '16px', borderRadius: '4px' }}></div>
              <button className="btn-add-cart" disabled style={{ opacity: 0.5 }}>
                Cargando...
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bento-section">
        <div className="section-header">
          <h2>Próximos Eventos 🎯</h2>
          <p>Eventos empresariales y oportunidades de networking</p>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="bento-section">
        <div className="section-header">
          <h2>Próximos Eventos 🎯</h2>
          <p>Eventos empresariales y oportunidades de networking</p>
        </div>
        <div className="bento-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bento-item">
              <div className="event-image" style={{ background: '#f8f9fa', border: '2px dashed #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#6c757d' }}>📅</div>
              </div>
              <div className="event-title" style={{ background: '#f8f9fa', height: '20px', marginBottom: '8px', borderRadius: '4px' }}></div>
              <div className="event-category" style={{ background: '#f8f9fa', height: '16px', marginBottom: '8px', borderRadius: '4px' }}></div>
              <div className="event-price" style={{ background: '#f8f9fa', height: '24px', marginBottom: '8px', borderRadius: '4px' }}></div>
              <div className="event-meta" style={{ background: '#f8f9fa', height: '16px', borderRadius: '4px' }}></div>
              <button className="btn-add-cart" disabled style={{ opacity: 0.5, background: '#6c757d' }}>
                Próximamente
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
          <p>No hay eventos disponibles en este momento. ¡Vuelve pronto!</p>
        </div>
      </div>
    )
  }
  const handleEventClick = (eventId: number, e: React.MouseEvent) => {
    // Prevent event bubbling if clicking on add to cart button
    if ((e.target as HTMLElement).closest('.btn-add-cart')) {
      return
    }
    onEventClick(eventId)
  }

  const handleAddToCart = (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart(eventId)
  }

  return (
    <section className="bento-section">
      <div className="section-header">
        <h2>Próximos Eventos 🎯</h2>
        <p>Eventos empresariales y oportunidades de networking</p>
      </div>

      <div className="bento-grid">
        {events.map((event) => (
          <div
            key={event.id}
            className="bento-item"
            onClick={(e) => handleEventClick(event.id, e)}
          >
            <div className="event-image">
              {getEventIcon(event.eventType?.name)}
              <div className="event-badge">{getEventBadge(event.isVirtual, event.eventType?.name)}</div>
            </div>
            <div className="event-title">{event.title}</div>
            <div className="event-category">
              {event.eventCategory?.name || 'Evento'} • {event.isVirtual ? 'Virtual' : 'Presencial'}
            </div>
            <div className="event-price">{formatPrice(event.price, event.currency)}</div>
            <div className="event-meta">
              <span>📅 {formatDate(event.startDate)}</span>
              <span>👥 {event.capacity} cupos</span>
            </div>
            <button
              className="btn-add-cart"
              onClick={(e) => handleAddToCart(event.id, e)}
            >
              Agregar al Carrito 🛒
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default EventGrid