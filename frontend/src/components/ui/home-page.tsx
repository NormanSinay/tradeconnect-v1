import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaGraduationCap, FaHandshake, FaSearch } from 'react-icons/fa'
import Navigation from './navigation'
import Footer from './footer'
import SearchForm from './search-form'
import EventGrid from './event-grid'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'
import { sampleEvents, formatCurrency, formatDate, getModalityText, getTypeText } from '@/utils/sampleData'
import { Event } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import toast from 'react-hot-toast'

const HomePage: React.FC = () => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(sampleEvents.filter(e => e.featured))
  const { searchQuery, selectedCategory } = useUIStore()
  const { addToCart } = useCartStore()

  // Filter events based on search and category
  useEffect(() => {
    let filtered = sampleEvents.filter(event => event.featured)

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

  const handleAddToCart = (event: Event) => {
    addToCart(event)
    toast.success(`"${event.title}" agregado al carrito`)
  }

  const categories = [
    'Todos',
    'Conferencias',
    'Talleres',
    'Networking',
    'Seminarios',
    'Cursos'
  ]

  const stats = [
    { value: '25-35%', label: 'Reducción en tiempos de gestión' },
    { value: '20-30%', label: 'Disminución de costos operativos' },
    { value: '30-40%', label: 'Aumento en efectividad' },
    { value: '1.8 años', label: 'ROI promedio' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#6B1E22] to-[#4a1518] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill="white"/>
          </svg>
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Conecta, Aprende y Crece con TradeConnect
              </h1>
              <p className="text-xl mb-8 text-gray-200 leading-relaxed">
                La plataforma e-commerce líder para la gestión y comercialización de eventos y cursos de la Cámara de Comercio de Guatemala
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-[#6B1E22] hover:bg-gray-100 px-8 py-3 text-lg"
                >
                  <FaCalendarAlt className="mr-2" />
                  Explorar Eventos
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#6B1E22] px-8 py-3 text-lg"
                >
                  <FaGraduationCap className="mr-2" />
                  Ver Cursos
                </Button>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <motion.div
              className="relative h-96 lg:h-[500px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Card 1 */}
              <motion.div
                className="absolute top-4 left-4 bg-white rounded-lg p-4 shadow-xl max-w-xs"
                animate={{
                  y: [0, -10, 0],
                  rotate: [-1, 1, -1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-12 h-12 bg-[#6B1E22] rounded-full flex items-center justify-center mb-3">
                  <FaCalendarAlt className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Eventos Exclusivos</h3>
                <p className="text-sm text-gray-600">Accede a conferencias, talleres y networking empresarial</p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                className="absolute top-32 right-4 bg-white rounded-lg p-4 shadow-xl max-w-xs"
                animate={{
                  y: [0, -15, 0],
                  rotate: [1, -1, 1]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="w-12 h-12 bg-[#2c5aa0] rounded-full flex items-center justify-center mb-3">
                  <FaGraduationCap className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Cursos Especializados</h3>
                <p className="text-sm text-gray-600">Desarrolla habilidades con expertos de la industria</p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                className="absolute bottom-16 left-8 bg-white rounded-lg p-4 shadow-xl max-w-xs"
                animate={{
                  y: [0, -8, 0],
                  rotate: [-0.5, 0.5, -0.5]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                <div className="w-12 h-12 bg-[#28a745] rounded-full flex items-center justify-center mb-3">
                  <FaHandshake className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Impulsa tu Negocio</h3>
                <p className="text-sm text-gray-600">Conecta con oportunidades de crecimiento empresarial</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search and Events Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Próximos Eventos Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre los eventos empresariales más relevantes para tu crecimiento profesional
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

          {/* Events Grid */}
          <EventGrid events={filteredEvents} />

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg border-[#6B1E22] text-[#6B1E22] hover:bg-[#6B1E22] hover:text-white"
            >
              Ver Todos los Eventos
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir TradeConnect?
            </h2>
            <p className="text-xl text-gray-600">
              Beneficios de nuestra plataforma para organizadores y participantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl font-bold text-[#6B1E22] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Categorías Populares
            </h2>
            <p className="text-xl text-gray-600">
              Explora eventos y cursos por categoría de interés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Tecnología',
                description: 'Eventos y cursos sobre las últimas tendencias tecnológicas.',
                image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                count: 15
              },
              {
                title: 'Negocios',
                description: 'Estrategias y herramientas para el crecimiento empresarial.',
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                count: 22
              },
              {
                title: 'Marketing',
                description: 'Técnicas modernas de marketing digital y tradicional.',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                count: 18
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{category.count} eventos</span>
                      <Button
                        variant="outline"
                        className="border-[#6B1E22] text-[#6B1E22] hover:bg-[#6B1E22] hover:text-white"
                      >
                        Explorar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage