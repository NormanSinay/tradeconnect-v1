import React, { useState, useEffect } from 'react'
import { FaCog, FaSave, FaTimes, FaGlobe, FaShieldAlt, FaCreditCard, FaFileInvoice, FaBell } from 'react-icons/fa'
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

const AdminConfigPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null)
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
    } catch (err: any) {
      console.error('Error cargando configuración:', err)
      setError('Error al cargar la configuración del sistema')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuración
  const handleSaveConfig = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      await adminSystemService.updateSystemConfig(config)

      setSuccess('Configuración guardada exitosamente')

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error guardando configuración:', err)
      setError(err.message || 'Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  // Actualizar configuración
  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }))
  }

  // Actualizar configuración anidada
  const updateNestedConfig = (section: keyof SystemConfig, subsection: string, field: string, value: any) => {
    if (!config) return

    setConfig(prev => {
      const sectionData = prev![section] as any
      return {
        ...prev!,
        [section]: {
          ...sectionData,
          [subsection]: {
            ...sectionData[subsection],
            [field]: value,
          },
        },
      }
    })
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Configuración' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Configuración del Sistema" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!config) {
    return (
      <AdminLayout title="Configuración del Sistema" breadcrumbs={breadcrumbs}>
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
    <AdminLayout title="Configuración del Sistema" breadcrumbs={breadcrumbs}>
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
              <FaCog className="h-5 w-5" />
              Configuración del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
                <TabsTrigger value="features">Características</TabsTrigger>
                <TabsTrigger value="integrations">Integraciones</TabsTrigger>
              </TabsList>

              {/* Configuración General */}
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Sitio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="siteName">Nombre del Sitio</Label>
                        <Input
                          id="siteName"
                          value={config.site.name}
                          onChange={(e) => updateConfig('site', 'name', e.target.value)}
                          placeholder="TradeConnect"
                        />
                      </div>
                      <div>
                        <Label htmlFor="siteDescription">Descripción</Label>
                        <Input
                          id="siteDescription"
                          value={config.site.description}
                          onChange={(e) => updateConfig('site', 'description', e.target.value)}
                          placeholder="Plataforma de eventos y certificaciones"
                        />
                      </div>
                      <div>
                        <Label htmlFor="siteUrl">URL del Sitio</Label>
                        <Input
                          id="siteUrl"
                          value={config.site.url}
                          onChange={(e) => updateConfig('site', 'url', e.target.value)}
                          placeholder="https://tradeconnect.gt"
                        />
                      </div>
                      <div>
                        <Label htmlFor="logo">URL del Logo</Label>
                        <Input
                          id="logo"
                          value={config.site.logo || ''}
                          onChange={(e) => updateConfig('site', 'logo', e.target.value)}
                          placeholder="https://ejemplo.com/logo.png"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Configuración Regional</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="timezone">Zona Horaria</Label>
                        <Select
                          value={config.site.timezone}
                          onValueChange={(value) => updateConfig('site', 'timezone', value)}
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
                        <Label htmlFor="locale">Idioma Predeterminado</Label>
                        <Select
                          value={config.site.locale}
                          onValueChange={(value) => updateConfig('site', 'locale', value)}
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
                      <div>
                        <Label htmlFor="currency">Moneda Predeterminada</Label>
                        <Select
                          value={config.site.currency}
                          onValueChange={(value) => updateConfig('site', 'currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GTQ">Quetzal (GTQ)</SelectItem>
                            <SelectItem value="USD">Dólar (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Configuración de Email */}
              <TabsContent value="email" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaBell className="h-4 w-4" />
                      Configuración SMTP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtpHost">Servidor SMTP</Label>
                        <Input
                          id="smtpHost"
                          value={config.email.smtp.host}
                          onChange={(e) => updateNestedConfig('email', 'smtp', 'host', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPort">Puerto</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={config.email.smtp.port}
                          onChange={(e) => updateNestedConfig('email', 'smtp', 'port', parseInt(e.target.value))}
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpUsername">Usuario</Label>
                        <Input
                          id="smtpUsername"
                          value={config.email.smtp.username}
                          onChange={(e) => updateNestedConfig('email', 'smtp', 'username', e.target.value)}
                          placeholder="usuario@ejemplo.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPassword">Contraseña</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={config.email.smtp.password}
                          onChange={(e) => updateNestedConfig('email', 'smtp', 'password', e.target.value)}
                          placeholder="Contraseña de aplicación"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="smtpSecure"
                          checked={config.email.smtp.secure}
                          onCheckedChange={(checked) => updateNestedConfig('email', 'smtp', 'secure', checked)}
                        />
                        <Label htmlFor="smtpSecure">Conexión Segura (SSL/TLS)</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Remitente Predeterminado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fromName">Nombre del Remitente</Label>
                        <Input
                          id="fromName"
                          value={config.email.from.name}
                          onChange={(e) => updateNestedConfig('email', 'from', 'name', e.target.value)}
                          placeholder="TradeConnect"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fromEmail">Email del Remitente</Label>
                        <Input
                          id="fromEmail"
                          value={config.email.from.email}
                          onChange={(e) => updateNestedConfig('email', 'from', 'email', e.target.value)}
                          placeholder="noreply@tradeconnect.gt"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configuración de Seguridad */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaShieldAlt className="h-4 w-4" />
                      Políticas de Seguridad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Tiempo de Expiración de Sesión (minutos)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={config.security.sessionTimeout}
                        onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                        placeholder="60"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Política de Contraseñas</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                        <div>
                          <Label htmlFor="minLength">Longitud Mínima</Label>
                          <Input
                            id="minLength"
                            type="number"
                            value={config.security.passwordPolicy.minLength}
                            onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="requireUppercase"
                            checked={config.security.passwordPolicy.requireUppercase}
                            onCheckedChange={(checked) => updateNestedConfig('security', 'passwordPolicy', 'requireUppercase', checked)}
                          />
                          <Label htmlFor="requireUppercase">Requiere Mayúscula</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="requireLowercase"
                            checked={config.security.passwordPolicy.requireLowercase}
                            onCheckedChange={(checked) => updateNestedConfig('security', 'passwordPolicy', 'requireLowercase', checked)}
                          />
                          <Label htmlFor="requireLowercase">Requiere Minúscula</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="requireNumbers"
                            checked={config.security.passwordPolicy.requireNumbers}
                            onCheckedChange={(checked) => updateNestedConfig('security', 'passwordPolicy', 'requireNumbers', checked)}
                          />
                          <Label htmlFor="requireNumbers">Requiere Números</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="requireSymbols"
                            checked={config.security.passwordPolicy.requireSymbols}
                            onCheckedChange={(checked) => updateNestedConfig('security', 'passwordPolicy', 'requireSymbols', checked)}
                          />
                          <Label htmlFor="requireSymbols">Requiere Símbolos</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Autenticación de Dos Factores</Label>
                      <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="twoFactorEnabled"
                            checked={config.security.twoFactor.enabled}
                            onCheckedChange={(checked) => updateNestedConfig('security', 'twoFactor', 'enabled', checked)}
                          />
                          <Label htmlFor="twoFactorEnabled">Habilitado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="twoFactorRequired"
                            checked={config.security.twoFactor.required}
                            onCheckedChange={(checked) => updateNestedConfig('security', 'twoFactor', 'required', checked)}
                          />
                          <Label htmlFor="twoFactorRequired">Requerido para todos los usuarios</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Características del Sistema */}
              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Módulos del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(config.features).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Label className="font-medium capitalize">{feature}</Label>
                            <p className="text-sm text-gray-500">
                              {feature === 'events' && 'Gestión de eventos y conferencias'}
                              {feature === 'speakers' && 'Administración de ponentes'}
                              {feature === 'certificates' && 'Sistema de certificación'}
                              {feature === 'payments' && 'Procesamiento de pagos'}
                              {feature === 'qr' && 'Códigos QR y control de acceso'}
                              {feature === 'promotions' && 'Códigos promocionales'}
                              {feature === 'fel' && 'Facturación electrónica FEL'}
                            </p>
                          </div>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => updateConfig('features', feature, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integraciones */}
              <TabsContent value="integrations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaCreditCard className="h-4 w-4" />
                      Pasarelas de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {config.integrations.paymentGateways.map((gateway, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Label className="font-medium">{gateway.name}</Label>
                            <p className="text-sm text-gray-500">
                              Modo: {gateway.sandbox ? 'Sandbox' : 'Producción'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={gateway.enabled}
                              onCheckedChange={(checked) => {
                                const newGateways = [...config.integrations.paymentGateways]
                                const gateway = newGateways[index]
                                if (gateway) {
                                  newGateways[index] = {
                                    ...gateway,
                                    enabled: checked,
                                    name: gateway.name || '',
                                    sandbox: gateway.sandbox ?? false
                                  }
                                  updateConfig('integrations', 'paymentGateways', newGateways)
                                }
                              }}
                            />
                            <Label>Habilitado</Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaFileInvoice className="h-4 w-4" />
                      Facturación Electrónica (FEL)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="felEnabled"
                        checked={config.integrations.fel.enabled}
                        onCheckedChange={(checked) => updateNestedConfig('integrations', 'fel', 'enabled', checked)}
                      />
                      <Label htmlFor="felEnabled">Habilitado</Label>
                    </div>
                    <div>
                      <Label htmlFor="felCertifier">Certificador</Label>
                      <Select
                        value={config.integrations.fel.certifier}
                        onValueChange={(value) => updateNestedConfig('integrations', 'fel', 'certifier', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="infile">InFile</SelectItem>
                          <SelectItem value="dimexa">Dimexa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="felEnvironment">Entorno</Label>
                      <Select
                        value={config.integrations.fel.environment}
                        onValueChange={(value) => updateNestedConfig('integrations', 'fel', 'environment', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="production">Producción</SelectItem>
                          <SelectItem value="testing">Pruebas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
            onClick={handleSaveConfig}
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

export default AdminConfigPage