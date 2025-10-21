import React, { useState, useEffect } from 'react'
import { FaCog, FaSave, FaTestTube, FaKey, FaBuilding, FaGlobe, FaServer, FaCertificate, FaCheck, FaTimes } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { adminFelService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  FelConfig,
  FelCertifierConfig,
  FelCertifier,
} from '@/types/admin'

const AdminFelConfigPage: React.FC = () => {
  const [config, setConfig] = useState<FelConfig | null>(null)
  const [certifierConfigs, setCertifierConfigs] = useState<Record<FelCertifier, FelCertifierConfig>>({} as any)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<FelCertifier, {
    status: 'idle' | 'testing' | 'success' | 'failed'
    message?: string
  }>>({} as any)

  // Cargar configuración FEL
  const loadFelConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [mainConfig, infileConfig, dimexaConfig] = await Promise.all([
        adminFelService.getFelConfig(),
        adminFelService.getFelCertifierConfig('infile'),
        adminFelService.getFelCertifierConfig('dimexa'),
      ])

      setConfig(mainConfig)
      setCertifierConfigs({
        infile: infileConfig,
        dimexa: dimexaConfig,
      })
    } catch (err) {
      console.error('Error cargando configuración FEL:', err)
      setError('Error al cargar la configuración FEL')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuración general
  const saveGeneralConfig = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      await adminFelService.updateFelConfig(config)
      setSuccess('Configuración general guardada exitosamente')
    } catch (err) {
      console.error('Error guardando configuración:', err)
      setError('Error al guardar la configuración general')
    } finally {
      setIsSaving(false)
    }
  }

  // Guardar configuración de certificador
  const saveCertifierConfig = async (certifier: FelCertifier) => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      await adminFelService.updateFelCertifierConfig(certifier, certifierConfigs[certifier])
      setSuccess(`Configuración de ${certifier} guardada exitosamente`)
    } catch (err) {
      console.error('Error guardando configuración de certificador:', err)
      setError(`Error al guardar la configuración de ${certifier}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Probar conexión con certificador
  const testCertifierConnection = async (certifier: FelCertifier) => {
    try {
      setTestResults(prev => ({
        ...prev,
        [certifier]: { status: 'testing' }
      }))

      await adminFelService.testFelCertifierConnection(certifier)

      setTestResults(prev => ({
        ...prev,
        [certifier]: { status: 'success', message: 'Conexión exitosa' }
      }))
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [certifier]: { status: 'failed', message: err.message || 'Error de conexión' }
      }))
    }
  }

  // Actualizar configuración general
  const updateGeneralConfig = (field: string, value: any) => {
    if (!config) return

    setConfig(prev => {
      if (!prev) return prev

      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof FelConfig],
            [child]: value,
          },
        }
      }

      return {
        ...prev,
        [field]: value,
      }
    })
  }

  // Actualizar configuración de certificador
  const updateCertifierConfig = (certifier: FelCertifier, field: string, value: any) => {
    setCertifierConfigs(prev => ({
      ...prev,
      [certifier]: {
        ...prev[certifier],
        [field]: value,
      },
    }))
  }

  useEffect(() => {
    loadFelConfig()
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Facturación FEL', href: '/admin/facturacion' },
    { label: 'Configuración' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Configuración FEL" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Configuración FEL" breadcrumbs={breadcrumbs}>
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
                <FaCheck className="h-5 w-5 text-green-500" />
                <span className="text-green-700">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="certifiers">Certificadores</TabsTrigger>
            <TabsTrigger value="advanced">Avanzado</TabsTrigger>
          </TabsList>

          {/* Configuración General */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaBuilding className="h-5 w-5" />
                  Información del Emisor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issuer-nit">NIT</Label>
                    <Input
                      id="issuer-nit"
                      value={config?.issuer.nit || ''}
                      onChange={(e) => updateGeneralConfig('issuer.nit', e.target.value)}
                      placeholder="12345678-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer-name">Nombre</Label>
                    <Input
                      id="issuer-name"
                      value={config?.issuer.name || ''}
                      onChange={(e) => updateGeneralConfig('issuer.name', e.target.value)}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer-address">Dirección</Label>
                    <Input
                      id="issuer-address"
                      value={config?.issuer.address || ''}
                      onChange={(e) => updateGeneralConfig('issuer.address', e.target.value)}
                      placeholder="Dirección completa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer-municipality">Municipio</Label>
                    <Input
                      id="issuer-municipality"
                      value={config?.issuer.municipality || ''}
                      onChange={(e) => updateGeneralConfig('issuer.municipality', e.target.value)}
                      placeholder="Municipio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer-department">Departamento</Label>
                    <Input
                      id="issuer-department"
                      value={config?.issuer.department || ''}
                      onChange={(e) => updateGeneralConfig('issuer.department', e.target.value)}
                      placeholder="Departamento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer-country">País</Label>
                    <Input
                      id="issuer-country"
                      value={config?.issuer.country || ''}
                      onChange={(e) => updateGeneralConfig('issuer.country', e.target.value)}
                      placeholder="GT"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer-email">Email</Label>
                    <Input
                      id="issuer-email"
                      type="email"
                      value={config?.issuer.email || ''}
                      onChange={(e) => updateGeneralConfig('issuer.email', e.target.value)}
                      placeholder="email@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer-phone">Teléfono</Label>
                    <Input
                      id="issuer-phone"
                      value={config?.issuer.phone || ''}
                      onChange={(e) => updateGeneralConfig('issuer.phone', e.target.value)}
                      placeholder="+502 1234 5678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaGlobe className="h-5 w-5" />
                  Configuración General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certifier">Certificador Predeterminado</Label>
                    <Select
                      value={config?.certifier || 'infile'}
                      onValueChange={(value) => updateGeneralConfig('certifier', value)}
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
                    <Label htmlFor="environment">Entorno</Label>
                    <Select
                      value={config?.environment || 'testing'}
                      onValueChange={(value) => updateGeneralConfig('environment', value)}
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
                  <div>
                    <Label htmlFor="default-series">Serie Predeterminada</Label>
                    <Input
                      id="default-series"
                      value={config?.series.default || ''}
                      onChange={(e) => updateGeneralConfig('series.default', e.target.value)}
                      placeholder="A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="iva-rate">Tasa IVA (%)</Label>
                    <Input
                      id="iva-rate"
                      type="number"
                      step="0.01"
                      value={config?.taxes.iva ? (config.taxes.iva * 100).toString() : ''}
                      onChange={(e) => updateGeneralConfig('taxes.iva', parseFloat(e.target.value) / 100)}
                      placeholder="12.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveGeneralConfig} disabled={isSaving}>
                <FaSave className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </TabsContent>

          {/* Configuración de Certificadores */}
          <TabsContent value="certifiers" className="space-y-6">
            {(['infile', 'dimexa'] as FelCertifier[]).map((certifier) => (
              <Card key={certifier}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaCertificate className="h-5 w-5" />
                      <span className="capitalize">{certifier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {testResults[certifier] && (
                        <Badge
                          variant={
                            testResults[certifier].status === 'success' ? 'default' :
                            testResults[certifier].status === 'failed' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {testResults[certifier].status === 'success' && <FaCheck className="h-3 w-3 mr-1" />}
                          {testResults[certifier].status === 'failed' && <FaTimes className="h-3 w-3 mr-1" />}
                          {testResults[certifier].status === 'testing' ? 'Probando...' :
                           testResults[certifier].message || 'Sin probar'}
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testCertifierConnection(certifier)}
                        disabled={testResults[certifier]?.status === 'testing'}
                      >
                        <FaTestTube className="h-4 w-4 mr-2" />
                        Probar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>URL API Producción</Label>
                      <Input
                        value={certifierConfigs[certifier]?.apiUrl || ''}
                        onChange={(e) => updateCertifierConfig(certifier, 'apiUrl', e.target.value)}
                        placeholder="https://api.certificador.com"
                      />
                    </div>
                    <div>
                      <Label>URL API Pruebas</Label>
                      <Input
                        value={certifierConfigs[certifier]?.testApiUrl || ''}
                        onChange={(e) => updateCertifierConfig(certifier, 'testApiUrl', e.target.value)}
                        placeholder="https://test-api.certificador.com"
                      />
                    </div>
                    <div>
                      <Label>Timeout (segundos)</Label>
                      <Input
                        type="number"
                        value={certifierConfigs[certifier]?.timeoutSeconds || 30}
                        onChange={(e) => updateCertifierConfig(certifier, 'timeoutSeconds', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Máximo Reintentos</Label>
                      <Input
                        type="number"
                        value={certifierConfigs[certifier]?.maxRetries || 3}
                        onChange={(e) => updateCertifierConfig(certifier, 'maxRetries', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Límite de Solicitudes</Label>
                      <Input
                        type="number"
                        value={certifierConfigs[certifier]?.rateLimit.requests || 100}
                        onChange={(e) => updateCertifierConfig(certifier, 'rateLimit', {
                          ...certifierConfigs[certifier].rateLimit,
                          requests: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label>Período de Límite (segundos)</Label>
                      <Input
                        type="number"
                        value={certifierConfigs[certifier]?.rateLimit.period || 60}
                        onChange={(e) => updateCertifierConfig(certifier, 'rateLimit', {
                          ...certifierConfigs[certifier].rateLimit,
                          period: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Documentos Soportados</Label>
                    <div className="flex gap-2 mt-2">
                      {['FACTURA', 'NOTA_DE_CREDITO', 'NOTA_DE_DEBITO', 'RECIBO'].map((docType) => (
                        <Badge key={docType} variant="outline">
                          {docType.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveCertifierConfig(certifier)}
                      disabled={isSaving}
                    >
                      <FaSave className="h-4 w-4 mr-2" />
                      {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Configuración Avanzada */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaServer className="h-5 w-5" />
                  Configuración de API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="api-timeout">Timeout API (ms)</Label>
                    <Input
                      id="api-timeout"
                      type="number"
                      value={config?.api.timeout || 30000}
                      onChange={(e) => updateGeneralConfig('api.timeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-retries">Reintentos API</Label>
                    <Input
                      id="api-retries"
                      type="number"
                      value={config?.api.retries || 3}
                      onChange={(e) => updateGeneralConfig('api.retries', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaKey className="h-5 w-5" />
                  Gestión de Series
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Series Configuradas</Label>
                    <div className="mt-2 space-y-2">
                      {config?.series.ranges.map((range, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 border rounded">
                          <div className="flex-1">
                            <Label className="text-sm font-medium">Serie {range.series}</Label>
                            <p className="text-sm text-gray-600">
                              Rango: {range.min} - {range.max} | Actual: {range.current}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveGeneralConfig} disabled={isSaving}>
                <FaSave className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

export default AdminFelConfigPage