import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaMicrophone, FaLightbulb, FaHandshake } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'

interface Conference {
  id: string
  title: string
  description: string
  speaker: string
  speakerTitle: string
  startDate: string
  endDate: string
  location: string
  capacity: number
  registeredCount: number
  price: number
  topics: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  imageUrl?: string
  status: 'active' | 'cancelled' | 'completed'
}

export const ConferencesPage: React.FC = () => {
  const navigate = useNavigate()
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLevel, setFilterLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  useEffect(() => {
    fetchConferences()
  }, [filterLevel])

  const fetchConferences = async () => {
    try {
      setLoading(true)

      // In a real app, you would call your API
      // const response = await api.get('/events/conferences', {
      //   params: { level: filterLevel }
      // })

      // Mock data for conferences
      const mockConferences: Conference[] = [
        {
          id: '1',
          title: 'Transformación Digital en la Empresa Moderna',
          description: 'Explora cómo las empresas están adoptando tecnologías emergentes para mantenerse competitivas en el mercado global.',
          speaker: 'Dra. María González',
          speakerTitle: 'Directora de Innovación, TechCorp Guatemala',
          startDate: '2024-02-15T09:00:00Z',
          endDate: '2024-02-15T17:00:00Z',
          location: 'Centro de Convenciones, Ciudad de Guatemala',
          capacity: 300,
          registeredCount: 145,
          price: 250,
          topics: ['Transformación Digital', 'Innovación', 'Tecnología Empresarial', 'Estrategia'],
          level: 'intermediate',
          status: 'active'
        },
        {
          id: '2',
          title: 'Inteligencia Artificial: El Futuro del Trabajo',
          description: 'Descubre cómo la IA está revolucionando los procesos laborales y qué significa para los profesionales del futuro.',
          speaker: 'Ing. Carlos Rodríguez',
          speakerTitle: 'CEO, AI Solutions Guatemala',
          startDate: '2024-03-20T08:30:00Z',
          endDate: '2024-03-20T16:30:00Z',
          location: 'Hotel Marriott, Zona 10',
          capacity: 250,
          registeredCount: 98,
          price: 200,
          topics: ['Inteligencia Artificial', 'Automatización', 'Futuro del Trabajo', 'Machine Learning'],
          level: 'advanced',
          status: 'active'
        },
        {
          id: '3',
          title: 'Emprendimiento Digital: De la Idea al Éxito',
          description: 'Aprende los fundamentos del emprendimiento digital y las estrategias para convertir ideas innovadoras en negocios exitosos.',
          speaker: 'Lic. Ana López',
          speakerTitle: 'Fundadora, Startup Academy',
          startDate: '2024-04-10T09:00:00Z',
          endDate: '2024-04-10T17:00:00Z',
          location: 'Centro Empresarial, Zona 4',
          capacity: 200,
          registeredCount: 67,
          price: 150,
          topics: ['Emprendimiento', 'Startups', 'Innovación', 'Negocios Digitales'],
          level: 'beginner',
          status: 'active'
        }
      ]

      let filteredConferences = mockConferences
      if (filterLevel !== 'all') {
        filteredConferences = mockConferences.filter(conf => conf.level === filterLevel)
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setConferences(filteredConferences)
    } catch (error) {
      console.error('Error fetching conferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    }
    const labels = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    }
    return <Badge className={colors[level as keyof typeof colors]}>{labels[level as keyof typeof labels]}</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleConferenceClick = (conferenceId: string) => {
    navigate(`/event/${conferenceId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando conferencias...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaMicrophone className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conferencias
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre conferencias inspiradoras con expertos líderes en sus campos.
            Aprende de las mejores mentes y expande tus conocimientos.
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'beginner', label: 'Principiante' },
              { value: 'intermediate', label: 'Intermedio' },
              { value: 'advanced', label: 'Avanzado' }
            ].map((option) => (
              <Button
                key={option.value}
                variant={filterLevel === option.value ? 'default' : 'outline'}
                onClick={() => setFilterLevel(option.value as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Conferences Grid */}
        {conferences.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FaMicrophone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay conferencias disponibles</h3>
              <p>No se encontraron conferencias en esta categoría por el momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {conferences.map((conference) => (
              <Card key={conference.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl line-clamp-2">{conference.title}</CardTitle>
                    <div className="flex space-x-2">
                      {getLevelBadge(conference.level)}
                      {getStatusBadge(conference.status)}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-3 text-base">
                    {conference.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Speaker Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaMicrophone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{conference.speaker}</p>
                        <p className="text-sm text-gray-600">{conference.speakerTitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 h-4 w-4" />
                      {formatDate(conference.startDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 h-4 w-4" />
                      {formatTime(conference.startDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 col-span-2">
                      <FaMapMarkerAlt className="mr-2 h-4 w-4" />
                      {conference.location}
                    </div>
                  </div>

                  {/* Topics */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Temas principales:</p>
                    <div className="flex flex-wrap gap-2">
                      {conference.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {conference.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{conference.topics.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Capacity and Price */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUsers className="mr-2 h-4 w-4" />
                      {conference.registeredCount}/{conference.capacity} inscritos
                    </div>
                    <div className="text-xl font-bold text-primary">
                      Q{conference.price.toFixed(2)}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleConferenceClick(conference.id)}
                  >
                    Ver Conferencia
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Why Attend Section */}
        <div className="mt-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>¿Por qué asistir a nuestras conferencias?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaLightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Conocimiento Experto</h3>
                  <p className="text-sm text-gray-600">
                    Aprende de profesionales reconocidos con años de experiencia en sus campos.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaHandshake className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Networking</h3>
                  <p className="text-sm text-gray-600">
                    Conecta con otros profesionales y expande tu red de contactos.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaMicrophone className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Contenido Actual</h3>
                  <p className="text-sm text-gray-600">
                    Mantente al día con las últimas tendencias y mejores prácticas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4">
                ¿Quieres ser ponente en nuestras conferencias?
              </h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Si eres un experto en tu campo y quieres compartir tu conocimiento,
                contáctanos para unirte a nuestro grupo de speakers.
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/contacto')}
              >
                Contactar Organizador
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}