import React, { useState } from 'react'
import { FaUserPlus, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { adminSystemService } from '@/services/admin'
import { useNavigate } from 'react-router-dom'
import type { UserCreateData, UserRole } from '@/types/admin'

const AdminUserCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState<UserCreateData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: undefined,
  })

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserCreateData, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name as keyof UserCreateData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const setFieldValue = (field: keyof UserCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const errors: Partial<Record<keyof UserCreateData, string>> = {}

    if (!formData.email) {
      errors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido'
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (!formData.firstName) {
      errors.firstName = 'El nombre es requerido'
    }

    if (!formData.lastName) {
      errors.lastName = 'El apellido es requerido'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    await handleCreateUser(formData)
  }

  async function handleCreateUser(data: UserCreateData) {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      await adminSystemService.createUser(data)

      setSuccess('Usuario creado exitosamente')

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin/usuarios')
      }, 2000)
    } catch (err: any) {
      console.error('Error creando usuario:', err)
      setError(err.message || 'Error al crear el usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Usuarios', href: '/admin/usuarios' },
    { label: 'Crear Usuario' },
  ]

  return (
    <AdminLayout title="Crear Nuevo Usuario" breadcrumbs={breadcrumbs}>
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
                <FaUserPlus className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaUserPlus className="h-5 w-5" />
              Información del Nuevo Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className={formErrors.lastName ? 'border-red-500' : ''}
                    placeholder="Ingrese el apellido"
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'border-red-500' : ''}
                  placeholder="usuario@ejemplo.com"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  El email será usado para iniciar sesión y notificaciones
                </p>
              </div>

              {/* Contraseña */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={formErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4 text-gray-400" />
                    ) : (
                      <FaEye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                )}
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>La contraseña debe contener:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Al menos 8 caracteres</li>
                    <li>Una letra mayúscula</li>
                    <li>Una letra minúscula</li>
                    <li>Un número</li>
                    <li>Un carácter especial</li>
                  </ul>
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="+502 1234 5678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opcional, usado para notificaciones SMS y recuperación de cuenta
                </p>
              </div>

              {/* Rol inicial */}
              <div>
                <Label htmlFor="role" className="text-sm font-medium">
                  Rol Inicial
                </Label>
                <Select
                  value={formData.role || ''}
                  onValueChange={(value) => setFieldValue('role', value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                    <SelectItem value="support">Soporte</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="organizer">Organizador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="super_admin">Super Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Puede cambiar los roles después de crear el usuario desde la gestión de roles
                </p>
              </div>

              {/* Información adicional */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Información Importante
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• El usuario recibirá un email de bienvenida con sus credenciales</li>
                    <li>• Se recomienda cambiar la contraseña en el primer inicio de sesión</li>
                    <li>• Los roles pueden ser modificados posteriormente</li>
                    <li>• El usuario estará activo inmediatamente después de la creación</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Acciones */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/usuarios')}
                  disabled={isLoading}
                >
                  <FaTimes className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  <FaSave className="h-4 w-4 mr-2" />
                  {isLoading ? 'Creando...' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminUserCreatePage