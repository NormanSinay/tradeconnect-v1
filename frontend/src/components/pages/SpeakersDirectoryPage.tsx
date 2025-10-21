import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaUserTie, FaStar, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaLinkedin, FaTwitter, FaGlobe } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
}

export const SpeakersDirectoryPage: React.FC = () => {
  const navigate = useNavigate()
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterExpertise, setFilterExpertise] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'experience' | 'events'>('rating')

  useEffect(() => {
    fetchSpeakers()
  }, [searchQuery, filterExpertise, sortBy])

  const fetchSpeakers = async () => {
    try {
      setLoading(true)

      // In a real app, you would call your API
      // const response = await api.get('/speakers', {
      //   params: { search: searchQuery, expertise: filterExpertise, sort: sortBy }
      // })

      // Mock data for speakers
      const mockSpeakers: Speaker[] = [
        {
          id: '1',
          name: 'Dra. María González',
          title: 'Directora de Innovación',
          company: 'TechCorp Guatemala',
          bio: 'Experta en transformación digital con más de 15 años liderando proyectos tecnológicos en empresas Fortune 500.',
          expertise: ['Transformación Digital', 'Innovación', 'Liderazgo Tecnológico'],
          experience: 15,
          rating: 4.9,
          reviewCount: 47,
          location: 'Ciudad de Guatemala',
          languages: ['Español', 'Inglés'],
          socialLinks: {
            linkedin: 'https://linkedin.com/in/maria-gonzalez',
            website: 'https://mariagonzalez.gt'
          },
          featured: true,
          availableForHire: true,
          eventsCount: 23
        },
        {
          id: '2',
          name: 'Ing. Carlos Rodríguez',
          title: 'CEO & Fundador',
          company: 'AI Solutions Guatemala',
          bio: 'Pionero en inteligencia artificial en Centroamérica. Ha implementado soluciones de IA en más de 50 empresas.',
          expertise: ['Inteligencia Artificial', 'Machine Learning', 'Automatización'],
          experience: 12,
          rating: 4.8,
          reviewCount: 38,
          location: 'Antigua Guatemala',
          languages: ['Español', 'Inglés', 'Portugués'],
          socialLinks: {
            linkedin: 'https://linkedin.com/in/carlos-rodriguez',
            twitter: 'https://twitter.com/carlosai'
          },
          featured: true,
          availableForHire: false,
          eventsCount: 31
        },
        {
          id: '3',
          name: 'Lic. Sofia Martínez',
          title: 'Especialista en Marketing Digital',
          company: 'Digital Agency Pro',
          bio: 'Estratega digital especializada en crecimiento de startups y transformación de marcas tradicionales.',
          expertise: ['Marketing Digital', 'Growth Hacking', 'E-commerce'],
          experience: 8,
          rating: 4.7,
          reviewCount: 29,
          location: 'Quetzaltenango',
          languages: ['Español', 'Inglés'],
          socialLinks: {
            linkedin: 'https://linkedin.com/in/sofia-martinez',
            website: 'https://sofiamartinez.com'
          },
          featured: false,
          availableForHire: true,
          eventsCount: 18
        },
        {
          id: '4',
          name: 'MSc. Roberto García',
          title: 'Project Manager Senior',
          company: 'Tech Solutions International',
          bio: 'Experto en gestión de proyectos tecnológicos con certificaciones PMP y CSM. Ha liderado equipos de desarrollo en 4 continentes.',
          expertise: ['Gestión de Proyectos', 'Metodologías Ágiles', 'Scrum'],
          experience: 10,
          rating: 4.6,
          reviewCount: 22,
          location: 'Ciudad de Guatemala',
          languages: ['Español', 'Inglés', 'Francés'],
          socialLinks: {
            linkedin: 'https://linkedin.com/in/roberto-garcia-pmp'
          },
          featured: false,
          availableForHire: true,
          eventsCount: 15
        }
      ]

      let filteredSpeakers = mockSpeakers

      // Apply search filter
      if (searchQuery) {
        filteredSpeakers = filteredSpeakers.filter(speaker =>
          speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          speaker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          speaker.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase())) ||
          speaker.bio.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Apply expertise filter
      if (filterExpertise !== 'all') {
        filteredSpeakers = filteredSpeakers.filter(speaker =>
          speaker.expertise.some(exp => exp.toLowerCase().includes(filterExpertise.toLowerCase()))
        )
      }

      // Apply sorting
      filteredSpeakers.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'rating':
            return b.rating - a.rating
          case 'experience':
            return b.experience - a.experience
          case 'events':
            return b.eventsCount - a.eventsCount
          default:
            return 0
        }
      })

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      setSpeakers(filteredSpeakers)
    } catch (error) {
      console.error('Error fetching speakers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSpeakerClick = (speakerId: string) => {
    navigate(`/speakers/${speakerId}`)
  }

  const getExpertiseOptions = () => {
    const allExpertise = speakers.flatMap(speaker => speaker.expertise)
    return [...new Set(allExpertise)].sort()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando directorio de speakers...</p>
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
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserTie className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Directorio de Speakers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conoce a nuestros expertos speakers. Profesionales reconocidos dispuestos a compartir
            su conocimiento y experiencia en conferencias y talleres.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar speakers por nombre, especialidad o empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas las especialidades</option>
                {getExpertiseOptions().map(expertise => (
                  <option key={expertise} value={expertise.toLowerCase()}>
                    {expertise}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="rating">Mejor calificados</option>
                <option value="experience">Más experiencia</option>
                <option value="events">Más eventos</option>
                <option value="name">Nombre (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Speakers Grid */}
        {speakers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FaUserTie className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron speakers</h3>
              <p>No hay speakers que coincidan con tu búsqueda.</p>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setFilterExpertise('all')
                }}
                className="mt-4"
              >
                Ver todos los speakers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <Card key={speaker.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleSpeakerClick(speaker.id)}>
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={speaker.imageUrl} alt={speaker.name} />
                      <AvatarFallback className="text-2xl">
                        {speaker.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {speaker.featured && (
                      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white">
                        Destacado
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-xl">{speaker.name}</CardTitle>
                  <CardDescription className="text-base">
                    {speaker.title}
                    <br />
                    <span className="font-medium text-gray-700">{speaker.company}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <FaStar className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{speaker.rating}</span>
                      <span className="text-sm text-gray-600">({speaker.reviewCount})</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {speaker.eventsCount} eventos
                    </div>
                  </div>

                  {/* Location and Experience */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-1 h-3 w-3" />
                      {speaker.location}
                    </div>
                    <div className="flex items-center">
                      <FaBriefcase className="mr-1 h-3 w-3" />
                      {speaker.experience} años
                    </div>
                  </div>

                  {/* Expertise */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {speaker.expertise.slice(0, 2).map((exp, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                      {speaker.expertise.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{speaker.expertise.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <FaGraduationCap className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {speaker.languages.join(', ')}
                      </span>
                    </div>
                    {speaker.availableForHire && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Disponible
                      </Badge>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-3 pt-2">
                    {speaker.socialLinks.linkedin && (
                      <a
                        href={speaker.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaLinkedin className="h-5 w-5" />
                      </a>
                    )}
                    {speaker.socialLinks.twitter && (
                      <a
                        href={speaker.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaTwitter className="h-5 w-5" />
                      </a>
                    )}
                    {speaker.socialLinks.website && (
                      <a
                        href={speaker.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaGlobe className="h-5 w-5" />
                      </a>
                    )}
                  </div>

                  <Button className="w-full" size="sm">
                    Ver Perfil Completo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4">
                ¿Quieres ser parte de nuestro directorio?
              </h2>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Si eres un experto en tu campo y quieres compartir tu conocimiento como speaker,
                contáctanos para unirte a nuestra comunidad de profesionales.
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/contacto')}
              >
                Aplicar como Speaker
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}