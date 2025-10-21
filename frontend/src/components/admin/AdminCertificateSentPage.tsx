import React, { useState, useEffect } from 'react'
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock, FaRedo, FaDownload, FaFilter, FaSearch, FaMailBulk, FaChartBar, FaUsers } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { adminCertificateService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  CertificateAttributes,
  AdminPaginatedResponse,
} from '@/types/admin'

interface CertificateEmailLog {
  id: string
  certificateId: string
  certificateNumber: string
  participantName: string
  participantEmail: string
  eventTitle: string
  sentAt: Date
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'failed'
  emailProvider?: string
  errorMessage?: string
  openedAt?: Date
  clickedAt?: Date
  retryCount: number
  lastRetryAt?: Date
}

interface EmailStats {
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  failed: number
  openRate: number
  clickRate: number
  deliveryRate: number
}

const AdminCertificateSentPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [emailLogs, setEmailLogs] = useState<CertificateEmailLog[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({
    search: '',
    status: '' as CertificateEmailLog['status'] | '',
    eventId: '',
    startDate: '',
    endDate: '',
  })
  const [selectedLog, setSelectedLog] = useState<CertificateEmailLog | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showBulkResendDialog, setShowBulkResendDialog] = useState(false)
  const [bulkResendConfig, setBulkResendConfig] = useState({
    eventId: '',
    status: 'failed' as CertificateEmailLog['status'],
    limit: 100,
  })
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadEmailLogs()
    loadStats()
  }, [filters, pagination.page])

  const loadEmailLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simular carga de logs de email
      const mockLogs: CertificateEmailLog[] = [
        {
          id: 'log-1',
          certificateId: 'cert-123',
          certificateNumber: 'CERT-2024-001',
          participantName: 'Juan Pérez',
          participantEmail: 'juan.perez@email.com',
          eventTitle: 'Conferencia de Tecnología 2024',
          sentAt: new Date(Date.now() - 1000 * 60 * 30),
          status: 'delivered',
          emailProvider: 'Gmail',
          retryCount: 0,
        },
        {
          id: 'log-2',
          certificateId: 'cert-124',
          certificateNumber: 'CERT-2024-002',
          participantName: 'María García',
          participantEmail: 'maria.garcia@email.com',
          eventTitle: 'Workshop de Desarrollo Web',
          sentAt: new Date(Date.now() - 1000 * 60 * 60),
          status: 'bounced',
          emailProvider: 'Outlook',
          errorMessage: 'Mailbox full',
          retryCount: 2,
          lastRetryAt: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: 'log-3',
          certificateId: 'cert-125',
          certificateNumber: 'CERT-2024-003',
          participantName: 'Carlos López',
          participantEmail: 'carlos.lopez@email.com',
          eventTitle: 'Seminario de IA',
          sentAt: new Date(Date.now() - 1000 * 60 * 15),
          status: 'opened',
          emailProvider: 'Gmail',
          openedAt: new Date(Date.now() - 1000 * 60 * 10),
          retryCount: 0,
        },
      ]

      setEmailLogs(mockLogs)
      setPagination(prev => ({ ...prev, total: mockLogs.length }))

    } catch (err: any) {
      console.error('Error cargando logs de email:', err)
      setError('Error al cargar los logs de email')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Simular estadísticas
      const mockStats: EmailStats = {
        totalSent: 1250,
        delivered: 1180,
        opened: 340,
        clicked: 85,
        bounced: 45,
        failed: 25,
        openRate: 28.8,
        clickRate: 7.1,
        deliveryRate: 94.4,
      }

      setStats(mockStats)

    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleResendEmail = async (log: CertificateEmailLog) => {
    try {
      await adminCertificateService.resendCertificate({
        certificateId: log.certificateId,
        requestedBy: 1, // TODO: Obtener ID del usuario actual
      })

      // Actualizar el log localmente
      setEmailLogs(prev => prev.map(l =>
        l.id === log.id
          ? { ...l, status: 'sent' as const, retryCount: l.retryCount + 1, lastRetryAt: new Date() }
          : l
      ))

    } catch (err: any) {
      console.error('Error reenviando email:', err)
      setError('Error al reenviar el email')
    }
  }

  const handleBulkResend = async () => {
    try {
      setError(null)

      // Simular reenvío masivo
      const logsToResend = emailLogs.filter(log =>
        log.status === bulkResendConfig.status &&
        (!bulkResendConfig.eventId || log.eventTitle.includes(bulkResendConfig.eventId))
      ).slice(0, bulkResendConfig.limit)

      for (const log of logsToResend) {
        await handleResendEmail(log)
        await new Promise(resolve => setTimeout(resolve, 100)) // Delay entre envíos
      }

      setShowBulkResendDialog(false)
      await loadEmailLogs()

    } catch (err: any) {
      console.error('Error en reenvío masivo:', err)
      setError('Error en el reenvío masivo')
    }
  }

  const exportEmailLogs = async (format: 'csv' | 'excel') => {
    try {
      // Simular exportación
      const csvContent = [
        ['Certificado', 'Participante', 'Email', 'Evento', 'Estado', 'Enviado', 'Error'].join(','),
        ...emailLogs.map(log => [
          log.certificateNumber,
          log.participantName,
          log.participantEmail,
          log.eventTitle,
          log.status,
          formatDateTime(log.sentAt),
          log.errorMessage || ''
        ].join(',')),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-emails.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (err: any) {
      console.error('Error exportando logs:', err)
      setError('Error al exportar los logs')
    }
  }

  const getStatusBadge = (status: CertificateEmailLog['status']) => {
    const variants = {
      sent: 'secondary',
      delivered: 'default',
      opened: 'default',
      clicked: 'default',
      bounced: 'destructive',
      complained: 'destructive',
      failed: 'destructive',
    } as const

    const icons = {
      sent: <FaClock className="mr-1" />,
      delivered: <FaCheckCircle className="mr-1" />,
      opened: <FaEnvelope className="mr-1" />,
      clicked: <FaMailBulk className="mr-1" />,
      bounced: <FaTimesCircle className="mr-1" />,
      complained: <FaTimesCircle className="mr-1" />,
      failed: <FaTimesCircle className="mr-1" />,
    }

    return (
      <Badge variant={variants[status]}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Certificados', href: '/admin/certificados' },
    { label: 'Enviados' },
  ]

  return (
    <AdminLayout title="Certificados Enviados" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Certificados Enviados</h1>
            <p className="text-gray-600 mt-1">
              Seguimiento y gestión de envíos de certificados por email
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => exportEmailLogs('csv')}>
              <FaDownload className="mr-2" />
              Exportar CSV
            </Button>
            <Dialog open={showBulkResendDialog} onOpenChange={setShowBulkResendDialog}>
              <DialogTrigger asChild>
                <Button>
                  <FaRedo className="mr-2" />
                  Reenvío Masivo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Reenvío Masivo de Emails</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado de Emails</label>
                    <Select
                      value={bulkResendConfig.status}
                      onValueChange={(value) => setBulkResendConfig(prev => ({ ...prev, status: value as CertificateEmailLog['status'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bounced">Rebotados</SelectItem>
                        <SelectItem value="failed">Fallidos</SelectItem>
                        <SelectItem value="sent">Enviados (sin confirmar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Límite de Reenvíos</label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={bulkResendConfig.limit}
                      onChange={(e) => setBulkResendConfig(prev => ({ ...prev, limit: parseInt(e.target.value) || 100 }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowBulkResendDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleBulkResend}>
                      Iniciar Reenvío
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Enviados</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalSent}</p>
                  </div>
                  <FaEnvelope className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Entrega</p>
                    <p className="text-3xl font-bold text-green-600">{stats.deliveryRate}%</p>
                  </div>
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Apertura</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.openRate}%</p>
                  </div>
                  <FaChartBar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rebotados</p>
                    <p className="text-3xl font-bold text-red-600">{stats.bounced}</p>
                  </div>
                  <FaTimesCircle className="h-8 w-8 text-red-500" />
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Buscar por participante o email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as CertificateEmailLog['status'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="opened">Abierto</SelectItem>
                    <SelectItem value="clicked">Clickeado</SelectItem>
                    <SelectItem value="bounced">Rebotado</SelectItem>
                    <SelectItem value="failed">Fallido</SelectItem>
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
                <Button variant="outline" onClick={loadEmailLogs}>
                  <FaSearch className="mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" onClick={() => setFilters({ search: '', status: '', eventId: '', startDate: '', endDate: '' })}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Envío de Emails ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificado</TableHead>
                  <TableHead>Participante</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Reintentos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.certificateNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.participantName}</p>
                        <p className="text-sm text-gray-500">{log.participantEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{log.eventTitle}</p>
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{formatDateTime(log.sentAt)}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <Badge variant="outline">{log.retryCount}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLog(log)
                            setShowDetailsDialog(true)
                          }}
                        >
                          <FaUsers className="h-3 w-3" />
                        </Button>
                        {(log.status === 'bounced' || log.status === 'failed') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendEmail(log)}
                          >
                            <FaRedo className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {emailLogs.length === 0 && !loading && (
              <div className="text-center py-8">
                <FaEnvelope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron logs de email
                </h3>
                <p className="text-gray-600">
                  Los logs de envío aparecerán aquí cuando se envíen certificados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de detalles */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Envío</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-6">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
                    <TabsTrigger value="errors">Errores</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Certificado</label>
                        <p className="font-mono">{selectedLog.certificateNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Estado</label>
                        <p>{getStatusBadge(selectedLog.status)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Participante</label>
                        <p>{selectedLog.participantName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p>{selectedLog.participantEmail}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Proveedor</label>
                        <p>{selectedLog.emailProvider || 'Desconocido'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Reintentos</label>
                        <p>{selectedLog.retryCount}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tracking" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Enviado</p>
                          <p className="text-sm text-gray-500">{formatDateTime(selectedLog.sentAt)}</p>
                        </div>
                      </div>

                      {selectedLog.status === 'delivered' && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Entregado</p>
                            <p className="text-sm text-gray-500">Email entregado exitosamente</p>
                          </div>
                        </div>
                      )}

                      {selectedLog.openedAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Abierto</p>
                            <p className="text-sm text-gray-500">{formatDateTime(selectedLog.openedAt)}</p>
                          </div>
                        </div>
                      )}

                      {selectedLog.clickedAt && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Clickeado</p>
                            <p className="text-sm text-gray-500">{formatDateTime(selectedLog.clickedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="errors" className="space-y-4">
                    {selectedLog.errorMessage ? (
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <h4 className="font-medium text-red-800 mb-2">Mensaje de Error</h4>
                        <p className="text-red-700">{selectedLog.errorMessage}</p>
                        {selectedLog.lastRetryAt && (
                          <p className="text-sm text-red-600 mt-2">
                            Último reintento: {formatDateTime(selectedLog.lastRetryAt)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaCheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                        <p className="text-gray-600">No hay errores registrados para este envío</p>
                      </div>
                    )}
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

export default AdminCertificateSentPage