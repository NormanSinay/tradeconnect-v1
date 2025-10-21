import React, { useState, useEffect } from 'react'
import { FaQrcode, FaDownload, FaShare, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface QRCode {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  qrCode: string
  status: 'active' | 'used' | 'expired' | 'cancelled'
  usedAt?: string
  createdAt: string
  expiresAt: string
}

export const UserQRCodesPage: React.FC = () => {
  const { user } = useAuth()
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [filteredQrCodes, setFilteredQrCodes] = useState<QRCode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchQRCodes()
  }, [])

  useEffect(() => {
    filterQRCodes()
  }, [qrCodes, searchTerm, statusFilter])

  const fetchQRCodes = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get('/user/qr-codes')

      // Mock QR codes data
      const mockQRCodes: QRCode[] = [
        {
          id: '1',
          eventId: 'event-1',
          eventTitle: 'Conferencia Anual de Innovación Tecnológica',
          eventDate: '2024-01-25',
          eventTime: '09:00',
          qrCode: 'QR123456789',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          expiresAt: '2024-01-25T18:00:00Z'
        },
        {
          id: '2',
          eventId: 'event-2',
          eventTitle: 'Taller de Liderazgo Empresarial',
          eventDate: '2024-01-18',
          eventTime: '14:00',
          qrCode: 'QR987654321',
          status: 'used',
          usedAt: '2024-01-18T14:30:00Z',
          createdAt: '2024-01-10T09:00:00Z',
          expiresAt: '2024-01-18T17:00:00Z'
        },
        {
          id: '3',
          eventId: 'event-3',
          eventTitle: 'Seminario de Desarrollo Personal',
          eventDate: '2024-01-12',
          eventTime: '10:00',
          qrCode: 'QR456789123',
          status: 'expired',
          createdAt: '2024-01-05T08:00:00Z',
          expiresAt: '2024-01-12T13:00:00Z'
        },
        {
          id: '4',
          eventId: 'event-4',
          eventTitle: 'Workshop de Marketing Digital',
          eventDate: '2024-01-30',
          eventTime: '16:00',
          qrCode: 'QR789123456',
          status: 'cancelled',
          createdAt: '2024-01-20T11:00:00Z',
          expiresAt: '2024-01-30T20:00:00Z'
        }
      ]

      setQrCodes(mockQRCodes)
    } catch (error) {
      console.error('Error fetching QR codes:', error)
      showToast.error('Error al cargar los códigos QR')
    } finally {
      setIsLoading(false)
    }
  }

  const filterQRCodes = () => {
    let filtered = qrCodes

    if (searchTerm) {
      filtered = filtered.filter(qr =>
        qr.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(qr => qr.status === statusFilter)
    }

    setFilteredQrCodes(filtered)
  }

  const downloadQR = async (qrCode: QRCode) => {
    try {
      // In a real app, you would generate/download the QR code image
      // const response = await api.get(`/user/qr-codes/${qrCode.id}/download`, { responseType: 'blob' })

      // Mock download
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 200
        canvas.height = 200
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 200, 200)
        ctx.fillStyle = '#000000'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(qrCode.qrCode, 100, 100)

        const link = document.createElement('a')
        link.download = `qr-${qrCode.eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`
        link.href = canvas.toDataURL()
        link.click()
      }

      showToast.success('Código QR descargado exitosamente')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      showToast.error('Error al descargar el código QR')
    }
  }

  const shareQR = async (qrCode: QRCode) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Código QR - ${qrCode.eventTitle}`,
          text: `Código QR para el evento: ${qrCode.eventTitle}`,
          url: `${window.location.origin}/verificar-qr/${qrCode.qrCode}`
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/verificar-qr/${qrCode.qrCode}`)
        showToast.success('Enlace copiado al portapapeles')
      }
    } catch (error) {
      console.error('Error sharing QR code:', error)
      showToast.error('Error al compartir el código QR')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><FaCheckCircle className="mr-1 h-3 w-3" />Activo</Badge>
      case 'used':
        return <Badge className="bg-blue-100 text-blue-800"><FaCheckCircle className="mr-1 h-3 w-3" />Usado</Badge>
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800"><FaClock className="mr-1 h-3 w-3" />Expirado</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><FaTimesCircle className="mr-1 h-3 w-3" />Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />
      case 'used':
        return <FaCheckCircle className="h-5 w-5 text-blue-500" />
      case 'expired':
        return <FaClock className="h-5 w-5 text-gray-500" />
      case 'cancelled':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />
      default:
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const stats = {
    total: qrCodes.length,
    active: qrCodes.filter(qr => qr.status === 'active').length,
    used: qrCodes.filter(qr => qr.status === 'used').length,
    expired: qrCodes.filter(qr => qr.status === 'expired').length
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Códigos QR</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus códigos QR para acceso a eventos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaQrcode className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaCheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaCheckCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.used}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaClock className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expirados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por evento o código QR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="used">Usados</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredQrCodes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaQrcode className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron códigos QR</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes códigos QR que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            filteredQrCodes.map((qrCode) => (
              <Card key={qrCode.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(qrCode.status)}
                      <div>
                        <CardTitle className="text-lg">{qrCode.eventTitle}</CardTitle>
                        <CardDescription className="text-sm">
                          {new Date(qrCode.eventDate).toLocaleDateString('es-GT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(qrCode.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-mono font-bold text-gray-900 mb-2">
                      {qrCode.qrCode}
                    </div>
                    <p className="text-xs text-gray-600">
                      Código QR único
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Hora del evento:</span>
                      <span className="font-medium">{qrCode.eventTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expira:</span>
                      <span className="font-medium">
                        {new Date(qrCode.expiresAt).toLocaleDateString('es-GT')}
                      </span>
                    </div>
                    {qrCode.usedAt && (
                      <div className="flex justify-between">
                        <span>Usado:</span>
                        <span className="font-medium">
                          {new Date(qrCode.usedAt).toLocaleDateString('es-GT')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadQR(qrCode)}
                      disabled={qrCode.status !== 'active'}
                    >
                      <FaDownload className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => shareQR(qrCode)}
                    >
                      <FaShare className="mr-2 h-4 w-4" />
                      Compartir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}