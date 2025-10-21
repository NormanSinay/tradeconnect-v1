import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaFileInvoice, FaDownload, FaArrowLeft, FaEye, FaCheckCircle, FaExclamationTriangle, FaFilePdf, FaFileCode } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface InvoiceDetail {
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
  buyerName: string
  buyerNIT: string
  buyerEmail: string
  buyerAddress: string
  sellerName: string
  sellerNIT: string
  sellerAddress: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  pdfUrl?: string
  xmlUrl?: string
}

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchInvoiceDetail()
    }
  }, [id])

  const fetchInvoiceDetail = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get(`/user/invoices/${id}`)

      // Mock invoice detail
      const mockInvoice: InvoiceDetail = {
        id: id || 'inv-1',
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
        buyerName: 'Juan Pérez García',
        buyerNIT: '12345678-9',
        buyerEmail: 'juan.perez@email.com',
        buyerAddress: 'Ciudad de Guatemala, Guatemala',
        sellerName: 'TradeConnect S.A.',
        sellerNIT: '98765432-1',
        sellerAddress: 'Zona 10, Ciudad de Guatemala',
        items: [
          {
            description: 'Inscripción Conferencia Anual de Innovación Tecnológica',
            quantity: 1,
            unitPrice: 150.00,
            total: 150.00
          }
        ],
        subtotal: 130.43,
        tax: 19.57,
        total: 150.00,
        pdfUrl: '/api/invoices/1/download/pdf',
        xmlUrl: '/api/invoices/1/download/xml'
      }

      setInvoice(mockInvoice)
    } catch (error) {
      console.error('Error fetching invoice detail:', error)
      showToast.error('Error al cargar los detalles de la factura')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = async (url: string, filename: string, type: 'pdf' | 'xml') => {
    try {
      setIsDownloading(true)

      // In a real app, you would call your API
      // const response = await api.get(url, { responseType: 'blob' })

      // Mock download
      let content = ''
      let mimeType = ''

      if (type === 'pdf') {
        content = `Factura PDF: ${invoice?.invoiceNumber}\nContenido simulado del PDF...`
        mimeType = 'application/pdf'
      } else {
        content = `<?xml version="1.0" encoding="UTF-8"?>
<FacturaElectronica xmlns="http://www.sat.gob.gt/fel/1.0.0">
  <Numero>${invoice?.invoiceNumber}</Numero>
  <Fecha>${invoice?.issuedAt}</Fecha>
  <Comprador>
    <Nombre>${invoice?.buyerName}</Nombre>
    <NIT>${invoice?.buyerNIT}</NIT>
  </Comprador>
  <Vendedor>
    <Nombre>${invoice?.sellerName}</Nombre>
    <NIT>${invoice?.sellerNIT}</NIT>
  </Vendedor>
  <Total>${invoice?.total}</Total>
</FacturaElectronica>`
        mimeType = 'application/xml'
      }

      const blob = new Blob([content], { type: mimeType })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      showToast.success(`${type.toUpperCase()} descargado exitosamente`)
    } catch (error) {
      console.error(`Error downloading ${type}:`, error)
      showToast.error(`Error al descargar el ${type.toUpperCase()}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><FaCheckCircle className="mr-1 h-3 w-3" />Pagada</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><FaExclamationTriangle className="mr-1 h-3 w-3" />Vencida</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelada</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconocido</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Factura no encontrada</h2>
          <p className="mt-2 text-sm text-gray-600">
            No se pudo encontrar la factura solicitada.
          </p>
          <Button onClick={() => navigate('/mis-facturas')} className="mt-4">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis facturas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/mis-facturas')}
            className="mb-4"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis facturas
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Factura {invoice.invoiceNumber}</h1>
          <p className="text-gray-600 mt-1">
            Detalles completos de tu factura FEL
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FaFileInvoice className="mr-2 h-5 w-5" />
                      {invoice.invoiceNumber}
                    </CardTitle>
                    <CardDescription>
                      {invoice.eventTitle}
                    </CardDescription>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de emisión</label>
                    <p className="text-lg font-semibold">
                      {new Date(invoice.issuedAt).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de vencimiento</label>
                    <p className="text-lg font-semibold">
                      {new Date(invoice.dueDate).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Total</label>
                    <p className="text-2xl font-bold text-green-600">
                      {invoice.currency} {invoice.total.toFixed(2)}
                    </p>
                  </div>
                  {invoice.paidAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fecha de pago</label>
                      <p className="text-lg font-semibold">
                        {new Date(invoice.paidAt).toLocaleDateString('es-GT')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* FEL Information */}
            {invoice.felUUID && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información FEL</CardTitle>
                  <CardDescription>
                    Datos de la Factura Electrónica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">UUID</label>
                      <p className="text-sm font-mono break-all">{invoice.felUUID}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Serie</label>
                      <p className="text-lg font-semibold">{invoice.felSerie}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Número</label>
                      <p className="text-lg font-semibold">{invoice.felNumero}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Buyer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Comprador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <p>{invoice.buyerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">NIT</label>
                    <p>{invoice.buyerNIT}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p>{invoice.buyerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dirección</label>
                    <p>{invoice.buyerAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <p>{invoice.sellerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">NIT</label>
                    <p>{invoice.sellerNIT}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dirección</label>
                    <p>{invoice.sellerAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalle de Productos/Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.currency} {item.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{invoice.currency} {item.unitPrice.toFixed(2)} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{invoice.currency} {invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (12%):</span>
                    <span>{invoice.currency} {invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{invoice.currency} {invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descargar Factura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.pdfUrl && (
                  <Button
                    onClick={() => downloadFile(invoice.pdfUrl!, `factura-${invoice.invoiceNumber}.pdf`, 'pdf')}
                    disabled={isDownloading}
                    className="w-full"
                    variant="default"
                  >
                    <FaFilePdf className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </Button>
                )}
                {invoice.xmlUrl && (
                  <Button
                    onClick={() => downloadFile(invoice.xmlUrl!, `factura-${invoice.invoiceNumber}.xml`, 'xml')}
                    disabled={isDownloading}
                    className="w-full"
                    variant="outline"
                  >
                    <FaFileCode className="mr-2 h-4 w-4" />
                    Descargar XML
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado de la Factura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estado:</span>
                    {getStatusBadge(invoice.status)}
                  </div>
                  {invoice.paidAt && (
                    <div className="text-sm">
                      <span className="font-medium">Pagada el:</span>
                      <p>{new Date(invoice.paidAt).toLocaleDateString('es-GT')}</p>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Vence el:</span>
                    <p>{new Date(invoice.dueDate).toLocaleDateString('es-GT')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/mis-facturas')}
                  variant="outline"
                  className="w-full"
                >
                  <FaEye className="mr-2 h-4 w-4" />
                  Ver todas las facturas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}