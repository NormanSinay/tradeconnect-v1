import React, { useState, useEffect } from 'react'
import { FaFileInvoice, FaDownload, FaEye, FaSearch, FaFilter, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface Invoice {
  id: string
  invoiceNumber: string
  eventTitle: string
  eventDate: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  issuedAt: string
  dueDate: string
  paidAt?: string
  felUUID?: string
  felSerie?: string
  felNumero?: string
  downloadUrl?: string
}

export const UserInvoicesPage: React.FC = () => {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get('/user/invoices')

      // Mock invoices data
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'FAC-2024-001',
          eventTitle: 'Conferencia Anual de Innovación Tecnológica',
          eventDate: '2024-01-25',
          amount: 150.00,
          currency: 'GTQ',
          status: 'paid',
          issuedAt: '2024-01-15T10:00:00Z',
          dueDate: '2024-01-20T23:59:59Z',
          paidAt: '2024-01-18T14:30:00Z',
          felUUID: '12345678-1234-1234-1234-123456789012',
          felSerie: 'A',
          felNumero: '001',
          downloadUrl: '/api/invoices/1/download'
        },
        {
          id: '2',
          invoiceNumber: 'FAC-2024-002',
          eventTitle: 'Taller de Liderazgo Empresarial',
          eventDate: '2024-01-18',
          amount: 200.00,
          currency: 'GTQ',
          status: 'pending',
          issuedAt: '2024-01-10T09:00:00Z',
          dueDate: '2024-01-15T23:59:59Z',
          downloadUrl: '/api/invoices/2/download'
        },
        {
          id: '3',
          invoiceNumber: 'FAC-2024-003',
          eventTitle: 'Seminario de Desarrollo Personal',
          eventDate: '2024-01-12',
          amount: 100.00,
          currency: 'GTQ',
          status: 'overdue',
          issuedAt: '2024-01-05T08:00:00Z',
          dueDate: '2024-01-10T23:59:59Z',
          downloadUrl: '/api/invoices/3/download'
        },
        {
          id: '4',
          invoiceNumber: 'FAC-2024-004',
          eventTitle: 'Workshop de Marketing Digital',
          eventDate: '2024-01-30',
          amount: 250.00,
          currency: 'GTQ',
          status: 'cancelled',
          issuedAt: '2024-01-20T11:00:00Z',
          dueDate: '2024-01-25T23:59:59Z',
          downloadUrl: '/api/invoices/4/download'
        }
      ]

      setInvoices(mockInvoices)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      showToast.error('Error al cargar las facturas')
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      if (!invoice.downloadUrl) {
        showToast.error('URL de descarga no disponible')
        return
      }

      // In a real app, you would call your API
      // const response = await api.get(invoice.downloadUrl, { responseType: 'blob' })

      // Mock download - create a simple PDF-like content
      const content = `
Factura: ${invoice.invoiceNumber}
Evento: ${invoice.eventTitle}
Fecha del evento: ${invoice.eventDate}
Monto: ${invoice.currency} ${invoice.amount.toFixed(2)}
Estado: ${invoice.status}
Emitida: ${new Date(invoice.issuedAt).toLocaleDateString('es-GT')}
Vence: ${new Date(invoice.dueDate).toLocaleDateString('es-GT')}
${invoice.paidAt ? `Pagada: ${new Date(invoice.paidAt).toLocaleDateString('es-GT')}` : ''}
${invoice.felUUID ? `FEL UUID: ${invoice.felUUID}` : ''}
${invoice.felSerie ? `FEL Serie: ${invoice.felSerie}` : ''}
${invoice.felNumero ? `FEL Número: ${invoice.felNumero}` : ''}
      `.trim()

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `factura-${invoice.invoiceNumber}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast.success('Factura descargada exitosamente')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      showToast.error('Error al descargar la factura')
    }
  }

  const viewInvoice = (invoice: Invoice) => {
    // In a real app, you would open a modal or navigate to a detailed view
    showToast.info(`Viendo detalles de la factura ${invoice.invoiceNumber}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><FaCheckCircle className="mr-1 h-3 w-3" />Pagada</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><FaClock className="mr-1 h-3 w-3" />Pendiente</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><FaExclamationTriangle className="mr-1 h-3 w-3" />Vencida</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><FaTimesCircle className="mr-1 h-3 w-3" />Cancelada</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <FaClock className="h-5 w-5 text-yellow-500" />
      case 'overdue':
        return <FaExclamationTriangle className="h-5 w-5 text-red-500" />
      case 'cancelled':
        return <FaTimesCircle className="h-5 w-5 text-gray-500" />
      default:
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Facturas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus facturas FEL y comprobantes de pago
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaFileInvoice className="h-8 w-8 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Pagadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaClock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vencidas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">Q</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">Q{stats.totalAmount.toFixed(2)}</p>
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
                  placeholder="Buscar por evento o número de factura..."
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
                  <SelectItem value="paid">Pagadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="overdue">Vencidas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaFileInvoice className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron facturas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes facturas que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(invoice.status)}
                      <div>
                        <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                        <CardDescription className="text-sm">
                          {invoice.eventTitle}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Fecha del evento</p>
                      <p className="font-medium">
                        {new Date(invoice.eventDate).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monto</p>
                      <p className="font-medium text-lg text-green-600">
                        {invoice.currency} {invoice.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Emitida</p>
                      <p className="font-medium">
                        {new Date(invoice.issuedAt).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vence</p>
                      <p className="font-medium">
                        {new Date(invoice.dueDate).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                  </div>

                  {invoice.paidAt && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        <FaCheckCircle className="inline mr-2" />
                        Pagada el {new Date(invoice.paidAt).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                  )}

                  {invoice.felUUID && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-800 mb-1">
                        <strong>FEL UUID:</strong> {invoice.felUUID}
                      </p>
                      <p className="text-xs text-blue-800">
                        <strong>Serie:</strong> {invoice.felSerie} | <strong>Número:</strong> {invoice.felNumero}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => viewInvoice(invoice)}
                    >
                      <FaEye className="mr-2 h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadInvoice(invoice)}
                    >
                      <FaDownload className="mr-2 h-4 w-4" />
                      Descargar
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