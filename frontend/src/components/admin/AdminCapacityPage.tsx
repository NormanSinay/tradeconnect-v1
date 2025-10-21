import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FaUsers,
  FaClock,
  FaList,
  FaCog,
  FaChartBar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload
} from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  CapacityConfig,
  CapacityStatus,
  AccessTypeCapacity,
  CapacityLock,
  WaitlistEntry,
  CapacityRule,
  OverbookingConfig,
  RealTimeOccupancyReport
} from '@/types/admin'

const AdminCapacityPage: React.FC = () => {
  const { eventoId } = useParams<{ eventoId: string }>()
  const navigate = useNavigate()
  const eventId = parseInt(eventoId || '0')

  // Estados principales
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [capacityConfig, setCapacityConfig] = useState<CapacityConfig | null>(null)
  const [capacityStatus, setCapacityStatus] = useState<CapacityStatus | null>(null)
  const [overbookingConfig, setOverbookingConfig] = useState<OverbookingConfig | null>(null)
  const [activeLocks, setActiveLocks] = useState<CapacityLock[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [capacityRules, setCapacityRules] = useState<CapacityRule[]>([])
  const [realtimeReport, setRealtimeReport] = useState<RealTimeOccupancyReport | null>(null)

  // Estados de formularios
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [overbookingDialogOpen, setOverbookingDialogOpen] = useState(false)
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)

  // Formularios
  const [configForm, setConfigForm] = useState({
    totalCapacity: 0,
    overbookingPercentage: 0,
    overbookingEnabled: false,
    waitlistEnabled: false,
    lockTimeoutMinutes: 15,
    alertThresholds: { low: 80, medium: 90, high: 95 }
  })

  const [overbookingForm, setOverbookingForm] = useState({
    eventId: eventId,
    maxPercentage: 20,
    currentPercentage: 0,
    riskLevel: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
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

      const [
        config,
        status,
        overbooking,
        locks,
        waitlistData,
        rules,
        realtime
      ] = await Promise.all([
        adminCapacityService.getCapacityConfig(eventId),
        adminCapacityService.getCapacityStatus(eventId),
        adminCapacityService.getOverbookingConfig(eventId),
        adminCapacityService.getActiveLocks(eventId),
        adminCapacityService.getWaitlist(eventId),
        adminCapacityService.getActiveCapacityRules(eventId),
        adminCapacityService.getRealTimeOccupancyReport(eventId)
      ])

      setCapacityConfig(config)
      setCapacityStatus(status)
      setOverbookingConfig(overbooking)
      setActiveLocks(locks)
      setWaitlist(waitlistData)
      setCapacityRules(rules)
      setRealtimeReport(realtime)

      // Inicializar formularios
      setConfigForm({
        totalCapacity: config.totalCapacity,
        overbookingPercentage: config.overbookingPercentage,
        overbookingEnabled: config.overbookingEnabled,
        waitlistEnabled: config.waitlistEnabled,
        lockTimeoutMinutes: config.lockTimeoutMinutes,
        alertThresholds: config.alertThresholds
      })

      setOverbookingForm({
        eventId: eventId,
        maxPercentage: overbooking.maxPercentage,
        currentPercentage: overbooking.currentPercentage,
        riskLevel: overbooking.riskLevel,
        autoActions: overbooking.autoActions,
        isActive: overbooking.isActive,
        createdBy: overbooking.createdBy
      })

    } catch (err) {
      console.error('Error cargando datos de capacidad:', err)
      setError('Error al cargar los datos de capacidad')
    } finally {
      setLoading(false)
    }
  }

  // Manejar configuración de capacidad
  const handleSaveConfig = async () => {
    try {
      await adminCapacityService.configureCapacity(eventId, configForm)
      toast.success('Configuración de capacidad actualizada')
      setConfigDialogOpen(false)
      loadData()
    } catch (err) {
      console.error('Error guardando configuración:', err)
      toast.error('Error al guardar la configuración')
    }
  }

  // Manejar configuración de overbooking
  const handleSaveOverbooking = async () => {
    try {
      await adminCapacityService.configureOverbooking(eventId, overbookingForm)
      toast.success('Configuración de overbooking actualizada')
      setOverbookingDialogOpen(false)
      loadData()
    } catch (err) {
      console.error('Error guardando configuración de overbooking:', err)
      toast.error('Error al guardar la configuración de overbooking')
    }
  }

  // Liberar bloqueo
  const handleReleaseLock = async (lockId: string) => {
    try {
      await adminCapacityService.releaseCapacityLock(eventId, lockId)
      toast.success('Bloqueo liberado')
      loadData()
    } catch (err) {
      console.error('Error liberando bloqueo:', err)
      toast.error('Error al liberar el bloqueo')
    }
  }

  // Remover de lista de espera
  const handleRemoveFromWaitlist = async (waitlistId: number) => {
    try {
      await adminCapacityService.removeFromWaitlist(eventId, waitlistId)
      toast.success('Removido de la lista de espera')
      loadData()
    } catch (err) {
      console.error('Error removiendo de lista de espera:', err)
      toast.error('Error al remover de la lista de espera')
    }
  }

  // Obtener color de badge según estado
  const getLockStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'LOCKED': 'default',
      'CONFIRMED': 'default',
      'EXPIRED': 'secondary',
      'CANCELLED': 'destructive'
    }
    return variants[status] || 'secondary'
  }

  const getWaitlistStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'ACTIVE': 'default',
      'NOTIFIED': 'secondary',
      'CONFIRMED': 'default',
      'EXPIRED': 'outline',
      'CANCELLED': 'destructive'
    }
    return variants[status] || 'secondary'
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: 'Aforos' }
  ]

  if (loading) {
    return (
      <AdminLayout title="Gestión de Aforos" breadcrumbs={breadcrumbs}>
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

  if (error || !capacityStatus) {
    return (
      <AdminLayout title="Gestión de Aforos" breadcrumbs={breadcrumbs}>
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

  return (
    <AdminLayout title="Gestión de Aforos" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Aforos</h1>
            <p className="text-gray-600">Control de capacidad, overbooking y listas de espera</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate(`/admin/aforos/${eventId}/estadisticas`)}>
              <FaChartBar className="mr-2" />
              Estadísticas
            </Button>
            <Button variant="outline" onClick={() => navigate(`/admin/aforos/${eventId}/overbooking`)}>
              <FaCog className="mr-2" />
              Overbooking
            </Button>
          </div>
        </div>

        {/* Resumen de capacidad */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaUsers className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Capacidad Total</p>
                  <p className="text-2xl font-bold">{capacityStatus.totalCapacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaCheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disponible</p>
                  <p className="text-2xl font-bold">{capacityStatus.availableCapacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaClock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bloqueada</p>
                  <p className="text-2xl font-bold">{capacityStatus.blockedCapacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaList className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lista de Espera</p>
                  <p className="text-2xl font-bold">{capacityStatus.waitlistCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="access-types">Tipos de Acceso</TabsTrigger>
            <TabsTrigger value="locks">Bloqueos Activos</TabsTrigger>
            <TabsTrigger value="waitlist">Lista de Espera</TabsTrigger>
            <TabsTrigger value="rules">Reglas</TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Configuración General
                    <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <FaEdit className="mr-2" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configurar Capacidad</DialogTitle>
                          <DialogDescription>
                            Configure los parámetros generales de capacidad para este evento.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="totalCapacity">Capacidad Total</Label>
                            <Input
                              id="totalCapacity"
                              type="number"
                              value={configForm.totalCapacity}
                              onChange={(e) => setConfigForm(prev => ({ ...prev, totalCapacity: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="overbookingPercentage">Porcentaje Overbooking</Label>
                            <Input
                              id="overbookingPercentage"
                              type="number"
                              value={configForm.overbookingPercentage}
                              onChange={(e) => setConfigForm(prev => ({ ...prev, overbookingPercentage: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="overbookingEnabled"
                              checked={configForm.overbookingEnabled}
                              onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, overbookingEnabled: checked }))}
                            />
                            <Label htmlFor="overbookingEnabled">Habilitar Overbooking</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="waitlistEnabled"
                              checked={configForm.waitlistEnabled}
                              onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, waitlistEnabled: checked }))}
                            />
                            <Label htmlFor="waitlistEnabled">Habilitar Lista de Espera</Label>
                          </div>
                          <div>
                            <Label htmlFor="lockTimeoutMinutes">Timeout de Bloqueo (minutos)</Label>
                            <Input
                              id="lockTimeoutMinutes"
                              type="number"
                              value={configForm.lockTimeoutMinutes}
                              onChange={(e) => setConfigForm(prev => ({ ...prev, lockTimeoutMinutes: parseInt(e.target.value) }))}
                            />
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
                    <span>Capacidad Total:</span>
                    <span className="font-medium">{capacityConfig?.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overbooking:</span>
                    <span className="font-medium">{capacityConfig?.overbookingPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lista de Espera:</span>
                    <Badge variant={capacityConfig?.waitlistEnabled ? 'default' : 'secondary'}>
                      {capacityConfig?.waitlistEnabled ? 'Habilitada' : 'Deshabilitada'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeout Bloqueo:</span>
                    <span className="font-medium">{capacityConfig?.lockTimeoutMinutes} min</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado Actual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Utilización:</span>
                    <span className="font-medium">{capacityStatus.utilizationPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overbooking Activo:</span>
                    <Badge variant={capacityStatus.overbookingActive ? 'default' : 'secondary'}>
                      {capacityStatus.overbookingActive ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Puede Aceptar Overbooking:</span>
                    <Badge variant={capacityStatus.canAcceptOverbooking ? 'default' : 'destructive'}>
                      {capacityStatus.canAcceptOverbooking ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Evento Lleno:</span>
                    <Badge variant={capacityStatus.isFull ? 'destructive' : 'default'}>
                      {capacityStatus.isFull ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tipos de Acceso */}
          <TabsContent value="access-types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Capacidad por Tipo de Acceso</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Acceso</TableHead>
                      <TableHead>Capacidad</TableHead>
                      <TableHead>Disponible</TableHead>
                      <TableHead>Bloqueada</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Prioridad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {capacityStatus.accessTypesCapacity.map((accessType) => (
                      <TableRow key={accessType.accessTypeId}>
                        <TableCell className="font-medium">
                          Tipo {accessType.accessTypeId}
                        </TableCell>
                        <TableCell>{accessType.capacity}</TableCell>
                        <TableCell>{accessType.capacity - accessType.blockedCapacity}</TableCell>
                        <TableCell>{accessType.blockedCapacity}</TableCell>
                        <TableCell>{accessType.currency} {accessType.price.toFixed(2)}</TableCell>
                        <TableCell>{accessType.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bloqueos Activos */}
          <TabsContent value="locks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bloqueos de Capacidad Activos</CardTitle>
              </CardHeader>
              <CardContent>
                {activeLocks.length === 0 ? (
                  <div className="text-center py-8">
                    <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay bloqueos activos
                    </h3>
                    <p className="text-gray-600">
                      No hay reservas temporales de capacidad activas en este momento.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Expira</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeLocks.map((lock) => (
                        <TableRow key={lock.id}>
                          <TableCell>Usuario {lock.userId}</TableCell>
                          <TableCell>{lock.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={getLockStatusBadge(lock.status)}>
                              {lock.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(lock.expiresAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReleaseLock(lock.id!)}
                            >
                              Liberar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lista de Espera */}
          <TabsContent value="waitlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Espera</CardTitle>
              </CardHeader>
              <CardContent>
                {waitlist.length === 0 ? (
                  <div className="text-center py-8">
                    <FaList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Lista de espera vacía
                    </h3>
                    <p className="text-gray-600">
                      No hay usuarios en lista de espera para este evento.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Posición</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Registrado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitlist.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>Usuario {entry.userId}</TableCell>
                          <TableCell>{entry.position}</TableCell>
                          <TableCell>
                            <Badge variant={getWaitlistStatusBadge(entry.status)}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(entry.createdAt!)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromWaitlist(entry.id!)}
                            >
                              <FaTrash className="mr-2" />
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reglas */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Reglas de Capacidad
                  <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FaPlus className="mr-2" />
                        Nueva Regla
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Regla de Capacidad</DialogTitle>
                        <DialogDescription>
                          Configure una nueva regla para el control dinámico de capacidad.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="ruleName">Nombre de la Regla</Label>
                          <Input id="ruleName" placeholder="Ej: Descuento estudiantes" />
                        </div>
                        <div>
                          <Label htmlFor="ruleType">Tipo de Regla</Label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="GLOBAL">Global</option>
                            <option value="DATE_SPECIFIC">Por Fecha</option>
                            <option value="SESSION_SPECIFIC">Por Sesión</option>
                            <option value="ACCESS_TYPE_SPECIFIC">Por Tipo de Acceso</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="capacityLimit">Límite de Capacidad</Label>
                          <Input id="capacityLimit" type="number" placeholder="Opcional" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setRuleDialogOpen(false)}>
                          Crear Regla
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {capacityRules.length === 0 ? (
                  <div className="text-center py-8">
                    <FaCog className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay reglas configuradas
                    </h3>
                    <p className="text-gray-600">
                      Configure reglas para controlar dinámicamente la capacidad del evento.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Regla</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Límite</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capacityRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rule.type}</Badge>
                          </TableCell>
                          <TableCell>{rule.actions.capacityLimit || 'Sin límite'}</TableCell>
                          <TableCell>{rule.priority}</TableCell>
                          <TableCell>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                              {rule.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <FaEdit className="mr-2" />
                              Editar
                            </Button>
                          </TableCell>
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

export default AdminCapacityPage