import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaCheck, FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaSpinner, FaClock, FaShieldAlt, FaCreditCard } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import {
  UserDashboardService,
  AccessType,
  RegistrationData,
  RegistrationResponse,
  PaymentGateway,
  PaymentIntentData,
  PaymentStatusData,
  QRCodeResponse
} from '@/services/userDashboardService'
import toast from 'react-hot-toast'

interface EventRegistrationFlowProps {
  isOpen: boolean
  onClose: () => void
  event: any
}

interface RegistrationStep {
  id: string
  title: string
  description: string
}

const steps: RegistrationStep[] = [
  { id: 'access', title: 'Tipo de Acceso', description: 'Selecciona tu tipo de acceso' },
  { id: 'info', title: 'Información', description: 'Completa tus datos' },
  { id: 'gateway', title: 'Método de Pago', description: 'Elige tu método de pago' },
  { id: 'payment', title: 'Procesando', description: 'Procesando tu pago' },
  { id: 'confirmation', title: 'Confirmación', description: '¡Listo! Revisa tu confirmación' }
]

const EventRegistrationFlow: React.FC<EventRegistrationFlowProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Step control
  const [currentStep, setCurrentStep] = useState(0)

  // Data states
  const [accessTypes, setAccessTypes] = useState<AccessType[]>([])
  const [selectedAccessType, setSelectedAccessType] = useState<AccessType | null>(null)
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([])
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null)

  // Registration data
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nit: '',
    cui: '',
    address: '',
    city: '',
    country: 'Guatemala'
  })

  // Response data
  const [registrationResponse, setRegistrationResponse] = useState<RegistrationResponse | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentData | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusData | null>(null)
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null)

  // Loading states
  const [loadingAccessTypes, setLoadingAccessTypes] = useState(false)
  const [loadingGateways, setLoadingGateways] = useState(false)
  const [creatingRegistration, setCreatingRegistration] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Reservation timer
  const [reservationTimeLeft, setReservationTimeLeft] = useState<number | null>(null)

  // Payment polling
  const [paymentPollingInterval, setPaymentPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Initialize on open
  useEffect(() => {
    if (isOpen && event) {
      if (!user) {
        const returnUrl = `${window.location.pathname}${window.location.search}#register-event-${event.id}`
        navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
        onClose()
        return
      }

      resetFlow()
      loadAccessTypes()
    }

    return () => {
      if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval)
      }
    }
  }, [isOpen, event, user, navigate, onClose])

  // Reservation timer countdown
  useEffect(() => {
    if (!registrationResponse?.reservationExpiresAt) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expires = new Date(registrationResponse.reservationExpiresAt).getTime()
      const diff = expires - now

      if (diff <= 0) {
        setReservationTimeLeft(0)
        toast.error('Tu reserva ha expirado. Por favor, intenta de nuevo.')
        handleClose()
      } else {
        setReservationTimeLeft(Math.floor(diff / 1000))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [registrationResponse])

  // Reset flow
  const resetFlow = () => {
    setCurrentStep(0)
    setAccessTypes([])
    setSelectedAccessType(null)
    setPaymentGateways([])
    setSelectedGateway(null)
    setBillingInfo({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
      nit: '',
      cui: '',
      address: '',
      city: '',
      country: 'Guatemala'
    })
    setRegistrationResponse(null)
    setPaymentIntent(null)
    setPaymentStatus(null)
    setQrCode(null)
    setError(null)
    setValidationErrors({})
    setReservationTimeLeft(null)
    if (paymentPollingInterval) {
      clearInterval(paymentPollingInterval)
      setPaymentPollingInterval(null)
    }
  }

  const handleClose = () => {
    resetFlow()
    onClose()
  }

  // Load access types
  const loadAccessTypes = async () => {
    if (!event) return

    setLoadingAccessTypes(true)
    setError(null)

    try {
      const types = await UserDashboardService.getEventAccessTypes(event.id)
      setAccessTypes(types)

      // Auto-select if only one option
      if (types.length === 1) {
        setSelectedAccessType(types[0])
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error cargando tipos de acceso'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoadingAccessTypes(false)
    }
  }

  // Load payment gateways - Opciones simplificadas
  const loadPaymentGateways = async () => {
    setLoadingGateways(true)
    setError(null)

    try {
      // Definir opciones de pago estáticas
      const gateways: PaymentGateway[] = [
        {
          id: '1',
          name: 'card',
          displayName: 'Tarjeta de crédito/débito',
          description: 'Paga con tu tarjeta de crédito o débito',
          isActive: true,
          fee: 2.9,
          feeType: 'percentage',
          currency: 'GTQ',
          supportedCurrencies: ['GTQ', 'USD']
        },
        {
          id: '2',
          name: 'bank_transfer',
          displayName: 'Depósito o transferencia bancaria',
          description: 'Realizar pago por depósito o transferencia',
          isActive: true,
          fee: 0,
          feeType: 'fixed',
          currency: 'GTQ',
          supportedCurrencies: ['GTQ']
        }
      ]

      setPaymentGateways(gateways)
    } catch (err: any) {
      const errorMsg = err.message || 'Error cargando métodos de pago'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoadingGateways(false)
    }
  }

  // Validate field in real-time
  const validateField = async (field: string, value: string) => {
    if (!value || value.trim() === '') {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
      return
    }

    try {
      const result = await UserDashboardService.validateField(field, value, event.id)
      setValidationErrors(prev => ({
        ...prev,
        [field]: result.isValid ? '' : (result.message || 'Campo inválido')
      }))
    } catch (err) {
      // Silently fail for validation errors
    }
  }

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((field: string, value: string) => validateField(field, value), 500),
    [event]
  )

  const handleFieldChange = (field: string, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }))

    // Trigger validation for specific fields
    if (['nit', 'cui', 'email', 'phone'].includes(field)) {
      debouncedValidate(field, value)
    }
  }

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {}

    if (!billingInfo.firstName.trim()) errors.firstName = 'Nombre requerido'
    if (!billingInfo.lastName.trim()) errors.lastName = 'Apellido requerido'
    if (!billingInfo.email.trim()) errors.email = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
      errors.email = 'Email inválido'
    }
    // Teléfono es opcional
    // if (!billingInfo.phone.trim()) errors.phone = 'Teléfono requerido'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Create registration
  const createRegistration = async () => {
    if (!user) return

    // Para eventos virtuales, no se requiere selectedAccessType
    if (accessTypes.length > 0 && !selectedAccessType) {
      toast.error('Por favor selecciona un tipo de acceso')
      return
    }

    if (!validateAllFields()) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setCreatingRegistration(true)
    setError(null)

    try {
      const registrationData: RegistrationData = {
        eventId: event.id,
        accessTypeId: selectedAccessType?.id, // Opcional para eventos virtuales
        participantType: 'individual',
        firstName: billingInfo.firstName,
        lastName: billingInfo.lastName,
        email: billingInfo.email,
        phone: billingInfo.phone,
        nit: billingInfo.nit || undefined,
        cui: billingInfo.cui || undefined,
      }

      const response = await UserDashboardService.createRegistration(registrationData)
      setRegistrationResponse(response)

      toast.success('Inscripción creada exitosamente')

      // Load payment gateways for next step
      await loadPaymentGateways()

      setCurrentStep(2)
    } catch (err: any) {
      const errorMsg = err.message || 'Error creando inscripción'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setCreatingRegistration(false)
    }
  }

  // Create payment intent
  const createPayment = async () => {
    if (!registrationResponse || !selectedGateway) return

    setProcessingPayment(true)
    setError(null)

    try {
      // Si es transferencia bancaria, notificar al backend y ir directamente a confirmación
      if (selectedGateway.name === 'bank_transfer') {
        // Notificar al backend para enviar el correo específico de transferencia bancaria
        try {
          const token = localStorage.getItem('token')
          await fetch(`/api/v1/registrations/${registrationResponse.registrationId}/bank-transfer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        } catch (emailError) {
          console.error('Error notificando transferencia bancaria:', emailError)
          // No bloquear el flujo si falla la notificación
        }

        toast.success('Inscripción registrada. Un ejecutivo se contactará contigo.')
        setCurrentStep(4) // Ir al paso de confirmación
        return
      }

      // Para pagos con tarjeta, procesar normalmente
      const intent = await UserDashboardService.createPaymentIntent(
        registrationResponse.registrationId,
        selectedGateway.name
      )
      setPaymentIntent(intent)

      // Check if redirect is needed
      if (intent.redirectUrl) {
        // Redirect to payment gateway
        window.location.href = intent.redirectUrl
      } else {
        // Start polling for payment status
        setCurrentStep(3)
        startPaymentPolling(intent.transactionId)
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error procesando pago'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setProcessingPayment(false)
    }
  }

  // Start payment status polling
  const startPaymentPolling = (transactionId: string) => {
    setCheckingPaymentStatus(true)

    const pollPaymentStatus = async () => {
      try {
        const status = await UserDashboardService.checkPaymentStatus(transactionId)
        setPaymentStatus(status)

        if (status.status === 'completed') {
          // Payment successful
          if (paymentPollingInterval) {
            clearInterval(paymentPollingInterval)
            setPaymentPollingInterval(null)
          }
          setCheckingPaymentStatus(false)

          // Generate QR code
          await generateQRCode()

          setCurrentStep(4)
          toast.success('¡Pago completado exitosamente!')
        } else if (status.status === 'failed' || status.status === 'cancelled') {
          // Payment failed
          if (paymentPollingInterval) {
            clearInterval(paymentPollingInterval)
            setPaymentPollingInterval(null)
          }
          setCheckingPaymentStatus(false)
          setError(status.errorMessage || 'Error procesando el pago')
          toast.error('El pago no pudo ser procesado')
        }
      } catch (err: any) {
        console.error('Error checking payment status:', err)
      }
    }

    // Poll every 3 seconds
    pollPaymentStatus()
    const interval = setInterval(pollPaymentStatus, 3000)
    setPaymentPollingInterval(interval)
  }

  // Generate QR code
  const generateQRCode = async () => {
    if (!registrationResponse) return

    setGeneratingQR(true)

    try {
      const qr = await UserDashboardService.generateQRCode(registrationResponse.registrationId)
      setQrCode(qr)
    } catch (err: any) {
      console.error('Error generating QR code:', err)
      toast.error('No se pudo generar el código QR')
    } finally {
      setGeneratingQR(false)
    }
  }

  // Format timer
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate total with gateway fee
  const calculateTotal = (): number => {
    if (!selectedAccessType || !selectedGateway) return 0

    const baseAmount = selectedAccessType.price
    const fee = selectedGateway.feeType === 'percentage'
      ? baseAmount * (selectedGateway.fee / 100)
      : selectedGateway.fee

    return baseAmount + fee
  }

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              index <= currentStep
                ? 'bg-[#6B1E22] border-[#6B1E22] text-white scale-110'
                : 'border-gray-300 text-gray-300'
            }`}>
              {index < currentStep ? (
                <FaCheck size={14} />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className={`text-xs mt-2 text-center max-w-[80px] ${
              index === currentStep ? 'font-semibold text-[#6B1E22]' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 w-12 mx-2 transition-all duration-300 ${
              index < currentStep ? 'bg-[#6B1E22]' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  // Render reservation timer
  const renderReservationTimer = () => {
    if (!reservationTimeLeft || currentStep >= 4) return null

    const isUrgent = reservationTimeLeft < 300 // Less than 5 minutes

    return (
      <Alert className={`mb-6 ${isUrgent ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
        <FaClock className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`} />
        <AlertDescription className={isUrgent ? 'text-red-800' : 'text-yellow-800'}>
          <strong>Reserva temporal:</strong> Tu reserva expira en {formatTime(reservationTimeLeft)}
        </AlertDescription>
      </Alert>
    )
  }

  // Step 1: Access Type Selection
  const renderAccessTypeStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Selecciona tu Tipo de Acceso
        </h3>
        <p className="text-gray-600">
          Elige la opción que mejor se adapte a tus necesidades
        </p>
      </div>

      {loadingAccessTypes ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-[#6B1E22] text-3xl" />
        </div>
      ) : accessTypes.length === 0 ? (
        <Alert className="border-blue-500 bg-blue-50">
          <FaCheck className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Este evento no requiere selección de tipo de acceso. Puedes continuar directamente con tus datos.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {accessTypes.map((accessType) => (
            <Card
              key={accessType.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedAccessType?.id === accessType.id
                  ? 'border-[#6B1E22] bg-[#6B1E22]/5 shadow-md'
                  : 'hover:border-[#6B1E22]/50 hover:shadow-sm'
              }`}
              onClick={() => setSelectedAccessType(accessType)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {accessType.displayName}
                      </h4>
                      <Badge variant="secondary" className="bg-[#6B1E22] text-white">
                        {accessType.currency} {Number(accessType.price).toFixed(2)}
                      </Badge>
                    </div>

                    {accessType.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {accessType.description}
                      </p>
                    )}

                    {accessType.availableCapacity !== undefined && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Disponibilidad:</strong> {accessType.availableCapacity} de {accessType.capacity} espacios
                      </p>
                    )}

                    {accessType.benefits && accessType.benefits.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900 text-sm">Beneficios:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {accessType.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <FaCheck className="text-green-500 mr-2 flex-shrink-0" size={10} />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {accessType.restrictions && accessType.restrictions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h5 className="font-medium text-gray-900 text-sm">Restricciones:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {accessType.restrictions.map((restriction, index) => (
                            <li key={index} className="flex items-center">
                              <FaTimes className="text-red-500 mr-2 flex-shrink-0" size={10} />
                              {restriction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={() => {
            // Si no hay tipos de acceso (evento virtual) o si se seleccionó uno, continuar
            if (accessTypes.length === 0 || selectedAccessType) {
              setCurrentStep(1)
            }
          }}
          disabled={loadingAccessTypes || (accessTypes.length > 0 && !selectedAccessType)}
          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        >
          Continuar
          <FaArrowRight className="ml-2" />
        </Button>
      </div>
    </motion.div>
  )

  // Step 2: Participant Information
  const renderInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Información del Participante
        </h3>
        <p className="text-gray-600">
          Completa tus datos para procesar la inscripción
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen de Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Evento:</span>
              <span className="text-right">{event?.title || 'Evento'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tipo de Acceso:</span>
              <span>{selectedAccessType?.displayName}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Subtotal:</span>
              <span className="text-[#6B1E22]">
                {selectedAccessType?.currency} {Number(selectedAccessType?.price).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              value={billingInfo.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              placeholder="Tu nombre"
              className={validationErrors.firstName ? 'border-red-500' : ''}
            />
            {validationErrors.firstName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              value={billingInfo.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              placeholder="Tu apellido"
              className={validationErrors.lastName ? 'border-red-500' : ''}
            />
            {validationErrors.lastName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Correo Electrónico *</Label>
          <Input
            id="email"
            type="email"
            value={billingInfo.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="tu@email.com"
            className={validationErrors.email ? 'border-red-500' : ''}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Teléfono (opcional)</Label>
          <Input
            id="phone"
            value={billingInfo.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="+502 5555-1234"
            className={validationErrors.phone ? 'border-red-500' : ''}
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nit">NIT (Opcional)</Label>
            <Input
              id="nit"
              value={billingInfo.nit}
              onChange={(e) => handleFieldChange('nit', e.target.value)}
              placeholder="12345678-9"
              className={validationErrors.nit ? 'border-red-500' : ''}
            />
            {validationErrors.nit && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.nit}</p>
            )}
          </div>
          <div>
            <Label htmlFor="cui">CUI (Opcional)</Label>
            <Input
              id="cui"
              value={billingInfo.cui}
              onChange={(e) => handleFieldChange('cui', e.target.value)}
              placeholder="1234567890123"
              className={validationErrors.cui ? 'border-red-500' : ''}
            />
            {validationErrors.cui && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.cui}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep(0)}>
          <FaArrowLeft className="mr-2" />
          Atrás
        </Button>
        <Button
          onClick={createRegistration}
          disabled={creatingRegistration}
          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        >
          {creatingRegistration ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Creando...
            </>
          ) : (
            <>
              Continuar
              <FaArrowRight className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )

  // Step 3: Payment Gateway Selection
  const renderGatewayStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Selecciona tu Método de Pago
        </h3>
        <p className="text-gray-600">
          Elige cómo deseas realizar el pago
        </p>
      </div>

      {renderReservationTimer()}

      {loadingGateways ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-[#6B1E22] text-3xl" />
        </div>
      ) : paymentGateways.length === 0 ? (
        <Alert className="border-yellow-500 bg-yellow-50">
          <FaExclamationTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            No hay métodos de pago disponibles.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {paymentGateways.map((gateway) => (
            <Card
              key={gateway.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedGateway?.id === gateway.id
                  ? 'border-[#6B1E22] bg-[#6B1E22]/5 shadow-md'
                  : 'hover:border-[#6B1E22]/50 hover:shadow-sm'
              }`}
              onClick={() => setSelectedGateway(gateway)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center">
                      <FaCreditCard className="text-[#6B1E22] text-2xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {gateway.displayName}
                      </h4>
                      <p className="text-sm text-gray-600">{gateway.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Comisión: {gateway.feeType === 'percentage'
                          ? `${gateway.fee}%`
                          : `${gateway.currency} ${gateway.fee.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  <FaShieldAlt className="text-green-500 text-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGateway && selectedAccessType && (
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{selectedAccessType.currency} {selectedAccessType.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Comisión {selectedGateway.displayName}:</span>
                <span>
                  + {selectedAccessType.currency} {
                    selectedGateway.feeType === 'percentage'
                      ? (selectedAccessType.price * selectedGateway.fee / 100).toFixed(2)
                      : selectedGateway.fee.toFixed(2)
                  }
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-[#6B1E22]">
                  {selectedAccessType.currency} {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <FaArrowLeft className="mr-2" />
          Atrás
        </Button>
        <Button
          onClick={createPayment}
          disabled={!selectedGateway || processingPayment}
          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        >
          {processingPayment ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Procesando...
            </>
          ) : (
            <>
              Proceder al Pago
              <FaArrowRight className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )

  // Step 4: Payment Processing
  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Procesando tu Pago
        </h3>
        <p className="text-gray-600">
          Por favor espera mientras procesamos tu pago
        </p>
      </div>

      {renderReservationTimer()}

      <div className="flex flex-col items-center justify-center py-12">
        {checkingPaymentStatus ? (
          <>
            <FaSpinner className="animate-spin text-[#6B1E22] text-5xl mb-6" />
            <p className="text-gray-600 mb-2">Verificando estado del pago...</p>
            {paymentStatus && (
              <p className="text-sm text-gray-500">
                Estado: {paymentStatus.status}
              </p>
            )}
          </>
        ) : (
          <>
            <FaCheck className="text-green-500 text-5xl mb-6" />
            <p className="text-gray-900 font-semibold">Pago completado</p>
          </>
        )}
      </div>

      {error && (
        <Alert className="border-red-500 bg-red-50">
          <FaExclamationTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </motion.div>
  )

  // Step 5: Confirmation
  const renderConfirmationStep = () => {
    const isBankTransfer = selectedGateway?.name === 'bank_transfer'

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isBankTransfer ? 'bg-yellow-100' : 'bg-green-100'}`}>
            {isBankTransfer ? (
              <FaClock className="text-yellow-600" size={32} />
            ) : (
              <FaCheck className="text-green-600" size={32} />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isBankTransfer ? '¡Inscripción Registrada!' : '¡Inscripción Exitosa!'}
          </h3>
          <p className="text-gray-600">
            {isBankTransfer
              ? 'Tu inscripción ha sido registrada y está pendiente de pago'
              : 'Tu inscripción ha sido procesada correctamente'}
          </p>
          {registrationResponse && (
            <p className="text-sm text-gray-500 mt-2">
              Código de inscripción: <strong>{registrationResponse.registrationCode}</strong>
            </p>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            {isBankTransfer ? (
              <div className="space-y-4 text-center">
                <Alert className="border-yellow-500 bg-yellow-50">
                  <FaClock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Inscripción pendiente de pago</strong>
                  </AlertDescription>
                </Alert>

                <div className="text-left space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Próximos pasos:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Un ejecutivo se contactará contigo en las próximas 24 horas</li>
                    <li>Te proporcionaremos los datos bancarios para realizar el depósito o transferencia</li>
                    <li>Una vez confirmado el pago, recibirás tu código QR de acceso</li>
                  </ol>
                </div>

                <Alert className="border-blue-500 bg-blue-50">
                  <AlertDescription className="text-blue-800">
                    Hemos enviado un email de confirmación a <strong>{billingInfo.email}</strong>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Código QR de Acceso</h4>
                  {generatingQR ? (
                    <div className="flex justify-center py-8">
                      <FaSpinner className="animate-spin text-[#6B1E22] text-3xl" />
                    </div>
                  ) : qrCode ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={qrCode.qrCode}
                        alt="QR Code"
                        className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                      />
                      <p className="text-sm text-gray-600 mt-3">
                        Presenta este código en la entrada del evento
                      </p>
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-gray-500 text-sm">QR no disponible</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <Alert className="border-blue-500 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      Se ha enviado un email de confirmación con todos los detalles a <strong>{billingInfo.email}</strong>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
            onClick={() => {
              handleClose()
              navigate('/dashboard/user')
            }}
          >
            Ver Mis Eventos
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Inscripción al Evento
          </DialogTitle>
          <DialogDescription className="text-center">
            Completa los pasos para inscribirte a {event?.title || 'este evento'}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentStep === 0 && renderAccessTypeStep()}
            {currentStep === 1 && renderInfoStep()}
            {currentStep === 2 && renderGatewayStep()}
            {currentStep === 3 && renderPaymentStep()}
            {currentStep === 4 && renderConfirmationStep()}
          </AnimatePresence>
        </div>

        {error && currentStep < 3 && (
          <Alert className="border-red-500 bg-red-50 mt-4">
            <FaExclamationTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default EventRegistrationFlow
