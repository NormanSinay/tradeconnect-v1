import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaSave, FaUser, FaBuilding, FaCreditCard, FaCalendarAlt, FaCheck } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminRegistrationService } from '@/services/admin'
import type {
  UpdateRegistrationData,
  ParticipantType,
  RegistrationResponse,
} from '@/types/admin'

interface AdminRegistrationEditPageProps {
  registrationId: number
}

const AdminRegistrationEditPage: React.FC<AdminRegistrationEditPageProps> = ({ registrationId }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registration, setRegistration] = useState<any>(null)

  // Form data
  const [formData, setFormData] = useState<UpdateRegistrationData>({
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

  // Cargar datos de la inscripción
  useEffect(() => {
    loadRegistration()
  }, [registrationId])

  const loadRegistration = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminRegistrationService.getRegistrationById(registrationId)
      setRegistration(data)

      // Populate form data
      setFormData({
        firstName: (data as any).firstName || '',
        lastName: (data as any).lastName || '',
        email: (data as any).email || '',
        phone: (data as any).phone || '',
        nit: (data as any).nit || '',
        cui: (data as any).cui || '',
        companyName: (data as any).companyName || '',
        position: (data as any).position || '',
        customFields: (data as any).customFields || {},
      })
    } catch (err) {
      console.error('Error cargando inscripción:', err)
      setError('Error al cargar la inscripción')
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Validar formulario
  const validateForm = () => {
    if (!formData.firstName) return 'Ingresa el nombre'
    if (!formData.lastName) return 'Ingresa los apellidos'
    if (!formData.email) return 'Ingresa el email'
    return null
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
      setSaving(true)
      setError(null)
      setSuccess(null)

      await adminRegistrationService.updateRegistration(registrationId, formData)

      setSuccess('Inscripción actualizada exitosamente')

      // Reload data
      loadRegistration()
    } catch (err) {
      console.error('Error actualizando inscripción:', err)
      setError('Error al actualizar la inscripción')
    } finally {
      setSaving(false)
    }
  }

  // Obtener texto de tipo de participante
  const getParticipantTypeText = (type: string) => {
    const texts: Record<string, string> = {
      individual: 'Individual',
      empresa: 'Empresa',
    }
    return texts[type] || type
  }

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      BORRADOR: 'secondary',
      PENDIENTE_PAGO: 'outline',
      PAGADO: 'default',
      CONFIRMADO: 'default',
      CANCELADO: 'destructive',
      EXPIRADO: 'destructive',
      REEMBOLSADO: 'destructive',
    }
    return variants[status] || 'secondary'
  }

  // Obtener texto de estado
  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      BORRADOR: 'Borrador',
      PENDIENTE_PAGO: 'Pendiente de Pago',
      PAGADO: 'Pagado',
      CONFIRMADO: 'Confirmado',
      CANCELADO: 'Cancelado',
      EXPIRADO: 'Expirado',
      REEMBOLSADO: 'Reembolsado',
    }
    return texts[status] || status
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Inscripciones', href: '/admin/inscripciones' },
    { label: registration?.registrationCode || `Inscripción #${registrationId}`, href: `/admin/inscripciones/${registrationId}/detalle` },
    { label: 'Editar' },
  ]

  if (loading) {
    return (
      <AdminLayout title="Cargando..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error && !registration) {
    return (
      <AdminLayout title="Error" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <FaCheck className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                {error}
              </h3>
              <Button onClick={() => window.history.back()}>
                <FaArrowLeft className="mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Editar Inscripción ${registration?.registrationCode}`} breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <FaArrowLeft className="mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Editar Inscripción</h1>
              <p className="text-gray-600">{registration?.registrationCode}</p>
            </div>
          </div>
        </div>

        {/* Información actual */}
        <Card>
          <CardHeader>
            <CardTitle>Información Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <Badge variant={getStatusBadge(registration.status)}>
                  {getStatusText(registration.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tipo</p>
                <Badge variant="outline">{getParticipantTypeText(registration.participantType)}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monto</p>
                <p className="text-lg font-semibold">Q {registration.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del participante */}
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
                {registration.participantType === 'empresa' && (
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

          {/* Campos personalizados */}
          {registration.customFields && Object.keys(registration.customFields).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Campos Personalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(registration.customFields).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={`custom-${key}`}>{key}</Label>
                      <Input
                        id={`custom-${key}`}
                        value={formData.customFields?.[key] || ''}
                        onChange={(e) => handleInputChange('customFields', {
                          ...formData.customFields,
                          [key]: e.target.value
                        })}
                      />
                    </div>
                  ))}
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
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminRegistrationEditPage