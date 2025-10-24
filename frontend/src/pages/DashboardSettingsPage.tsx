import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/ui/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useUserStore } from '@/stores/userStore'
import { FaBell, FaShieldAlt, FaLock, FaExclamationTriangle, FaCheckCircle, FaSave, FaKey, FaQrcode } from 'react-icons/fa'

type TabType = 'notifications' | 'security' | 'privacy'

const DashboardSettingsPage: React.FC = () => {
  const {
    preferences,
    fetchPreferences,
    updatePreferences,
    changePassword,
    enable2FA,
    disable2FA,
    verify2FA,
    isLoading,
    error
  } = useUserStore()

  const [activeTab, setActiveTab] = useState<TabType>('notifications')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [isSubmittingPreferences, setIsSubmittingPreferences] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const tabs = [
    { id: 'notifications' as TabType, label: 'Notificaciones', icon: FaBell },
    { id: 'security' as TabType, label: 'Seguridad', icon: FaShieldAlt },
    { id: 'privacy' as TabType, label: 'Privacidad', icon: FaLock },
  ]

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setIsSubmittingPassword(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      setIsSubmittingPassword(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres')
      setIsSubmittingPassword(false)
      return
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccessMessage('Contraseña cambiada exitosamente')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Error al cambiar la contraseña')
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  const handlePreferencesChange = async (newPreferences: any) => {
    setIsSubmittingPreferences(true)
    try {
      await updatePreferences(newPreferences)
      setSuccessMessage('Preferencias guardadas exitosamente')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      // Error ya manejado en el store
    } finally {
      setIsSubmittingPreferences(false)
    }
  }

  if (isLoading && !preferences) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <FaExclamationTriangle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error al cargar la configuración</p>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={fetchPreferences}
              className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-2 text-gray-600">Gestiona tus preferencias y configuraciones de seguridad</p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center"
          >
            <FaCheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-green-800">{successMessage}</span>
          </motion.div>
        )}

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#6B1E22] text-[#6B1E22]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Notifications Tab */}
            {activeTab === 'notifications' && preferences && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferencias de Notificación</h3>
                  <p className="text-gray-600 mb-6">
                    Selecciona cómo deseas recibir las notificaciones sobre tus eventos y cursos.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handlePreferencesChange(preferences)
                  }}
                  className="space-y-6"
                >
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Notificaciones por Email</h4>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="email-notifications"
                          checked={preferences.notifications.email}
                          onCheckedChange={(checked) =>
                            handlePreferencesChange({
                              ...preferences,
                              notifications: { ...preferences.notifications, email: checked as boolean }
                            })
                          }
                        />
                        <label htmlFor="email-notifications" className="text-sm text-gray-700">
                          Notificaciones por Email
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="event-reminders"
                          checked={preferences.notifications.eventReminders}
                          onCheckedChange={(checked) =>
                            handlePreferencesChange({
                              ...preferences,
                              notifications: { ...preferences.notifications, eventReminders: checked as boolean }
                            })
                          }
                        />
                        <label htmlFor="event-reminders" className="text-sm text-gray-700">
                          Recordatorios de eventos
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="course-updates"
                          checked={preferences.notifications.courseUpdates}
                          onCheckedChange={(checked) =>
                            handlePreferencesChange({
                              ...preferences,
                              notifications: { ...preferences.notifications, courseUpdates: checked as boolean }
                            })
                          }
                        />
                        <label htmlFor="course-updates" className="text-sm text-gray-700">
                          Actualizaciones de cursos
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="promotional"
                          checked={preferences.notifications.promotional}
                          onCheckedChange={(checked) =>
                            handlePreferencesChange({
                              ...preferences,
                              notifications: { ...preferences.notifications, promotional: checked as boolean }
                            })
                          }
                        />
                        <label htmlFor="promotional" className="text-sm text-gray-700">
                          Correos promocionales
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="newsletter"
                          checked={preferences.notifications.newsletter}
                          onCheckedChange={(checked) =>
                            handlePreferencesChange({
                              ...preferences,
                              notifications: { ...preferences.notifications, newsletter: checked as boolean }
                            })
                          }
                        />
                        <label htmlFor="newsletter" className="text-sm text-gray-700">
                          Boletín informativo
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={isSubmittingPreferences}
                      className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white disabled:opacity-50"
                    >
                      {isSubmittingPreferences ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2 h-4 w-4" />
                          Guardar Preferencias
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguridad de la Cuenta</h3>
                  <p className="text-gray-600 mb-6">
                    Gestiona la seguridad de tu cuenta y cambia tu contraseña.
                  </p>
                </div>

                {/* Change Password Form */}
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <FaKey className="h-4 w-4 mr-2" />
                      Cambiar Contraseña
                    </h4>

                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual
                      </label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Contraseña
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas y números
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>

                    {passwordError && (
                      <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                        {passwordError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmittingPassword}
                      className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white disabled:opacity-50"
                    >
                      {isSubmittingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Cambiando...
                        </>
                      ) : (
                        <>
                          <FaKey className="mr-2 h-4 w-4" />
                          Cambiar Contraseña
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Two-Factor Authentication */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Autenticación de Dos Factores</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Agrega una capa extra de seguridad a tu cuenta
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${
                        preferences?.security.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {preferences?.security.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (preferences?.security.twoFactorEnabled) {
                            // Deshabilitar 2FA
                            setTwoFactorCode('')
                            setShow2FASetup(true)
                          } else {
                            // Habilitar 2FA
                            try {
                              const result = await enable2FA()
                              setQrCode(result.qrCode)
                              setSecret(result.secret)
                              setShow2FASetup(true)
                            } catch (error) {
                              setPasswordError('Error al habilitar 2FA')
                            }
                          }
                        }}
                      >
                        {preferences?.security.twoFactorEnabled ? 'Deshabilitar' : 'Habilitar'}
                      </Button>
                    </div>
                  </div>

                  {/* 2FA Setup Modal */}
                  {show2FASetup && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center mb-4">
                        <FaQrcode className="h-5 w-5 text-[#6B1E22] mr-2" />
                        <h5 className="font-medium text-gray-900">
                          {preferences?.security.twoFactorEnabled ? 'Deshabilitar 2FA' : 'Configurar 2FA'}
                        </h5>
                      </div>

                      {!preferences?.security.twoFactorEnabled && qrCode && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-3">
                            Escanea este código QR con tu aplicación de autenticación:
                          </p>
                          <div className="bg-white p-4 rounded-lg inline-block">
                            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Código secreto: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <label htmlFor="two-factor-code" className="block text-sm font-medium text-gray-700">
                          {preferences?.security.twoFactorEnabled
                            ? 'Ingresa el código actual de tu app para confirmar:'
                            : 'Ingresa el código de 6 dígitos de tu app:'}
                        </label>
                        <Input
                          id="two-factor-code"
                          type="text"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full text-center text-lg tracking-widest"
                        />
                      </div>

                      <div className="flex space-x-3 mt-4">
                        <Button
                          onClick={async () => {
                            try {
                              if (preferences?.security.twoFactorEnabled) {
                                await disable2FA(twoFactorCode)
                                setSuccessMessage('2FA deshabilitado exitosamente')
                              } else {
                                await verify2FA(twoFactorCode)
                                setSuccessMessage('2FA habilitado exitosamente')
                              }
                              setShow2FASetup(false)
                              setTwoFactorCode('')
                              setQrCode('')
                              setSecret('')
                              setTimeout(() => setSuccessMessage(''), 5000)
                            } catch (error) {
                              setPasswordError(error instanceof Error ? error.message : 'Código inválido')
                            }
                          }}
                          disabled={twoFactorCode.length !== 6}
                          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
                        >
                          Confirmar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShow2FASetup(false)
                            setTwoFactorCode('')
                            setQrCode('')
                            setSecret('')
                            setPasswordError('')
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>

                      {passwordError && (
                        <div className="mt-3 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                          {passwordError}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && preferences && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración de Privacidad</h3>
                  <p className="text-gray-600 mb-6">
                    Controla cómo otros usuarios ven tu información en la plataforma.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handlePreferencesChange(preferences)
                  }}
                  className="space-y-6"
                >
                  {/* Profile Visibility */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Visibilidad del Perfil</h4>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="profile-public"
                          name="profileVisibility"
                          value="public"
                          checked={preferences.privacy.profileVisible}
                          onChange={() =>
                            handlePreferencesChange({
                              ...preferences,
                              privacy: { ...preferences.privacy, profileVisible: true }
                            })
                          }
                          className="h-4 w-4 text-[#6B1E22] focus:ring-[#6B1E22]"
                        />
                        <label htmlFor="profile-public" className="text-sm text-gray-700">
                          Perfil visible para otros usuarios
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="profile-private"
                          name="profileVisibility"
                          value="private"
                          checked={!preferences.privacy.profileVisible}
                          onChange={() =>
                            handlePreferencesChange({
                              ...preferences,
                              privacy: { ...preferences.privacy, profileVisible: false }
                            })
                          }
                          className="h-4 w-4 text-[#6B1E22] focus:ring-[#6B1E22]"
                        />
                        <label htmlFor="profile-private" className="text-sm text-gray-700">
                          Perfil privado
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Data Sharing */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Compartir Información</h4>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="show-email"
                          checked={preferences.privacy.showEmail}
                          onCheckedChange={(checked) =>
                            handlePreferencesChange({
                              ...preferences,
                              privacy: { ...preferences.privacy, showEmail: checked as boolean }
                            })
                          }
                        />
                        <label htmlFor="show-email" className="text-sm text-gray-700">
                          Mostrar email en perfil público
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="show-courses"
                          checked={preferences.privacy.showCourses}
                          onCheckedChange={(checked) =>
                            handlePreferencesChange({
                              ...preferences,
                              privacy: { ...preferences.privacy, showCourses: checked as boolean }
                            })
                          }
                        />
                        <label htmlFor="show-courses" className="text-sm text-gray-700">
                          Mostrar cursos completados
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="show-certificates"
                          checked={preferences.privacy.showCertificates}
                          onCheckedChange={(checked) =>
                            handlePreferencesChange({
                              ...preferences,
                              privacy: { ...preferences.privacy, showCertificates: checked as boolean }
                            })
                          }
                        />
                        <label htmlFor="show-certificates" className="text-sm text-gray-700">
                          Mostrar certificados obtenidos
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={isSubmittingPreferences}
                      className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white disabled:opacity-50"
                    >
                      {isSubmittingPreferences ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2 h-4 w-4" />
                          Guardar Configuración
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardSettingsPage