import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaArrowRight, FaSave, FaCheck } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { adminEventService } from '@/services/admin'
import type {
  CreateEventData,
  UpdateEventData,
  DetailedEvent,
  EventTypeInfo,
  EventCategoryInfo,
  EventValidationResult,
} from '@/types/admin'

interface AdminEventFormWizardProps {
  eventId?: number
  onSave: (event: DetailedEvent) => void
  onCancel: () => void
  initialData?: Partial<CreateEventData>
}

interface WizardStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<StepProps>
  validation?: (data: Partial<CreateEventData>) => boolean
}

interface StepProps {
  data: Partial<CreateEventData>
  onChange: (data: Partial<CreateEventData>) => void
  errors: Record<string, string>
  eventTypes: EventTypeInfo[]
  eventCategories: EventCategoryInfo[]
}

const AdminEventFormWizard: React.FC<AdminEventFormWizardProps> = ({
  eventId,
  onSave,
  onCancel,
  initialData = {},
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<CreateEventData>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [eventTypes, setEventTypes] = useState<EventTypeInfo[]>([])
  const [eventCategories, setEventCategories] = useState<EventCategoryInfo[]>([])

  // Cargar metadatos
  useEffect(() => {
    loadMetadata()
    if (eventId) {
      loadEventData()
    }
    return
  }, [eventId])

  const loadMetadata = async () => {
    try {
      const [types, categories] = await Promise.all([
        adminEventService.getEventTypes(),
        adminEventService.getEventCategories(),
      ])
      setEventTypes(types)
      setEventCategories(categories)
    } catch (err) {
      console.error('Error cargando metadatos:', err)
    }
  }

  const loadEventData = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      const event = await adminEventService.getEventById(eventId)
      setFormData({
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
      })
    } catch (err) {
      console.error('Error cargando datos del evento:', err)
    } finally {
      setLoading(false)
    }
  }

  // Definir pasos del wizard
  const steps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Información Básica',
      description: 'Título, descripción y tipo de evento',
      component: BasicInfoStep,
      validation: (data) => !!data.title && !!data.eventTypeId && !!data.eventCategoryId,
    },
    {
      id: 'dates',
      title: 'Fechas y Ubicación',
      description: 'Fechas, horarios y lugar del evento',
      component: DatesLocationStep,
      validation: (data) => !!data.startDate && !!data.endDate,
    },
    {
      id: 'pricing',
      title: 'Precios y Capacidad',
      description: 'Configuración de precios y límites',
      component: PricingCapacityStep,
      validation: (data) => data.price !== undefined && data.price >= 0,
    },
    {
      id: 'details',
      title: 'Detalles Adicionales',
      description: 'Agenda, requisitos y metadatos',
      component: DetailsStep,
    },
    {
      id: 'review',
      title: 'Revisar y Publicar',
      description: 'Verificar toda la información',
      component: ReviewStep,
    },
  ]

  const handleDataChange = (newData: Partial<CreateEventData>) => {
    setFormData(prev => ({ ...prev, ...newData }))
    // Limpiar errores del campo modificado
    const fieldErrors = Object.keys(newData).reduce((acc, key) => {
      if (errors[key]) {
        const { [key]: _, ...rest } = errors
        return rest
      }
      return acc
    }, errors)
    setErrors(fieldErrors)
  }

  const validateCurrentStep = (): boolean => {
    const step = steps[currentStep]
    if (!step || !step.validation) return true

    return step.validation(formData)
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      // Mostrar errores de validación
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validar todos los datos
      const validation = await adminEventService.validateEventData(formData as CreateEventData)
      if (!validation.isValid) {
        const fieldErrors: Record<string, string> = {}
        validation.errors.forEach(error => {
          fieldErrors[error.field] = error.message
        })
        setErrors(fieldErrors)
        return
      }

      let savedEvent: DetailedEvent
      if (eventId) {
        savedEvent = await adminEventService.updateEvent(eventId, formData as UpdateEventData)
      } else {
        savedEvent = await adminEventService.createEvent(formData as CreateEventData)
      }

      onSave(savedEvent)
    } catch (err) {
      console.error('Error guardando evento:', err)
      setErrors({ general: 'Error al guardar el evento' })
    } finally {
      setSaving(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100
  const currentStepData = steps[currentStep]
  const StepComponent = currentStepData?.component || (() => <div>Error: Componente no encontrado</div>)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {eventId ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </h2>
          <p className="text-gray-600">Complete los pasos para configurar su evento</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% completado
            </span>
          </div>
          <Progress value={progress} className="mb-4" />

          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  index <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStep ? <FaCheck className="w-3 h-3" /> : index + 1}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData?.title || 'Paso'}</CardTitle>
          <p className="text-gray-600">{currentStepData?.description || 'Descripción del paso'}</p>
        </CardHeader>
        <CardContent>
          {StepComponent && (
            <StepComponent
              data={formData}
              onChange={handleDataChange}
              errors={errors}
              eventTypes={eventTypes}
              eventCategories={eventCategories}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <FaArrowLeft className="mr-2" />
          Anterior
        </Button>

        <div className="flex items-center space-x-2">
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FaSave className="mr-2" />
              )}
              {eventId ? 'Actualizar Evento' : 'Crear Evento'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!validateCurrentStep()}>
              Siguiente
              <FaArrowRight className="ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{errors.general}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componentes de pasos del wizard

const BasicInfoStep: React.FC<StepProps> = ({ data, onChange, errors, eventTypes, eventCategories }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Título del Evento *</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Ingrese el título del evento"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descripción Corta</label>
        <input
          type="text"
          value={data.shortDescription || ''}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Breve descripción del evento"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descripción Completa</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Descripción detallada del evento"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Evento *</label>
          <select
            value={data.eventTypeId || ''}
            onChange={(e) => onChange({ eventTypeId: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Seleccionar tipo</option>
            {eventTypes.map(type => (
              <option key={type.id} value={type.id}>{type.displayName}</option>
            ))}
          </select>
          {errors.eventTypeId && <p className="text-red-500 text-sm mt-1">{errors.eventTypeId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Categoría *</label>
          <select
            value={data.eventCategoryId || ''}
            onChange={(e) => onChange({ eventCategoryId: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Seleccionar categoría</option>
            {eventCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.displayName}</option>
            ))}
          </select>
          {errors.eventCategoryId && <p className="text-red-500 text-sm mt-1">{errors.eventCategoryId}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Etiquetas</label>
        <input
          type="text"
          value={data.tags?.join(', ') || ''}
          onChange={(e) => onChange({ tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Etiquetas separadas por comas"
        />
      </div>
    </div>
  )
}

const DatesLocationStep: React.FC<StepProps> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Fecha de Inicio *</label>
          <input
            type="datetime-local"
            value={data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange({ startDate: new Date(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fecha de Fin *</label>
          <input
            type="datetime-local"
            value={data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange({ endDate: new Date(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={data.isVirtual || false}
            onChange={(e) => onChange({ isVirtual: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium">Evento Virtual</span>
        </label>
      </div>

      {!data.isVirtual ? (
        <div>
          <label className="block text-sm font-medium mb-2">Ubicación Física</label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => onChange({ location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Dirección del evento"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2">Enlace Virtual</label>
          <input
            type="url"
            value={data.virtualLocation || ''}
            onChange={(e) => onChange({ virtualLocation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://zoom.us/..."
          />
        </div>
      )}
    </div>
  )
}

const PricingCapacityStep: React.FC<StepProps> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Precio *</label>
          <div className="flex">
            <select
              value={data.currency || 'GTQ'}
              onChange={(e) => onChange({ currency: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="GTQ">Q</option>
              <option value="USD">$</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              value={data.price || 0}
              onChange={(e) => onChange({ price: Number(e.target.value) })}
              className="flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Capacidad Máxima</label>
          <input
            type="number"
            min="1"
            value={data.capacity || ''}
            onChange={(e) => onChange({ capacity: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Sin límite"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Edad Mínima</label>
          <input
            type="number"
            min="0"
            value={data.minAge || ''}
            onChange={(e) => onChange({ minAge: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Sin restricción"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Edad Máxima</label>
          <input
            type="number"
            min="0"
            value={data.maxAge || ''}
            onChange={(e) => onChange({ maxAge: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Sin restricción"
          />
        </div>
      </div>
    </div>
  )
}

const DetailsStep: React.FC<StepProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Requisitos</label>
        <textarea
          value={data.requirements || ''}
          onChange={(e) => onChange({ requirements: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Requisitos para participar en el evento"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Agenda</label>
        <textarea
          value={JSON.stringify(data.agenda || [], null, 2)}
          onChange={(e) => {
            try {
              const agenda = JSON.parse(e.target.value)
              onChange({ agenda })
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          placeholder='[{"title": "Sesión 1", "startTime": "09:00", "endTime": "10:30"}]'
        />
        <p className="text-xs text-gray-500 mt-1">Formato JSON para la agenda del evento</p>
      </div>
    </div>
  )
}

const ReviewStep: React.FC<StepProps> = ({ data, eventTypes, eventCategories }) => {
  const eventType = eventTypes.find(t => t.id === data.eventTypeId)
  const eventCategory = eventCategories.find(c => c.id === data.eventCategoryId)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Título:</span> {data.title}
            </div>
            <div>
              <span className="font-medium">Tipo:</span> {eventType?.displayName}
            </div>
            <div>
              <span className="font-medium">Categoría:</span> {eventCategory?.displayName}
            </div>
            <div>
              <span className="font-medium">Descripción:</span> {data.shortDescription}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fechas y Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Inicio:</span> {data.startDate ? new Date(data.startDate).toLocaleString() : 'No definido'}
            </div>
            <div>
              <span className="font-medium">Fin:</span> {data.endDate ? new Date(data.endDate).toLocaleString() : 'No definido'}
            </div>
            <div>
              <span className="font-medium">Tipo:</span> {data.isVirtual ? 'Virtual' : 'Presencial'}
            </div>
            <div>
              <span className="font-medium">Ubicación:</span> {data.isVirtual ? data.virtualLocation : data.location}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Precios y Capacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Precio:</span> {data.currency} {data.price?.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Capacidad:</span> {data.capacity || 'Sin límite'}
            </div>
            <div>
              <span className="font-medium">Edad:</span> {data.minAge || 0} - {data.maxAge || 'Sin límite'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Borrador</Badge>
            <p className="text-sm text-gray-600 mt-2">
              El evento se guardará como borrador. Podrá publicarlo después desde la página de gestión.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminEventFormWizard