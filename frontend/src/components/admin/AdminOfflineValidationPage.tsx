import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaDownload, FaSync, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaDatabase, FaWifi, FaClock, FaUser } from 'react-icons/fa'
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
  DownloadOfflineListResponse,
  ValidateOfflineQRResponse,
  SyncOfflineDataResponse,
} from '@/types/admin'

interface OfflineValidation {
  id: string
  qrHash: string
  participantId: number
  participantName: string
  timestamp: Date
  isValid: boolean
  synced: boolean
  deviceId: string
  batchId: string
}

const AdminOfflineValidationPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [offlineData, setOfflineData] = useState<DownloadOfflineListResponse | null>(null)
  const [validations, setValidations] = useState<OfflineValidation[]>([])
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'failed'>('idle')
  const [syncProgress, setSyncProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [deviceId] = useState(() => `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  // Descargar lista offline
  const downloadOfflineList = async () => {
    if (!selectedEvent) {
      setError('Seleccione un evento primero')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await adminQRService.downloadOfflineList({
        eventId: parseInt(selectedEvent),
        deviceId,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      })

      setOfflineData(response)

      // Simular validaciones offline (en producción vendrían de localStorage/indexedDB)
      const mockValidations: OfflineValidation[] = [
        {
          id: '1',
          qrHash: 'hash123',
          participantId: 1,
          participantName: 'Juan Pérez',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
          isValid: true,
          synced: false,
          deviceId,
          batchId: response.batchId,
        },
        {
          id: '2',
          qrHash: 'hash456',
          participantId: 2,
          participantName: 'María García',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min atrás
          isValid: true,
          synced: true,
          deviceId,
          batchId: response.batchId,
        },
      ]

      setValidations(mockValidations)

    } catch (err: any) {
      console.error('Error descargando lista offline:', err)
      setError('Error al descargar la lista offline')
    } finally {
      setLoading(false)
    }
  }

  // Validar QR offline
  const validateOfflineQR = async (qrHash: string): Promise<ValidateOfflineQRResponse> => {
    if (!offlineData) {
      setError('Descargue la lista offline primero')
      throw new Error('Lista offline no disponible')
    }

    try {
      const response = await adminQRService.validateOfflineQR({
        qrHash,
        batchId: offlineData.batchId,
        timestamp: new Date(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
        accessPoint: 'Punto Offline',
      })

      // Actualizar validación en la lista
      setValidations(prev => prev.map(v =>
        v.qrHash === qrHash
          ? { ...v, isValid: response.isValid, synced: false }
          : v
      ))

      return response
    } catch (err: any) {
      console.error('Error validando QR offline:', err)
      setError('Error al validar el código QR offline')
      throw err
    }
  }

  // Sincronizar datos offline
  const syncOfflineData = async () => {
    if (!offlineData || validations.length === 0) {
      setError('No hay datos para sincronizar')
      return
    }

    try {
      setSyncStatus('syncing')
      setSyncProgress(0)
      setError(null)

      // Simular progreso
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const unsyncedValidations = validations.filter(v => !v.synced)

      const response = await adminQRService.syncOfflineData({
        deviceId,
        batchId: offlineData.batchId,
        attendanceRecords: unsyncedValidations.map(v => ({
          qrHash: v.qrHash,
          participantId: v.participantId,
          timestamp: v.timestamp,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
          accessPoint: 'Punto Offline',
        })),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      })

      clearInterval(progressInterval)
      setSyncProgress(100)
      setSyncStatus('completed')

      // Marcar como sincronizados
      setValidations(prev => prev.map(v =>
        unsyncedValidations.some(uv => uv.id === v.id)
          ? { ...v, synced: true }
          : v
      ))

      // Mostrar resultados
      console.log('Sincronización completada:', response)

    } catch (err: any) {
      console.error('Error sincronizando datos:', err)
      setSyncStatus('failed')
      setError('Error al sincronizar los datos offline')
    }
  }

  // Agregar validación manual (simulación)
  const addManualValidation = () => {
    if (!offlineData) return

    const newValidation: OfflineValidation = {
      id: Date.now().toString(),
      qrHash: `hash${Math.random().toString(36).substr(2, 9)}`,
      participantId: Math.floor(Math.random() * 1000) + 1,
      participantName: `Participante ${Math.floor(Math.random() * 100) + 1}`,
      timestamp: new Date(),
      isValid: Math.random() > 0.2, // 80% válidos
      synced: false,
      deviceId,
      batchId: offlineData.batchId,
    }

    setValidations(prev => [newValidation, ...prev])
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Control QR', href: '/admin/control-qr' },
    { label: 'Validaciones Offline' },
  ]

  const syncedCount = validations.filter(v => v.synced).length
  const unsyncedCount = validations.filter(v => !v.synced).length
  const validCount = validations.filter(v => v.isValid).length
  const invalidCount = validations.filter(v => !v.isValid).length

  return (
    <AdminLayout title="Validaciones Offline" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Validaciones Offline</h1>
            <p className="text-gray-600 mt-1">
              Sistema de validaciones sin conexión a internet
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
                  Offline
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evento
                </label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Aquí irían los eventos disponibles */}
                    <SelectItem value="1">Evento Demo 1</SelectItem>
                    <SelectItem value="2">Evento Demo 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Dispositivo
                </label>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                    {deviceId}
                  </code>
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                onClick={downloadOfflineList}
                disabled={loading || !selectedEvent}
              >
                <FaDownload className="mr-2" />
                {loading ? 'Descargando...' : 'Descargar Lista Offline'}
              </Button>
              <Button
                variant="outline"
                onClick={addManualValidation}
                disabled={!offlineData}
              >
                <FaUser className="mr-2" />
                Agregar Validación Manual
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estado de sincronización */}
        {offlineData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FaDatabase className="mr-2" />
                  Estado de Sincronización
                </span>
                <Badge variant="outline">
                  Batch: {offlineData.batchId}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{validations.length}</p>
                  <p className="text-sm text-gray-600">Total Validaciones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{syncedCount}</p>
                  <p className="text-sm text-gray-600">Sincronizadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{unsyncedCount}</p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{validCount}/{validations.length}</p>
                  <p className="text-sm text-gray-600">Válidas</p>
                </div>
              </div>

              {syncStatus !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {syncStatus === 'syncing' && 'Sincronizando...'}
                      {syncStatus === 'completed' && 'Sincronización completada'}
                      {syncStatus === 'failed' && 'Error en sincronización'}
                    </span>
                    <span className="text-sm text-gray-500">{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="h-2" />
                </div>
              )}

              <div className="mt-4 flex justify-center">
                <Button
                  onClick={syncOfflineData}
                  disabled={syncStatus === 'syncing' || unsyncedCount === 0}
                  className="flex items-center"
                >
                  <FaSync className={`mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar Datos'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de validaciones */}
        {validations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Validaciones Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validations.map((validation) => (
                  <div key={validation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        validation.isValid ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {validation.participantName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {validation.participantId} • {formatDateTime(validation.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={validation.isValid ? "default" : "destructive"}>
                        {validation.isValid ? 'Válido' : 'Inválido'}
                      </Badge>
                      <Badge variant={validation.synced ? "secondary" : "outline"}>
                        {validation.synced ? 'Sincronizado' : 'Pendiente'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => validateOfflineQR(validation.qrHash)}
                        disabled={validation.synced}
                      >
                        <FaCheckCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del lote offline */}
        {offlineData && (
          <Card>
            <CardHeader>
              <CardTitle>Información del Lote Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">ID del Lote</p>
                  <p className="text-sm font-mono">{offlineData.batchId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Códigos QR</p>
                  <p className="text-lg font-semibold">{offlineData.qrCodes.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Generado</p>
                  <p className="text-sm">{formatDateTime(offlineData.generatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Expira en</p>
                  <p className="text-sm">{Math.floor(offlineData.expiresIn / 3600)} horas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

export default AdminOfflineValidationPage