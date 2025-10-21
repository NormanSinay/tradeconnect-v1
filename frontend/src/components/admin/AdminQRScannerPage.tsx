import React, { useState, useEffect, useRef } from 'react'
import { FaArrowLeft, FaCamera, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaQrcode, FaUser, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminQRService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  ValidateQRResponse,
  MarkAttendanceRequest,
  CreateAccessLogRequest,
} from '@/types/admin'

const AdminQRScannerPage: React.FC = () => {
  const [scanning, setScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [lastScan, setLastScan] = useState<ValidateQRResponse | null>(null)
  const [scanHistory, setScanHistory] = useState<ValidateQRResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string>('')
  const [accessPoint, setAccessPoint] = useState<string>('')
  const [manualQR, setManualQR] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Inicializar cámara
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error('Error accediendo a la cámara:', err)
      setError('No se pudo acceder a la cámara. Verifique los permisos.')
    }
  }

  // Detener cámara
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  // Procesar código QR desde imagen
  const processQRFromImage = async (imageData: ImageData) => {
    // Aquí iría la lógica de procesamiento de QR
    // Por ahora simulamos un procesamiento
    return null
  }

  // Capturar frame de la cámara
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      return imageData
    }
    return null
  }

  // Escanear QR automáticamente
  const scanQR = async () => {
    if (!cameraActive || !eventId) return

    try {
      const imageData = captureFrame()
      if (imageData) {
        const qrCode = await processQRFromImage(imageData)
        if (qrCode) {
          await validateQR(qrCode)
        }
      }
    } catch (err) {
      console.error('Error escaneando QR:', err)
    }
  }

  // Validar código QR
  const validateQR = async (qrHash: string) => {
    if (!eventId) {
      setError('Seleccione un evento primero')
      return
    }

    try {
      setScanning(true)
      setError(null)

      const response = await adminQRService.validateQR({
        qrHash,
        eventId: parseInt(eventId),
        accessPoint: accessPoint || undefined,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
        location: await getCurrentLocation(),
      })

      setLastScan(response)
      setScanHistory(prev => [response, ...prev.slice(0, 9)]) // Mantener últimos 10

      // Crear log de acceso
      await createAccessLog(response, qrHash)

      // Si es válido y no se registró asistencia automáticamente, marcarla
      if (response.isValid && !response.attendanceRecorded && response.participantId) {
        await markAttendance(response.participantId, qrHash)
      }

    } catch (err: any) {
      console.error('Error validando QR:', err)
      setError('Error al validar el código QR')
      setLastScan({
        isValid: false,
        status: 'EXPIRED',
        message: 'Error de validación',
        failureReason: err.message || 'Error desconocido',
      } as ValidateQRResponse)
    } finally {
      setScanning(false)
    }
  }

  // Obtener ubicación actual
  const getCurrentLocation = (): Promise<any> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            })
          },
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 5000 }
        )
      } else {
        resolve(null)
      }
    })
  }

  // Marcar asistencia
  const markAttendance = async (participantId: number, qrHash: string) => {
    try {
      await adminQRService.markAttendance({
        eventId: parseInt(eventId),
        userId: participantId,
        method: 'qr_scan',
        accessPoint,
        qrCodeId: parseInt(qrHash) || undefined,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
        ipAddress: '', // Se obtiene del backend
        location: await getCurrentLocation(),
      })
    } catch (err) {
      console.error('Error marcando asistencia:', err)
    }
  }

  // Crear log de acceso
  const createAccessLog = async (response: ValidateQRResponse, qrHash: string) => {
    try {
      await adminQRService.createAccessLog({
        eventId: parseInt(eventId),
        userId: response.participantId || undefined,
        qrCodeId: parseInt(qrHash) || undefined,
        accessType: 'VALIDATION',
        result: response.isValid ? 'SUCCESS' : 'FAILURE',
        failureReason: response.failureReason,
        scannedBy: 1, // ID del usuario actual (admin)
        accessPoint,
        ipAddress: '', // Se obtiene del backend
        userAgent: navigator.userAgent,
        deviceInfo: {
          platform: navigator.platform,
          language: navigator.language,
        },
        location: await getCurrentLocation(),
      })
    } catch (err) {
      console.error('Error creando log de acceso:', err)
    }
  }

  // Escaneo manual
  const handleManualScan = () => {
    if (manualQR.trim()) {
      validateQR(manualQR.trim())
      setManualQR('')
    }
  }

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Escaneo automático cuando la cámara está activa
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (cameraActive && scanning) {
      interval = setInterval(scanQR, 1000) // Escanear cada segundo
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [cameraActive, scanning, eventId])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Control QR', href: '/admin/control-qr' },
    { label: 'Escáner QR' },
  ]

  return (
    <AdminLayout title="Escáner QR" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Escáner QR en Vivo</h1>
            <p className="text-gray-600 mt-1">
              Escanee códigos QR para validar asistencia en tiempo real
            </p>
          </div>
        </div>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Escáner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event">Evento</Label>
                <Select value={eventId} onValueChange={setEventId}>
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
                <Label htmlFor="accessPoint">Punto de Acceso</Label>
                <Input
                  id="accessPoint"
                  value={accessPoint}
                  onChange={(e) => setAccessPoint(e.target.value)}
                  placeholder="Ej: Entrada Principal"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escáner de Cámara */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FaCamera className="mr-2" />
                  Cámara
                </span>
                <div className="flex space-x-2">
                  {!cameraActive ? (
                    <Button onClick={startCamera} disabled={!eventId}>
                      <FaCamera className="mr-2" />
                      Iniciar Cámara
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={stopCamera}>
                      <FaTimesCircle className="mr-2" />
                      Detener
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-64 bg-gray-100 rounded-lg ${cameraActive ? '' : 'hidden'}`}
                />
                <canvas ref={canvasRef} className="hidden" />
                {!cameraActive && (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FaCamera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">Cámara inactiva</p>
                      <p className="text-sm text-gray-500">Presione "Iniciar Cámara" para comenzar</p>
                    </div>
                  </div>
                )}
              </div>

              {cameraActive && (
                <div className="mt-4 flex items-center justify-center">
                  <Badge variant={scanning ? "default" : "secondary"}>
                    {scanning ? 'Escaneando...' : 'Esperando código QR'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Escaneo Manual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaQrcode className="mr-2" />
                Escaneo Manual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manualQR">Código QR</Label>
                  <Input
                    id="manualQR"
                    value={manualQR}
                    onChange={(e) => setManualQR(e.target.value)}
                    placeholder="Ingrese el código QR manualmente"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                  />
                </div>
                <Button
                  onClick={handleManualScan}
                  disabled={!manualQR.trim() || !eventId}
                  className="w-full"
                >
                  <FaQrcode className="mr-2" />
                  Validar Código
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultado del último escaneo */}
        {lastScan && (
          <Card className={`border-2 ${
            lastScan.isValid
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${
                lastScan.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {lastScan.isValid ? (
                  <FaCheckCircle className="mr-2" />
                ) : (
                  <FaTimesCircle className="mr-2" />
                )}
                Último Escaneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado</p>
                  <Badge variant={lastScan.isValid ? "default" : "destructive"}>
                    {lastScan.isValid ? 'VÁLIDO' : 'INVÁLIDO'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Mensaje</p>
                  <p className="text-sm">{lastScan.message}</p>
                </div>
                {lastScan.participantId && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Participante ID</p>
                    <p className="text-sm font-mono">{lastScan.participantId}</p>
                  </div>
                )}
                {lastScan.failureReason && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Razón del fallo</p>
                    <p className="text-sm text-red-600">{lastScan.failureReason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de escaneos */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Escaneos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanHistory.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {scan.isValid ? (
                        <FaCheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <FaTimesCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {scan.participantId ? `Participante ${scan.participantId}` : 'Código desconocido'}
                        </p>
                        <p className="text-xs text-gray-500">{scan.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDateTime(new Date())}
                      </p>
                      <Badge variant={scan.isValid ? "default" : "destructive"} className="text-xs">
                        {scan.status}
                      </Badge>
                    </div>
                  </div>
                ))}
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

export default AdminQRScannerPage