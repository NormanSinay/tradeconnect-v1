import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaQrcode, FaDownload, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface QRCodeData {
  id: string
  registrationId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  qrCode: string
  status: 'active' | 'used' | 'expired' | 'cancelled'
  usedAt?: string
  createdAt: string
  expiresAt: string
}

export const QRCodeDownloadPage: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (registrationId) {
      fetchQRCodeData()
    }
  }, [registrationId])

  const fetchQRCodeData = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get(`/user/registrations/${registrationId}/qr`)

      // Mock QR data
      const mockData: QRCodeData = {
        id: 'qr-1',
        registrationId: registrationId || 'reg-1',
        eventTitle: 'Conferencia Anual de Innovación Tecnológica',
        eventDate: '2024-01-25',
        eventTime: '09:00',
        qrCode: 'QR123456789',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-25T18:00:00Z'
      }

      setQrData(mockData)
    } catch (error) {
      console.error('Error fetching QR code data:', error)
      showToast.error('Error al cargar los datos del código QR')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQRCode = async () => {
    if (!qrData) return

    try {
      setIsDownloading(true)

      // Create QR code image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 300
        canvas.height = 400

        // Background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 300, 400)

        // Title
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Código QR de Acceso', 150, 30)

        // Event info
        ctx.font = '12px Arial'
        ctx.fillText(qrData.eventTitle, 150, 55)
        ctx.fillText(`Fecha: ${new Date(qrData.eventDate).toLocaleDateString('es-GT')}`, 150, 75)
        ctx.fillText(`Hora: ${qrData.eventTime}`, 150, 90)

        // QR Code placeholder (simple pattern)
        ctx.fillStyle = '#000000'
        const qrSize = 150
        const qrX = (300 - qrSize) / 2
        const qrY = 110

        // Simple QR pattern (in a real app, use a QR library)
        for (let i = 0; i < 20; i++) {
          for (let j = 0; j < 20; j++) {
            if (Math.random() > 0.5) {
              ctx.fillRect(qrX + i * 7.5, qrY + j * 7.5, 7.5, 7.5)
            }
          }
        }

        // QR Code text
        ctx.font = 'bold 14px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(qrData.qrCode, 150, qrY + qrSize + 25)

        // Footer
        ctx.font = '10px Arial'
        ctx.fillText('Presenta este código en la entrada', 150, qrY + qrSize + 50)
        ctx.fillText(`Válido hasta: ${new Date(qrData.expiresAt).toLocaleDateString('es-GT')}`, 150, qrY + qrSize + 65)

        // Download
        const link = document.createElement('a')
        link.download = `qr-${qrData.registrationId}.png`
        link.href = canvas.toDataURL()
        link.click()
      }

      showToast.success('Código QR descargado exitosamente')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      showToast.error('Error al descargar el código QR')
    } finally {
      setIsDownloading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><FaCheckCircle className="mr-1 h-3 w-3" />Activo</Badge>
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800"><FaCheckCircle className="mr-1 h-3 w-3" />Usado</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expirado</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!qrData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Código QR no encontrado</h2>
          <p className="mt-2 text-sm text-gray-600">
            No se pudo encontrar el código QR para esta inscripción.
          </p>
          <Button onClick={() => navigate('/mis-inscripciones')} className="mt-4">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis inscripciones
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/mis-inscripciones')}
            className="mb-4"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis inscripciones
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Descargar Código QR</h1>
          <p className="text-gray-600 mt-1">
            Descarga tu código QR para acceso offline al evento
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <FaQrcode className="mr-2 h-5 w-5" />
                  Código QR de Acceso
                </CardTitle>
                <CardDescription>
                  {qrData.eventTitle}
                </CardDescription>
              </div>
              {getStatusBadge(qrData.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Preview */}
            <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
                {qrData.qrCode}
              </div>
              <p className="text-sm text-gray-600">
                Este es tu código QR único para el evento
              </p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha del evento</label>
                <p className="text-lg font-semibold">
                  {new Date(qrData.eventDate).toLocaleDateString('es-GT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hora del evento</label>
                <p className="text-lg font-semibold">{qrData.eventTime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Código QR</label>
                <p className="text-lg font-mono font-semibold">{qrData.qrCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Expira</label>
                <p className="text-lg font-semibold">
                  {new Date(qrData.expiresAt).toLocaleDateString('es-GT')}
                </p>
              </div>
            </div>

            {qrData.usedAt && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <FaCheckCircle className="inline mr-2" />
                  Este código QR fue utilizado el {new Date(qrData.usedAt).toLocaleDateString('es-GT')}
                  a las {new Date(qrData.usedAt).toLocaleTimeString('es-GT')}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Instrucciones</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Descarga el código QR haciendo clic en el botón abajo</li>
                <li>• Imprime el código o guárdalo en tu teléfono</li>
                <li>• Presenta el código QR en la entrada del evento</li>
                <li>• Asegúrate de que el código sea legible</li>
              </ul>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
              <Button
                onClick={downloadQRCode}
                disabled={isDownloading || qrData.status !== 'active'}
                size="lg"
                className="px-8"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Descargando...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2 h-5 w-5" />
                    Descargar Código QR
                  </>
                )}
              </Button>
            </div>

            {qrData.status !== 'active' && (
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <FaExclamationTriangle className="inline mr-2 h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Este código QR no está activo y no puede ser descargado.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}