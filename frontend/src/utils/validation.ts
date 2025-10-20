import { sanitizeInput } from './security'

// Input sanitization for forms
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>]
    }
  }

  return sanitized
}