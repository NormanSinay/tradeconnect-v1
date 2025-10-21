import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FaExclamationTriangle,
  FaChartLine,
  FaUsers,
  FaClock,
  FaCog,
  FaPlay,
  FaStop,
  FaHistory,
  FaDownload,
  FaEdit,
  FaTrash
} from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { adminCapacityService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import { toast } from '@/utils/toast'
import type {
  OverbookingConfig,
  OverbookingHistory,
  CapacityStatus,
  OverbookingRiskLevel
} from '@/types/admin'

const AdminOverbookingPage: React.FC = () => {
  const { eventoId } = useParams<{ eventoId: string }>()
  const navigate = useNavigate()
  const eventId = parseInt(eventoId || '0')

  // Estados principales
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overbookingConfig, setOverbookingConfig] = useState<OverbookingConfig | null>(null)
  const [capacityStatus, setCapacityStatus] = useState<CapacityStatus | null>(null)
  const [overbookingHistory, setOverbookingHistory] = useState<OverbookingHistory[]>([])

  // Estados de formularios
  const [configDialogOpen, setConfigDialogOpen] = useState(false)

  // Formulario de configuración
  const [configForm, setConfigForm] = useState({
    eventId: eventId,
    maxPercentage: 20,
    currentPercentage: 0,
    riskLevel: 'MEDIUM' as OverbookingRiskLevel,
    autoActions: {
      alertAdmins: true,
      notifyUsers: false,
      offerAlternatives: false
    },
    isActive: false,
    createdBy: 1 // TODO: Get from auth context
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (eventId) {
      loadData()
    }
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [config, status, history] = await Promise.all([
        adminCapacityService.getOverbookingConfig(eventId),
        adminCapacityService.getCapacityStatus(eventId),
        adminCapacityService.getOverbookingHistory(eventId)
      ])

      setOverbookingConfig(config)
      setCapacityStatus(status)
      setOverbookingHistory(history)

      // Inicializar formulario
      setConfigForm({
        eventId: eventId,
        maxPercentage: config.maxPercentage,
        currentPercentage: config.currentPercentage,
        riskLevel: config.riskLevel,
        autoActions: config.autoActions,
        isActive: config.isActive,
        createdBy: config.createdBy
      })

    } catch (err) {
      console.error('Error cargando datos de overbooking:', err)
      setError('Error al cargar los datos de overbooking')
    } finally {
      setLoading(false)
    }
  }

  // Manejar configuración de overbooking
  const handleSaveConfig = async () => {
    try {
      await adminCapacityService.configureOverbooking(eventId, configForm)
      toast.success('Configuración de overbooking actualizada')
      setConfigDialogOpen(false)
      loadData()
    } catch (err) {
      console.error('Error guardando configuración de overbooking:', err)
      toast.error('Error al guardar la configuración de overbooking')
    }
  }

  // Activar/desactivar overbooking
  const handleToggleOverbooking = async () => {
    if (!overbookingConfig) return

    try {
      const updatedConfig = {
        ...overbookingConfig,
        isActive: !overbookingConfig.isActive
      }
      await adminCapacityService.configureOverbooking(eventId, updatedConfig)
      toast.success(`Overbooking ${updatedConfig.isActive ? 'activado' : 'desactivado'}`)
      loadData()
    } catch (err) {
      console.error('Error cambiando estado de overbooking:', err)
      toast.error('Error al cambiar el estado del overbooking')
    }
  }

  // Obtener color de badge según nivel de riesgo
  const getRiskBadgeVariant = (riskLevel: OverbookingRiskLevel) => {
    const variants: Record<OverbookingRiskLevel, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'LOW': 'default',
      'MEDIUM': 'secondary',
      'HIGH': 'destructive',
      'CRITICAL': 'destructive'
    }
    return variants[riskLevel] || 'secondary'
  }

  // Calcular porcentaje actual de overbooking
  const getCurrentOverbookingPercentage = () => {
    if (!capacityStatus || !overbookingConfig) return 0
    if (capacityStatus.totalCapacity === 0) return 0
    const overbooked = capacityStatus.confirmedCapacity - capacityStatus.totalCapacity
    return Math.max(0, (overbooked / capacityStatus.totalCapacity) * 100)
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: 'Aforos', href: `/admin/aforos/${eventId}` },
    { label: 'Overbooking' }
  ]

  if (loading) {
    return (
      <AdminLayout title="Gestión de Overbooking" breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !overbookingConfig || !capacityStatus) {
    return (
      <AdminLayout title="Gestión de Overbooking" breadcrumbs={breadcrumbs}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error || 'Error al cargar los datos'}</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  const currentOverbookingPercentage = getCurrentOverbookingPercentage()

  return (
    <AdminLayout title="Gestión de Overbooking" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Overbooking</h1>
            <p className="text-gray-600">Configuración y monitoreo de overbooking para el evento</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate(`/admin/aforos/${eventId}`)}>
              <FaUsers className="mr-2" />
              Volver a Aforos
            </Button>
            <Button variant="outline" onClick={() => navigate(`/admin/aforos/${eventId}/estadisticas`)}>
              <FaChartLine className="mr-2" />
              Estadísticas
            </Button>
          </div>
        </div>

        {/* Estado actual del overbooking */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaChartLine className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overbooking Actual</p>
                  <p className="text-2xl font-bold">{currentOverbookingPercentage.toFixed(1)}%</p>
                  <Progress value={currentOverbookingPercentage} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nivel de Riesgo</p>
                  <Badge variant={getRiskBadgeVariant(overbookingConfig.riskLevel)} className="mt-1">
                    {overbookingConfig.riskLevel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaUsers className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Capacidad Total</p>
                  <p className="text-2xl font-bold">{capacityStatus.totalCapacity}</p>
                  <p className="text-sm text-gray-500">Confirmados: {capacityStatus.confirmedCapacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full ${overbookingConfig.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estado</p>
                  <Badge variant={overbookingConfig.isActive ? 'default' : 'secondary'} className="mt-1">
                    {overbookingConfig.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {/* Configuración */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Configuración de Overbooking
                    <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <FaEdit className="mr-2" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configurar Overbooking</DialogTitle>
                          <DialogDescription>
                            Configure los parámetros de overbooking para este evento.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="maxPercentage">Porcentaje Máximo de Overbooking</Label>
                            <Input
                              id="maxPercentage"
                              type="number"
                              value={configForm.maxPercentage}
                              onChange={(e) => setConfigForm(prev => ({ ...prev, maxPercentage: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="riskLevel">Nivel de Riesgo</Label>
                            <select
                              id="riskLevel"
                              value={configForm.riskLevel}
                              onChange={(e) => setConfigForm(prev => ({ ...prev, riskLevel: e.target.value as OverbookingRiskLevel }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="LOW">Bajo</option>
                              <option value="MEDIUM">Medio</option>
                              <option value="HIGH">Alto</option>
                              <option value="CRITICAL">Crítico</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Acciones Automáticas</Label>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="alertAdmins"
                                checked={configForm.autoActions.alertAdmins}
                                onCheckedChange={(checked) => setConfigForm(prev => ({
                                  ...prev,
                                  autoActions: { ...prev.autoActions, alertAdmins: checked }
                                }))}
                              />
                              <Label htmlFor="alertAdmins">Alertar administradores</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="notifyUsers"
                                checked={configForm.autoActions.notifyUsers}
                                onCheckedChange={(checked) => setConfigForm(prev => ({
                                  ...prev,
                                  autoActions: { ...prev.autoActions, notifyUsers: checked }
                                }))}
                              />
                              <Label htmlFor="notifyUsers">Notificar usuarios</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="offerAlternatives"
                                checked={configForm.autoActions.offerAlternatives}
                                onCheckedChange={(checked) => setConfigForm(prev => ({
                                  ...prev,
                                  autoActions: { ...prev.autoActions, offerAlternatives: checked }
                                }))}
                              />
                              <Label htmlFor="offerAlternatives">Ofrecer alternativas</Label>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveConfig}>
                            Guardar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Porcentaje Máximo:</span>
                    <span className="font-medium">{overbookingConfig.maxPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Porcentaje Actual:</span>
                    <span className="font-medium">{overbookingConfig.currentPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nivel de Riesgo:</span>
                    <Badge variant={getRiskBadgeVariant(overbookingConfig.riskLevel)}>
                      {overbookingConfig.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <Badge variant={overbookingConfig.isActive ? 'default' : 'secondary'}>
                      {overbookingConfig.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Automáticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Alertar administradores:</span>
                    <Badge variant={overbookingConfig.autoActions.alertAdmins ? 'default' : 'secondary'}>
                      {overbookingConfig.autoActions.alertAdmins ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notificar usuarios:</span>
                    <Badge variant={overbookingConfig.autoActions.notifyUsers ? 'default' : 'secondary'}>
                      {overbookingConfig.autoActions.notifyUsers ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ofrecer alternativas:</span>
                    <Badge variant={overbookingConfig.autoActions.offerAlternatives ? 'default' : 'secondary'}>
                      {overbookingConfig.autoActions.offerAlternatives ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={handleToggleOverbooking}
                      variant={overbookingConfig.isActive ? 'destructive' : 'default'}
                      className="w-full"
                    >
                      {overbookingConfig.isActive ? (
                        <>
                          <FaStop className="mr-2" />
                          Desactivar Overbooking
                        </>
                      ) : (
                        <>
                          <FaPlay className="mr-2" />
                          Activar Overbooking
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoreo */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoreo en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {capacityStatus.utilizationPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Utilización Total</div>
                    <Progress value={capacityStatus.utilizationPercentage} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {capacityStatus.availableCapacity}
                    </div>
                    <div className="text-sm text-gray-600">Plazas Disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {capacityStatus.blockedCapacity}
                    </div>
                    <div className="text-sm text-gray-600">Plazas Bloqueadas</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Indicadores de Alerta</h3>
                  <div className="space-y-2">
                    {capacityStatus.utilizationPercentage >= capacityStatus.alertThresholds.high && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">Utilización alta detectada</span>
                      </div>
                    )}
                    {currentOverbookingPercentage > 0 && (
                      <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded">
                        <FaExclamationTriangle className="h-5 w-5 text-orange-500" />
                        <span className="text-orange-700">Overbooking activo: {currentOverbookingPercentage.toFixed(1)}%</span>
                      </div>
                    )}
                    {capacityStatus.waitlistCount > 0 && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <FaUsers className="h-5 w-5 text-blue-500" />
                        <span className="text-blue-700">{capacityStatus.waitlistCount} usuarios en lista de espera</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historial */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Historial de Overbooking
                  <Button variant="outline" size="sm">
                    <FaDownload className="mr-2" />
                    Exportar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overbookingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay historial disponible
                    </h3>
                    <p className="text-gray-600">
                      El historial de overbooking se mostrará aquí una vez que se active.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha de Activación</TableHead>
                        <TableHead>Fecha de Desactivación</TableHead>
                        <TableHead>Porcentaje Máximo</TableHead>
                        <TableHead>Porcentaje Real</TableHead>
                        <TableHead>Registros Afectados</TableHead>
                        <TableHead>Razón</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overbookingHistory.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{formatDateTime(entry.activatedAt)}</TableCell>
                          <TableCell>
                            {entry.deactivatedAt ? formatDateTime(entry.deactivatedAt) : 'Activo'}
                          </TableCell>
                          <TableCell>{entry.maxPercentage}%</TableCell>
                          <TableCell>{entry.actualPercentage}%</TableCell>
                          <TableCell>{entry.registrationsAffected}</TableCell>
                          <TableCell>{entry.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

export default AdminOverbookingPage