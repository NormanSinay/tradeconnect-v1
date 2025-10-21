import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaExclamationTriangle, FaCopy } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminEventFormWizard from '@/components/admin/AdminEventFormWizard'
import { adminEventService } from '@/services/admin'
import type { DetailedEvent, DuplicateEventData } from '@/types/admin'

const AdminEventDuplicatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [originalEvent, setOriginalEvent] = useState<DetailedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)

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
      setOriginalEvent(eventData)
    } catch (err) {
      console.error('Error cargando evento:', err)
      setError('Error al cargar los datos del evento')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDuplicate = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      const duplicateData: DuplicateEventData = {
        sourceEventId: eventId,
        modifications: {
          title: `${originalEvent!.title} (Copia)`,
          eventStatusId: 1, // Draft status
        },
        keepRegistrations: false,
        keepMedia: true,
      }

      const duplicatedEvent = await adminEventService.duplicateEvent(eventId, duplicateData)
      navigate(`/admin/eventos/${duplicatedEvent.id}/editar`, {
        state: { message: 'Evento duplicado exitosamente' }
      })
    } catch (err) {
      console.error('Error duplicando evento:', err)
      setError('Error al duplicar el evento')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomDuplicate = () => {
    setShowWizard(true)
  }

  const handleWizardSave = (event: DetailedEvent) => {
    navigate(`/admin/eventos/${event.id}/editar`, {
      state: { message: 'Evento duplicado exitosamente' }
    })
  }

  const handleCancel = () => {
    navigate('/admin/eventos')
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: originalEvent?.title || 'Duplicar Evento', href: `/admin/eventos/${eventId}/duplicar` },
  ]

  if (loading && !originalEvent) {
    return (
      <AdminLayout title="Cargando..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !originalEvent) {
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

  if (showWizard) {
    return (
      <AdminLayout title={`Duplicar: ${originalEvent.title}`} breadcrumbs={breadcrumbs}>
        <AdminEventFormWizard
          onSave={handleWizardSave}
          onCancel={() => setShowWizard(false)}
          initialData={{
            title: `${originalEvent.title} (Copia)`,
            description: originalEvent.description,
            shortDescription: originalEvent.shortDescription,
            startDate: originalEvent.startDate,
            endDate: originalEvent.endDate,
            location: originalEvent.location,
            virtualLocation: originalEvent.virtualLocation,
            isVirtual: originalEvent.isVirtual,
            price: originalEvent.price,
            currency: originalEvent.currency,
            capacity: originalEvent.capacity,
            minAge: originalEvent.minAge,
            maxAge: originalEvent.maxAge,
            tags: originalEvent.tags,
            requirements: originalEvent.requirements,
            agenda: originalEvent.agenda,
            metadata: originalEvent.metadata,
            eventTypeId: originalEvent.eventType.id,
            eventCategoryId: originalEvent.eventCategory.id,
            eventStatusId: 1, // Draft status
          }}
        />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Duplicar: ${originalEvent.title}`} breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Información del evento original */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FaCopy className="h-5 w-5" />
              <span>Duplicar Evento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{originalEvent.title}</h3>
                <p className="text-gray-600">{originalEvent.shortDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span> {originalEvent.eventType.displayName}
                </div>
                <div>
                  <span className="font-medium">Categoría:</span> {originalEvent.eventCategory.displayName}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {new Date(originalEvent.startDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Precio:</span> {originalEvent.currency} {originalEvent.price.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Capacidad:</span> {originalEvent.capacity || 'Sin límite'}
                </div>
                <div>
                  <span className="font-medium">Inscritos:</span> {originalEvent.registeredCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opciones de duplicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleQuickDuplicate}>
            <CardHeader>
              <CardTitle className="text-lg">Duplicación Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Crea una copia exacta del evento con el título modificado automáticamente.
                El nuevo evento se guardará como borrador.
              </p>
              <Button onClick={handleQuickDuplicate} disabled={loading} className="w-full">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaCopy className="mr-2" />
                )}
                Duplicar Rápidamente
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCustomDuplicate}>
            <CardHeader>
              <CardTitle className="text-lg">Duplicación Personalizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Modifica cualquier aspecto del evento durante el proceso de duplicación.
                Ideal para crear variaciones del evento original.
              </p>
              <Button variant="outline" onClick={handleCustomDuplicate} className="w-full">
                <FaCopy className="mr-2" />
                Duplicar con Modificaciones
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Nota importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Las inscripciones no se copiarán al nuevo evento</li>
                  <li>Los archivos multimedia se copiarán automáticamente</li>
                  <li>El nuevo evento se creará como borrador</li>
                  <li>Podrás modificar cualquier configuración después de la duplicación</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminEventDuplicatePage