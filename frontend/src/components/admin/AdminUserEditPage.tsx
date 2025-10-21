import React, { useState, useEffect } from 'react'
import { FaUserEdit, FaSave, FaTimes, FaUser } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminSystemService } from '@/services/admin'
import { useNavigate, useParams } from 'react-router-dom'
import type { UserProfile, UserUpdateData } from '@/types/admin'

const AdminUserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<UserUpdateData>({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
    nit: '',
    cui: '',
    timezone: 'America/Guatemala',
    locale: 'es',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserUpdateData, string>>>({})

  // Cargar datos del usuario
  const loadUser = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)

      const userData = await adminSystemService.getUserProfile(parseInt(id))
      setUser(userData)

      // Establecer valores iniciales del formulario
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
        avatar: userData.avatar || '',
        nit: userData.nit || '',
        cui: userData.cui || '',
        timezone: userData.timezone,
        locale: userData.locale,
      })
    } catch (err: any) {
      console.error('Error cargando usuario:', err)
      setError('Error al cargar los datos del usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (data: UserUpdateData): Partial<Record<keyof UserUpdateData, string>> => {
    const errors: Partial<Record<keyof UserUpdateData, string>> = {}

    if (!data.firstName) {
      errors.firstName = 'El nombre es requerido'
    }

    if (!data.lastName) {
      errors.lastName = 'El apellido es requerido'
    }

    if (data.phone && !/^\+?[\d\s-()]+$/.test(data.phone)) {
      errors.phone = 'El formato del teléfono no es válido'
    }

    if (data.nit && !/^\d{4}-\d{6}-\d{3}-\d{1}$/.test(data.nit)) {
      errors.nit = 'El formato del NIT no es válido (XXXX-XXXXXX-XXX-X)'
    }

    if (data.cui && !/^\d{13}$/.test(data.cui)) {
      errors.cui = 'El CUI debe tener 13 dígitos'
    }

    return errors
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    const errors = validateForm(formData)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      await adminSystemService.updateUser(parseInt(id), formData)

      setSuccess('Usuario actualizado exitosamente')

      // Recargar datos del usuario
      await loadUser()

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error actualizando usuario:', err)
      setError(err.message || 'Error al actualizar el usuario')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  useEffect(() => {
    loadUser()
  }, [id])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Usuarios', href: '/admin/usuarios' },
    { label: 'Editar Usuario' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Editar Usuario" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout title="Editar Usuario" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaTimes className="h-5 w-5 text-red-500" />
              <span className="text-red-700">Usuario no encontrado</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Editar Usuario: ${user.firstName} ${user.lastName}`} breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Mensajes de estado */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTimes className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaUserEdit className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaUser className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">ID:</span>
                <span className="ml-2 font-mono">{user.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2">{user.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Estado:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email Verificado:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  user.isEmailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.isEmailVerified ? 'Sí' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">2FA:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  user.is2FAEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.is2FAEnabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Última Conexión:</span>
                <span className="ml-2">
                  {user.lastLoginAt
                    ? new Intl.DateTimeFormat('es-GT', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(user.lastLoginAt))
                    : 'Nunca'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de edición */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaUserEdit className="h-5 w-5" />
              Editar Información
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={formErrors.firstName ? 'border-red-500' : ''}
                    placeholder="Ingrese el nombre"
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={formErrors.lastName ? 'border-red-500' : ''}
                    placeholder="Ingrese el apellido"
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Información de contacto */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={formErrors.phone ? 'border-red-500' : ''}
                  placeholder="+502 1234 5678"
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Información guatemalteca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nit" className="text-sm font-medium">
                    NIT
                  </Label>
                  <Input
                    id="nit"
                    name="nit"
                    type="text"
                    value={formData.nit}
                    onChange={(e) => handleInputChange('nit', e.target.value)}
                    className={formErrors.nit ? 'border-red-500' : ''}
                    placeholder="1234-567890-123-4"
                  />
                  {formErrors.nit && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.nit}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cui" className="text-sm font-medium">
                    CUI
                  </Label>
                  <Input
                    id="cui"
                    name="cui"
                    type="text"
                    value={formData.cui}
                    onChange={(e) => handleInputChange('cui', e.target.value)}
                    className={formErrors.cui ? 'border-red-500' : ''}
                    placeholder="1234567890123"
                  />
                  {formErrors.cui && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.cui}</p>
                  )}
                </div>
              </div>

              {/* Configuración regional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Zona Horaria
                  </Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Guatemala">America/Guatemala (GMT-6)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (GMT-8)</SelectItem>
                      <SelectItem value="Europe/Madrid">Europe/Madrid (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="locale" className="text-sm font-medium">
                    Idioma
                  </Label>
                  <Select
                    value={formData.locale}
                    onValueChange={(value) => handleInputChange('locale', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <Label htmlFor="avatar" className="text-sm font-medium">
                  URL del Avatar
                </Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange('avatar', e.target.value)}
                  placeholder="https://ejemplo.com/avatar.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL de la imagen de perfil del usuario
                </p>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/usuarios')}
                  disabled={isSaving}
                >
                  <FaTimes className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/admin/usuarios/${id}/roles`)}
                  disabled={isSaving}
                >
                  Gestionar Roles
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  <FaSave className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminUserEditPage