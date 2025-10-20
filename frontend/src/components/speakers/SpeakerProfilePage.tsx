import React, { useState, useEffect } from 'react'
import { FaUser, FaStar, FaCalendarAlt, FaMapMarkerAlt, FaLink, FaTwitter, FaLinkedin, FaGlobe, FaEnvelope, FaPhone, FaBriefcase } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatEventDate, formatDateTime } from '@/utils/date'
import { showToast } from '@/utils/toast'
import { cn } from '@/lib/utils'

// Mock speaker data - in a real app, this would come from an API
interface Speaker {
  id: string
  name: string
  title: string
  bio: string
  avatar?: string
  company?: string
  location?: string
  email?: string
  phone?: string
  website?: string
  linkedin?: string
  twitter?: string
  rating: number
  totalEvents: number
  totalAttendees: number
  specialties: string[]
  languages: string[]
  events: Array<{
    id: string
    title: string
    date: Date
    location: string
    attendees: number
    rating: number
  }>
  reviews: Array<{
    id: string
    userName: string
    userAvatar?: string
    rating: number
    comment: string
    date: Date
    eventTitle: string
  }>
}

const mockSpeaker: Speaker = {
  id: '1',
  name: 'María González',
  title: 'Arquitecta de Software Senior',
  bio: 'Experta en desarrollo web moderno con más de 10 años de experiencia. Especialista en React, Node.js y arquitecturas de microservicios. Ha trabajado en empresas Fortune 500 y startups innovadoras.',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  company: 'TechCorp Guatemala',
  location: 'Guatemala City, Guatemala',
  email: 'maria.gonzalez@techcorp.gt',
  phone: '+502 5555 1234',
  website: 'https://mariagonzalez.dev',
  linkedin: 'https://linkedin.com/in/mariagonzalez',
  twitter: '@maria_gonzalez_gt',
  rating: 4.8,
  totalEvents: 45,
  totalAttendees: 2500,
  specialties: ['React', 'TypeScript', 'Node.js', 'Microservicios', 'DevOps'],
  languages: ['Español', 'Inglés'],
  events: [
    {
      id: '1',
      title: 'Introducción a React 18',
      date: new Date('2024-03-15'),
      location: 'Centro Cultural Miguel Ángel Asturias',
      attendees: 120,
      rating: 4.9,
    },
    {
      id: '2',
      title: 'Arquitecturas de Microservicios',
      date: new Date('2024-02-20'),
      location: 'Hotel Marriott',
      attendees: 85,
      rating: 4.7,
    },
    {
      id: '3',
      title: 'TypeScript Avanzado',
      date: new Date('2024-01-25'),
      location: 'Universidad Francisco Marroquín',
      attendees: 95,
      rating: 4.8,
    },
  ],
  reviews: [
    {
      id: '1',
      userName: 'Carlos Rodríguez',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      rating: 5,
      comment: 'Excelente presentación, muy clara y práctica. Los ejemplos fueron perfectos.',
      date: new Date('2024-03-16'),
      eventTitle: 'Introducción a React 18',
    },
    {
      id: '2',
      userName: 'Ana López',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      rating: 5,
      comment: 'María es una excelente speaker. Su experiencia se nota en cada explicación.',
      date: new Date('2024-02-21'),
      eventTitle: 'Arquitecturas de Microservicios',
    },
  ],
}

interface SpeakerProfilePageProps {
  speakerId?: string
  className?: string
}

export const SpeakerProfilePage: React.FC<SpeakerProfilePageProps> = ({
  speakerId = '1',
  className,
}) => {
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSpeaker = async () => {
      try {
        setIsLoading(true)
        // In a real app, this would be an API call
        // const response = await api.get(`/speakers/${speakerId}`)
        // setSpeaker(response.data)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSpeaker(mockSpeaker)
      } catch (error) {
        console.error('Error loading speaker:', error)
        showToast.error('Error al cargar la información del speaker')
      } finally {
        setIsLoading(false)
      }
    }

    loadSpeaker()
  }, [speakerId])

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={cn(
              starSize,
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            )}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando perfil del speaker...</p>
        </div>
      </div>
    )
  }

  if (!speaker) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FaUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Speaker no encontrado
          </h3>
          <p className="text-gray-500">
            No se pudo encontrar la información del speaker solicitado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={speaker.avatar} alt={speaker.name} />
            <AvatarFallback className="text-2xl">
              {speaker.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{speaker.name}</h1>
            <p className="text-xl text-gray-600 mb-3">{speaker.title}</p>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {renderStars(speaker.rating, 'lg')}

              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <FaCalendarAlt className="h-4 w-4" />
                <span>{speaker.totalEvents} eventos</span>
              </div>

              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <FaUser className="h-4 w-4" />
                <span>{speaker.totalAttendees.toLocaleString()} asistentes</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {speaker.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button className="w-full">Contactar</Button>
            <Button variant="outline" className="w-full">
              Seguir
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">Sobre mí</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Biografía</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{speaker.bio}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Especialidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {speaker.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Idiomas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {speaker.languages.map((language) => (
                        <Badge key={language} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-4">
              {speaker.events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="h-4 w-4" />
                            <span>{formatEventDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaUser className="h-4 w-4" />
                            <span>{event.attendees} asistentes</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {renderStars(event.rating, 'sm')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              {speaker.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                        <AvatarFallback>
                          {review.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{review.userName}</h4>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(review.date)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 italic">
                          "{review.eventTitle}"
                        </p>

                        {renderStars(review.rating, 'sm')}

                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {speaker.email && (
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{speaker.email}</span>
                </div>
              )}

              {speaker.phone && (
                <div className="flex items-center space-x-3">
                  <FaPhone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{speaker.phone}</span>
                </div>
              )}

              {speaker.website && (
                <div className="flex items-center space-x-3">
                  <FaGlobe className="h-4 w-4 text-gray-400" />
                  <a
                    href={speaker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Sitio web
                  </a>
                </div>
              )}

              {speaker.linkedin && (
                <div className="flex items-center space-x-3">
                  <FaLinkedin className="h-4 w-4 text-blue-600" />
                  <a
                    href={speaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              )}

              {speaker.twitter && (
                <div className="flex items-center space-x-3">
                  <FaTwitter className="h-4 w-4 text-blue-400" />
                  <a
                    href={speaker.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Twitter
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company & Location */}
          {(speaker.company || speaker.location) && (
            <Card>
              <CardHeader>
                <CardTitle>Información Profesional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {speaker.company && (
                  <div className="flex items-center space-x-3">
                    <FaBriefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{speaker.company}</span>
                  </div>
                )}

                {speaker.location && (
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{speaker.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{speaker.totalEvents}</div>
                  <div className="text-sm text-gray-600">Eventos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {speaker.totalAttendees.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Asistentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}