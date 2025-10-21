import React, { useState, useEffect } from 'react'
import { FaUser, FaSave, FaTrash, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface AccountSettings {
  profile: {
    firstName: string
    lastName: string
    displayName: string
    bio: string
    website: string
    location: string
    timezone: string
    language: string
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showPhone: boolean
    allowMessages: boolean
    dataSharing: boolean
  }
  notifications: {
    emailMarketing: boolean
    smsMarketing: boolean
    pushMarketing: boolean
  }
}

export const UserAccountSettingsPage: React.FC = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AccountSettings>({
    profile: {
      firstName: '',
      lastName: '',
      displayName: '',
      bio: '',
      website: '',
      location: '',
      timezone: 'America/Guatemala',
      language: 'es'
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      dataSharing: false
    },
    notifications: {
      emailMarketing: false,
      smsMarketing: false,
      pushMarketing: false
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    fetchAccountSettings()
  }, [])

  const fetchAccountSettings = async () => {
    try {
      // In a real app, you would call your API
      // const response = await api.get('/user/account-settings')

      // Mock settings data
      const mockSettings: AccountSettings = {
        profile: {
          firstName: 'Juan',
          lastName: 'Pérez',
          displayName: 'Juan Pérez',
          bio: 'Profesional apasionado por el aprendizaje continuo y el desarrollo personal.',
          website: 'https://juanperez.com',
          location: 'Guatemala City, Guatemala',
          timezone: 'America/Guatemala',
          language: 'es'
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
          allowMessages: true,
          dataSharing: false
        },
        notifications: {
          emailMarketing: false,
          smsMarketing: false,
          pushMarketing: false
        }
      }

      setSettings(mockSettings)
    } catch (error) {
      console.error('Error fetching account settings:', error)
      showToast.error('Error al cargar la configuración de cuenta')
    }
  }

  const updateSetting = (section: keyof AccountSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const saveSettings = async () => {
    try {
      setIsLoading(true)

      // In a real app, you would call your API
      // const response = await api.put('/user/account-settings', settings)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      showToast.success('Configuración de cuenta guardada exitosamente')
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast.error('Error al guardar la configuración')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async () => {
    try {
      setIsLoading(true)

      // In a real app, you would call your API
      // const response = await api.delete('/user/account')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      showToast.success('Cuenta eliminada exitosamente')
      // Redirect to logout or home page
    } catch (error) {
      console.error('Error deleting account:', error)
      showToast.error('Error al eliminar la cuenta')
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const timezones = [
    { value: 'America/Guatemala', label: 'America/Guatemala (GMT-6)' },
    { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
    { value: 'America/Chicago', label: 'America/Chicago (GMT-6)' },
    { value: 'America/Denver', label: 'America/Denver (GMT-7)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
    { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (GMT+1)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10)' }
  ]

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
    { value: 'fr', label: 'Français' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Cuenta</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu perfil, privacidad y preferencias de cuenta
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FaUser className="mr-2 h-5 w-5" />
                  Información del Perfil
                </span>
                {hasUnsavedChanges && (
                  <span className="text-sm text-yellow-600 font-medium">
                    Cambios sin guardar
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal y cómo te ven otros usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={settings.profile.firstName}
                    onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={settings.profile.lastName}
                    onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="displayName">Nombre para mostrar</Label>
                <Input
                  id="displayName"
                  value={settings.profile.displayName}
                  onChange={(e) => updateSetting('profile', 'displayName', e.target.value)}
                  placeholder="Cómo quieres que te vean otros"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="website">Sitio web</Label>
                  <Input
                    id="website"
                    value={settings.profile.website}
                    onChange={(e) => updateSetting('profile', 'website', e.target.value)}
                    placeholder="https://tusitio.com"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={settings.profile.location}
                    onChange={(e) => updateSetting('profile', 'location', e.target.value)}
                    placeholder="Ciudad, País"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select
                    value={settings.profile.timezone}
                    onValueChange={(value) => updateSetting('profile', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.profile.language}
                    onValueChange={(value) => updateSetting('profile', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
              <CardDescription>
                Controla qué información es visible para otros usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="profileVisibility">Visibilidad del perfil</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value: 'public' | 'private' | 'friends') =>
                    updateSetting('privacy', 'profileVisibility', value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona visibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público - Visible para todos</SelectItem>
                    <SelectItem value="friends">Solo amigos - Visible para conexiones</SelectItem>
                    <SelectItem value="private">Privado - Solo tú puedes ver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showEmail">Mostrar email</Label>
                    <p className="text-sm text-gray-600">Permitir que otros vean tu dirección de email</p>
                  </div>
                  <Switch
                    id="showEmail"
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(checked) => updateSetting('privacy', 'showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showPhone">Mostrar teléfono</Label>
                    <p className="text-sm text-gray-600">Permitir que otros vean tu número de teléfono</p>
                  </div>
                  <Switch
                    id="showPhone"
                    checked={settings.privacy.showPhone}
                    onCheckedChange={(checked) => updateSetting('privacy', 'showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowMessages">Permitir mensajes</Label>
                    <p className="text-sm text-gray-600">Permitir que otros usuarios te envíen mensajes</p>
                  </div>
                  <Switch
                    id="allowMessages"
                    checked={settings.privacy.allowMessages}
                    onCheckedChange={(checked) => updateSetting('privacy', 'allowMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataSharing">Compartir datos</Label>
                    <p className="text-sm text-gray-600">Permitir compartir datos anónimos para mejorar el servicio</p>
                  </div>
                  <Switch
                    id="dataSharing"
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => updateSetting('privacy', 'dataSharing', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketing Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Marketing</CardTitle>
              <CardDescription>
                Elige cómo quieres recibir comunicaciones promocionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailMarketing">Email promocional</Label>
                  <p className="text-sm text-gray-600">Recibir ofertas y novedades por email</p>
                </div>
                <Switch
                  id="emailMarketing"
                  checked={settings.notifications.emailMarketing}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailMarketing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsMarketing">SMS promocional</Label>
                  <p className="text-sm text-gray-600">Recibir ofertas y novedades por SMS</p>
                </div>
                <Switch
                  id="smsMarketing"
                  checked={settings.notifications.smsMarketing}
                  onCheckedChange={(checked) => updateSetting('notifications', 'smsMarketing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushMarketing">Notificaciones push</Label>
                  <p className="text-sm text-gray-600">Recibir ofertas y novedades en la app</p>
                </div>
                <Switch
                  id="pushMarketing"
                  checked={settings.notifications.pushMarketing}
                  onCheckedChange={(checked) => updateSetting('notifications', 'pushMarketing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {hasUnsavedChanges && (
            <div className="flex justify-end">
              <Button onClick={saveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-2 h-5 w-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription>
                Acciones irreversibles que afectan tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <FaTrash className="mr-2 h-4 w-4" />
                    Eliminar Cuenta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-600">¿Estás seguro?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. Se eliminarán permanentemente tu cuenta
                      y todos los datos asociados.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={deleteAccount}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Eliminando...
                        </>
                      ) : (
                        'Eliminar Cuenta'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}