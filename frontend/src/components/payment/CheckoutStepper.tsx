import React, { useState } from 'react'
import { FaShoppingCart, FaCreditCard, FaUser, FaCheck, FaLock } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  current: boolean
}

interface CheckoutStepperProps {
  currentStep: number
  steps: Omit<Step, 'completed' | 'current'>[]
  onStepClick?: (stepIndex: number) => void
  className?: string
  showProgress?: boolean
}

const defaultSteps = [
  {
    id: 'cart',
    title: 'Carrito',
    description: 'Revisa tus eventos',
    icon: FaShoppingCart,
  },
  {
    id: 'payment',
    title: 'Pago',
    description: 'Método de pago',
    icon: FaCreditCard,
  },
  {
    id: 'billing',
    title: 'Facturación',
    description: 'Datos de facturación',
    icon: FaUser,
  },
  {
    id: 'confirm',
    title: 'Confirmar',
    description: 'Finalizar compra',
    icon: FaCheck,
  },
]

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  currentStep,
  steps = defaultSteps,
  onStepClick,
  className,
  showProgress = true,
}) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  const stepsWithState: Step[] = steps.map((step, index) => ({
    ...step,
    completed: index < currentStep,
    current: index === currentStep,
  }))

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on completed steps or current step
    if (stepIndex <= currentStep && onStepClick) {
      onStepClick(stepIndex)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso del Checkout
            </span>
            <span className="text-sm text-gray-500">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div
          className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-300 ease-in-out -z-10"
          style={{ width: `${progressPercentage}%` }}
        />

        <div className="flex justify-between">
          {stepsWithState.map((step, index) => {
            const Icon = step.icon
            const isClickable = index <= currentStep && onStepClick
            const isHovered = hoveredStep === index

            return (
              <div
                key={step.id}
                className="flex flex-col items-center flex-1"
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    'relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    step.completed && 'bg-primary border-primary text-white',
                    step.current && 'bg-white border-primary text-primary shadow-lg',
                    !step.completed && !step.current && 'bg-white border-gray-300 text-gray-400',
                    isClickable && 'cursor-pointer hover:shadow-md',
                    isHovered && isClickable && 'scale-110'
                  )}
                  onClick={() => handleStepClick(index)}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {step.completed ? (
                    <FaCheck className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}

                  {/* Current step indicator */}
                  {step.current && (
                    <div className="absolute -inset-1 border-2 border-primary rounded-full animate-pulse" />
                  )}
                </div>

                {/* Step Content */}
                <div className="mt-3 text-center max-w-24">
                  <div className="flex items-center justify-center mb-1">
                    <h3 className={cn(
                      'text-sm font-medium transition-colors',
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                    )}>
                      {step.title}
                    </h3>
                    {step.current && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Actual
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    'text-xs transition-colors',
                    step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                  )}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Notice */}
      <Card className="mt-8 bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FaLock className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800">
                Compra Segura Garantizada
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Tus datos están protegidos con encriptación de nivel bancario.
                Procesa pagos con total confianza.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for managing checkout steps
export const useCheckoutStepper = (totalSteps: number = 4) => {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)))
  }

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
  }
}