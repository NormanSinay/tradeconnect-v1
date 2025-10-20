import { z } from 'zod'

// Base validation schemas
export const userNameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(50, 'El nombre no puede tener más de 50 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras y espacios')

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido')
  .optional()

export const bioSchema = z
  .string()
  .max(500, 'La biografía no puede tener más de 500 caracteres')
  .optional()

export const websiteSchema = z
  .string()
  .url('URL inválida')
  .optional()
  .or(z.literal(''))

// User profile schemas
export const updateProfileSchema = z.object({
  name: userNameSchema,
  email: z.string().email('Email válido requerido').optional(),
  phone: phoneSchema,
  bio: bioSchema,
  website: websiteSchema,
  avatar: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().regex(/^@?[a-zA-Z0-9_]{1,15}$/, 'Usuario de Twitter inválido').optional().or(z.literal('')),
  timezone: z.string().optional(),
  language: z.enum(['es', 'en']).optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

// User preferences schemas
export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['es', 'en']).optional(),
  timezone: z.string().optional(),
  currency: z.literal('GTQ').optional(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
})

// User search and filter schemas
export const userSearchSchema = z.object({
  query: z.string().min(1, 'Ingresa un término de búsqueda'),
  role: z.enum(['admin', 'organizer', 'speaker', 'attendee']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  location: z.string().optional(),
  company: z.string().optional(),
})

export const userFiltersSchema = z.object({
  role: z.enum(['admin', 'organizer', 'speaker', 'attendee']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  lastLoginAfter: z.date().optional(),
  lastLoginBefore: z.date().optional(),
})

// Admin user management schemas
export const createUserSchema = z.object({
  name: userNameSchema,
  email: z.string().email('Email válido requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  role: z.enum(['admin', 'organizer', 'speaker', 'attendee']),
  phone: phoneSchema,
  sendWelcomeEmail: z.boolean().optional(),
})

export const updateUserSchema = z.object({
  name: userNameSchema.optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'organizer', 'speaker', 'attendee']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  phone: phoneSchema,
  bio: bioSchema,
  website: websiteSchema,
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
})

// Type exports
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>
export type UserSearchFormData = z.infer<typeof userSearchSchema>
export type UserFiltersFormData = z.infer<typeof userFiltersSchema>
export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>