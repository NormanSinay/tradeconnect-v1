import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaBell,
  FaShieldAlt,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSave,
  FaLock,
  FaKey,
  FaMobileAlt,
  FaEnvelope,
  FaGlobe
} from 'react-icons/fa'
import { useAuthStore } from '@/stores/authStore'
import { UserService, UserProfile } from '@/services/userService'
import DashboardSidebar from '@/components/ui/dashboard-sidebar'
import DashboardHeader from '@/components/ui/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface NotificationSettings {
  emailNotifications: boolean
  eventReminders: boolean
  courseUpdates: boolean
  promotionalEmails: boolean
  newsletter: boolean
}

const DashboardSettingsPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    eventReminders: true,
    courseUpdates: true,
    promotionalEmails: false,
    newsletter: true
  })

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showEmail: false,
    showCourses: true,
    showCertificates: true
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadSettingsData()
    }
  }, [isAuthenticated])

  const loadSettingsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const profile = await UserService.getProfile()
      setUserProfile(profile)

      // Load user preferences (mock data for now)
      // In a real implementation, this would come from an API endpoint
      setNotificationSettings({
        emailNotifications: true,
        eventReminders: true,
        courseUpdates: true,
        promotionalEmails: false,
        newsletter: true
      })

      setPrivacySettings({
        profileVisible: true,
        showEmail: false,
        showCourses: true,
        showCertificates: true
      })
    } catch (err) {
      console.error('Error loading settings data:', err)
      setError(err instanceof Error ? err.message : 'Error cargando configuración')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePrivacyChange = (field: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // TODO: Implement password change API call
      // await UserService.changePassword(passwordData)

      // Mock success
      setSuccess('Contraseña cambiada exitosamente')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error changing password:', err)
      setError(err instanceof Error ? err.message : 'Error cambiando contraseña')
    } finally {
      setSaving(false)
    }
  }

  const saveNotificationSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // TODO: Implement notification settings API call
      // await UserService.updateNotificationSettings(notificationSettings)

      // Mock success
      setSuccess('Preferencias de notificación guardadas')

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving notification settings:', err)
      setError(err instanceof Error ? err.message : 'Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  const savePrivacySettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // TODO: Implement privacy settings API call
      // await UserService.updatePrivacySettings(privacySettings)

      // Mock success
      setSuccess('Configuración de privacidad guardada')

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving privacy settings:', err)
      setError(err instanceof Error ? err.message : 'Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder al dashboard.</p>
          <Link to="/login">
            <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Cargando...</span>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22]"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {UserService.getFullName(userProfile)}</span>
              <Button
                onClick={logout}
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <DashboardHeader
              title="Configuración"
              subtitle="Gestiona tus preferencias y configuraciones de seguridad"
            />

            {/* Success/Error Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="border-red-200 bg-red-50">
                  <FaExclamationTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="border-green-200 bg-green-50">
                  <FaCheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Settings Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                  <TabsTrigger value="security">Seguridad</TabsTrigger>
                  <TabsTrigger value="privacy">Privacidad</TabsTrigger>
                </TabsList>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="mt-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaBell className="text-[#6B1E22] text-xl" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Preferencias de Notificación</h3>
                        <p className="text-sm text-gray-600">Selecciona cómo deseas recibir las notificaciones</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Notificaciones por Email</label>
                          <p className="text-sm text-gray-600">Recibe notificaciones generales por correo electrónico</p>
                        </div>
                        <Checkbox
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked as boolean)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Recordatorios de Eventos</label>
                          <p className="text-sm text-gray-600">Recibe recordatorios antes de tus eventos inscritos</p>
                        </div>
                        <Checkbox
                          checked={notificationSettings.eventReminders}
                          onCheckedChange={(checked) => handleNotificationChange('eventReminders', checked as boolean)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Actualizaciones de Cursos</label>
                          <p className="text-sm text-gray-600">Notificaciones sobre progreso y actualizaciones de cursos</p>
                        </div>
                        <Checkbox
                          checked={notificationSettings.courseUpdates}
                          onCheckedChange={(checked) => handleNotificationChange('courseUpdates', checked as boolean)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Correos Promocionales</label>
                          <p className="text-sm text-gray-600">Ofertas especiales y promociones de TradeConnect</p>
                        </div>
                        <Checkbox
                          checked={notificationSettings.promotionalEmails}
                          onCheckedChange={(checked) => handleNotificationChange('promotionalEmails', checked as boolean)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Boletín Informativo</label>
                          <p className="text-sm text-gray-600">Newsletter semanal con noticias y actualizaciones</p>
                        </div>
                        <Checkbox
                          checked={notificationSettings.newsletter}
                          onCheckedChange={(checked) => handleNotificationChange('newsletter', checked as boolean)}
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button
                        onClick={saveNotificationSettings}
                        disabled={saving}
                        className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" />
                            Guardar Preferencias
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="mt-6">
                  <div className="space-y-6">
                    {/* Password Change */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <FaKey className="text-[#6B1E22] text-xl" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
                          <p className="text-sm text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña Actual
                          </label>
                          <Input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            placeholder="Ingresa tu contraseña actual"
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                          </label>
                          <Input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            placeholder="Ingresa tu nueva contraseña"
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas y números
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nueva Contraseña
                          </label>
                          <Input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            placeholder="Confirma tu nueva contraseña"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button
                          onClick={changePassword}
                          disabled={saving}
                          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Cambiando...
                            </>
                          ) : (
                            <>
                              <FaLock className="mr-2" />
                              Cambiar Contraseña
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <FaShieldAlt className="text-[#6B1E22] text-xl" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Autenticación de Dos Factores</h3>
                          <p className="text-sm text-gray-600">Añade una capa extra de seguridad a tu cuenta</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">2FA por Aplicación</label>
                          <p className="text-sm text-gray-600">Usa una app como Google Authenticator</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">No habilitado</span>
                          <Button variant="outline" size="sm">
                            Habilitar
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-4">
                        <div>
                          <label className="font-medium text-gray-900">2FA por SMS</label>
                          <p className="text-sm text-gray-600">Recibe códigos por mensaje de texto</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">No habilitado</span>
                          <Button variant="outline" size="sm">
                            Habilitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Privacy Tab */}
                <TabsContent value="privacy" className="mt-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaEye className="text-[#6B1E22] text-xl" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Configuración de Privacidad</h3>
                        <p className="text-sm text-gray-600">Controla cómo otros usuarios ven tu información</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Perfil Visible</label>
                          <p className="text-sm text-gray-600">Permitir que otros usuarios vean tu perfil</p>
                        </div>
                        <Checkbox
                          checked={privacySettings.profileVisible}
                          onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked as boolean)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Mostrar Email</label>
                          <p className="text-sm text-gray-600">Mostrar tu dirección de email en el perfil público</p>
                        </div>
                        <Checkbox
                          checked={privacySettings.showEmail}
                          onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked as boolean)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Mostrar Cursos Completados</label>
                          <p className="text-sm text-gray-600">Mostrar los cursos que has completado</p>
                        </div>
                        <Checkbox
                          checked={privacySettings.showCourses}
                          onCheckedChange={(checked) => handlePrivacyChange('showCourses', checked as boolean)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="font-medium text-gray-900">Mostrar Certificados</label>
                          <p className="text-sm text-gray-600">Mostrar los certificados obtenidos</p>
                        </div>
                        <Checkbox
                          checked={privacySettings.showCertificates}
                          onCheckedChange={(checked) => handlePrivacyChange('showCertificates', checked as boolean)}
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button
                        onClick={savePrivacySettings}
                        disabled={saving}
                        className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" />
                            Guardar Configuración
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSettingsPage