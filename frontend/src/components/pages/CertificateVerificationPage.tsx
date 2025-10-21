import React, { useState } from 'react'
import { FaSearch, FaCertificate, FaCheckCircle, FaTimesCircle, FaQrcode, FaDownload, FaShare, FaShieldAlt } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'

interface CertificateData {
  id: string
  certificateNumber: string
  participantName: string
  participantEmail: string
  eventTitle: string
  eventDate: string
  speakerName: string
  issueDate: string
  expiryDate: string
  status: 'valid' | 'expired' | 'revoked' | 'invalid'
  blockchainHash: string
  blockchainTxId: string
  qrCode: string
  verificationUrl: string
}

export const CertificateVerificationPage: React.FC = () => {
  const [certificateCode, setCertificateCode] = useState('')
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verifyCertificate = async () => {
    if (!certificateCode.trim()) {
      setError('Por favor ingresa un código de certificado')
      return
    }

    try {
      setLoading(true)
      setError('')
      setCertificate(null)

      // In a real app, you would call your API
      // const response = await api.get(`/certificates/verify/${certificateCode}`)

      // Mock verification logic
      const mockCertificates: Record<string, CertificateData> = {
        'TC-2024-001': {
          id: '1',
          certificateNumber: 'TC-2024-001',
          participantName: 'María González López',
          participantEmail: 'maria.gonzalez@email.com',
          eventTitle: 'Conferencia Anual de Innovación Tecnológica',
          eventDate: '2024-02-15',
          speakerName: 'Dr. Carlos Rodríguez',
          issueDate: '2024-02-16',
          expiryDate: '2029-02-16',
          status: 'valid',
          blockchainHash: '0x8ba1f109d5c5b7b8c2e6f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
          blockchainTxId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABlNJREFUeJzt3X9sVfX9x/H3',
          verificationUrl: 'https://tradeconnect.gt/verificar-certificado/TC-2024-001'
        },
        'TC-2024-002': {
          id: '2',
          certificateNumber: 'TC-2024-002',
          participantName: 'José Martínez Ruiz',
          participantEmail: 'jose.martinez@email.com',
          eventTitle: 'Taller de Liderazgo Empresarial',
          eventDate: '2024-03-20',
          speakerName: 'Lic. Ana López',
          issueDate: '2024-03-21',
          expiryDate: '2029-03-21',
          status: 'expired',
          blockchainHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3',
          blockchainTxId: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABlNJREFUeJzt3X9sVfX9x/H3',
          verificationUrl: 'https://tradeconnect.gt/verificar-certificado/TC-2024-002'
        }
      }

      const foundCertificate = mockCertificates[certificateCode.toUpperCase()]

      if (!foundCertificate) {
        setError('Certificado no encontrado. Verifica el código e intenta nuevamente.')
        return
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setCertificate(foundCertificate)
    } catch (err) {
      console.error('Error verifying certificate:', err)
      setError('Error al verificar el certificado. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyCertificate()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Válido</Badge>
      case 'expired':
        return <Badge className="bg-yellow-100 text-yellow-800">Expirado</Badge>
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800">Revocado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inválido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <FaCheckCircle className="h-8 w-8 text-green-500" />
      case 'expired':
        return <FaTimesCircle className="h-8 w-8 text-yellow-500" />
      case 'revoked':
        return <FaTimesCircle className="h-8 w-8 text-red-500" />
      default:
        return <FaTimesCircle className="h-8 w-8 text-gray-500" />
    }
  }

  const downloadCertificate = () => {
    // In a real app, this would download the PDF certificate
    alert('Descargando certificado PDF...')
  }

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Certificado TradeConnect',
        text: `Certificado de participación: ${certificate?.eventTitle}`,
        url: certificate?.verificationUrl
      })
    } else {
      navigator.clipboard.writeText(certificate?.verificationUrl || '')
      alert('Enlace copiado al portapapeles')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verificación de Certificados
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verifica la autenticidad de cualquier certificado emitido por TradeConnect
            utilizando tecnología blockchain para máxima seguridad.
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Verificar Certificado</CardTitle>
            <CardDescription>
              Ingresa el código único del certificado (generalmente comienza con "TC-")
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Ej: TC-2024-001"
                  value={certificateCode}
                  onChange={(e) => setCertificateCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="pl-10 uppercase"
                  disabled={loading}
                />
              </div>
              <Button onClick={verifyCertificate} disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <FaTimesCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate Details */}
        {certificate && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(certificate.status)}
                    <div>
                      <h3 className="text-lg font-semibold">
                        Certificado {certificate.certificateNumber}
                      </h3>
                      <p className="text-gray-600">
                        {certificate.status === 'valid' ? 'Certificado válido y verificado' :
                         certificate.status === 'expired' ? 'Certificado expirado' :
                         certificate.status === 'revoked' ? 'Certificado revocado' :
                         'Certificado inválido'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(certificate.status)}
                </div>
              </CardContent>
            </Card>

            {/* Certificate Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Participant & Event Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaCertificate className="mr-2 h-5 w-5" />
                    Información del Certificado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Participante</label>
                    <p className="text-gray-900">{certificate.participantName}</p>
                    <p className="text-sm text-gray-600">{certificate.participantEmail}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Evento</label>
                    <p className="text-gray-900">{certificate.eventTitle}</p>
                    <p className="text-sm text-gray-600">
                      Fecha: {new Date(certificate.eventDate).toLocaleDateString('es-GT')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instructor/Ponente</label>
                    <p className="text-gray-900">{certificate.speakerName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emitido</label>
                      <p className="text-sm text-gray-600">
                        {new Date(certificate.issueDate).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expira</label>
                      <p className="text-sm text-gray-600">
                        {new Date(certificate.expiryDate).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaShieldAlt className="mr-2 h-5 w-5" />
                    Verificación Blockchain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-700 font-medium">Verificado en Blockchain</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hash Blockchain</label>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                      {certificate.blockchainHash}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID de Transacción</label>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                      {certificate.blockchainTxId}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={downloadCertificate}>
                      <FaDownload className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareCertificate}>
                      <FaShare className="mr-2 h-4 w-4" />
                      Compartir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaQrcode className="mr-2 h-5 w-5" />
                  Código QR de Verificación
                </CardTitle>
                <CardDescription>
                  Escanea este código QR para verificar el certificado desde cualquier dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <img
                      src={certificate.qrCode}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  URL de verificación: {certificate.verificationUrl}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How It Works */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>¿Cómo funciona la verificación?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FaCertificate className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Certificado Único</h4>
                <p className="text-sm text-gray-600">
                  Cada certificado tiene un código único que lo identifica de forma exclusiva.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Blockchain</h4>
                <p className="text-sm text-gray-600">
                  La información se registra en blockchain para garantizar inalterabilidad.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FaQrcode className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Verificación QR</h4>
                <p className="text-sm text-gray-600">
                  Escanea el código QR para verificar la autenticidad desde cualquier lugar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}