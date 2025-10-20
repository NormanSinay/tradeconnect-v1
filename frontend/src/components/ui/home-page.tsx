import React from 'react'
import HeroSection from './hero-section'
import StatsSection from './stats-section'
import EventGrid from './event-grid'

export const HomePage: React.FC = () => {
  const handleEventClick = (eventId: number) => {
    window.location.href = `/event/${eventId}`
  }

  const handleAddToCart = (eventId: number) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', eventId)
  }

  return (
    <div id="homePage" className="page-container active">
      <HeroSection />
      <StatsSection />
      <EventGrid
        onEventClick={handleEventClick}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}

export default HomePage