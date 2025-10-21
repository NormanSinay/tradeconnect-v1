import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaExclamationTriangle } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import AdminEventFormWizard from '@/components/admin/AdminEventFormWizard'
import { adminEventService } from '@/services/admin'
import type { DetailedEvent } from '@/types/admin'

const AdminEventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<DetailedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const eventId = id ? parseInt(id, 10) : null

  useEffect(() => {
    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const loadEvent = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      setError(null)
      const eventData = await adminEventService.getEventById(eventId)
      setEvent(eventData)
    } catch (err) {
      console.error('Error cargando evento:', err)
      setError('Error al cargar los datos del evento')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (updatedEvent: DetailedEvent) => {
    // Mostrar mensaje de éxito y recargar datos
    setEvent(updatedEvent)
    // TODO: Mostrar notificación de éxito
  }

  const handleCancel = () => {
    navigate('/admin/eventos')
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: event?.title || 'Editar Evento', href: `/admin/eventos/${eventId}/editar` },
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

  if (error || !event) {
    return (
      <AdminLayout title="Error" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">
                {error || 'No se pudo cargar el evento'}
              </span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Editar: ${event.title}`} breadcrumbs={breadcrumbs}>
      <AdminEventFormWizard
        eventId={eventId!}
        onSave={handleSave}
        onCancel={handleCancel}
        initialData={{
          title: event.title,
          description: event.description,
          shortDescription: event.shortDescription,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          virtualLocation: event.virtualLocation,
          isVirtual: event.isVirtual,
          price: event.price,
          currency: event.currency,
          capacity: event.capacity,
          minAge: event.minAge,
          maxAge: event.maxAge,
          tags: event.tags,
          requirements: event.requirements,
          agenda: event.agenda,
          metadata: event.metadata,
          eventTypeId: event.eventTypeId,
          eventCategoryId: event.eventCategoryId,
          eventStatusId: event.eventStatusId,
        }}
      />
    </AdminLayout>
  )
}

export default AdminEventEditPage