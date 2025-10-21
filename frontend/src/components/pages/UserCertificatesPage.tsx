import React, { useState, useEffect } from 'react'
import { FaCertificate, FaDownload, FaEye, FaSearch, FaFilter, FaCheckCircle, FaClock, FaShare, FaQrcode, FaCalendarAlt, FaUser, FaMapMarkerAlt } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'

interface Certificate {
  id: string
  certificateId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  issuedDate: string
  status: 'issued' | 'pending' | 'revoked'
  downloadUrl: string
  verificationUrl: string
  blockchainHash?: string
  qrCode: string
  speakers: string[]
  category: string
  hours: number
  participantName: string
}

export const UserCertificatesPage: React.FC = () => {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    fetchCertificates()
  }, [])

  useEffect(() => {
    filterCertificates()
  }, [certificates, searchTerm, statusFilter, categoryFilter])

  const fetchCertificates = async () => {
    try {
      setLoading(true)

      // In a real app, you would call your API
      // const response = await api.get('/user/certificates')

      // Mock certificates data
      const mockCertificates: Certificate[] = [
        {
          id: '1',
          certificateId: 'TC-CERT-2024-001',
          eventTitle: 'Conferencia Anual de Innovación Tecnológica',
          eventDate: '2024-02-15',
          eventLocation: 'Centro de Convenciones, Ciudad de Guatemala',
          issuedDate: '2024-02-16T10:00:00Z',
          status: 'issued',
          downloadUrl: '/certificates/TC-CERT-2024-001.pdf',
          verificationUrl: 'https://tradeconnect.gt/verificar-certificado/TC-CERT-2024-001',
          blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          qrCode: 'QR-CERT-2024-001',
          speakers: ['Dr. Carlos Rodríguez', 'Lic. Ana López'],
          category: 'Tecnología',
          hours: 8,
          participantName: user?.name || 'Usuario'
        },
        {
          id: '2',
          certificateId: 'TC-CERT-2024-002',
          eventTitle: 'Taller de Liderazgo Empresarial',
          eventDate: '2024-03-20',
          eventLocation: 'Hotel Marriott, Zona 10',
          issuedDate: '2024-03-21T14:00:00Z',
          status: 'issued',
          downloadUrl: '/certificates/TC-CERT-2024-002.pdf',
          verificationUrl: 'https://tradeconnect.gt/verificar-certificado/TC-CERT-2024-002',
          blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          qrCode: 'QR-CERT-2024-002',
          speakers: ['Lic. María González'],
          category: 'Negocios',
          hours: 6,
          participantName: user?.name || 'Usuario'
        },
        {
          id: '3',
          certificateId: 'TC-CERT-2024-003',
          eventTitle: 'Seminario de Marketing Digital',
          eventDate: '2024-01-10',
          eventLocation: 'Centro Empresarial, Zona 4',
          issuedDate: '2024-01-11T11:00:00Z',
          status: 'issued',
          downloadUrl: '/certificates/TC-CERT-2024-003.pdf',
          verificationUrl: 'https://tradeconnect.gt/verificar-certificado/TC-CERT-2024-003',
          blockchainHash: '0x7890123456789012345678901234567890123456789012345678901234567890',
          qrCode: 'QR-CERT-2024-003',
          speakers: ['Ing. José Martínez'],
          category: 'Marketing',
          hours: 4,
          participantName: user?.name || 'Usuario'
        },
        {
          id: '4',
          certificateId: 'TC-CERT-2024-004',
          eventTitle: 'Workshop de Finanzas Personales',
          eventDate: '2024-04-10',
          eventLocation: 'Torre Empresarial, Zona 9',
          issuedDate: '2024-04-11T09:30:00Z',
          status: 'pending',
          downloadUrl: '/certificates/TC-CERT-2024-004.pdf',
          verificationUrl: 'https://tradeconnect.gt/verificar-certificado/TC-CERT-2024-004',
          qrCode: 'QR-CERT-2024-004',
          speakers: ['CPA. Ana López'],
          category: 'Finanzas',
          hours: 5,
          participantName: user?.name || 'Usuario'
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setCertificates(mockCertificates)
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCertificates = () => {
    let filtered = certificates

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.speakers.some(speaker =>
          speaker.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        cert.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(cert => cert.category === categoryFilter)
    }

    setFilteredCertificates(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <Badge className="bg-green-100 text-green-800">Emitido</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800">Revocado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const handleDownloadCertificate = (certificateId: string, downloadUrl: string) => {
    // In a real app, this would download the certificate
    alert(`Descargando certificado ${certificateId}...`)
  }

  const handleVerifyCertificate = (verificationUrl: string) => {
    window.open(verificationUrl, '_blank')
  }

  const handleShareCertificate = (certificateId: string, verificationUrl: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Certificado ${certificateId}`,
        text: 'Verifica mi certificado de participación',
        url: verificationUrl
      })
    } else {
      navigator.clipboard.writeText(verificationUrl)
      alert('Enlace copiado al portapapeles')
    }
  }

  const getCategories = () => {
    return Array.from(new Set(certificates.map(cert => cert.category)))
  }

  const stats = {
    total: certificates.length,
    issued: certificates.filter(c => c.status === 'issued').length,
    pending: certificates.filter(c => c.status === 'pending').length,
    totalHours: certificates
      .filter(c => c.status === 'issued')
      .reduce((sum, c) => sum + c.hours, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus certificados...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Certificados</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y descarga tus certificados de participación
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.issued}</div>
              <p className="text-sm text-gray-600">Emitidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
              <p className="text-sm text-gray-600">Horas totales</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar certificados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="issued">Emitido</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="revoked">Revocado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {getCategories().map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setCategoryFilter('all')
              }}>
                <FaFilter className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certificates List */}
        <div className="space-y-6">
          {filteredCertificates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FaCertificate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron certificados</h3>
                <p className="text-gray-600 mb-4">
                  {certificates.length === 0
                    ? 'Aún no tienes certificados emitidos.'
                    : 'No hay certificados que coincidan con los filtros aplicados.'
                  }
                </p>
                {certificates.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Los certificados se emitirán automáticamente después de completar los eventos.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredCertificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Certificate Info */}
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <FaCertificate className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {certificate.certificateId}
                            </h3>
                          </div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">
                            {certificate.eventTitle}
                          </h4>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2 h-3 w-3" />
                              Evento: {new Date(certificate.eventDate).toLocaleDateString('es-GT')}
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-2 h-3 w-3" />
                              {certificate.eventLocation}
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-2 h-3 w-3" />
                              {certificate.hours} horas
                            </div>
                            <div className="flex items-center">
                              <FaUser className="mr-2 h-3 w-3" />
                              {certificate.speakers.join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(certificate.status)}
                          <Badge className="bg-blue-100 text-blue-800">
                            {certificate.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="mb-1">
                          <span className="font-medium">Emitido:</span>{' '}
                          {new Date(certificate.issuedDate).toLocaleDateString('es-GT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div>
                          <span className="font-medium">Participante:</span> {certificate.participantName}
                        </div>
                      </div>
                    </div>

                    {/* Blockchain & QR */}
                    <div>
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Verificación Blockchain</h5>
                        {certificate.blockchainHash ? (
                          <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                            {certificate.blockchainHash.substring(0, 20)}...
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Pendiente de registro en blockchain
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Código QR</h5>
                        <div className="bg-gray-100 p-4 rounded-lg inline-block">
                          <FaQrcode className="h-8 w-8 text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{certificate.qrCode}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <div className="space-y-2 mb-4">
                        {certificate.status === 'issued' && (
                          <Button
                            onClick={() => handleDownloadCertificate(certificate.certificateId, certificate.downloadUrl)}
                            className="w-full"
                          >
                            <FaDownload className="mr-2 h-4 w-4" />
                            Descargar PDF
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => handleVerifyCertificate(certificate.verificationUrl)}
                          className="w-full"
                        >
                          <FaEye className="mr-2 h-4 w-4" />
                          Verificar
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleShareCertificate(certificate.certificateId, certificate.verificationUrl)}
                          className="w-full"
                        >
                          <FaShare className="mr-2 h-4 w-4" />
                          Compartir
                        </Button>
                      </div>

                      {certificate.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <FaClock className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-sm text-yellow-700">
                              Certificado en proceso de emisión
                            </span>
                          </div>
                        </div>
                      )}

                      {certificate.status === 'issued' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700">
                              Certificado válido y verificable
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <FaCertificate className="h-6 w-6 text-blue-600 mt-1 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Sobre tus certificados</h4>
                <div className="text-blue-800 text-sm space-y-1">
                  <p>• Los certificados se emiten automáticamente al completar los eventos</p>
                  <p>• Cada certificado incluye verificación blockchain para autenticidad</p>
                  <p>• Puedes compartir el enlace de verificación públicamente</p>
                  <p>• Los certificados son válidos permanentemente</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}