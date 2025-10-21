import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaSave, FaUser, FaBuilding, FaCreditCard, FaCalendarAlt, FaCheck } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { adminRegistrationService } from '@/services/admin'
import { adminEventService } from '@/services/admin'
import type {
  CreateIndividualRegistrationData,
  CreateGroupRegistrationData,
  ParticipantType,
  RegistrationResponse,
} from '@/types/admin'

const AdminRegistrationCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [participantType, setParticipantType] = useState<ParticipantType>('individual')
  const [isGroupRegistration, setIsGroupRegistration] = useState(false)

  // Form data
  const [formData, setFormData] = useState<CreateIndividualRegistrationData>({
    eventId: 0,
    participantType: 'individual',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nit: '',
    cui: '',
    companyName: '',
    position: '',
    customFields: {},
  })

  // Group registration data
  const [groupData, setGroupData] = useState<CreateGroupRegistrationData>({
    eventId: 0,
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    nit: '',
    participants: [],
    notes: '',
  })

  // Cargar eventos disponibles
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      // TODO: Load events from service
      setEvents([]) // Mock data
    } catch (error) {
      console.error('Error cargando eventos:', error)
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    if (isGroupRegistration) {
      setGroupData(prev => ({ ...prev, [field]: value }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Agregar participante al grupo
  const addGroupParticipant = () => {
    setGroupData(prev => ({
      ...prev,
      participants: [
        ...prev.participants,
        {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          nit: '',
          cui: '',
          position: '',
        }
      ]
    }))
  }

  // Actualizar participante del grupo
  const updateGroupParticipant = (index: number, field: string, value: any) => {
    setGroupData(prev => ({
      ...prev,
      participants: prev.participants.map((participant, i) =>
        i === index ? { ...participant, [field]: value } : participant
      )
    }))
  }

  // Remover participante del grupo
  const removeGroupParticipant = (index: number) => {
    setGroupData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }))
  }

  // Validar formulario
  const validateForm = () => {
    if (isGroupRegistration) {
      if (!groupData.eventId) return 'Selecciona un evento'
      if (!groupData.companyName) return 'Ingresa el nombre de la empresa'
      if (!groupData.contactEmail) return 'Ingresa el email de contacto'
      if (groupData.participants.length === 0) return 'Agrega al menos un participante'
      return null
    } else {
      if (!formData.eventId) return 'Selecciona un evento'
      if (!formData.firstName) return 'Ingresa el nombre'
      if (!formData.lastName) return 'Ingresa los apellidos'
      if (!formData.email) return 'Ingresa el email'
      return null
    }
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      let result: RegistrationResponse

      if (isGroupRegistration) {
        result = await adminRegistrationService.createGroupRegistration(
          groupData.eventId,
          groupData
        )
      } else {
        result = await adminRegistrationService.createIndividualRegistration(
          formData.eventId,
          formData
        )
      }

      setSuccess(`Inscripción creada exitosamente. Código: ${result.registrationCode}`)

      // Reset form
      if (isGroupRegistration) {
        setGroupData({
          eventId: 0,
          companyName: '',
          contactEmail: '',
          contactPhone: '',
          nit: '',
          participants: [],
          notes: '',
        })
      } else {
        setFormData({
          eventId: 0,
          participantType: 'individual',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          nit: '',
          cui: '',
          companyName: '',
          position: '',
          customFields: {},
        })
      }
    } catch (err) {
      console.error('Error creando inscripción:', err)
      setError('Error al crear la inscripción')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Inscripciones', href: '/admin/inscripciones' },
    { label: 'Crear Inscripción' },
  ]

  return (
    <AdminLayout title="Crear Inscripción" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <FaArrowLeft className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Crear Nueva Inscripción</h1>
              <p className="text-gray-600">Registra una nueva inscripción manualmente</p>
            </div>
          </div>
        </div>

        {/* Tipo de inscripción */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Inscripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Tipo de participante</Label>
                <RadioGroup
                  value={participantType}
                  onValueChange={(value) => {
                    setParticipantType(value as ParticipantType)
                    handleInputChange('participantType', value)
                  }}
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="empresa" id="empresa" />
                    <Label htmlFor="empresa">Empresa</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="group"
                  checked={isGroupRegistration}
                  onCheckedChange={(checked) => setIsGroupRegistration(checked as boolean)}
                />
                <Label htmlFor="group">Inscripción grupal (múltiples participantes)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del evento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                Información del Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventId">Evento *</Label>
                  <select
                    id="eventId"
                    value={isGroupRegistration ? groupData.eventId : formData.eventId}
                    onChange={(e) => handleInputChange('eventId', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value={0}>Selecciona un evento</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del participante */}
          {!isGroupRegistration ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaUser className="mr-2" />
                  Información del Participante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  {participantType === 'empresa' && (
                    <>
                      <div>
                        <Label htmlFor="companyName">Empresa</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName || ''}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="position">Cargo</Label>
                        <Input
                          id="position"
                          value={formData.position || ''}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label htmlFor="nit">NIT</Label>
                    <Input
                      id="nit"
                      value={formData.nit || ''}
                      onChange={(e) => handleInputChange('nit', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cui">CUI</Label>
                    <Input
                      id="cui"
                      value={formData.cui || ''}
                      onChange={(e) => handleInputChange('cui', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaBuilding className="mr-2" />
                  Información de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                    <Input
                      id="companyName"
                      value={groupData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email de Contacto *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={groupData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                    <Input
                      id="contactPhone"
                      value={groupData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="groupNit">NIT</Label>
                    <Input
                      id="groupNit"
                      value={groupData.nit || ''}
                      onChange={(e) => handleInputChange('nit', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participantes del grupo */}
          {isGroupRegistration && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Participantes del Grupo</span>
                  <Button type="button" onClick={addGroupParticipant}>
                    <FaUser className="mr-2" />
                    Agregar Participante
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupData.participants.map((participant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Participante {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeGroupParticipant(index)}
                        >
                          <FaCheck className="mr-2" />
                          Remover
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre *</Label>
                          <Input
                            value={participant.firstName}
                            onChange={(e) => updateGroupParticipant(index, 'firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Apellidos *</Label>
                          <Input
                            value={participant.lastName}
                            onChange={(e) => updateGroupParticipant(index, 'lastName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={participant.email}
                            onChange={(e) => updateGroupParticipant(index, 'email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label>Teléfono</Label>
                          <Input
                            value={participant.phone || ''}
                            onChange={(e) => updateGroupParticipant(index, 'phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Cargo</Label>
                          <Input
                            value={participant.position || ''}
                            onChange={(e) => updateGroupParticipant(index, 'position', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>NIT</Label>
                          <Input
                            value={participant.nit || ''}
                            onChange={(e) => updateGroupParticipant(index, 'nit', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>CUI</Label>
                          <Input
                            value={participant.cui || ''}
                            onChange={(e) => updateGroupParticipant(index, 'cui', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {groupData.participants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay participantes agregados. Haz clic en "Agregar Participante" para comenzar.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas adicionales */}
          {isGroupRegistration && (
            <Card>
              <CardHeader>
                <CardTitle>Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <textarea
                    id="notes"
                    value={groupData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Notas adicionales sobre la inscripción grupal..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensajes de error y éxito */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <p className="text-green-700">{success}</p>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Crear Inscripción
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminRegistrationCreatePage