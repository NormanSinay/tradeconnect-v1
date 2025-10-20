import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EventDetail from './event-detail'

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const eventId = id ? parseInt(id, 10) : 1

  const handleAddToCart = (quantity: number) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', eventId, 'quantity:', quantity)
    navigate('/cart')
  }

  const handleGoBack = () => {
    navigate('/')
  }

  return (
    <div id="eventDetailPage" className="page-container active">
      <EventDetail
        eventId={eventId}
        onAddToCart={handleAddToCart}
        onGoBack={handleGoBack}
      />
    </div>
  )
}

export default EventDetailPage