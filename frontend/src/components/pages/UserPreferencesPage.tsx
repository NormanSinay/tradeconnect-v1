import React, { useState, useEffect } from 'react'
import { FaPalette, FaMoon, FaSun, FaDesktop, FaBell, FaShieldAlt, FaGlobe, FaSave } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface UserPreferences {
  appearance: {
    theme: 'light' | 'dark' | 'system'
    fontSize: number
    compactMode: boolean
    animations: boolean
  }
  notifications: {
    soundEnabled: boolean
    vibrationEnabled: boolean
    quietHours: {
      enabled: boolean
      start: string
      end: string
    }
  }
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    screenReader: boolean
    keyboardNavigation: boolean
  }
  regional: {
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
    timeFormat: '12h' | '24h'
    currency: 'GTQ' | 'USD' | 'EUR'
    numberFormat: 'es-GT' | 'en-US' | 'de-DE'
  }
}

export const UserPreferencesPage: React.FC = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>({
    appearance: {
      theme: 'system',
      fontSize: 16,
      compactMode: false,
      animations: true
    },
    notifications: {
      soundEnabled: true,
      vibrationEnabled: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true
    },
    regional: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'GTQ',
      numberFormat: 'es-GT'
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    fetchUserPreferences()
  }, [])

  const fetchUserPreferences = async () => {
    try {
      // In a real app, you would call your API
      // const response = await api.get('/user/preferences')

      // Mock preferences data
      const mockPreferences: UserPreferences = {
        appearance: {
          theme: 'system',
          fontSize: 16,
          compactMode: false,
          animations: true
        },
        notifications: {
          soundEnabled: true,
          vibrationEnabled: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          }
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          screenReader: false,
          keyboardNavigation: true
        },
        regional: {
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          currency: 'GTQ',
          numberFormat: 'es-GT'
        }
      }

      setPreferences(mockPreferences)
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      showToast.error('Error al cargar las preferencias')
    }
  }

  const updatePreference = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], [key]: value }
        : value
    }))
    setHasUnsavedChanges(true)
  }

  const updateNestedPreference = (section: keyof UserPreferences, nestedKey: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...(prev[section] as any)[nestedKey],
          [key]: value
        }
      }
    }))
    setHasUnsavedChanges(true)
  }

  const savePreferences = async () => {
    try {
      setIsLoading(true)

      // In a real app, you would call your API
      // const response = await api.put('/user/preferences', preferences)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      showToast.success('Preferencias guardadas exitosamente')
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving preferences:', error)
      showToast.error('Error al guardar las preferencias')
    } finally {
      setIsLoading(false)
    }
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <FaSun className="h-4 w-4 text-yellow-500" />
      case 'dark':
        return <FaMoon className="h-4 w-4 text-blue-500" />
      case 'system':
        return <FaDesktop className="h-4 w-4 text-gray-500" />
      default:
        return <FaSun className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preferencias del Usuario</h1>
          <p className="text-gray-600 mt-1">
            Personaliza tu experiencia en la plataforma
          </p>
        </div>

        <div className="space-y-8">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaPalette className="mr-2 h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza cómo se ve la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Tema</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Claro' },
                    { value: 'dark', label: 'Oscuro' },
                    { value: 'system', label: 'Sistema' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updatePreference('appearance', 'theme', theme.value)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        preferences.appearance.theme === theme.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {getThemeIcon(theme.value)}
                      </div>
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Tamaño de fuente: {preferences.appearance.fontSize}px
                </label>
                <Slider
                  value={[preferences.appearance.fontSize]}
                  onValueChange={(value) => updatePreference('appearance', 'fontSize', value[0])}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>12px</span>
                  <span>24px</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Modo compacto</label>
                    <p className="text-sm text-gray-600">Reduce el espaciado para mostrar más contenido</p>
                  </div>
                  <Switch
                    checked={preferences.appearance.compactMode}
                    onCheckedChange={(checked) => updatePreference('appearance', 'compactMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Animaciones</label>
                    <p className="text-sm text-gray-600">Habilitar transiciones y animaciones</p>
                  </div>
                  <Switch
                    checked={preferences.appearance.animations}
                    onCheckedChange={(checked) => updatePreference('appearance', 'animations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaBell className="mr-2 h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sonido</label>
                    <p className="text-sm text-gray-600">Reproducir sonidos para notificaciones</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.soundEnabled}
                    onCheckedChange={(checked) => updatePreference('notifications', 'soundEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vibración</label>
                    <p className="text-sm text-gray-600">Vibrar el dispositivo para notificaciones</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.vibrationEnabled}
                    onCheckedChange={(checked) => updatePreference('notifications', 'vibrationEnabled', checked)}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Horas de silencio</label>
                    <p className="text-sm text-gray-600">Pausar notificaciones durante ciertas horas</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      updateNestedPreference('notifications', 'quietHours', 'enabled', checked)
                    }
                  />
                </div>

                {preferences.notifications.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Inicio</label>
                      <input
                        type="time"
                        value={preferences.notifications.quietHours.start}
                        onChange={(e) =>
                          updateNestedPreference('notifications', 'quietHours', 'start', e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fin</label>
                      <input
                        type="time"
                        value={preferences.notifications.quietHours.end}
                        onChange={(e) =>
                          updateNestedPreference('notifications', 'quietHours', 'end', e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaShieldAlt className="mr-2 h-5 w-5" />
                Accesibilidad
              </CardTitle>
              <CardDescription>
                Configuraciones para mejorar la accesibilidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Alto contraste</label>
                  <p className="text-sm text-gray-600">Mejorar la visibilidad con colores de alto contraste</p>
                </div>
                <Switch
                  checked={preferences.accessibility.highContrast}
                  onCheckedChange={(checked) => updatePreference('accessibility', 'highContrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Movimiento reducido</label>
                  <p className="text-sm text-gray-600">Reducir animaciones y transiciones</p>
                </div>
                <Switch
                  checked={preferences.accessibility.reducedMotion}
                  onCheckedChange={(checked) => updatePreference('accessibility', 'reducedMotion', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Lector de pantalla</label>
                  <p className="text-sm text-gray-600">Optimizar para lectores de pantalla</p>
                </div>
                <Switch
                  checked={preferences.accessibility.screenReader}
                  onCheckedChange={(checked) => updatePreference('accessibility', 'screenReader', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Navegación por teclado</label>
                  <p className="text-sm text-gray-600">Habilitar navegación completa por teclado</p>
                </div>
                <Switch
                  checked={preferences.accessibility.keyboardNavigation}
                  onCheckedChange={(checked) => updatePreference('accessibility', 'keyboardNavigation', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaGlobe className="mr-2 h-5 w-5" />
                Configuración Regional
              </CardTitle>
              <CardDescription>
                Personaliza formatos de fecha, hora y moneda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Formato de fecha</label>
                  <Select
                    value={preferences.regional.dateFormat}
                    onValueChange={(value: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD') =>
                      updatePreference('regional', 'dateFormat', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Formato de hora</label>
                  <Select
                    value={preferences.regional.timeFormat}
                    onValueChange={(value: '12h' | '24h') =>
                      updatePreference('regional', 'timeFormat', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas (14:30)</SelectItem>
                      <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Moneda</label>
                  <Select
                    value={preferences.regional.currency}
                    onValueChange={(value: 'GTQ' | 'USD' | 'EUR') =>
                      updatePreference('regional', 'currency', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTQ">Quetzal (Q)</SelectItem>
                      <SelectItem value="USD">Dólar estadounidense ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Formato numérico</label>
                  <Select
                    value={preferences.regional.numberFormat}
                    onValueChange={(value: 'es-GT' | 'en-US' | 'de-DE') =>
                      updatePreference('regional', 'numberFormat', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es-GT">Guatemala (1.234,56)</SelectItem>
                      <SelectItem value="en-US">Estados Unidos (1,234.56)</SelectItem>
                      <SelectItem value="de-DE">Alemania (1.234,56)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {hasUnsavedChanges && (
            <div className="flex justify-end">
              <Button onClick={savePreferences} disabled={isLoading}>
                {isLoading ? (
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
          )}
        </div>
      </div>
    </div>
  )
}