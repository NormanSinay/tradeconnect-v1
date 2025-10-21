import React, { useState, useEffect } from 'react'
import { FaShieldAlt, FaSave, FaTimes, FaLock, FaKey, FaUserShield, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminSystemService } from '@/services/admin'
import type { SystemConfig } from '@/types/admin'

const AdminSecurityConfigPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('password')

  // Cargar configuración actual
  const loadConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const configData = await adminSystemService.getSystemConfig()
      setConfig(configData)
    } catch (err: any) {
      console.error('Error cargando configuración:', err)
      setError('Error al cargar la configuración de seguridad')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuración de seguridad
  const handleSaveSecurityConfig = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      await adminSystemService.updateSystemConfig(config)

      setSuccess('Configuración de seguridad guardada exitosamente')

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error guardando configuración de seguridad:', err)
      setError(err.message || 'Error al guardar la configuración de seguridad')
    } finally {
      setIsSaving(false)
    }
  }

  // Actualizar configuración de seguridad
  const updateSecurityConfig = (field: string, value: any) => {
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      security: {
        ...prev!.security,
        [field]: value,
      },
    }))
  }

  // Actualizar configuración anidada de seguridad
  const updateNestedSecurityConfig = (section: string, field: string, value: any) => {
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      security: {
        ...prev!.security,
        [section]: {
          ...(prev!.security as any)[section],
          [field]: value,
        },
      },
    }))
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Configuración', href: '/admin/configuracion' },
    { label: 'Seguridad' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Configuración de Seguridad" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!config) {
    return (
      <AdminLayout title="Configuración de Seguridad" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaTimes className="h-5 w-5 text-red-500" />
              <span className="text-red-700">Error al cargar la configuración</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Configuración de Seguridad" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
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
                <FaSave className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuración por pestañas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaShieldAlt className="h-5 w-5" />
              Políticas de Seguridad del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="password">Contraseñas</TabsTrigger>
                <TabsTrigger value="authentication">Autenticación</TabsTrigger>
                <TabsTrigger value="sessions">Sesiones</TabsTrigger>
                <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
              </TabsList>

              {/* Configuración de Contraseñas */}
              <TabsContent value="password" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaKey className="h-4 w-4" />
                      Política de Contraseñas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="minLength">Longitud Mínima de Contraseña</Label>
                      <Input
                        id="minLength"
                        type="number"
                        min="6"
                        max="32"
                        value={config.security.passwordPolicy.minLength}
                        onChange={(e) => updateNestedSecurityConfig('passwordPolicy', 'minLength', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Número mínimo de caracteres requeridos
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="requireUppercase">Requiere Mayúscula</Label>
                          <p className="text-xs text-gray-500">Al menos una letra mayúscula (A-Z)</p>
                        </div>
                        <Switch
                          id="requireUppercase"
                          checked={config.security.passwordPolicy.requireUppercase}
                          onCheckedChange={(checked) => updateNestedSecurityConfig('passwordPolicy', 'requireUppercase', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="requireLowercase">Requiere Minúscula</Label>
                          <p className="text-xs text-gray-500">Al menos una letra minúscula (a-z)</p>
                        </div>
                        <Switch
                          id="requireLowercase"
                          checked={config.security.passwordPolicy.requireLowercase}
                          onCheckedChange={(checked) => updateNestedSecurityConfig('passwordPolicy', 'requireLowercase', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="requireNumbers">Requiere Números</Label>
                          <p className="text-xs text-gray-500">Al menos un dígito (0-9)</p>
                        </div>
                        <Switch
                          id="requireNumbers"
                          checked={config.security.passwordPolicy.requireNumbers}
                          onCheckedChange={(checked) => updateNestedSecurityConfig('passwordPolicy', 'requireNumbers', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="requireSymbols">Requiere Símbolos</Label>
                          <p className="text-xs text-gray-500">Al menos un carácter especial (!@#$%^&*)</p>
                        </div>
                        <Switch
                          id="requireSymbols"
                          checked={config.security.passwordPolicy.requireSymbols}
                          onCheckedChange={(checked) => updateNestedSecurityConfig('passwordPolicy', 'requireSymbols', checked)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Vista Previa de Requisitos</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Longitud mínima: {config.security.passwordPolicy.minLength} caracteres</li>
                        {config.security.passwordPolicy.requireUppercase && <li>• Al menos una letra mayúscula</li>}
                        {config.security.passwordPolicy.requireLowercase && <li>• Al menos una letra minúscula</li>}
                        {config.security.passwordPolicy.requireNumbers && <li>• Al menos un número</li>}
                        {config.security.passwordPolicy.requireSymbols && <li>• Al menos un símbolo especial</li>}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configuración de Autenticación */}
              <TabsContent value="authentication" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaUserShield className="h-4 w-4" />
                      Autenticación de Dos Factores (2FA)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorEnabled">2FA Habilitado</Label>
                        <p className="text-xs text-gray-500">Permitir autenticación de dos factores en el sistema</p>
                      </div>
                      <Switch
                        id="twoFactorEnabled"
                        checked={config.security.twoFactor.enabled}
                        onCheckedChange={(checked) => updateNestedSecurityConfig('twoFactor', 'enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorRequired">2FA Requerido</Label>
                        <p className="text-xs text-gray-500">Obligatorio para todos los usuarios del sistema</p>
                      </div>
                      <Switch
                        id="twoFactorRequired"
                        checked={config.security.twoFactor.required}
                        onCheckedChange={(checked) => updateNestedSecurityConfig('twoFactor', 'required', checked)}
                      />
                    </div>

                    <div>
                      <Label>Métodos de 2FA Disponibles</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          { key: 'app', label: 'Aplicación Authenticator' },
                          { key: 'sms', label: 'SMS' },
                          { key: 'email', label: 'Email' },
                        ].map((method) => (
                          <div key={method.key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`method-${method.key}`}
                              checked={config.security.twoFactor.methods.includes(method.key as any)}
                              onChange={(e) => {
                                const methods = e.target.checked
                                  ? [...config.security.twoFactor.methods, method.key as any]
                                  : config.security.twoFactor.methods.filter(m => m !== method.key)
                                updateNestedSecurityConfig('twoFactor', 'methods', methods)
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`method-${method.key}`}>{method.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configuración de Login</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="maxLoginAttempts">Máximo de Intentos de Login</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        min="3"
                        max="10"
                        value="5"
                        // TODO: Agregar campo a la configuración
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Número máximo de intentos antes de bloquear la cuenta
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="lockoutDuration">Duración del Bloqueo (minutos)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        min="5"
                        max="1440"
                        value="30"
                        // TODO: Agregar campo a la configuración
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tiempo que la cuenta permanece bloqueada después de múltiples intentos fallidos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configuración de Sesiones */}
              <TabsContent value="sessions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaClock className="h-4 w-4" />
                      Gestión de Sesiones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Tiempo de Expiración de Sesión (minutos)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="15"
                        max="480"
                        value={config.security.sessionTimeout}
                        onChange={(e) => updateSecurityConfig('sessionTimeout', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tiempo de inactividad antes de cerrar automáticamente la sesión
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="rememberMe">Permitir "Recordarme"</Label>
                        <p className="text-xs text-gray-500">Opción para mantener la sesión activa por más tiempo</p>
                      </div>
                      <Switch
                        id="rememberMe"
                        checked={true} // TODO: Agregar campo a la configuración
                        onCheckedChange={() => {}}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="singleSession">Sesión Única por Usuario</Label>
                        <p className="text-xs text-gray-500">Cerrar otras sesiones al iniciar una nueva</p>
                      </div>
                      <Switch
                        id="singleSession"
                        checked={false} // TODO: Agregar campo a la configuración
                        onCheckedChange={() => {}}
                      />
                    </div>

                    <div>
                      <Label htmlFor="concurrentSessions">Sesiones Concurrentes Máximas</Label>
                      <Select defaultValue="5">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 sesión</SelectItem>
                          <SelectItem value="3">3 sesiones</SelectItem>
                          <SelectItem value="5">5 sesiones</SelectItem>
                          <SelectItem value="10">10 sesiones</SelectItem>
                          <SelectItem value="unlimited">Ilimitadas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rate Limiting */}
              <TabsContent value="rate-limiting" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaExclamationTriangle className="h-4 w-4" />
                      Rate Limiting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="rateLimitingEnabled">Rate Limiting Habilitado</Label>
                        <p className="text-xs text-gray-500">Limitar el número de solicitudes por usuario</p>
                      </div>
                      <Switch
                        id="rateLimitingEnabled"
                        checked={config.security.rateLimiting.enabled}
                        onCheckedChange={(checked) => updateNestedSecurityConfig('rateLimiting', 'enabled', checked)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="windowMs">Ventana de Tiempo (ms)</Label>
                        <Input
                          id="windowMs"
                          type="number"
                          min="60000"
                          max="3600000"
                          value={config.security.rateLimiting.windowMs}
                          onChange={(e) => updateNestedSecurityConfig('rateLimiting', 'windowMs', parseInt(e.target.value))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Período de tiempo para contar solicitudes (ej: 900000 = 15 min)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="maxRequests">Máximo de Solicitudes</Label>
                        <Input
                          id="maxRequests"
                          type="number"
                          min="10"
                          max="1000"
                          value={config.security.rateLimiting.maxRequests}
                          onChange={(e) => updateNestedSecurityConfig('rateLimiting', 'maxRequests', parseInt(e.target.value))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Número máximo de solicitudes en la ventana de tiempo
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Configuración Actual</h4>
                      <p className="text-sm text-yellow-700">
                        Máximo {config.security.rateLimiting.maxRequests} solicitudes por {Math.round(config.security.rateLimiting.windowMs / 60000)} minutos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Información de Seguridad */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Consideraciones de Seguridad Importantes
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Los cambios en políticas de contraseñas afectan a todos los usuarios existentes</li>
                  <li>• Requerir 2FA puede afectar la experiencia de usuario</li>
                  <li>• Un timeout de sesión muy corto puede causar frustración</li>
                  <li>• Rate limiting muy restrictivo puede bloquear usuarios legítimos</li>
                  <li>• Se recomienda probar los cambios en un entorno de desarrollo primero</li>
                  <li>• Mantenga un registro de cambios de configuración de seguridad</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => loadConfig()}
            disabled={isSaving}
          >
            <FaTimes className="h-4 w-4 mr-2" />
            Cancelar Cambios
          </Button>
          <Button
            onClick={handleSaveSecurityConfig}
            disabled={isSaving}
          >
            <FaSave className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSecurityConfigPage