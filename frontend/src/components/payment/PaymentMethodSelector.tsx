import React, { useState } from 'react'
import { FaCreditCard, FaPaypal, FaUniversity, FaCheck } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PaymentMethodFormData } from '@/schemas'

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentMethodFormData
  onMethodSelect: (method: PaymentMethodFormData) => void
  disabled?: boolean
  className?: string
}

const paymentMethods = [
  {
    type: 'credit_card' as const,
    title: 'Tarjeta de Crédito/Débito',
    description: 'Visa, Mastercard, American Express',
    icon: FaCreditCard,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    popular: true,
  },
  {
    type: 'paypal' as const,
    title: 'PayPal',
    description: 'Pago seguro con PayPal',
    icon: FaPaypal,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    popular: false,
  },
  {
    type: 'bank_transfer' as const,
    title: 'Transferencia Bancaria',
    description: 'Transferencia directa desde tu banco',
    icon: FaUniversity,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    popular: false,
  },
]

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  disabled = false,
  className,
}) => {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null)

  const handleMethodClick = (methodType: 'credit_card' | 'paypal' | 'bank_transfer') => {
    if (disabled) return

    let methodData: PaymentMethodFormData

    switch (methodType) {
      case 'credit_card':
        methodData = {
          type: 'credit_card',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: '',
          saveCard: false,
        }
        break
      case 'paypal':
        methodData = {
          type: 'paypal',
          email: '',
        }
        break
      case 'bank_transfer':
        methodData = {
          type: 'bank_transfer',
          accountNumber: '',
          bankName: '',
          accountHolder: '',
        }
        break
    }

    onMethodSelect(methodData)
  }

  const isSelected = (methodType: string) => selectedMethod?.type === methodType

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecciona Método de Pago
        </h3>
        <p className="text-sm text-gray-600">
          Elige cómo deseas realizar tu pago de forma segura
        </p>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const selected = isSelected(method.type)
          const hovered = hoveredMethod === method.type

          return (
            <Card
              key={method.type}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                selected && 'ring-2 ring-primary border-primary',
                hovered && !selected && 'shadow-md',
                disabled && 'opacity-50 cursor-not-allowed',
                method.borderColor
              )}
              onClick={() => handleMethodClick(method.type)}
              onMouseEnter={() => setHoveredMethod(method.type)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      'p-3 rounded-lg transition-colors',
                      method.bgColor,
                      selected && 'bg-primary/10'
                    )}>
                      <Icon className={cn(
                        'h-6 w-6',
                        method.color,
                        selected && 'text-primary'
                      )} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base">
                          {method.title}
                        </CardTitle>
                        {method.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {method.description}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {selected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <FaCheck className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheck className="h-3 w-3 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Pago Seguro Garantizado</p>
            <p>
              Tus datos de pago están protegidos con encriptación SSL de 256 bits.
              No almacenamos información sensible de tarjetas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}