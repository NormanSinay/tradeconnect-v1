import { z } from 'zod'

// Base validation schemas
export const eventTitleSchema = z
  .string()
  .min(3, 'El título debe tener al menos 3 caracteres')
  .max(100, 'El título no puede tener más de 100 caracteres')

export const eventDescriptionSchema = z
  .string()
  .min(10, 'La descripción debe tener al menos 10 caracteres')
  .max(2000, 'La descripción no puede tener más de 2000 caracteres')

export const locationSchema = z
  .string()
  .min(3, 'La ubicación debe tener al menos 3 caracteres')
  .max(200, 'La ubicación no puede tener más de 200 caracteres')

export const capacitySchema = z
  .number()
  .min(1, 'La capacidad debe ser al menos 1')
  .max(10000, 'La capacidad no puede ser mayor a 10,000')

export const priceSchema = z
  .number()
  .min(0, 'El precio no puede ser negativo')
  .max(10000, 'El precio no puede ser mayor a Q10,000')

export const categorySchema = z.enum(
  ['conference', 'workshop', 'seminar', 'networking', 'training', 'other'],
  {
    errorMap: () => ({ message: 'Selecciona una categoría válida' }),
  }
)

// Date validation helpers
const futureDate = (date: Date) => date > new Date()

export const eventDateSchema = z
  .date({
    errorMap: () => ({ message: 'Ingresa una fecha válida' }),
  })
  .refine(futureDate, {
    message: 'La fecha debe ser en el futuro',
  })

// Event form schemas
export const createEventSchema = z
  .object({
    title: eventTitleSchema,
    description: eventDescriptionSchema,
    startDate: eventDateSchema,
    endDate: z.date({
      errorMap: () => ({ message: 'Ingresa una fecha de fin válida' }),
    }),
    location: locationSchema,
    capacity: capacitySchema,
    price: priceSchema,
    category: categorySchema,
    imageUrl: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).max(10, 'Máximo 10 etiquetas').optional(),
    isVirtual: z.boolean().optional(),
    meetingLink: z.string().url().optional(),
    requirements: z.string().max(500).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.isVirtual && data.meetingLink) {
        return true
      }
      if (!data.isVirtual) {
        return true
      }
      return false
    },
    {
      message: 'Los eventos virtuales requieren un enlace de reunión',
      path: ['meetingLink'],
    }
  )

export const updateEventSchema = z
  .object({
    title: eventTitleSchema.optional(),
    description: eventDescriptionSchema.optional(),
    startDate: eventDateSchema.optional(),
    endDate: z.date().optional(),
    location: locationSchema.optional(),
    capacity: capacitySchema.optional(),
    price: priceSchema.optional(),
    category: categorySchema.optional(),
    imageUrl: z.string().url().optional().or(z.literal('')).optional(),
    tags: z.array(z.string()).max(10).optional(),
    isVirtual: z.boolean().optional(),
    meetingLink: z.string().url().optional(),
    requirements: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate
      }
      return true
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path: ['endDate'],
    }
  )

// Event filter schemas
export const eventFiltersSchema = z.object({
  search: z.string().optional(),
  category: categorySchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  location: z.string().optional(),
  isVirtual: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  organizerId: z.string().optional(),
})

// Event registration schemas
export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, 'ID del evento requerido'),
  quantity: z.number().min(1, 'Debe registrar al menos 1 persona').max(10, 'Máximo 10 registros'),
  specialRequests: z.string().max(500).optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
})

// Event search schemas
export const eventSearchSchema = z.object({
  query: z.string().min(1, 'Ingresa un término de búsqueda'),
  filters: eventFiltersSchema.optional(),
})

// Type exports
export type CreateEventFormData = z.infer<typeof createEventSchema>
export type UpdateEventFormData = z.infer<typeof updateEventSchema>
export type EventFiltersFormData = z.infer<typeof eventFiltersSchema>
export type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>
export type EventSearchFormData = z.infer<typeof eventSearchSchema>