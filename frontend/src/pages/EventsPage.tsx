import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'
import SearchForm from '@/components/ui/search-form'
import EventGrid from '@/components/ui/event-grid'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'
import { sampleEvents } from '@/utils/sampleData'
import { Event } from '@/types'

const EventsPage: React.FC = () => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(sampleEvents)
  const { searchQuery, selectedCategory } = useUIStore()

  // Filter events based on search and category
  useEffect(() => {
    let filtered = sampleEvents

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query) ||
        event.modality.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(event =>
        event.category === selectedCategory.toLowerCase()
      )
    }

    setFilteredEvents(filtered)
  }, [searchQuery, selectedCategory])

  const handleSearch = (query: string) => {
    // Search is handled by useEffect
  }

  const handleCategoryFilter = (category: string) => {
    useUIStore.getState().setSelectedCategory(category)
  }

  const categories = [
    'Todos',
    'Conferencias',
    'Talleres',
    'Networking',
    'Seminarios',
    'Cursos'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Eventos y Cursos
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora nuestra amplia gama de eventos empresariales y cursos especializados para tu crecimiento profesional
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-8">
            <SearchForm onSearch={handleSearch} />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category)}
                className={`rounded-full px-6 py-2 ${
                  selectedCategory === category
                    ? 'bg-[#6B1E22] text-white hover:bg-[#5a191e]'
                    : 'border-gray-300 text-gray-700 hover:border-[#6B1E22] hover:text-[#6B1E22]'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EventGrid events={filteredEvents} />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default EventsPage