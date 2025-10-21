import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaDownload, FaTrash, FaEdit, FaEye, FaFileContract, FaCheck, FaTimes, FaClock } from 'react-icons/fa'
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
  PublicContract,
  ContractQueryParams,
  ContractFilters,
  ContractStatus,
  PaymentTerms,
} from '@/types/admin'

interface AdminSpeakerContractsPageProps {
  speakerId: number
}

const AdminSpeakerContractsPage: React.FC<AdminSpeakerContractsPageProps> = ({ speakerId }) => {
  const [contracts, setContracts] = useState<PublicContract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContracts, setSelectedContracts] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ContractFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalContracts, setTotalContracts] = useState(0)
  const [speaker, setSpeaker] = useState<{ id: number; fullName: string } | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadContracts()
    loadSpeaker()
  }, [currentPage, filters, searchTerm, speakerId])

  // Cargar contratos
  const loadContracts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: ContractQueryParams = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        filters,
      }

      const result = await adminSpeakerService.getSpeakerContracts(speakerId, params)
      setContracts(result.contracts)
      setTotalPages(result.pagination.pages)
      setTotalContracts(result.pagination.total)
    } catch (err) {
      console.error('Error cargando contratos:', err)
      setError('Error al cargar los contratos')
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
  const handleFilterChange = (newFilters: Partial<ContractFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  // Manejar selección de contratos
  const handleSelectContract = (contractId: number, checked: boolean) => {
    setSelectedContracts(prev =>
      checked
        ? [...prev, contractId]
        : prev.filter(id => id !== contractId)
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedContracts(checked ? contracts.map(c => c.id) : [])
  }

  // Acciones individuales
  const handleViewContract = (contract: PublicContract) => {
    // TODO: Navigate to contract detail
    console.log('View contract:', contract)
  }

  const handleEditContract = (contract: PublicContract) => {
    // TODO: Navigate to edit contract
    console.log('Edit contract:', contract)
  }

  const handleApproveContract = async (contractId: number) => {
    try {
      await adminSpeakerService.approveContract(speakerId, contractId)
      loadContracts()
    } catch (error) {
      console.error('Error aprobando contrato:', error)
      setError('Error al aprobar el contrato')
    }
  }

  const handleRejectContract = async (contractId: number) => {
    const reason = prompt('Razón del rechazo:')
    if (!reason) return

    try {
      await adminSpeakerService.rejectContract(speakerId, contractId, reason)
      loadContracts()
    } catch (error) {
      console.error('Error rechazando contrato:', error)
      setError('Error al rechazar el contrato')
    }
  }

  const handleDeleteContract = async (contractId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este contrato?')) return

    try {
      // TODO: Implement delete contract method
      console.log('Delete contract:', contractId)
      loadContracts()
    } catch (err) {
      console.error('Error eliminando contrato:', err)
      setError('Error al eliminar el contrato')
    }
  }

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedContracts.length === 0) return
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedContracts.length} contratos?`)) return

    try {
      // TODO: Implement bulk delete
      setSelectedContracts([])
      loadContracts()
    } catch (err) {
      console.error('Error eliminando contratos:', err)
      setError('Error al eliminar los contratos')
    }
  }

  const handleBulkExport = async () => {
    try {
      await adminSpeakerService.exportSpeakerContracts(speakerId, 'excel')
      // TODO: Handle file download
    } catch (err) {
      console.error('Error exportando contratos:', err)
      setError('Error al exportar los contratos')
    }
  }

  // Obtener badge de estado
  const getStatusBadge = (status: ContractStatus) => {
    const variants: Record<ContractStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      sent: 'outline',
      signed: 'default',
      rejected: 'destructive',
      cancelled: 'destructive',
    }
    return variants[status] || 'secondary'
  }

  // Obtener texto de estado
  const getStatusText = (status: ContractStatus) => {
    const texts: Record<ContractStatus, string> = {
      draft: 'Borrador',
      sent: 'Enviado',
      signed: 'Firmado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
    }
    return texts[status] || status
  }

  // Obtener texto de términos de pago
  const getPaymentTermsText = (terms: PaymentTerms) => {
    const texts: Record<PaymentTerms, string> = {
      full_payment: 'Pago completo',
      advance_payment: 'Pago anticipado',
      installments: 'Cuotas',
    }
    return texts[terms] || terms
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Speakers', href: '/admin/speakers' },
    { label: speaker?.fullName || 'Speaker', href: `/admin/speakers/${speakerId}/editar` },
    { label: 'Contratos' },
  ]

  return (
    <AdminLayout title={`Contratos - ${speaker?.fullName || 'Speaker'}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contratos de {speaker?.fullName}</h1>
            <p className="text-gray-600">Gestiona todos los contratos del speaker</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBulkExport}>
              <FaDownload className="mr-2" />
              Exportar
            </Button>
            <Button onClick={() => {/* TODO: Navigate to create contract */}}>
              <FaPlus className="mr-2" />
              Nuevo Contrato
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
                  placeholder="Buscar contratos..."
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
                    status: e.target.value ? [e.target.value as ContractStatus] : undefined
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="draft">Borrador</option>
                  <option value="sent">Enviado</option>
                  <option value="signed">Firmado</option>
                  <option value="rejected">Rechazado</option>
                  <option value="cancelled">Cancelado</option>
                </select>

                <select
                  value={filters.paymentTerms?.[0] || ''}
                  onChange={(e) => handleFilterChange({
                    paymentTerms: e.target.value ? [e.target.value as PaymentTerms] : undefined
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todos los términos</option>
                  <option value="full_payment">Pago completo</option>
                  <option value="advance_payment">Pago anticipado</option>
                  <option value="installments">Cuotas</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones masivas */}
        {selectedContracts.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedContracts.length} contrato{selectedContracts.length > 1 ? 's' : ''} seleccionado{selectedContracts.length > 1 ? 's' : ''}
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

        {/* Tabla de contratos */}
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
            ) : contracts.length === 0 ? (
              <div className="p-12 text-center">
                <FaFileContract className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron contratos
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros de búsqueda.'
                    : 'Aún no hay contratos registrados para este speaker.'}
                </p>
                <Button onClick={() => {/* TODO: Navigate to create */}}>
                  <FaPlus className="mr-2" />
                  Crear primer contrato
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedContracts.length === contracts.length && contracts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Términos de Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Firma</TableHead>
                    <TableHead>Estado de Pagos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedContracts.includes(contract.id)}
                          onCheckedChange={(checked) => handleSelectContract(contract.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contract.contractNumber}</div>
                          <div className="text-sm text-gray-500">
                            ID: {contract.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contract.eventTitle}</div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(contract.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {contract.currency} {contract.agreedAmount.toFixed(2)}
                          </div>
                          {contract.advanceAmount && (
                            <div className="text-sm text-gray-500">
                              Anticipo: {contract.currency} {contract.advanceAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentTermsText(contract.paymentTerms)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(contract.status)}>
                          {getStatusText(contract.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contract.signedAt ? (
                          <div>
                            <div className="font-medium">
                              {formatDateTime(contract.signedAt)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {contract.status === 'signed' ? 'Pagos activos' : 'Sin pagos'}
                          </Badge>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleViewContract(contract)}>
                              <FaEye className="mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditContract(contract)}>
                              <FaEdit className="mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {contract.status === 'sent' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveContract(contract.id)}>
                                  <FaCheck className="mr-2" />
                                  Aprobar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectContract(contract.id)}>
                                  <FaTimes className="mr-2" />
                                  Rechazar
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteContract(contract.id)}
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
              Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalContracts)} de {totalContracts} contratos
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

export default AdminSpeakerContractsPage