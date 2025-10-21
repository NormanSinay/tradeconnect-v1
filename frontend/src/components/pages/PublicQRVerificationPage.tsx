import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaCertificate, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaShare, FaDownload } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'

interface QRVerificationData {
  id: string
  qrCode: string
  participantName: string
  participantEmail: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  checkInTime?: string
  status: 'valid' | 'used' | 'expired' | 'invalid'
  certificateUrl?: string
  verificationUrl: string
}

export const PublicQRVerificationPage: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>()
  const [qrData, setQrData] = useState<QRVerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (codigo) {
      verifyQRCode()
    }
  }, [codigo])

  const verifyQRCode = async () => {
    if (!codigo) {
      setError('Código QR no proporcionado')
      return
    }

    try {
      setLoading(true)
      setError('')

      // In a real app, you would call your API
      // const response = await api.get(`/qr/verify/${codigo}`)

      // Mock verification logic
      const mockQRCodes: Record<string, QRVerificationData> = {
        'QR-2024-001': {
          id: '1',
          qrCode: 'QR-2024-001',
          participantName: 'María González López',
          participantEmail: 'maria.gonzalez@email.com',
          eventTitle: 'Conferencia Anual de Innovación Tecnológica',
          eventDate: '2024-02-15',
          eventLocation: 'Centro de Convenciones, Ciudad de Guatemala',
          checkInTime: '2024-02-15T09:15:00Z',
          status: 'valid',
          certificateUrl: '/certificado/123',
          verificationUrl: 'https://tradeconnect.gt/verificacion-publica/QR-2024-001'
        },
        'QR-2024-002': {
          id: '2',
          qrCode: 'QR-2024-002',
          participantName: 'José Martínez Ruiz',
          participantEmail: 'jose.martinez@email.com',
          eventTitle: 'Taller de Liderazgo Empresarial',
          eventDate: '2024-03-20',
          eventLocation: 'Hotel Marriott, Zona 10',
          checkInTime: '2024-03-20T08:45:00Z',
          status: 'used',
          certificateUrl: '/certificado/456',
          verificationUrl: 'https://tradeconnect.gt/verificacion-publica/QR-2024-002'
        },
        'QR-2024-003': {
          id: '3',
          qrCode: 'QR-2024-003',
          participantName: 'Ana López García',
          participantEmail: 'ana.lopez@email.com',
          eventTitle: 'Seminario de Marketing Digital',
          eventDate: '2024-01-10',
          eventLocation: 'Centro Empresarial, Zona 4',
          status: 'expired',
          verificationUrl: 'https://tradeconnect.gt/verificacion-publica/QR-2024-003'
        }
      }

      const foundQR = mockQRCodes[codigo.toUpperCase()]

      if (!foundQR) {
        setError('Código QR no encontrado o inválido. Verifica el código e intenta nuevamente.')
        return
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setQrData(foundQR)
    } catch (err) {
      console.error('Error verifying QR code:', err)
      setError('Error al verificar el código QR. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Válido - Check-in Pendiente</Badge>
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800">Usado - Check-in Completado</Badge>
      case 'expired':
        return <Badge className="bg-yellow-100 text-yellow-800">Expirado</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Inválido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <FaCheckCircle className="h-12 w-12 text-green-500" />
      case 'used':
        return <FaCheckCircle className="h-12 w-12 text-blue-500" />
      case 'expired':
        return <FaTimesCircle className="h-12 w-12 text-yellow-500" />
      default:
        return <FaTimesCircle className="h-12 w-12 text-red-500" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Este código QR es válido y puede ser usado para check-in en el evento.'
      case 'used':
        return 'Este código QR ya fue utilizado para check-in. El participante ya está registrado en el evento.'
      case 'expired':
        return 'Este código QR ha expirado. El evento ya concluyó o el período de validez terminó.'
      default:
        return 'Este código QR es inválido o no existe en nuestro sistema.'
    }
  }

  const shareVerification = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Verificación QR TradeConnect',
        text: `Verificación del código QR: ${qrData?.qrCode}`,
        url: qrData?.verificationUrl
      })
    } else {
      navigator.clipboard.writeText(qrData?.verificationUrl || '')
      alert('Enlace copiado al portapapeles')
    }
  }

  const downloadCertificate = () => {
    if (qrData?.certificateUrl) {
      // In a real app, this would download the certificate
      alert('Descargando certificado...')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando código QR...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <FaTimesCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error de Verificación</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.history.back()}>
                Volver
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!qrData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Código QR no encontrado</h3>
              <p>El código QR que buscas no existe en nuestro sistema.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaQrcode className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verificación QR
          </h1>
          <p className="text-xl text-gray-600">
            Verificación pública de códigos QR de TradeConnect
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {getStatusIcon(qrData.status)}
                <div>
                  <h3 className="text-lg font-semibold">
                    Código QR: {qrData.qrCode}
                  </h3>
                  <p className="text-gray-600">
                    {getStatusMessage(qrData.status)}
                  </p>
                </div>
              </div>
              {getStatusBadge(qrData.status)}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={shareVerification}>
                <FaShare className="mr-2 h-4 w-4" />
                Compartir
              </Button>
              {qrData.certificateUrl && qrData.status === 'used' && (
                <Button variant="outline" size="sm" onClick={downloadCertificate}>
                  <FaDownload className="mr-2 h-4 w-4" />
                  Certificado
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Participant & Event Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaUser className="mr-2 h-5 w-5" />
                Información del Participante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="text-gray-900 font-medium">{qrData.participantName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{qrData.participantEmail}</p>
              </div>

              {qrData.checkInTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-in realizado</label>
                  <p className="text-gray-900">
                    {new Date(qrData.checkInTime).toLocaleString('es-GT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCertificate className="mr-2 h-5 w-5" />
                Información del Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Evento</label>
                <p className="text-gray-900 font-medium">{qrData.eventTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="mr-1 h-3 w-3" />
                    {new Date(qrData.eventDate).toLocaleDateString('es-GT')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hora</label>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="mr-1 h-3 w-3" />
                    {new Date(qrData.eventDate).toLocaleTimeString('es-GT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <div className="flex items-center text-sm text-gray-600">
                  <FaMapMarkerAlt className="mr-1 h-3 w-3" />
                  {qrData.eventLocation}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Display */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaQrcode className="mr-2 h-5 w-5" />
              Código QR Original
            </CardTitle>
            <CardDescription>
              Este es el código QR que fue escaneado para esta verificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-gray-700">{qrData.qrCode}</p>
                </div>
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FaQrcode className="h-24 w-24 text-gray-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <FaQrcode className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Verificación Segura</h4>
                <p className="text-blue-800 text-sm">
                  Esta verificación confirma la autenticidad del código QR y su asociación con el participante y evento registrados.
                  Los datos mostrados son verificados en tiempo real contra nuestra base de datos segura.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            ¿Necesitas verificar otro código QR?
          </p>
          <Button onClick={() => window.location.reload()}>
            Verificar Nuevo Código
          </Button>
        </div>
      </div>
    </div>
  )
}