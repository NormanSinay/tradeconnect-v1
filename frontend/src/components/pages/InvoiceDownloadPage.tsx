import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaFileInvoice, FaDownload, FaArrowLeft, FaFilePdf, FaFileCode, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface InvoiceDownload {
  id: string
  invoiceNumber: string
  eventTitle: string
  eventDate: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  issuedAt: string
  felUUID?: string
  felSerie?: string
  felNumero?: string
  pdfUrl?: string
  xmlUrl?: string
}

export const InvoiceDownloadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invoice, setInvoice] = useState<InvoiceDownload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchInvoiceData()
    }
  }, [id])

  const fetchInvoiceData = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get(`/user/invoices/${id}`)

      // Mock invoice data
      const mockInvoice: InvoiceDownload = {
        id: id || 'inv-1',
        invoiceNumber: 'FAC-2024-001',
        eventTitle: 'Conferencia Anual de Innovación Tecnológica',
        eventDate: '2024-01-25',
        amount: 150.00,
        currency: 'GTQ',
        status: 'paid',
        issuedAt: '2024-01-15T10:00:00Z',
        felUUID: '12345678-1234-1234-1234-123456789012',
        felSerie: 'A',
        felNumero: '001',
        pdfUrl: '/api/invoices/1/download/pdf',
        xmlUrl: '/api/invoices/1/download/xml'
      }

      setInvoice(mockInvoice)
    } catch (error) {
      console.error('Error fetching invoice data:', error)
      showToast.error('Error al cargar los datos de la factura')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = async (type: 'pdf' | 'xml') => {
    if (!invoice) return

    try {
      setIsDownloading(true)

      const url = type === 'pdf' ? invoice.pdfUrl : invoice.xmlUrl
      if (!url) {
        showToast.error(`URL de descarga ${type.toUpperCase()} no disponible`)
        return
      }

      // In a real app, you would call your API
      // const response = await api.get(url, { responseType: 'blob' })

      // Mock download
      let content = ''
      let mimeType = ''
      let filename = `factura-${invoice.invoiceNumber}.${type}`

      if (type === 'pdf') {
        content = `Factura PDF: ${invoice.invoiceNumber}
Evento: ${invoice.eventTitle}
Fecha del evento: ${invoice.eventDate}
Monto: ${invoice.currency} ${invoice.amount.toFixed(2)}
Estado: ${invoice.status}
Emitida: ${new Date(invoice.issuedAt).toLocaleDateString('es-GT')}
${invoice.felUUID ? `FEL UUID: ${invoice.felUUID}` : ''}
${invoice.felSerie ? `FEL Serie: ${invoice.felSerie}` : ''}
${invoice.felNumero ? `FEL Número: ${invoice.felNumero}` : ''}

Contenido simulado del PDF de la factura FEL...
Esta es una representación del archivo PDF que se descargaría.`
        mimeType = 'application/pdf'
      } else {
        content = `<?xml version="1.0" encoding="UTF-8"?>
<FacturaElectronica xmlns="http://www.sat.gob.gt/fel/1.0.0">
  <Cabecera>
    <NumeroFactura>${invoice.invoiceNumber}</NumeroFactura>
    <FechaEmision>${new Date(invoice.issuedAt).toISOString()}</FechaEmision>
    <Tipo>FACT</Tipo>
  </Cabecera>
  <Emisor>
    <Nombre>TradeConnect S.A.</Nombre>
    <NIT>987654321</NIT>
    <Direccion>Zona 10, Ciudad de Guatemala</Direccion>
  </Emisor>
  <Receptor>
    <Nombre>${user?.name || 'Usuario'}</Nombre>
    <NIT>${user?.nit || '123456789'}</NIT>
  </Receptor>
  <Detalle>
    <Linea>
      <BienOServicio>${invoice.eventTitle}</BienOServicio>
      <Cantidad>1</Cantidad>
      <PrecioUnitario>${invoice.amount.toFixed(2)}</PrecioUnitario>
      <Total>${invoice.amount.toFixed(2)}</Total>
    </Linea>
  </Detalle>
  <Totales>
    <Total>${invoice.amount.toFixed(2)}</Total>
  </Totales>
  ${invoice.felUUID ? `<ComplementoFEL>
    <UUID>${invoice.felUUID}</UUID>
    <Serie>${invoice.felSerie}</Serie>
    <Numero>${invoice.felNumero}</Numero>
  </ComplementoFEL>` : ''}
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
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900">Descargar Factura</h1>
          <p className="text-gray-600 mt-1">
            Descarga tu factura FEL en formato PDF o XML
          </p>
        </div>

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
          <CardContent className="space-y-6">
            {/* Invoice Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fecha del evento:</span>
                  <p className="mt-1">{new Date(invoice.eventDate).toLocaleDateString('es-GT')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Monto:</span>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {invoice.currency} {invoice.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Emitida:</span>
                  <p className="mt-1">{new Date(invoice.issuedAt).toLocaleDateString('es-GT')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estado:</span>
                  <p className="mt-1">{invoice.status}</p>
                </div>
              </div>
            </div>

            {/* FEL Information */}
            {invoice.felUUID && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Información FEL</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">UUID:</span>
                    <p className="font-mono text-xs break-all mt-1">{invoice.felUUID}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Serie:</span>
                    <p className="mt-1">{invoice.felSerie}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Número:</span>
                    <p className="mt-1">{invoice.felNumero}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Download Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Opciones de descarga</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoice.pdfUrl && (
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <FaFilePdf className="mx-auto h-12 w-12 text-red-500 mb-3" />
                      <h4 className="font-semibold mb-2">Factura PDF</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Versión imprimible de tu factura
                      </p>
                      <Button
                        onClick={() => downloadFile('pdf')}
                        disabled={isDownloading}
                        className="w-full"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Descargando...
                          </>
                        ) : (
                          <>
                            <FaDownload className="mr-2 h-4 w-4" />
                            Descargar PDF
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {invoice.xmlUrl && (
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <FaFileCode className="mx-auto h-12 w-12 text-blue-500 mb-3" />
                      <h4 className="font-semibold mb-2">Factura XML</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Archivo XML para sistemas contables
                      </p>
                      <Button
                        onClick={() => downloadFile('xml')}
                        disabled={isDownloading}
                        variant="outline"
                        className="w-full"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
                            Descargando...
                          </>
                        ) : (
                          <>
                            <FaDownload className="mr-2 h-4 w-4" />
                            Descargar XML
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Information */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Información importante</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• El PDF es la versión oficial para impresión y presentación</li>
                    <li>• El XML contiene todos los datos técnicos de la factura FEL</li>
                    <li>• Ambos archivos son válidos legalmente en Guatemala</li>
                    <li>• Guarda estos archivos en un lugar seguro</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => navigate(`/factura/${invoice.id}`)}
                variant="outline"
              >
                <FaFileInvoice className="mr-2 h-4 w-4" />
                Ver detalles completos
              </Button>
              <Button
                onClick={() => navigate('/mis-facturas')}
                variant="ghost"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Volver a facturas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}