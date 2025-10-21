import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlay, FaPause, FaStop, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaUsers, FaEye } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { adminEventService } from '@/services/admin'
import type { DetailedEvent, PublishEventData, EventStats } from '@/types/admin'

const AdminEventPublishPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<DetailedEvent | null>(null)
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Configuración de publicación
  const [publishConfig, setPublishConfig] = useState<PublishEventData>({
    notifySubscribers: true,
    notificationMessage: '',
  })

  const eventId = id ? parseInt(id, 10) : null

  useEffect(() => {
    if (eventId) {
      loadEvent()
      loadStats()
    }
  }, [eventId])

  const loadEvent = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      const eventData = await adminEventService.getEventById(eventId)
      setEvent(eventData)
    } catch (err) {
      console.error('Error cargando evento:', err)
      setError('Error al cargar los datos del evento')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!eventId) return

    try {
      const statsData = await adminEventService.getEventStats(eventId)
      setStats(statsData)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handlePublish = async () => {
    if (!event) return

    try {
      setPublishing(true)
      setError(null)
      setSuccess(null)

      await adminEventService.publishEvent(eventId!, publishConfig)

      setSuccess('Evento publicado exitosamente')
      await loadEvent() // Recargar datos
    } catch (err) {
      console.error('Error publicando evento:', err)
      setError('Error al publicar el evento')
    } finally {
      setPublishing(false)
    }
  }

  const handleCancel = async () => {
    if (!event || !confirm('¿Estás seguro de que deseas cancelar este evento?')) return

    try {
      setPublishing(true)
      setError(null)
      setSuccess(null)

      const reason = prompt('Razón de cancelación:')
      if (!reason) return

      await adminEventService.cancelEvent(eventId!, reason)

      setSuccess('Evento cancelado exitosamente')
      await loadEvent()
    } catch (err) {
      console.error('Error cancelando evento:', err)
      setError('Error al cancelar el evento')
    } finally {
      setPublishing(false)
    }
  }

  const handlePause = async () => {
    if (!event) return

    try {
      setPublishing(true)
      setError(null)
      setSuccess(null)

      const reason = prompt('Razón de pausa:')
      if (!reason) return

      await adminEventService.pauseEvent(eventId!, reason)

      setSuccess('Evento pausado exitosamente')
      await loadEvent()
    } catch (err) {
      console.error('Error pausando evento:', err)
      setError('Error al pausar el evento')
    } finally {
      setPublishing(false)
    }
  }

  const handleResume = async () => {
    if (!event) return

    try {
      setPublishing(true)
      setError(null)
      setSuccess(null)

      await adminEventService.resumeEvent(eventId!)

      setSuccess('Evento reanudado exitosamente')
      await loadEvent()
    } catch (err) {
      console.error('Error reanudando evento:', err)
      setError('Error al reanudar el evento')
    } finally {
      setPublishing(false)
    }
  }

  const getStatusActions = () => {
    if (!event) return null

    switch (event.eventStatus.name) {
      case 'draft':
        return (
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaPlay className="mr-2" />
            )}
            Publicar Evento
          </Button>
        )

      case 'published':
        return (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePause} disabled={publishing}>
              <FaPause className="mr-2" />
              Pausar
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={publishing}>
              <FaStop className="mr-2" />
              Cancelar
            </Button>
          </div>
        )

      case 'paused':
        return (
          <div className="flex space-x-2">
            <Button onClick={handleResume} disabled={publishing}>
              <FaPlay className="mr-2" />
              Reanudar
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={publishing}>
              <FaStop className="mr-2" />
              Cancelar
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const getStatusInfo = () => {
    if (!event) return null

    const statusConfig = {
      draft: {
        icon: <FaInfoCircle className="h-5 w-5 text-blue-500" />,
        title: 'Evento en Borrador',
        description: 'El evento no es visible para los usuarios. Puedes editarlo y publicarlo cuando esté listo.',
        color: 'blue',
      },
      published: {
        icon: <FaCheckCircle className="h-5 w-5 text-green-500" />,
        title: 'Evento Publicado',
        description: 'El evento está activo y visible para los usuarios. Los usuarios pueden inscribirse.',
        color: 'green',
      },
      paused: {
        icon: <FaPause className="h-5 w-5 text-yellow-500" />,
        title: 'Evento Pausado',
        description: 'El evento está temporalmente suspendido. Los usuarios no pueden inscribirse.',
        color: 'yellow',
      },
      cancelled: {
        icon: <FaStop className="h-5 w-5 text-red-500" />,
        title: 'Evento Cancelado',
        description: 'El evento ha sido cancelado. No se permiten nuevas inscripciones.',
        color: 'red',
      },
      completed: {
        icon: <FaCheckCircle className="h-5 w-5 text-gray-500" />,
        title: 'Evento Completado',
        description: 'El evento ha finalizado. Esta es una vista histórica.',
        color: 'gray',
      },
    }

    const config = statusConfig[event.eventStatus.name as keyof typeof statusConfig] || statusConfig.draft

    return (
      <Card className={`border-${config.color}-200 bg-${config.color}-50`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            {config.icon}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{config.title}</h3>
              <p className="text-gray-600 mt-1">{config.description}</p>
              {event.publishedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Publicado el {new Date(event.publishedAt).toLocaleString()}
                </p>
              )}
              {event.cancelledAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Cancelado el {new Date(event.cancelledAt).toLocaleString()}
                  {event.cancellationReason && (
                    <span className="block text-red-600">Razón: {event.cancellationReason}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: event?.title || 'Publicar', href: `/admin/eventos/${eventId}/publicar` },
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
    <AdminLayout title={`Publicar: ${event.title}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Publicación del Evento</h1>
            <p className="text-gray-600">Gestiona el estado de publicación de {event.title}</p>
          </div>
          {getStatusActions()}
        </div>

        {/* Estado actual */}
        {getStatusInfo()}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaUsers className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalRegistrations || 0}</p>
                  <p className="text-sm text-gray-600">Inscripciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.confirmedRegistrations || 0}</p>
                  <p className="text-sm text-gray-600">Confirmadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaEye className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{Math.round((stats?.capacityUtilization || 0) * 100)}%</p>
                  <p className="text-sm text-gray-600">Ocupación</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{event.currency} {stats?.revenue?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-600">Ingresos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuración de publicación (solo para draft) */}
        {event.eventStatus.name === 'draft' && (
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifySubscribers"
                  checked={publishConfig.notifySubscribers}
                  onCheckedChange={(checked) => setPublishConfig(prev => ({
                    ...prev,
                    notifySubscribers: checked
                  }))}
                />
                <Label htmlFor="notifySubscribers">
                  Notificar a suscriptores sobre el nuevo evento
                </Label>
              </div>

              <div>
                <Label htmlFor="notificationMessage">Mensaje de notificación personalizado</Label>
                <Textarea
                  id="notificationMessage"
                  value={publishConfig.notificationMessage}
                  onChange={(e) => setPublishConfig(prev => ({
                    ...prev,
                    notificationMessage: e.target.value
                  }))}
                  placeholder="Mensaje opcional para incluir en las notificaciones..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist de publicación */}
        {event.eventStatus.name === 'draft' && (
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Publicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Título del evento', checked: !!event.title },
                  { label: 'Descripción completa', checked: !!event.description },
                  { label: 'Fecha y hora de inicio', checked: !!event.startDate },
                  { label: 'Fecha y hora de fin', checked: !!event.endDate },
                  { label: 'Ubicación definida', checked: !!(event.location || event.virtualLocation) },
                  { label: 'Precio configurado', checked: event.price > 0 },
                  { label: 'Capacidad definida', checked: !!event.capacity },
                  { label: 'Tipo de evento seleccionado', checked: !!event.eventType },
                  { label: 'Categoría seleccionada', checked: !!event.eventCategory },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {item.checked ? (
                      <FaCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={item.checked ? 'text-gray-900' : 'text-gray-600'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensajes de éxito/error */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

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

export default AdminEventPublishPage