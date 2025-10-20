// Export all schemas for easy importing
export * from './auth.schemas'
export * from './event.schemas'
export * from './payment.schemas'

// Export user schemas individually to avoid conflicts with auth schemas
export {
  updateProfileSchema,
  userPreferencesSchema,
  userSearchSchema,
  userFiltersSchema,
  createUserSchema,
  updateUserSchema,
} from './user.schemas'

// Re-export commonly used types with proper namespacing
export type {
  LoginFormData,
  RegisterFormData,
} from './auth.schemas'

export type {
  CreateEventFormData,
  UpdateEventFormData,
  EventFiltersFormData,
  EventRegistrationFormData,
} from './event.schemas'

export type {
  CreditCardFormData,
  PaymentMethodFormData,
  CheckoutFormData,
  FELFormData,
} from './payment.schemas'

export type {
  UpdateProfileFormData,
  UserPreferencesFormData,
  UserSearchFormData,
  UserFiltersFormData,
  CreateUserFormData,
  UpdateUserFormData,
} from './user.schemas'