import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FaPlay, FaPause, FaStop, FaPodcast, FaUsers, FaEye, FaExclamationTriangle, FaSignal, FaVideo, FaMicrophone } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { adminEventService } from '@/services/admin'
import type { DetailedEvent } from '@/types/admin'

interface StreamingStats {
  isLive: boolean
  viewerCount: number
  duration: number
  bitrate: number
  quality: string
  participants: number
  chatMessages: number
}

const AdminStreamingPage: React.FC = () => {
  const { eventoId } = useParams<{ eventoId: string }>()
  const [event, setEvent] = useState<DetailedEvent | null>(null)
  const [streamingStats, setStreamingStats] = useState<StreamingStats>({
    isLive: false,
    viewerCount: 0,
    duration: 0,
    bitrate: 0,
    quality: 'HD',
    participants: 0,
    chatMessages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streamKey, setStreamKey] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [announcement, setAnnouncement] = useState('')

  const eventId = eventoId ? parseInt(eventoId, 10) : null

  useEffect(() => {
    if (eventId) {
      loadEvent()
      loadStreamingStats()
      // Simular actualización en tiempo real
      const interval = setInterval(loadStreamingStats, 5000)
      return () => clearInterval(interval)
    }
  }, [eventId])

  const loadEvent = async () => {
    if (!eventId) return

    try {
      const eventData = await adminEventService.getEventById(eventId)
      setEvent(eventData)
    } catch (err) {
      console.error('Error cargando evento:', err)
      setError('Error al cargar los datos del evento')
    } finally {
      setLoading(false)
    }
  }

  const loadStreamingStats = async () => {
    // TODO: Implementar servicio de streaming
    // Simular datos por ahora
    setStreamingStats(prev => ({
      ...prev,
      viewerCount: Math.floor(Math.random() * 100) + 50,
      participants: Math.floor(Math.random() * 20) + 10,
      chatMessages: prev.chatMessages + Math.floor(Math.random() * 5),
      duration: prev.isLive ? prev.duration + 5 : prev.duration,
    }))
  }

  const handleStartStream = async () => {
    try {
      // TODO: Implementar inicio de stream
      setStreamingStats(prev => ({ ...prev, isLive: true, duration: 0 }))
    } catch (err) {
      console.error('Error iniciando stream:', err)
      setError('Error al iniciar la transmisión')
    }
  }

  const handleStopStream = async () => {
    try {
      // TODO: Implementar parada de stream
      setStreamingStats(prev => ({ ...prev, isLive: false }))
    } catch (err) {
      console.error('Error deteniendo stream:', err)
      setError('Error al detener la transmisión')
    }
  }

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return

    try {
      // TODO: Implementar envío de anuncio
      console.log('Enviando anuncio:', announcement)
      setAnnouncement('')
    } catch (err) {
      console.error('Error enviando anuncio:', err)
      setError('Error al enviar el anuncio')
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: event?.title || 'Transmisión', href: `/admin/transmision/${eventId}` },
  ]

  if (loading) {
    return (
      <AdminLayout title="Cargando..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!event) {
    return (
      <AdminLayout title="Error" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">No se pudo cargar el evento</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Transmisión: ${event.title}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Panel de Transmisión</h1>
            <p className="text-gray-600">Controla la transmisión en vivo de {event.title}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!streamingStats.isLive ? (
              <Button onClick={handleStartStream} className="bg-red-600 hover:bg-red-700">
                <FaPlay className="mr-2" />
                Iniciar Transmisión
              </Button>
            ) : (
              <Button onClick={handleStopStream} variant="destructive">
                <FaStop className="mr-2" />
                Detener Transmisión
              </Button>
            )}
          </div>
        </div>

        {/* Estado de la transmisión */}
        <Card className={streamingStats.isLive ? 'border-red-200 bg-red-50' : 'border-gray-200'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${streamingStats.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <div>
                  <h3 className="text-lg font-medium">
                    {streamingStats.isLive ? 'EN VIVO' : 'Transmisión Detenida'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {streamingStats.isLive
                      ? `Transmitiendo por ${formatDuration(streamingStats.duration)}`
                      : 'La transmisión no está activa'
                    }
                  </p>
                </div>
              </div>
              <Badge variant={streamingStats.isLive ? 'destructive' : 'secondary'}>
                {streamingStats.isLive ? 'EN VIVO' : 'DETENIDO'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaEye className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{streamingStats.viewerCount}</p>
                  <p className="text-sm text-gray-600">Espectadores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaUsers className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{streamingStats.participants}</p>
                  <p className="text-sm text-gray-600">Participantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaSignal className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{streamingStats.bitrate}kbps</p>
                  <p className="text-sm text-gray-600">Bitrate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaPodcast className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{streamingStats.chatMessages}</p>
                  <p className="text-sm text-gray-600">Mensajes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración de Stream */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FaVideo className="h-5 w-5" />
                <span>Configuración de Stream</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="streamUrl">URL del Stream</Label>
                <input
                  id="streamUrl"
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="rtmp://stream.example.com/live"
                />
              </div>

              <div>
                <Label htmlFor="streamKey">Stream Key</Label>
                <input
                  id="streamKey"
                  type="password"
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tu clave de stream"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Calidad</Label>
                  <select
                    value={streamingStats.quality}
                    onChange={(e) => setStreamingStats(prev => ({ ...prev, quality: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="SD">SD (480p)</option>
                    <option value="HD">HD (720p)</option>
                    <option value="FHD">FHD (1080p)</option>
                    <option value="4K">4K</option>
                  </select>
                </div>

                <div>
                  <Label>Bitrate</Label>
                  <input
                    type="number"
                    value={streamingStats.bitrate}
                    onChange={(e) => setStreamingStats(prev => ({ ...prev, bitrate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="3000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anuncios y Mensajes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FaPodcast className="h-5 w-5" />
                <span>Anuncios en Vivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="announcement">Mensaje para espectadores</Label>
                <Textarea
                  id="announcement"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Escribe un mensaje para enviar a todos los espectadores..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSendAnnouncement} disabled={!announcement.trim()}>
                <FaPodcast className="mr-2" />
                Enviar Anuncio
              </Button>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Anuncios recientes</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• La transmisión comenzará en 5 minutos</div>
                  <div>• Recuerden activar sus cámaras</div>
                  <div>• Bienvenidos al evento</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de Audio/Video */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FaMicrophone className="h-5 w-5" />
              <span>Controles de Audio/Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center justify-center space-x-2">
                <FaMicrophone className="h-4 w-4" />
                <span>Micrófono</span>
              </Button>

              <Button variant="outline" className="flex items-center justify-center space-x-2">
                <FaVideo className="h-4 w-4" />
                <span>Cámara</span>
              </Button>

              <Button variant="outline" className="flex items-center justify-center space-x-2">
                <FaPause className="h-4 w-4" />
                <span>Pausa</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monitor de Calidad */}
        <Card>
          <CardHeader>
            <CardTitle>Monitor de Calidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Calidad de Video</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Calidad de Audio</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Conexión de Red</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminStreamingPage