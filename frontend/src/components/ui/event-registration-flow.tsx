import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaUser, FaCreditCard, FaCheck, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface EventRegistrationFlowProps {
  isOpen: boolean
  onClose: () => void
  event: any // BackendEvent or Event
}

interface AccessType {
  id: number
  name: string
  displayName: string
  price: number
  currency: string
  capacity?: number
  benefits: string[]
  restrictions: string[]
}

interface RegistrationStep {
  id: string
  title: string
  description: string
}

const steps: RegistrationStep[] = [
  { id: 'auth', title: 'Autenticación', description: 'Inicia sesión o regístrate' },
  { id: 'access', title: 'Tipo de Acceso', description: 'Selecciona tu tipo de acceso' },
  { id: 'payment', title: 'Pago', description: 'Completa el proceso de pago' },
  { id: 'confirmation', title: 'Confirmación', description: '¡Listo! Revisa tu confirmación' }
]

const EventRegistrationFlow: React.FC<EventRegistrationFlowProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const { user, login, register } = useAuthStore()
  const { addToCart } = useCartStore()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [accessTypes, setAccessTypes] = useState<AccessType[]>([])
  const [selectedAccessType, setSelectedAccessType] = useState<AccessType | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isLogin: true
  })

  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Guatemala'
  })

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      loadAccessTypes()
      if (user) {
        // If user is already authenticated, skip to access type selection
        setCurrentStep(1)
        setBillingInfo({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: (user as any).phone || '',
          address: '',
          city: '',
          country: 'Guatemala'
        })
      }
    }
  }, [isOpen, user])

  const loadAccessTypes = async () => {
    try {
      // TODO: Load access types from API
      // For now, mock data
      const mockAccessTypes: AccessType[] = [
        {
          id: 1,
          name: 'general',
          displayName: 'General',
          price: Number(event.price) || 0,
          currency: event.currency || 'GTQ',
          capacity: event.capacity,
          benefits: ['Acceso al evento completo', 'Materiales digitales', 'Certificado de participación'],
          restrictions: []
        },
        {
          id: 2,
          name: 'vip',
          displayName: 'VIP',
          price: Number(event.price || 0) * 1.5,
          currency: event.currency || 'GTQ',
          capacity: Math.floor((event.capacity || 100) * 0.2),
          benefits: ['Acceso prioritario', 'Sesiones exclusivas', 'Networking premium', 'Certificado especial', 'Merchandising'],
          restrictions: []
        }
      ]
      setAccessTypes(mockAccessTypes)
    } catch (error) {
      console.error('Error loading access types:', error)
    }
  }

  const handleAuth = async () => {
    setLoading(true)
    try {
      if (authForm.isLogin) {
        await login(authForm.email, authForm.password)
        toast.success('¡Bienvenido de vuelta!')
        setCurrentStep(1)
      } else {
        await register({
          email: authForm.email,
          password: authForm.password,
          confirmPassword: authForm.password,
          firstName: authForm.firstName,
          lastName: authForm.lastName,
          termsAccepted: true
        })
        toast.success('¡Cuenta creada exitosamente!')
        setCurrentStep(1)
      }
    } catch (error: any) {
      toast.error(error.message || 'Error en la autenticación')
    } finally {
      setLoading(false)
    }
  }

  const handleAccessTypeSelection = (accessType: AccessType) => {
    setSelectedAccessType(accessType)
    setCurrentStep(2)
  }

  const handlePayment = async () => {
    if (!selectedAccessType) return

    setLoading(true)
    try {
      // Add to cart with selected access type
      const eventToAdd = {
        ...event,
        accessType: selectedAccessType,
        finalPrice: selectedAccessType.price
      }

      addToCart(eventToAdd)
      toast.success('¡Agregado al carrito!')
      setCurrentStep(3)
    } catch (error: any) {
      toast.error('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            index <= currentStep
              ? 'bg-[#6B1E22] border-[#6B1E22] text-white'
              : 'border-gray-300 text-gray-300'
          }`}>
            {index < currentStep ? (
              <FaCheck size={14} />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 ${
              index < currentStep ? 'bg-[#6B1E22]' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderAuthStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {authForm.isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h3>
        <p className="text-gray-600">
          {authForm.isLogin
            ? 'Ingresa tus credenciales para continuar'
            : 'Regístrate rápidamente para inscribirte al evento'
          }
        </p>
      </div>

      <div className="space-y-4">
        {!authForm.isLogin && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={authForm.firstName}
                  onChange={(e) => setAuthForm({...authForm, firstName: e.target.value})}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={authForm.lastName}
                  onChange={(e) => setAuthForm({...authForm, lastName: e.target.value})}
                  placeholder="Tu apellido"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={authForm.email}
            onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={authForm.password}
            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
            placeholder="Tu contraseña"
          />
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="link"
            onClick={() => setAuthForm({...authForm, isLogin: !authForm.isLogin})}
            className="text-[#6B1E22] hover:text-[#8a2b30]"
          >
            {authForm.isLogin
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'
            }
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleAuth}
          disabled={loading || !authForm.email || !authForm.password || (!authForm.isLogin && (!authForm.firstName || !authForm.lastName))}
          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        >
          {loading ? 'Procesando...' : (authForm.isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
        </Button>
      </div>
    </motion.div>
  )

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

      <div className="space-y-4">
        {accessTypes.map((accessType) => (
          <Card
            key={accessType.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedAccessType?.id === accessType.id
                ? 'border-[#6B1E22] bg-[#6B1E22]/5'
                : 'hover:border-[#6B1E22]/50'
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

                  {accessType.capacity && (
                    <p className="text-sm text-gray-600 mb-3">
                      Capacidad limitada: {accessType.capacity} espacios
                    </p>
                  )}

                  <div className="space-y-2">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Beneficios:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {accessType.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <FaCheck className="text-green-500 mr-2" size={10} />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {accessType.restrictions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Restricciones:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {accessType.restrictions.map((restriction, index) => (
                            <li key={index} className="flex items-center">
                              <FaTimes className="text-red-500 mr-2" size={10} />
                              {restriction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(0)}
          disabled={!user}
        >
          <FaArrowLeft className="mr-2" />
          Atrás
        </Button>
        <Button
          onClick={() => selectedAccessType && setCurrentStep(2)}
          disabled={!selectedAccessType}
          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        >
          Continuar
          <FaArrowRight className="ml-2" />
        </Button>
      </div>
    </motion.div>
  )

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Información de Pago
        </h3>
        <p className="text-gray-600">
          Completa tus datos para procesar el pago
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
              <span>{event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tipo de Acceso:</span>
              <span>{selectedAccessType?.displayName}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total:</span>
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
            <Label htmlFor="billingFirstName">Nombre</Label>
            <Input
              id="billingFirstName"
              value={billingInfo.firstName}
              onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <Label htmlFor="billingLastName">Apellido</Label>
            <Input
              id="billingLastName"
              value={billingInfo.lastName}
              onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="billingEmail">Correo Electrónico</Label>
          <Input
            id="billingEmail"
            type="email"
            value={billingInfo.email}
            onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <Label htmlFor="billingPhone">Teléfono</Label>
          <Input
            id="billingPhone"
            value={billingInfo.phone}
            onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
            placeholder="+502 5555-1234"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <FaArrowLeft className="mr-2" />
          Atrás
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading || !billingInfo.firstName || !billingInfo.lastName || !billingInfo.email}
          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
        >
          {loading ? 'Procesando...' : 'Proceder al Pago'}
        </Button>
      </div>
    </motion.div>
  )

  const renderConfirmationStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-green-600" size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ¡Inscripción Exitosa!
        </h3>
        <p className="text-gray-600">
          Tu inscripción ha sido procesada correctamente
        </p>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Código QR de Acceso</h4>
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-gray-500 text-sm">QR Code</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Presenta este código en la entrada del evento
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                Se ha enviado un email de confirmación con todos los detalles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
          onClick={() => {
            onClose()
            navigate('/dashboard/user')
          }}
        >
          Ver Mis Eventos
        </Button>
      </div>
    </motion.div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Inscripción al Evento
          </DialogTitle>
          <DialogDescription className="text-center">
            Completa los pasos para inscribirte a {event?.title}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentStep === 0 && renderAuthStep()}
            {currentStep === 1 && renderAccessTypeStep()}
            {currentStep === 2 && renderPaymentStep()}
            {currentStep === 3 && renderConfirmationStep()}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EventRegistrationFlow