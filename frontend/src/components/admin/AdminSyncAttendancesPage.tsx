import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaSync, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaClock, FaDatabase, FaCloudUploadAlt, FaCloudDownloadAlt, FaWifi } from 'react-icons/fa'
import { FiWifiOff } from 'react-icons/fi'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminQRService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  SyncOfflineDataResponse,
} from '@/types/admin'

interface SyncJob {
  id: string
  deviceId: string
  batchId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  totalRecords: number
  processedRecords: number
  failedRecords: number
  startedAt: Date
  completedAt?: Date
  error?: string
}

interface SyncStats {
  totalDevices: number
  activeSyncs: number
  completedToday: number
  failedToday: number
  totalRecordsSynced: number
  lastSyncTime?: Date
}

const AdminSyncAttendancesPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([])
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [globalSyncStatus, setGlobalSyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle')

  // Cargar datos iniciales
  useEffect(() => {
    loadSyncData()
    // Actualizar cada 30 segundos
    const interval = setInterval(loadSyncData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSyncData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simular carga de trabajos de sincronización
      const mockJobs: SyncJob[] = [
        {
          id: '1',
          deviceId: 'device-123',
          batchId: 'batch-456',
          status: 'completed',
          progress: 100,
          totalRecords: 150,
          processedRecords: 145,
          failedRecords: 5,
          startedAt: new Date(Date.now() - 1000 * 60 * 30),
          completedAt: new Date(Date.now() - 1000 * 60 * 25),
        },
        {
          id: '2',
          deviceId: 'device-789',
          batchId: 'batch-101',
          status: 'processing',
          progress: 65,
          totalRecords: 200,
          processedRecords: 130,
          failedRecords: 0,
          startedAt: new Date(Date.now() - 1000 * 60 * 15),
        },
        {
          id: '3',
          deviceId: 'device-999',
          batchId: 'batch-202',
          status: 'failed',
          progress: 0,
          totalRecords: 100,
          processedRecords: 0,
          failedRecords: 100,
          startedAt: new Date(Date.now() - 1000 * 60 * 60),
          error: 'Error de conexión',
        },
      ]

      const mockStats: SyncStats = {
        totalDevices: 15,
        activeSyncs: 3,
        completedToday: 12,
        failedToday: 1,
        totalRecordsSynced: 2450,
        lastSyncTime: new Date(Date.now() - 1000 * 60 * 5),
      }

      setSyncJobs(mockJobs)
      setSyncStats(mockStats)

    } catch (err: any) {
      console.error('Error cargando datos de sincronización:', err)
      setError('Error al cargar los datos de sincronización')
    } finally {
      setLoading(false)
    }
  }

  // Iniciar sincronización global
  const startGlobalSync = async () => {
    try {
      setGlobalSyncStatus('syncing')
      setError(null)

      // Simular sincronización de todos los dispositivos pendientes
      const pendingJobs = syncJobs.filter(job => job.status === 'pending')

      for (const job of pendingJobs) {
        await syncDeviceData(job.deviceId, job.batchId)
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      setGlobalSyncStatus('completed')
      await loadSyncData() // Recargar datos

    } catch (err: any) {
      console.error('Error en sincronización global:', err)
      setGlobalSyncStatus('idle')
      setError('Error en la sincronización global')
    }
  }

  // Sincronizar datos de un dispositivo específico
  const syncDeviceData = async (deviceId: string, batchId: string) => {
    try {
      // En producción, aquí se llamarían los servicios reales
      // Por ahora simulamos la sincronización
      console.log(`Sincronizando dispositivo ${deviceId}, batch ${batchId}`)

      // Actualizar estado del job
      setSyncJobs(prev => prev.map(job =>
        job.deviceId === deviceId && job.batchId === batchId
          ? { ...job, status: 'processing' as const, progress: 50 }
          : job
      ))

      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Marcar como completado
      setSyncJobs(prev => prev.map(job =>
        job.deviceId === deviceId && job.batchId === batchId
          ? {
              ...job,
              status: 'completed' as const,
              progress: 100,
              processedRecords: job.totalRecords,
              completedAt: new Date()
            }
          : job
      ))

    } catch (err: any) {
      console.error(`Error sincronizando dispositivo ${deviceId}:`, err)
      setSyncJobs(prev => prev.map(job =>
        job.deviceId === deviceId && job.batchId === batchId
          ? { ...job, status: 'failed' as const, error: err.message }
          : job
      ))
      throw err
    }
  }

  // Reintentar sincronización fallida
  const retrySync = async (job: SyncJob) => {
    await syncDeviceData(job.deviceId, job.batchId)
  }

  // Obtener estado de sincronización de un dispositivo
  const getDeviceSyncStatus = async (deviceId: string, batchId?: string) => {
    try {
      const status = await adminQRService.getOfflineSyncStatus(deviceId, batchId)
      console.log('Estado de sincronización:', status)
      return status
    } catch (err) {
      console.error('Error obteniendo estado de sincronización:', err)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Control QR', href: '/admin/control-qr' },
    { label: 'Sincronización' },
  ]

  const activeJobs = syncJobs.filter(job => job.status === 'processing')
  const completedJobs = syncJobs.filter(job => job.status === 'completed')
  const failedJobs = syncJobs.filter(job => job.status === 'failed')

  return (
    <AdminLayout title="Sincronización de Asistencias" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sincronización de Asistencias</h1>
            <p className="text-gray-600 mt-1">
              Gestión y monitoreo de la sincronización de datos offline
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center">
              {navigator.onLine ? (
                <>
                  <FaWifi className="mr-1 text-green-500" />
                  Online
                </>
              ) : (
                <>
                  <FiWifiOff className="mr-1 text-red-500" />
                  {/* TODO: Import FaWifiSlash from react-icons/fa */}
                  Offline
                </>
              )}
            </Badge>
            <Button
              onClick={loadSyncData}
              variant="outline"
            >
              <FaSync className="mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Estadísticas generales */}
        {syncStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dispositivos Totales</p>
                    <p className="text-3xl font-bold text-blue-600">{syncStats.totalDevices}</p>
                  </div>
                  <FaDatabase className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sincronizaciones Activas</p>
                    <p className="text-3xl font-bold text-orange-600">{syncStats.activeSyncs}</p>
                  </div>
                  <FaSync className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completadas Hoy</p>
                    <p className="text-3xl font-bold text-green-600">{syncStats.completedToday}</p>
                  </div>
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Registros Sincronizados</p>
                    <p className="text-3xl font-bold text-purple-600">{syncStats.totalRecordsSynced.toLocaleString()}</p>
                  </div>
                  <FaCloudUploadAlt className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controles de sincronización */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Sincronización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dispositivo
                  </label>
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todos los dispositivos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los dispositivos</SelectItem>
                      {syncJobs.map(job => (
                        <SelectItem key={job.deviceId} value={job.deviceId}>
                          {job.deviceId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lote
                  </label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todos los lotes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los lotes</SelectItem>
                      {syncJobs.map(job => (
                        <SelectItem key={job.batchId} value={job.batchId}>
                          {job.batchId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={startGlobalSync}
                disabled={globalSyncStatus === 'syncing' || activeJobs.length === 0}
                className="flex items-center"
              >
                <FaSync className={`mr-2 ${globalSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                {globalSyncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronización Global'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trabajos de sincronización */}
        <Card>
          <CardHeader>
            <CardTitle>Trabajos de Sincronización</CardTitle>
          </CardHeader>
          <CardContent>
            {syncJobs.length === 0 ? (
              <div className="text-center py-8">
                <FaDatabase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay trabajos de sincronización
                </h3>
                <p className="text-gray-600">
                  Los trabajos de sincronización aparecerán aquí cuando los dispositivos offline se conecten.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {syncJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'processing' ? 'secondary' :
                          job.status === 'failed' ? 'destructive' : 'outline'
                        }>
                          {job.status === 'completed' && <FaCheckCircle className="mr-1" />}
                          {job.status === 'processing' && <FaSync className="mr-1 animate-spin" />}
                          {job.status === 'failed' && <FaTimesCircle className="mr-1" />}
                          {job.status === 'pending' && <FaClock className="mr-1" />}
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                        <span className="text-sm font-medium">Dispositivo: {job.deviceId}</span>
                        <span className="text-sm text-gray-500">Lote: {job.batchId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retrySync(job)}
                          >
                            Reintentar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => getDeviceSyncStatus(job.deviceId, job.batchId)}
                        >
                          <FaCloudDownloadAlt className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Total Registros</p>
                        <p className="text-sm font-semibold">{job.totalRecords}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Procesados</p>
                        <p className="text-sm font-semibold text-green-600">{job.processedRecords}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Fallidos</p>
                        <p className="text-sm font-semibold text-red-600">{job.failedRecords}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Progreso</p>
                        <p className="text-sm font-semibold">{job.progress}%</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Progress value={job.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Inicio: {formatDateTime(job.startedAt)}</span>
                      {job.completedAt && (
                        <span>Fin: {formatDateTime(job.completedAt)}</span>
                      )}
                    </div>

                    {job.error && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        <FaExclamationTriangle className="inline mr-1" />
                        {job.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen por estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{completedJobs.length}</p>
              <p className="text-sm text-gray-600 mt-1">
                Trabajos finalizados exitosamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-800">En Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{activeJobs.length}</p>
              <p className="text-sm text-gray-600 mt-1">
                Trabajos actualmente procesándose
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-800">Fallidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{failedJobs.length}</p>
              <p className="text-sm text-gray-600 mt-1">
                Trabajos con errores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminSyncAttendancesPage