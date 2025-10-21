import React, { useState, useEffect } from 'react'
import { FaCog, FaCheck, FaTimes, FaPlay, FaSave, FaEye, FaEyeSlash, FaKey, FaCreditCard } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminPaymentService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  PaymentGatewayConfig,
  PaymentGateway,
} from '@/types/admin'

const AdminPaymentConfigPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([])
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState(false)
  const [testingGateway, setTestingGateway] = useState<string | null>(null)
  const [savingGateway, setSavingGateway] = useState<string | null>(null)

  // Cargar configuración de gateways
  const loadGatewayConfigs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Aquí iría la lógica para cargar configuraciones de gateways
      // Por ahora, usamos datos mock
      const mockGateways: PaymentGatewayConfig[] = [
        {
          id: 1,
          gateway: 'stripe',
          name: 'Stripe',
          isActive: true,
          isSandbox: false,
          apiKey: 'sk_test_...',
          apiSecret: 'sk_test_...',
          webhookSecret: 'whsec_...',
          supportedCurrencies: ['GTQ', 'USD'],
          minAmount: 1,
          maxAmount: 10000,
          feePercentage: 2.9,
          feeFixed: 0.30,
          testMode: false,
          config: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          gateway: 'paypal',
          name: 'PayPal',
          isActive: true,
          isSandbox: true,
          apiKey: 'client_id_...',
          apiSecret: 'client_secret_...',
          webhookSecret: 'webhook_secret_...',
          supportedCurrencies: ['GTQ', 'USD'],
          minAmount: 1,
          maxAmount: 5000,
          feePercentage: 2.9,
          feeFixed: 0.49,
          testMode: true,
          config: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          gateway: 'bank_transfer',
          name: 'Transferencia Bancaria',
          isActive: true,
          isSandbox: false,
          supportedCurrencies: ['GTQ'],
          minAmount: 10,
          maxAmount: 50000,
          feePercentage: 0,
          feeFixed: 0,
          testMode: false,
          config: {
            bankName: 'Banco Industrial',
            accountNumber: '1234567890',
            accountHolder: 'TradeConnect GT',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      setGateways(mockGateways)
    } catch (err) {
      console.error('Error cargando configuraciones de gateways:', err)
      setError('Error al cargar las configuraciones de pasarelas')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuración de gateway
  const saveGatewayConfig = async (gateway: PaymentGatewayConfig) => {
    try {
      setSavingGateway(gateway.gateway)

      await adminPaymentService.updateGatewayConfig(gateway.gateway, gateway)

      await loadGatewayConfigs()
    } catch (err) {
      console.error('Error guardando configuración:', err)
      setError('Error al guardar la configuración')
    } finally {
      setSavingGateway(null)
    }
  }

  // Probar conexión con gateway
  const testGatewayConnection = async (gatewayId: string) => {
    try {
      setTestingGateway(gatewayId)

      await adminPaymentService.testGatewayConnection(gatewayId)

      // Mostrar mensaje de éxito
      alert('Conexión exitosa con la pasarela')
    } catch (err) {
      console.error('Error probando conexión:', err)
      alert('Error en la conexión con la pasarela')
    } finally {
      setTestingGateway(null)
    }
  }

  // Actualizar configuración
  const updateGatewayConfig = (gatewayId: number, updates: Partial<PaymentGatewayConfig>) => {
    setGateways(prev =>
      prev.map(gateway =>
        gateway.id === gatewayId ? { ...gateway, ...updates } : gateway
      )
    )
  }

  // Formatear monto
  const formatAmount = (amount: number, currency: string = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency === 'GTQ' ? 'GTQ' : 'USD',
    }).format(amount)
  }

  // Obtener badge de estado
  const getStatusBadge = (isActive: boolean, isSandbox: boolean) => {
    if (!isActive) {
      return <Badge variant="outline">Inactivo</Badge>
    }

    if (isSandbox) {
      return <Badge variant="secondary">Sandbox</Badge>
    }

    return <Badge variant="default">Activo</Badge>
  }

  // Obtener icono de gateway
  const getGatewayIcon = (gateway: PaymentGateway) => {
    switch (gateway) {
      case 'stripe':
        return <FaCreditCard className="h-5 w-5 text-purple-600" />
      case 'paypal':
        return <FaCreditCard className="h-5 w-5 text-blue-600" />
      case 'bank_transfer':
        return <FaCreditCard className="h-5 w-5 text-green-600" />
      default:
        return <FaCreditCard className="h-5 w-5 text-gray-600" />
    }
  }

  useEffect(() => {
    loadGatewayConfigs()
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pagos', href: '/admin/pagos' },
    { label: 'Configuración' },
  ]

  return (
    <AdminLayout title="Configuración de Pasarelas de Pago" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pasarelas Totales</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {gateways.length}
                  </p>
                </div>
                <FaCog className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {gateways.filter(g => g.isActive).length}
                  </p>
                </div>
                <FaCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Sandbox</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {gateways.filter(g => g.isSandbox).length}
                  </p>
                </div>
                <FaCog className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monedas Soportadas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(gateways.flatMap(g => g.supportedCurrencies)).size}
                  </p>
                </div>
                <FaCreditCard className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mensaje de error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de pasarelas */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Pasarelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pasarela</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Modo</TableHead>
                    <TableHead>Monedas</TableHead>
                    <TableHead>Límites</TableHead>
                    <TableHead>Comisiones</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : gateways.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No hay pasarelas configuradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    gateways.map((gateway) => (
                      <TableRow key={gateway.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getGatewayIcon(gateway.gateway)}
                            <div>
                              <p className="font-medium">{gateway.name}</p>
                              <p className="text-sm text-gray-500 capitalize">
                                {gateway.gateway.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(gateway.isActive, gateway.isSandbox)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={gateway.testMode ? 'secondary' : 'default'}>
                            {gateway.testMode ? 'Pruebas' : 'Producción'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {gateway.supportedCurrencies.map((currency) => (
                              <Badge key={currency} variant="outline" className="text-xs">
                                {currency}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <p>Min: {formatAmount(gateway.minAmount)}</p>
                            <p>Máx: {formatAmount(gateway.maxAmount)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <p>{gateway.feePercentage}% + {formatAmount(gateway.feeFixed)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedGateway(gateway)}
                                >
                                  <FaCog className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Configurar {gateway.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                  <Tabs defaultValue="general" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                      <TabsTrigger value="general">General</TabsTrigger>
                                      <TabsTrigger value="credentials">Credenciales</TabsTrigger>
                                      <TabsTrigger value="limits">Límites</TabsTrigger>
                                      <TabsTrigger value="fees">Comisiones</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="general" className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="isActive">Estado</Label>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id="isActive"
                                              checked={gateway.isActive}
                                              onCheckedChange={(checked) =>
                                                updateGatewayConfig(gateway.id, { isActive: checked })
                                              }
                                            />
                                            <Label htmlFor="isActive">
                                              {gateway.isActive ? 'Activo' : 'Inactivo'}
                                            </Label>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="isSandbox">Modo Sandbox</Label>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id="isSandbox"
                                              checked={gateway.isSandbox}
                                              onCheckedChange={(checked) =>
                                                updateGatewayConfig(gateway.id, { isSandbox: checked })
                                              }
                                            />
                                            <Label htmlFor="isSandbox">
                                              {gateway.isSandbox ? 'Activado' : 'Desactivado'}
                                            </Label>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="testMode">Modo de Pruebas</Label>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id="testMode"
                                              checked={gateway.testMode}
                                              onCheckedChange={(checked) =>
                                                updateGatewayConfig(gateway.id, { testMode: checked })
                                              }
                                            />
                                            <Label htmlFor="testMode">
                                              {gateway.testMode ? 'Activado' : 'Desactivado'}
                                            </Label>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label>Monedas Soportadas</Label>
                                          <div className="flex gap-2">
                                            {['GTQ', 'USD'].map((currency) => (
                                              <label key={currency} className="flex items-center space-x-2">
                                                <input
                                                  type="checkbox"
                                                  checked={gateway.supportedCurrencies.includes(currency)}
                                                  onChange={(e) => {
                                                    const currencies = e.target.checked
                                                      ? [...gateway.supportedCurrencies, currency]
                                                      : gateway.supportedCurrencies.filter(c => c !== currency)
                                                    updateGatewayConfig(gateway.id, { supportedCurrencies: currencies })
                                                  }}
                                                />
                                                <span className="text-sm">{currency}</span>
                                              </label>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="credentials" className="space-y-4">
                                      <div className="space-y-4">
                                        {gateway.gateway !== 'bank_transfer' && (
                                          <>
                                            <div className="space-y-2">
                                              <Label htmlFor="apiKey">API Key</Label>
                                              <div className="relative">
                                                <Input
                                                  id="apiKey"
                                                  type={showSecrets ? 'text' : 'password'}
                                                  value={gateway.apiKey || ''}
                                                  onChange={(e) =>
                                                    updateGatewayConfig(gateway.id, { apiKey: e.target.value })
                                                  }
                                                />
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                                  onClick={() => setShowSecrets(!showSecrets)}
                                                >
                                                  {showSecrets ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                                                </Button>
                                              </div>
                                            </div>

                                            <div className="space-y-2">
                                              <Label htmlFor="apiSecret">API Secret</Label>
                                              <div className="relative">
                                                <Input
                                                  id="apiSecret"
                                                  type={showSecrets ? 'text' : 'password'}
                                                  value={gateway.apiSecret || ''}
                                                  onChange={(e) =>
                                                    updateGatewayConfig(gateway.id, { apiSecret: e.target.value })
                                                  }
                                                />
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                                  onClick={() => setShowSecrets(!showSecrets)}
                                                >
                                                  {showSecrets ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                                                </Button>
                                              </div>
                                            </div>

                                            <div className="space-y-2">
                                              <Label htmlFor="webhookSecret">Webhook Secret</Label>
                                              <div className="relative">
                                                <Input
                                                  id="webhookSecret"
                                                  type={showSecrets ? 'text' : 'password'}
                                                  value={gateway.webhookSecret || ''}
                                                  onChange={(e) =>
                                                    updateGatewayConfig(gateway.id, { webhookSecret: e.target.value })
                                                  }
                                                />
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                                  onClick={() => setShowSecrets(!showSecrets)}
                                                >
                                                  {showSecrets ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                                                </Button>
                                              </div>
                                            </div>
                                          </>
                                        )}

                                        {gateway.gateway === 'bank_transfer' && (
                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="bankName">Nombre del Banco</Label>
                                              <Input
                                                id="bankName"
                                                value={gateway.config?.bankName || ''}
                                                onChange={(e) =>
                                                  updateGatewayConfig(gateway.id, {
                                                    config: { ...gateway.config, bankName: e.target.value }
                                                  })
                                                }
                                              />
                                            </div>

                                            <div className="space-y-2">
                                              <Label htmlFor="accountNumber">Número de Cuenta</Label>
                                              <Input
                                                id="accountNumber"
                                                value={gateway.config?.accountNumber || ''}
                                                onChange={(e) =>
                                                  updateGatewayConfig(gateway.id, {
                                                    config: { ...gateway.config, accountNumber: e.target.value }
                                                  })
                                                }
                                              />
                                            </div>

                                            <div className="space-y-2">
                                              <Label htmlFor="accountHolder">Titular de la Cuenta</Label>
                                              <Input
                                                id="accountHolder"
                                                value={gateway.config?.accountHolder || ''}
                                                onChange={(e) =>
                                                  updateGatewayConfig(gateway.id, {
                                                    config: { ...gateway.config, accountHolder: e.target.value }
                                                  })
                                                }
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="limits" className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="minAmount">Monto Mínimo</Label>
                                          <Input
                                            id="minAmount"
                                            type="number"
                                            step="0.01"
                                            value={gateway.minAmount}
                                            onChange={(e) =>
                                              updateGatewayConfig(gateway.id, { minAmount: parseFloat(e.target.value) })
                                            }
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="maxAmount">Monto Máximo</Label>
                                          <Input
                                            id="maxAmount"
                                            type="number"
                                            step="0.01"
                                            value={gateway.maxAmount}
                                            onChange={(e) =>
                                              updateGatewayConfig(gateway.id, { maxAmount: parseFloat(e.target.value) })
                                            }
                                          />
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="fees" className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="feePercentage">Comisión Porcentual (%)</Label>
                                          <Input
                                            id="feePercentage"
                                            type="number"
                                            step="0.01"
                                            value={gateway.feePercentage}
                                            onChange={(e) =>
                                              updateGatewayConfig(gateway.id, { feePercentage: parseFloat(e.target.value) })
                                            }
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="feeFixed">Comisión Fija</Label>
                                          <Input
                                            id="feeFixed"
                                            type="number"
                                            step="0.01"
                                            value={gateway.feeFixed}
                                            onChange={(e) =>
                                              updateGatewayConfig(gateway.id, { feeFixed: parseFloat(e.target.value) })
                                            }
                                          />
                                        </div>
                                      </div>
                                    </TabsContent>
                                  </Tabs>

                                  <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                      variant="outline"
                                      onClick={() => testGatewayConnection(gateway.gateway)}
                                      disabled={testingGateway === gateway.gateway}
                                    >
                                      {testingGateway === gateway.gateway ? (
                                        <>
                                          <FaPlay className="h-4 w-4 mr-2 animate-spin" />
                                          Probando...
                                        </>
                                      ) : (
                                        <>
                                          <FaPlay className="h-4 w-4 mr-2" />
                                          Probar Conexión
                                        </>
                                      )}
                                    </Button>

                                    <Button
                                      onClick={() => saveGatewayConfig(gateway)}
                                      disabled={savingGateway === gateway.gateway}
                                    >
                                      {savingGateway === gateway.gateway ? (
                                        <>
                                          <FaSave className="h-4 w-4 mr-2 animate-spin" />
                                          Guardando...
                                        </>
                                      ) : (
                                        <>
                                          <FaSave className="h-4 w-4 mr-2" />
                                          Guardar Configuración
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => testGatewayConnection(gateway.gateway)}
                              disabled={testingGateway === gateway.gateway}
                            >
                              <FaPlay className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminPaymentConfigPage