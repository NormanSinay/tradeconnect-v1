import { z } from 'zod'

// Base validation schemas
export const cardNumberSchema = z
  .string()
  .min(13, 'Número de tarjeta inválido')
  .max(19, 'Número de tarjeta inválido')
  .regex(/^\d+$/, 'Solo números permitidos')
  .refine((val) => {
    // Luhn algorithm validation
    const digits = val.split('').map(Number).reverse()
    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      let digit = digits[i]!
      if (i % 2 === 1) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    return sum % 10 === 0
  }, 'Número de tarjeta inválido')

export const expiryDateSchema = z
  .string()
  .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato MM/YY requerido')
  .refine((val) => {
    const parts = val.split('/')
    const month = parseInt(parts[0]!, 10)
    const year = parseInt(parts[1]!, 10)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false
    }
    return true
  }, 'Fecha de expiración inválida')

export const cvvSchema = z
  .string()
  .min(3, 'CVV debe tener al menos 3 dígitos')
  .max(4, 'CVV no puede tener más de 4 dígitos')
  .regex(/^\d+$/, 'Solo números permitidos')

export const cardholderNameSchema = z
  .string()
  .min(2, 'Nombre del titular requerido')
  .max(50, 'Nombre demasiado largo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios permitidos')

// Payment method schemas
export const creditCardSchema = z.object({
  type: z.literal('credit_card'),
  cardNumber: cardNumberSchema,
  expiryDate: expiryDateSchema,
  cvv: cvvSchema,
  cardholderName: cardholderNameSchema,
  saveCard: z.boolean().optional(),
})

export const paypalSchema = z.object({
  type: z.literal('paypal'),
  email: z.string().email('Email de PayPal requerido'),
})

export const bankTransferSchema = z.object({
  type: z.literal('bank_transfer'),
  accountNumber: z
    .string()
    .min(10, 'Número de cuenta inválido')
    .max(20, 'Número de cuenta inválido')
    .regex(/^\d+$/, 'Solo números permitidos'),
  bankName: z.string().min(2, 'Nombre del banco requerido'),
  accountHolder: z.string().min(2, 'Nombre del titular requerido'),
})

export const paymentMethodSchema = z.discriminatedUnion('type', [
  creditCardSchema,
  paypalSchema,
  bankTransferSchema,
])

// Checkout schemas
export const billingAddressSchema = z.object({
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email válido requerido'),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido'),
  address: z.string().min(5, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Estado/Provincia requerido'),
  zipCode: z.string().min(3, 'Código postal requerido'),
  country: z.string().min(2, 'País requerido'),
})

export const checkoutSchema = z.object({
  paymentMethod: paymentMethodSchema,
  billingAddress: billingAddressSchema,
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
  newsletter: z.boolean().optional(),
  specialInstructions: z.string().max(500).optional(),
})

// FEL (Factura Electrónica) schemas
export const felSchema = z.object({
  nit: z
    .string()
    .regex(/^\d{4,14}$/, 'NIT debe tener entre 4 y 14 dígitos'),
  name: z.string().min(2, 'Nombre requerido para FEL'),
  address: z.string().min(5, 'Dirección requerida para FEL'),
  email: z.string().email('Email válido requerido para FEL'),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido'),
})

// Payment processing schemas
export const paymentIntentSchema = z.object({
  amount: z.number().min(0.01, 'Monto mínimo Q0.01'),
  currency: z.literal('GTQ'),
  description: z.string().min(1, 'Descripción requerida'),
  metadata: z.record(z.string()).optional(),
})

export const refundSchema = z.object({
  paymentId: z.string().min(1, 'ID de pago requerido'),
  amount: z.number().min(0.01, 'Monto de reembolso requerido'),
  reason: z.enum(['customer_request', 'duplicate', 'fraud', 'other']),
  description: z.string().max(500).optional(),
})

// Type exports
export type CreditCardFormData = z.infer<typeof creditCardSchema>
export type PayPalFormData = z.infer<typeof paypalSchema>
export type BankTransferFormData = z.infer<typeof bankTransferSchema>
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>
export type BillingAddressFormData = z.infer<typeof billingAddressSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type FELFormData = z.infer<typeof felSchema>
export type PaymentIntentData = z.infer<typeof paymentIntentSchema>
export type RefundFormData = z.infer<typeof refundSchema>