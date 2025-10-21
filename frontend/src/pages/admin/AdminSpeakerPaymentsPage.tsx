import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaTrash, FaEdit, FaEye, FaMoneyBillWave, FaCheck, FaTimes, FaClock, FaFileInvoiceDollar } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminSpeakerService } from '@/services/admin'
import { formatDateTime } from '@/utils/date'
import type {
  PublicPayment,
  PaymentQueryParams,
  PaymentFilters,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
} from '@/types/admin'

interface AdminSpeakerPaymentsPageProps {
  speakerId: number
}

const AdminSpeakerPaymentsPage: React.FC<AdminSpeakerPaymentsPageProps> = ({ speakerId }) => {
  const [payments, setPayments] = useState<PublicPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayments, setSelectedPayments] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPayments, setTotalPayments] = useState(0)
  const [speaker, setSpeaker] = useState<{ id: number; fullName: string } | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadPayments()
    loadSpeaker()
  }, [currentPage, filters, searchTerm, speakerId])

  // Cargar pagos
  const loadPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Implement getSpeakerPayments method
      // const result = await adminSpeakerService.getSpeakerPayments(speakerId, params)
      // setPayments(result.payments)
      // setTotalPages(result.pagination.pages)
      // setTotalPayments(result.pagination.total)

      // Mock data for now
      setPayments([])
      setTotalPages(1)
      setTotalPayments(0)
    } catch (err) {
      console.error('Error cargando pagos:', err)
      setError('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  // Cargar información del speaker
  const loadSpeaker = async () => {
    try {
      const speakerData = await adminSpeakerService.getSpeakerById(speakerId)
      setSpeaker({ id: speakerData.id, fullName: speakerData.fullName })
    } catch (error) {
      console.error('Error cargando speaker:', error)
    }
  }

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Manejar filtros
  const handleFilterChange = (newFilters: Partial<PaymentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  // Manejar selección de pagos
  const handleSelectPayment = (paymentId: number, checked: boolean) => {
    setSelectedPayments(prev =>
      checked
        ? [...prev, paymentId]
        : prev.filter(id => id !== paymentId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedPayments(checked ? payments.map(p => p.id) : [])
  }

  // Acciones individuales
  const handleViewPayment = (payment: PublicPayment) => {
    // TODO: Navigate to payment detail
    console.log('View payment:', payment)
  }

  const handleEditPayment = (payment: PublicPayment) => {
    // TODO: Navigate to edit payment
    console.log('Edit payment:', payment)
  }

  const handleApprovePayment = async (contractId: number, paymentId: number) => {
    try {
      await adminSpeakerService.approvePayment(speakerId, contractId, paymentId)
      loadPayments()
    } catch (error) {
      console.error('Error aprobando pago:', error)
      setError('Error al aprobar el pago')
    }
  }

  const handleRejectPayment = async (contractId: number, paymentId: number) => {
    const reason = prompt('Razón del rechazo:')
    if (!reason) return

    try {
      await adminSpeakerService.rejectPayment(speakerId, contractId, paymentId, reason)
      loadPayments()
    } catch (error) {
      console.error('Error rechazando pago:', error)
      setError('Error al rechazar el pago')
    }
  }

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pago?')) return

    try {
      // TODO: Implement delete payment method
      console.log('Delete payment:', paymentId)
      loadPayments()
    } catch (err) {
      console.error('Error eliminando pago:', err)
      setError('Error al eliminar el pago')
    }
  }

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedPayments.length === 0) return
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedPayments.length} pagos?`)) return

    try {
      // TODO: Implement bulk delete
      setSelectedPayments([])
      loadPayments()
    } catch (err) {
      console.error('Error eliminando pagos:', err)
      setError('Error al eliminar los pagos')
    }
  }

  const handleBulkExport = async () => {
    try {
      // TODO: Implement export payments
      console.log('Export payments')
    } catch (err) {
      console.error('Error exportando pagos:', err)
      setError('Error al exportar los pagos')
    }
  }

  // Obtener badge de estado
  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'outline',
      completed: 'default',
      rejected: 'destructive',
      cancelled: 'destructive',
    }
    return variants[status] || 'secondary'
  }

  // Obtener texto de estado
  const getStatusText = (status: PaymentStatus) => {
    const texts: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
    }
    return texts[status] || status
  }

  // Obtener texto de tipo de pago
  const getPaymentTypeText = (type: PaymentType) => {
    const texts: Record<PaymentType, string> = {
      advance: 'Anticipo',
      final: 'Final',
      installment: 'Cuota',
    }
    return texts[type] || type
  }

  // Obtener texto de método de pago
  const getPaymentMethodText = (method: PaymentMethod) => {
    const texts: Record<PaymentMethod, string> = {
      bank_transfer: 'Transferencia bancaria',
      check: 'Cheque',
      cash: 'Efectivo',
      paypal: 'PayPal',
      other: 'Otro',
    }
    return texts[method] || method
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Speakers', href: '/admin/speakers' },
    { label: speaker?.fullName || 'Speaker', href: `/admin/speakers/${speakerId}/editar` },
    { label: 'Pagos' },
  ]

  return (
    <AdminLayout title={`Pagos - ${speaker?.fullName || 'Speaker'}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pagos de {speaker?.fullName}</h1>
            <p className="text-gray-600">Gestiona todos los pagos del speaker</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={() => {/* TODO: Navigate to create payment */}}>
              <FaPlus className="mr-2" />
              Nuevo Pago
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar pagos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2">
                <select
                  value={filters.status?.[0] || ''}
                  onChange={(e) => handleFilterChange({
                    status: e.target.value ? [e.target.value as any] : undefined
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="completed">Completado</option>
                  <option value="rejected">Rechazado</option>
                  <option value="cancelled">Cancelado</option>
                </select>

                <select
                  value={filters.paymentType?.[0] || ''}
                  onChange={(e) => handleFilterChange({
                    paymentType: e.target.value ? [e.target.value as PaymentType] : undefined
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="advance">Anticipo</option>
                  <option value="final">Final</option>
                  <option value="installment">Cuota</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedPayments.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedPayments.length} pago{selectedPayments.length > 1 ? 's' : ''} seleccionado{selectedPayments.length > 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <FaDownload className="mr-2" />
                    Exportar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <FaTrash className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de pagos */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center">
                <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron pagos
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay pagos registrados para este speaker.'}
                </p>
                <Button onClick={() => {/* TODO: Navigate to create */}}>
                  <FaPlus className="mr-2" />
                  Crear primer pago
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPayments.length === payments.length && payments.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Fecha Programada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPayments.includes(payment.id)}
                          onCheckedChange={(checked) => handleSelectPayment(payment.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.paymentNumber}</div>
                          <div className="text-sm text-gray-500">
                            ID: {payment.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Contrato #{payment.contractId}</div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(payment.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.currency} {payment.amount.toFixed(2)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentTypeText(payment.paymentType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentMethodText(payment.paymentMethod)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDateTime(payment.scheduledDate)}
                          </div>
                          {payment.actualPaymentDate && (
                            <div className="text-sm text-gray-500">
                              Pagado: {formatDateTime(payment.actualPaymentDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FaFilter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewPayment(payment)}>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {payment.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprovePayment(payment.contractId, payment.id)}>
                                  <FaCheck className="mr-2" />
                                  Aprobar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectPayment(payment.contractId, payment.id)}>
                                  <FaTimes className="mr-2" />
                                  Rechazar
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-red-600"
                            >
                              <FaTrash className="mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalPayments)} de {totalPayments} pagos
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FaTimes className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminSpeakerPaymentsPage