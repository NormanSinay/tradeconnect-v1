import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaMobileAlt, FaKey, FaCheckCircle, FaTimesCircle, FaQrcode, FaCopy, FaDownload } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

// Password change validation schema
const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

// 2FA setup validation schema
const twoFactorSchema = z.object({
  code: z
    .string()
    .min(6, 'El código debe tener 6 dígitos')
    .max(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo números'),
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
type TwoFactorFormData = z.infer<typeof twoFactorSchema>

interface SecuritySettings {
  twoFactorEnabled: boolean
  lastPasswordChange: string
  loginAttempts: number
  accountLocked: boolean
  backupCodes: string[]
  trustedDevices: Array<{
    id: string
    name: string
    lastUsed: string
    location: string
  }>
}

export const UserSecurityPage: React.FC = () => {
  const { user } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isLoading2FA, setIsLoading2FA] = useState(false)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    lastPasswordChange: '2024-01-15T10:30:00Z',
    loginAttempts: 0,
    accountLocked: false,
    backupCodes: [],
    trustedDevices: [
      {
        id: '1',
        name: 'Chrome en Windows',
        lastUsed: '2024-01-20T09:15:00Z',
        location: 'Ciudad de Guatemala, Guatemala'
      }
    ]
  })
  const [twoFactorSetup, setTwoFactorSetup] = useState<{
    qrCode: string
    secret: string
    backupCodes: string[]
  } | null>(null)

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  })

  useEffect(() => {
    fetchSecuritySettings()
  }, [])

  const fetchSecuritySettings = async () => {
    try {
      // In a real app, you would call your API
      // const response = await api.get('/user/security-settings')

      // Mock data is already set in state
      console.log('Security settings loaded')
    } catch (error) {
      console.error('Error fetching security settings:', error)
    }
  }

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      setIsLoadingPassword(true)

      // In a real app, you would call your API
      // const response = await api.post('/user/change-password', data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      showToast.success('Contraseña cambiada exitosamente')
      passwordForm.reset()
      setSecuritySettings(prev => ({
        ...prev,
        lastPasswordChange: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Change password error:', error)
      showToast.error('Error al cambiar la contraseña. Inténtalo de nuevo.')
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const handleEnable2FA = async () => {
    try {
      setIsLoading2FA(true)

      // In a real app, you would call your API to generate 2FA setup
      // const response = await api.post('/user/enable-2fa')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock 2FA setup data
      setTwoFactorSetup({
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABlNJREFUeJzt3X9sVfX9x/H3',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: [
          '12345678', '87654321', '11223344', '44332211',
          '55667788', '88776655', '99887766', '66778899'
        ]
      })
    } catch (error) {
      console.error('Enable 2FA error:', error)
      showToast.error('Error al configurar 2FA. Inténtalo de nuevo.')
    } finally {
      setIsLoading2FA(false)
    }
  }

  const onVerify2FA = async (data: TwoFactorFormData) => {
    try {
      setIsLoading2FA(true)

      // In a real app, you would call your API to verify and enable 2FA
      // const response = await api.post('/user/verify-2fa', {
      //   code: data.code,
      //   secret: twoFactorSetup?.secret
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      showToast.success('Autenticación de dos factores activada exitosamente')
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: true,
        backupCodes: twoFactorSetup?.backupCodes || []
      }))
      setTwoFactorSetup(null)
      twoFactorForm.reset()
    } catch (error) {
      console.error('Verify 2FA error:', error)
      showToast.error('Código incorrecto. Inténtalo de nuevo.')
    } finally {
      setIsLoading2FA(false)
    }
  }

  const handleDisable2FA = async () => {
    try {
      setIsLoading2FA(true)

      // In a real app, you would call your API
      // const response = await api.post('/user/disable-2fa')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      showToast.success('Autenticación de dos factores desactivada')
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: false,
        backupCodes: []
      }))
    } catch (error) {
      console.error('Disable 2FA error:', error)
      showToast.error('Error al desactivar 2FA. Inténtalo de nuevo.')
    } finally {
      setIsLoading2FA(false)
    }
  }

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      // In a real app, you would call your API
      // const response = await api.delete(`/user/devices/${deviceId}`)

      setSecuritySettings(prev => ({
        ...prev,
        trustedDevices: prev.trustedDevices.filter(d => d.id !== deviceId)
      }))

      showToast.success('Dispositivo revocado exitosamente')
    } catch (error) {
      console.error('Revoke device error:', error)
      showToast.error('Error al revocar el dispositivo')
    }
  }

  const downloadBackupCodes = () => {
    const codes = securitySettings.backupCodes.join('\n')
    const blob = new Blob([codes], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast.success('Copiado al portapapeles')
  }

  const passwordRequirements = [
    { text: 'Al menos 8 caracteres', met: passwordForm.watch('newPassword')?.length >= 8 },
    { text: 'Una letra minúscula', met: /[a-z]/.test(passwordForm.watch('newPassword') || '') },
    { text: 'Una letra mayúscula', met: /[A-Z]/.test(passwordForm.watch('newPassword') || '') },
    { text: 'Un número', met: /\d/.test(passwordForm.watch('newPassword') || '') },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Seguridad</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu contraseña, autenticación de dos factores y dispositivos de confianza
          </p>
        </div>

        <Tabs defaultValue="password" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="password">Contraseña</TabsTrigger>
            <TabsTrigger value="twofactor">2FA</TabsTrigger>
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaLock className="mr-2 h-5 w-5" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription>
                  Actualiza tu contraseña regularmente para mantener tu cuenta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña Actual</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="Tu contraseña actual"
                                {...field}
                                disabled={isLoadingPassword}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                disabled={isLoadingPassword}
                              >
                                {showCurrentPassword ? (
                                  <FaEyeSlash className="h-4 w-4" />
                                ) : (
                                  <FaEye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Tu nueva contraseña"
                                {...field}
                                disabled={isLoadingPassword}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                disabled={isLoadingPassword}
                              >
                                {showNewPassword ? (
                                  <FaEyeSlash className="h-4 w-4" />
                                ) : (
                                  <FaEye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Requirements */}
                    {passwordForm.watch('newPassword') && (
                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <FaCheckCircle
                              className={`mr-2 h-3 w-3 ${
                                req.met ? 'text-green-500' : 'text-gray-300'
                              }`}
                            />
                            <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirma tu nueva contraseña"
                                {...field}
                                disabled={isLoadingPassword}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoadingPassword}
                              >
                                {showConfirmPassword ? (
                                  <FaEyeSlash className="h-4 w-4" />
                                ) : (
                                  <FaEye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoadingPassword}
                      className="w-full"
                    >
                      {isLoadingPassword ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <FaShieldAlt className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Último cambio de contraseña</h4>
                      <p className="text-sm text-blue-800">
                        {new Date(securitySettings.lastPasswordChange).toLocaleDateString('es-GT', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2FA Tab */}
          <TabsContent value="twofactor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaMobileAlt className="mr-2 h-5 w-5" />
                  Autenticación de Dos Factores (2FA)
                </CardTitle>
                <CardDescription>
                  Añade una capa extra de seguridad a tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 2FA Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    {securitySettings.twoFactorEnabled ? (
                      <FaCheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    ) : (
                      <FaTimesCircle className="h-6 w-6 text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {securitySettings.twoFactorEnabled ? '2FA Activado' : '2FA Desactivado'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {securitySettings.twoFactorEnabled
                          ? 'Tu cuenta está protegida con autenticación de dos factores'
                          : 'Activa 2FA para mayor seguridad'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge className={securitySettings.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {securitySettings.twoFactorEnabled ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                {/* 2FA Setup */}
                {!securitySettings.twoFactorEnabled && !twoFactorSetup && (
                  <div className="text-center">
                    <Button onClick={handleEnable2FA} disabled={isLoading2FA}>
                      {isLoading2FA ? 'Configurando...' : 'Activar 2FA'}
                    </Button>
                  </div>
                )}

                {/* 2FA Setup Form */}
                {twoFactorSetup && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-4">Configurar Autenticación 2FA</h3>
                      <p className="text-gray-600 mb-6">
                        Escanea el código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)
                      </p>

                      <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-6">
                        <img
                          src={twoFactorSetup.qrCode}
                          alt="QR Code para 2FA"
                          className="w-48 h-48"
                        />
                      </div>

                      <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-600 mb-2">O ingresa manualmente:</p>
                        <div className="flex items-center justify-center space-x-2">
                          <code className="bg-white px-3 py-1 rounded font-mono text-sm">
                            {twoFactorSetup.secret}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(twoFactorSetup.secret)}
                          >
                            <FaCopy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Form {...twoFactorForm}>
                        <form onSubmit={twoFactorForm.handleSubmit(onVerify2FA)} className="max-w-xs mx-auto">
                          <FormField
                            control={twoFactorForm.control}
                            name="code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Código de verificación</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    {...field}
                                    disabled={isLoading2FA}
                                    className="text-center text-2xl tracking-widest"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={isLoading2FA}
                            className="w-full mt-4"
                          >
                            {isLoading2FA ? 'Verificando...' : 'Verificar y Activar'}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </div>
                )}

                {/* Backup Codes */}
                {securitySettings.twoFactorEnabled && securitySettings.backupCodes.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4 flex items-center">
                      <FaKey className="mr-2 h-4 w-4" />
                      Códigos de respaldo
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Guarda estos códigos en un lugar seguro. Los puedes usar si pierdes acceso a tu aplicación de autenticación.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                      {securitySettings.backupCodes.map((code, index) => (
                        <div key={index} className="bg-gray-100 p-2 rounded text-center font-mono text-sm">
                          {code}
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                        <FaDownload className="mr-2 h-4 w-4" />
                        Descargar códigos
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(securitySettings.backupCodes.join('\n'))}>
                        <FaCopy className="mr-2 h-4 w-4" />
                        Copiar todos
                      </Button>
                    </div>
                  </div>
                )}

                {/* Disable 2FA */}
                {securitySettings.twoFactorEnabled && (
                  <div className="border-t pt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Desactivar 2FA</h4>
                      <p className="text-sm text-yellow-800 mb-4">
                        Al desactivar 2FA, tu cuenta tendrá menos protección. Solo haz esto si es estrictamente necesario.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisable2FA}
                        disabled={isLoading2FA}
                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                      >
                        {isLoading2FA ? 'Desactivando...' : 'Desactivar 2FA'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos de Confianza</CardTitle>
                <CardDescription>
                  Gestiona los dispositivos que tienen acceso a tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securitySettings.trustedDevices.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">
                    No hay dispositivos registrados
                  </p>
                ) : (
                  <div className="space-y-4">
                    {securitySettings.trustedDevices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FaMobileAlt className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-semibold">{device.name}</p>
                            <p className="text-sm text-gray-600">
                              Último uso: {new Date(device.lastUsed).toLocaleDateString('es-GT')}
                            </p>
                            <p className="text-sm text-gray-600">{device.location}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeDevice(device.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Revocar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Actividad de Seguridad</CardTitle>
                <CardDescription>
                  Monitorea la actividad reciente de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaLock className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold">Contraseña cambiada</p>
                        <p className="text-sm text-gray-600">
                          {new Date(securitySettings.lastPasswordChange).toLocaleDateString('es-GT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Exitosa</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaShieldAlt className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-semibold">Inicio de sesión exitoso</p>
                        <p className="text-sm text-gray-600">
                          Chrome en Windows • Ciudad de Guatemala, Guatemala
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Actual</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaTimesCircle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-semibold">Intento de inicio de sesión fallido</p>
                        <p className="text-sm text-gray-600">
                          IP desconocida • Antigua Guatemala, Guatemala
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Bloqueado</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <FaShieldAlt className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Estado de la cuenta</h4>
                      <p className="text-sm text-blue-800">
                        Tu cuenta está segura. {securitySettings.loginAttempts === 0 ? 'No hay intentos fallidos recientes.' : `${securitySettings.loginAttempts} intentos fallidos en las últimas 24 horas.`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}