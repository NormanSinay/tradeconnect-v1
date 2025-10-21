import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaTools, FaChalkboardTeacher, FaHandsHelping } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'

interface Workshop {
  id: string
  title: string
  description: string
  instructor: string
  instructorTitle: string
  startDate: string
  endDate: string
  location: string
  capacity: number
  registeredCount: number
  price: number
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  materials: string[]
  imageUrl?: string
  status: 'active' | 'cancelled' | 'completed'
}

export const WorkshopsPage: React.FC = () => {
  const navigate = useNavigate()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLevel, setFilterLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  useEffect(() => {
    fetchWorkshops()
  }, [filterLevel])

  const fetchWorkshops = async () => {
    try {
      setLoading(true)

      // In a real app, you would call your API
      // const response = await api.get('/events/workshops', {
      //   params: { level: filterLevel }
      // })

      // Mock data for workshops
      const mockWorkshops: Workshop[] = [
        {
          id: '1',
          title: 'Taller de Marketing Digital para Emprendedores',
          description: 'Aprende a crear estrategias de marketing digital efectivas desde cero. Incluye prácticas con herramientas reales.',
          instructor: 'Lic. Sofia Martínez',
          instructorTitle: 'Especialista en Marketing Digital, Digital Agency',
          startDate: '2024-02-20T09:00:00Z',
          endDate: '2024-02-22T17:00:00Z',
          location: 'Centro de Capacitación Empresarial, Zona 4',
          capacity: 25,
          registeredCount: 18,
          price: 350,
          duration: '3 días (24 horas)',
          level: 'beginner',
          prerequisites: ['Conocimientos básicos de computación', 'Acceso a internet'],
          materials: ['Laptop', 'Materiales digitales incluidos', 'Certificado de participación'],
          status: 'active'
        },
        {
          id: '2',
          title: 'Gestión Avanzada de Proyectos con Metodologías Ágiles',
          description: 'Domina las técnicas avanzadas de gestión de proyectos usando Scrum, Kanban y otras metodologías ágiles.',
          instructor: 'MSc. Roberto García',
          instructorTitle: 'Project Manager Senior, Tech Solutions',
          startDate: '2024-03-15T08:30:00Z',
          endDate: '2024-03-16T16:30:00Z',
          location: 'Hotel Intercontinental, Zona 10',
          capacity: 30,
          registeredCount: 22,
          price: 450,
          duration: '2 días (16 horas)',
          level: 'advanced',
          prerequisites: ['Experiencia previa en gestión de proyectos', 'Conocimientos básicos de metodologías ágiles'],
          materials: ['Guía de ejercicios', 'Templates de proyecto', 'Acceso a plataforma online'],
          status: 'active'
        },
        {
          id: '3',
          title: 'Finanzas Personales y Empresariales',
          description: 'Aprende a manejar tus finanzas personales y cómo aplicar estos principios en tu negocio.',
          instructor: 'CPA. Ana López',
          instructorTitle: 'Contadora Pública, Consultora Financiera',
          startDate: '2024-04-05T09:00:00Z',
          endDate: '2024-04-05T17:00:00Z',
          location: 'Centro Empresarial, Zona 4',
          capacity: 40,
          registeredCount: 15,
          price: 200,
          duration: '1 día (8 horas)',
          level: 'intermediate',
          prerequisites: ['Conocimientos básicos de matemáticas financieras'],
          materials: ['Calculadora financiera', 'Ejemplos prácticos', 'Plantillas de presupuesto'],
          status: 'active'
        }
      ]

      let filteredWorkshops = mockWorkshops
      if (filterLevel !== 'all') {
        filteredWorkshops = mockWorkshops.filter(ws => ws.level === filterLevel)
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setWorkshops(filteredWorkshops)
    } catch (error) {
      console.error('Error fetching workshops:', error)
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

  const handleWorkshopClick = (workshopId: string) => {
    navigate(`/event/${workshopId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando talleres...</p>
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
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTools className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Talleres Prácticos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Participa en talleres intensivos donde aprenderás habilidades prácticas
            aplicables inmediatamente en tu trabajo o negocio.
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Todos' },
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

        {/* Workshops Grid */}
        {workshops.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FaTools className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay talleres disponibles</h3>
              <p>No se encontraron talleres en esta categoría por el momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {workshops.map((workshop) => (
              <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl line-clamp-2">{workshop.title}</CardTitle>
                    <div className="flex space-x-2">
                      {getLevelBadge(workshop.level)}
                      {getStatusBadge(workshop.status)}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-3 text-base">
                    {workshop.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Instructor Info */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <FaChalkboardTeacher className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{workshop.instructor}</p>
                        <p className="text-sm text-gray-600">{workshop.instructorTitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Workshop Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 h-4 w-4" />
                      {formatDate(workshop.startDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 h-4 w-4" />
                      {workshop.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 col-span-2">
                      <FaMapMarkerAlt className="mr-2 h-4 w-4" />
                      {workshop.location}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {workshop.prerequisites.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Prerrequisitos:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {workshop.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Materials */}
                  {workshop.materials.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Materiales incluidos:</p>
                      <div className="flex flex-wrap gap-2">
                        {workshop.materials.map((material, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capacity and Price */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUsers className="mr-2 h-4 w-4" />
                      {workshop.registeredCount}/{workshop.capacity} inscritos
                    </div>
                    <div className="text-xl font-bold text-primary">
                      Q{workshop.price.toFixed(2)}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleWorkshopClick(workshop.id)}
                  >
                    Ver Taller
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Why Choose Our Workshops */}
        <div className="mt-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>¿Por qué elegir nuestros talleres?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaHandsHelping className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Aprendizaje Práctico</h3>
                  <p className="text-sm text-gray-600">
                    Enfoque hands-on con ejercicios reales y proyectos aplicables.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaChalkboardTeacher className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Instructores Expertos</h3>
                  <p className="text-sm text-gray-600">
                    Profesionales con experiencia real en la industria y enseñanza.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FaTools className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Herramientas Incluidas</h3>
                  <p className="text-sm text-gray-600">
                    Todo el material necesario incluido en el precio del taller.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4">
                ¿Quieres dictar un taller?
              </h2>
              <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                Si eres un experto en tu campo y quieres compartir tus conocimientos
                de forma práctica, contáctanos para ser instructor en nuestros talleres.
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/contacto')}
              >
                Aplicar como Instructor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}