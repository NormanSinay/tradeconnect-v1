import React, { useState, useEffect } from 'react'
import { FaCode, FaEye, FaPlay, FaPause, FaRedo, FaFilter, FaDownload, FaCheck, FaTimes, FaClock } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { adminPaymentService } from '@/services/admin'
import { cn } from '@/lib/utils'
import type {
  WebhookPayload,
  PaymentGateway,
} from '@/types/admin'

interface WebhookEvent {
  id: string
  gateway: PaymentGateway
  eventType: string
  status: 'success' | 'failed' | 'pending' | 'retrying'
  payload: WebhookPayload
  attempts: number
  lastAttempt: Date
  nextRetry?: Date
  error?: string
  createdAt: Date
  processedAt?: Date
}

const AdminWebhooksPage: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([])
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEvent | null>(null)
  const [filters, setFilters] = useState({
    gateway: 'all' as PaymentGateway | 'all',
    status: 'all' as 'all' | 'success' | 'failed' | 'pending' | 'retrying',
    startDate: '',
    endDate: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingWebhook, setProcessingWebhook] = useState<string | null>(null)

  // Cargar eventos de webhooks
  const loadWebhooks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Aquí iría la lógica para cargar eventos de webhooks
      // Por ahora, usamos datos mock
      const mockWebhooks: WebhookEvent[] = [
        {
          id: 'wh-001',
          gateway: 'stripe',
          eventType: 'payment_intent.succeeded',
          status: 'success',
          payload: {
            gateway: 'stripe',
            eventType: 'payment_intent.succeeded',
            transactionId: 'txn_123',
            gatewayTransactionId: 'pi_123',
            amount: 100,
            currency: 'GTQ',
            rawPayload: {},
          },
          attempts: 1,
          lastAttempt: new Date(),
          createdAt: new Date(),
          processedAt: new Date(),
        },
        {
          id: 'wh-002',
          gateway: 'paypal',
          eventType: 'PAYMENT.CAPTURE.COMPLETED',
          status: 'failed',
          payload: {
            gateway: 'paypal',
            eventType: 'PAYMENT.CAPTURE.COMPLETED',
            transactionId: 'txn_456',
            gatewayTransactionId: 'capture_456',
            amount: 50,
            currency: 'USD',
            rawPayload: {},
          },
          attempts: 3,
          lastAttempt: new Date(),
          nextRetry: new Date(Date.now() + 3600000), // 1 hora después
          error: 'Connection timeout',
          createdAt: new Date(),
        },
        {
          id: 'wh-003',
          gateway: 'stripe',
          eventType: 'payment_intent.payment_failed',
          status: 'retrying',
          payload: {
            gateway: 'stripe',
            eventType: 'payment_intent.payment_failed',
            transactionId: 'txn_789',
            gatewayTransactionId: 'pi_789',
            amount: 75,
            currency: 'GTQ',
            rawPayload: {},
          },
          attempts: 2,
          lastAttempt: new Date(),
          nextRetry: new Date(Date.now() + 1800000), // 30 minutos después
          createdAt: new Date(),
        },
      ]

      setWebhooks(mockWebhooks)
      setTotalPages(1)
    } catch (err) {
      console.error('Error cargando webhooks:', err)
      setError('Error al cargar los eventos de webhooks')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar cambios en filtros
  const handleFiltersChange = () => {
    setCurrentPage(1)
    loadWebhooks()
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      gateway: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { variant: 'default' as const, label: 'Exitoso', icon: FaCheck },
      failed: { variant: 'destructive' as const, label: 'Fallido', icon: FaTimes },
      pending: { variant: 'secondary' as const, label: 'Pendiente', icon: FaClock },
      retrying: { variant: 'outline' as const, label: 'Reintentando', icon: FaRedo },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Reintentar webhook
  const retryWebhook = async (webhookId: string) => {
    try {
      setProcessingWebhook(webhookId)

      // Aquí iría la lógica para reintentar el webhook
      await loadWebhooks()
    } catch (err) {
      console.error('Error reintentando webhook:', err)
      setError('Error al reintentar el webhook')
    } finally {
      setProcessingWebhook(null)
    }
  }

  // Exportar datos
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      // Aquí iría la lógica para exportar webhooks
      const blob = new Blob([''], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `webhooks-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exportando webhooks:', err)
      setError('Error al exportar los webhooks')
    }
  }

  useEffect(() => {
    loadWebhooks()
  }, [currentPage])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Pagos', href: '/admin/pagos' },
    { label: 'Webhooks' },
  ]

  return (
    <AdminLayout title="Gestión de Webhooks" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Webhooks</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {webhooks.length}
                  </p>
                </div>
                <FaCode className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Exitosos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {webhooks.filter(w => w.status === 'success').length}
                  </p>
                </div>
                <FaCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fallidos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {webhooks.filter(w => w.status === 'failed').length}
                  </p>
                </div>
                <FaTimes className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {webhooks.length > 0
                      ? Math.round((webhooks.filter(w => w.status === 'success').length / webhooks.length) * 100)
                      : 0}%
                  </p>
                </div>
                <FaCode className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder="Buscar por ID de transacción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={filters.gateway}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, gateway: value as PaymentGateway | 'all' }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Pasarela" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las pasarelas</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="success">Exitosos</SelectItem>
                    <SelectItem value="failed">Fallidos</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="retrying">Reintentando</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-32"
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-32"
                  />
                </div>

                <Button variant="outline" onClick={handleFiltersChange}>
                  <FaFilter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>

                <Button variant="outline" onClick={clearFilters}>
                  Limpiar
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <FaDownload className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport('excel')}>
                  <FaDownload className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de webhooks */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos de Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Evento</TableHead>
                    <TableHead>Pasarela</TableHead>
                    <TableHead>Tipo de Evento</TableHead>
                    <TableHead>ID Transacción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Intentos</TableHead>
                    <TableHead>Último Intento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : webhooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No hay eventos de webhooks
                      </TableCell>
                    </TableRow>
                  ) : (
                    webhooks.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell className="font-mono text-sm">
                          {webhook.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {webhook.gateway.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="max-w-xs truncate" title={webhook.eventType}>
                            {webhook.eventType}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {webhook.payload.transactionId?.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(webhook.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {webhook.attempts}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(webhook.lastAttempt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedWebhook(webhook)}
                            >
                              <FaEye className="h-4 w-4" />
                            </Button>

                            {(webhook.status === 'failed' || webhook.status === 'retrying') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => retryWebhook(webhook.id)}
                                disabled={processingWebhook === webhook.id}
                              >
                                <FaRedo className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de detalle de webhook */}
        {selectedWebhook && (
          <Dialog open={!!selectedWebhook} onOpenChange={() => setSelectedWebhook(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalle del Evento de Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">ID Evento</p>
                    <p className="font-mono text-sm">{selectedWebhook.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Pasarela</p>
                    <p className="capitalize">{selectedWebhook.gateway.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedWebhook.status)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Intentos</p>
                    <p>{selectedWebhook.attempts}</p>
                  </div>
                </div>

                {/* Información del evento */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Tipo de Evento</Label>
                        <p className="mt-1 font-mono text-sm">{selectedWebhook.eventType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">ID Transacción</Label>
                        <p className="mt-1 font-mono text-sm">{selectedWebhook.payload.transactionId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">ID en Pasarela</Label>
                        <p className="mt-1 font-mono text-sm">{selectedWebhook.payload.gatewayTransactionId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Monto</Label>
                        <p className="mt-1">
                          {selectedWebhook.payload.amount} {selectedWebhook.payload.currency}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
                        <p className="mt-1">{formatDate(selectedWebhook.createdAt)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Último Intento</Label>
                        <p className="mt-1">{formatDate(selectedWebhook.lastAttempt)}</p>
                      </div>
                      {selectedWebhook.processedAt && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Procesado</Label>
                          <p className="mt-1">{formatDate(selectedWebhook.processedAt)}</p>
                        </div>
                      )}
                      {selectedWebhook.nextRetry && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Próximo Reintento</Label>
                          <p className="mt-1">{formatDate(selectedWebhook.nextRetry)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Error */}
                {selectedWebhook.error && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-800">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-700">{selectedWebhook.error}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Payload del webhook */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payload del Webhook</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="formatted" className="w-full">
                      <TabsList>
                        <TabsTrigger value="formatted">Formateado</TabsTrigger>
                        <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                      </TabsList>

                      <TabsContent value="formatted">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(selectedWebhook.payload, null, 2)}
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="raw">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(selectedWebhook.payload.rawPayload, null, 2)}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Acciones */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedWebhook(null)}>
                    Cerrar
                  </Button>
                  {(selectedWebhook.status === 'failed' || selectedWebhook.status === 'retrying') && (
                    <Button
                      onClick={() => retryWebhook(selectedWebhook.id)}
                      disabled={processingWebhook === selectedWebhook.id}
                    >
                      {processingWebhook === selectedWebhook.id ? 'Reintentando...' : 'Reintentar'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminWebhooksPage