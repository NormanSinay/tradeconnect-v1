import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaGraduationCap, FaHandshake, FaLaptop, FaChartLine, FaUsers, FaLightbulb, FaGlobe, FaMoneyBillWave, FaRocket } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import Navigation from './navigation'
import Footer from './footer'
import SearchForm from './search-form'
import EventGrid from './event-grid'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'
import { Event } from '@/types'
import { useQuery } from '@tanstack/react-query'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const { searchQuery } = useUIStore()

  // Fetch featured events from backend API (most recent events)
  const { data: featuredEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['featured-events'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/public/events?limit=3&sortBy=createdAt&sortOrder=DESC`)
      if (!response.ok) {
        throw new Error('Failed to fetch featured events')
      }
      const result = await response.json()
      return result.data?.events || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Filter events based on search query only
  useEffect(() => {
    if (featuredEvents) {
      let filtered = featuredEvents

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter((event: any) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.eventType?.name.toLowerCase().includes(query) ||
          event.eventCategory?.name.toLowerCase().includes(query)
        )
      }

      setFilteredEvents(filtered)
    }
  }, [searchQuery, featuredEvents])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to events page with search query
      navigate(`/events?search=${encodeURIComponent(query.trim())}`)
    } else {
      // Navigate to events page without search
      navigate('/events')
    }
  }

  const handleExploreEvents = () => {
    navigate('/events')
  }

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
                  onClick={handleExploreEvents}
                >
                  <FaCalendarAlt className="mr-2" />
                  Explorar Eventos y Cursos
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

          {/* Events Grid */}
          <EventGrid events={filteredEvents} loading={eventsLoading && filteredEvents.length === 0} />

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg border-[#6B1E22] text-[#6B1E22] hover:bg-[#6B1E22] hover:text-white"
              onClick={handleExploreEvents}
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                title: 'Tecnología',
                description: 'Innovación y tendencias tecnológicas',
                icon: FaLaptop,
                color: 'bg-blue-500'
              },
              {
                title: 'Negocios',
                description: 'Estrategias empresariales',
                icon: FaChartLine,
                color: 'bg-green-500'
              },
              {
                title: 'Marketing',
                description: 'Marketing digital y tradicional',
                icon: FaUsers,
                color: 'bg-purple-500'
              },
              {
                title: 'Innovación',
                description: 'Ideas disruptivas y creativas',
                icon: FaLightbulb,
                color: 'bg-yellow-500'
              },
              {
                title: 'Global',
                description: 'Perspectivas internacionales',
                icon: FaGlobe,
                color: 'bg-indigo-500'
              },
              {
                title: 'Finanzas',
                description: 'Gestión financiera y contable',
                icon: FaMoneyBillWave,
                color: 'bg-emerald-500'
              },
              {
                title: 'Emprendimiento',
                description: 'Iniciar y crecer negocios',
                icon: FaRocket,
                color: 'bg-orange-500'
              },
              {
                title: 'Networking',
                description: 'Conexiones profesionales',
                icon: FaHandshake,
                color: 'bg-pink-500'
              },
              {
                title: 'Liderazgo',
                description: 'Desarrollo de liderazgo',
                icon: FaGraduationCap,
                color: 'bg-teal-500'
              },
              {
                title: 'Sostenibilidad',
                description: 'Negocios responsables',
                icon: FaCalendarAlt,
                color: 'bg-cyan-500'
              }
            ].map((category, index) => {
              const IconComponent = category.icon
              return (
                <motion.div
                  key={index}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  onClick={handleExploreEvents}
                >
                  <motion.div
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4 h-full cursor-pointer"
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mb-3 text-white`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <IconComponent size={20} />
                      </motion.div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {category.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage