import React, { useState, useEffect } from 'react'
import { FaLink, FaCheckCircle, FaTimesCircle, FaClock, FaSync, FaDownload, FaSearch, FaFilter, FaCube, FaNetworkWired, FaGasPump, FaCoins, FaShieldAlt } from 'react-icons/fa'
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
  CertificateBlockchainData,
  CertificateAttributes,
  AdminPaginatedResponse,
} from '@/types/admin'

interface BlockchainTransaction {
  id: string
  certificateId: string
  certificateNumber: string
  participantName: string
  eventTitle: string
  txHash: string
  blockNumber: number
  network: string
  contractAddress: string
  gasUsed: number
  gasPrice: string
  totalCost: string
  confirmations: number
  status: 'pending' | 'confirmed' | 'failed'
  registeredAt: Date
  confirmedAt?: Date
  errorMessage?: string
}

interface BlockchainStats {
  totalRegistered: number
  confirmedCertificates: number
  pendingConfirmations: number
  failedRegistrations: number
  averageConfirmations: number
  totalGasCost: string
  averageGasCost: string
  networkDistribution: Record<string, number>
}

const AdminCertificateBlockchainPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [stats, setStats] = useState<BlockchainStats | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({
    search: '',
    status: '' as BlockchainTransaction['status'] | '',
    network: '',
    startDate: '',
    endDate: '',
  })
  const [selectedTransaction, setSelectedTransaction] = useState<BlockchainTransaction | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showBulkRegisterDialog, setShowBulkRegisterDialog] = useState(false)
  const [bulkRegisterConfig, setBulkRegisterConfig] = useState({
    eventId: '',
    limit: 50,
    batchSize: 5,
  })
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadTransactions()
    loadStats()
  }, [filters, pagination.page])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simular carga de transacciones blockchain
      const mockTransactions: BlockchainTransaction[] = [
        {
          id: 'tx-1',
          certificateId: 'cert-123',
          certificateNumber: 'CERT-2024-001',
          participantName: 'Juan Pérez',
          eventTitle: 'Conferencia de Tecnología 2024',
          txHash: '0x1234567890abcdef1234567890abcdef12345678',
          blockNumber: 18500000,
          network: 'ethereum',
          contractAddress: '0xabcdef1234567890abcdef1234567890abcdef',
          gasUsed: 21000,
          gasPrice: '20',
          totalCost: '0.00042',
          confirmations: 12,
          status: 'confirmed',
          registeredAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          confirmedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
        },
        {
          id: 'tx-2',
          certificateId: 'cert-124',
          certificateNumber: 'CERT-2024-002',
          participantName: 'María García',
          eventTitle: 'Workshop de Desarrollo Web',
          txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          blockNumber: 18500100,
          network: 'polygon',
          contractAddress: '0x1234567890abcdef1234567890abcdef123456',
          gasUsed: 25000,
          gasPrice: '30',
          totalCost: '0.00075',
          confirmations: 8,
          status: 'confirmed',
          registeredAt: new Date(Date.now() - 1000 * 60 * 30),
          confirmedAt: new Date(Date.now() - 1000 * 60 * 15),
        },
        {
          id: 'tx-3',
          certificateId: 'cert-125',
          certificateNumber: 'CERT-2024-003',
          participantName: 'Carlos López',
          eventTitle: 'Seminario de IA',
          txHash: '0xpending1234567890abcdef1234567890abcdef',
          blockNumber: 0,
          network: 'ethereum',
          contractAddress: '0xabcdef1234567890abcdef1234567890abcdef',
          gasUsed: 0,
          gasPrice: '0',
          totalCost: '0',
          confirmations: 0,
          status: 'pending',
          registeredAt: new Date(Date.now() - 1000 * 60 * 5),
        },
      ]

      setTransactions(mockTransactions)
      setPagination(prev => ({ ...prev, total: mockTransactions.length }))

    } catch (err: any) {
      console.error('Error cargando transacciones:', err)
      setError('Error al cargar las transacciones blockchain')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Simular estadísticas blockchain
      const mockStats: BlockchainStats = {
        totalRegistered: 1250,
        confirmedCertificates: 1180,
        pendingConfirmations: 45,
        failedRegistrations: 25,
        averageConfirmations: 12.5,
        totalGasCost: '15.75',
        averageGasCost: '0.0126',
        networkDistribution: {
          ethereum: 850,
          polygon: 325,
          bsc: 75,
        },
      }

      setStats(mockStats)

    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const handleRegisterInBlockchain = async (certificateId: string) => {
    try {
      await adminCertificateService.registerCertificateInBlockchain(certificateId)
      await loadTransactions()
    } catch (err: any) {
      console.error('Error registrando en blockchain:', err)
      setError('Error al registrar el certificado en blockchain')
    }
  }

  const handleBulkRegister = async () => {
    try {
      setError(null)

      // Simular registro masivo
      const pendingTransactions = transactions.filter(tx => tx.status === 'pending').slice(0, bulkRegisterConfig.limit)

      for (let i = 0; i < pendingTransactions.length; i += bulkRegisterConfig.batchSize) {
        const batch = pendingTransactions.slice(i, i + bulkRegisterConfig.batchSize)

        await Promise.all(batch.map(tx => handleRegisterInBlockchain(tx.certificateId)))

        // Esperar entre lotes
        if (i + bulkRegisterConfig.batchSize < pendingTransactions.length) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      setShowBulkRegisterDialog(false)
      await loadTransactions()

    } catch (err: any) {
      console.error('Error en registro masivo:', err)
      setError('Error en el registro masivo en blockchain')
    }
  }

  const handleVerifyInBlockchain = async (txHash: string) => {
    try {
      const result = await adminCertificateService.verifyCertificateInBlockchain(txHash)
      console.log('Verificación blockchain:', result)
    } catch (err: any) {
      console.error('Error verificando en blockchain:', err)
      setError('Error al verificar en blockchain')
    }
  }

  const exportBlockchainData = async (format: 'csv' | 'excel') => {
    try {
      await adminCertificateService.exportBlockchainReport(format, {
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      })

      // Simular descarga
      const csvContent = [
        ['Certificado', 'Participante', 'Tx Hash', 'Red', 'Estado', 'Confirmaciones', 'Costo Gas'].join(','),
        ...transactions.map(tx => [
          tx.certificateNumber,
          tx.participantName,
          tx.txHash,
          tx.network,
          tx.status,
          tx.confirmations,
          tx.totalCost,
        ].join(',')),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blockchain-report.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (err: any) {
      console.error('Error exportando datos blockchain:', err)
      setError('Error al exportar los datos blockchain')
    }
  }

  const getStatusBadge = (status: BlockchainTransaction['status']) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      failed: 'destructive',
    } as const

    const icons = {
      pending: <FaClock className="mr-1" />,
      confirmed: <FaCheckCircle className="mr-1" />,
      failed: <FaTimesCircle className="mr-1" />,
    }

    return (
      <Badge variant={variants[status]}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getNetworkBadge = (network: string) => {
    const colors = {
      ethereum: 'bg-blue-100 text-blue-800',
      polygon: 'bg-purple-100 text-purple-800',
      bsc: 'bg-yellow-100 text-yellow-800',
    } as const

    return (
      <Badge className={colors[network as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        <FaNetworkWired className="mr-1" />
        {network.toUpperCase()}
      </Badge>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Certificados', href: '/admin/certificados' },
    { label: 'Blockchain' },
  ]

  return (
    <AdminLayout title="Registro Blockchain de Certificados" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Registro Blockchain</h1>
            <p className="text-gray-600 mt-1">
              Gestión y verificación de certificados registrados en blockchain
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => exportBlockchainData('csv')}>
              <FaDownload className="mr-2" />
              Exportar Reporte
            </Button>
            <Dialog open={showBulkRegisterDialog} onOpenChange={setShowBulkRegisterDialog}>
              <DialogTrigger asChild>
                <Button>
                  <FaLink className="mr-2" />
                  Registro Masivo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registro Masivo en Blockchain</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Límite de Registros</label>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={bulkRegisterConfig.limit}
                      onChange={(e) => setBulkRegisterConfig(prev => ({ ...prev, limit: parseInt(e.target.value) || 50 }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tamaño del Lote</label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={bulkRegisterConfig.batchSize}
                      onChange={(e) => setBulkRegisterConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowBulkRegisterDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleBulkRegister}>
                      Iniciar Registro
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
                    <p className="text-sm font-medium text-gray-600">Total Registrados</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalRegistered}</p>
                  </div>
                  <FaLink className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmados</p>
                    <p className="text-3xl font-bold text-green-600">{stats.confirmedCertificates}</p>
                  </div>
                  <FaCheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Costo Total Gas</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalGasCost} ETH</p>
                  </div>
                  <FaCoins className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmaciones Promedio</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.averageConfirmations}</p>
                  </div>
                  <FaShieldAlt className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Distribución por red */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Red Blockchain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.networkDistribution).map(([network, count]) => (
                  <div key={network} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getNetworkBadge(network)}
                      <span className="font-medium">{count} certificados</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {((count / stats.totalRegistered) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                  placeholder="Buscar por certificado o participante..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as BlockchainTransaction['status'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="failed">Fallido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filters.network} onValueChange={(value) => setFilters(prev => ({ ...prev, network: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Red" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
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
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={loadTransactions}>
                  <FaSearch className="mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" onClick={() => setFilters({ search: '', status: '', network: '', startDate: '', endDate: '' })}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de transacciones */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Blockchain ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificado</TableHead>
                  <TableHead>Participante</TableHead>
                  <TableHead>Red</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Confirmaciones</TableHead>
                  <TableHead>Costo Gas</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-sm">
                      {tx.certificateNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tx.participantName}</p>
                        <p className="text-sm text-gray-500">{tx.eventTitle}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getNetworkBadge(tx.network)}</TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <Badge variant="outline">{tx.confirmations}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className="font-medium">{tx.totalCost} ETH</p>
                        <p className="text-sm text-gray-500">{tx.gasUsed} gas</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(tx.registeredAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTransaction(tx)
                            setShowDetailsDialog(true)
                          }}
                        >
                          <FaCube className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyInBlockchain(tx.txHash)}
                        >
                          <FaShieldAlt className="h-3 w-3" />
                        </Button>
                        {tx.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRegisterInBlockchain(tx.certificateId)}
                          >
                            <FaSync className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {transactions.length === 0 && !loading && (
              <div className="text-center py-8">
                <FaLink className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron transacciones blockchain
                </h3>
                <p className="text-gray-600">
                  Las transacciones blockchain aparecerán aquí cuando se registren certificados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de detalles */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de Transacción Blockchain</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-6">
                <Tabs defaultValue="transaction" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="transaction">Transacción</TabsTrigger>
                    <TabsTrigger value="gas">Gas</TabsTrigger>
                    <TabsTrigger value="verification">Verificación</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transaction" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Certificado</label>
                        <p className="font-mono text-sm">{selectedTransaction.certificateNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Estado</label>
                        <p>{getStatusBadge(selectedTransaction.status)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Hash de Transacción</label>
                        <p className="font-mono text-xs break-all">{selectedTransaction.txHash}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Número de Bloque</label>
                        <p>{selectedTransaction.blockNumber || 'Pendiente'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Red</label>
                        <p>{getNetworkBadge(selectedTransaction.network)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Confirmaciones</label>
                        <p>{selectedTransaction.confirmations}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Registrado</label>
                        <p>{formatDateTime(selectedTransaction.registeredAt)}</p>
                      </div>
                      {selectedTransaction.confirmedAt && (
                        <div>
                          <label className="text-sm font-medium">Confirmado</label>
                          <p>{formatDateTime(selectedTransaction.confirmedAt)}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="gas" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Gas Usado</label>
                        <p className="text-lg font-bold">{selectedTransaction.gasUsed.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Precio del Gas</label>
                        <p>{selectedTransaction.gasPrice} gwei</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Costo Total</label>
                        <p className="text-lg font-bold text-green-600">{selectedTransaction.totalCost} ETH</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Dirección del Contrato</label>
                        <p className="font-mono text-xs break-all">{selectedTransaction.contractAddress}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="verification" className="space-y-4">
                    <div className="text-center py-8">
                      <FaShieldAlt className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Verificación Blockchain</h3>
                      <p className="text-gray-600 mb-4">
                        Este certificado está {selectedTransaction.status === 'confirmed' ? 'verificado' : 'pendiente de verificación'} en blockchain
                      </p>
                      <Button onClick={() => handleVerifyInBlockchain(selectedTransaction.txHash)}>
                        Verificar en Blockchain
                      </Button>
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

export default AdminCertificateBlockchainPage