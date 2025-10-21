import React, { useState, useEffect } from 'react'
import { FaGlobe, FaSave, FaTimes, FaLanguage, FaClock, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa'
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

interface LocalizationConfig {
  timezone: string
  locale: string
  currency: 'GTQ' | 'USD'
  dateFormat: string
  timeFormat: '12h' | '24h'
  numberFormat: {
    decimalSeparator: string
    thousandSeparator: string
    decimalPlaces: number
  }
  currencyFormat: {
    symbol: string
    position: 'before' | 'after'
    space: boolean
  }
  languages: {
    default: string
    available: string[]
    autoDetect: boolean
  }
  regions: {
    country: string
    states: string[]
    cities: string[]
  }
}

const AdminLocalizationConfigPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [localizationConfig, setLocalizationConfig] = useState<LocalizationConfig>({
    timezone: 'America/Guatemala',
    locale: 'es',
    currency: 'GTQ',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: {
      decimalSeparator: ',',
      thousandSeparator: '.',
      decimalPlaces: 2,
    },
    currencyFormat: {
      symbol: 'Q',
      position: 'before',
      space: false,
    },
    languages: {
      default: 'es',
      available: ['es', 'en'],
      autoDetect: true,
    },
    regions: {
      country: 'Guatemala',
      states: [],
      cities: [],
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')

  // Cargar configuración actual
  const loadConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const configData = await adminSystemService.getSystemConfig()
      setConfig(configData)

      // Actualizar configuración de localización desde la configuración del sistema
      setLocalizationConfig(prev => ({
        ...prev,
        timezone: configData.site.timezone,
        locale: configData.site.locale,
        currency: configData.site.currency,
      }))
    } catch (err: any) {
      console.error('Error cargando configuración:', err)
      setError('Error al cargar la configuración de localización')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuración de localización
  const handleSaveLocalizationConfig = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      // Actualizar configuración del sistema con los valores de localización
      const updatedConfig = {
        ...config,
        site: {
          ...config.site,
          timezone: localizationConfig.timezone,
          locale: localizationConfig.locale,
          currency: localizationConfig.currency,
        },
      }

      await adminSystemService.updateSystemConfig(updatedConfig)

      setSuccess('Configuración de localización guardada exitosamente')

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error guardando configuración de localización:', err)
      setError(err.message || 'Error al guardar la configuración de localización')
    } finally {
      setIsSaving(false)
    }
  }

  // Actualizar configuración de localización
  const updateLocalizationConfig = (field: keyof LocalizationConfig, value: any) => {
    setLocalizationConfig(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Actualizar configuración anidada
  const updateNestedConfig = (section: keyof LocalizationConfig, field: string, value: any) => {
    setLocalizationConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
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
    { label: 'Localización' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Configuración de Localización" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Configuración de Localización" breadcrumbs={breadcrumbs}>
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
              <FaGlobe className="h-5 w-5" />
              Configuración Regional y de Idioma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="formatos">Formatos</TabsTrigger>
                <TabsTrigger value="moneda">Moneda</TabsTrigger>
                <TabsTrigger value="idiomas">Idiomas</TabsTrigger>
              </TabsList>

              {/* Configuración General */}
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FaClock className="h-4 w-4" />
                        Zona Horaria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="timezone">Zona Horaria del Sistema</Label>
                        <Select
                          value={localizationConfig.timezone}
                          onValueChange={(value) => updateLocalizationConfig('timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Guatemala">America/Guatemala (GMT-6)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                            <SelectItem value="America/Chicago">America/Chicago (GMT-6)</SelectItem>
                            <SelectItem value="America/Denver">America/Denver (GMT-7)</SelectItem>
                            <SelectItem value="America/Los_Angeles">America/Los_Angeles (GMT-8)</SelectItem>
                            <SelectItem value="Europe/Madrid">Europe/Madrid (GMT+1)</SelectItem>
                            <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                            <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          Zona horaria utilizada para todas las fechas y horarios del sistema
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FaGlobe className="h-4 w-4" />
                        Región
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="country">País</Label>
                        <Select
                          value={localizationConfig.regions.country}
                          onValueChange={(value) => updateNestedConfig('regions', 'country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Guatemala">Guatemala</SelectItem>
                            <SelectItem value="El Salvador">El Salvador</SelectItem>
                            <SelectItem value="Honduras">Honduras</SelectItem>
                            <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                            <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                            <SelectItem value="Panamá">Panamá</SelectItem>
                            <SelectItem value="México">México</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="locale">Configuración Regional</Label>
                        <Select
                          value={localizationConfig.locale}
                          onValueChange={(value) => updateLocalizationConfig('locale', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español (Guatemala)</SelectItem>
                            <SelectItem value="es-MX">Español (México)</SelectItem>
                            <SelectItem value="es-ES">Español (España)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Configuración de Formatos */}
              <TabsContent value="formatos" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FaCalendarAlt className="h-4 w-4" />
                        Formato de Fecha
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="dateFormat">Formato de Fecha</Label>
                        <Select
                          value={localizationConfig.dateFormat}
                          onValueChange={(value) => updateLocalizationConfig('dateFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                            <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (31-12-2023)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeFormat">Formato de Hora</Label>
                        <Select
                          value={localizationConfig.timeFormat}
                          onValueChange={(value) => updateLocalizationConfig('timeFormat', value)}
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
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Formato de Números</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="decimalSeparator">Separador Decimal</Label>
                          <Select
                            value={localizationConfig.numberFormat.decimalSeparator}
                            onValueChange={(value) => updateNestedConfig('numberFormat', 'decimalSeparator', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=",">Coma (,)</SelectItem>
                              <SelectItem value=".">Punto (.)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="thousandSeparator">Separador de Miles</Label>
                          <Select
                            value={localizationConfig.numberFormat.thousandSeparator}
                            onValueChange={(value) => updateNestedConfig('numberFormat', 'thousandSeparator', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=".">Punto (.)</SelectItem>
                              <SelectItem value=",">Coma (,)</SelectItem>
                              <SelectItem value=" ">Espacio ( )</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="decimalPlaces">Decimales Predeterminados</Label>
                        <Select
                          value={localizationConfig.numberFormat.decimalPlaces.toString()}
                          onValueChange={(value) => updateNestedConfig('numberFormat', 'decimalPlaces', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 decimales</SelectItem>
                            <SelectItem value="2">2 decimales</SelectItem>
                            <SelectItem value="3">3 decimales</SelectItem>
                            <SelectItem value="4">4 decimales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Configuración de Moneda */}
              <TabsContent value="moneda" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaMoneyBillWave className="h-4 w-4" />
                      Configuración de Moneda
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currency">Moneda Predeterminada</Label>
                        <Select
                          value={localizationConfig.currency}
                          onValueChange={(value) => updateLocalizationConfig('currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GTQ">Quetzal (GTQ)</SelectItem>
                            <SelectItem value="USD">Dólar estadounidense (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="currencySymbol">Símbolo de Moneda</Label>
                        <Input
                          id="currencySymbol"
                          value={localizationConfig.currencyFormat.symbol}
                          onChange={(e) => updateNestedConfig('currencyFormat', 'symbol', e.target.value)}
                          placeholder="Q"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currencyPosition">Posición del Símbolo</Label>
                        <Select
                          value={localizationConfig.currencyFormat.position}
                          onValueChange={(value) => updateNestedConfig('currencyFormat', 'position', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="before">Antes del monto (Q 1,000)</SelectItem>
                            <SelectItem value="after">Después del monto (1,000 Q)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="currencySpace"
                          checked={localizationConfig.currencyFormat.space}
                          onCheckedChange={(checked) => updateNestedConfig('currencyFormat', 'space', checked)}
                        />
                        <Label htmlFor="currencySpace">Espacio entre símbolo y monto</Label>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <Label>Ejemplo de Formato</Label>
                      <div className="mt-2 text-lg font-mono">
                        {localizationConfig.currencyFormat.position === 'before'
                          ? `${localizationConfig.currencyFormat.symbol}${localizationConfig.currencyFormat.space ? ' ' : ''}1${localizationConfig.numberFormat.thousandSeparator}000${localizationConfig.numberFormat.decimalSeparator}00`
                          : `1${localizationConfig.numberFormat.thousandSeparator}000${localizationConfig.numberFormat.decimalSeparator}00${localizationConfig.currencyFormat.space ? ' ' : ''}${localizationConfig.currencyFormat.symbol}`
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configuración de Idiomas */}
              <TabsContent value="idiomas" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaLanguage className="h-4 w-4" />
                      Configuración de Idiomas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="defaultLanguage">Idioma Predeterminado</Label>
                      <Select
                        value={localizationConfig.languages.default}
                        onValueChange={(value) => updateNestedConfig('languages', 'default', value)}
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

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoDetectLanguage"
                        checked={localizationConfig.languages.autoDetect}
                        onCheckedChange={(checked) => updateNestedConfig('languages', 'autoDetect', checked)}
                      />
                      <Label htmlFor="autoDetectLanguage">Detectar idioma automáticamente del navegador</Label>
                    </div>

                    <div>
                      <Label>Idiomas Disponibles</Label>
                      <div className="mt-2 space-y-2">
                        {['es', 'en'].map((lang) => (
                          <div key={lang} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`lang-${lang}`}
                              checked={localizationConfig.languages.available.includes(lang)}
                              onChange={(e) => {
                                const available = e.target.checked
                                  ? [...localizationConfig.languages.available, lang]
                                  : localizationConfig.languages.available.filter(l => l !== lang)
                                updateNestedConfig('languages', 'available', available)
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`lang-${lang}`}>
                              {lang === 'es' ? 'Español' : 'English'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Información Importante */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <FaGlobe className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Información Importante sobre Localización
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Los cambios en zona horaria afectan todas las fechas existentes en el sistema</li>
                  <li>• El formato de moneda se aplica a precios, facturas y reportes</li>
                  <li>• Los formatos de fecha y número afectan la visualización en toda la plataforma</li>
                  <li>• Los cambios pueden requerir refrescar la página para aplicarse completamente</li>
                  <li>• Se recomienda hacer backup antes de cambiar configuraciones regionales</li>
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
            onClick={handleSaveLocalizationConfig}
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

export default AdminLocalizationConfigPage