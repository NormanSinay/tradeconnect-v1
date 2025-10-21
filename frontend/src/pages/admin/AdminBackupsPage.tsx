import React, { useState, useEffect } from 'react'
import { FaDatabase, FaSave, FaTimes, FaDownload, FaUpload, FaClock, FaCheck, FaExclamationTriangle, FaPlay, FaCog } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { adminSystemService } from '@/services/admin'
import type { BackupConfig, SystemExportResult, SystemImportResult } from '@/types/admin'

interface BackupRecord {
  id: string
  type: 'manual' | 'scheduled'
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  size?: number
  fileUrl?: string
  errorMessage?: string
}

const AdminBackupsPage: React.FC = () => {
  const [config, setConfig] = useState<BackupConfig | null>(null)
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRunningBackup, setIsRunningBackup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('config')

  // Cargar configuración y backups
  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: Implementar endpoints para configuración de backups y lista de backups
      // const configData = await adminSystemService.getBackupConfig()
      // const backupsData = await adminSystemService.getBackups()

      // Configuración por defecto
      const defaultConfig: BackupConfig = {
        enabled: true,
        schedule: 'daily',
        retention: 30,
        storage: {
          provider: 'local',
          path: '/backups',
        },
        encryption: {
          enabled: true,
        },
        notifications: {
          onSuccess: true,
          onFailure: true,
          emailRecipients: ['admin@tradeconnect.gt'],
        },
      }

      // Backups de ejemplo
      const sampleBackups: BackupRecord[] = [
        {
          id: 'backup-001',
          type: 'scheduled',
          status: 'completed',
          createdAt: new Date('2023-12-01T02:00:00'),
          completedAt: new Date('2023-12-01T02:15:00'),
          size: 1024000000, // 1GB
          fileUrl: '/backups/backup-2023-12-01.zip',
        },
        {
          id: 'backup-002',
          type: 'manual',
          status: 'completed',
          createdAt: new Date('2023-11-28T14:30:00'),
          completedAt: new Date('2023-11-28T14:45:00'),
          size: 950000000, // 950MB
          fileUrl: '/backups/backup-2023-11-28.zip',
        },
      ]

      setConfig(defaultConfig)
      setBackups(sampleBackups)
    } catch (err: any) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar la configuración de backups')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuración de backups
  const handleSaveBackupConfig = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      // TODO: Implementar endpoint para guardar configuración de backups
      // await adminSystemService.updateBackupConfig(config)

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess('Configuración de backups guardada exitosamente')

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error guardando configuración de backups:', err)
      setError(err.message || 'Error al guardar la configuración de backups')
    } finally {
      setIsSaving(false)
    }
  }

  // Ejecutar backup manual
  const handleRunBackup = async () => {
    try {
      setIsRunningBackup(true)
      setError(null)

      // TODO: Implementar endpoint para ejecutar backup
      // await adminSystemService.executeBackup()

      // Simular ejecución
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Agregar nuevo backup a la lista
      const newBackup: BackupRecord = {
        id: `backup-${Date.now()}`,
        type: 'manual',
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
        size: Math.floor(Math.random() * 500000000) + 500000000, // 500MB - 1GB
        fileUrl: `/backups/backup-${new Date().toISOString().split('T')[0]}.zip`,
      }

      setBackups(prev => [newBackup, ...prev])
      setSuccess('Backup completado exitosamente')
    } catch (err: any) {
      console.error('Error ejecutando backup:', err)
      setError('Error al ejecutar el backup')
    } finally {
      setIsRunningBackup(false)
    }
  }

  // Actualizar configuración
  const updateConfig = (field: string, value: any) => {
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      [field]: value,
    }))
  }

  // Actualizar configuración anidada
  const updateNestedConfig = (section: string, field: string, value: any) => {
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...(prev as any)[section],
        [field]: value,
      },
    }))
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      running: { label: 'Ejecutándose', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completado', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    )
  }

  useEffect(() => {
    loadData()
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Sistema', href: '/admin/sistema' },
    { label: 'Backups' },
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Gestión de Backups" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!config) {
    return (
      <AdminLayout title="Gestión de Backups" breadcrumbs={breadcrumbs}>
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
    <AdminLayout title="Gestión de Backups" breadcrumbs={breadcrumbs}>
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

        {/* Configuración por pestañas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaDatabase className="h-5 w-5" />
              Gestión de Backups del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="config">Configuración</TabsTrigger>
                <TabsTrigger value="backups">Backups</TabsTrigger>
                <TabsTrigger value="restore">Restauración</TabsTrigger>
              </TabsList>

              {/* Configuración */}
              <TabsContent value="config" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FaClock className="h-4 w-4" />
                        Programación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="backupsEnabled">Backups Automáticos</Label>
                          <p className="text-xs text-gray-500">Habilitar backups programados</p>
                        </div>
                        <Switch
                          id="backupsEnabled"
                          checked={config.enabled}
                          onCheckedChange={(checked) => updateConfig('enabled', checked)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="schedule">Frecuencia</Label>
                        <Select
                          value={config.schedule}
                          onValueChange={(value) => updateConfig('schedule', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diario</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="retention">Retención (días)</Label>
                        <Input
                          id="retention"
                          type="number"
                          min="1"
                          max="365"
                          value={config.retention}
                          onChange={(e) => updateConfig('retention', parseInt(e.target.value))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Días que se conservan los backups antes de eliminarlos
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FaSave className="h-4 w-4" />
                        Almacenamiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="provider">Proveedor de Almacenamiento</Label>
                        <Select
                          value={config.storage.provider}
                          onValueChange={(value) => updateNestedConfig('storage', 'provider', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="s3">Amazon S3</SelectItem>
                            <SelectItem value="azure">Azure Blob Storage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="path">Ruta de Almacenamiento</Label>
                        <Input
                          id="path"
                          value={config.storage.path || ''}
                          onChange={(e) => updateNestedConfig('storage', 'path', e.target.value)}
                          placeholder="/backups"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="encryptionEnabled">Encriptación</Label>
                          <p className="text-xs text-gray-500">Encriptar archivos de backup</p>
                        </div>
                        <Switch
                          id="encryptionEnabled"
                          checked={config.encryption.enabled}
                          onCheckedChange={(checked) => updateNestedConfig('encryption', 'enabled', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notificaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifySuccess">Notificar Éxito</Label>
                          <p className="text-xs text-gray-500">Enviar notificación cuando el backup sea exitoso</p>
                        </div>
                        <Switch
                          id="notifySuccess"
                          checked={config.notifications.onSuccess}
                          onCheckedChange={(checked) => updateNestedConfig('notifications', 'onSuccess', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifyFailure">Notificar Fallo</Label>
                          <p className="text-xs text-gray-500">Enviar notificación cuando el backup falle</p>
                        </div>
                        <Switch
                          id="notifyFailure"
                          checked={config.notifications.onFailure}
                          onCheckedChange={(checked) => updateNestedConfig('notifications', 'onFailure', checked)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="emailRecipients">Destinatarios de Email</Label>
                      <Input
                        id="emailRecipients"
                        value={config.notifications.emailRecipients.join(', ')}
                        onChange={(e) => updateNestedConfig('notifications', 'emailRecipients', e.target.value.split(',').map(email => email.trim()))}
                        placeholder="admin@ejemplo.com, soporte@ejemplo.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separar múltiples emails con comas
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center">
                  <Button
                    onClick={handleRunBackup}
                    disabled={isRunningBackup}
                    className="flex items-center gap-2"
                  >
                    <FaPlay className="h-4 w-4" />
                    {isRunningBackup ? 'Ejecutando Backup...' : 'Ejecutar Backup Ahora'}
                  </Button>

                  <Button
                    onClick={handleSaveBackupConfig}
                    disabled={isSaving}
                  >
                    <FaSave className="h-4 w-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </div>
              </TabsContent>

              {/* Lista de Backups */}
              <TabsContent value="backups" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FaDatabase className="h-5 w-5" />
                      Historial de Backups ({backups.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha de Creación</TableHead>
                          <TableHead>Tamaño</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backups.map((backup) => (
                          <TableRow key={backup.id}>
                            <TableCell>
                              <Badge variant={backup.type === 'manual' ? 'default' : 'secondary'}>
                                {backup.type === 'manual' ? 'Manual' : 'Programado'}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(backup.status)}</TableCell>
                            <TableCell>{formatDate(backup.createdAt)}</TableCell>
                            <TableCell>
                              {backup.size ? formatFileSize(backup.size) : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {backup.fileUrl && backup.status === 'completed' && (
                                  <Button variant="outline" size="sm">
                                    <FaDownload className="h-4 w-4 mr-1" />
                                    Descargar
                                  </Button>
                                )}
                                {backup.errorMessage && (
                                  <Button variant="ghost" size="sm">
                                    <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Restauración */}
              <TabsContent value="restore" className="space-y-6">
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <FaExclamationTriangle className="h-6 w-6 text-yellow-500 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-medium text-yellow-800 mb-2">
                          Restauración de Datos
                        </h3>
                        <p className="text-yellow-700 mb-4">
                          La restauración de datos es una operación crítica que puede afectar el funcionamiento del sistema.
                          Asegúrese de tener un backup reciente antes de proceder.
                        </p>
                        <div className="bg-yellow-100 p-3 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Advertencia:</strong> Esta operación sobrescribirá los datos actuales del sistema.
                            Se recomienda hacer una copia de seguridad adicional antes de restaurar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subir Archivo de Backup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="backupFile">Archivo de Backup</Label>
                      <Input
                        id="backupFile"
                        type="file"
                        accept=".zip,.tar.gz,.sql"
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos soportados: .zip, .tar.gz, .sql
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="confirmRestore" className="rounded" />
                      <Label htmlFor="confirmRestore" className="text-sm">
                        Confirmo que he hecho un backup de los datos actuales y entiendo los riesgos
                      </Label>
                    </div>

                    <Button variant="destructive" disabled>
                      <FaUpload className="h-4 w-4 mr-2" />
                      Restaurar Datos (Próximamente)
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminBackupsPage