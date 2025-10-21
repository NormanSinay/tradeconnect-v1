import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaFileInvoice, FaPaperPlane, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

interface OrderData {
  id: string
  eventTitle: string
  eventDate: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'completed'
  createdAt: string
  hasInvoice: boolean
}

interface InvoiceRequestForm {
  nit: string
  name: string
  email: string
  address: string
  notes: string
}

export const InvoiceRequestPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [form, setForm] = useState<InvoiceRequestForm>({
    nit: '',
    name: '',
    email: '',
    address: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderData()
    }
  }, [orderId])

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        nit: (user as any).nit || '',
        address: (user as any).address || ''
      }))
    }
  }, [user])

  const fetchOrderData = async () => {
    try {
      setIsLoading(true)
      // In a real app, you would call your API
      // const response = await api.get(`/user/orders/${orderId}`)

      // Mock order data
      const mockOrder: OrderData = {
        id: orderId || 'order-1',
        eventTitle: 'Conferencia Anual de Innovación Tecnológica',
        eventDate: '2024-01-25',
        amount: 150.00,
        currency: 'GTQ',
        status: 'paid',
        createdAt: '2024-01-18T14:30:00Z',
        hasInvoice: false
      }

      setOrder(mockOrder)
    } catch (error) {
      console.error('Error fetching order data:', error)
      showToast.error('Error al cargar los datos de la orden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof InvoiceRequestForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!form.nit.trim()) {
      showToast.error('El NIT es obligatorio')
      return false
    }
    if (!form.name.trim()) {
      showToast.error('El nombre es obligatorio')
      return false
    }
    if (!form.email.trim()) {
      showToast.error('El email es obligatorio')
      return false
    }
    if (!form.address.trim()) {
      showToast.error('La dirección es obligatoria')
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      showToast.error('El email no tiene un formato válido')
      return false
    }

    // Basic NIT validation (Guatemala format)
    const nitRegex = /^\d{4}-\d{6}-\d{3}-\d{1}$|^\d{8}-\d{1}$/
    if (!nitRegex.test(form.nit)) {
      showToast.error('El NIT no tiene un formato válido (ej: 1234-567890-123-4)')
      return false
    }

    return true
  }

  const submitInvoiceRequest = async () => {
    if (!order || !validateForm()) return

    try {
      setIsSubmitting(true)

      const requestData = {
        orderId: order.id,
        ...form
      }

      // In a real app, you would call your API
      // const response = await api.post('/user/invoices/request', requestData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      showToast.success('Solicitud de factura enviada exitosamente')
      navigate('/mis-facturas')
    } catch (error) {
      console.error('Error submitting invoice request:', error)
      showToast.error('Error al enviar la solicitud de factura')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Orden no encontrada</h2>
          <p className="mt-2 text-sm text-gray-600">
            No se pudo encontrar la orden solicitada.
          </p>
          <Button onClick={() => navigate('/mis-pagos')} className="mt-4">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis pagos
          </Button>
        </div>
      </div>
    )
  }

  if (order.hasInvoice) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Factura ya emitida</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ya existe una factura emitida para esta orden.
          </p>
          <Button onClick={() => navigate('/mis-facturas')} className="mt-4">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Ver mis facturas
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
            onClick={() => navigate('/mis-pagos')}
            className="mb-4"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis pagos
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Solicitar Factura</h1>
          <p className="text-gray-600 mt-1">
            Solicita tu factura FEL para esta orden de pago
          </p>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaFileInvoice className="mr-2 h-5 w-5" />
                Detalles de la Orden
              </CardTitle>
              <CardDescription>
                Información de la orden para la cual solicitas factura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Evento</label>
                  <p className="text-lg font-semibold">{order.eventTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha del evento</label>
                  <p className="text-lg font-semibold">
                    {new Date(order.eventDate).toLocaleDateString('es-GT')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Monto pagado</label>
                  <p className="text-xl font-bold text-green-600">
                    {order.currency} {order.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de pago</label>
                  <p className="text-lg font-semibold">
                    {new Date(order.createdAt).toLocaleDateString('es-GT')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Request Form */}
          <Card>
            <CardHeader>
              <CardTitle>Datos para la Factura</CardTitle>
              <CardDescription>
                Proporciona la información necesaria para emitir tu factura FEL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nit">NIT *</Label>
                  <Input
                    id="nit"
                    value={form.nit}
                    onChange={(e) => handleInputChange('nit', e.target.value)}
                    placeholder="1234-567890-123-4"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Formato: 1234-567890-123-4
                  </p>
                </div>
                <div>
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nombre completo o razón social"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Dirección *</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Dirección completa para facturación"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Información adicional para la factura (opcional)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start">
                <FaInfoCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Información sobre facturas FEL</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Las facturas FEL son válidas legalmente en Guatemala</li>
                    <li>• Recibirás la factura por email una vez emitida</li>
                    <li>• Podrás descargar el PDF y XML desde tu panel</li>
                    <li>• El proceso puede tomar hasta 24 horas hábiles</li>
                    <li>• Asegúrate de que tus datos sean correctos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={submitInvoiceRequest}
              disabled={isSubmitting}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando solicitud...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2 h-5 w-5" />
                  Solicitar Factura FEL
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}