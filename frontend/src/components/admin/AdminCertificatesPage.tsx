import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaEye, FaEdit, FaTrash, FaBan, FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock, FaCertificate, FaFilePdf, FaQrcode, FaLink } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminCertificateService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  CertificateAttributes,
  CertificateStatus,
  CertificateType,
  CertificateStats,
  AdminPaginatedResponse,
} from '@/types/admin'

const AdminCertificatesPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [certificates, setCertificates] = useState<CertificateAttributes[]>([])
  const [stats, setStats] = useState<CertificateStats | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({
    search: '',
    status: '' as CertificateStatus | '',
    type: '' as CertificateType | '',
    eventId: '',
    startDate: '',
    endDate: '',
  })
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateAttributes | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadCertificates()
    loadStats()
  }, [filters, pagination.page])

  const loadCertificates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response: AdminPaginatedResponse<CertificateAttributes> = await adminCertificateService.getCertificates(
        {
          eventId: filters.eventId ? parseInt(filters.eventId) : undefined,
          status: filters.status || undefined,
          type: filters.type || undefined,
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        },
        { page: pagination.page, limit: pagination.limit }
      )

      setCertificates(response.data)
      setPagination(prev => ({ ...prev, total: response.total }))

    } catch (err: any) {
      console.error('Error cargando certificados:', err)
      setError('Error al cargar los certificados')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await adminCertificateService.getCertificateStats()
      setStats(statsData)
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleRevokeCertificate = async (certificateId: string) => {
    if (!confirm('¿Está seguro de revocar este certificado? Esta acción no se puede deshacer.')) return

    try {
      await adminCertificateService.revokeCertificate({
        certificateId,
        reason: 'Revocado por administrador',
        revokedBy: 1, // TODO: Obtener ID del usuario actual
      })
      await loadCertificates()
    } catch (err: any) {
      console.error('Error revocando certificado:', err)
      setError('Error al revocar el certificado')
    }
  }

  const handleResendCertificate = async (certificateId: string) => {
    try {
      await adminCertificateService.resendCertificate({
        certificateId,
        requestedBy: 1, // TODO: Obtener ID del usuario actual
      })
      await loadCertificates()
    } catch (err: any) {
      console.error('Error reenviando certificado:', err)
      setError('Error al reenviar el certificado')
    }
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await adminCertificateService.exportCertificates(format, {
        status: filters.status || undefined,
        type: filters.type || undefined,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificates.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Error exportando certificados:', err)
      setError('Error al exportar los certificados')
    }
  }

  const getStatusBadge = (status: CertificateStatus) => {
    const variants = {
      active: 'default',
      revoked: 'destructive',
      expired: 'secondary',
    } as const

    const icons = {
      active: <FaCheckCircle className="mr-1" />,
      revoked: <FaBan className="mr-1" />,
      expired: <FaClock className="mr-1" />,
    }

    return (
      <Badge variant={variants[status]}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: CertificateType) => {
    const colors = {
      attendance: 'bg-blue-100 text-blue-800',
      completion: 'bg-green-100 text-green-800',
      achievement: 'bg-purple-100 text-purple-800',
    }

    return (
      <Badge className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Certificados' },
  ]

  return (
    <AdminLayout title="Gestión de Certificados" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Certificados</h1>
            <p className="text-gray-600 mt-1">
              Administración completa de certificados digitales
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <FaDownload className="mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <FaFilePdf className="mr-2" />
              Exportar PDF
            </Button>
            <Button>
              <FaPlus className="mr-2" />
              Nuevo Certificado
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Certificados</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalCertificates}</p>
                  </div>
                  <FaCertificate className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Este Mes</p>
                    <p className="text-3xl font-bold text-green-600">{stats.certificatesThisMonth}</p>
                  </div>
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blockchain</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.blockchainStats.confirmedCertificates}</p>
                  </div>
                  <FaLink className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verificaciones</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.verificationStats.totalVerifications}</p>
                  </div>
                  <FaQrcode className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Input
                  placeholder="Buscar por número o participante..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as CertificateStatus }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="revoked">Revocado</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as CertificateType }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="attendance">Asistencia</SelectItem>
                    <SelectItem value="completion">Finalización</SelectItem>
                    <SelectItem value="achievement">Logro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="Fecha inicio"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="Fecha fin"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={loadCertificates}>
                  <FaSearch className="mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" onClick={() => setFilters({
                  search: '',
                  status: '',
                  type: '',
                  eventId: '',
                  startDate: '',
                  endDate: '',
                })}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de certificados */}
        <Card>
          <CardHeader>
            <CardTitle>Certificados ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Participante</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Emitido</TableHead>
                  <TableHead>Blockchain</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-mono text-sm">
                      {cert.certificateNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cert.participantData.fullName}</p>
                        <p className="text-sm text-gray-500">{cert.participantData.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cert.eventData.title}</p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(cert.eventData.startDate)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(cert.certificateType)}</TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                    <TableCell>{formatDateTime(cert.issuedAt)}</TableCell>
                    <TableCell>
                      {cert.blockchainTxHash ? (
                        <Badge variant="outline" className="text-green-600">
                          <FaLink className="mr-1" />
                          Registrado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCertificate(cert)
                            setShowDetailsDialog(true)
                          }}
                        >
                          <FaEye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FaFilePdf className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FaEnvelope className="h-3 w-3" />
                        </Button>
                        {cert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeCertificate(cert.id)}
                          >
                            <FaBan className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {certificates.length === 0 && !loading && (
              <div className="text-center py-8">
                <FaCertificate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron certificados
                </h3>
                <p className="text-gray-600">
                  No hay certificados que coincidan con los filtros aplicados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de detalles */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalles del Certificado</DialogTitle>
            </DialogHeader>
            {selectedCertificate && (
              <div className="space-y-6">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="participant">Participante</TabsTrigger>
                    <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Número de Certificado</label>
                        <p className="font-mono">{selectedCertificate.certificateNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tipo</label>
                        <p>{getTypeBadge(selectedCertificate.certificateType)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Estado</label>
                        <p>{getStatusBadge(selectedCertificate.status)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Emitido</label>
                        <p>{formatDateTime(selectedCertificate.issuedAt)}</p>
                      </div>
                      {selectedCertificate.expiresAt && (
                        <div>
                          <label className="text-sm font-medium">Expira</label>
                          <p>{formatDateTime(selectedCertificate.expiresAt)}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium">Descargas</label>
                        <p>{selectedCertificate.downloadCount}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="participant" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Nombre Completo</label>
                        <p>{selectedCertificate.participantData.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p>{selectedCertificate.participantData.email}</p>
                      </div>
                      {selectedCertificate.participantData.cui && (
                        <div>
                          <label className="text-sm font-medium">CUI</label>
                          <p>{selectedCertificate.participantData.cui}</p>
                        </div>
                      )}
                      {selectedCertificate.participantData.organization && (
                        <div>
                          <label className="text-sm font-medium">Organización</label>
                          <p>{selectedCertificate.participantData.organization}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="blockchain" className="space-y-4">
                    {selectedCertificate.blockchainTxHash ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Hash de Transacción</label>
                          <p className="font-mono text-sm break-all">{selectedCertificate.blockchainTxHash}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Red</label>
                          <p>{selectedCertificate.blockchainNetwork}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Confirmaciones</label>
                          <p>{selectedCertificate.blockchainConfirmations}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Costo Total</label>
                          <p>{selectedCertificate.blockchainTotalCost}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaLink className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">Este certificado no está registrado en blockchain</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="logs" className="space-y-4">
                    <div className="text-center py-8">
                      <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">Logs de validación próximamente</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTimesCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCertificatesPage