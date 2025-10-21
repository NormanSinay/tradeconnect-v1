import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaStar, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaLinkedin, FaTwitter, FaGlobe, FaCalendarAlt, FaUsers, FaAward, FaArrowLeft, FaEnvelope, FaPhone } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/services/api'

interface Speaker {
  id: string
  name: string
  title: string
  company: string
  bio: string
  expertise: string[]
  experience: number
  rating: number
  reviewCount: number
  location: string
  languages: string[]
  socialLinks: {
    linkedin?: string
    twitter?: string
    website?: string
  }
  imageUrl?: string
  featured: boolean
  availableForHire: boolean
  eventsCount: number
  education: string[]
  certifications: string[]
  pastEvents: Array<{
    id: string
    title: string
    date: string
    attendees: number
    rating: number
  }>
  reviews: Array<{
    id: string
    userName: string
    rating: number
    comment: string
    date: string
    eventTitle: string
  }>
}

export const SpeakerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchSpeakerProfile()
    }
  }, [id])

  const fetchSpeakerProfile = async () => {
    try {
      setLoading(true)

      // In a real app, you would call your API
      // const response = await api.get(`/speakers/${id}`)

      // Mock data for speaker profile
      const mockSpeaker: Speaker = {
        id: id || '1',
        name: 'Dra. María González',
        title: 'Directora de Innovación',
        company: 'TechCorp Guatemala',
        bio: `María González es una reconocida experta en transformación digital con más de 15 años de experiencia liderando proyectos tecnológicos en empresas Fortune 500. Ha sido pionera en la adopción de tecnologías emergentes en Centroamérica y ha asesorado a más de 50 empresas en su proceso de digitalización.

        Su experiencia abarca desde la implementación de estrategias de innovación hasta la gestión del cambio cultural en organizaciones tradicionales. María ha sido keynote speaker en más de 30 conferencias internacionales y ha publicado numerosos artículos sobre transformación digital en revistas especializadas.

        Actualmente dirige el Centro de Innovación de TechCorp Guatemala, donde lidera proyectos de investigación en inteligencia artificial, blockchain y realidad aumentada aplicados a diversos sectores de la economía guatemalteca.`,
        expertise: ['Transformación Digital', 'Innovación', 'Liderazgo Tecnológico', 'Estrategia Empresarial', 'Gestión del Cambio'],
        experience: 15,
        rating: 4.9,
        reviewCount: 47,
        location: 'Ciudad de Guatemala, Guatemala',
        languages: ['Español (Nativo)', 'Inglés (Fluido)', 'Francés (Básico)'],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/maria-gonzalez',
          twitter: 'https://twitter.com/mariagonzalez_gt',
          website: 'https://mariagonzalez.gt'
        },
        featured: true,
        availableForHire: true,
        eventsCount: 23,
        education: [
          'Doctorado en Administración de Empresas - Universidad Francisco Marroquín',
          'Maestría en Tecnología de la Información - MIT (Programa Ejecutivo)',
          'Licenciatura en Ingeniería en Sistemas - Universidad del Valle de Guatemala'
        ],
        certifications: [
          'Certified Digital Transformation Leader (CDTL)',
          'Project Management Professional (PMP)',
          'Google Cloud Professional Cloud Architect',
          'AWS Certified Solutions Architect'
        ],
        pastEvents: [
          {
            id: '1',
            title: 'Conferencia Anual de Innovación Tecnológica',
            date: '2024-01-15',
            attendees: 250,
            rating: 4.8
          },
          {
            id: '2',
            title: 'Taller de Transformación Digital para Pymes',
            date: '2023-11-20',
            attendees: 45,
            rating: 4.9
          },
          {
            id: '3',
            title: 'Keynote: El Futuro del Trabajo Digital',
            date: '2023-09-10',
            attendees: 180,
            rating: 4.7
          }
        ],
        reviews: [
          {
            id: '1',
            userName: 'Ana López',
            rating: 5,
            comment: 'Excelente presentación. María tiene una capacidad increíble para explicar conceptos complejos de manera sencilla y práctica.',
            date: '2024-01-16',
            eventTitle: 'Conferencia Anual de Innovación Tecnológica'
          },
          {
            id: '2',
            userName: 'Carlos Rodríguez',
            rating: 5,
            comment: 'Sus consejos sobre transformación digital han sido fundamentales para el crecimiento de mi empresa. Altamente recomendado.',
            date: '2023-11-21',
            eventTitle: 'Taller de Transformación Digital para Pymes'
          },
          {
            id: '3',
            userName: 'María José García',
            rating: 4,
            comment: 'Muy buena speaker, con gran experiencia. El contenido fue muy útil y aplicable.',
            date: '2023-09-11',
            eventTitle: 'Keynote: El Futuro del Trabajo Digital'
          }
        ]
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSpeaker(mockSpeaker)
    } catch (error) {
      console.error('Error fetching speaker profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil del speaker...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!speaker) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Speaker no encontrado</h3>
              <p>El perfil del speaker que buscas no existe.</p>
              <Button onClick={() => navigate('/speakers')} className="mt-4">
                Volver al directorio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/speakers')}
          className="mb-6"
        >
          <FaArrowLeft className="mr-2 h-4 w-4" />
          Volver al directorio
        </Button>

        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={speaker.imageUrl} alt={speaker.name} />
                  <AvatarFallback className="text-4xl">
                    {speaker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {speaker.featured && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white">
                    Destacado
                  </Badge>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{speaker.name}</h1>
                  {speaker.availableForHire && (
                    <Badge className="bg-green-100 text-green-800">
                      Disponible para contratar
                    </Badge>
                  )}
                </div>

                <p className="text-xl text-gray-600 mb-2">{speaker.title}</p>
                <p className="text-lg font-medium text-primary mb-4">{speaker.company}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-1 h-4 w-4" />
                    {speaker.location}
                  </div>
                  <div className="flex items-center">
                    <FaBriefcase className="mr-1 h-4 w-4" />
                    {speaker.experience} años de experiencia
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-1 h-4 w-4" />
                    {speaker.eventsCount} eventos realizados
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(speaker.rating)}
                    <span className="font-semibold ml-2">{speaker.rating}</span>
                    <span className="text-gray-600">({speaker.reviewCount} reseñas)</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex space-x-3">
                  {speaker.socialLinks.linkedin && (
                    <a
                      href={speaker.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaLinkedin className="h-6 w-6" />
                    </a>
                  )}
                  {speaker.socialLinks.twitter && (
                    <a
                      href={speaker.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FaTwitter className="h-6 w-6" />
                    </a>
                  )}
                  {speaker.socialLinks.website && (
                    <a
                      href={speaker.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <FaGlobe className="h-6 w-6" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">Sobre mí</TabsTrigger>
            <TabsTrigger value="expertise">Especialidades</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Biografía</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {speaker.bio}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <FaGraduationCap className="mr-2 h-4 w-4" />
                      Educación
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {speaker.education.map((edu, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <FaAward className="mr-2 h-4 w-4" />
                      Certificaciones
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {speaker.certifications.map((cert, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Idiomas</h4>
                  <div className="flex flex-wrap gap-2">
                    {speaker.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expertise">
            <Card>
              <CardHeader>
                <CardTitle>Areas de Especialización</CardTitle>
                <CardDescription>
                  Campos en los que {speaker.name.split(' ')[0]} tiene mayor expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {speaker.expertise.map((exp, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">{exp}</h4>
                      <p className="text-sm text-blue-700">
                        Especialista reconocido en esta área con amplia experiencia práctica.
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Recientes</CardTitle>
                <CardDescription>
                  Conferencias y talleres donde {speaker.name.split(' ')[0]} ha participado recientemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {speaker.pastEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <div className="flex items-center space-x-1">
                          {renderStars(event.rating)}
                          <span className="text-sm text-gray-600 ml-2">{event.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1 h-3 w-3" />
                          {new Date(event.date).toLocaleDateString('es-GT')}
                        </div>
                        <div className="flex items-center">
                          <FaUsers className="mr-1 h-3 w-3" />
                          {event.attendees} asistentes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas de Asistentes</CardTitle>
                <CardDescription>
                  Opiniones de personas que han asistido a eventos con {speaker.name.split(' ')[0]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {speaker.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <p className="text-sm text-gray-600">{review.eventTitle}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(review.date).toLocaleDateString('es-GT')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact CTA */}
        {speaker.availableForHire && (
          <Card className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                ¿Interesado en contratar a {speaker.name.split(' ')[0]}?
              </h2>
              <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                {speaker.name.split(' ')[0]} está disponible para conferencias, talleres y consultorías.
                Contáctanos para discutir disponibilidad y tarifas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/contacto')}
                >
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  Solicitar Información
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white hover:bg-white hover:text-green-600"
                  onClick={() => window.location.href = `tel:+50222223333`}
                >
                  <FaPhone className="mr-2 h-4 w-4" />
                  Llamar Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}